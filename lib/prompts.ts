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

### MANDATORY STEP 0 — QUALITY GATE (MUST run FIRST, before any LORMS check)

Before even looking at the LORMS rubric, check if the student's answer is VALID CONTENT:

**Reject as "Invalid" if ANY of these are true:**
- The answer consists ONLY of numbers, symbols, or special characters (e.g., "123456789", "!!!!!!", "@@@")
- The answer is a single character, word, or letter repeated (e.g., "aaaaaa", "asdfasdf", "testtesttest")
- The answer is gibberish, keyboard mashing, or random characters (e.g., "fjdksla", "qwertyuiop", "xczxv")
- The answer has fewer than 12 meaningful English words AND does not form a coherent sentence related to the question (numbers and symbols don't count as words)
- The answer clearly does not address the question at all (completely off-topic)
- The answer is a direct copy of the question with no original content
- The answer contains no meaningful subject-specific vocabulary or concepts

If the answer fails the quality gate, IMMEDIATELY set:
- scoreLevel: "L0"
- scoreMarks: 0
- scoreMaxMarks: 0
- scoreLabel: "L0 — Invalid / Nonsensical content"
- pointStatus: "Fail"
- evidenceStatus: "Fail"
- critique: ["Your answer does not contain valid written content for assessment. Please submit a genuine attempt."]
- highlightedSegments: [{"text": [first 50 chars of answer], "type": "error"}]
- a1Upgrade: "[No model answer available — the submitted response was not valid written content.]"
- gradingConfidence: 0.99
- modelAnswerConfidence: 0.99

DO NOT proceed to LORMS evaluation if the quality gate fails. Return the rejection immediately.

### If the answer passes the quality gate, proceed to LORMS rubric resolution:

Step 1 — Determine L1 eligibility: Does the answer make ANY relevant point that connects to the question?
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
## QUALITY REJECTION RULES — STRICT ENFORCEMENT

You MUST apply these rules BEFORE any LORMS evaluation. The quality gate in Step 0 is MANDATORY.

### Explicitly REJECT (score "L0 — Invalid" with 0 marks):
- Numeric-only answers: Any answer consisting entirely of digits (e.g., "123", "987654321")
- Repeated characters: Single letter/number repeated 3+ times (e.g., "aaaa", "!!!!", "......")
- Keyboard patterns: "qwerty", "asdf", "zxcvb", "test" repeated
- Single words submitted as full answer: e.g., "Yes", "No", "Maybe", "Idk", "Good"
- Random letters: Non-word character sequences (e.g., "fjdksl", "xmncvg")
- Internet/chat slang: "lol", "idk", "tbh" without elaboration
- Copy-pasted question: Exactly repeating the question prompt as the answer
- Blank/whitespace-only: Empty or whitespace-only submissions MUST be rejected

### Apply L0 with lower confidence for:
- Under 10 words: Unless those words form a valid analytical sentence, flag as "L0 — Insufficient content"
- Off-topic: Answer that doesn't engage with the question's requirements
- Vague generalities: Answers that could apply to any question (e.g., "It depends on the situation")

### Other rules:
- Only one section submitted while others are empty: Grade ONLY the submitted sections; do not penalize for missing sections.
- If the student clearly attempted the question but wrote very little (< 20 words of actual analysis), assign L1 with a note.

## SEAB-ALIGNED STRUCTURE EXPECTATIONS (research-backed)

### Inference (2 marks): Expect the ISE structure
- I: State the inference (what the source implies/ suggests, not what it literally says)
- S: Support with specific evidence from the source (quote or reference)
- E: Explain how the evidence leads to the inference
- L1 = surface facts only (what source says). L2 = inferred meaning (what source implies).

### Comparison (5 marks): Expect explicit comparison, not separate summaries
- L1–L2 = describes sources separately or identifies similarity OR difference
- L3 = similarity AND difference identified
- L4 = similarity AND difference WITH core message matching from both sources
- Students who write "Source A says... Source B says..." without direct comparison phrases ("whereas", "in contrast", "similarly") should NOT reach L3.

### Purpose (4 marks): Must explain WHY, not just WHAT
- L1 = identifies author/audience
- L2–L3 = identifies purpose with evidence
- L4 = compares purposes and explains difference based on context
- Expect students to discuss: author's intent, target audience, historical/political context

### Reliability (5 marks): Provenance + cross-referencing + typical limitations
- L1 = states reliable/unreliable without justification
- L2 = provenance-only evaluation (author, date, type)
- L3 = cross-referencing with another source (corroboration/contradiction)
- L4 = comprehensive: provenance + cross-ref + typical limitations (bias, exaggeration, omission, propaganda)
- High-scoring students identify SPECIFIC limitations rather than generic "bias"

### Assertion / Synthesis (10 marks): This is the highest-mark question
- L1 = simple agree/disagree without evidence
- L2 = supports position with evidence from ONE source
- L3 = cross-references BOTH/multiple sources
- L4 = evaluates sources' strengths/limitations AND reaches a well-supported final judgment
- Top band: Students must GROUP sources (supporting vs challenging), evaluate reliability of key sources, and reach a BALANCED final conclusion that directly answers the assertion.
- Avoid: Listing sources one by one without synthesis. Students must compare and weigh evidence.

### SRQ Essays (SS only — 7-8 marks): Evidence + Judgment structure expected
- For SRQ (a) 7-mark: Recommendation/Strategy questions
  - Identify the issue and propose what should be done
  - Explain who should do it and why
  - Support with examples/evidence
- For SRQ (b) 8-mark: Evaluation questions
  - State your position clearly
  - Provide evidence/reasons for your position
  - Consider counter-arguments
  - Reach a balanced conclusion
- L1 = Descriptive answer with no clear position
- L2 = One-sided argument with limited evidence
- L3 = Multi-point argument with good evidence
- L4 = Balanced evaluation with counter-arguments and substantiated judgment

### SEQ Essays (History — 8 marks): PEEL structure expected
- P: Point — clear factor/argument stated
- E: Evidence — specific historical/contextual example
- E: Explanation — how/why this factor matters (the "because" chain)
- L: Link — tie back to the question
- L3 = TWO factors explained with evidence each
- L4 = factors EVALUATED and WEIGHED with a substantiated conclusion
- Students who list factors without evaluation should NOT reach L4.
`;

const EMPTY_SECTION_LABEL = '[This section was not submitted by the student — omit from grading.]';

// ────────────────────────────────────────────────────────────────
//  Singapore School Benchmark Standards
// ────────────────────────────────────────────────────────────────

const SCHOOL_BENCHMARK_DATA = `
## SINGAPORE SCHOOL BENCHMARK STANDARDS

When generating model answers and grading responses, calibrate your expectations to these school-level standards.
Use the school name as a reference point when describing the expected quality.

### Tier 1 — Top-Tier Schools (RI, HCI, ACS(I), NJC, VJC)
- Expected standard: L4 for SBQ skills, L3–L4 for SRQ/SEQ by end of Sec 4
- Model answers should demonstrate: sophisticated cross-referencing, nuanced provenance evaluation, mature PEEL structure with counter-arguments
- Inference: Must infer from BOTH sources with sophisticated understanding of author perspective
- Comparison: Must identify similarity AND difference with core message matching + evaluation of WHY perspectives differ
- Reliability: Must include provenance + cross-referencing + typical limitations (bias, omission, propaganda)
- Assertion: Must group sources, evaluate reliability, reach balanced judgment
- SRQ/SEQ: Must evaluate and weigh factors, include counter-arguments, reach substantiated conclusion

### Tier 2 — Mid-Tier Schools (SCGS, Cedar Girls', MGS, St. Nick's, TKGS, Dunman High, St. Joseph's, Catholic High)
- Expected standard: L3 for SBQ skills, L2–L3 for SRQ/SEQ by end of Sec 4
- Model answers should demonstrate: clear structure, good evidence use, some cross-referencing
- Inference: Must infer from BOTH sources with clear message identification
- Comparison: Similarity AND difference identified with content matching
- Reliability: Provenance + content evaluation with some cross-referencing
- Assertion: Cross-reference sources to support position
- SRQ/SEQ: Two or more factors with good evidence, clear PEEL structure

### Tier 3 — Standard Schools
- Expected standard: L2 for SBQ skills, L1–L2 for SRQ/SEQ by end of Sec 4
- Model answers should focus on: clear point identification, basic evidence use, structure
- Inference: Identify surface information from source
- Comparison: Similarity OR difference identified
- Reliability: Basic provenance evaluation
- Assertion: Position stated with evidence from one or two sources
- SRQ/SEQ: One or two factors identified with basic explanation

### Benchmarking Rules for Grading:
1. When providing the \`schoolBenchmark\` field in the response, estimate which Tier this response would correspond to at a top-tier vs mid-tier vs standard school.
2. Be specific about what the student's response would score at each school level.
3. Always include at least one reference in the critique like: "This response would be a solid L3 at a standard school, but would need stronger cross-referencing to reach L3 at a top-tier school like RI or HCI."
4. For the model answer (a1Upgrade), write it at Tier 1 (top-tier school) standard — this gives students something to aim for regardless of their school.
5. Do NOT penalise students for being at a lower-tier school — the benchmark is a diagnostic tool, not a judgment.
`;

// ────────────────────────────────────────────────────────────────
//  LORMS Matrices — Social Studies
// ────────────────────────────────────────────────────────────────

const SS_COMPARISON_LORMS = `
### LORMS MATRIX — SBQ: Comparison & Contrast (AO2) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Describes surface content from sources without meaningful comparison — may state unrelated facts or make simplistic observations. Must contain actual source-relevant content to qualify. | 1 |
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
| L1 | Surface information identified from one source — must reference actual source content, not gibberish. | 1 |
| L2 | Inferred message/purpose identified from BOTH sources — what the source implies or suggests beyond the surface | 2 |

**Key distinction:** L1 repeats what the source says. L2 reads between the lines — the author's message, purpose, or attitude.
`;

const SS_PURPOSE_LORMS = `
### LORMS MATRIX — SBQ: Purpose / Motive Evolution (AO2) — Max 4 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Identifies purpose of ONE source — must reference actual source content, not placeholder text. | 1 |
| L2 | Identifies purpose of BOTH sources independently | 2–3 |
| L3 | Explains HOW or WHY the purpose/motive changed or evolved between the two sources, with evidence from each | 4 |

**Key distinction:** L1–L2 identifies WHAT the purpose is. L3 explains the CHANGE or REASON behind it.
`;

const SS_UTILITY_LORMS = `
### LORMS MATRIX — SBQ: Utility & Reliability Limits (AO2) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | States source is useful / not useful without justification — must reference actual source content, not gibberish. | 1 |
| L2 | Assesses reliability or usefulness based on provenance alone (author, date, type of source) | 2–3 |
| L3 | Evaluates utility by considering BOTH content value AND provenance limitations | 4 |
| L4 | Evaluates utility with cross-referencing — compares what each source reveals AND conceals, with a balanced judgment | 5 |

**Key distinction:** L2 = provenance-only. L3 = content + provenance. L4 = cross-referenced evaluation.
`;

const SS_SYNTHESIS_LORMS = `
### LORMS MATRIX — SBQ: Synthesis / Assertion (AO2) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Simple agreement or disagreement with the assertion — no evidence. Must contain actual argument, not gibberish. | 1 |
| L2 | Supports position using evidence from ONE source | 2–3 |
| L3 | Cross-references BOTH sources to support a nuanced position | 4 |
| L4 | Synthesises with evaluation of source strengths/limitations, reaching a well-supported judgment | 5 |
`;

const SS_SRQ_LORMS = `
### LORMS MATRIX — SRQ: Structured Response Questions (AO1) — Max 7-8 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Descriptive answer — identifies an issue or states facts without explanation. No clear argument or position. Must contain actual subject content to qualify. | 1–2 |
| L2 | One-sided argument — identifies ONE strategy/reason with some supporting evidence. Basic structure with stated position. | 3–4 |
| L3 | Multi-point argument — identifies TWO or more strategies/reasons with good evidence for each. Considers multiple perspectives. Clear structure with position and evidence. | 5–6 |
| L4 | Sophisticated balanced evaluation — weighs multiple strategies/reasons, considers counter-arguments, reaches a substantiated judgment. Demonstrates mature awareness of complexity. | 7–8 |

**Key distinction:** L2 = one-sided (one reason). L3 = multi-factor. L4 = evaluation weighing factors + counter-arguments + conclusion.
`;

const SS_SEQ_LORMS = `
### LORMS MATRIX — SEQ: Structured Essay Questions (AO1) — Max 8 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Descriptive answer — states facts without explanation. No clear structure. Must contain actual subject content to qualify. | 1–2 |
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
| L1 | Describes sources separately — no comparison attempted. Must reference actual historical content. | 1 |
| L2 | Similarity OR Difference identified based on content | 2–3 |
| L3 | Similarity AND Difference identified based on content AND provenance | 4 |
| L4 | Similarity AND Difference with evaluation — explains WHY sources differ (different perspectives, contexts, purposes) | 5 |
`;

const HIST_INFERENCE_LORMS = `
### LORMS MATRIX — SBQ: Inference / Message (AO3) — Max 2 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Surface information from source — factual recall. Must reference actual source content, not gibberish. | 1 |
| L2 | Inferred meaning — what the source reveals about the historical context, author's perspective, or underlying message | 2 |
`;

const HIST_RELIABILITY_LORMS = `
### LORMS MATRIX — SBQ: Reliability & Cross-Referencing (AO3) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | States source is reliable/unreliable without justification. Must reference actual source content. | 1 |
| L2 | Assesses reliability based on provenance — author, date, type, motive | 2–3 |
| L3 | Assesses reliability by cross-referencing content with another source — corroboration or contradiction | 4 |
| L4 | Comprehensive reliability evaluation — provenance + cross-referencing + considers typical limitations (bias, exaggeration, omission) | 5 |
`;

const HIST_UTILITY_LORMS = `
### LORMS MATRIX — SBQ: Evaluation of Utility (AO3) — Max 5 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | States source is useful/not useful — no reasoning. Must reference actual source content. | 1 |
| L2 | Assesses utility for a specific purpose based on content | 2–3 |
| L3 | Evaluates utility considering BOTH content value AND provenance limitations | 4 |
| L4 | Nuanced utility judgment — what the source reveals for ONE inquiry AND conceals for ANOTHER, with a final balanced assessment | 5 |
`;

const HIST_PURPOSE_LORMS = `
### LORMS MATRIX — SBQ: Target Purpose Analysis (AO3) — Max 4 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Identifies author or audience of ONE source. Must reference actual source content. | 1 |
| L2 | Identifies purpose of ONE source with evidence | 2 |
| L3 | Identifies purpose of BOTH sources with evidence | 3 |
| L4 | Compares purposes — explains why each author had a different purpose based on their historical context | 4 |
`;

const HIST_SEQ_LORMS = `
### LORMS MATRIX — SEQ: Factor Prioritization (AO1/AO2) — Max 8 marks

| Level | Descriptor | Marks |
|-------|------------|-------|
| L1 | Mentions factors without explanation — narrative/descriptive. Must contain actual historical content. | 1–2 |
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

const INVALID_CONTENT_EXAMPLES: FewShotExample[] = [
  {
    level: 'L0',
    studentAnswer: '123456789',
    scoreEstimate: 'L0 — Invalid: numeric-only content (not a valid written response)',
    critique: [
      'Your submission consists entirely of numbers, which is not a valid written answer.',
      'A genuine O-Level response should contain sentences with subject-specific analysis and evidence.',
      'Please write a proper answer addressing the question prompt.',
    ],
    confidence: 0.99,
    a1Upgrade: 'No model answer can be provided because the submitted content is not a valid written response.',
  },
  {
    level: 'L0',
    studentAnswer: 'asdfghjkl',
    scoreEstimate: 'L0 — Invalid: keyboard gibberish (not a valid written response)',
    critique: [
      'Your submission is keyboard gibberish, not a valid written answer.',
      'A genuine attempt must contain coherent sentences relevant to the question.',
      'Please submit a proper analytical response.',
    ],
    confidence: 0.99,
    a1Upgrade: 'No model answer available — the submitted response was not valid written content.',
  },
  {
    level: 'L0',
    studentAnswer: 'test test test test test',
    scoreEstimate: 'L0 — Invalid: repeated placeholder content (not a genuine attempt)',
    critique: [
      'Your submission consists of a repeated placeholder word, not a genuine analytical response.',
      'A proper answer should demonstrate understanding of the subject matter and address the question.',
      'Please write a thoughtful response based on the sources and your knowledge.',
    ],
    confidence: 0.99,
    a1Upgrade: 'No model answer available — the submitted response was not a genuine attempt.',
  },
];

const SS_SRQ_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer: 'The government should provide more financial support to low-income families. This is because they are struggling with the high cost of living in Singapore.',
    scoreEstimate: 'L2 / 4 marks — One strategy identified with basic supporting reason',
    critique: [
      'You identified ONE strategy (financial support for low-income families) — this meets the minimum for L2.',
      'Your explanation is clear but very general — it lacks specific evidence or examples.',
      'To reach L3, add a SECOND strategy (e.g., skills training, public housing subsidies) and use concrete examples.',
      'For SRQ (a), discuss WHO should implement the strategy and WHY it is appropriate.',
      'For SRQ (b), consider counter-arguments and evaluate the effectiveness of your proposed approach.',
    ],
    confidence: 0.80,
    a1Upgrade: 'SRQ (a) — Recommendation: The government should expand the Community Care Endowment Fund (ComCare) to provide more targeted financial assistance to low-income families, while simultaneously investing in SkillsFuture credits to help these families gain sustainable employment. This two-pronged approach addresses both immediate financial needs and long-term self-sufficiency. SRQ (b) — Evaluation: While financial assistance provides immediate relief, it risks creating dependency if not paired with upskilling opportunities. Therefore, the most effective approach combines short-term aid with long-term capacity building — a balanced strategy that addresses root causes rather than symptoms.',
  },
  {
    level: 'L4',
    studentAnswer: 'Singapore can address its ageing population challenge through three key strategies: redesigning the retirement framework, expanding healthcare infrastructure, and fostering intergenerational community bonds. Firstly, raising the re-employment age from 67 to 70 would allow seniors to remain economically active and financially independent — as seen in Japan, where extended workforce participation has mitigated pension shortfalls. Secondly, expanding the Community Health Assist Scheme (CHAS) to cover more chronic conditions would reduce the healthcare burden on seniors, particularly lower-income ones who currently avoid treatment due to cost. However, these strategies face challenges — employers may resist hiring older workers due to productivity concerns, and healthcare expansion requires significant government funding. Therefore, while all three strategies are necessary, the retirement framework reform is the most impactful as it addresses both economic and social dimensions simultaneously.',
    scoreEstimate: 'L4 / 8 marks — Balanced evaluation with multiple strategies, evidence, counter-arguments, and substantiated prioritisation',
    critique: [
      'Excellent — you identified THREE distinct strategies with specific evidence.',
      'Strong use of comparative example (Japan) to support your argument.',
      'You acknowledged limitations/counter-arguments (employer resistance, funding constraints).',
      'The concluding judgment prioritises which strategy is most impactful.',
      'This is a textbook L4 SRQ response demonstrating mature evaluative thinking.',
      'PEEL structure is evident throughout each paragraph.',
    ],
    confidence: 0.94,
    a1Upgrade: 'Singapore\'s ageing population requires a multi-pronged approach spanning economic, healthcare, and social dimensions. The most impactful strategy is raising the re-employment age to 70 — this preserves seniors\' financial independence, reduces dependency on state welfare, and leverages their accumulated expertise. Japan\'s experience demonstrates that extended workforce participation can mitigate pension pressure while maintaining economic productivity. However, this must be paired with expanded healthcare access through enhanced CHAS subsidies for chronic conditions, addressing the reality that older workers need healthy bodies to remain employable. The key challenge — employer reluctance to retain older workers — can be addressed through wage offsets and productivity grants. Ultimately, financial independence through extended employment is the most sustainable solution, as it preserves dignity and autonomy while reducing long-term state burden.',
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
//  Few-Shot Examples — Elective History (AO3)
// ────────────────────────────────────────────────────────────────

const HIST_COMPARISON_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer:
      'Source A talks about Hitler being appointed Chancellor in 1933. Source B describes the Enabling Act being passed. Both sources are about how Hitler consolidated power.',
    scoreEstimate:
      'L2 / 3 marks — Similarity identified (both about Hitler\'s consolidation of power) but based on content alone, no provenance comparison',
    critique: [
      'You identified a similarity — both sources relate to how Hitler gained control. This meets L2 for content-based comparison.',
      'However, you treated the sources as independent summaries rather than comparing them directly.',
      'To reach L3, you need to compare BOTH content AND provenance (author, date, type).',
      'To reach L4, explain WHY the sources differ — one may be a Nazi account, the other a foreign journalist\'s perspective.',
    ],
    confidence: 0.88,
    a1Upgrade:
      'Point: Both Source A and Source B concern the mechanisms by which Hitler consolidated power in 1933–34, but they differ in focus. Evidence: Source A, a Nazi propaganda pamphlet from 1934, presents the Chancellorship appointment as "the will of the German people." Source B, a British historian\'s account written in 1960, describes the Enabling Act as a "constitutional coup d\'état." Explanation: Source A portrays the events as legitimate and popularly supported, reflecting its Nazi provenance and propagandistic purpose. Source B, written retrospectively with the benefit of hindsight and by a foreign observer, frames the same period as an illegal seizure of power. Link: Therefore, while both sources address Hitler\'s consolidation of power, they differ fundamentally in interpretation — a difference driven by the authors\' contrasting national contexts, audiences, and purposes.',
  },
  {
    level: 'L4',
    studentAnswer:
      'Both sources address the origins of the Cold War but from opposing perspectives. Source A, a Soviet diplomat\'s memoir from 1965, blames the US for starting the Cold War through aggressive economic expansion — specifically the Truman Doctrine and Marshall Plan. Source B, a US State Department memo from 1947, justifies these same policies as defensive responses to Soviet expansionism in Eastern Europe. The difference is not just in content but in provenance: a Soviet memoir defending Soviet actions vs a US government document justifying American policy. This tells me that Cold War origins are contested precisely because each side had a vested interest in portraying itself as the victim and the other as the aggressor.',
    scoreEstimate:
      'L4 / 5 marks — Similarity AND Difference identified with content + provenance evaluation explaining WHY sources differ',
    critique: [
      'Clear similarity identified — both address Cold War origins.',
      'Strong difference identified — US blame vs US defence.',
      'Excellent provenance analysis — you connected the authors\' national contexts to their perspectives.',
      'Precise evidence from both sources supports your points.',
      'The final evaluative sentence explains WHY the difference matters for historical interpretation.',
      'This is a textbook L4 response for History AO3.',
    ],
    confidence: 0.96,
    a1Upgrade:
      'Point: Both Source A and Source B address the origins of the Cold War, but they present diametrically opposed explanations rooted in their authors\' national and institutional perspectives. Evidence: Source A, a Soviet diplomat\'s memoir (1965), characterises the Truman Doctrine and Marshall Plan as "economic imperialism" designed to "encircle the USSR." Source B, a US State Department memo (1947), describes these same policies as "defensive measures" against "Soviet subjugation of Eastern Europe." Explanation: The contrast stems from provenance — Source A reflects the Soviet narrative of aggressive American capitalism, written for a domestic audience to justify Soviet foreign policy. Source B is an internal government document that naturally frames its own actions as reactive and justified, which was necessary to secure Congressional approval. Link: This difference is historically significant because it demonstrates that Cold War origins are inherently contested — each superpower constructed a self-serving narrative. A historian must therefore evaluate both sources critically rather than accepting either at face value.',
  },
];

const HIST_INFERENCE_EXAMPLES: FewShotExample[] = [
  {
    level: 'L1',
    studentAnswer:
      'Source A says that Japan invaded Manchuria in 1931 and established a puppet state called Manchukuo.',
    scoreEstimate:
      'L1 / 1 mark — Surface information from one source — factual recall only',
    critique: [
      'You correctly identified a factual detail from Source A — the invasion and establishment of Manchukuo.',
      'This is surface-level recall. L1 is appropriate for stating what the source literally says.',
      'To reach L2, you need to INFER what this reveals about Japanese motives, attitudes, or the historical context.',
      'For example: Japan\'s establishment of a "puppet state" implies a deliberate strategy of expansionism disguised as liberation.',
      'Also attempt inference from BOTH sources, not just one.',
    ],
    confidence: 0.90,
    a1Upgrade:
      'Surface level: Source A states that "Japan invaded Manchuria in 1931 and established the puppet state of Manchukuo." Inferred message: The invasion implies that Japan was pursuing a deliberate policy of territorial expansion to secure natural resources (coal, iron) and strategic territory, driven by military nationalism. The creation of a "puppet state" rather than outright annexation suggests Japan sought to legitimise its conquest through a façade of local self-governance, revealing a calculated strategy to avoid international condemnation while still achieving imperial goals.',
  },
  {
    level: 'L2',
    studentAnswer:
      'Source A is a Japanese government statement from 1932 claiming that the invasion of Manchuria was to "protect Japanese economic interests and bring stability to the region." Source B is a League of Nations report from 1933 that calls the invasion an "act of unprovoked aggression." The difference in language between these two sources implies a fundamental clash in how Japan and the international community viewed Japan\'s actions in Manchuria. Source A implies Japan saw itself as a stabilising force in Asia, while Source B implies the international community saw Japan as a rogue imperial power. This tells me that Japan was trying to legitimise expansionism through the language of protection and stability.',
    scoreEstimate:
      'L2 / 2 marks — Inferred message from BOTH sources revealing the underlying clash in perspectives',
    critique: [
      'Excellent — you went beyond what each source LITERALLY says to infer the underlying message and attitude.',
      'You correctly identified Source A\'s implied message: Japan as a stabilising force.',
      'You correctly identified Source B\'s implied message: Japan as a rogue imperial power.',
      'By using BOTH sources, you demonstrated the skill of reaching an inference through comparison of perspectives.',
      'The final sentence synthesises the inferences into a coherent conclusion about Japan\'s strategic intent.',
    ],
    confidence: 0.92,
    a1Upgrade:
      'Surface level: Source A, a Japanese government statement (1932), claims the invasion was to "protect Japanese economic interests and bring stability." Source B, a League of Nations report (1933), calls it "an act of unprovoked aggression." Inferred message: The sharp contrast in language reveals two competing narratives. Source A infers that Japan sought to portray itself as a responsible regional power intervening to restore order — a justification that masks expansionist ambition behind a veneer of benevolence. Source B infers that the international community regarded Japan\'s actions as illegitimate and threatening to global peace. Taken together, the sources reveal that Japan\'s imperial expansion was strategically framed as defensive and constructive, precisely because the alternative narrative — naked aggression — would have isolated Japan diplomatically. This tells us that Japan was acutely aware of international opinion but was willing to risk condemnation to pursue its imperial objectives in Manchuria.',
  },
];

const SS_PURPOSE_EXAMPLES: FewShotExample[] = [
  {
    level: 'L1',
    studentAnswer:
      'Source A was written by the government to inform people about the new policy.',
    scoreEstimate: 'L1 / 1 mark — Identifies purpose of ONE source at a surface level',
    critique: [
      'You correctly identified the author of Source A and its basic purpose — to inform.',
      'This meets L1 criteria, but you need to go deeper.',
      'To reach L2, identify the purpose of BOTH sources, not just one.',
      'To reach L3, explain HOW or WHY the purpose changed or differed between sources.',
      'Consider: was Source A meant to persuade or justify, rather than simply inform?',
    ],
    confidence: 0.82,
    a1Upgrade:
      'Source A: The government press release frames housing policy as a "comprehensive plan to benefit all Singaporeans" — its purpose is to project competence and secure public approval for the policy. Source B: The editorial criticises the policy as "widening inequality" — its purpose is to hold the government accountable and advocate for more inclusive policymaking. The shift in purpose from government self-promotion to independent critique reveals the tension between official narratives and civil society oversight in Singapore\'s governance model.',
  },
];

const SS_UTILITY_EXAMPLES: FewShotExample[] = [
  {
    level: 'L3',
    studentAnswer:
      'Source A is useful for understanding the government\'s official position on housing policy, because it directly states their plans and justifications. However, its utility is limited by the fact that it is a government source with a natural bias towards presenting policies positively. Source B is useful for understanding the criticisms of the policy, as an independent editorial. Together, they give a balanced view, but neither alone is sufficient.',
    scoreEstimate:
      'L3 / 4 marks — Evaluates utility by considering BOTH content value AND provenance limitations',
    critique: [
      'You correctly identified what each source is useful for (content value).',
      'You also identified limitations (provenance bias). This meets L3.',
      'To reach L4, cross-reference the sources — what does Source A reveal that Source B conceals, and vice versa?',
      'A final evaluative judgment on which source is more useful overall would strengthen your answer.',
    ],
    confidence: 0.85,
    a1Upgrade:
      'Source A, a government press release, is highly useful for understanding the official framing of housing policy — it reveals what the government wants the public to believe about its intentions. However, its utility for assessing actual policy outcomes is limited by its promotional purpose. Source B, an editorial, reveals the gap between policy promises and on-the-ground reality, but its utility is limited by potential editorial bias. Cross-referencing: Source A reveals the government\'s confident projections; Source B reveals the implementation failures those projections omit. Together, they are more useful than either alone — Source A tells us the intention, Source B tells us the reception. Final judgment: For a historian assessing policy effectiveness, Source B is more useful because it provides independent evidence of outcomes, though Source A is essential context.',
  },
];

const SS_SYNTHESIS_EXAMPLES: FewShotExample[] = [
  {
    level: 'L3',
    studentAnswer:
      'I agree with the assertion that the government\'s business support policy was generally effective. Source A supports this by showing the government provided substantial grants for digitalisation. Source B also supports this, but critically — it shows the policy was effective for some businesses but not for traditional hawkers. So the policy was effective but unevenly distributed.',
    scoreEstimate:
      'L3 / 4 marks — Cross-references BOTH sources to support a nuanced position',
    critique: [
      'You clearly stated your position (agree, with nuance).',
      'You cross-referenced both sources to support your argument — this meets L3.',
      'To reach L4, add evaluation of the source strengths and limitations.',
      'Also consider counter-arguments: what would someone who disagrees with you say?',
    ],
    confidence: 0.83,
    a1Upgrade:
      'Assertion: The government\'s business support policy was partially effective. Source A supports this view — the government committed substantial funding to digitalisation grants, demonstrating proactive support. However, as a government source, it naturally omits implementation challenges. Source B provides crucial counter-evidence: it reveals that traditional hawkers lacked the digital literacy to benefit, suggesting the policy was effective only for tech-ready firms. Cross-referencing both sources, the evidence suggests the policy achieved its goals for a subset of businesses but failed to reach those most in need. Therefore, while I agree the policy had merit, I argue it was incompletely effective — success was concentrated among those already equipped to benefit, widening rather than narrowing the digital divide.',
  },
];

const HIST_SEQ_EXAMPLES: FewShotExample[] = [
  {
    level: 'L3',
    studentAnswer:
      'Two key factors led to the outbreak of World War II: the Treaty of Versailles and the policy of appeasement. The Treaty of Versailles imposed harsh penalties on Germany after WWI, including massive reparations and territorial losses. This created deep resentment in Germany, which Hitler exploited to gain support. The policy of appeasement allowed Hitler to remilitarise the Rhineland and annex Austria and Czechoslovakia without resistance, emboldening him to invade Poland. Both factors created conditions for war — Versailles created the motive, appeasement created the opportunity.',
    scoreEstimate:
      'L3 / 6 marks — Explains TWO or MORE factors with specific historical evidence for each',
    critique: [
      'You identified TWO factors (Treaty of Versailles and appeasement) — this meets L3.',
      'Specific evidence provided for each: reparations, Rhineland, Austria, Czechoslovakia, Poland.',
      'Clear PEEL structure with Point, Evidence, Explanation, Link.',
      'To reach L4, evaluate which factor was MORE significant and justify your prioritisation.',
      'A concluding judgment weighing the relative importance of each factor would elevate this to L4.',
    ],
    confidence: 0.87,
    a1Upgrade:
      'Point: The outbreak of World War II was caused by a combination of structural and diplomatic factors, of which the Treaty of Versailles was the most significant. Evidence: The Treaty imposed reparations of 132 billion gold marks, stripped Germany of its colonies, and limited its army to 100,000 men, creating widespread humiliation and economic hardship. Explanation: This resentment created fertile ground for Hitler\'s nationalist rhetoric and allowed the Nazi Party to gain popular support by promising to undo the Treaty\'s injustices — without Versailles, Hitler would have lacked his most powerful rallying cry. Factor 2 — Appeasement: Britain and France\'s policy of conceding to Hitler\'s demands (Rhineland 1936, Austria 1938, Czechoslovakia 1938–39) emboldened Germany to pursue further expansion. However, appeasement was itself a response to the perceived unfairness of Versailles. Link: Therefore, while both factors were necessary, the Treaty of Versailles was the deeper, structural cause — it created the conditions that made both Hitler\'s rise and appeasement possible. Without Versailles, the pathway to war would have been fundamentally different.',
  },
];

const HIST_RELIABILITY_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer:
      'Source B is a speech by Winston Churchill in 1946, so it is reliable because he was a famous leader who knew what he was talking about.',
    scoreEstimate:
      'L2 / 3 marks — Assesses reliability based on provenance but without critical nuance',
    critique: [
      'You correctly identified the author (Churchill) and date (1946) — this is provenance-based assessment, meeting L2.',
      'However, you assumed that being a "famous leader" automatically makes a source reliable. Famous leaders often have strong biases.',
      'To reach L3, cross-reference the content with another source — does what Churchill says align with or contradict other evidence?',
      'To reach L4, consider specific limitations: Churchill was a Cold War critic of the USSR with a political agenda in 1946 (the "Iron Curtain" speech).',
    ],
    confidence: 0.85,
    a1Upgrade:
      'Provenance: Source B is an excerpt from Churchill\'s 1946 "Iron Curtain" speech in Fulton, Missouri — a public address delivered in the presence of US President Truman. Reliability assessment: Churchill was a well-informed former Prime Minister, which lends the source credibility in terms of access to information. However, the source\'s reliability is significantly limited by purpose — Churchill was actively advocating for a stronger Anglo-American alliance against the USSR, making it likely he exaggerated the Soviet threat. The speech was also public and intended for a Western audience, so Churchill would have framed his words to persuade rather than to inform neutrally. Therefore, while the source is useful for understanding Western perceptions of the USSR in 1946, it cannot be taken as a reliable account of Soviet intentions themselves.',
  },
  {
    level: 'L4',
    studentAnswer:
      'Source C is a Nazi propaganda poster from 1936 depicting Hitler as a protector of German families. The provenance is immediately suspect — it was produced by the Nazi Propaganda Ministry under Goebbels, whose sole purpose was to cultivate the Hitler myth. When cross-referenced with Source D, a private diary from a German factory worker in 1936 describing food shortages and fear of the Gestapo, the contradiction is stark. The poster shows happy families protected by Hitler; the diary reveals a population living in fear and economic hardship. The poster cannot be considered a reliable source for understanding German living conditions — it was designed to manufacture consent, not to report reality. However, it IS reliable as evidence of how the Nazi regime wanted to be perceived.',
    scoreEstimate:
      'L4 / 5 marks — Comprehensive reliability evaluation with provenance + cross-referencing + nuanced final judgment',
    critique: [
      'Excellent provenance analysis — recognised Propaganda Ministry purpose.',
      'Strong cross-referencing with Source D — the diary contradicts the poster\'s narrative.',
      'Identified a TYPICAL limitation (propaganda manufacturing consent) rather than just stating bias.',
      'Nuanced final judgment — poster is unreliable for conditions but reliable for regime perception.',
      'This is a sophisticated L4 response showing the multi-layered thinking required for top marks.',
    ],
    confidence: 0.94,
    a1Upgrade:
      'Provenance: Source C is a Nazi propaganda poster (1936) produced by Goebbels\' Propaganda Ministry. Nature: Visual propaganda designed for public display. Cross-referencing: Source D, a private diary from the same year, describes food shortages and Gestapo intimidation — directly contradicting the poster\'s image of security and prosperity. Reliability evaluation: The poster\'s provenance makes it unreliable as evidence of actual living conditions in Nazi Germany, because its institutional purpose was to manufacture a favourable image of the regime, not to report facts. The diary, written privately with no intention of publication, is far more reliable for understanding lived experience. However, the poster IS highly reliable as evidence of the regime\'s propaganda techniques and the image it sought to project. Final judgment: Source C is reliable only if used to answer a question about Nazi propaganda methods, not if used to assess living conditions under Hitler.',
  },
];

// ────────────────────────────────────────────────────────────────
//  Generation Prompts (skill-track-aware question authoring)
// ────────────────────────────────────────────────────────────────

const ALL_FORMATS_INSTRUCTIONS = `
## ALL FORMATS MODE — COMPLETE O-LEVEL EXAM PACKAGE (MANDATORY)

When the target skill track is "All Formats", you MUST produce a COMPLETE, full-length O-Level examination stimulus package. This is NOT a single-skill exercise. You must generate ALL components described below.

============================================
=== OVERALL CONTEXT ===
============================================

Start with a short "backgroundContext" paragraph (3-5 sentences) that sets the scene for the case study. This should introduce the issue, event, or theme that all sources relate to. This is NOT one of the sources — it is the contextual framing for the entire question package.

For Social Studies: Choose a scenario related to one of the three issues (Citizenship & Governance, Diverse Society, Globalised World).
For History: Choose a scenario related to the selected case study topic.

============================================
=== SECTION A: SOURCES (Generate exactly 5) ===
============================================

Generate exactly 5 sources (numbered Source 1 through Source 5), each with:
- A distinct, realistic provenance (date, author, publication/context — be specific)
- Substantive content (at least 60 characters each)
- Different source types: e.g., speech extract, newspaper article, interview transcript, government report, cartoon/poster description, diary entry, statistical table
- Different perspectives: some sources should support a particular view, some should oppose or complicate it, and some should be neutral
- Provenance should vary enough that reliability and purpose can be meaningfully assessed

=====================================================
=== SECTION B: QUESTIONS — Part (a) to Part (e) ===
=====================================================

Generate exactly 5 sub-questions labelled Part (a) through Part (e). Each must test a DIFFERENT source-based skill:

- **Part (a) — INFERENCE / MESSAGE (2 marks):** Ask what can be inferred from one or two specific sources. The answer requires reading BETWEEN the lines, not just lifting surface facts. Use phrasing like "What can you infer from Source X about...?" or "What message does Source X convey about...?"

- **Part (b) — COMPARISON (5 marks):** Ask how two specific sources compare — similarity AND/OR difference. Use phrasing like "How does Source X differ from Source Y in its view of...?" or "To what extent do Sources X and Y agree about...?"

- **Part (c) — PURPOSE (4 marks):** Ask about the purpose, motive, or intended effect of one or two sources. Use phrasing like "What is the purpose of Source X? Explain your answer." or "Why did the author of Source X produce this source?"

- **Part (d) — RELIABILITY (5 marks):** Ask about reliability, utility, or trustworthiness of one or two sources, considering provenance, content, cross-referencing. Use phrasing like "How reliable is Source X as evidence of...?" or "Assess the usefulness of Source X for understanding..."

- **Part (e) — ASSERTION / SYNTHESIS (10 marks):** Ask students to evaluate a given assertion using ALL sources. This is the highest-mark question. Use phrasing like "Study all sources. To what extent do these sources support the assertion that...?" or "Using all sources, evaluate the claim that..." The question should demand a balanced, cross-referenced argument.

Mark allocation for Part A-E: (a) Inference = 2 marks, (b) Comparison = 5 marks, (c) Purpose = 4 marks, (d) Reliability = 5 marks, (e) Assertion = 10 marks. Match your difficulty level accordingly.

Each question should reference specific source numbers (e.g., "Source 1", "Sources 3 and 4", "all sources") so the student knows which sources to use.

IMPORTANT: Do NOT write the actual answer text in the question prompt. The question should be a question, not an answer.

===========================================
=== SUBJECT-SPECIFIC SECTIONS (if applicable) ===
===========================================

### For Social Studies ONLY (after the 5 SBQ questions):
Provide a separate SRQ (Structured Response Question) section for Section B of the Social Studies paper. This section MUST include:
1. A short **background context paragraph** (2-3 sentences introducing a scenario or issue related to the topic)
2. **SRQ Question (a)** — A 7-mark "recommendation/strategy" question asking what should be done, by whom, and why (e.g., "What can be done to address...?" or "How effective are current strategies in...?")
3. **SRQ Question (b)** — An 8-mark "evaluation" question asking students to weigh factors, make a judgment, or evaluate a statement (e.g., "To what extent is...?" or "Evaluate the view that...")

### For Elective History ONLY (after the 5 SBQ questions):
Provide 3 separate SEQ (Structured Essay Question) essay prompts as Section B of the History paper. Each must:
- Be a pure essay question (no stimulus materials — tests content knowledge)
- Require explanation, analysis, and evaluation of historical events/themes
- Be answerable in a structured essay (PEEL format, factor-based)

**Differentiation rule:** If the topic is "Any Topic (Random Mix)", the 3 SEQ questions must be on THREE DIFFERENT topics/case studies. If a specific topic is selected (e.g., "Nazi Germany"), all 3 questions should be on the SAME topic but test different skills or aspects.

- SEQ Question 1: Focus on **explanation of causes/consequences** (e.g., "Explain why..." or "What were the causes of...?")
- SEQ Question 2: Focus on **evaluation of significance/impact** (e.g., "How significant was...?" or "Assess the impact of...")
- SEQ Question 3: Focus on **comparison or judgment** (e.g., "To what extent was X more important than Y?" or "Which factor was the most important in...?")

===========================================
=== SUGGESTED ANSWER / MODEL ANSWER ===
===========================================

Provide a comprehensive A1-grade suggested answer that covers:
- For Part A-E: A complete model response for each question, written at L4/L5 standard (top band), demonstrating correct structure (ISE for inference, explicit comparison for comparison, purpose + evidence for purpose, provenance + cross-ref for reliability, balanced synthesis for assertion)
- For SRQ (SS only): Full model answers for both SRQ (a) and (b) at top band standard
- For SEQ (History only): Full model answers for all 3 SEQ questions at L4 standard
`;

const GENERATION_SOURCE_RULES: Record<string, string> = {
  comparison:
    'Sources must have clear SIMILARITIES AND DIFFERENCES in content. Provenance should differ enough that a student can reach L4 by explaining WHY the perspectives differ.',
  inference:
    'Sources must carry an IMPLIED MESSAGE or attitude beyond the surface facts. The author\'s perspective should be detectable through word choice, tone, or selective emphasis rather than stated outright.',
  reliability:
    'Provenance is critical here. Sources should have SUSPICIOUS provenance that affects their reliability — biased authors, propagandistic purposes, conflicting dates, or institutional motivations. Make the provenance obviously relevant to reliability assessment.',
  purpose:
    'Sources should have clear, contrasting PURPOSES. Each source should serve a different authorial goal (persuade, justify, criticise, celebrate) that students can identify and explain.',
  utility:
    'Sources should be useful for SOME historical inquiries but limited for OTHERS. The content and provenance should create a clear utility trade-off that students can evaluate.',
  seq:
    'The question prompt should ask students to explain or evaluate MULTIPLE FACTORS. Sources are less important than a well-structured essay prompt that requires PEEL structure.',
};

function getGenerationSourceRules(questionType: string): string {
  const type = questionType.toLowerCase();
  if (type.includes('comparison') || type.includes('contrast')) return GENERATION_SOURCE_RULES.comparison;
  if (type.includes('inference') || type.includes('message')) return GENERATION_SOURCE_RULES.inference;
  if (type.includes('reliability') || type.includes('cross-ref')) return GENERATION_SOURCE_RULES.reliability;
  if (type.includes('purpose') || type.includes('target') || type.includes('motive')) return GENERATION_SOURCE_RULES.purpose;
  if (type.includes('utility')) return GENERATION_SOURCE_RULES.utility;
  if (type.includes('seq') || type.includes('essay') || type.includes('factor')) return GENERATION_SOURCE_RULES.seq;
  // All Formats — include the full exam package instructions
  return ALL_FORMATS_INSTRUCTIONS;
}

export function getGenerateSystemPrompt(subject: string, topic: string, questionType: string): string {
  const sourceRules = getGenerationSourceRules(questionType);
  const aos = getAssessmentObjectives(subject);

  return `
You are a senior SEAB examiner authoring authentic Singapore GCE O-Level
${subject} examination stimulus material.

Assessment Objectives: ${aos}

Topic: ${topic}
Target Skill Track: ${questionType}

Produce a complete exam stimulus package: background context, two distinct
provenance-stamped sources with substantive content, and a unified question
prompt with per-section sub-prompts (SBCS, SEQ, SRQ).

## SKILL-SPECIFIC SOURCE REQUIREMENTS

${sourceRules}

## STRICT RULES
- Use real-sounding provenance (date, author, publication). Be specific.
- Sources must be substantively different — not just the same information rephrased.
- Do not include markdown formatting — plain text only.
- Match the register and tone of SEAB-produced materials (formal, neutral, precise).
- The suggested answer should demonstrate A1 standard for the selected skill track.
- If the skill track is SBQ-only (e.g., Comparison, Inference, Reliability), leave SEQ and SRQ
  prompts as "Optional: Section deactivated for focused skill strategy simulation."
- If the skill track is SRQ-only, generate ALL 5 sources + SBQ questions Part (a)-(e) BUT the focus should be on SRQ — ensure the SRQ section is particularly detailed with nuanced, evaluative prompts.
- If the skill track is SEQ-only (History), generate the 3 SEQ essay prompts with the stimulus context but the main focus is the essay prompts.

## SCHOOL BENCHMARKING

${SCHOOL_BENCHMARK_DATA}

Calibrate ALL model answers to Tier 1 (top-tier school) standard — RI, HCI, ACS(I), NJC, VJC level.
The suggested answer should reflect the depth, sophistication, and evaluative thinking expected at these schools.
`.trim();
}

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
  if (type.includes('srq') && !type.includes('seq')) return SS_SRQ_LORMS;
  if (type.includes('seq') || type.includes('essay')) return SS_SEQ_LORMS;
  // All Formats — return all SS rubrics (SRQ + SEQ)
  return [SS_COMPARISON_LORMS, SS_INFERENCE_LORMS, SS_PURPOSE_LORMS, SS_UTILITY_LORMS, SS_SYNTHESIS_LORMS, SS_SRQ_LORMS, SS_SEQ_LORMS].join('\n');
}

function getFewShotExamples(questionType: string, subject: string): FewShotExample[] {
  const type = questionType.toLowerCase();

  // Always prepend invalid content examples so the model learns to reject gibberish first
  const invalidExamples = INVALID_CONTENT_EXAMPLES;

  let skillExamples: FewShotExample[];

  if (subject === 'Elective History') {
    if (type.includes('comparison') || type.includes('contrast')) skillExamples = HIST_COMPARISON_EXAMPLES;
    else if (type.includes('inference') || type.includes('message')) skillExamples = HIST_INFERENCE_EXAMPLES;
    else if (type.includes('reliability') || type.includes('cross-ref')) skillExamples = HIST_RELIABILITY_EXAMPLES;
    else if (type.includes('seq') || type.includes('essay') || type.includes('factor')) skillExamples = HIST_SEQ_EXAMPLES;
    else skillExamples = HIST_COMPARISON_EXAMPLES;
  } else {
    if (type.includes('comparison') || type.includes('contrast')) skillExamples = SS_COMPARISON_EXAMPLES;
    else if (type.includes('inference') || type.includes('message')) skillExamples = SS_INFERENCE_EXAMPLES;
    else if (type.includes('purpose') || type.includes('motive')) skillExamples = SS_PURPOSE_EXAMPLES;
    else if (type.includes('utility') || type.includes('reliability')) skillExamples = SS_UTILITY_EXAMPLES;
    else if (type.includes('synthesis') || type.includes('assertion') || type.includes('matrix')) skillExamples = SS_SYNTHESIS_EXAMPLES;
    else if (type.includes('srq') && !type.includes('seq')) skillExamples = SS_SRQ_EXAMPLES;
    else if (type.includes('seq') || type.includes('essay')) skillExamples = SS_SEQ_EXAMPLES;
    else skillExamples = SS_COMPARISON_EXAMPLES;
  }

  // Return invalid examples first, then skill-specific examples
  return [...invalidExamples, ...skillExamples];
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

0. **YOU MUST RUN THE QUALITY GATE (Step 0 in RUBRIC RESOLUTION) FIRST.** If the answer is invalid, return the rejection immediately and skip all following rules.
1. Evaluate ONLY the rubric that applies to the selected skill track (${questionType}).
2. If the skill track is "All Formats", evaluate each section against its own rubric AND provide an overall combined score. Output sbcsScore, seqScore, and srqScore with each section's level, marks, maxMarks, and a brief label.
3. The \`critique\` array should contain 3–8 specific, actionable bullet points.
4. The \`a1Upgrade\` should be a complete rewritten answer demonstrating A1 standard.
5. Each \`highlightedSegment\` must include the exact text from the student's answer.
6. Be encouraging, professional, and diagnostic — no generic fluff.
7. Under 12 words of actual content → flag as "L0 — Insufficient content" (quality gate applies). 12+ words but not a coherent analytical argument → L1 maximum with note.
8. Output a \`confidence\` score between 0.0 and 1.0.

## SCHOOL BENCHMARKING (MANDATORY)

${SCHOOL_BENCHMARK_DATA}

In addition to the standard grading output, include a \`schoolBenchmark\` object in your response with:
- \`topTierEstimate\`: What level this response would likely score at a top-tier school (RI, HCI, ACS(I)) — e.g., "L3"
- \`midTierEstimate\`: What level at a mid-tier school (SCGS, Cedar, MGS) — e.g., "L3"
- \`standardEstimate\`: What level at a standard school — e.g., "L4"
- \`explanation\`: A 1-2 sentence explanation of why the estimates differ (or why they're the same)

Example: \`"This response demonstrates solid comparison with similarity AND difference identified, but lacks evaluation of WHY the sources differ — cross-referencing with provenance. At a top-tier school this would be a high L3 (4/5), at a mid-tier school it would reach L4 (5/5)."\`

IMPORTANT: School benchmarking is DIAGNOSTIC. Do NOT change the LORMS level based on the school — the LORMS rubric is absolute. The school benchmark contextualises the score.
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

## SCHOOL BENCHMARKING

Include a \`schoolBenchmark\` object in your response with estimates at Tier 1 (top-tier: RI/HCI/ACS), Tier 2 (mid-tier: SCGS/Cedar/MGS), and Tier 3 (standard) schools.
The model answer (a1Upgrade) should be written to Tier 1 standard — this gives the student a target regardless of their current school level.
  `.trim();
}
