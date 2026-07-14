// ================================================================
// MARKUP – Specialized Examiner Prompts  (v2)
//
// Each skill track + subject combination gets its own LORMS matrix,
// chain-of-thought rubric resolution steps, and confidence scoring.
// ================================================================

// ────────────────────────────────────────────────────────────────
//  Shared chain-of-thought + confidence instructions
// ────────────────────────────────────────────────────────────────

const CHAIN_OF_THOUGHT = `
## RUBRIC RESOLUTION — Step-by-Step

Before assigning a score, walk through each LORMS level explicitly:

Step 1 — Determine L1 eligibility: Does the answer meet the minimum criteria for L1?
Step 2 — Determine L2 eligibility: Does the answer satisfy ALL requirements for L2?
Step 3 — Determine L3 eligibility: Does the answer satisfy ALL requirements for L3?
Step 4 — Determine L4 eligibility (if applicable): Does the answer satisfy ALL requirements for L4?
Step 5 — Determine L5 eligibility (if applicable): Does the answer satisfy ALL requirements for L5?

After completing all steps, assign the **highest level** the answer fully meets.
If the answer falls between levels (e.g., strong L2 but not quite L3), note this in the critique.
`;

const CONFIDENCE_INSTRUCTIONS = `
## CONFIDENCE SCORING

After completing the evaluation, output a \`confidence\` score (0.0–1.0) indicating how certain you are
that your assessment is correct. Consider:

- **0.9–1.0**: The answer clearly matches a specific LORMS level with unambiguous evidence.
  The rubric applies cleanly with no edge cases.
- **0.7–0.89**: The answer mostly fits a level but has minor ambiguity in one criterion.
- **0.5–0.69**: The answer sits between two levels, or the evidence is partially ambiguous.
  Consider flagging for human review.
- **< 0.5**: The answer is highly ambiguous, off-topic, or too short to assess reliably.
  Must flag for human review.

Be honest — low confidence is better than a false score.
`;

const QUALITY_RULES = `
## QUALITY REJECTION RULES

If the answer is:
- Gibberish / nonsensical text: Set scoreEstimate to "Invalid — gibberish detected", confidence to 0.1
- Off-topic (does not address the question): Set scoreEstimate to "L0 — Off-topic", confidence to 0.3
- Too short to grade (< 20 words): Set scoreEstimate to "L0 — Insufficient content", confidence to 0.2
- Only one section submitted while others are empty: Grade ONLY the submitted sections; do not penalize for missing sections.
`;

const EMPTY_SECTION_LABEL = '[This section was not submitted by the student — omit from grading.]';

// ────────────────────────────────────────────────────────────────
//  LORMS Matrices — Social Studies
// ────────────────────────────────────────────────────────────────

const SS_COMPARISON_LORMS = `
### LORMS MATRIX — SBQ: Comparison & Contrast (AO2) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | False matching — describes sources separately without comparing them | 1 |
| L2 | Similarity OR Difference identified based on surface/sub-feature details | 2–3 |
| L3 | Similarity AND Difference identified based on sub-features OR valid matching of content/core message | 4 |
| L4 | Similarity AND Difference identified based on matching of core message with clear evidence from BOTH sources | 5 |

**Key distinction:** L2 = one-sided (similarity OR difference). L3 = two-sided (similarity AND difference).
L4 = two-sided WITH core message matching (not just surface features) AND precise evidence.
`;

const SS_INFERENCE_LORMS = `
### LORMS MATRIX — SBQ: Inference / Message (AO2) — Max 2 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Surface information identified from one source — what the source literally says | 1 |
| L2 | Inferred message/purpose identified from BOTH sources — what the source implies or suggests beyond the surface | 2 |

**Key distinction:** L1 repeats what the source says. L2 reads between the lines — the author's message, purpose, or attitude.
`;

const SS_PURPOSE_LORMS = `
### LORMS MATRIX — SBQ: Purpose / Motive Evolution (AO2) — Max 4 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Identifies purpose of ONE source at a single point in time | 1 |
| L2 | Identifies purpose of BOTH sources independently | 2–3 |
| L3 | Explains HOW or WHY the purpose/motive changed or evolved between the two sources, with evidence from each | 4 |

**Key distinction:** L1–L2 identifies WHAT the purpose is. L3 explains the CHANGE or REASON behind it.
`;

