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
// Track type helpers
// ────────────────────────────────────────────────────────

type TrackType = 'all-formats' | 'sbcs' | 'seq' | 'srq';

function getTrackType(questionType: string): TrackType {
  const lower = questionType.toLowerCase();
  if (lower.includes('all formats') || lower.includes('bundle')) return 'all-formats';
  if (lower.startsWith('sbq:')) return 'sbcs';
  if (lower.startsWith('seq:')) return 'seq';
  if (lower.startsWith('srq:')) return 'srq';
  // Fallback: check for keywords
  if (lower.includes('seq') || lower.includes('essay')) return 'seq';
  if (lower.includes('srq') || lower.includes('structured response')) return 'srq';
  return 'sbcs'; // Default to SBCS for SBQ-like skills
}

function getSourceCountForTrack(trackType: TrackType, questionType: string): number {
  if (trackType === 'all-formats') return 5;
  if (trackType === 'sbcs') {
    // Assertion/synthesis → 5 sources, comparison → 2, others → 2
    const lower = questionType.toLowerCase();
    if (lower.includes('assertion') || lower.includes('synthesis')) return 5;
    return 2;
  }
  // SEQ / SRQ → no sources
  return 0;
}

// ────────────────────────────────────────────────────────
// Schema for SBCS-only tracks (with sources)
// ────────────────────────────────────────────────────────
const sbcsSchema = z.object({
  backgroundContext: z.string().min(10),
  sourceAProvenance: z.string().min(3),
  sourceA: z.string().min(10),
  sourceBProvenance: z.string().min(3),
  sourceB: z.string().min(10),
  sourceCProvenance: z.string().optional(),
  sourceC: z.string().optional(),
  sourceDProvenance: z.string().optional(),
  sourceD: z.string().optional(),
  sourceEProvenance: z.string().optional(),
  sourceE: z.string().optional(),
  questionPrompt: z.string().min(5),
  sbcsPrompt: z.string().min(3),
  suggestedAnswer: z.string().min(10),
});

// ────────────────────────────────────────────────────────
// Schema for SEQ-only track (no sources, just essay Qs)
// ────────────────────────────────────────────────────────
const seqSchema = z.object({
  backgroundContext: z.string().min(10),
  seqQuestion1: z.string().min(10),
  seqQuestion2: z.string().min(10),
  seqQuestion3: z.string().min(10),
  questionPrompt: z.string().min(5),
  suggestedAnswer: z.string().min(10),
});

// ────────────────────────────────────────────────────────
// Schema for SRQ-only track (no sources, just SRQ Qs)
// ────────────────────────────────────────────────────────
const srqSchema = z.object({
  backgroundContext: z.string().min(10),
  srqBackgroundContext: z.string().min(3),
  srqQuestionA: z.string().min(10),
  srqQuestionB: z.string().min(10),
  questionPrompt: z.string().min(5),
  suggestedAnswer: z.string().min(10),
});

