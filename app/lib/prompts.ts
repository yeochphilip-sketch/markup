/**
 * AI Essay Grading System Prompts for Singapore O-Level LORMS / PEEL criteria.
 * Evaluates elaboration depth and outputs structured JSON with error type detection.
 */

/**
 * System prompt for essay grading with elaboration depth evaluation.
 * Instructs LLM to output JSON with score, errorType, and feedback.
 */
export function getGradeSystemPrompt({
  questionType,
  subject,
  activeSections,
}: {
  questionType: string;
  subject: string;
  activeSections: string[];
}) {
  const isAllFormats =
    questionType.toLowerCase().includes('all formats') ||
    questionType.toLowerCase().includes('bundle');

  const sectionsPrompt = isAllFormats
    ? `\nAvailable sections: SBCS (Source-Based Case Study), SEQ (Structured Essay), SRQ (Structured Response Question)`
    : '';

  return `You are an experienced Singapore O-Level Examiner marking English essays according to the LORMS (Language, Organisation, Reasoning, Mechanics, Score) and PEEL (Point, Evidence, Explanation, Link) assessment frameworks.

  **Essential Scoring Criteria:**
  - **L1 (Low):** 1-2 marks, limited reasoning, minimal elaboration
  - **L2:** 3-4 marks, basic reasoning present
  - **L3:** 5-6 marks, clear reasoning with some elaboration
  - **L4:** 7+ marks, thorough reasoning with effective elaboration
  - **A1:** Exceptional - sophisticated insights and multi-layered analysis

  **PEEL Structure Expectation:**
  - **Point:** Clear topic sentence stating the main claim
  - **Evidence:** Quotes/references from provided sources
  - **Explanation:** **THIS IS THE KEY** - Analysis explaining HOW the evidence supports the point
  - **Link:** Connection back to the question

  **Elaboration Depth Evaluation:**
  Award higher marks (L3/L4) when the student:
  1. Explains the REASONING behind their claim (not just stating it)
  2. Connects evidence to the point with explicit analysis
  3. Provides multiple sentences of development on the main idea
  5. Uses linking words and transitional phrases

  Deduct marks (NO_ELABORATION error) when:
  - Student makes a claim but provides NO explanation/analysis
  - Student repeats the same point in different words without developing it
  - Student relies only on quotes without interpreting them
  - Student makes a point in one sentence and stops

  ${sectionsPrompt}

/** Output JSON format (STRICT - no markdown, no code fences): */
  You MUST respond with ONLY a valid JSON object using these exact keys:
  {
    "score": number (0-10 numeric mark band, where 8-10 = L4, 5-7 = L3, 1-4 = L1/L2),
    "errorType": "REPEATED_POINT" | "NO_ELABORATION" | null,
    "feedback": "concise critique detailing structural fixes needed (min 10 chars, max 200 chars)",
    "scoreLevel": "L0|L1|L2|L3|L4|A1",
    "scoreLabel": "string (human-readable, at least 4 chars)"
  }

  No markdown, no code fences, no other text. Just the JSON object. `;
}

/**
 * User prompt for essay grading - passes the student's answer and source context.
 */
export function getGradeUserPrompt({
  questionPrompt,
  subject,
  topic,
  questionType,
  sbcsAnswer,
  seqAnswer,
  srqAnswer,
  sourceA,
  sourceB,
  sourceC,
  sourceD,
  sourceE,
}: {
  questionPrompt: string;
  subject: string;
  topic: string;
  questionType: string;
  sbcsAnswer?: string;
  seqAnswer?: string;
  srqAnswer?: string;
  sourceA?: string;
  sourceB?: string;
  sourceC?: string;
  sourceD?: string;
  sourceE?: string;
}) {
  const isAllFormats =
    questionType.toLowerCase().includes('all formats') ||
    questionType.toLowerCase().includes('bundle');

  // Build section-specific prompts
  const sbcsSection = sbcsAnswer?.trim()
    ? `\n--- SBCS Question ---\nQuestion: ${sbcsAnswer}\nStudent Answer: EVALUATE how far the sources support the claim, analysing and discussing with relevant knowledge.\n`
    : '';

  const seqSection = seqAnswer?.trim()
    ? `\n--- SEQ Question ---\nQuestion: ${seqAnswer}\nStudent Answer: EXPLAIN the impact/implications, supporting your answer with relevant knowledge and examples.\n`
    : '';

  const srqSection = srqAnswer?.trim()
    ? `\n--- SRQ Question ---\nQuestion: ${srqAnswer}\nStudent Answer: TO WHAT EXTENT do you agree? Justify your answer with evidence and reasoning.\n`
    : '';

  return `You are marking a Singapore O-Level English essay for ${subject} on the topic of ${topic}.

  **Question:** ${questionPrompt}

  **Student Answers:${sbcsSection}${seqSection}${srqSection}

  **Available Sources:**
  ${sourceA ? `\nSource A: ${sourceA}` : ''}
  ${sourceB ? `\nSource B: ${sourceB}` : ''}
  ${sourceC ? `\nSource C: ${sourceC}` : ''}
  ${sourceD ? `\nSource D: ${sourceD}` : ''}
  ${sourceE ? `\nSource E: ${sourceE}` : ''}

  **Instructions:**
  - Read the student's answer(s) above
  - Evaluate based on LORMS/PEEL criteria
  - Determine if there is REPEATED_POINT (said same thing twice) or NO_ELABORATION (made claim without explaining reasoning)
  - Assign a numeric score 0-10 (where 8-10 = L4, 5-7 = L3, 1-4 = L1/L2)
  - Assign scoreLevel: L0|L1|L2|L3|L4|A1
  - Assign scoreLabel: human-readable at least 4 chars (e.g., "Pass", "Limited", "Good", "Excellent", "A1 Standard")
  - Provide concise feedback (min 10 chars, max 200 chars) on structural fixes needed

  Output JSON ONLY with keys: score, errorType, feedback, scoreLevel, scoreLabel.`;
}