const SS_UTILITY_LORMS = `
### LORMS MATRIX — SBQ: Utility & Reliability Limits (AO2) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | States source is useful / not useful without justification | 1 |
| L2 | Assesses reliability or usefulness based on provenance alone (author, date, type of source) | 2–3 |
| L3 | Evaluates utility by considering BOTH content value AND provenance limitations | 4 |
| L4 | Evaluates utility with cross-referencing — compares what each source reveals AND conceals, with a balanced judgment | 5 |

**Key distinction:** L2 = provenance-only. L3 = content + provenance. L4 = cross-referenced evaluation.
`;

const SS_SYNTHESIS_LORMS = `
### LORMS MATRIX — SBQ: Synthesis / Assertion (AO2) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Simple agreement or disagreement with the assertion — no evidence | 1 |
| L2 | Supports position using evidence from ONE source | 2–3 |
| L3 | Cross-references BOTH sources to support a nuanced position | 4 |
| L4 | Synthesises with evaluation of source strengths/limitations, reaching a well-supported judgment | 5 |
`;

const SS_SEQ_LORMS = `
### LORMS MATRIX — SRQ/SEQ: Structured Essay Explanations (AO1) — Max 8 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Descriptive answer — states facts without explanation. No clear structure. | 1–2 |
| L2 | One-sided explanation — identifies ONE factor/reason with some supporting evidence. Basic PEEL attempt. | 3–4 |
| L3 | Multi-factor explanation — identifies TWO or more factors with good evidence for each. Clear PEEL structure. | 5–6 |
| L4 | Sophisticated balanced analysis — evaluates multiple factors, weighs their relative importance, reaches a substantiated conclusion. Mature PEEL throughout. | 7–8 |
`;

// ────────────────────────────────────────────────────────────────
//  LORMS Matrices — Elective History
// ────────────────────────────────────────────────────────────────

const HIST_COMPARISON_LORMS = `
### LORMS MATRIX — SBQ: Comparison & Contrast (AO3) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Describes sources separately — no comparison attempted | 1 |
| L2 | Similarity OR Difference identified based on content | 2–3 |
| L3 | Similarity AND Difference identified based on content AND provenance | 4 |
| L4 | Similarity AND Difference with evaluation — explains WHY sources differ (different perspectives, contexts, purposes) | 5 |
`;

const HIST_INFERENCE_LORMS = `
### LORMS MATRIX — SBQ: Inference / Message (AO3) — Max 2 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Surface information from source — factual recall | 1 |
| L2 | Inferred meaning — what the source reveals about the historical context, author's perspective, or underlying message | 2 |
`;

const HIST_RELIABILITY_LORMS = `
### LORMS MATRIX — SBQ: Reliability & Cross-Referencing (AO3) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | States source is reliable/unreliable without justification | 1 |
| L2 | Assesses reliability based on provenance — author, date, type, motive | 2–3 |
| L3 | Assesses reliability by cross-referencing content with another source — corroboration or contradiction | 4 |
| L4 | Comprehensive reliability evaluation — provenance + cross-referencing + considers typical limitations (bias, exaggeration, omission) | 5 |
`;

const HIST_UTILITY_LORMS = `
### LORMS MATRIX — SBQ: Evaluation of Utility (AO3) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | States source is useful/not useful — no reasoning | 1 |
| L2 | Assesses utility for a specific purpose based on content | 2–3 |
| L3 | Evaluates utility considering BOTH content value AND provenance limitations | 4 |
| L4 | Nuanced utility judgment — what the source reveals for ONE inquiry AND conceals for ANOTHER, with a final balanced assessment | 5 |
`;

const HIST_PURPOSE_LORMS = `
### LORMS MATRIX — SBQ: Target Purpose Analysis (AO3) — Max 4 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Identifies author or audience of ONE source | 1 |
| L2 | Identifies purpose of ONE source with evidence | 2 |
| L3 | Identifies purpose of BOTH sources with evidence | 3 |
| L4 | Compares purposes — explains why each author had a different purpose based on their historical context | 4 |
`;

const HIST_SEQ_LORMS = `
### LORMS MATRIX — SEQ: Factor Prioritization (AO1/AO2) — Max 8 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Mentions factors without explanation — narrative/descriptive | 1–2 |
| L2 | Explains ONE factor with some historical evidence | 3–4 |
| L3 | Explains TWO or MORE factors with specific historical evidence for each | 5–6 |
| L4 | Evaluates and prioritises factors — weighs relative importance, reaches a substantiated judgment on which factor was MOST significant | 7–8 |
`;

