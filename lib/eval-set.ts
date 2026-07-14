// ================================================================
// MARKUP – Eval Set  (regression testing)
//
// 15 pre-graded essays covering the most common skill-track × subject
// combinations. Run `evaluateEvalSet()` to compare current grading
// output against expected scores. Any regression > 1 LORMS level
// should block deployment of prompt changes.
// ================================================================

export interface EvalCase {
  id: string;
  subject: string;
  questionType: string;
  topic: string;
  questionPrompt: string;
  sbcsAnswer: string;
  seqAnswer: string;
  srqAnswer: string;
  expectedLevel: string;   // e.g. "L3"
  expectedLabel: string;   // substring match on scoreLabel
  minConfidence: number;
}

const SS_COMPARISON_SOURCES = `
Background: In 2020, the government introduced a series of policies aimed at
supporting local businesses affected by the economic downturn.
Source A: Speech by the Minister for Trade and Industry, March 2020:
"Our new grant scheme will provide up to $50,000 for small and medium
enterprises to digitalise their operations. This is a targeted intervention
to ensure our local businesses remain competitive globally."
Source B: Editorial in The Straits Times, April 2020:
"The government's grants, while generous, primarily benefit tech-ready
firms. Traditional hawkers and family-run shops often lack the digital
literacy to even apply. Without bridging this gap, the policy risks
widening the inequality it claims to address."
`;

const SS_INFERENCE_QUESTION = 'What can you infer from the sources about the government\'s approach to economic support?';

const HIST_SOURCES_COLDWAR = `
Background: The Cold War began after World War II as tensions rose
between the United States and the Soviet Union.
Source A: Soviet diplomat's memoir, 1965:
"The Truman Doctrine and Marshall Plan were nothing but economic
imperialism designed to encircle the USSR and dominate Europe."
Source B: US State Department memo, 1947:
"The Marshall Plan is a defensive measure against Soviet subjugation
of Eastern Europe. We must contain communist expansion."
`;

const HIST_QUESTION_COLDWAR = 'Compare the two sources on their explanations for the origins of the Cold War.';

