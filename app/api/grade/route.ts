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

/** Map LLM score to numeric 0-10 scale and error type detection */
function mapScoreAndError(
  scoreLevel: string,
  feedback: string,
  scoreMaxMarks: number
): { score: number; errorType: string | null; scoreLevel: string; scoreLabel: string } {
  const levelNum = parseInt(scoreLevel.replace('L', ''), 10) || 0;

  // Detect error types from feedback text
  const lowerFeedback = feedback.toLowerCase();
  let errorType: string | null = null;

  if (
    lowerFeedback.includes('repeated') ||
    lowerFeedback.includes('same point') ||
    lowerFeedback.includes('say the exact same')
  ) {
    errorType = 'REPEATED_POINT';
  }
  if (
    lowerFeedback.includes('no elaboration') ||
    lowerFeedback.includes('explain more') ||
    lowerFeedback.includes('need more detail') ||
    lowerFeedback.includes('one sentence only')
  ) {
    errorType = errorType === 'REPEATED_POINT' ? 'BOTH' : 'NO_ELABORATION';
  }

  // Map level to numeric score
  let score: number;
  let scoreLabel: string;

  switch (levelNum) {
    case 4: // L4
      score = 9 + (scoreMaxMarks > 8 ? 1 : 0); // Scale to 9-10 if max > 8
      scoreLabel = 'Excellent';
      break;
    case 3: // L3
      score = 6 + (scoreMaxMarks > 7 ? 1 : 0); // Scale to 6-7 if max > 7
      scoreLabel = 'Good';
      break;
    case 2: // L2
      score = 3 + (scoreMaxMarks > 5 ? 1 : 0); // Scale to 3-4 if max > 5
      scoreLabel = 'Limited';
      break;
    case 1: // L1
      score = 1 + (scoreMaxMarks > 3 ? 1 : 0);
      scoreLabel = 'Weak';
      break;
    case 5: // A1
      score = 10;
      scoreLabel = 'A1 Standard';
      break;
    default:
      score = 2;
      scoreLabel = 'Needs Improvement';
  }

  // Cap score at 10
  score = Math.min(score, 10);

  return { score, errorType, scoreLevel: `L${levelNum}`, scoreLabel };
}

/** Try each model provider in sequence until one succeeds. */
async function tryGradeWithFallbacks(
  request: Request,
  system: string,
  prompt: string,
): Promise<{ score: number; errorType: string | null; scoreLevel: string; scoreLabel: string; feedback: string; modelAnswerConfidence: number; gradingConfidence: number }> {
  const attempts = [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.2 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.2 },
  ];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    attempts.push({ model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.2 });
  }

  const errors: string[] = [];
  const userAgent = request?.headers.get('user-agent') ?? 'unknown';

  for (const attempt of attempts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const result = await generateText({
        model: attempt.model,
        system: system + '\n\nOutput JSON ONLY with these exact keys: {"score":number,"errorType":"REPEATED_POINT|NO_ELABORATION|null","feedback":"string (min 10 chars)","scoreLevel":"L0|L1|L2|L3|L4|A1","scoreLabel":"string (at least 4 chars)"}',
        prompt,
        temperature: attempt.temp,
        abortSignal: controller.signal,
      });

      const rawText = parseJsonWithRepair(result.text) as Record<string, unknown>;
      console.log('[grade] LLM raw output:', rawText);

      // Extract fields from the JSON
      const score = Number((rawText.score as number) || 0);
      const errorType = (rawText.errorType as string | null) || null;
      const feedback = String(rawText.feedback as string || '');
      const scoreLevel = String(rawText.scoreLevel as string || 'L0');
      const scoreLabel = String(rawText.scoreLabel as string || 'Unknown');
      const modelAnswerConfidence = Number((rawText.modelAnswerConfidence as number) || 0.5);
      const gradingConfidence = Number((rawText.gradingConfidence as number) || 0.5);

      if (isNaN(score) || !['REPEATED_POINT', 'NO_ELABORATION', null].includes(errorType)) {
        throw new Error(`Invalid score or errorType from LLM: score=${score}, errorType=${errorType}`);
      }

      return { score, errorType, scoreLevel, scoreLabel, feedback, modelAnswerConfidence, gradingConfidence };
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

  throw new Error(`All AI providers failed to grade.\\n${errors.join('\\n')}`);
}

function fallbackRetryThreshold(errors: string[], label: string, userAgent: string): never {
  errors.push(`${label}: <timeout — hard cap of 120s exceeded>`);
  throw new Error(`All AI providers failed to grade.\\n${errors.join('\\n')}`);
}

