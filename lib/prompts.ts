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

  if (subject === 'Elective History') {
    // Historical students using AO3 rubrics — examples are calibrated to History contexts
    if (type.includes('comparison') || type.includes('contrast')) return HIST_COMPARISON_EXAMPLES;
    if (type.includes('inference') || type.includes('message')) return HIST_INFERENCE_EXAMPLES;
    if (type.includes('reliability') || type.includes('cross-ref')) return HIST_RELIABILITY_EXAMPLES;
    // Default for other History skills — use comparison examples
    return HIST_COMPARISON_EXAMPLES;
  }

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
