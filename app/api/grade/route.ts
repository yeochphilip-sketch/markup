import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase, getAuthUserId, resolveUserId, getServiceRoleClient } from '@/lib/supabase';
import { getGradeSystemPrompt, getGradeUserPrompt } from '@/lib/prompts';
import { parseJsonWithRepair } from '@/lib/json-repair';
import { AiCapacityError, isAiCapacityError, aiCapacityResponse, estimateRetryAfterSeconds, AI_CAPACITY_MESSAGE } from '@/lib/ai-capacity';
import { checkSupabaseRateLimit, GRADE_LIMIT, rateLimitResponse } from '@/lib/rate-limit-supabase';
import { getXpForLevel, DAILY_GOAL_BONUS_XP, getStreakBonus, calculateXpDecay, checkNewAchievements } from '@/lib/gamification';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

/** Try each model provider in sequence until one succeeds.
 *  True multi-provider fallback: tries every provider on any failure.
 *  Hard timeout per attempt: 120s via AbortController. */
async function tryGradeWithFallbacks(
  request: Request,
  system: string,
  prompt: string,
): Promise<z.infer<typeof evaluationSchema>> {
  const attempts = [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.2 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.2 },
  ];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    attempts.push({ model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.2 });
  }

  const jsonInstruction = `\n\nYou MUST respond with ONLY a valid JSON object using these exact keys:\n{\n  "scoreLevel": "string (e.g. 'L3')",\n  "scoreMarks": "number (e.g. 6)",\n  "scoreMaxMarks": "number (e.g. 8)",\n  "scoreLabel": "string (human-readable score, at least 4 chars)",\n  "sbcsScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "seqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "srqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "pointStatus": "'Pass' or 'Fail'",\n  "evidenceStatus": "'Pass' or 'Fail'",\n  "critique": ["string (min 10 chars)", "..."],\n  "highlightedSegments": [{"text": "string", "type": "'correct' | 'weak' | 'error'"}],\n  "a1Upgrade": "string (min 40 chars)",\n  "gradingConfidence": 0.5,\n  "modelAnswerConfidence": 0.5,\n  "schoolBenchmark": { "topTierEstimate": "string", "midTierEstimate": "string", "standardEstimate": "string", "explanation": "string (min 10 chars)" }\n}\nNo markdown, no code fences, no other text. Just the JSON object.`;

  const errors: string[] = [];
  const userAgent = request?.headers.get('user-agent') ?? 'unknown';

  for (const attempt of attempts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const result = await generateText({
        model: attempt.model,
        system: system + jsonInstruction,
        prompt,
        temperature: attempt.temp,
        abortSignal: controller.signal,
      });
      return evaluationSchema.parse(parseJsonWithRepair(result.text));
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : String(err);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      console.warn(`[grade] ${attempt.label} failed:`, msg, isAbort ? '(timeout)' : '');
      errors.push(`${attempt.label}: ${msg}`);

      if (isAbort && attempt !== attempts[attempts.length - 1]) continue;
      if (isAbort) {
        return fallbackRetryThreshold(errors, attempt.label, userAgent);
      }
    }
  }

  if (errors.some((msg) => isAiCapacityError(msg))) {
    throw new AiCapacityError(AI_CAPACITY_MESSAGE, estimateRetryAfterSeconds(errors));
  }

  throw new Error(`All AI providers failed to grade.\n${errors.join('\n')}`);
}

function fallbackRetryThreshold(errors: string[], label: string, userAgent: string): never {
  errors.push(`${label}: <timeout — hard cap of 120s exceeded>`);
  throw new Error(`All AI providers failed to grade.\n${errors.join('\n')}`);
}

