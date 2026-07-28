/**
 * MARKUP Model Answer Inspector
 *
 * Calls the grading API with a sample answer and prints the FULL response
 * so you can inspect what the AI generates for a1Upgrade.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run this script:       npx tsx scripts/inspect-model-answer.ts
 *
 * You can also pass custom answers as arguments:
 *   npx tsx scripts/inspect-model-answer.ts "My SBCS answer" "My SEQ answer"
 */

const SAMPLE_SOURCES = `
Background Information: In 2020, the Singapore government introduced several
initiatives to support local businesses during the economic slowdown caused by
the COVID-19 pandemic.

Source A: Speech by the Minister for Trade and Industry, March 2020:
"Our new digitalisation grant scheme will provide up to $50,000 for small and
medium enterprises to adopt e-commerce solutions. This is a targeted intervention
to ensure our local businesses remain competitive in the new normal."

Source B: Editorial in The Straits Times, April 2020:
"The government's grants, while generous on paper, primarily benefit tech-ready
firms. Traditional hawkers and family-run shops often lack the digital literacy
to even apply for these schemes. Without bridging this gap, the policy risks
widening the inequality it claims to address."
`;

async function main() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const args = process.argv.slice(2);

  // Default: use a strong L4-level answer to see what the AI outputs
  const sbcsAnswer = args[0] || `Both sources address the government's approach to business support during the economic slowdown, but they differ fundamentally in their assessment. 

Source A, from the Minister's speech, presents the policy as proactive and effective — the digitalisation grants are described as a "targeted intervention" to ensure competitiveness. The provenance matters: as a government minister speaking publicly, Source A's purpose is to justify and promote the policy. Its message is that the government is taking decisive, well-designed action.

Source B, an editorial in The Straits Times, takes a critical stance. Its core message is that the policy, while well-intentioned, is poorly targeted — it "risks widening the inequality it claims to address" because it excludes non-tech businesses. The editorial's purpose is to provide independent scrutiny and highlight gaps in policy implementation.

The key difference is in their overall assessment: Source A views the policy as effective intervention, while Source B sees it as flawed execution. This difference is explained by their provenance — one is an official government communication, the other is independent media critique. Together, they provide a balanced picture: the policy intent is good, but the implementation needs refinement.`;

  const seqAnswer = args[1] || '';
  const srqAnswer = args[2] || '';

  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     MARKUP — Model Answer Inspector           ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Target : ${BASE_URL}/api/grade`);
  console.log(`  SBCS   : ${sbcsAnswer.slice(0, 60)}... (${sbcsAnswer.length} chars)`);
  console.log(`  SEQ    : ${seqAnswer || '(empty)'}`);
  console.log(`  SRQ    : ${srqAnswer || '(empty)'}`);
  console.log('');

  // ── Health check ──
  try {
    const health = await fetch(`${BASE_URL}/api/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sbcsAnswer: 'health-check',
        seqAnswer: '',
        srqAnswer: '',
        questionPrompt: 'test',
        questionType: 'SBQ: Comparison & Contrast (AO2)',
        subject: 'Social Studies',
        topic: 'test',
      }),
    });
    if (health.status === 500) {
      const body = await health.json();
      console.error('✖ Server is running but grading is unavailable.');
      console.error(`  ${body.error || 'Unknown error'}`);
      console.error('');
      console.error('  Make sure GROQ_API_KEY is set in .env.local');
      process.exit(1);
    }
    console.log('  ✓ Server is reachable');
  } catch {
    console.error('✖ Cannot reach server at ' + BASE_URL);
    console.error('');
    console.error('  Start the dev server first:  npm run dev');
    console.error('  Then run:                    npx tsx scripts/inspect-model-answer.ts');
    process.exit(1);
  }

  console.log('');
  console.log('  Calling grading API...');
  console.log('');

  const startTime = Date.now();

  const res = await fetch(`${BASE_URL}/api/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sbcsAnswer,
      seqAnswer,
      srqAnswer,
      questionPrompt: `Compare the views of Source A and Source B on the government's support for businesses during the economic slowdown.\n\n${SAMPLE_SOURCES}`,
      questionType: 'SBQ: Comparison & Contrast (AO2)',
      subject: 'Social Studies',
      topic: 'Issue 1: Exploring Citizenship and Governance',
    }),
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!res.ok) {
    const errText = await res.text();
    console.error(`✖ HTTP ${res.status}: ${errText.slice(0, 500)}`);
    process.exit(1);
  }

  const data = await res.json();

  console.log(`  ✓ Response received in ${elapsed}s`);
  console.log('');
  console.log('═'.repeat(60));
  console.log('  SCORE SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Level      : ${data.scoreLevel}`);
  console.log(`  Marks      : ${data.scoreMarks}/${data.scoreMaxMarks}`);
  console.log(`  Label      : ${data.scoreLabel}`);
  console.log(`  Confidence : ${data.gradingConfidence}`);
  console.log(`  Model Used : ${data._model || 'unknown'}`);
  console.log('');

  console.log('═'.repeat(60));
  console.log('  CRITIQUE');
  console.log('═'.repeat(60));
  if (data.critique && Array.isArray(data.critique)) {
    data.critique.forEach((c: string, i: number) => {
      console.log(`  ${i + 1}. ${c}`);
    });
  } else {
    console.log('  (none)');
  }
  console.log('');

  console.log('═'.repeat(60));
  console.log('  MODEL ANSWER (a1Upgrade)');
  console.log('═'.repeat(60));
  console.log('');
  if (data.a1Upgrade) {
    // Split by lines and print with line numbers for easier reference
    const lines = data.a1Upgrade.split('\n');
    lines.forEach((line: string, i: number) => {
      console.log(`  ${(i + 1).toString().padStart(3, ' ')} │ ${line}`);
    });
  } else {
    console.log('  (no a1Upgrade in response)');
  }
  console.log('');

  console.log('═'.repeat(60));
  console.log('  MODEL ANSWER CONFIDENCE');
  console.log('═'.repeat(60));
  console.log(`  modelAnswerConfidence : ${data.modelAnswerConfidence}`);
  console.log('');

  console.log('═'.repeat(60));
  console.log('  HIGHLIGHTED SEGMENTS');
  console.log('═'.repeat(60));
  if (data.highlightedSegments && Array.isArray(data.highlightedSegments)) {
    data.highlightedSegments.forEach((seg: { text: string; type: string }, i: number) => {
      console.log(`  [${seg.type}] ${seg.text.slice(0, 100)}${seg.text.length > 100 ? '...' : ''}`);
    });
  }
  console.log('');

  // Check for grading quality issues
  if (data._gradeQualityIssues) {
    console.log('═'.repeat(60));
    console.log('  ⚠  QUALITY ISSUES');
    console.log('═'.repeat(60));
    (data._gradeQualityIssues as string[]).forEach((issue: string) => {
      console.log(`  ✖ ${issue}`);
    });
    console.log('');
  }

  console.log('═'.repeat(60));
  console.log('  RAW JSON (a1Upgrade field only, truncated)');
  console.log('═'.repeat(60));
  console.log(data.a1Upgrade ? data.a1Upgrade.substring(0, 3000) : '(empty)');
  if (data.a1Upgrade && data.a1Upgrade.length > 3000) {
    console.log(`  ... (${data.a1Upgrade.length - 3000} more chars)`);
  }
  console.log('');
  console.log(`  Total response size: ~${JSON.stringify(data).length} chars`);
  console.log('');
}

main().catch((err) => {
  console.error('\n  Fatal error:', err);
  process.exit(1);
});
