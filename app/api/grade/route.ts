import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';
import { getGradeSystemPrompt, getGradeUserPrompt } from '@/lib/prompts';
import { checkSupabaseRateLimit, GRADE_LIMIT, rateLimitResponse } from '@/lib/rate-limit-supabase';
import { getAuthUserId } from '@/lib/supabase-server';
import { getXpForLevel, DAILY_GOAL_BONUS_XP, getStreakBonus, calculateXpDecay, checkNewAchievements } from '@/lib/gamification';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Try each model provider in sequence until one succeeds.
 * Falls back through: Groq 70B → Groq 8B → Google Gemini Flash (if key configured).
 */
async function tryGradeWithFallbacks(
  system: string,
  prompt: string,
): Promise<z.infer<typeof evaluationSchema>> {
  const attempts = [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.2 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.2 },
  ];

  // Only add Google fallback if the user has configured a key
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    attempts.push({ model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.2 });
  }

  const jsonInstruction = `\n\nYou MUST respond with ONLY a valid JSON object using these exact keys:\n{\n  "scoreLevel": "string (e.g. 'L3')",\n  "scoreMarks": "number (e.g. 6)",\n  "scoreMaxMarks": "number (e.g. 8)",\n  "scoreLabel": "string (human-readable score, at least 4 chars)",\n  "sbcsScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "seqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "srqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "pointStatus": "'Pass' or 'Fail'",\n  "evidenceStatus": "'Pass' or 'Fail'",\n  "critique": ["string (min 10 chars)", "..."],\n  "highlightedSegments": [{"text": "string", "type": "'correct' | 'weak' | 'error'"}],\n  "a1Upgrade": "string (min 40 chars)",\n  "gradingConfidence": 0.5,\n  "modelAnswerConfidence": 0.5,\n  "schoolBenchmark": { \"topTierEstimate\": "string (e.g. 'L3')", \"midTierEstimate\": "string (e.g. 'L3')", \"standardEstimate\": "string (e.g. 'L4')", \"explanation\": "string (min 10 chars, explaining the estimates)" }\n}\nNo markdown, no code fences, no other text. Just the JSON object.`;

  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      const result = await generateText({
        model: attempt.model,
        system: system + jsonInstruction,
        prompt,
        temperature: attempt.temp,
      });
      const cleaned = result.text.replace(/```(?:json)?\s*|\s*```/g, '').trim();
      return evaluationSchema.parse(JSON.parse(cleaned));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[grade] ${attempt.label} failed:`, msg);
      errors.push(`${attempt.label}: ${msg}`);
    }
  }

  throw new Error(
    `All AI providers failed to grade.\n${errors.join('\n')}`,
  );
}

export const runtime = 'nodejs';
export const maxDuration = 90;

// ── Skill track → user_skill_metrics column mapping ──
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
  // Parse "L3" or "L4 / 5 marks" or "L2 / 2 marks" → 3, 4, 2
  const match = level.match(/L(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Post-grade quality validation — checks for common LLM grading failures.
 * Returns a list of issues (empty = passed quality check).
 */
function validateGrade(
  evalResult: z.infer<typeof evaluationSchema>,
  questionType: string,
  activeSections: string[],
): string[] {
  const issues: string[] = [];
  const isAllFormats = questionType.toLowerCase().includes('all formats') ||
                       questionType.toLowerCase().includes('bundle');

  // 1. Check that scoreLevel is a valid LORMS level (L0–L5)
  const levelMatch = evalResult.scoreLevel.match(/^L([0-5])$/);
  if (!levelMatch) {
    issues.push(`Invalid scoreLevel format: "${evalResult.scoreLevel}" (expected L0–L5)`);
  }

  // 2. Check that scoreMarks doesn't exceed scoreMaxMarks
  if (evalResult.scoreMarks > evalResult.scoreMaxMarks && evalResult.scoreMaxMarks > 0) {
    issues.push(`scoreMarks (${evalResult.scoreMarks}) exceeds scoreMaxMarks (${evalResult.scoreMaxMarks})`);
  }

  // 3. Check that scoreMaxMarks is not 0 for valid submissions
  if (evalResult.scoreMaxMarks === 0 && evalResult.scoreLevel !== 'L0') {
    issues.push('scoreMaxMarks is 0 but scoreLevel is not L0');
  }

  // 4. Check that critique has reasonable content
  if (evalResult.critique.length === 0) {
    issues.push('critique is empty');
  }
  for (const c of evalResult.critique) {
    if (c.length < 10) {
      issues.push('critique contains entries shorter than 10 chars');
      break;
    }
  }

  // 5. Check that a1Upgrade is not suspiciously short
  if (evalResult.a1Upgrade.length < 40) {
    issues.push(`a1Upgrade is too short (${evalResult.a1Upgrade.length} chars, min 40)`);
  }

  // 6. Check confidence scores are in valid range
  if (evalResult.gradingConfidence < 0 || evalResult.gradingConfidence > 1) {
    issues.push(`gradingConfidence out of range: ${evalResult.gradingConfidence}`);
  }
  if (evalResult.modelAnswerConfidence < 0 || evalResult.modelAnswerConfidence > 1) {
    issues.push(`modelAnswerConfidence out of range: ${evalResult.modelAnswerConfidence}`);
  }

  // 7. For All Formats: check that section scores are present for submitted sections
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

// ── Shared schemas ──

const highlightedSegmentSchema = z.object({
  text: z.string(),
  type: z.enum(['correct', 'weak', 'error']),
});

// Preprocess: strip null values from section score objects entirely
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
  // Overall score — structured fields + human-readable label
  scoreLevel: z.string(),
  scoreMarks: z.number(),
  scoreMaxMarks: z.number(),
  scoreLabel: z.string().min(4),

  // Optional per-section scores for "All Formats" mode
  sbcsScore: sectionScoreSchema,
  seqScore: sectionScoreSchema,
  srqScore: sectionScoreSchema,

  pointStatus: z.enum(['Pass', 'Fail']),
  evidenceStatus: z.enum(['Pass', 'Fail']),
  critique: z.array(z.string().min(10)).min(1).max(8),
  highlightedSegments: z.array(highlightedSegmentSchema).min(1),
  a1Upgrade: z.string().min(40),

  // Separate confidence scores
  gradingConfidence: z.number().min(0).max(1),
  modelAnswerConfidence: z.number().min(0).max(1),

  // School benchmarking (optional)
  schoolBenchmark: z.object({
    topTierEstimate: z.string(),
    midTierEstimate: z.string(),
    standardEstimate: z.string(),
    explanation: z.string().min(10),
  }).optional(),
});

/**
 * Resolve a Supabase client: prefer cookie-based session auth (user-level, respects RLS).
 * Falls back to service role key only if session auth is unavailable.
 * The service role bypasses RLS, so we prefer session auth for defense-in-depth.
 */
async function getClientForUser() {
  try {
    // Prefer session-based client — respects RLS policies
    return await getServerSupabase();
  } catch {
    // Fall back to service role key if session client can't be created
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      return createClient(url, key);
    }
    throw new Error('No Supabase client available');
  }
}

export async function POST(request: Request) {
  try {
    // ── Rate limit: 5 requests per 60s per IP ──
    const rl = await checkSupabaseRateLimit(request, GRADE_LIMIT);
    if (rl && !rl.allowed) {
      return rateLimitResponse(rl.headers);
    }

    // ── Auth check: verify userId matches the authenticated session ──
    const authUserId = await getAuthUserId();

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
      questionId,
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
      questionId?: string;
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

    // ── Resolve userId: body takes precedence if it matches session, else use session ──
    const userId = bodyUserId
      ? (bodyUserId === authUserId ? bodyUserId : null)
      : authUserId;
    // If userId was provided in body but doesn't match session, reject
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

    // ── Only include non-empty sections ──
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

    // ── Grade with fallback chain: Groq 70B → Groq 8B → Gemini Flash ──
    const evaluation = await tryGradeWithFallbacks(systemPrompt, userPrompt);

    // ── Post-grade quality validation ──
    const qualityIssues = validateGrade(evaluation, resolvedQuestionType, activeSections);
    if (qualityIssues.length > 0) {
      console.warn('[grade] Quality validation issues:', qualityIssues);
      // Attach to response for debugging, but still return the grade
      (evaluation as any)._gradeQualityIssues = qualityIssues;
    }

    // ── Build response with backward-compatible fields + gamification ──
    const newLevel = extractLevelNumber(evaluation.scoreLevel);
    const earnedXp = getXpForLevel(newLevel);

    const response = {
      ...evaluation,
      scoreEstimate: evaluation.scoreLabel,
      confidence: evaluation.gradingConfidence,
      schoolBenchmark: evaluation.schoolBenchmark,
      gamification: {
        xpEarned: earnedXp,
        newLevel,
      },
    };

    // ── Persist evaluation ──
    const supabase = userId ? await getClientForUser() : null;

    // We write the evaluation + optionally update skill metrics in parallel
    const dbWrites: Promise<unknown>[] = [];

    if (userId && supabase) {
      dbWrites.push(
        (async () => {
          const { error: insertErr } = await supabase
            .from('essay_evaluations')
            .insert({
              user_id: userId,
              question_id: questionId ?? null,
              subject: resolvedSubject,
              topic: resolvedTopic,
              question_type: resolvedQuestionType,
              student_essay: [sbcsAnswer, seqAnswer, srqAnswer].filter(Boolean).join('\n\n'),
              sbcs_answer: sbcsAnswer,
              seq_answer: seqAnswer,
              srq_answer: srqAnswer,
              score_estimate: evaluation.scoreLabel,
              point_status: evaluation.pointStatus,
              evidence_status: evaluation.evidenceStatus,
              critique: evaluation.critique,
              critique_bullets: evaluation.critique,
              highlighted_segments: evaluation.highlightedSegments,
              a1_upgrade: evaluation.a1Upgrade,
              confidence_score: evaluation.gradingConfidence,
            } as never);
          if (insertErr) console.warn('Non-fatal: failed to persist essay_evaluations row', insertErr);
        })(),
      );

      // ── Auto-update skill radar (tracks most recent assessed level) ──
      // Row guaranteed to exist by handle_new_user trigger + backfill migration.
      const skillColumn = getSkillColumn(resolvedQuestionType);
      if (skillColumn && newLevel > 0) {
        dbWrites.push(
          (async () => {
            const { error: updateErr } = await supabase
              .from('user_skill_metrics')
              .update({ [skillColumn]: newLevel } as never)
              .eq('user_id', userId);
            if (updateErr) {
              console.warn('Non-fatal: failed to update skill metrics', updateErr);
            }
          })(),
        );
      }

      // ── Gamification: XP, streak, level-up (ATOMIC via RPC) ──
      dbWrites.push(
        (async () => {
          // Compute bonuses first (these depend on old state before atomic update)
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];

          try {
            // Read state needed to compute bonuses and check achievements
            const { data: metrics } = await supabase
              .from('user_skill_metrics')
              .select('total_xp, total_evaluations, last_practice_date, current_streak, achievements')
              .eq('user_id', userId)
              .single() as unknown as { data: Record<string, any> | null; error: any };

            if (!metrics) return;

            const dailyGoalJustMet = metrics.last_practice_date !== todayStr;
            const dailyBonus = dailyGoalJustMet ? DAILY_GOAL_BONUS_XP : 0;
            const streakBonus = getStreakBonus(metrics.current_streak ?? 0);
            const decayedXp = dailyGoalJustMet
              ? Math.max(0, calculateXpDecay(metrics.last_practice_date, metrics.total_xp ?? 0))
              : 0;

            // Compute totalEvalCount before the RPC increments it atomically
            const newTotalEvalCount = (metrics.total_evaluations ?? 0) + 1;

            // Check achievements using current state (before atomic update)
            const existingAchievements = metrics.achievements ?? [];
            const { achievements: newAchievements, totalXpReward: achievementXp } = checkNewAchievements({
              newLevel,
              newXp: (metrics.total_xp ?? 0) + earnedXp + dailyBonus + streakBonus.bonus - decayedXp,
              totalEvalCount: newTotalEvalCount,
              currentStreak: metrics.current_streak ?? 0, // RPC will handle actual streak
              subject: resolvedSubject,
              previousAchivements: existingAchievements,
              dailyGoalMet: dailyGoalJustMet,
            });

            // Call atomic RPC — handles row-level locking internally
            const { data: updated, error: rpcErr } = await supabase
              .rpc('atomic_gamification_update', {
                p_user_id: userId,
                p_earned_xp: earnedXp,
                p_daily_bonus: dailyBonus,
                p_streak_bonus: streakBonus.bonus,
                p_achievement_xp: achievementXp,
                p_new_achievements: newAchievements.map(a => a.id),
                p_decay_xp: decayedXp,
                p_section_increment: 1,
                p_subject: resolvedSubject,
              });

            if (rpcErr) {
              console.warn('Non-fatal: atomic gamification RPC failed', rpcErr);
              return;
            }

            // Attach gamification details to response so frontend can show them
            if (updated && typeof updated === 'object') {
              const result = updated as Record<string, any>;
              if (newAchievements.length > 0) {
                (response as any)._newAchievements = newAchievements.map(a => ({
                  id: a.id,
                  title: a.title,
                  description: a.description,
                  icon: a.icon,
                  xpReward: a.xpReward,
                }));
              }
              if (achievementXp > 0) (response as any)._achievementXp = achievementXp;
              if (dailyBonus > 0) (response as any)._dailyGoalBonus = dailyBonus;
              if (streakBonus.bonus > 0) (response as any)._streakBonus = streakBonus;
              if (decayedXp > 0) (response as any)._xpDecayed = decayedXp;
            }
          } catch (gamErr) {
            console.warn('Non-fatal: gamification error', gamErr);
          }
        })(),
      );
    }

    await Promise.allSettled(dbWrites);

    // Practice receipt email disabled during beta

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown grading error';
    console.error('grade failed:', message);
    const userMessage = error instanceof Error
      ? `Grading failed: ${error.message}`
      : 'Grading ran into an issue. Please try again.';
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
