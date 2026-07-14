import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getGradeSystemPrompt, getGradeUserPrompt } from '@/lib/prompts';

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
  confidence: z.number().min(0).max(1),
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

    // ── Fix: Only include non-empty sections ──
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

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured on server.' },
        { status: 500 },
      );
    }

    const resolvedSubject = subject ?? 'Social Studies';
    const resolvedTopic = topic ?? 'General';
    const resolvedQuestionType = questionType ?? 'All Formats';

    // ── Select the correct prompt for this skill track + subject ──
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

    // ── Gemini 2.5 Pro for grading precision; fall back to Flash if unavailable ──
    let evaluation: z.infer<typeof evaluationSchema>;
    try {
      const result = await generateObject({
        model: google('gemini-2.5-pro'),
        schema: evaluationSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
      });
      evaluation = result.object;
    } catch (proErr) {
      console.warn('Falling back to gemini-2.5-flash (pro unavailable):', proErr);
      const result = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: evaluationSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
      });
      evaluation = result.object;
    }

    // ── Persist the evaluation ──
    const supabaseAdmin = getSupabaseAdmin();
    if (userId && supabaseAdmin) {
      try {
        await supabaseAdmin.from('essay_evaluations').insert({
          user_id: userId,
          question_id: questionId ?? null,
          subject: resolvedSubject,
          topic: resolvedTopic,
          question_type: resolvedQuestionType,
          student_essay: [sbcsAnswer, seqAnswer, srqAnswer].filter(Boolean).join('\n\n'),
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
          confidence_score: evaluation.confidence,
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
