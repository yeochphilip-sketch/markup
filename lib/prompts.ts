// ================================================================
// MARKUP – Specialized Examiner Prompts  (v2)
//
// Each skill track + subject combination gets its own LORMS matrix,
// chain-of-thought rubric resolution steps, and confidence scoring.
// ================================================================

import { getModelAnswerExamples } from '@/lib/school-papers';

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

### Combined Score for Partial Submissions (All Formats):
- The overall combined score is computed as a weighted average by maxMarks:
  each section (SBCS, SEQ, SRQ) contributes (sectionScore / sectionMaxMarks * sectionMaxMarks) to the total.
- If a section was NOT submitted (answer is empty), its maxMarks is 0, giving it zero weight in the average.
- Example: SBCS max=21 (submitted, scored 14), SEQ max=0 (not submitted), SRQ max=0 (not submitted) →
  Overall = 14/21 = .67 ≈ L3 (since L3 range is typically .50-.74).
- Do NOT penalise the student for missing sections — simply exclude them from the calculation.

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
  {
    level: 'L2',
    studentAnswer: 'Source A, a government brochure for a housing scheme, states that "new rental flats will be allocated to lower-income families first." Source B, a Straits Times editorial, notes that "young couples are still priced out of the resale market despite the new scheme." Taken together, these sources imply that while the government claims to prioritise affordability, the actual impact on the ground is uneven — the scheme helps the poorest but does not fully resolve the broader affordability crisis for young Singaporeans.',
    scoreEstimate: 'L2 / 2 marks — Inferred message identified from BOTH sources, reading between the lines',
    critique: [
      'Excellent — you went beyond surface facts to infer the underlying message from each source.',
      'You correctly identified what Source A implies (government prioritising lower-income) and Source B implies (policy gap remains).',
      'You synthesised both inferences into a coherent conclusion about policy effectiveness.',
      'This is a textbook L2 inference using both sources.',
    ],
    confidence: 0.90,
    a1Upgrade: 'Source A implies the government is positioning itself as responsive to lower-income housing needs — the allocation priority signals an intention to address inequality. Source B, however, implies that this framing is incomplete: the policy misses the "sandwich" class of young couples, suggesting a gap between official messaging and on-the-ground reality. Together, the sources infer that while welfare measures exist, their design leaves significant segments of the population inadequately served.',
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
  {
    level: 'L3',
    studentAnswer:
      'Source A is a government press release promoting a new housing policy as a "comprehensive plan to benefit all Singaporeans." Its purpose is to persuade the public that the government is addressing housing affordability. Source B, an editorial, criticises the policy as "widening inequality" and its purpose is to advocate for more inclusive policymaking. The key difference is that Source A seeks public approval, while Source B seeks accountability — reflecting the different roles of government and media in Singaporean society.',
    scoreEstimate: 'L3 / 4 marks — Explains HOW and WHY the purpose of BOTH sources differs, with evidence',
    critique: [
      'You identified the purpose of BOTH sources individually — meets L2.',
      'You explained WHY the purposes differ (government vs media roles) — this reaches L3.',
      'Strong use of evidence from both sources to support your analysis.',
      'The contrast between "public approval" and "accountability" is a mature analytical distinction.',
    ],
    confidence: 0.88,
    a1Upgrade: 'Source A, an official press release, frames the housing policy as a "comprehensive plan to benefit all Singaporeans" — its purpose is to project governmental competence and secure public endorsement, a natural function of executive communication. Source B, an independent editorial, evaluates the same policy as "widening inequality" — its purpose is to provide critical oversight and advocate for more inclusive policymaking. The evolution from self-promotion (Source A) to critical evaluation (Source B) reflects the essential tension in governance between executing policy and being held accountable for its outcomes. This contrast matters because it demonstrates that policy success is contested: the government measures intent, while civil society measures impact.',
  },
];