// ────────────────────────────────────────────────────────────────
//  Few-Shot Examples
// ────────────────────────────────────────────────────────────────

export interface FewShotExample {
  level: string;
  studentAnswer: string;
  scoreEstimate: string;
  critique: string[];
  confidence: number;
  a1Upgrade: string;
}

const SS_COMPARISON_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer: 'Source A says the government provided housing benefits. Source B says the government provided medical benefits. Both sources are about benefits the government gave.',
    scoreEstimate: 'L2 / 3 marks — Similarity identified (both about government benefits) but based on surface details only, no core message matching',
    critique: [
      'You identified a similarity — both sources describe government benefits. This meets L2.',
      'However, you summarised each source separately without directly comparing their content.',
      'To reach L3, identify BOTH a similarity AND a difference between the sources.',
      'To reach L4, match the CORE MESSAGE of each source, not just the surface topic (benefits).',
    ],
    confidence: 0.85,
    a1Upgrade: 'Point: Both Source A and Source B convey that the government actively provided welfare schemes to address public needs. Evidence: Source A states that the government "rolled out a comprehensive housing benefits package," while Source B reports "new medical subsidies were introduced." Explanation: However, Source A focuses on housing as the primary intervention, whereas Source B centres on healthcare — revealing that welfare was multi-pronged rather than limited to one area. Link: Therefore, while both sources affirm the government\'s welfare role, they differ in which sector the government prioritised.',
  },
  {
    level: 'L4',
    studentAnswer: 'Both sources highlight the government\'s interventionist approach, but they differ in the rationale. Source A emphasises economic efficiency — the government intervened to "streamline industrial output." In contrast, Source B argues the intervention was politically motivated — "to consolidate support among rural voters." Source A\'s core message is that intervention was pragmatic; Source B\'s core message is that intervention was political. This difference is significant because it reveals that the government\'s motives were not purely economic but also electoral, shaping how we interpret the effectiveness of the policies.',
    scoreEstimate: 'L4 / 5 marks — Similarity AND Difference identified with core message matching from both sources',
    critique: [
      'Strong similarity identified — both show government intervention.',
      'Clear difference identified — economic vs political rationale.',
      'Excellent core message matching — you identified the CENTRAL argument of each source, not just surface features.',
      'Precise evidence used from both sources to support your points.',
      'A succinct Link ties the analysis back to implications for interpretation.',
    ],
    confidence: 0.95,
    a1Upgrade: 'Point: Both sources convey that the government adopted an interventionist approach, but they differ fundamentally in the rationale presented. Evidence: Source A frames intervention as economically necessary — the government sought to "streamline industrial output." Source B, however, presents intervention as politically strategic — designed "to consolidate support among rural voters." Explanation: The divergence reveals that Source A prioritises the government\'s official economic narrative, while Source B implies a less transparent motive of electoral self-interest. Link: This contrast matters because it forces historians to question whether the government\'s intervention was driven by genuine economic planning or by political calculation — a distinction that shapes how we evaluate the policy\'s success.',
  },
];

const SS_INFERENCE_EXAMPLES: FewShotExample[] = [
  {
    level: 'L1',
    studentAnswer: 'Source A says that the government built new schools in rural areas.',
    scoreEstimate: 'L1 / 1 mark — Surface information from one source only',
    critique: [
      'You identified surface information from Source A — what it literally says.',
      'To reach L2, you need to infer what the source IMPLIES about the government\'s attitude or priorities.',
      'For example: The fact that schools were built in "rural areas" may imply the government valued rural development or needed to win rural support.',
      'Also attempt inference from BOTH sources, not just one.',
    ],
    confidence: 0.88,
    a1Upgrade: 'Surface level: Source A states that "new schools were constructed in rural districts." Inferred message: The government\'s decision to prioritise rural education implies it recognised a gap in rural infrastructure and was attempting to address regional inequality — or possibly to secure political loyalty from rural communities. This suggests the government was not merely building schools, but actively shaping its base of support through educational access.',
  },
];

