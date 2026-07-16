import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';
import { getGenerateSystemPrompt } from '@/lib/prompts';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// ────────────────────────────────────────────────────────
// Schema for individual skill tracks (2 sources)
// ────────────────────────────────────────────────────────
const questionSchema = z.object({
  backgroundContext: z.string().min(10),
  sourceAProvenance: z.string().min(3),
  sourceA: z.string().min(10),
  sourceBProvenance: z.string().min(3),
  sourceB: z.string().min(10),
  questionPrompt: z.string().min(5),
  sbcsPrompt: z.string().min(3),
  seqPrompt: z.string().min(3),
  srqPrompt: z.string().min(3),
  suggestedAnswer: z.string().min(10),
});

// ────────────────────────────────────────────────────────
// Schema for All Formats mode (5 sources + 5 parts + extras)
// ────────────────────────────────────────────────────────
const allFormatsSchema = z.object({
  // Overall background context
  backgroundContext: z.string().min(40),
  // 5 Sources with provenances (sources 1-2 required, 3-5 optional for resilience)
  source1Provenance: z.string().min(8),
  source1: z.string().min(60),
  source2Provenance: z.string().min(8),
  source2: z.string().min(60),
  source3Provenance: z.string().min(8).optional(),
  source3: z.string().min(60).optional(),
  source4Provenance: z.string().min(8).optional(),
  source4: z.string().min(60).optional(),
  source5Provenance: z.string().min(8).optional(),
  source5: z.string().min(60).optional(),
  // 5 Part A-E Questions — relaxed min lengths since AI may generate short valid questions
  partA_Inference: z.string().min(3),
  partB_Comparison: z.string().min(3),
  partC_Purpose: z.string().min(3),
  partD_Reliability: z.string().min(3),
  partE_Assertion: z.string().min(3),
  // Overall context
  questionPrompt: z.string().min(5).optional(),
  // SS-only: SRQ section (AI may leave these intentionally short when generating History papers)
  srqBackgroundContext: z.string().min(3).optional(),
  srqQuestionA: z.string().min(3).optional(),
  srqQuestionB: z.string().min(3).optional(),
  // History-only: SEQ section (AI may leave these intentionally short when generating SS papers)
  seqQuestion1: z.string().min(3).optional(),
  seqQuestion2: z.string().min(3).optional(),
  seqQuestion3: z.string().min(3).optional(),
  // Model answer
  suggestedAnswer: z.string().min(10),
});

type QuestionResult = z.infer<typeof questionSchema>;
type AllFormatsResult = z.infer<typeof allFormatsSchema>;

/**
 * Try each model provider in sequence until one succeeds.
 */
async function tryGenerateWithFallbacks<T>(
  system: string,
  prompt: string,
  schema: z.ZodType<T>,
  jsonFields: string,
): Promise<T> {
  const attempts = [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.4 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.4 },
  ];

  // Only add Google fallback if the user has configured a key
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    attempts.push({ model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.4 });
  }

  const jsonInstruction = `\n\nYou MUST respond with ONLY a valid JSON object using these exact keys:\n${jsonFields}\nNo markdown, no code fences, no other text. Just the JSON object.`;

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
      return schema.parse(JSON.parse(cleaned));
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

/** JSON field spec for individual skill tracks */
const INDIVIDUAL_JSON_FIELDS = `{
  "backgroundContext": "string (the background context paragraph, at least 40 chars)",
  "sourceAProvenance": "string (provenance of source A, at least 8 chars)",
  "sourceA": "string (content of source A, at least 60 chars)",
  "sourceBProvenance": "string (provenance of source B, at least 8 chars)",
  "sourceB": "string (content of source B, at least 60 chars)",
  "questionPrompt": "string (the unified question prompt, at least 20 chars)",
  "sbcsPrompt": "string (SBCS sub-prompt, at least 10 chars)",
  "seqPrompt": "string (SEQ sub-prompt, at least 10 chars)",
  "srqPrompt": "string (SRQ sub-prompt, at least 10 chars)",
  "suggestedAnswer": "string (A1-grade suggested answer, at least 30 chars)"
}`;

/** JSON field spec for All Formats mode */
const ALL_FORMATS_JSON_FIELDS = `{
  "backgroundContext": "string (overall background context for the case study, at least 40 chars)",
  "source1Provenance": "string (provenance of Source 1, at least 8 chars)",
  "source1": "string (content of Source 1, at least 60 chars)",
  "source2Provenance": "string (provenance of Source 2, at least 8 chars)",
  "source2": "string (content of Source 2, at least 60 chars)",
  "source3Provenance": "string (optional: provenance of Source 3, at least 8 chars)",
  "source3": "string (optional: content of Source 3, at least 60 chars)",
  "source4Provenance": "string (optional: provenance of Source 4, at least 8 chars)",
  "source4": "string (optional: content of Source 4, at least 60 chars)",
  "source5Provenance": "string (optional: provenance of Source 5, at least 8 chars)",
  "source5": "string (optional: content of Source 5, at least 60 chars)",
  "partA_Inference": "string (Part (a) Inference question, at least 15 chars)",
  "partB_Comparison": "string (Part (b) Comparison question, at least 15 chars)",
  "partC_Purpose": "string (Part (c) Purpose question, at least 15 chars)",
  "partD_Reliability": "string (Part (d) Reliability question, at least 15 chars)",
  "partE_Assertion": "string (Part (e) Assertion question, at least 15 chars)",
  "questionPrompt": "string (optional overall question prompt header)",
  "srqBackgroundContext": "string (FOR SOCIAL STUDIES ONLY: SRQ background context, at least 20 chars. Set to empty if not SS.)",
  "srqQuestionA": "string (FOR SS ONLY: SRQ 7-mark question, at least 15 chars. Set to empty if not SS.)",
  "srqQuestionB": "string (FOR SS ONLY: SRQ 8-mark question, at least 15 chars. Set to empty if not SS.)",
  "seqQuestion1": "string (FOR HISTORY ONLY: SEQ essay question 1, at least 15 chars. Set to empty if not History.)",
  "seqQuestion2": "string (FOR HISTORY ONLY: SEQ essay question 2, at least 15 chars. Set to empty if not History.)",
  "seqQuestion3": "string (FOR HISTORY ONLY: SEQ essay question 3, at least 15 chars. Set to empty if not History.)",
  "suggestedAnswer": "string (A1-grade comprehensive model answer covering ALL parts, at least 30 chars)"
}`;

