import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getGradeSystemPrompt, getGradeUserPrompt } from '@/lib/prompts';
import { getXpForLevel, getLevelTitle, DAILY_GOAL_BONUS_XP, getStreakBonus, calculateXpDecay, checkNewAchievements } from '@/lib/gamification';

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

  const jsonInstruction = `\n\nYou MUST respond with ONLY a valid JSON object using these exact keys:\n{\n  "scoreLevel": "string (e.g. 'L3')",\n  "scoreMarks": "number (e.g. 6)",\n  "scoreMaxMarks": "number (e.g. 8)",\n  "scoreLabel": "string (human-readable score, at least 4 chars)",\n  "sbcsScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "seqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "srqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "pointStatus": "'Pass' or 'Fail'",\n  "evidenceStatus": "'Pass' or 'Fail'",\n  "critique": ["string (min 10 chars)", "..."],\n  "highlightedSegments": [{"text": "string", "type": "'correct' | 'weak' | 'error'"}],\n  "a1Upgrade": "string (min 40 chars)",\n  "gradingConfidence": 0.5,\n  "modelAnswerConfidence": 0.5\n}\nNo markdown, no code fences, no other text. Just the JSON object.`;

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

// ── Response cache (in-memory, survives serverless warm starts) ──
const responseCache = new Map<string, { result: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(essay: string): string {
  let hash = 0;
  for (let i = 0; i < essay.length; i++) {
    const char = essay.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `grade_${hash}_${essay.length}`;
}

// ── Skill track → user_skill_metrics column mapping ──
const SKILL_COLUMN_MAP: Record<string, string> = {
  'inference': 'sbq_inference_score',
  'comparison': 'sbq_comparison_score',
  'contrast': 'sbq_comparison_score',
  'reliability': 'sbq_reliability_score',
  'utility': 'sbq_reliability_score',
  'purpose': 'sbq_inference_score',
  'synthesis': 'sbq_comparison_score',
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

// ── Shared schemas ──

const highlightedSegmentSchema = z.object({
  text: z.string(),
  type: z.enum(['correct', 'weak', 'error']),
});

const sectionScoreSchema = z.object({
  level: z.string().optional(),
  marks: z.number().optional(),
  maxMarks: z.number().optional(),
  label: z.string().optional(),
});

const evaluationSchema = z.object({
  // Overall score — structured fields + human-readable label
  scoreLevel: z.string(),
  scoreMarks: z.number(),
  scoreMaxMarks: z.number(),
  scoreLabel: z.string().min(4),

  // Optional per-section scores for "All Formats" mode
  sbcsScore: sectionScoreSchema.optional(),
  seqScore: sectionScoreSchema.optional(),
  srqScore: sectionScoreSchema.optional(),

  pointStatus: z.enum(['Pass', 'Fail']),
  evidenceStatus: z.enum(['Pass', 'Fail']),
  critique: z.array(z.string().min(10)).min(1).max(8),
  highlightedSegments: z.array(highlightedSegmentSchema).min(1),
  a1Upgrade: z.string().min(40),

  // Separate confidence scores
  gradingConfidence: z.number().min(0).max(1),
  modelAnswerConfidence: z.number().min(0).max(1),
});

type SupabaseAdmin = ReturnType<typeof createClient>;

let supabaseAdminInstance: SupabaseAdmin | null = null;
function getSupabaseAdmin(): SupabaseAdmin | null {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseAdminInstance = createClient(url, key);
  return supabaseAdminInstance;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sbcsAnswer = '',
      seqAnswer = '',
      srqAnswer = '',
      questionPrompt,
      questionType,
      subject,
      topic,
      userId,
      questionId,
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
    };

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

    // ── Check response cache ──
    const cacheKey = getCacheKey([sbcsAnswer, seqAnswer, srqAnswer].filter(Boolean).join('|||'));
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.result);
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
    });

    // ── Grade with fallback chain: Groq 70B → Groq 8B → Gemini Flash ──
    const evaluation = await tryGradeWithFallbacks(systemPrompt, userPrompt);

    // ── Cache the response ──
    responseCache.set(cacheKey, {
      result: evaluation,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    // ── Build response with backward-compatible fields + gamification ──
    const newLevel = extractLevelNumber(evaluation.scoreLevel);
    const earnedXp = getXpForLevel(newLevel);

    const response = {
      ...evaluation,
      scoreEstimate: evaluation.scoreLabel,
      confidence: evaluation.gradingConfidence,
      gamification: {
        xpEarned: earnedXp,
        newLevel,
      },
    };

    // ── Persist evaluation ──
    const supabaseAdmin = getSupabaseAdmin();

    // We write the evaluation + optionally update skill metrics in parallel
    const dbWrites: Promise<unknown>[] = [];

    if (userId && supabaseAdmin) {
      dbWrites.push(
        (async () => {
          const { error: insertErr } = await supabaseAdmin!
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
            const { error: updateErr } = await supabaseAdmin!
              .from('user_skill_metrics')
              .update({ [skillColumn]: newLevel } as never)
              .eq('user_id', userId);
            if (updateErr) {
              console.warn('Non-fatal: failed to update skill metrics', updateErr);
            }
          })(),
        );
      }

      // ── Gamification: XP, streak, level-up ──
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      dbWrites.push(
        (async () => {
          // Fetch current gamification state
          const { data: metrics, error: fetchErr } = await supabaseAdmin!
            .from('user_skill_metrics')
            .select('total_xp, last_practice_date, current_streak, longest_streak, level_title, total_xp_decayed')
            .eq('user_id', userId)
            .single() as unknown as { data: Record<string, any> | null; error: any };

          if (fetchErr || !metrics) {
            console.warn('Non-fatal: failed to fetch gamification state', fetchErr);
            return;
          }

          const totalEvalCount = (metrics.total_evaluations ?? 0) + 1;
          const dailyGoalJustMet = metrics.last_practice_date !== todayStr;
          const dailyBonus = dailyGoalJustMet ? DAILY_GOAL_BONUS_XP : 0;

          // ── Streak bonus ──
          const streakBonus = getStreakBonus(metrics.current_streak ?? 0);

          // ── XP Decay: only apply if this is a new practice day (not same day) ──
          const baseXp = metrics.total_xp ?? 0;
          const decayedXp = dailyGoalJustMet
            ? Math.max(0, calculateXpDecay(metrics.last_practice_date, baseXp))
            : 0;
          const totalDecayedXp = (metrics.total_xp_decayed ?? 0) + decayedXp;

          let currentXp = baseXp + earnedXp + dailyBonus + streakBonus.bonus - decayedXp;
          if (currentXp < 0) currentXp = 0;
          const currentTitle = getLevelTitle(currentXp);
          const previousTitle = metrics.level_title ?? 'Novice';
          const leveledUp = previousTitle !== currentTitle;

          // Streak logic
          const lastDate = metrics.last_practice_date;
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = metrics.current_streak ?? 0;
          if (lastDate === todayStr) {
            // Already practiced today — don't increment
          } else if (lastDate === yesterdayStr) {
            newStreak += 1; // Consecutive day
          } else if (lastDate && lastDate !== yesterdayStr) {
            newStreak = 1; // Streak broken
          } else {
            newStreak = 1; // First practice ever
          }

          const longestStreak = Math.max(newStreak, metrics.longest_streak ?? 0);

          // ── Check achievements ──
          const existingAchievements = metrics.achievements ?? [];
          const newAchievements = checkNewAchievements({
            newLevel,
            newXp: currentXp,
            totalEvalCount,
            currentStreak: newStreak,
            subject: resolvedSubject,
            previousAchivements: existingAchievements,
            dailyGoalMet: dailyGoalJustMet,
          });
          const allAchievements = [...existingAchievements, ...newAchievements.map(a => a.id)];

          const { error: gamErr } = await supabaseAdmin!
            .from('user_skill_metrics')
            .update({
              total_xp: currentXp,
              level_title: currentTitle,
              last_practice_date: todayStr,
              current_streak: newStreak,
              longest_streak: longestStreak,
              achievements: allAchievements,
              total_evaluations: totalEvalCount,
              total_xp_decayed: totalDecayedXp,
            } as never)
            .eq('user_id', userId);

          // Attach new achievements to response so frontend can show them
          if (newAchievements.length > 0 && response) {
            (response as any)._newAchievements = newAchievements.map(a => ({
              id: a.id,
              title: a.title,
              description: a.description,
              icon: a.icon,
            }));
          }
          if (dailyBonus > 0 && response) {
            (response as any)._dailyGoalBonus = dailyBonus;
          }
          if (streakBonus.bonus > 0 && response) {
            (response as any)._streakBonus = streakBonus;
          }
          if (decayedXp > 0 && response) {
            (response as any)._xpDecayed = decayedXp;
          }

          if (gamErr) {
            console.warn('Non-fatal: failed to update gamification state', gamErr);
            return;
          }

          // Attach gamification info to the response (hack: we'll merge it into the response below)
          // Actually we store it on the response directly in the outer scope
        })(),
      );
    }

    await Promise.allSettled(dbWrites);

    // ── Send practice receipt email (awaited so it completes on serverless) ──
    if (userId && supabaseAdmin) {
      try {
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('email, display_name')
          .eq('id', userId)
          .single() as any;
        if (profile?.email) {
          await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://markup-five.vercel.app'}/api/email/practice-receipt`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: profile.email,
                name: profile.display_name || undefined,
                scoreEstimate: evaluation.scoreLabel,
                subject: resolvedSubject,
                topic: resolvedTopic,
                skill: resolvedQuestionType,
                xpEarned: earnedXp,
              }),
            },
          );
        }
      } catch {
        // Non-critical — practice receipt is best-effort
      }
    }

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