const SS_SEQ_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer: 'One factor that led to the policy change was economic recession. When the economy slowed down, the government had less money to spend. So they changed their policy to cut costs.',
    scoreEstimate: 'L2 / 4 marks — One factor identified with basic explanation',
    critique: [
      'You identified ONE factor (economic recession) — this meets L2.',
      'Your explanation is clear but general — it lacks specific evidence (e.g., GDP figures, specific budget cuts).',
      'To reach L3, add a SECOND factor (e.g., political pressure, international influence) and use specific evidence.',
      'Use the PEEL structure: Point, Evidence, Explanation, Link.',
      'Aim for concrete historical examples rather than generic reasoning.',
    ],
    confidence: 0.82,
    a1Upgrade: 'Point: A key factor driving the policy change was the economic recession of [year]. Evidence: GDP contracted by X%, and government revenue fell by Y%, forcing the treasury to cut spending by Z%. Explanation: The recession constrained the government\'s fiscal space — fewer resources meant the existing policy was no longer affordable. Rather than borrow, the government chose to restructure, prioritising essential services. Link: Therefore, economic conditions acted as a structural constraint that made policy change unavoidable, regardless of the government\'s ideological preferences.',
  },
];

// ────────────────────────────────────────────────────────────────
//  Prompt Builder
// ────────────────────────────────────────────────────────────────

function getSubjectLabel(subject: string): string {
  return subject === 'Elective History' ? 'Elective History' : 'Social Studies';
}

function getAssessmentObjectives(subject: string): string {
  return subject === 'Elective History'
    ? 'AO1 (Knowledge), AO2 (Explanation/Analysis), AO3 (Source Skills)'
    : 'AO1 (Knowledge), AO2 (Source-Based Skills)';
}

function getLormsMatrix(questionType: string, subject: string): string {
  const type = questionType.toLowerCase();
  const isHistory = subject === 'Elective History';

  if (isHistory) {
    if (type.includes('comparison') || type.includes('contrast')) return HIST_COMPARISON_LORMS;
    if (type.includes('inference') || type.includes('message')) return HIST_INFERENCE_LORMS;
    if (type.includes('reliability') || type.includes('cross-ref')) return HIST_RELIABILITY_LORMS;
    if (type.includes('utility')) return HIST_UTILITY_LORMS;
    if (type.includes('purpose') || type.includes('target')) return HIST_PURPOSE_LORMS;
    if (type.includes('seq') || type.includes('essay') || type.includes('factor')) return HIST_SEQ_LORMS;
    // All Formats — return all History rubrics
    return [HIST_COMPARISON_LORMS, HIST_INFERENCE_LORMS, HIST_RELIABILITY_LORMS, HIST_UTILITY_LORMS, HIST_PURPOSE_LORMS, HIST_SEQ_LORMS].join('\n');
  }

  // Social Studies
  if (type.includes('comparison') || type.includes('contrast')) return SS_COMPARISON_LORMS;
  if (type.includes('inference') || type.includes('message')) return SS_INFERENCE_LORMS;
  if (type.includes('purpose') || type.includes('motive')) return SS_PURPOSE_LORMS;
  if (type.includes('utility') || type.includes('reliability')) return SS_UTILITY_LORMS;
  if (type.includes('synthesis') || type.includes('assertion') || type.includes('matrix')) return SS_SYNTHESIS_LORMS;
  if (type.includes('seq') || type.includes('essay') || type.includes('srq')) return SS_SEQ_LORMS;
  // All Formats — return all SS rubrics
  return [SS_COMPARISON_LORMS, SS_INFERENCE_LORMS, SS_PURPOSE_LORMS, SS_UTILITY_LORMS, SS_SYNTHESIS_LORMS, SS_SEQ_LORMS].join('\n');
}

function getFewShotExamples(questionType: string, subject: string): FewShotExample[] {
  const type = questionType.toLowerCase();
  // No few-shot examples for History yet — better to calibrate purely by rubric
  // than to inject AO2 examples into an AO3-graded essay.
  if (subject === 'Elective History') return [];

  if (type.includes('comparison') || type.includes('contrast')) return SS_COMPARISON_EXAMPLES;
  if (type.includes('inference') || type.includes('message')) return SS_INFERENCE_EXAMPLES;
  if (type.includes('seq') || type.includes('essay') || type.includes('srq')) return SS_SEQ_EXAMPLES;

  // Default for other skills — use comparison examples since they have the richest structure
  return SS_COMPARISON_EXAMPLES;
}

