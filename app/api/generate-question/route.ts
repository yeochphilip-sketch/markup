import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

// The supabase-js client infers `never[]` for `.insert(...)` arguments when
// no typed Database is supplied. The schema lives in `supabase/schema.sql`; we
// cast `as never` so the insert compiles. Runtime safety is enforced by
// env-var presence + try/catch wrapping below.

// ──────────────────────────────────────────────────────────────────────────
//  Prompt builders (kept inline so the route is self-contained).
// ──────────────────────────────────────────────────────────────────────────
const buildQuestionSystemPrompt = (subject: string, topic: string, questionType: string) => `
You are a senior SEAB examiner authoring authentic Singapore GCE O-Level
${subject} examination stimulus material.

Topic: ${topic}
Target Skill Track: ${questionType}

Produce a complete exam stimulus package (background context, two distinct
provenance-stamped sources, and a unified question prompt) calibrated to the
SEAB LORMS rubric. The package must be varied, syllabus-faithful, and feel
like a real Singapore O-Level paper.

Strict rules:
- Use real-sounding provenance (date, author, publication).
- Sources must be substantively different so a student can compare them.
- Do not include any markdown formatting - plain text only.
- Match the register and tone of SEAB-produced materials (formal, neutral).
`;

const questionSchema = z.object({
  backgroundContext: z.string().min(40),
  sourceAProvenance: z.string().min(8),
  sourceA: z.string().min(60),
  sourceBProvenance: z.string().min(8),
  sourceB: z.string().min(60),
  questionPrompt: z.string().min(20),
  sbcsPrompt: z.string().min(10),
  seqPrompt: z.string().min(10),
  srqPrompt: z.string().min(10),
  suggestedAnswer: z.string().min(30),
});

// ──────────────────────────────────────────────────────────────────────────
//  POST /api/generate-question
// ──────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, topic, questionType, userId } = body as {
      subject: string;
      topic: string;
      questionType: string;
      userId?: string;
    };

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured on server.' },
        { status: 500 },
      );
    }

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: questionSchema,
      system: buildQuestionSystemPrompt(subject ?? 'Social Studies', topic ?? 'General', questionType ?? 'All Formats'),
      prompt: `
Generate one complete O-Level ${subject ?? 'Social Studies'} stimulus package on the topic "${topic ?? 'General Study'}".
Use the ${questionType ?? 'All Formats'} skill track as the primary focus.

If the requested skill track is SBQ-only, leave the SEQ and SRQ prompts as
"Optional: Section deactivated for focused skill strategy simulation." but
still author an authentic SBCS stimulus.
      `.trim(),
      temperature: 0.7,
    });

    // Persist for sidebar history. Failure here is non-fatal.
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        );
        await supabaseAdmin.from('generated_questions').insert({
          user_id: userId,
          subject: subject ?? 'Social Studies',
          topic: topic ?? 'General',
          question_type: questionType ?? 'All Formats',
          background_context: object.backgroundContext,
          source_a: object.sourceA,
          source_b: object.sourceB,
          question_prompt: object.questionPrompt,
          suggested_answer: object.suggestedAnswer,
        } as never);
      } catch (dbErr) {
        console.warn('Non-fatal: failed to persist generated_questions row', dbErr);
      }
    }

    // The Zod schema keys already match the dashboard's expected JSON shape,
    // so we can spread directly without any aliasing.
    return NextResponse.json(object);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    console.error('generate-question failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
