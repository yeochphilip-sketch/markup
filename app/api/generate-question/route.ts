import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';
import { getGenerateSystemPrompt, getGenerateSystemPrompt70B } from '@/lib/prompts';
import { checkSupabaseRateLimit, GENERATE_QUESTION_LIMIT, rateLimitResponse } from '@/lib/rate-limit-supabase';

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

/**
 * Build the All Formats schema dynamically based on the requested source count.
 * Sources 1–count are required; any beyond count are optional.
 */
function createAllFormatsSchema(sourceCount: number) {
  const sourceFields: Record<string, z.ZodTypeAny> = {};
  for (let i = 1; i <= 5; i++) {
    const provenanceKey = `source${i}Provenance`;
    const contentKey = `source${i}`;
    if (i <= sourceCount) {
      sourceFields[provenanceKey] = z.string().min(8);
      sourceFields[contentKey] = z.string().min(60);
    } else {
      sourceFields[provenanceKey] = z.string().optional();
      sourceFields[contentKey] = z.string().optional();
    }
  }

  return z.object({
    ...sourceFields,
    backgroundContext: z.string().min(40),
    partA_Inference: z.string().min(3),
    partB_Comparison: z.string().min(3),
    partC_Purpose: z.string().min(3),
    partD_Reliability: z.string().min(3),
    partE_Assertion: z.string().min(3),
    questionPrompt: z.string().min(5).optional(),
    srqBackgroundContext: z.string().min(3).optional(),
    srqQuestionA: z.string().min(3).optional(),
    srqQuestionB: z.string().min(3).optional(),
    seqQuestion1: z.string().min(3).optional(),
    seqQuestion2: z.string().min(3).optional(),
    seqQuestion3: z.string().min(3).optional(),
    suggestedAnswer: z.string().min(10),
  });
}

/** Static interface for the All Formats parsed result — mirrors the schema shape */
interface AllFormatsData {
  backgroundContext: string;
  source1Provenance: string;
  source1: string;
  source2Provenance: string;
  source2: string;
  source3Provenance?: string;
  source3?: string;
  source4Provenance?: string;
  source4?: string;
  source5Provenance?: string;
  source5?: string;
  partA_Inference: string;
  partB_Comparison: string;
  partC_Purpose: string;
  partD_Reliability: string;
  partE_Assertion: string;
  questionPrompt?: string;
  srqBackgroundContext?: string;
  srqQuestionA?: string;
  srqQuestionB?: string;
  seqQuestion1?: string;
  seqQuestion2?: string;
  seqQuestion3?: string;
  suggestedAnswer: string;
}

type QuestionResult = z.infer<typeof questionSchema>;

/**
 * Try each model provider in sequence until one succeeds.
 * If system70B is provided, the first (70B) attempt uses that enriched prompt.
 */