function formatFewShotSection(examples: FewShotExample[]): string {
  return examples.map((ex, i) => `
### Example ${i + 1}: ${ex.level} Student Response

**Student answer:**
"""
${ex.studentAnswer}
"""

**Correct evaluation:**
- Score: ${ex.scoreEstimate}
- Critique: ${ex.critique.map(c => `"${c}"`).join(', ')}
- Confidence: ${ex.confidence}
- A1 model answer: ${ex.a1Upgrade}
`).join('\n');
}

// ────────────────────────────────────────────────────────────────
//  Public API
// ────────────────────────────────────────────────────────────────

export interface GradePromptInput {
  questionType: string;
  subject: string;
  activeSections: string[];  // ['sbcs', 'seq', 'srq'] — only what was submitted
}

export function getGradeSystemPrompt(input: GradePromptInput): string {
  const { questionType, subject, activeSections } = input;
  const subjectLabel = getSubjectLabel(subject);
  const aos = getAssessmentObjectives(subject);
  const lorms = getLormsMatrix(questionType, subject);
  const examples = getFewShotExamples(questionType, subject);
  const fewShotText = formatFewShotSection(examples);

  const sectionLabels = {
    sbcs: activeSections.includes('sbcs') ? 'SBCS (Source-Based Case Study)' : EMPTY_SECTION_LABEL,
    seq: activeSections.includes('seq') ? 'SEQ (Structured Essay Question)' : EMPTY_SECTION_LABEL,
    srq: activeSections.includes('srq') ? 'SRQ (Structured Response Question)' : EMPTY_SECTION_LABEL,
  };

  return `
You are a strict, senior SEAB Examiner grading Singapore GCE O-Level ${subjectLabel}.
Assessment Objectives assessed: ${aos}

The student submitted the following sections:
- ${sectionLabels.sbcs}
- ${sectionLabels.seq}
- ${sectionLabels.srq}

Only grade the sections the student actually submitted. Ignore any section labelled "[This section was not submitted...]".

## APPLICABLE LORMS RUBRIC

${lorms}

${CHAIN_OF_THOUGHT}

## FEW-SHOT EXAMPLES

Study these examples carefully — they calibrate the standard:

${fewShotText}

${CONFIDENCE_INSTRUCTIONS}

${QUALITY_RULES}

## OUTPUT RULES

1. Evaluate ONLY the rubric that applies to the selected skill track (${questionType}).
2. If the skill track is "All Formats", evaluate each section against its own rubric and provide an overall combined score.
3. The \`critique\` array should contain 3–8 specific, actionable bullet points.
4. The \`a1Upgrade\` should be a complete rewritten answer demonstrating A1 standard.
5. Each \`highlightedSegment\` must include the exact text from the student's answer.
6. Be encouraging, professional, and diagnostic — no generic fluff.
7. If the student wrote less than 20 words total across all submitted sections, flag as "L0 — Insufficient content".
8. Output a \`confidence\` score between 0.0 and 1.0.
`.trim();
}

export function getGradeUserPrompt(params: {
  questionPrompt: string;
  subject: string;
  topic: string;
  questionType: string;
  sbcsAnswer: string;
  seqAnswer: string;
  srqAnswer: string;
}): string {
  const { questionPrompt, subject, topic, questionType, sbcsAnswer, seqAnswer, srqAnswer } = params;

  // Only include sections that were actually written
  const sections: string[] = [];
  if (sbcsAnswer.trim()) sections.push(`SBCS Answer:\n${sbcsAnswer}`);
  if (seqAnswer.trim()) sections.push(`SEQ Answer:\n${seqAnswer}`);
  if (srqAnswer.trim()) sections.push(`SRQ Answer:\n${srqAnswer}`);
  const combinedAnswer = sections.join('\n\n');

  return `
QUESTION PROMPT:
${questionPrompt || '(not provided)'}

SUBJECT: ${subject}
TOPIC: ${topic}
SKILL TRACK: ${questionType}

STUDENT ESSAY (submitted sections only):
"""
${combinedAnswer}
"""

Apply the LORMS rubric strictly using the step-by-step rubric resolution process.
Highlight which segments were correct, which were weak, and which were structural errors.
Produce a clean A1-grade rewrite the student can compare against their own work.
Rate your confidence in this assessment.
  `.trim();
}