/**
 * Normalise All Formats response to include backward-compatible fields
 * so the frontend can still use sourceA, sourceB, sbcsPrompt, etc.
 */
function normaliseAllFormatsResponse(data: AllFormatsResult) {
  return {
    // Expose all 5 sources with backward-compat aliases
    sourceAProvenance: data.source1Provenance,
    sourceA: data.source1,
    sourceBProvenance: data.source2Provenance,
    sourceB: data.source2,
    sourceCProvenance: data.source3Provenance || '',
    sourceC: data.source3 || '',
    sourceDProvenance: data.source4Provenance || '',
    sourceD: data.source4 || '',
    sourceEProvenance: data.source5Provenance || '',
    sourceE: data.source5 || '',
    // All 5 parts combined into a full SBCS prompt (backward compat)
    sbcsPrompt: `(a) ${data.partA_Inference}\n\n(b) ${data.partB_Comparison}\n\n(c) ${data.partC_Purpose}\n\n(d) ${data.partD_Reliability}\n\n(e) ${data.partE_Assertion}`,
    // Individual parts for fine-grained display
    partA_Inference: data.partA_Inference,
    partB_Comparison: data.partB_Comparison,
    partC_Purpose: data.partC_Purpose,
    partD_Reliability: data.partD_Reliability,
    partE_Assertion: data.partE_Assertion,
    // Subject-specific extras
    srqBackgroundContext: data.srqBackgroundContext || '',
    srqQuestionA: data.srqQuestionA || '',
    srqQuestionB: data.srqQuestionB || '',
    seqQuestion1: data.seqQuestion1 || '',
    seqQuestion2: data.seqQuestion2 || '',
    seqQuestion3: data.seqQuestion3 || '',
    // Core fields
    backgroundContext: data.backgroundContext || '',
    questionPrompt: data.questionPrompt || 'All Formats Comprehensive Examination Package',
    seqPrompt: data.seqQuestion1 || 'SEQ essay prompt not generated (this is a Social Studies paper)',
    srqPrompt: data.srqQuestionA || 'SRQ prompt not generated (this is a History paper)',
    suggestedAnswer: data.suggestedAnswer,
    // Flag for frontend
    isAllFormats: true,
  };
}

export const runtime = 'nodejs';
export const maxDuration = 60;

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
    const isAllFormats = resolvedQuestionType.toLowerCase().includes('all formats') || 
                         resolvedQuestionType.toLowerCase().includes('bundle');

    // Skill-track-aware system prompt
    const systemPrompt = getGenerateSystemPrompt(resolvedSubject, resolvedTopic, resolvedQuestionType);

    let result;

    if (isAllFormats) {
      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate one complete O-Level ${resolvedSubject} FULL EXAM PACKAGE on the topic "${resolvedTopic}".
Skill track: All Formats — generate ALL components (5 sources, 5 SBQ questions part A-E, plus subject-specific SRQ/SEQ sections).

The sources must be designed to test a RANGE of skills (inference, comparison, purpose, reliability, assertion).`.trim(),
        allFormatsSchema,
        ALL_FORMATS_JSON_FIELDS,
      );
      result = normaliseAllFormatsResponse(raw);
    } else {
      result = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate one complete O-Level ${resolvedSubject} stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.

The sources must be designed specifically to test the ${resolvedQuestionType} skill.`.trim(),
        questionSchema,
        INDIVIDUAL_JSON_FIELDS,
      );
    }

    // Persist for sidebar history — try service role key first, fall back to session auth
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const client = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
          : await getServerSupabase();
        await client.from('generated_questions').insert({
          user_id: userId,
          subject: resolvedSubject,
          topic: resolvedTopic,
          question_type: resolvedQuestionType,
          background_context: result.backgroundContext || '',
          source_a: result.sourceA || '',
          source_b: result.sourceB || '',
          question_prompt: result.questionPrompt || '',
          suggested_answer: result.suggestedAnswer || '',
        } as never);
      } catch (dbErr) {
        console.warn('Non-fatal: failed to persist generated_questions row', dbErr);
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    console.error('generate-question failed:', message);
    const userMessage = error instanceof Error
      ? `Question generation failed: ${error.message}`
      : 'Question generation ran into an issue. Please try again.';
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