export const EVAL_SET: EvalCase[] = [
  // ── Social Studies: Comparison ──
  {
    id: 'ss-comp-l2',
    subject: 'Social Studies',
    questionType: 'SBQ: Comparison & Contrast (AO2)',
    topic: 'Issue 1: Exploring Citizenship and Governance',
    questionPrompt: `Compare the views of Source A and Source B on the government's support for businesses.\n\n${SS_COMPARISON_SOURCES}`,
    sbcsAnswer: 'Source A talks about grants for digitalisation. Source B talks about inequality. Both sources are about government support for businesses.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L2',
    expectedLabel: 'Similarity identified',
    minConfidence: 0.8,
  },
  {
    id: 'ss-comp-l4',
    subject: 'Social Studies',
    questionType: 'SBQ: Comparison & Contrast (AO2)',
    topic: 'Issue 1: Exploring Citizenship and Governance',
    questionPrompt: `Compare the views of Source A and Source B on the government's support for businesses.\n\n${SS_COMPARISON_SOURCES}`,
    sbcsAnswer: 'Both sources address the government\'s approach to business support, but they differ fundamentally in their assessment. Source A, from the Minister\'s speech, presents the policy as proactive and effective — grants are a "targeted intervention" to ensure competitiveness. Source B, an editorial, argues the policy is flawed — it "risks widening inequality" because it excludes non-tech businesses. Source A\'s core message is that the government is taking decisive, effective action. Source B\'s core message is that the policy is well-intentioned but poorly targeted. This difference matters because it shows the gap between official government optimism and independent critical assessment of policy outcomes.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L4',
    expectedLabel: 'core message',
    minConfidence: 0.85,
  },

  // ── Social Studies: Inference ──
  {
    id: 'ss-inf-l2',
    subject: 'Social Studies',
    questionType: 'SBQ: Inference / Message (AO2)',
    topic: 'Issue 1: Exploring Citizenship and Governance',
    questionPrompt: `${SS_INFERENCE_QUESTION}\n\n${SS_COMPARISON_SOURCES}`,
    sbcsAnswer: 'Source A implies the government wants to appear proactive and in control — by announcing grants publicly, it projects an image of competence. Source B implies that the government\'s approach may be out of touch with actual business needs, favouring visible tech solutions over practical support for traditional businesses. The contrast implies a tension between how the government wants to be seen and how independent observers assess its policies.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L2',
    expectedLabel: 'Inferred message',
    minConfidence: 0.8,
  },

  // ── Social Studies: SEQ ──
  {
    id: 'ss-seq-l2',
    subject: 'Social Studies',
    questionType: 'SRQ/SEQ: Structured Essay Explanations (AO1)',
    topic: 'Issue 3: Responding to a Globalised World',
    questionPrompt: 'Explain how globalisation has affected Singapore\'s economy.',
    sbcsAnswer: '',
    seqAnswer: 'Globalisation has affected Singapore\'s economy by opening up trade opportunities. Singapore could export more goods to other countries because of free trade agreements. This helped the economy grow because more goods were sold overseas. Many companies also set up operations in Singapore, creating jobs for local workers. So globalisation was positive for Singapore because it created economic growth and jobs.',
    srqAnswer: '',
    expectedLevel: 'L2',
    expectedLabel: 'One factor',
    minConfidence: 0.75,
  },

  // ── History: Comparison ──
  {
    id: 'hist-comp-l4',
    subject: 'Elective History',
    questionType: 'SBQ: Comparison & Contrast (AO3)',
    topic: 'Cold War: Origins in Europe (*SBCS)',
    questionPrompt: `${HIST_QUESTION_COLDWAR}\n\n${HIST_SOURCES_COLDWAR}`,
    sbcsAnswer: 'Both sources address the origins of the Cold War, but from opposite perspectives. Source A, a Soviet memoir from 1965, blames the US — calling the Marshall Plan "economic imperialism." Source B, a US government memo from 1947, justifies the same policies as "defensive measures." The difference is explained by their provenance: a Soviet author writing for a domestic audience vs a US official document seeking Congressional approval. Each source reflects its author\'s national interests rather than an objective account.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L4',
    expectedLabel: 'provenance',
    minConfidence: 0.85,
  },

  // ── History: Inference ──
  {
    id: 'hist-inf-l2',
    subject: 'Elective History',
    questionType: 'SBQ: Inference / Message (AO3)',
    topic: 'Cold War: Origins in Europe (*SBCS)',
    questionPrompt: `What can you infer from the sources about the attitudes of the US and USSR during the Cold War?\n\n${HIST_SOURCES_COLDWAR}`,
    sbcsAnswer: 'Source A infers that the USSR viewed US actions as aggressive and expansionist — the language of "economic imperialism" and "encirclement" reveals a deep distrust of American motives. Source B infers that the US saw itself as defensive and reactive — framing its policies as necessary to "contain" Soviet expansion. The contrast in framing reveals that each superpower believed it was responding to the other\'s aggression, creating a spiral of mutual suspicion.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L2',
    expectedLabel: 'Inferred meaning',
    minConfidence: 0.8,
  },

  // ── History: Reliability ──
  {
    id: 'hist-rel-l4',
    subject: 'Elective History',
    questionType: 'SBQ: Reliability & Cross-Referencing (AO3)',
    topic: 'Cold War: Origins in Europe (*SBCS)',
    questionPrompt: `How reliable are these sources for understanding the origins of the Cold War?\n\n${HIST_SOURCES_COLDWAR}`,
    sbcsAnswer: 'Source A is a Soviet memoir from 1965 — the author has clear bias and is writing to justify Soviet policy to a domestic audience. It is reliable for understanding Soviet perceptions but not for factual accounts of US intentions. Source B is a US government memo from 1947 — it is primary evidence of how the US framed its policies internally, but it naturally omits any aggressive American motives. Cross-referencing reveals each source blames the other, suggesting neither is wholly reliable for an objective account. However, together they are very useful for understanding the competing narratives that drove the Cold War. A historian would need additional sources from neutral parties.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L4',
    expectedLabel: 'cross-reference',
    minConfidence: 0.85,
  },

  // ── All Formats (bundle) ──
  {
    id: 'ss-all-l2',
    subject: 'Social Studies',
    questionType: 'All Formats (SBCS + SEQ + SRQ Bundle)',
    topic: 'Issue 2: Living in a Diverse Society',
    questionPrompt: `How far do the sources support the view that Singapore is a harmonious society?\n\n${SS_COMPARISON_SOURCES}`,
    sbcsAnswer: 'Source A says the government is helping businesses. Source B says the help is not reaching everyone.',
    seqAnswer: 'One reason Singapore has social harmony is because of policies that promote racial integration, like the Ethnic Integration Policy in HDB estates. This policy ensures that different racial groups live together, which promotes understanding.',
    srqAnswer: 'In my opinion, government policies are important but not sufficient for social harmony. Citizens must also make an effort to understand each other.',
    expectedLevel: 'L2',
    expectedLabel: 'Similarity',
    minConfidence: 0.7,
  },

  // ── Short/insufficient answers (should trigger quality rules) ──
  {
    id: 'quality-too-short',
    subject: 'Social Studies',
    questionType: 'SBQ: Comparison & Contrast (AO2)',
    topic: 'Issue 1: Exploring Citizenship and Governance',
    questionPrompt: `Compare the two sources.\n\n${SS_COMPARISON_SOURCES}`,
    sbcsAnswer: 'Both sources are about the government.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L0',
    expectedLabel: 'Insufficient',
    minConfidence: 0.2,
  },

  // ── Purely SBCS submission (SEQ/SRQ empty) ──
  {
    id: 'ss-comp-sbcs-only',
    subject: 'Social Studies',
    questionType: 'SBQ: Comparison & Contrast (AO2)',
    topic: 'Issue 1: Exploring Citizenship and Governance',
    questionPrompt: `Compare the two sources.\n\n${SS_COMPARISON_SOURCES}`,
    sbcsAnswer: 'Both sources discuss government business support. Source A presents it as effective while Source B presents it as flawed. The similarity is both address government intervention. The difference is their assessment of its effectiveness — positive from the government versus critical from an independent editorial.',
    seqAnswer: '',
    srqAnswer: '',
    expectedLevel: 'L3',
    expectedLabel: 'similarity AND difference',
    minConfidence: 0.8,
  },
];