async function tryGenerateWithFallbacks<T>(
  system: string,
  prompt: string,
  schema: z.ZodType<T>,
  jsonFields: string,
  system70B?: string,
): Promise<T> {
  const attempts = [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.4 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.4 },
  ];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    attempts.push({ model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.4 });
  }

  const jsonInstruction = `\n\nYou MUST respond with ONLY a valid JSON object using these exact keys:\n${jsonFields}\nNo markdown, no code fences, no other text. Just the JSON object.`;

  const errors: string[] = [];
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    const sys = (i === 0 && system70B) ? system70B : system;
    try {
      const result = await generateText({
        model: attempt.model,
        system: sys + jsonInstruction,
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

/**
 * Build JSON field spec for All Formats mode based on source count.
 */
function buildAllFormatsJsonFields(sourceCount: number): string {
  const lines: string[] = [];
  lines.push(`  "backgroundContext": "string (overall background context for the case study, at least 40 chars)",`);
  for (let i = 1; i <= 5; i++) {
    if (i <= sourceCount) {
      lines.push(`  "source${i}Provenance": "string (provenance of Source ${i}, at least 8 chars)",`);
      lines.push(`  "source${i}": "string (content of Source ${i}, at least 60 chars)",`);
    } else {
      lines.push(`  "source${i}Provenance": "string (optional — set to empty string if not needed)",`);
      lines.push(`  "source${i}": "string (optional — set to empty string if not needed)",`);
    }
  }
  lines.push(`  "partA_Inference": "string (Part (a) Inference question, at least 15 chars)",`);
  lines.push(`  "partB_Comparison": "string (Part (b) Comparison question, at least 15 chars)",`);
  lines.push(`  "partC_Purpose": "string (Part (c) Purpose question, at least 15 chars)",`);
  lines.push(`  "partD_Reliability": "string (Part (d) Reliability question, at least 15 chars)",`);
  lines.push(`  "partE_Assertion": "string (Part (e) Assertion question, at least 15 chars)",`);
  lines.push(`  "questionPrompt": "string (optional overall question prompt header)",`);
  lines.push(`  "srqBackgroundContext": "string (FOR SOCIAL STUDIES ONLY: SRQ background context. Set to empty if not SS.)",`);
  lines.push(`  "srqQuestionA": "string (FOR SS ONLY: SRQ 7-mark question. Set to empty if not SS.)",`);
  lines.push(`  "srqQuestionB": "string (FOR SS ONLY: SRQ 8-mark question. Set to empty if not SS.)",`);
  lines.push(`  "seqQuestion1": "string (FOR HISTORY ONLY: SEQ essay question 1. Set to empty if not History.)",`);
  lines.push(`  "seqQuestion2": "string (FOR HISTORY ONLY: SEQ essay question 2. Set to empty if not History.)",`);
  lines.push(`  "seqQuestion3": "string (FOR HISTORY ONLY: SEQ essay question 3. Set to empty if not History.)",`);
  lines.push(`  "suggestedAnswer": "string (A1-grade comprehensive model answer covering ALL parts, at least 30 chars)"`);
  return `{\n${lines.join('\n')}\n}`;
}

/**
 * Post-generation quality validation.
 * Returns a list of issues found (empty = passed).
 */
function validateGeneration(
  result: Record<string, any>,
  resolvedSourceCount: number,
  isAllFormats: boolean,
): string[] {
  const issues: string[] = [];

  // 1. Check background context
  if (!result.backgroundContext || result.backgroundContext.length < 40) {
    issues.push('backgroundContext is too short or missing (< 40 chars)');
  }

  // 2. Check sources have minimum content length
  const sourceKeys = ['sourceA', 'sourceB', 'sourceC', 'sourceD', 'sourceE'];
  for (let i = 0; i < resolvedSourceCount && i < sourceKeys.length; i++) {
    const key = sourceKeys[i];
    const content = result[key];
    if (!content || content.length < 120) {
      issues.push(`${key} is too short or missing (< 120 chars)`);
    }
  }

  // 3. Check suggestedAnswer exists
  if (!result.suggestedAnswer || result.suggestedAnswer.length < 30) {
    issues.push('suggestedAnswer is too short or missing (< 30 chars)');
  }

  // 4. For All Formats, check LORMS labels are present in suggestedAnswer
  if (isAllFormats && result.suggestedAnswer && result.suggestedAnswer.length > 30) {
    const hasLORMS = /L[1-6]\s/.test(result.suggestedAnswer);
    if (!hasLORMS) {
      issues.push('suggestedAnswer missing LORMS level labels (e.g., "L4", "L3")');
    }
    const hasPoint = /Point:/i.test(result.suggestedAnswer);
    if (!hasPoint) {
      issues.push('suggestedAnswer missing "Point:" PEEL marker');
    }
  }

  // 5. Check part questions are non-empty
  if (isAllFormats) {
    const parts = ['partA_Inference', 'partB_Comparison', 'partC_Purpose', 'partD_Reliability', 'partE_Assertion'];
    for (const part of parts) {
      if (!result[part] || result[part].length < 3) {
        issues.push(`${part} is missing or too short`);
      }
    }
  }

  return issues;
}

/**
 * Normalise All Formats response to include backward-compatible fields.
 * Only exposes sources up to the requested sourceCount.
 */
function normaliseAllFormatsResponse(data: AllFormatsData, sourceCount: number) {
  const result: Record<string, any> = {
    // Source A/B are always available (first 2)
    sourceAProvenance: data.source1Provenance,
    sourceA: data.source1,
    sourceBProvenance: data.source2Provenance,
    sourceB: data.source2,
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
    sourceCount,
  };

  // Add sources 3+ only if within the requested count
  if (sourceCount >= 3) {
    result.sourceCProvenance = data.source3Provenance || '';
    result.sourceC = data.source3 || '';
  }
  if (sourceCount >= 4) {
    result.sourceDProvenance = data.source4Provenance || '';
    result.sourceD = data.source4 || '';
  }
  if (sourceCount >= 5) {
    result.sourceEProvenance = data.source5Provenance || '';
    result.sourceE = data.source5 || '';
  }

  return result;
}

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // ── Rate limit: 5 requests per 60s per IP ──
    const rl = await checkSupabaseRateLimit(request, GENERATE_QUESTION_LIMIT);
    if (rl && !rl.allowed) {
      return rateLimitResponse(rl.headers);
    }

    const body = await request.json();
    const { subject, topic, questionType, userId, sourceCount } = body as {
      subject: string;
      topic: string;
      questionType: string;
      userId?: string;
      sourceCount?: number;
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
    const resolvedSourceCount = isAllFormats
      ? Math.max(2, Math.min(5, sourceCount ?? 5))
      : 2; // Individual tracks always get 2 sources

    const systemPrompt = getGenerateSystemPrompt(resolvedSubject, resolvedTopic, resolvedQuestionType);
    const systemPrompt70B = getGenerateSystemPrompt70B(resolvedSubject, resolvedTopic, resolvedQuestionType);

    let result;

    if (isAllFormats) {
      const schema = createAllFormatsSchema(resolvedSourceCount);
      const jsonFields = buildAllFormatsJsonFields(resolvedSourceCount);

      const sourcePrompt = resolvedSourceCount < 5
        ? `Sources 1-${resolvedSourceCount} are REQUIRED; sources ${resolvedSourceCount + 1}-5 should be set to empty strings.`
        : 'All 5 sources are required.';

      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate one complete O-Level ${resolvedSubject} FULL EXAM PACKAGE on the topic "${resolvedTopic}".
Skill track: All Formats — generate ALL components (${resolvedSourceCount} sources, 5 SBQ questions part A-E, plus subject-specific SRQ/SEQ sections).
${sourcePrompt}
The sources must be designed to test a RANGE of skills (inference, comparison, purpose, reliability, assertion).`.trim(),
        schema,
        jsonFields,
        systemPrompt70B, // Enriched prompt for 70B model
      );
      result = normaliseAllFormatsResponse(raw as AllFormatsData, resolvedSourceCount);
    } else {
      result = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate one complete O-Level ${resolvedSubject} stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.
The sources must be designed specifically to test the ${resolvedQuestionType} skill.`.trim(),
        questionSchema,
        INDIVIDUAL_JSON_FIELDS,
        systemPrompt70B, // Enriched prompt for 70B model
      );
    }

    // Persist for sidebar history (store full data, including All Formats extras in metadata)
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const client = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
          : await getServerSupabase();

        // Build comprehensive metadata for All Formats
        const metadata: Record<string, any> = {
          sourceCount: resolvedSourceCount,
          isAllFormats: isAllFormats || undefined,
        };

        if (isAllFormats) {
          const allFormatsResult = result as Record<string, any>;
          if (allFormatsResult.sourceCProvenance) metadata.sourceCProvenance = allFormatsResult.sourceCProvenance;
          if (allFormatsResult.sourceC) metadata.sourceC = allFormatsResult.sourceC;
          if (allFormatsResult.sourceDProvenance) metadata.sourceDProvenance = allFormatsResult.sourceDProvenance;
          if (allFormatsResult.sourceD) metadata.sourceD = allFormatsResult.sourceD;
          if (allFormatsResult.sourceEProvenance) metadata.sourceEProvenance = allFormatsResult.sourceEProvenance;
          if (allFormatsResult.sourceE) metadata.sourceE = allFormatsResult.sourceE;
          if (allFormatsResult.partA_Inference) metadata.partA_Inference = allFormatsResult.partA_Inference;
          if (allFormatsResult.partB_Comparison) metadata.partB_Comparison = allFormatsResult.partB_Comparison;
          if (allFormatsResult.partC_Purpose) metadata.partC_Purpose = allFormatsResult.partC_Purpose;
          if (allFormatsResult.partD_Reliability) metadata.partD_Reliability = allFormatsResult.partD_Reliability;
          if (allFormatsResult.partE_Assertion) metadata.partE_Assertion = allFormatsResult.partE_Assertion;
          if (allFormatsResult.srqBackgroundContext) metadata.srqBackgroundContext = allFormatsResult.srqBackgroundContext;
          if (allFormatsResult.srqQuestionA) metadata.srqQuestionA = allFormatsResult.srqQuestionA;
          if (allFormatsResult.srqQuestionB) metadata.srqQuestionB = allFormatsResult.srqQuestionB;
          if (allFormatsResult.seqQuestion1) metadata.seqQuestion1 = allFormatsResult.seqQuestion1;
          if (allFormatsResult.seqQuestion2) metadata.seqQuestion2 = allFormatsResult.seqQuestion2;
          if (allFormatsResult.seqQuestion3) metadata.seqQuestion3 = allFormatsResult.seqQuestion3;
          if (allFormatsResult.sbcsPrompt) metadata.sbcsPrompt = allFormatsResult.sbcsPrompt;
          if (allFormatsResult.seqPrompt) metadata.seqPrompt = allFormatsResult.seqPrompt;
          if (allFormatsResult.srqPrompt) metadata.srqPrompt = allFormatsResult.srqPrompt;
        }

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
          metadata,
        } as never);
      } catch (dbErr) {
        console.warn('Non-fatal: failed to persist generated_questions row', dbErr);
      }
    }

    // ── Quality validation (post-generation check) ──
    const resultObj = result as Record<string, any>;
    const validationIssues = validateGeneration(resultObj, resolvedSourceCount, isAllFormats);

    if (validationIssues.length > 0) {
      console.warn('[generate] Quality validation failed:', validationIssues);

      // One retry with the 70B prompt for better quality
      console.log('[generate] Retrying generation once for quality...');
      try {
        const retrySystem = getGenerateSystemPrompt70B(resolvedSubject, resolvedTopic, resolvedQuestionType);
        if (isAllFormats) {
          const schema = createAllFormatsSchema(resolvedSourceCount);
          const jsonFields = buildAllFormatsJsonFields(resolvedSourceCount);
          const sourcePrompt = resolvedSourceCount < 5
            ? `Sources 1-${resolvedSourceCount} are REQUIRED; sources ${resolvedSourceCount + 1}-5 should be set to empty strings.`
            : 'All 5 sources are required.';

          const retryRaw = await tryGenerateWithFallbacks(
            systemPrompt,
            `Regenerate a complete O-Level ${resolvedSubject} FULL EXAM PACKAGE on the topic "${resolvedTopic}".
Previous attempt had issues: ${validationIssues.join('; ')}.
Ensure ALL sections are complete and LORMS labels are present.`.trim(),
            schema,
            jsonFields,
            retrySystem,
          );
          result = normaliseAllFormatsResponse(retryRaw as AllFormatsData, resolvedSourceCount);
        } else {
          // For individual tracks, just regenerate
          const retryResult = await tryGenerateWithFallbacks(
            systemPrompt,
            `Regenerate an O-Level ${resolvedSubject} stimulus package on the topic "${resolvedTopic}".
Previous attempt had issues: ${validationIssues.join('; ')}.
Skill track: ${resolvedQuestionType}.`.trim(),
            questionSchema,
            INDIVIDUAL_JSON_FIELDS,
            retrySystem,
          );
          result = retryResult;
        }
      } catch (retryErr) {
        console.warn('[generate] Retry also failed, serving original result:', retryErr);
        // Serve the original result even if retry fails
      }

      // Attach validation issues to response for debugging
      const finalResult = result as Record<string, any>;
      finalResult._validationIssues = validationIssues;
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