/** Post-grade quality validation — checks for common LLM grading failures. */
function validateGrade(
  evalResult: z.infer<typeof evaluationSchema>,
  questionType: string,
  activeSections: string[],
): string[] {
  const issues: string[] = [];
  const isAllFormats = questionType.toLowerCase().includes('all formats') ||
                       questionType.toLowerCase().includes('bundle');

  if (!/^L([0-5])$/.test(evalResult.scoreLevel)) {
    issues.push(`Invalid scoreLevel format: "${evalResult.scoreLevel}" (expected L0–L5)`);
  }
  if (evalResult.scoreMarks > evalResult.scoreMaxMarks && evalResult.scoreMaxMarks > 0) {
    issues.push(`scoreMarks (${evalResult.scoreMarks}) exceeds scoreMaxMarks (${evalResult.scoreMaxMarks})`);
  }
  if (evalResult.scoreMaxMarks === 0 && evalResult.scoreLevel !== 'L0') {
    issues.push('scoreMaxMarks is 0 but scoreLevel is not L0');
  }
  if (evalResult.critique.length === 0) {
    issues.push('critique is empty');
  }
  for (const c of evalResult.critique) {
    if (c.length < 10) {
      issues.push('critique contains entries shorter than 10 chars');
      break;
    }
  }
  if (evalResult.a1Upgrade.length < 40) {
    issues.push(`a1Upgrade is too short (${evalResult.a1Upgrade.length} chars, min 40)`);
  }
  if (evalResult.a1Upgrade.length >= 40 && !/L[1-6]\s/.test(evalResult.a1Upgrade)) {
    issues.push('a1Upgrade missing LORMS level labels (e.g., "L4", "L3")');
  }
  if (evalResult.a1Upgrade.length >= 40 && !/Point:/i.test(evalResult.a1Upgrade)) {
    issues.push('a1Upgrade missing "Point:" PEEL marker');
  }
  if (evalResult.a1Upgrade.length >= 100 && !/"[^"]{5,}"/.test(evalResult.a1Upgrade)) {
    issues.push('a1Upgrade missing direct quotes from sources');
  }
  if (evalResult.gradingConfidence < 0 || evalResult.gradingConfidence > 1) {
    issues.push(`gradingConfidence out of range: ${evalResult.gradingConfidence}`);
  }
  if (evalResult.modelAnswerConfidence < 0 || evalResult.modelAnswerConfidence > 1) {
    issues.push(`modelAnswerConfidence out of range: ${evalResult.modelAnswerConfidence}`);
  }
  if (isAllFormats) {
    if (activeSections.includes('sbcs') && !evalResult.sbcsScore) {
      issues.push('SBCS section submitted but sbcsScore is missing');
    }
    if (activeSections.includes('seq') && !evalResult.seqScore) {
      issues.push('SEQ section submitted but seqScore is missing');
    }
    if (activeSections.includes('srq') && !evalResult.srqScore) {
      issues.push('SRQ section submitted but srqScore is missing');
    }
  }
  return issues;
}

const highlightedSegmentSchema = z.object({
  text: z.string(),
  type: z.enum(['correct', 'weak', 'error']),
});

function cleanSectionScore(val: unknown): unknown {
  if (val === null || val === undefined) return undefined;
  if (typeof val !== 'object') return val;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (v !== null) cleaned[k] = v;
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

const sectionScoreSchema = z.preprocess(cleanSectionScore, z.object({
  level: z.string().optional(),
  marks: z.number().optional(),
  maxMarks: z.number().optional(),
  label: z.string().optional(),
}).optional());

const evaluationSchema = z.object({
  scoreLevel: z.string(),
  scoreMarks: z.number(),
  scoreMaxMarks: z.number(),
  scoreLabel: z.string().min(4),

  sbcsScore: sectionScoreSchema,
  seqScore: sectionScoreSchema,
  srqScore: sectionScoreSchema,

  pointStatus: z.enum(['Pass', 'Fail']),
  evidenceStatus: z.enum(['Pass', 'Fail']),
  critique: z.array(z.string().min(10)).min(1).max(8),
  highlightedSegments: z.array(highlightedSegmentSchema).min(1),
  a1Upgrade: z.string().min(40),

  gradingConfidence: z.number().min(0).max(1),
  modelAnswerConfidence: z.number().min(0).max(1),

  schoolBenchmark: z.object({
    topTierEstimate: z.string(),
    midTierEstimate: z.string(),
    standardEstimate: z.string(),
    explanation: z.string().min(10),
  }).optional(),
});

/** Resolve a Supabase client: prefer cookie-based session auth (user-level, respects RLS). */
async function getClientForUser() {
  try {
    return await getServerSupabase();
  } catch {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      return createClient(url, key);
    }
    throw new Error('No Supabase client available');
  }
}

export const runtime = 'nodejs';
export const maxDuration = 90;

