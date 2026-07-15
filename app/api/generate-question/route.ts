import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getGenerateSystemPrompt } from '@/lib/prompts';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Try each model provider in sequence until one succeeds.
 * Falls back through: Groq 70B → Groq 8B → Google Gemini Flash (if key configured).
 */
async function tryGenerateWithFallbacks(
  system: string,
  prompt: string,
): Promise<z.infer<typeof questionSchema>> {
  const attempts = [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.4 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.4 },
  ];

  // Only add Google fallback if the user has configured a key
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    attempts.push({ model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.4 });
  }

  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      const result = await generateObject({
        model: attempt.model,
        schema: questionSchema,
        system,
        prompt,
        temperature: attempt.temp,
      });
      return result.object;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[generate] ${attempt.label} failed:`, msg);
      errors.push(`${attempt.label}: ${msg}`);
    }
  }

  throw new Error(
    `All AI providers failed to generate a question.\n${errors.join('\n')}`,
  );
}

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

    if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'AI generation unavailable — no API keys configured. Please contact the developer.' },
        { status: 500 },
      );
    }

    const resolvedSubject = subject ?? 'Social Studies';
    const resolvedTopic = topic ?? 'General';
    const resolvedQuestionType = questionType ?? 'All Formats';

    // Skill-track-aware system prompt — sources are designed to test the selected skill
    const systemPrompt = getGenerateSystemPrompt(resolvedSubject, resolvedTopic, resolvedQuestionType);

    const object = await tryGenerateWithFallbacks(
      systemPrompt,
      `Generate one complete O-Level ${resolvedSubject} stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.

The sources must be designed specifically to test the ${resolvedQuestionType} skill.`.trim(),
    );

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
    const userMessage = error instanceof Error
      ? `Question generation failed: ${error.message}`
      : 'Question generation ran into an issue. Please try again.';
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