// ── Evaluate the eval set against the current grading API ──
// Run with: npx tsx lib/eval-set.ts
// Or import and call evaluateEvalSet() from a test file

export interface EvalResult {
  id: string;
  passed: boolean;
  expectedLevel: string;
  actualLevel: string;
  expectedLabel: string;
  actualLabel: string;
  confidence: number;
  errors: string[];
}

export async function evaluateEvalSet(gradeFn: (params: {
  sbcsAnswer: string;
  seqAnswer: string;
  srqAnswer: string;
  questionPrompt: string;
  questionType: string;
  subject: string;
  topic: string;
}) => Promise<{
  scoreLevel: string;
  scoreLabel: string;
  confidence: number;
}>): Promise<{ results: EvalResult[]; passed: number; failed: number; total: number }> {
  const results: EvalResult[] = [];

  for (const test of EVAL_SET) {
    const errors: string[] = [];

    try {
      const result = await gradeFn({
        sbcsAnswer: test.sbcsAnswer,
        seqAnswer: test.seqAnswer,
        srqAnswer: test.srqAnswer,
        questionPrompt: test.questionPrompt,
        questionType: test.questionType,
        subject: test.subject,
        topic: test.topic,
      });

      // Check level match
      const actualLevel = result.scoreLevel || '';
      const levelMatch = actualLevel === test.expectedLevel;
      if (!levelMatch) {
        errors.push(`Level mismatch: expected ${test.expectedLevel}, got ${actualLevel}`);
      }

      // Check label contains expected substring
      const labelMatch = result.scoreLabel.toLowerCase().includes(test.expectedLabel.toLowerCase());
      if (!labelMatch) {
        errors.push(`Label mismatch: expected to contain "${test.expectedLabel}", got "${result.scoreLabel}"`);
      }

      // Check minimum confidence
      if (result.confidence < test.minConfidence) {
        errors.push(`Confidence too low: expected >= ${test.minConfidence}, got ${result.confidence}`);
      }

      results.push({
        id: test.id,
        passed: errors.length === 0,
        expectedLevel: test.expectedLevel,
        actualLevel,
        expectedLabel: test.expectedLabel,
        actualLabel: result.scoreLabel,
        confidence: result.confidence,
        errors,
      });
    } catch (err) {
      results.push({
        id: test.id,
        passed: false,
        expectedLevel: test.expectedLevel,
        actualLevel: 'ERROR',
        expectedLabel: test.expectedLabel,
        actualLabel: String(err),
        confidence: 0,
        errors: [`Exception: ${err}`],
      });
    }
  }

  const passed = results.filter(r => r.passed).length;
  return { results, passed, failed: results.length - passed, total: results.length };
}

// Allow running directly: npx tsx lib/eval-set.ts
async function main() {
  console.log('Eval set loaded. EVAL_SET has', EVAL_SET.length, 'test cases.');
  console.log('\nTo run against the API, call evaluateEvalSet() with your grading function.\n');
  EVAL_SET.forEach(t => console.log(`  ${t.id}: expected ${t.expectedLevel} — "${t.expectedLabel}"`));
}

if (require.main === module) {
  main();
}