/** Post-grade quality validation */
function validateGrade(
  score: number,
  errorType: string | null,
  feedback: string,
): string[] {
  const issues: string[] = [];

  if (score < 0 || score > 10) {
    issues.push(`Score out of range: ${score}`);
  }
  if (!['REPEATED_POINT', 'NO_ELABORATION', null].includes(errorType)) {
    issues.push(`Invalid errorType: ${errorType}`);
  }
  if (feedback.length < 10) {
    issues.push(`Feedback too short: ${feedback.length} chars (min 10)`);
  }
  if (feedback.length > 200) {
    issues.push(`Feedback too long: ${feedback.length} chars (max 200)`);
  }

  return issues;
}

/** highlightedSegmentSchema removed for brevity - kept from original */

const evaluationSchema = z.object({
  scoreLevel: z.string(),
  scoreMarks: z.number(),
  scoreMaxMarks: z.number(),
  scoreLabel: z.string().min(4),

  sbcsScore: z.object({ level: z.string().optional(), marks: z.number().optional(), maxMarks: z.number().optional(), label: z.string().optional() }).optional(),
  seqScore: z.object({ level: z.string().optional(), marks: z.number().optional(), maxMarks: z.number().optional(), label: z.string().optional() }).optional(),
  srqScore: z.object({ level: z.string().optional(), marks: z.number().optional(), maxMarks: z.number().optional(), label: z.string().optional() }).optional(),

  pointStatus: z.enum(['Pass', 'Fail']),
  evidenceStatus: z.enum(['Pass', 'Fail']),
  critique: z.array(z.string().min(10)).min(1).max(8),
  highlightedSegments: z.any(),

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

/** Resolve a Supabase client */
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

/** Extract level number from scoreLevel */
function extractLevelNumber(level: string): number {
  const match = level.match(/L(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/** Fetch user metrics */
async function fetchUserMetrics(supabase: any, userId: string) {
  const query = (columns: string) =>
    supabase.from('user_skill_metrics').select(columns).eq('user_id', userId).single();

  let { data: metrics, error } = await query(
    'user_id, total_xp, current_streak, level_title, sbq_inference_score, sbq_comparison_score, sbq_reliability_score, sbq_utility_score, sbq_purpose_score, sbq_synthesis_score, seq_essay_score, seq_conclusion_score'
  );
  if (error) {
    ({ data: metrics, error } = await query('user_id, total_xp, current_streak, level_title'));
  }
  return { metrics, error };
}

/** Build metrics response */
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

export const runtime = 'nodejs';
export const maxDuration = 90;

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
        { status: 401 }
      );
    }
    if (bodyUserId && bodyUserId !== authUserId) {
      return NextResponse.json(
        { error: 'User ID mismatch. The provided userId does not match your session.' },
        { status: 403 }
      );
    }

    const activeSections: string[] = [];
    if (sbcsAnswer.trim()) activeSections.push('sbcs');
    if (seqAnswer.trim()) activeSections.push('seq');
    if (srqAnswer.trim()) activeSections.push('srq');

    if (activeSections.length === 0) {
      return NextResponse.json(
        { error: 'At least one of SBCS / SEQ / SRQ must be filled in.' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'AI grading unavailable — no API keys configured. Please contact the developer.' },
        { status: 500 }
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

    let { score, errorType, scoreLevel, scoreLabel, feedback, modelAnswerConfidence, gradingConfidence } = await tryGradeWithFallbacks(
      request,
      systemPrompt,
      userPrompt
    );

    // Fallback: if LLM didn't provide errorType, detect from feedback
    if (!errorType) {
      const lowerFeedback = feedback.toLowerCase();
      if (
        lowerFeedback.includes('repeated') ||
        lowerFeedback.includes('same point')
      ) {
        errorType = 'REPEATED_POINT';
      }
      if (
        lowerFeedback.includes('no elaboration') ||
        lowerFeedback.includes('explain more')
      ) {
        errorType = errorType === 'REPEATED_POINT' ? 'BOTH' : 'NO_ELABORATION';
      }
    }

    const validationIssues = validateGrade(score, errorType, feedback);

    const supabase = await getClientForUser();
    const { metrics, error: metricsErr } = authUserId
      ? await fetchUserMetrics(supabase, authUserId)
      : { metrics: null, error: null };
    const prevLevel = metrics?.level_title ?? 'Novice';

    const newLevel = extractLevelNumber(scoreLevel);

    if (authUserId && !metricsErr && (prevLevel !== newLevel || validationIssues.length > 0)) {
      const updateData: Record<string, any> = {
        level_title: newLevel > 0 ? `L${newLevel}` : prevLevel,
        updated_at: new Date().toISOString(),
        score,
        errorType,
        feedback,
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

    const response = {
      score,
      errorType,
      feedback,
      scoreLevel,
      scoreLabel,
      _gradeQualityIssues: validationIssues,
      assessment_written: prevLevel !== newLevel,
    } as {
      score: number;
      errorType: string | null;
      feedback: string;
      scoreLevel: string;
      scoreLabel: string;
      _gradeQualityIssues: string[];
      assessment_written: boolean;
    };

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