// ────────────────────────────────────────────────────────
// Schema for All Formats (sources + 5 parts + SEQ/SRQ)
// ────────────────────────────────────────────────────────
function createAllFormatsSchema() {
  const sourceFields: Record<string, z.ZodTypeAny> = {};
  for (let i = 1; i <= 5; i++) {
    sourceFields[`source${i}Provenance`] = z.string().min(8);
    sourceFields[`source${i}`] = z.string().min(60);
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

/** Static interface for the All Formats parsed result */
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

/**
 * Try each model provider in sequence until one succeeds.
 */
async function tryGenerateWithFallbacks<T>(
  system: string,
  prompt: string,
  schema: z.ZodType<T>,
  jsonFields: string,
  system70B?: string,
  retryModels?: Array<{ model: ReturnType<typeof groq> | ReturnType<typeof google>; label: string; temp: number }>,
): Promise<T> {
  const attempts = retryModels ?? [
    { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.4 },
    { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.4 },
  ];

  if (!retryModels && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
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

/** JSON field spec builders for each track type */
const SBCS_JSON_FIELDS_2_SRC = `{
  "backgroundContext": "string (background context for the case study, at least 40 chars)",
  "sourceAProvenance": "string (provenance of Source A, at least 8 chars)",
  "sourceA": "string (content of Source A, at least 120 chars)",
  "sourceBProvenance": "string (provenance of Source B, at least 8 chars)",
  "sourceB": "string (content of Source B, at least 120 chars)",
  "questionPrompt": "string (the unified question prompt, at least 20 chars)",
  "sbcsPrompt": "string (SBCS question text targeting the skill, at least 20 chars)",
  "suggestedAnswer": "string (A1-grade model answer, at least 30 chars)"
}`;

const SBCS_JSON_FIELDS_5_SRC = `{
  "backgroundContext": "string (background context for the case study, at least 40 chars)",
  "sourceAProvenance": "string (provenance of Source A, at least 8 chars)",
  "sourceA": "string (content of Source A, at least 120 chars)",
  "sourceBProvenance": "string (provenance of Source B, at least 8 chars)",
  "sourceB": "string (content of Source B, at least 120 chars)",
  "sourceCProvenance": "string (provenance of Source C, at least 8 chars)",
  "sourceC": "string (content of Source C, at least 120 chars)",
  "sourceDProvenance": "string (provenance of Source D, at least 8 chars)",
  "sourceD": "string (content of Source D, at least 120 chars)",
  "sourceEProvenance": "string (provenance of Source E, at least 8 chars)",
  "sourceE": "string (content of Source E, at least 120 chars)",
  "questionPrompt": "string (the unified question prompt, at least 20 chars)",
  "sbcsPrompt": "string (SBCS synthesis/assertion question, at least 20 chars)",
  "suggestedAnswer": "string (A1-grade model answer, at least 30 chars)"
}`;

const SEQ_JSON_FIELDS = `{
  "backgroundContext": "string (background context / topic paragraph, at least 40 chars)",
  "seqQuestion1": "string (SEQ essay question 1, at least 20 chars)",
  "seqQuestion2": "string (SEQ essay question 2, at least 20 chars)",
  "seqQuestion3": "string (SEQ essay question 3, at least 20 chars)",
  "questionPrompt": "string (the overall question header, at least 20 chars)",
  "suggestedAnswer": "string (A1-grade model essay answer, at least 30 chars)"
}`;

const SRQ_JSON_FIELDS = `{
  "backgroundContext": "string (background context for the SRQ scenario, at least 40 chars)",
  "srqBackgroundContext": "string (SRQ background context introducing the scenario, at least 20 chars)",
  "srqQuestionA": "string (SRQ part (a) question, at least 20 chars)",
  "srqQuestionB": "string (SRQ part (b) question, at least 20 chars)",
  "questionPrompt": "string (the overall question header, at least 20 chars)",
  "suggestedAnswer": "string (A1-grade model answer for both SRQ parts, at least 30 chars)"
}`;

function buildAllFormatsJsonFields(): string {
  const lines: string[] = [];
  lines.push(`  "backgroundContext": "string (overall background context for the case study, at least 40 chars)",`);
  for (let i = 1; i <= 5; i++) {
    lines.push(`  "source${i}Provenance": "string (provenance of Source ${i}, at least 8 chars)",`);
    lines.push(`  "source${i}": "string (content of Source ${i}, at least 60 chars)",`);
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
 */
function validateGeneration(
  result: Record<string, any>,
  resolvedSourceCount: number,
  isAllFormats: boolean,
  trackType: TrackType,
): string[] {
  const issues: string[] = [];

  // 1. Check background context
  if (!result.backgroundContext || result.backgroundContext.length < 40) {
    issues.push('backgroundContext is too short or missing (< 40 chars)');
  }

  // 2. Check sources have minimum content length (SBCS / All Formats only)
  if (trackType === 'sbcs' || trackType === 'all-formats') {
    const sourceKeys = ['sourceA', 'sourceB', 'sourceC', 'sourceD', 'sourceE'];
    for (let i = 0; i < resolvedSourceCount && i < sourceKeys.length; i++) {
      const key = sourceKeys[i];
      const content = result[key];
      if (!content || content.length < 120) {
        issues.push(`${key} is too short or missing (< 120 chars)`);
      }
    }
  }

  // 3. Check suggestedAnswer exists
  if (!result.suggestedAnswer || result.suggestedAnswer.length < 30) {
    issues.push('suggestedAnswer is too short or missing (< 30 chars)');
  }

  // 4. For All Formats, check LORMS/PEEL markers
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

  // 5. Check track-specific question fields
  if (isAllFormats) {
    const parts = ['partA_Inference', 'partB_Comparison', 'partC_Purpose', 'partD_Reliability', 'partE_Assertion'];
    for (const part of parts) {
      if (!result[part] || result[part].length < 3) {
        issues.push(`${part} is missing or too short`);
      }
    }
  } else if (trackType === 'sbcs') {
    if (!result.sbcsPrompt || result.sbcsPrompt.length < 10) {
      issues.push('sbcsPrompt is missing or too short');
    }
  } else if (trackType === 'seq') {
    for (const q of ['seqQuestion1', 'seqQuestion2', 'seqQuestion3']) {
      if (!result[q] || result[q].length < 10) {
        issues.push(`${q} is missing or too short`);
      }
    }
  } else if (trackType === 'srq') {
    if (!result.srqQuestionA || result.srqQuestionA.length < 10) {
      issues.push('srqQuestionA is missing or too short');
    }
    if (!result.srqQuestionB || result.srqQuestionB.length < 10) {
      issues.push('srqQuestionB is missing or too short');
    }
  }

  return issues;
}

/**
 * Normalise All Formats response.
 */
function normaliseAllFormatsResponse(data: AllFormatsData) {
  const result: Record<string, any> = {
    sourceAProvenance: data.source1Provenance,
    sourceA: data.source1,
    sourceBProvenance: data.source2Provenance,
    sourceB: data.source2,
    sbcsPrompt: `(a) ${data.partA_Inference}\n\n(b) ${data.partB_Comparison}\n\n(c) ${data.partC_Purpose}\n\n(d) ${data.partD_Reliability}\n\n(e) ${data.partE_Assertion}`,
    partA_Inference: data.partA_Inference,
    partB_Comparison: data.partB_Comparison,
    partC_Purpose: data.partC_Purpose,
    partD_Reliability: data.partD_Reliability,
    partE_Assertion: data.partE_Assertion,
    srqBackgroundContext: data.srqBackgroundContext || '',
    srqQuestionA: data.srqQuestionA || '',
    srqQuestionB: data.srqQuestionB || '',
    seqQuestion1: data.seqQuestion1 || '',
    seqQuestion2: data.seqQuestion2 || '',
    seqQuestion3: data.seqQuestion3 || '',
    backgroundContext: data.backgroundContext || '',
    questionPrompt: data.questionPrompt || 'All Formats Comprehensive Examination Package',
    seqPrompt: data.seqQuestion1 || '',
    srqPrompt: data.srqQuestionA || '',
    suggestedAnswer: data.suggestedAnswer,
    isAllFormats: true,
    sourceCount: 5,
    sourceCProvenance: data.source3Provenance || '',
    sourceC: data.source3 || '',
    sourceDProvenance: data.source4Provenance || '',
    sourceD: data.source4 || '',
    sourceEProvenance: data.source5Provenance || '',
    sourceE: data.source5 || '',
  };
  return result;
}

/**
 * Build a normalised SBCS response with the correct source count.
 */
function normaliseSBCSResponse(data: z.infer<typeof sbcsSchema>, sourceCount: number) {
  const result: Record<string, any> = {
    backgroundContext: data.backgroundContext || '',
    sourceAProvenance: data.sourceAProvenance || '',
    sourceA: data.sourceA || '',
    sourceBProvenance: data.sourceBProvenance || '',
    sourceB: data.sourceB || '',
    questionPrompt: data.questionPrompt || '',
    sbcsPrompt: data.sbcsPrompt || '',
    seqPrompt: '',
    srqPrompt: '',
    suggestedAnswer: data.suggestedAnswer || '',
    isAllFormats: false,
    trackType: 'sbcs',
    sourceCount,
  };
  if (sourceCount >= 3) {
    result.sourceCProvenance = data.sourceCProvenance || '';
    result.sourceC = data.sourceC || '';
  }
  if (sourceCount >= 4) {
    result.sourceDProvenance = data.sourceDProvenance || '';
    result.sourceD = data.sourceD || '';
  }
  if (sourceCount >= 5) {
    result.sourceEProvenance = data.sourceEProvenance || '';
    result.sourceE = data.sourceE || '';
  }
  return result;
}

/**
 * Build a normalised SEQ response (no sources).
 */
function normaliseSEQResponse(data: z.infer<typeof seqSchema>) {
  return {
    backgroundContext: data.backgroundContext || '',
    sourceAProvenance: '',
    sourceA: '',
    sourceBProvenance: '',
    sourceB: '',
    questionPrompt: data.questionPrompt || '',
    sbcsPrompt: '',
    seqPrompt: data.seqQuestion1 || '',
    srqPrompt: '',
    seqQuestion1: data.seqQuestion1 || '',
    seqQuestion2: data.seqQuestion2 || '',
    seqQuestion3: data.seqQuestion3 || '',
    suggestedAnswer: data.suggestedAnswer || '',
    isAllFormats: false,
    trackType: 'seq',
    sourceCount: 0,
  };
}

/**
 * Build a normalised SRQ response (no sources).
 */
function normaliseSRQResponse(data: z.infer<typeof srqSchema>) {
  return {
    backgroundContext: data.backgroundContext || '',
    sourceAProvenance: '',
    sourceA: '',
    sourceBProvenance: '',
    sourceB: '',
    questionPrompt: data.questionPrompt || '',
    sbcsPrompt: '',
    seqPrompt: '',
    srqPrompt: data.srqQuestionA || '',
    srqBackgroundContext: data.srqBackgroundContext || '',
    srqQuestionA: data.srqQuestionA || '',
    srqQuestionB: data.srqQuestionB || '',
    suggestedAnswer: data.suggestedAnswer || '',
    isAllFormats: false,
    trackType: 'srq',
    sourceCount: 0,
  };
}

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // ── Rate limit ──
    const rl = await checkSupabaseRateLimit(request, GENERATE_QUESTION_LIMIT);
    if (rl && !rl.allowed) {
      return rateLimitResponse(rl.headers);
    }

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

    // ── Determine track type and source count ──
    const trackType = getTrackType(resolvedQuestionType);
    const isAllFormats = trackType === 'all-formats';
    const resolvedSourceCount = getSourceCountForTrack(trackType, resolvedQuestionType);

    const systemPrompt = getGenerateSystemPrompt(resolvedSubject, resolvedTopic, resolvedQuestionType);
    const systemPrompt70B = getGenerateSystemPrompt70B(resolvedSubject, resolvedTopic, resolvedQuestionType);

    let result;

    if (isAllFormats) {
      const schema = createAllFormatsSchema();
      const jsonFields = buildAllFormatsJsonFields();

      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate one complete O-Level ${resolvedSubject} FULL EXAM PACKAGE on the topic "${resolvedTopic}".
Skill track: All Formats — generate ALL components (5 sources, 5 SBQ questions part A-E, plus subject-specific SRQ/SEQ sections).
All 5 sources are required.
The sources must be designed to test a RANGE of skills (inference, comparison, purpose, reliability, assertion).

CRITICAL: The suggestedAnswer MUST include LORMS level labels (e.g., "L4 Message (4-5m):") and PEEL structure markers (Point:/Evidence:/Explanation:/Link:) for EVERY part. Each part (a)-(e) must have its OWN model answer — do not combine them.`.trim(),
        schema,
        jsonFields,
        systemPrompt70B,
      );
      result = normaliseAllFormatsResponse(raw as AllFormatsData);
    } else if (trackType === 'sbcs') {
      const useFiveSources = resolvedSourceCount >= 5;
      const jsonFields = useFiveSources ? SBCS_JSON_FIELDS_5_SRC : SBCS_JSON_FIELDS_2_SRC;
      const sourceCountHint = useFiveSources
        ? 'Generate EXACTLY 5 sources (A through E) with distinct provenances.'
        : 'Generate EXACTLY 2 sources (A and B) with distinct provenances.';

      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate an O-Level ${resolvedSubject} Source-Based Case Study (SBCS) stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.
${sourceCountHint}
The sources must be designed specifically to test the ${resolvedQuestionType} skill.
Output only the SBCS question (sbcsPrompt) — do NOT generate SEQ or SRQ questions.`.trim(),
        sbcsSchema,
        jsonFields,
        systemPrompt70B,
      );
      result = normaliseSBCSResponse(raw, resolvedSourceCount);
    } else if (trackType === 'seq') {
      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate an O-Level ${resolvedSubject} SEQ (Structured Essay Questions) practice set on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.
Generate 3 SEQ essay prompts (seqQuestion1, seqQuestion2, seqQuestion3) with a background context.
Do NOT generate any sources or SBCS questions — this is a pure essay practice.`.trim(),
        seqSchema,
        SEQ_JSON_FIELDS,
        systemPrompt70B,
      );
      result = normaliseSEQResponse(raw);
    } else if (trackType === 'srq') {
      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate an O-Level ${resolvedSubject} SRQ (Structured Response Questions) practice set on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.
Generate a background context (srqBackgroundContext) and 2 SRQ questions (srqQuestionA, srqQuestionB).
Do NOT generate any sources or SBCS questions — this is a pure SRQ practice.`.trim(),
        srqSchema,
        SRQ_JSON_FIELDS,
        systemPrompt70B,
      );
      result = normaliseSRQResponse(raw);
    } else {
      // Fallback to SBCS
      const raw = await tryGenerateWithFallbacks(
        systemPrompt,
        `Generate an O-Level ${resolvedSubject} SBCS stimulus package on the topic "${resolvedTopic}".
Skill track: ${resolvedQuestionType}.
Generate EXACTLY 2 sources (A and B) with distinct provenances.
Output only the SBCS question.`.trim(),
        sbcsSchema,
        SBCS_JSON_FIELDS_2_SRC,
        systemPrompt70B,
      );
      result = normaliseSBCSResponse(raw, 2);
    }

    // ── Persist for sidebar history ──
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const client = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
          : await getServerSupabase();

        const metadata: Record<string, any> = {
          sourceCount: resolvedSourceCount,
          trackType,
        };

        const resultObj = result as Record<string, any>;

        if (isAllFormats) {
          metadata.isAllFormats = true;
          if (resultObj.sourceCProvenance) metadata.sourceCProvenance = resultObj.sourceCProvenance;
          if (resultObj.sourceC) metadata.sourceC = resultObj.sourceC;
          if (resultObj.sourceDProvenance) metadata.sourceDProvenance = resultObj.sourceDProvenance;
          if (resultObj.sourceD) metadata.sourceD = resultObj.sourceD;
          if (resultObj.sourceEProvenance) metadata.sourceEProvenance = resultObj.sourceEProvenance;
          if (resultObj.sourceE) metadata.sourceE = resultObj.sourceE;
          if (resultObj.partA_Inference) metadata.partA_Inference = resultObj.partA_Inference;
          if (resultObj.partB_Comparison) metadata.partB_Comparison = resultObj.partB_Comparison;
          if (resultObj.partC_Purpose) metadata.partC_Purpose = resultObj.partC_Purpose;
          if (resultObj.partD_Reliability) metadata.partD_Reliability = resultObj.partD_Reliability;
          if (resultObj.partE_Assertion) metadata.partE_Assertion = resultObj.partE_Assertion;
          if (resultObj.srqBackgroundContext) metadata.srqBackgroundContext = resultObj.srqBackgroundContext;
          if (resultObj.srqQuestionA) metadata.srqQuestionA = resultObj.srqQuestionA;
          if (resultObj.srqQuestionB) metadata.srqQuestionB = resultObj.srqQuestionB;
          if (resultObj.seqQuestion1) metadata.seqQuestion1 = resultObj.seqQuestion1;
          if (resultObj.seqQuestion2) metadata.seqQuestion2 = resultObj.seqQuestion2;
          if (resultObj.seqQuestion3) metadata.seqQuestion3 = resultObj.seqQuestion3;
          if (resultObj.sbcsPrompt) metadata.sbcsPrompt = resultObj.sbcsPrompt;
        }

        await client.from('generated_questions').insert({
          user_id: userId,
          subject: resolvedSubject,
          topic: resolvedTopic,
          question_type: resolvedQuestionType,
          background_context: resultObj.backgroundContext || '',
          source_a: resultObj.sourceA || '',
          source_b: resultObj.sourceB || '',
          question_prompt: resultObj.questionPrompt || '',
          suggested_answer: resultObj.suggestedAnswer || '',
          metadata,
        } as never);
      } catch (dbErr) {
        console.warn('Non-fatal: failed to persist generated_questions row', dbErr);
      }
    }

    // ── Quality validation ──
    const resultObj = result as Record<string, any>;
    const validationIssues = validateGeneration(resultObj, resolvedSourceCount, isAllFormats, trackType);

    if (validationIssues.length > 0) {
      console.warn('[generate] Quality validation failed:', validationIssues);

      console.log('[generate] Retrying generation once for quality...');
      try {
        const retrySystem = getGenerateSystemPrompt70B(resolvedSubject, resolvedTopic, resolvedQuestionType);

        // Build diversified retry attempts
        const retryAttempts = [
          { model: groq('llama-3.1-8b-instant'), label: 'Groq Llama 3.1 8B', temp: 0.4 },
          { model: groq('llama-3.3-70b-versatile'), label: 'Groq Llama 3.3 70B', temp: 0.4 },
        ];
        if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          retryAttempts.unshift(
            { model: google('gemini-2.5-flash'), label: 'Google Gemini 2.5 Flash', temp: 0.3 },
          );
        }

        if (isAllFormats) {
          const schema = createAllFormatsSchema();
          const jsonFields = buildAllFormatsJsonFields();
          const retryRaw = await tryGenerateWithFallbacks(
            systemPrompt,
            `Regenerate a complete O-Level ${resolvedSubject} FULL EXAM PACKAGE on the topic "${resolvedTopic}".
Previous attempt had issues: ${validationIssues.join('; ')}.
Ensure ALL sections are complete and LORMS labels are present.`.trim(),
            schema,
            jsonFields,
            retrySystem,
            retryAttempts,
          );
          result = normaliseAllFormatsResponse(retryRaw as AllFormatsData);
        } else if (trackType === 'sbcs') {
          const useFiveSources = resolvedSourceCount >= 5;
          const jsonFields = useFiveSources ? SBCS_JSON_FIELDS_5_SRC : SBCS_JSON_FIELDS_2_SRC;
          const retryRaw = await tryGenerateWithFallbacks(
            systemPrompt,
            `Regenerate an O-Level ${resolvedSubject} SBCS stimulus package on the topic "${resolvedTopic}".
Previous attempt had issues: ${validationIssues.join('; ')}.
Skill track: ${resolvedQuestionType}.`.trim(),
            sbcsSchema,
            jsonFields,
            retrySystem,
            retryAttempts,
          );
          result = normaliseSBCSResponse(retryRaw, resolvedSourceCount);
        } else if (trackType === 'seq') {
          const retryRaw = await tryGenerateWithFallbacks(
            systemPrompt,
            `Regenerate an O-Level ${resolvedSubject} SEQ practice set on the topic "${resolvedTopic}".
Previous attempt had issues: ${validationIssues.join('; ')}.`.trim(),
            seqSchema,
            SEQ_JSON_FIELDS,
            retrySystem,
            retryAttempts,
          );
          result = normaliseSEQResponse(retryRaw);
        } else if (trackType === 'srq') {
          const retryRaw = await tryGenerateWithFallbacks(
            systemPrompt,
            `Regenerate an O-Level ${resolvedSubject} SRQ practice set on the topic "${resolvedTopic}".
Previous attempt had issues: ${validationIssues.join('; ')}.`.trim(),
            srqSchema,
            SRQ_JSON_FIELDS,
            retrySystem,
            retryAttempts,
          );
          result = normaliseSRQResponse(retryRaw);
        }
      } catch (retryErr) {
        console.warn('[generate] Retry also failed, serving original result:', retryErr);
      }

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
