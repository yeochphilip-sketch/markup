import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getGenerateSystemPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

    const resolvedSubject = subject ?? 'Social Studies';
    const resolvedTopic = topic ?? 'General';
    const resolvedQuestionType = questionType ?? 'All Formats';

    // Skill-track-aware system prompt — sources are designed to test the selected skill
    const systemPrompt = getGenerateSystemPrompt(resolvedSubject, resolvedTopic, resolvedQuestionType);

    let object: z.infer<typeof questionSchema>;
    try {
      const result = await generateObject({
        // Generation uses Flash (creative/cheap) — Pro not needed for source creation
        model: google('gemini-2.5-flash'),
        schema: questionSchema,
        system: systemPrompt,
        prompt: `
Generate one complete O-Level ${resolvedSubject} stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.

The sources must be designed specifically to test the ${resolvedQuestionType} skill.
        `.trim(),
        temperature: 0.4, // Lower temp for more consistent exam-standard materials
      });
      object = result.object;
    } catch (genErr) {
      console.warn('Primary generation failed, retrying with fallback:', genErr);
      const result = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: questionSchema,
        system: systemPrompt,
        prompt: `
Generate one complete O-Level ${resolvedSubject} stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.
        `.trim(),
        temperature: 0.6,
      });
      object = result.object;
    }

    // Persist for sidebar history
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        );
        await supabaseAdmin.from('generated_questions').insert({
          user_id: userId,
          subject: resolvedSubject,
          topic: resolvedTopic,
          question_type: resolvedQuestionType,
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

    return NextResponse.json(object);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    console.error('generate-question failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