const SS_UTILITY_EXAMPLES: FewShotExample[] = [
  {
    level: 'L1',
    studentAnswer:
      'This source is useful because it tells us about the housing policy.',
    scoreEstimate: 'L1 / 1 mark — States source is useful without meaningful justification',
    critique: [
      'You stated that the source is useful, but did not explain WHY or HOW.',
      'To reach L2, specify what the source is useful FOR and assess its provenance.',
      'A strong utility answer identifies both what the source reveals AND its limitations.',
    ],
    confidence: 0.80,
    a1Upgrade: 'This source is useful because it directly states the government\'s official housing policy plans. However, as a government press release, it naturally presents policies in a favourable light, so its utility for understanding actual implementation challenges is limited. Cross-referencing with independent sources would give a more complete picture.',
  },
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
  {
    level: 'L4',
    studentAnswer:
      'Source A, a government press release, is highly useful for understanding the official framing of housing policy — it reveals what the government wants the public to believe. However, its promotional purpose limits its utility for assessing actual outcomes. Source B, an editorial, reveals the implementation failures that Source A omits. Cross-referencing both, Source A tells us the intention; Source B tells us the reception. Final judgment: For assessing policy effectiveness, Source B is more useful because it provides independent evidence of outcomes, though Source A is essential for understanding the government\'s narrative.',
    scoreEstimate:
      'L4 / 5 marks — Cross-referenced evaluation with balanced final judgment on which source is more useful',
    critique: [
      'Excellent cross-referencing — you identified what each source reveals AND conceals.',
      'Clear final judgment on which source is more useful and why.',
      'Precise evidence from both sources supports your evaluation.',
      'This is a textbook L4 utility response.',
    ],
    confidence: 0.92,
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
  {
    level: 'L4',
    studentAnswer:
      'The assertion that the government\'s business support policy was effective is only partially true. Source A commits substantial funding to digitalisation grants, demonstrating genuine effort. However, as a government source, it naturally omits implementation failures. Source B reveals that traditional hawkers lacked the digital literacy to benefit, showing the policy was only effective for tech-ready firms. Source A and B together show success concentrated among those already equipped, widening rather than narrowing the digital divide. Moreover, the reliability of Source A is limited by its promotional purpose, while Source B\'s editorial nature means it may overstate failures. Therefore, the policy achieved its goals for a subset of businesses but failed those most in need — effectiveness was segmented, not universal.',
    scoreEstimate:
      'L4 / 5 marks — Synthesises with evaluation of source strengths/limitations, reaching a well-supported judgment',
    critique: [
      'You presented a clear, balanced position with both supporting and challenging evidence.',
      'You evaluated source reliability (Source A promotional, Source B editorialising) — this meets L4.',
      'Strong cross-referencing with specific evidence from both sources.',
      'The concluding judgment is nuanced and well-supported.',
      'This is a textbook L4 synthesis/assertion response.',
    ],
    confidence: 0.93,
    a1Upgrade:
      'Assertion: The government\'s business support policy was partially effective. Source A supports this view — the government committed substantial funding to digitalisation grants, demonstrating proactive support. However, as a government source, it naturally omits implementation challenges, limiting its reliability for assessing actual outcomes. Source B provides crucial counter-evidence: it reveals that traditional hawkers lacked the digital literacy to benefit, suggesting the policy was effective only for tech-ready firms. Cross-referencing both sources, the evidence suggests the policy achieved its goals for a subset of businesses but failed to reach those most in need. Therefore, while I agree the policy had merit, I argue it was incompletely effective — success was concentrated among those already equipped to benefit, widening rather than narrowing the digital divide.',
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
  {
    level: 'L4',
    studentAnswer: 'Two factors drove the policy change: economic recession and international pressure. The recession (GDP contracted 4.2%) constrained fiscal space, forcing the government to cut spending. However, international pressure from the IMF was equally significant — the IMF required policy reform as a condition for bailout loans, making change unavoidable. While the recession provided the motive, international pressure provided the mechanism. Policy change was ultimately the product of both structural economic constraints and external diplomatic leverage, with international pressure being the more decisive factor since it imposed a hard deadline.',
    scoreEstimate: 'L4 / 8 marks — Sophisticated balanced analysis evaluating multiple factors and reaching a substantiated conclusion',
    critique: [
      'You identified TWO factors with specific evidence — meets L3.',
      'You EVALUATED and WEIGHED the factors, concluding which was more significant — meets L4.',
      'Strong PEEL structure throughout.',
      'The concluding judgment is well-supported and demonstrates mature analytical thinking.',
    ],
    confidence: 0.90,
    a1Upgrade: 'Point: The policy change was driven by the interaction of economic recession and international pressure, of which international pressure was the more decisive. Evidence: GDP contracted by 4.2% in 2009, reducing government revenue by $2.1B, while the IMF simultaneously demanded structural reforms as a condition for a $4B bailout package. Explanation: The recession created the fiscal necessity for change, but the IMF\'s conditionality provided the external enforcement mechanism that made change politically feasible — the government could blame international obligations rather than admit domestic failure. Link: Therefore, while both factors were necessary, international pressure was the more significant because it provided both the catalyst AND the political cover for reform, whereas economic pressure alone could have been managed through borrowing or temporary measures.',
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
  {
    level: 'L4',
    studentAnswer:
      'The rise of Nazism was caused by both Hitler\'s strong base of support and the Great Depression, of which the Depression was more fundamental. Hitler cultivated support among wealthy businessmen by promising to destroy Communism, securing funding for the SA and propaganda. However, the Great Depression created the conditions for mass support — unemployment hit 6 million, and desperate Germans turned to the Nazis who offered hope and jobs. While Hitler\'s base provided resources, the Depression provided the audience. Without mass unemployment, Hitler\'s wealthy backers alone could not have delivered electoral success. Therefore, the Great Depression was the decisive factor — the stage on which Hitler performed, rather than the performer himself.',
    scoreEstimate:
      'L4 / 8 marks — Evaluates and prioritises factors, reaches a substantiated judgment on which was MOST significant',
    critique: [
      'You identified TWO factors (Hitler\'s support base and the Great Depression).',
      'You EVALUATED and WEIGHED them, concluding the Depression was more fundamental — meets L4.',
      'The "stage vs performer" metaphor is a mature analytical device.',
      'Strong specific evidence: 6 million unemployed, wealthy businessmen, SA funding.',
      'The concluding judgment is well-reasoned and directly answers the question.',
    ],
    confidence: 0.92,
    a1Upgrade:
      'Point: The rise of Nazism was caused by both Hitler\'s cultivation of elite support and the Great Depression, of which the Depression was the more fundamental factor. Evidence: Hitler secured financial backing from wealthy industrialists like Thyssen by promising to destroy Communism, funding the SA (brownshirts) and enabling a nationwide propaganda machine. Meanwhile, the Great Depression saw German unemployment soar from 1.6 million (1929) to 6 million (1932), creating widespread desperation. Explanation: Hitler\'s elite backing provided the resources to campaign, but the Depression provided the audience receptive to his message — without mass unemployment, the Nazi vote share could not have risen from 2.6% (1928) to 37.3% (1932). The elite funding was necessary but insufficient; the Depression was the structural condition that made mass appeal possible. Link: Therefore, while both factors were necessary, the Great Depression was the decisive cause — it created the desperate conditions that turned Hitler from a fringe agitator into a mass leader.',
  },
];

const SS_RELIABILITY_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer:
      'Source C is a Facebook post by a resident complaining about recycling bins. It is not very reliable because it is just one person\'s opinion.',
    scoreEstimate:
      'L2 / 3 marks — Assesses reliability based on provenance but without critical nuance',
    critique: [
      'You correctly identified provenance (Facebook post, one person) — this meets L2.',
      'However, "just one person\'s opinion" is a generic limitation.',
      'To reach L3, cross-reference the content with another source — does it align or contradict?',
      'To reach L4, identify SPECIFIC limitations: exaggeration, pushing blame, persuasive purpose.',
    ],
    confidence: 0.82,
    a1Upgrade:
      'Provenance: Source C is a Facebook comment from a self-described resident, dated 2019. Reliability assessment: As a personal account, the source offers genuine resident experience, lending credibility. However, its reliability is limited by the author\'s obvious frustration — rhetorical questions ("Do you really think Singaporeans will take the time to do that?") and exaggerated claims suggest emotional rather than factual reporting. Cross-referencing with Source B (official NEA data) showing declining recycling rates partially corroborates the frustration, but Source C\'s attribution of blame solely to the government is a subjective interpretation rather than an objective fact. Therefore, the source is reliable for understanding resident sentiment but not as an objective account of recycling policy effectiveness.',
  },
  {
    level: 'L4',
    studentAnswer:
      'Source C is a Facebook post by a resident complaining about recycling bins. Its reliability is limited by its provenance — it is a single resident\'s frustrated account posted on social media, where emotional exaggeration is common. When cross-referenced with Source A (government press release stating improved recycling infrastructure), the contradiction is stark: Source C claims the government has done nothing, while Source A details specific initiatives. This suggests Source C may be over-exaggerating to shift blame from residents to the government. However, Source C IS reliable as evidence of resident sentiment, even if not reliable as an objective account of policy. For understanding how policy is perceived on the ground, it is valuable precisely because it captures genuine frustration, regardless of whether that frustration is fully justified.',
    scoreEstimate:
      'L4 / 5 marks — Comprehensive reliability evaluation with provenance + cross-referencing + nuanced final judgment',
    critique: [
      'Excellent provenance analysis — identified social media as a platform for emotional expression.',
      'Strong cross-referencing with Source A to identify contradiction.',
      'Identified a SPECIFIC limitation (over-exaggeration to shift blame) rather than generic "bias".',
      'Nuanced final judgment — source is unreliable for facts but reliable for sentiment.',
      'This is a textbook L4 reliability response.',
    ],
    confidence: 0.93,
    a1Upgrade:
      'Provenance: Source C is a Facebook post (2019) by an anonymous resident, published on a community group page. Nature: Personal complaint narrative with rhetorical questions. Reliability evaluation: The source\'s provenance as a social media complaint post significantly limits its reliability as factual evidence — the author has no editorial oversight and is writing from a position of visible frustration. Cross-referencing with Source A (government press release describing new bin designs and educational notices) reveals that Source C\'s claim that "the government has done nothing" is inaccurate; the government has taken specific steps. This suggests Source C over-exaggerates to shift blame from resident behaviour to government inaction. However, the source IS reliable as evidence of resident sentiment — the fact that a resident feels this frustrated is genuine, regardless of whether the frustration is objectively justified. Final judgment: Source C is unreliable for assessing policy effectiveness, but highly useful for understanding public perception of recycling policy.',
  },
];

const HIST_PURPOSE_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer:
      'Mao made this speech to support the Korean people\'s war of liberation and resist US imperialism.',
    scoreEstimate:
      'L2 / 2 marks — Identifies purpose based on context (UN forces approaching Yalu River)',
    critique: [
      'You identified the basic purpose from the source content.',
      'To reach L3, explain the MESSAGE the source conveys — not just what it says, but what it means.',
      'To reach L4, explain the intended OUTCOME — what Mao wanted the Chinese people to FEEL or DO.',
      'Consider: was this meant to boost morale, justify intervention, or unify public opinion?',
    ],
    confidence: 0.82,
    a1Upgrade:
      'I think Mao made this speech to frame Chinese intervention in Korea as a just and necessary act of defence against American imperialism, thereby legitimising the war to the Chinese public and the People\'s Liberation Army. Source B states Mao ordered troops to "support the Korean people\'s war of liberation and to resist the attacks of U.S. imperialism." At the time, US troops were approaching the Yalu River, China\'s border with Korea, creating a direct security threat. By portraying the intervention as defensive resistance against imperialism rather than offensive aggression, Mao aimed to boost troop morale, unify public opinion, and justify the human and economic cost of war to the Chinese population.',
  },
  {
    level: 'L4',
    studentAnswer:
      'I think Mao made this speech in October 1950 to justify Chinese intervention in the Korean War to both the People\'s Liberation Army and the Chinese public. By framing the intervention as "support[ing] the Korean people\'s war of liberation" and "resist[ing] the attacks of U.S. imperialism," Mao portrayed China as a defender of Asian peoples against Western aggression rather than an aggressor. The intended outcome was to boost morale among Chinese troops being sent to Korea, to create a narrative of righteous defence that would justify the war\'s costs, and to unite the Chinese population behind the Communist Party\'s decision. This was crucial because China was still consolidating power after the 1949 Revolution, and an unpopular war could destabilise the new regime. The speech\'s purpose was therefore both military (motivate troops) and political (legitimise the war domestically).',
    scoreEstimate:
      'L4 / 5 marks — Purpose explained with intended outcome and context, well-supported with evidence',
    critique: [
      'Excellent — you identified the purpose AND explained the intended outcome.',
      'Strong contextual knowledge (1949 Revolution, consolidating power).',
      'You identified dual purposes: military motivation + political legitimisation.',
      'Precise evidence from the source supports your analysis.',
      'This is a textbook L4 purpose response for History.',
    ],
    confidence: 0.93,
    a1Upgrade:
      'I think Mao made this speech in October 1950 to justify Chinese intervention in the Korean War to the People\'s Liberation Army and the Chinese public, with the intended outcome of building domestic support for a costly overseas deployment. By framing the intervention as necessary to "resist the attacks of U.S. imperialism and its running dogs" and to "safeguard the interests of the people of Korea, China and all the other countries in the East," Mao cast China as the defender of Asia against Western domination — a narrative that would resonate with nationalist sentiment. The purpose was to boost troop morale, create a unifying patriotic narrative, and legitimise the sacrifice of Chinese lives in Korea. This was critical because the CCP had only just won the civil war in 1949, and an unpopular war risked undermining the new regime\'s legitimacy. Therefore, the speech was as much a domestic political tool as a military order.',
  },
];

