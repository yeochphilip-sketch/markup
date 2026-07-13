import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { SS_EXAMINER_PROMPT } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 90;

const highlightedSegmentSchema = z.object({
  text: z.string(),
  type: z.enum(['correct', 'weak', 'error']),
});

const evaluationSchema = z.object({
  scoreEstimate: z.string().min(4),
  pointStatus: z.enum(['Pass', 'Fail']),
  evidenceStatus: z.enum(['Pass', 'Fail']),
  critique: z.array(z.string().min(10)).min(1).max(8),
  highlightedSegments: z.array(highlightedSegmentSchema).min(1),
  a1Upgrade: z.string().min(40),
});

// SupabaseClient<Database> typing is intentionally generic here so the route
// can write to schema-defined tables without importing the full Database
// type. The runtime safety is enforced by env-var presence + try/catch.
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

    const combinedEssay = `SBCS Answer:\n${sbcsAnswer}\n\nSEQ Answer:\n${seqAnswer}\n\nSRQ Answer:\n${srqAnswer}`.trim();

    if (!combinedEssay) {
      return NextResponse.json(
        { error: 'At least one of SBCS / SEQ / SRQ must be filled in.' },
        { status: 400 },
      );
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured on server.' },
        { status: 500 },
      );
    }

    const userPrompt = `
QUESTION PROMPT:
${questionPrompt ?? '(not provided)'}

SUBJECT: ${subject ?? 'Social Studies'}
TOPIC: ${topic ?? 'General'}
SKILL TRACK: ${questionType ?? 'SBCS Comparison'}

STUDENT ESSAY (all three sections concatenated):
"""
${combinedEssay}
"""

Apply the LORMS rubric strictly. Highlight which segments were correct,
which were weak, and which were structural errors. Produce a clean A1-grade
rewrite that the student can compare against their own work.
    `.trim();

    const { object: evaluation } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: evaluationSchema,
      system: SS_EXAMINER_PROMPT,
      prompt: userPrompt,
      temperature: 0.3,
    });

    // Persist the evaluation so the analytics + skill radar can improve.
    const supabaseAdmin = getSupabaseAdmin();
    if (userId && supabaseAdmin) {
      try {
        await supabaseAdmin.from('essay_evaluations').insert({
          user_id: userId,
          question_id: questionId ?? null,
          subject: subject ?? null,
          topic: topic ?? null,
          question_type: questionType ?? null,
          student_essay: combinedEssay,
          sbcs_answer: sbcsAnswer,
          seq_answer: seqAnswer,
          srq_answer: srqAnswer,
          score_estimate: evaluation.scoreEstimate,
          point_status: evaluation.pointStatus,
          evidence_status: evaluation.evidenceStatus,
          critique: evaluation.critique,
          critique_bullets: evaluation.critique,
          highlighted_segments: evaluation.highlightedSegments,
          a1_upgrade: evaluation.a1Upgrade,
        } as never);
      } catch (dbErr) {
        console.warn('Non-fatal: failed to persist essay_evaluations row', dbErr);
      }
    }

    return NextResponse.json(evaluation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown grading error';
    console.error('grade failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