/** Skill track → user_skill_metrics column mapping */
const SKILL_COLUMN_MAP: Record<string, string> = {
  'inference': 'sbq_inference_score',
  'comparison': 'sbq_comparison_score',
  'contrast': 'sbq_comparison_score',
  'reliability': 'sbq_reliability_score',
  'utility': 'sbq_utility_score',
  'purpose': 'sbq_purpose_score',
  'synthesis': 'sbq_synthesis_score',
  'seq': 'seq_essay_score',
  'essay': 'seq_essay_score',
  'srq': 'seq_conclusion_score',
};

function getSkillColumn(questionType: string): string | null {
  const type = questionType.toLowerCase();
  for (const [keyword, column] of Object.entries(SKILL_COLUMN_MAP)) {
    if (type.includes(keyword)) return column;
  }
  return null;
}

function extractLevelNumber(level: string): number {
  const match = level.match(/L(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

async function fetchUserMetrics(supabase: any, userId: string) {
  const query = (columns: string) =>
    supabase.from('user_skill_metrics').select(columns).eq('user_id', userId).single();

  let { data: metrics, error } = await query('user_id, total_xp, current_streak, level_title, sbq_inference_score, sbq_comparison_score, sbq_reliability_score, sbq_utility_score, sbq_purpose_score, sbq_synthesis_score, seq_essay_score, seq_conclusion_score');
  if (error) {
    ({ data: metrics, error } = await query('user_id, total_xp, current_streak, level_title'));
  }
  return { metrics, error };
}

function buildMetricsResponse(metrics: any | null) {
  if (!metrics) {
    return {
      user_id: '',
      total_xp: 0,
      current_streak: 0,
      level_title: 'Novice',
      last_practice_date: null,
      sbq_inference_score: 0,
      sbq_comparison_score: 0,
      sbq_reliability_score: 0,
      sbq_utility_score: 0,
      sbq_purpose_score: 0,
      sbq_synthesis_score: 0,
      seq_essay_score: 0,
      seq_conclusion_score: 0,
      evaluations: 0,
      email_reminders_enabled: true,
      practice_receipt_enabled: true,
    };
  }
  return {
    user_id: metrics.user_id,
    total_xp: metrics.total_xp ?? 0,
    current_streak: metrics.current_streak ?? 0,
    level_title: metrics.level_title ?? 'Novice',
    last_practice_date: metrics.last_practice_date ?? null,
    sbq_inference_score: metrics.sbq_inference_score ?? 0,
    sbq_comparison_score: metrics.sbq_comparison_score ?? 0,
    sbq_reliability_score: metrics.sbq_reliability_score ?? 0,
    sbq_utility_score: metrics.sbq_utility_score ?? 0,
    sbq_purpose_score: metrics.sbq_purpose_score ?? 0,
    sbq_synthesis_score: metrics.sbq_synthesis_score ?? 0,
    seq_essay_score: metrics.seq_essay_score ?? 0,
    seq_conclusion_score: metrics.seq_conclusion_score ?? 0,
    evaluations: metrics.total_evaluations ?? 0,
    email_reminders_enabled: metrics.email_reminders_enabled ?? true,
    practice_receipt_enabled: metrics.practice_receipt_enabled ?? true,
  };
}

export async function POST(request: Request) {
  try {
    const rl = await checkSupabaseRateLimit(request, GRADE_LIMIT);
    if (rl && !rl.allowed) {
      return rateLimitResponse(rl.headers);
    }

    const authUserId = await getAuthUserId(request);

    const body = await request.json();
    const {
      sbcsAnswer = '',
      seqAnswer = '',
      srqAnswer = '',
      questionPrompt,
      questionType,
      subject,
      topic,
      userId: bodyUserId,
      sourceAProvenance,
      sourceA,
      sourceBProvenance,
      sourceB,
      sourceCProvenance,
      sourceC,
      sourceDProvenance,
      sourceD,
      sourceEProvenance,
      sourceE,
    } = body as {
      sbcsAnswer?: string;
      seqAnswer?: string;
      srqAnswer?: string;
      questionPrompt?: string;
      questionType?: string;
      subject?: string;
      topic?: string;
      userId?: string;
      sourceAProvenance?: string;
      sourceA?: string;
      sourceBProvenance?: string;
      sourceB?: string;
      sourceCProvenance?: string;
      sourceC?: string;
      sourceDProvenance?: string;
      sourceD?: string;
      sourceEProvenance?: string;
      sourceE?: string;
    };

    if (bodyUserId && !authUserId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to submit graded answers.' },
        { status: 401 },
      );
    }
    if (bodyUserId && bodyUserId !== authUserId) {
      return NextResponse.json(
        { error: 'User ID mismatch. The provided userId does not match your session.' },
        { status: 403 },
      );
    }

    const activeSections: string[] = [];
    if (sbcsAnswer.trim()) activeSections.push('sbcs');
    if (seqAnswer.trim()) activeSections.push('seq');
    if (srqAnswer.trim()) activeSections.push('srq');

    if (activeSections.length === 0) {
      return NextResponse.json(
        { error: 'At least one of SBCS / SEQ / SRQ must be filled in.' },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'AI grading unavailable — no API keys configured. Please contact the developer.' },
        { status: 500 },
      );
    }

    const resolvedSubject = subject ?? 'Social Studies';
    const resolvedTopic = topic ?? 'General';
    const resolvedQuestionType = questionType ?? 'All Formats';

    const systemPrompt = getGradeSystemPrompt({
      questionType: resolvedQuestionType,
      subject: resolvedSubject,
      activeSections,
    });

    const userPrompt = getGradeUserPrompt({
      questionPrompt: questionPrompt ?? '(not provided)',
      subject: resolvedSubject,
      topic: resolvedTopic,
      questionType: resolvedQuestionType,
      sbcsAnswer,
      seqAnswer,
      srqAnswer,
      sourceAProvenance,
      sourceA,
      sourceBProvenance,
      sourceB,
      sourceCProvenance,
      sourceC,
      sourceDProvenance,
      sourceD,
      sourceEProvenance,
      sourceE,
    });

    let evaluation: z.infer<typeof evaluationSchema>;
    try {
      evaluation = await tryGradeWithFallbacks(request, systemPrompt, userPrompt);
    } catch (err) {
      if (err instanceof AiCapacityError) {
        return aiCapacityResponse(err.retryAfterSeconds);
      }
      throw err;
    }

    const validationIssues = validateGrade(evaluation, resolvedQuestionType, activeSections);
    const newLevel = extractLevelNumber(evaluation.scoreLevel);

    // Only write assessment + XP if the grade actually changed
    const supabase = await getClientForUser();
    const { metrics, error: metricsErr } = await fetchUserMetrics(supabase, authUserId);
    const prevLevel = metrics?.level_title ?? 'Novice';

    if (!metricsErr && (prevLevel !== newLevel || validationIssues.length > 0)) {
      const updateData: Record<string, any> = {
        level_title: newLevel > 0 ? `L${newLevel}` : prevLevel,
        updated_at: new Date().toISOString(),
        ...evaluation,
      };

      const updateError = await supabase
        .from('user_skill_metrics')
        .update(updateData)
        .eq('user_id', authUserId);

      if (updateError && metricsErr) {
        console.warn('Grade write failed (post-auth fallback to service-role):', updateError);
        const svc = getServiceRoleClient();
        if (svc) {
          const { error: svcErr } = await svc
            .from('user_skill_metrics')
            .update(updateData)
            .eq('user_id', authUserId);
          if (svcErr) {
            console.error('Grade write failed (service-role):', svcErr);
          }
        }
      } else if (updateError) {
        console.warn('Grade write failed:', updateError);
      }
    }

    const response = { ...evaluation, _gradeQualityIssues: validationIssues } as { [key: string]: unknown; assessment_written?: boolean };
    if (authUserId && prevLevel === newLevel) {
      response.assessment_written = false;
    } else {
      response.assessment_written = true;
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('grade failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getClientForUser();
    const authUserId = await getAuthUserId(request);
    const { data: metrics } = await supabase
      .from('user_skill_metrics')
      .select('total_xp, current_streak, level_title, updated_at')
      .eq('user_id', authUserId)
      .single() as any;

    return NextResponse.json({
      total_xp: metrics?.total_xp ?? 0,
      current_streak: metrics?.current_streak ?? 0,
      level_title: metrics?.level_title ?? 'Novice',
      updated_at: metrics?.updated_at ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('exam-goal failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