const HIST_UTILITY_EXAMPLES: FewShotExample[] = [
  {
    level: 'L2',
    studentAnswer:
      'Source A, a statement by President Truman, is useful because it shows what the American president said about Korea.',
    scoreEstimate:
      'L2 / 2 marks — Assesses utility for a specific purpose based on content only',
    critique: [
      'You identified what the source is useful FOR — showing the US position.',
      'This meets L2 criteria for content-based utility assessment.',
      'To reach L3, also consider provenance limitations — is a presidential speech inherently biased?',
      'To reach L4, cross-reference with another source to assess what this source reveals vs conceals.',
    ],
    confidence: 0.80,
    a1Upgrade:
      'Source A, a statement by President Truman in June 1950, is useful as evidence of the USA\'s official justification for intervening in Korea — it shows the public rationale (countering Communist aggression, upholding the UN). However, its utility is limited by its purpose as a public statement: Truman was justifying intervention to Congress and the American public, so the source naturally emphasises ideological motives ("Communism has passed beyond the use of subversion") while downplaying strategic interests (containing Soviet influence, protecting Japan). Therefore, the source is useful for understanding the public narrative but less useful for uncovering the full range of US motivations.',
  },
  {
    level: 'L4',
    studentAnswer:
      'Source A, a statement by President Truman on 27 June 1950, is useful as evidence of the USA\'s official justification for intervening in Korea, but its utility is significantly limited by its purpose and provenance. As a public presidential statement, it was designed to justify intervention to Congress and the American public — hence its emphasis on ideological motives ("Communism has passed beyond the use of subversion to conquer independent nations") and its omission of strategic calculations (containing Soviet influence, protecting Japan\'s security). When cross-referenced with Source E (a private Stalin-Mao telegram showing Soviet caution), the contrast reveals that Source A presents only one side of a complex geopolitical situation. For a historian seeking the USA\'s public rationale, Source A is highly useful; for understanding the full strategic picture, it is incomplete and requires corroboration from internal documents or retrospective analyses.',
    scoreEstimate:
      'L4 / 5 marks — Nuanced utility judgment with cross-referencing and balanced assessment',
    critique: [
      'Excellent cross-referencing with Source E to identify what Source A omits.',
      'Clear distinction between what the source IS useful for vs what it conceals.',
      'Strong provenance analysis (public statement, designed to justify).',
      'Balanced final judgment on the source\'s utility for different research questions.',
      'This is a textbook L4 utility response for History.',
    ],
    confidence: 0.94,
    a1Upgrade:
      'Source A, a statement by President Truman on 27 June 1950, is useful as evidence of the USA\'s official public justification for intervening in Korea — specifically, the narrative of defending free nations against Communist aggression. However, its utility is significantly limited by its purpose and provenance. As a public address by an American president, its purpose was to justify military action to Congress and the American public, meaning it naturally emphasises ideological motives ("Communism has passed beyond the use of subversion to conquer independent nations") while omitting strategic geopolitical calculations (the need to contain Soviet influence and protect Japan\'s security as the cornerstone of US Asian policy). Cross-referencing with Source E (a private Stalin-Mao telegram revealing Soviet caution and advising restraint) demonstrates that the Cold War context was far more nuanced than Source A suggests — the Communist powers were not uniformly aggressive as portrayed. Final judgment: Source A is highly useful for understanding the public narrative that justified US intervention, but (like any single source) is incomplete for understanding the full strategic picture and must be read alongside internal documents, private correspondence, and retrospective analyses.',
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

### REFERENCE: REAL MOE SCHOOL PAPER FORMATS

Your output must match the structure of REAL Singapore school exam papers like these:

**Victoria School SS 2020** — "Zero-Waste Nation": 6 sources (A-F: cartoon, MEWR project, CNA article, ST infographic, Facebook response, NEA photo), 5 SBCS parts (Inference[6m], Comparison[7m], Purpose[7m], Reliability[7m], Assertion[8m]) + SRQ section with 2 questions (7m + 8m) = 50 marks total.

**Montfort SS 2024** — "Declining Birth Rates": 6 sources (CNA article, ST cartoon, BBC report, Forum letter, MP speech, IPS survey), 5 SBCS parts (Inference[5m], Comparison[7m], Surprise/Reliability[7m], Prove[6m], Hybrid SEQ[10m]) + SRQ section.

**Deyi History 2024** — "Korean War — US Intervention": 6 sources (Veterans for Peace article, American cartoon, Truman speech, North Korean history, Acheson memoir, Chinese propaganda pamphlet), 5 SBCS parts (Surprise[6m], Purpose[5m], Prove[6m], Message[5m], Assertion[8m]) + 3 SEQ essays (10m each) = 50 marks.

**Edgefield History 2024** — "Korean War — Regional vs Cold War": 6 sources (Truman statement, Mao speech, CIA report, US leaflet, Stalin telegram, Chinese historians), 5 SBCS parts (Utility[5m], Purpose[5m], Surprise[6m], Prove[6m], Assertion[8m]) + 3 SEQ essays.

**CCHM History 2025** — "Korean War — Who Was to Blame?": 6 sources (US leaflet, Truman press conference, Truman memoirs, DPRK report, UN leaflet, Chinese historian), 5 SBCS parts (Message[5m], Reliability[6m], Surprise[5m], Agreement[6m], Assertion[8m]) + 3 SEQ essays.

**St. Margaret's History 2023** — "Stalin's Great Terror": 6 sources (survivor account, Deutscher book, British textbook, Kopelev autobiography, Khrushchev speech, Soviet photograph), 5 SBCS parts (Inference[5m], Comparison[5m], Surprise[6m], Utility[6m], Assertion[8m]) + 2 SEQ essays (8m+12m).

Pattern to follow: Each paper has EXACTLY 6 sources with distinct provenances, 5 SBCS parts testing different skills with varying mark weights, subject-specific Section B (SRQ for SS, SEQ for History), and a total of 50 marks. Your output must follow this same structure.

============================================
=== OVERALL CONTEXT ===
============================================

Start with a short "backgroundContext" paragraph (3-5 sentences) that sets the scene for the case study. This should introduce the issue, event, or theme that all sources relate to. This is NOT one of the sources — it is the contextual framing for the entire question package.

For Social Studies: Choose a scenario related to one of the three issues (Citizenship & Governance, Diverse Society, Globalised World).
For History: Choose a scenario related to the selected case study topic.

============================================
=== SECTION A: SOURCES (Generate exactly 6 sources) ===
============================================

Generate between 2-5 sources (labelled Source 1 through Source N, where N is the requested source count), each with:
- A distinct, realistic provenance (date, author, publication/context — be specific)
- Substantive content (at least 60 characters each)
- Different source types: e.g., speech extract, newspaper article, interview transcript, government report, cartoon/poster description, diary entry, statistical table, photograph description, propaganda leaflet
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
=== SUGGESTED ANSWER / MODEL ANSWER — MOE TEACHER STANDARD ===
===========================================

## CHAIN-OF-THOUGHT — How to Construct the Model Answer

Follow these steps in order when generating the model answer (a1Upgrade):

Step 1 — Identify the question type and target LORMS level: Is this a Comparison, Reliability, Purpose, Utility, Inference, SRQ, or SEQ question? Each question type has a different structure requirement (see LORMS matrices above). The model answer should target L4/L5 (top-tier) standard.

Step 2 — Identify the provenance elements: For SBQ questions, identify the author, date, type, audience, and purpose of EACH source you must reference. These provenance elements must be woven into the model answer.

Step 3 — Plan the structure: 
- For Comparison: State similarity → state difference → explain why the difference matters → conclude
- For Reliability: Assess strengths (provenance) → cross-reference → assess limitations → overall judgement
- For Purpose: Identify message → analyse language/technique → identify audience → explain intended outcome
- For Utility: Content value → provenance limitations → cross-reference → final judgement
- For SRQ/SEQ: PEEL structure — Point → Evidence → Explanation → Link for each paragraph
- For Inference: State surface content → infer message → explain significance

Step 4 — Write the answer: Follow the MOE-style formatting rules below. Use the real school model answer example as a template for tone, structure, and LORMS labelling.

Step 5 — Self-check the CRITICAL CHECKLIST (below) before finalising. Ensure every required element is present.

## REAL MOE SCHOOL MODEL ANSWER EXAMPLE — SS Comparison (Victoria School 2020)

This is a real model answer written by MOE teachers. Use it as a template for tone, structure, LORMS labels, and analytical depth:

Question: Study Sources B and C. Does the resident in Source C think that the project in Source B will work? Explain your answer.

"L4 Will work AND Will NOT work based on content (6m):
Point: The resident in Source C would partially agree that the project in Source B will work, but she ultimately believes it will NOT address the root cause of Singaporeans' poor recycling habits.

Evidence (Will work): The resident acknowledges that many Singaporeans "are still not very educated about how to recycle properly," and Source B's project aims to "increase public awareness about the process of recycling right." The transparent bin design and eye-level notices directly address this education gap.

Evidence (Will NOT work): However, the resident's core objection is not education but convenience. She asks rhetorically: "Do you really think that Singaporeans in general will take the time out to do that when they don't even take the time to do simple things?" This reveals her belief that even with better bins, Singaporeans will not change their behaviour because the process remains "too tedious and time consuming."

Explanation: Source B's project assumes that better design leads to better behaviour — an assumption that Source C's resident rejects. She is cynical about Singaporeans' willingness to put in effort, regardless of infrastructure improvements. Her perspective is that the root cause is cultural indifference, not poorly designed bins.

Link: Therefore, while the resident concedes the project may help educate, she ultimately does NOT believe it will work because it fails to address the deeper issue of Singaporean attitudes towards recycling."

You MUST provide a comprehensive A1-grade suggested answer that reads EXACTLY like the model answer above — written by a Singapore MOE Humanities teacher for a top-tier school (RI, HCI, ACS). Observe the following strict formatting and style rules:

## MOE-Style Answer Formatting Rules (MANDATORY — ALL rules MUST be followed)

1. **Explicit structure markers**: Use "Point:", "Evidence:", "Explanation:" and "Link:" headers in ALL paragraphs. These markers must be BOLDED or clearly visible. FAILURE TO INCLUDE ALL FOUR MARKERS WILL RESULT IN THE ANSWER BEING REJECTED AS INCOMPLETE.
2. **Conciseness**: MOE model answers are TIGHT. Aim for 3-5 sentences per paragraph, not 6-8. Every sentence must add analytical value.
3. **Precision over verbosity**: Use specific phrases like "Source X reveals...", "This implies...", "In contrast...", "This is significant because...". Avoid: "This disparity is significant" (vague). Instead: "This contrast matters because it reveals the fundamental tension between X and Y."
4. **Exact rubric language — MUST include LORMS level labels**: You MUST include the exact LORMS rubric terminology AND level label in EVERY answer. For example: "L4 Message (4-5m): The message is that..." or "L5 Will not work based on Perspective (7m): The resident would not..." DO NOT just describe the analysis — LABEL the LORMS level explicitly like the real school model answers do. E.g., for comparison, say "core message matching" explicitly and label the level: "L4 — Similarity AND Difference with core message matching."
5. **Direct quotes — DOUBLE QUOTATION MARKS ONLY ("...")**: You MUST include at least ONE direct quote from the source in EVERY paragraph. ALL direct quotes MUST be enclosed in **double quotation marks** ("..."). ⚠️ NEVER use single quotes ('...') for source quotations — only double quotes are acceptable. E.g., Source 1 states that "the subsidy covers 80% of outpatient costs." Generic paraphrasing without quoted evidence is NOT acceptable for an L4 model answer.
6. **Cross-referencing — MANDATORY for Part (b) and Part (e)**: For comparison and assertion questions, you MUST explicitly compare sources using contrastive language: "whereas", "in contrast", "Source X reveals... while Source Y...", "on the other hand", "similarly". Describing sources separately ("Source A says... Source B says...") is NOT cross-referencing and does NOT meet L3+
7. **Conclusion/evaluation — MANDATORY for every Part**: Each Part's model answer MUST end with a concluding/evaluative sentence (introduced by "Therefore:", "Thus:", "Hence:", "In conclusion:", "As such:", or similar transition) that provides an evaluative judgment. E.g., "Therefore, this contrast reveals that the government's policy was driven by electoral rather than economic considerations." Answers that end without a conclusion will be marked DOWN.
8. **No padding**: Do NOT start with "The government's support for businesses, as presented in Source A and Source B, reveals a complex dynamic..." This is filler. Start DIRECTLY with the analysis.
9. **Natural academic register**: Write in fluent, natural English that an MOE teacher would produce — clear, precise, confident. Avoid robotic or overly complex sentence structures.
10. **Answer length**: 
    - Part (a) Inference: 2-3 sentences
    - Part (b) Comparison: 4-6 sentences
    - Part (c) Purpose: 3-4 sentences
    - Part (d) Reliability: 4-6 sentences
    - Part (e) Assertion: 6-10 sentences (balanced, with evaluation)
    - SRQ (a): 4-6 sentences
    - SRQ (b): 5-8 sentences
    - SEQ each: 6-10 sentences

## What This Should Look Like (Example Structure for Comparison):

"L4 — Similarity AND Difference with core message matching:
Point: Both Source A and Source B address [topic], but they differ fundamentally in their assessment of [aspect]. Evidence: Source A, a [provenance description], presents [aspect] as [description] — "direct quote from source." In contrast, Source B, an [editorial/report from context], argues [aspect] is [description] — "direct quote from source." Explanation: Source A's core message is that [X], whereas Source B's core message is that [Y]. This difference is rooted in their contrasting purposes — Source A seeks to [purpose], while Source B aims to [purpose]. Link: This divergence matters because it reveals [broader significance], shaping how a historian/citizen would evaluate [implications]."

CRITICAL: Each section (Part A-E) must have its own complete model answer. Do NOT combine them into one paragraph. Label each part clearly.

- For Part A-E: Write a complete model response for EACH question at L4/L5 standard.
- For SRQ (SS only): Write full model answers for both SRQ (a) and (b) at L4 standard, with clear structure markers.
- For SEQ (History only): Write full model answers for all 3 SEQ questions at L4 standard, with PEEL structure.

## REAL MOE SCHOOL MODEL ANSWER LORMS PATTERNS — YOU MUST USE THESE

The following are LORMS-level language patterns from actual MOE school model answers. Your output MUST use matching LORMS labels and level descriptors:

- SS Inference (Victoria 2020): [L4 Message (4-5m): The message is that X. L5 (6m): Message with broader outcome — Y.]
- SS Comparison (Victoria 2020): [L3 (4-5m): Will work OR will NOT work. L4 (6m): Will work AND will NOT work. L5 (7m): Will NOT work based on Perspective.]
- History Surprise (Deyi 2024): [L3 (4-5m): Evaluation by cross-reference. L4 (6m): Purpose in context — author's agenda.]
- History Prove (Deyi 2024): [L5 (5m): Disagreement + cross-reference. L6 (6m): Purpose evaluation — competing agendas.]
- History Assertion (Deyi 2024): [L2 (2-4m): Yes OR No. L3 (5-7m): Yes AND No. + Bonus: CK evaluation.]
- SS SRQ (Victoria 2020): [L3 (5-7m): Explains reasons. L4 (8m): Explains relative importance.]
- History SEQ (Deyi 2024): [L3 (6-8m): Factor + counter-factor. L4 (9-10m): Evaluates and weighs.]

### CRITICAL CHECKLIST — All 7 must pass:
1. LORMS labels missing? Every Part needs L4 Message: / L3 Comparison: etc.
2. Direct quotes missing? Every paragraph needs "evidence in quotes"
3. Cross-referencing missing? Part (b/e) MUST compare sources (whereas, in contrast)
4. Conclusion missing? Every Part ends with Therefore:/Thus: judgment
5. PEEL markers missing? Point/Evidence/Explanation/Link in every paragraph
6. Provenance not evaluated? Part (c/d) MUST discuss author/date/type/purpose
7. Balanced judgment missing? Part (e) MUST present agree AND disagree
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
  srq:
    'No sources needed. The prompt should be a standalone structured response question (SRQ) requiring evaluation, recommendation, or judgment. Focus on clear criteria for assessment — evidence, analysis, and balanced judgment.',
};

function getGenerationSourceRules(questionType: string): string {
  const type = questionType.toLowerCase();
  if (type.includes('comparison') || type.includes('contrast')) return GENERATION_SOURCE_RULES.comparison;
  if (type.includes('inference') || type.includes('message')) return GENERATION_SOURCE_RULES.inference;
  if (type.includes('reliability') || type.includes('cross-ref')) return GENERATION_SOURCE_RULES.reliability;
  if (type.includes('purpose') || type.includes('target') || type.includes('motive')) return GENERATION_SOURCE_RULES.purpose;
  if (type.includes('utility')) return GENERATION_SOURCE_RULES.utility;
  if (type.includes('seq') || type.includes('essay') || type.includes('factor')) return GENERATION_SOURCE_RULES.seq;
  if (type.includes('srq') || type.includes('structured response')) return GENERATION_SOURCE_RULES.srq;
  // All Formats — include the full exam package instructions
  return ALL_FORMATS_INSTRUCTIONS;
}

/**
 * Get the condensed generation prompt (fits under 6K tokens for 8B fallback).
 */
export function getGenerateSystemPrompt(subject: string, topic: string, questionType: string): string {
  const sourceRules = getGenerationSourceRules(questionType);
  const aos = getAssessmentObjectives(subject);

  return `
You are a senior SEAB examiner authoring authentic Singapore GCE O-Level
${subject} examination stimulus material.

Assessment Objectives: ${aos}

Topic: ${topic}
Target Skill Track: ${questionType}

## EXAM PACKAGE STRUCTURE (TRACK-DEPENDENT)

The output format depends on the Target Skill Track:

### For SBQ tracks (Inference, Comparison, Purpose, Reliability, Utility, Synthesis):
Generate: background context, 2 distinct provenance-stamped sources with substantive content, and a single SBCS question prompt. Include additional sources (C, D, E) if the skill is Synthesis/Assertion.
Do NOT generate SEQ or SRQ content.

### For SRQ tracks (Structured Response Questions):
Generate: a standalone structured response question prompt with background context. No sources needed.
Do NOT generate SBCS or SEQ content.

### For SEQ tracks (Structured Essay Questions / Factor Prioritization):
Generate: 3 distinct essay prompts with a brief stimulus context. No sources needed.
Do NOT generate SBCS or SRQ content.

### For All Formats (SBCS + SEQ + SRQ Bundle):
Generate: the full exam package — background context, 5 provenance-stamped sources (A–E), SBCS sub-questions Parts (a)–(e), 2 SRQ prompts, and 3 SEQ essay prompts.

## SKILL-SPECIFIC SOURCE REQUIREMENTS

${sourceRules}

## STRICT RULES
- Use real-sounding provenance (date, author, publication). Be specific.
- Sources must be substantively different — not just the same information rephrased.
- Do not include markdown formatting — plain text only.
- Match the register and tone of SEAB-produced materials (formal, neutral, precise).
- The suggested answer should demonstrate A1 standard for the selected skill track.

## SCHOOL BENCHMARKING

${SCHOOL_BENCHMARK_DATA}

Calibrate ALL model answers to Tier 1 (top-tier school) standard — RI, HCI, ACS(I), NJC, VJC level.
The suggested answer should reflect the depth, sophistication, and evaluative thinking expected at these schools.
`.trim();
}


/**
 * 70B-specific generation prompt — includes verbatim Victoria School model
 * answer examples for higher-quality output. Only use this for the 70B model
 * (not the 8B fallback) because it exceeds the 8B's token limit.
 */
export function getGenerateSystemPrompt70B(subject: string, topic: string, questionType: string): string {
  const base = getGenerateSystemPrompt(subject, topic, questionType);
  const modelAnswers = getModelAnswerExamples(subject === 'History' ? 'History' : 'Social Studies');

  // Note: ALL_FORMATS_INSTRUCTIONS is NOT appended here because
  // getGenerationSourceRules() (called inside getGenerateSystemPrompt)
  // already injects it into the base prompt under the
  // "SKILL-SPECIFIC SOURCE REQUIREMENTS" heading. Adding it again
  // would duplicate ~3,545 tokens.

  return `${base}

## REAL MOE SCHOOL MODEL ANSWER EXAMPLES — YOU MUST MATCH THIS STANDARD

${modelAnswers}

These are actual MOE teacher-written model answers from Victoria School SS 2020.
Your suggested answers MUST match the SAME analytical depth, structure, LORMS-level
precision, and formatting shown in these examples. Use the exact LORMS level labels
(e.g., "L4 Message (4-5m):") and PEEL structure demonstrated above.`;
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
    else if (type.includes('purpose') || type.includes('target') || type.includes('motive')) skillExamples = HIST_PURPOSE_EXAMPLES;
    else if (type.includes('utility')) skillExamples = HIST_UTILITY_EXAMPLES;
    else if (type.includes('seq') || type.includes('essay') || type.includes('factor')) skillExamples = HIST_SEQ_EXAMPLES;
    else if (type.includes('all formats') || type.includes('bundle')) {
      // All Formats: pick the HIGHEST-level example per skill so grader sees top-tier calibration
      skillExamples = [
        HIST_INFERENCE_EXAMPLES[HIST_INFERENCE_EXAMPLES.length - 1],
        HIST_COMPARISON_EXAMPLES[HIST_COMPARISON_EXAMPLES.length - 1],
        HIST_PURPOSE_EXAMPLES[HIST_PURPOSE_EXAMPLES.length - 1],
        HIST_UTILITY_EXAMPLES[HIST_UTILITY_EXAMPLES.length - 1],
        HIST_RELIABILITY_EXAMPLES[HIST_RELIABILITY_EXAMPLES.length - 1],
        HIST_SEQ_EXAMPLES[HIST_SEQ_EXAMPLES.length - 1],
      ].filter(Boolean);
    } else {
      skillExamples = HIST_COMPARISON_EXAMPLES;
    }
  } else {
    if (type.includes('comparison') || type.includes('contrast')) skillExamples = SS_COMPARISON_EXAMPLES;
    else if (type.includes('inference') || type.includes('message')) skillExamples = SS_INFERENCE_EXAMPLES;
    else if (type.includes('purpose') || type.includes('motive')) skillExamples = SS_PURPOSE_EXAMPLES;
    else if (type.includes('utility') || type.includes('reliability')) skillExamples = SS_UTILITY_EXAMPLES;
    else if (type.includes('synthesis') || type.includes('assertion') || type.includes('matrix')) skillExamples = SS_SYNTHESIS_EXAMPLES;
    else if (type.includes('srq') && !type.includes('seq')) skillExamples = SS_SRQ_EXAMPLES;
    else if (type.includes('seq') || type.includes('essay')) skillExamples = SS_SEQ_EXAMPLES;
    else if (type.includes('all formats') || type.includes('bundle')) {
      // All Formats: pick the HIGHEST-level example per skill so grader sees top-tier calibration
      skillExamples = [
        SS_INFERENCE_EXAMPLES[SS_INFERENCE_EXAMPLES.length - 1],
        SS_COMPARISON_EXAMPLES[SS_COMPARISON_EXAMPLES.length - 1],
        SS_PURPOSE_EXAMPLES[SS_PURPOSE_EXAMPLES.length - 1],
        SS_UTILITY_EXAMPLES[SS_UTILITY_EXAMPLES.length - 1],
        SS_SYNTHESIS_EXAMPLES[SS_SYNTHESIS_EXAMPLES.length - 1],
        SS_SRQ_EXAMPLES[SS_SRQ_EXAMPLES.length - 1],
        SS_SEQ_EXAMPLES[SS_SEQ_EXAMPLES.length - 1],
      ].filter(Boolean);
    } else {
      skillExamples = SS_COMPARISON_EXAMPLES;
    }
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
2. If the skill track is "All Formats", evaluate each section (SBCS sub-parts, SEQ, SRQ) against its own rubric. Output sbcsScore, seqScore, and srqScore with each section's level, marks, maxMarks, and a brief label. Then provide an overall combined scoreLevel and scoreMarks as follows: calculate the weighted average across submitted sections (weight by each section\'s maxMarks), round to the nearest whole level, and set scoreMaxMarks to the sum of all section maxMarks.
3. The \`critique\` array should contain 3–8 specific, actionable bullet points.
4. The \`a1Upgrade\` must be a complete rewritten answer at A1 (top-tier) standard. CRITICAL format requirements:
   - FIRST line MUST be a LORMS level label (e.g., \"L4 — Similarity AND Difference with core message matching:\")
   - ALL source quotes in DOUBLE quotation marks (\"...\") — NEVER single quotes
   - Every paragraph: **Point:**, **Evidence:**, **Explanation:**, **Link:**
   - Every paragraph: at least one double-quoted source quote (SEQ: specific evidence instead)
   - Every Part: end with \"Therefore:\" or \"Thus:\" conclusion
5. Each \`highlightedSegment\` must include the exact text from the student's answer.
6. Be encouraging, professional, and diagnostic — no generic fluff.
7. Under 12 words of actual content → flag as \"L0 — Insufficient content\" (quality gate applies). 12+ words but not a coherent analytical argument → L1 maximum with note.
8. Output a \`confidence\` score between 0.0 and 1.0.

## MODEL ANSWER EXAMPLE — MOE Victoria School SS 2020 (template for LORMS + double-quotes + PEEL):

\"L4 Will work AND Will NOT work based on content (6m):
Point: The resident would partially agree but ultimately believes it will NOT work.
Evidence: She acknowledges Singaporeans \"are still not very educated about how to recycle properly\" and the project aims to \"increase public awareness.\" However, she asks: \"Do you really think that Singaporeans will take the time out to do that?\" because recycling remains \"too tedious and time consuming.\"
Explanation: Source B assumes better design = better behaviour; Source C rejects this, seeing the root cause as cultural indifference.
Link: Therefore, the resident concedes education value but does NOT believe it will work because attitudes, not bin design, are the real barrier.\"

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
  /** Original source texts so the model can verify student source references */
  sourceA?: string;
  sourceB?: string;
  sourceAProvenance?: string;
  sourceBProvenance?: string;
  sourceC?: string;
  sourceD?: string;
  sourceE?: string;
  sourceCProvenance?: string;
  sourceDProvenance?: string;
  sourceEProvenance?: string;
}): string {
  const { questionPrompt, subject, topic, questionType, sbcsAnswer, seqAnswer, srqAnswer, sourceA, sourceB, sourceAProvenance, sourceBProvenance, sourceC, sourceD, sourceE, sourceCProvenance, sourceDProvenance, sourceEProvenance } = params;

  // Only include sections that were actually written
  const sections: string[] = [];
  if (sbcsAnswer.trim()) sections.push(`SBCS Answer:\n${sbcsAnswer}`);
  if (seqAnswer.trim()) sections.push(`SEQ Answer:\n${seqAnswer}`);
  if (srqAnswer.trim()) sections.push(`SRQ Answer:\n${srqAnswer}`);
  const combinedAnswer = sections.join('\n\n');

  // Build sources section if any sources are available
  const sourceEntries = [
    { provenance: sourceAProvenance, content: sourceA, label: 'Source A' },
    { provenance: sourceBProvenance, content: sourceB, label: 'Source B' },
    { provenance: sourceCProvenance, content: sourceC, label: 'Source C' },
    { provenance: sourceDProvenance, content: sourceD, label: 'Source D' },
    { provenance: sourceEProvenance, content: sourceE, label: 'Source E' },
  ].filter(e => e.content);
  const sourcesSection = sourceEntries.length > 0
    ? `\nORIGINAL SOURCES (for verifying student source references):\n${
        sourceEntries.map(e => `${e.provenance ? `${e.label}: ${e.provenance}\n` : ''}${e.content}`).join('\n\n')
      }\n`
    : '';

  return `
QUESTION PROMPT:
${questionPrompt || '(not provided)'}

SUBJECT: ${subject}
TOPIC: ${topic}
SKILL TRACK: ${questionType}
${sourcesSection}
STUDENT ESSAY (submitted sections only):
"""
${combinedAnswer}
"""

Apply the LORMS rubric strictly using the step-by-step rubric resolution process.
Highlight which segments were correct, which were weak, and which were structural errors.

### CRITICAL — a1Upgrade format requirements (MUST follow):
- FIRST line MUST be a LORMS level label (e.g., "L4 — Similarity AND Difference with core message matching:")
- ALL source quotes in DOUBLE quotation marks ("...") — NEVER single quotes
- Every paragraph: **Point:**, **Evidence:**, **Explanation:**, **Link:**
- Every paragraph: at least one double-quoted source quote (SEQ: specific evidence instead)
- Every Part: end with "Therefore:" or "Thus:" conclusion

## A1 MODEL ANSWER (a1Upgrade) — MOE TEACHER STANDARD

Write the a1Upgrade as if you are an MOE Humanities teacher at a top-tier school (RI, HCI, ACS) writing a model answer for your students.

### MOE-Style Rules (MANDATORY for a1Upgrade):
1. Use explicit structure markers: "Point:", "Evidence:", "Explanation:", "Link:" in every paragraph
2. Be CONCISE: 3-5 sentences per point. No verbose introductions like "The government's support... reveals a complex dynamic..."
3. Start DIRECTLY with the analysis, not a generic framing sentence
4. Use precise analytical language: "Source X reveals...", "This implies...", "In contrast...", "This is significant because..."
5. Reference specific evidence from the question/sources (quote key phrases)
6. End each point with a Link that ties back to the broader implication
7. Write at Tier 1 (top-tier school) L4 standard — sophisticated, evaluative, confident
8. Keep natural academic register — clear, precise English that reads like a real teacher wrote it
9. Use REAL MOE LEVEL DESCRIPTORS from the actual Victoria School SS model answer (see example below)

### REAL MOE SCHOOL MODEL ANSWER EXAMPLE — Victoria School SS 2020

Here is an actual MOE teacher-written model answer from Victoria School's SA2 Social Studies paper.
This is the EXACT format, depth, and style you must match:

Question: Study Source A. What is the message of this cartoon? Explain your answer. [6]
MOE Teacher Answer:
"L4 Message (4-5m): The message is that recycling is seen as negative / undesirable act by many adult Singaporeans. (Behaviour of Singaporeans toward recycling) This is because many feel that it is not their responsibility and it should be the responsibility of those who earn/are paid to do these jobs such as the Karang Guni men.

L5 Message with broader outcome (6m): The message of this cartoon is to create a sense of shared responsibility among Singaporeans toward recycling (source was created in 2010). In the past since recycling was perceived to be undesirable act, it was necessary for actions to be taken to have a change of mindset among Singaporeans and work together for the good of society — protecting the environment."

Question: Study Sources B and C. Does the resident in Source C think that the project in Source B will work? [7]
MOE Teacher Answer:
"L4 Will work AND Will NOT work based on content (6m): Will work — as the new bin educates residents of how to recycle. Source B — 'we aim to increase public awareness about the process of recycling right and reduce contamination'... 'Notices are also to be placed at a person's eye-level...visualise what is allowed to be recycled with minimal effort'. Source C — '...many are still not very educated about how to recycle properly...' Will not work — convenience. Source B — 'We hope to create a transparent bin which may make people more conscious of what they are placing into the bin...' Source C — 'Do you really think that Singaporeans in general will take the time out to do that when they don't even take the time to do simple things?' Will not work as most Singaporeans may still throw things that do not belong to the recycling bin even if the bin is transparent as the process of recycling right is too tedious and time consuming.

L5 Will not work based on Perspective (7m): The resident would not think that the project will work as she feels cynical/negative that Singaporeans will change their mindset and put in the time to recycle properly. Source B's project may not address the root cause which is Singaporean's behaviour as it is only dealing with the bin's structure."

### REAL MOE SCHOOL MODEL ANSWER EXAMPLE — Deyi Secondary History 2024

Question: Study Source A. Are you surprised by what the source says? Explain your answer. [6]
MOE Teacher Answer:
"L2: Surprised for what it tells about the Korean War (3m): I am surprised as it is actually different from the common American understanding of the Korean war by pointing out that it was the Americans who initiated the Korean War as US wanted to establish a democratic South Korea. This can be seen from the source which shows 'The truth is that the Korean War really started in 1945 when the U.S. suppressed the KPR government and imposed its military rule in the southern part of Korea.'

L3: Answers which attempt to evaluate what is said by cross-reference to other sources or contextual knowledge (4-5m): I am surprised as I feel that US would not have wanted to initiate the Korean War as based on my contextual knowledge, the Americans were initially not interested in the affairs of Korea. This can be seen from the fact that Korea was not part of the American defensive perimeter. US have even started withdrawing the troops from Korea from 1949 onwards.

L4: Answers which evaluate the source based on the purpose in context (6m): Upon closer examination of the provenance, I am not surprised by the source as Source A is written by Veterans for Peace which is likely to advocate for peace and show a biased perspective of the Korean War. As a member of Veteran for Peace, it is likely that the author's purpose is to show how fighting in a war was unnecessary so as to discourage the American public from supporting future government's decision to get itself involved in a distant place like Korea."

### IMPORTANT: a1Upgrade Must Be a SINGLE Coherent Answer

The a1Upgrade field expects ONE complete model answer at L4/L5 standard, NOT a multi-level breakdown. Use the Victoria School and Deyi examples above for STYLE (evidence quotes, analytical precision, clarity) but output only the TOP-BAND answer. Do NOT include multiple LORMS level descriptions — just write the answer itself. Think of it as the answer key a teacher would give to students.

**Correct (single answer):** "The message of the cartoon is that recycling is seen as undesirable by adult Singaporeans because they believe it is the responsibility of paid workers like Karang Guni men. This attitude creates a barrier to shared responsibility for the environment, which the cartoon critiques by highlighting the gap between personal convenience and collective action."

**Incorrect (multi-level breakdown):** "L4 Message (4-5m): ... L5 Message with broader outcome (6m): ..."

## SCHOOL BENCHMARKING

Include a \`schoolBenchmark\` object in your response with estimates at Tier 1 (top-tier: RI/HCI/ACS), Tier 2 (mid-tier: SCGS/Cedar/MGS), and Tier 3 (standard) schools.
The model answer (a1Upgrade) should be written to Tier 1 standard — this gives the student a target regardless of their current school level.
  `.trim();
}
