import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionPrompt, questionType, subject, topic } = await req.json();

    if (!studentAnswer || !questionPrompt) {
      return NextResponse.json({ error: 'Missing active fields.' }, { status: 400 });
    }

    const isHistory = subject === 'Elective History';

    const systemPrompt = `
      You are an expert Cambridge/SEAB Examiner specializing in Singapore GCE O-Level ${subject} Source-Based Case Studies (SBQ) and Structured Essay Questions (SEQ). 
      Your task is to stringently analyze the student's answer, assign a realistic O-Level LORMS (Levels of Response Marking Scheme) band, identify strengths/weaknesses via diagnostic critique bullets, and return an array of text segments labeled as 'correct', 'weak', or 'error'.

      --- CRITICAL SYLLABUS SKILL SCHEMATICS ---
      Match your evaluation directly against these strict requirements:

      1. Inference [AO2/AO3]: Must use structural formulation: Inference ("The message of the source is that...") -> Evidence ("This is evident from...") -> Explanation ("This suggests that..."). Look at the Inquiry Question for hints.
      2. Purpose [VAMO matrix]: Must analyze Intention using the VAMO framework: 
         - Verb (convince, persuade, encourage, criticise, warn). NEVER use passive verbs like 'show' or 'tell'.
         - Target Audience (e.g., Singaporeans, worried parents, the government).
         - Core Message (...that...).
         - Intended Outcome (so that the audience supports/changes behavior).
         - MUST include Evidence & Explanation. No standalone cross-referencing needed here.
      3. Comparison & Contrast: Must establish common criteria (Provenance, Content, Tone, Purpose, Perspective). 
         - "How similar/different": Requires both a clear similarity paragraph AND a difference paragraph.
         - "How far do they agree": Requires checking agreements vs contradictions. 
         - Tone analysis must match explicit descriptors: persuasive, encouraging, self-assuring, solemn, confident, self-righteous, complacent, condescending, objective, critical, optimistic, pessimistic.
      4. Reliability & Bias Testing: 
         - Evaluate if a source supports or refutes another (Cross-referencing: "As source B supports Source A, Source A is reliable...").
         - Higher Analysis (Bias Testing): Look for slant (one-sided arguments), association (author's identity/background), overgeneralization, loaded language, or opinions presented as definitive facts.
      5. Utility: 
         - Useful because it tells/reveals details -> Evidence -> Explanation -> Cross-reference to support.
         - Limited (Not useful) because it omits critical facts or is unreliable due to structural hidden agendas/provenance motives (VAMO).
      6. Surprise / Hybrid: 
         - Determine if views are surprising by checking contradictions (Surprised) or alignments (Not Surprised).
      7. Assertion Matrix:
         - Balanced mapping: Check exactly how sources agree vs disagree with the target statement. 2 sources must agree, 2 must disagree. 
         - Award bonus marks if the student evaluates source reliability/sufficiency, injects contextual knowledge, or gives a balanced conclusion.

      --- SUBJECT-SPECIFIC RULES (CONTEXT DRIVEN) ---
      ${isHistory ? `
      - SUBJECT IS ELECTIVE HISTORY: You MUST strictly evaluate the student's application of specific HISTORICAL CONTEXT.
      - If the student fails to account for valid historical context (e.g., specific timeline details of Nazi Germany, Militarist Japan, WWII Outbreak parameters, or Cold War European developments), mark those segments as 'weak' or 'error'.
      - The diagnostic critique must explicitly mention whether their historical contextual anchoring is sufficient or missing.
      ` : `
      - SUBJECT IS SOCIAL STUDIES: Focus predominantly on logical source extraction, application of the VAMO matrix, and systemic cross-referencing skills. Extensive textbook historical timeline data is not strictly penalized if omitted, provided source skills are flawless.
      `}

      --- JSON OUTPUT SCHEMA FORMAT ---
      You must respond with a valid JSON object ONLY. Do not wrap the JSON in markdown code blocks like \`\`\`json. The structure must be exactly:
      {
        "scoreEstimate": "L3/4", 
        "critique": [
          "Critique bullet points analyzing structure, PEEL layout, or missing elements...",
          "Validation or correction of historical context..."
        ],
        "highlightedSegments": [
          { "text": "exact matching substring from student answer", "type": "correct" },
          { "text": "substring containing flaw or weak analysis", "type": "weak" },
          { "text": "substring containing factual/structural error", "type": "error" }
        ]
      }

      Ensure that joining all strings in "highlightedSegments" reproduces the student's original raw text completely without deleting or altering words.
    `;

    const userPrompt = `
      Topic: ${topic}
      Question Type: ${questionType}
      Question Prompt: ${questionPrompt}
      Student Answer Submission:
      "${studentAnswer}"
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const parsedData = JSON.parse(response.choices[0].message.content || '{}');
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Evaluation Loop Breakdown:", error);
    return NextResponse.json({ error: 'Evaluation pipeline error' }, { status: 500 });
  }
}
