/**
 * MARKUP Model Answer Inspector — Vitest version
 *
 * Calls the grade API route directly (no dev server needed) and logs
 * the full AI model answer output for manual inspection.
 *
 * Usage:
 *   npx vitest run scripts/inspect-model-answer.test.ts -t "inspect" 2>&1 | head -300
 *
 * Or to see the full output:
 *   npx vitest run scripts/inspect-model-answer.test.ts -t "inspect" 2>&1 | cat
 */

import { describe, it, expect } from 'vitest';

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

describe('Model Answer Inspector', () => {
  it('inspect a1Upgrade output from grading AI', async () => {
    const sbcsAnswer = `Both sources address the government's approach to business support during the economic slowdown, but they differ fundamentally in their assessment.

Source A, from the Minister's speech, presents the policy as proactive and effective. Its message is that the government is taking decisive, well-designed action. The provenance matters: as a government minister speaking publicly, Source A's purpose is to justify and promote the digitalisation grant scheme.

Source B, an editorial in The Straits Times, takes a critical stance. Its core message is that the policy, while well-intentioned, is poorly targeted — it "risks widening the inequality it claims to address" because it excludes non-tech businesses. The provenance as an independent editorial means its purpose is to provide scrutiny.

The key difference is in their overall assessment: Source A views the policy as effective intervention, while Source B sees it as flawed execution. Together, they provide a balanced picture: the policy intent is good, but the implementation needs refinement.`;

    const { POST } = await import('@/app/api/grade/route');

    const req = new Request('http://localhost:3000/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sbcsAnswer,
        seqAnswer: '',
        srqAnswer: '',
        questionPrompt: `Compare the views of Source A and Source B on the government's support for businesses during the economic slowdown.\n\n${SAMPLE_SOURCES}`,
        questionType: 'SBQ: Comparison & Contrast (AO2)',
        subject: 'Social Studies',
        topic: 'Issue 1: Exploring Citizenship and Governance',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    // Print everything for inspection
    console.log('');
    console.log('═'.repeat(65));
    console.log('  SCORE SUMMARY');
    console.log('═'.repeat(65));
    console.log(`  Level      : ${data.scoreLevel}`);
    console.log(`  Marks      : ${data.scoreMarks}/${data.scoreMaxMarks}`);
    console.log(`  Label      : ${data.scoreLabel}`);
    console.log(`  Confidence : ${data.gradingConfidence}`);
    console.log('');

    console.log('═'.repeat(65));
    console.log('  MODEL ANSWER CONFIDENCE');
    console.log('═'.repeat(65));
    console.log(`  modelAnswerConfidence : ${data.modelAnswerConfidence}`);
    console.log('');

    console.log('═'.repeat(65));
    console.log('  CRITIQUE');
    console.log('═'.repeat(65));
    if (data.critique && Array.isArray(data.critique)) {
      data.critique.forEach((c: string, i: number) => {
        console.log(`  ${i + 1}. ${c}`);
      });
    }
    console.log('');

    console.log('═'.repeat(65));
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║          MODEL ANSWER (a1Upgrade)                ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');
    if (data.a1Upgrade) {
      const lines = data.a1Upgrade.split('\n');
      lines.forEach((line: string, i: number) => {
        console.log(`  ${(i + 1).toString().padStart(3, ' ')} │ ${line}`);
      });
      console.log('');
      console.log(`  (${lines.length} lines, ${data.a1Upgrade.length} chars)`);
    } else {
      console.log('  (no a1Upgrade in response)');
    }
    console.log('');

    console.log('═'.repeat(65));
    console.log('  HIGHLIGHTED SEGMENTS');
    console.log('═'.repeat(65));
    if (data.highlightedSegments && Array.isArray(data.highlightedSegments)) {
      data.highlightedSegments.forEach((seg: { text: string; type: string }, i: number) => {
        console.log(`  [${seg.type}] ${seg.text.slice(0, 150)}${seg.text.length > 150 ? '...' : ''}`);
      });
    }
    console.log('');

    if (data._gradeQualityIssues) {
      console.log('═'.repeat(65));
      console.log('  ⚠  QUALITY ISSUES');
      console.log('═'.repeat(65));
      (data._gradeQualityIssues as string[]).forEach((issue: string) => {
        console.log(`  ✖ ${issue}`);
      });
      console.log('');
    }

    console.log('═'.repeat(65));
    console.log('  SCHOOL BENCHMARK');
    console.log('═'.repeat(65));
    if (data.schoolBenchmark) {
      console.log(`  Top-tier   : ${data.schoolBenchmark.topTierEstimate}`);
      console.log(`  Mid-tier   : ${data.schoolBenchmark.midTierEstimate}`);
      console.log(`  Standard   : ${data.schoolBenchmark.standardEstimate}`);
      console.log(`  Explanation: ${data.schoolBenchmark.explanation}`);
    }
    console.log('');

    // ── Assert a1Upgrade has double-quoted quotes and LORMS labels ──
    expect(data.a1Upgrade).toMatch(/"[^"]{5,}"/); // has double-quoted text
    expect(data.a1Upgrade).toMatch(/L[1-6]/); // has LORMS level label

    // Log any quality issues
    if (data._gradeQualityIssues) {
      console.log('  ⚠ a1Upgrade failed post-grade quality validation!');
    }

    expect(res.status).toBe(200);
    expect(data.a1Upgrade).toBeTruthy();
    expect(data.a1Upgrade.length).toBeGreaterThan(100);
  }, 60000);

  it('inspect SEQ model answer output from grading AI', async () => {
    const seqAnswer = `The origins of the Cold War were caused by both American economic expansionism and Soviet defensive paranoia, of which American expansionism was the more significant trigger.

The Truman Doctrine and Marshall Plan were perceived by the USSR as aggressive economic imperialism designed to encircle the Soviet Union. The US offered financial aid to European nations recovering from WWII, but this aid came with strings attached — it required recipients to adopt open-market economies, which naturally excluded the Soviet sphere of influence. This can be interpreted as the US deliberately using economic leverage to expand its influence at the expense of the USSR.

However, the Soviet perspective must also be considered. The USSR had suffered devastating losses in WWII (27 million dead) and was genuinely fearful of a revived Germany. Stalin wanted a buffer zone of friendly states in Eastern Europe to prevent future invasions. From the Soviet viewpoint, the Marshall Plan was not generosity but a threat — an attempt to pull Eastern European states out of the Soviet orbit and rebuild Germany as a US ally.

Therefore, while both sides contributed to the Cold War's origins, American economic expansionism was the more significant trigger because it was the proactive action that forced the USSR to respond defensively. The Marshall Plan predated and provoked the Soviet consolidation of Eastern Europe, not the other way around. The US had the initiative; the USSR was reacting to perceived encirclement.`;

    const { POST } = await import('@/app/api/grade/route');

    const req = new Request('http://localhost:3000/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sbcsAnswer: '',
        seqAnswer,
        srqAnswer: '',
        questionPrompt: 'Explain the origins of the Cold War. What were the key factors that led to tensions between the US and USSR? Which factor was more significant?',
        questionType: 'SEQ: Factor Prioritization (AO1/AO2)',
        subject: 'Elective History',
        topic: 'Cold War: Origins in Europe',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    console.log('');
    console.log('═'.repeat(65));
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║   SEQ / HISTORY — MODEL ANSWER (a1Upgrade)      ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Score Level      : ${data.scoreLevel}`);
    console.log(`  Score Marks      : ${data.scoreMarks}/${data.scoreMaxMarks}`);
    console.log(`  Score Label      : ${data.scoreLabel}`);
    console.log(`  Confidence       : ${data.gradingConfidence}`);
    console.log(`  Model Ans Conf   : ${data.modelAnswerConfidence}`);
    console.log('');

    if (data.a1Upgrade) {
      const lines = data.a1Upgrade.split('\n');
      lines.forEach((line: string, i: number) => {
        console.log(`  ${(i + 1).toString().padStart(3, ' ')} │ ${line}`);
      });
      console.log('');
      console.log(`  (${lines.length} lines, ${data.a1Upgrade.length} chars)`);
    } else {
      console.log('  (no a1Upgrade in response)');
    }
    console.log('');

    if (data._gradeQualityIssues) {
      console.log('═'.repeat(65));
      console.log('  ⚠  QUALITY ISSUES');
      console.log('═'.repeat(65));
      (data._gradeQualityIssues as string[]).forEach((issue: string) => {
        console.log(`  ✖ ${issue}`);
      });
      console.log('');
    }

    // ── Assert a1Upgrade has LORMS labels and PEEL structure ──
    // SEQ model answers don't have source quotes — they use CK with specific evidence
    expect(data.a1Upgrade).toMatch(/L[1-6]/); // has LORMS level label
    expect(data.a1Upgrade).toMatch(/Point:|Evidence:|Explanation:|Link:/); // has PEEL markers
    // Should contain some specific historical evidence (numbers, dates, or named entities)
    const hasSpecificEvidence = /\d{4}|\d+\s*(million|billion|%)/.test(data.a1Upgrade);
    if (!hasSpecificEvidence) {
      console.log('  ⚠  SEQ model answer may lack specific historical evidence (no years/numbers found)');
    }

    expect(res.status).toBe(200);
    expect(data.a1Upgrade).toBeTruthy();
    expect(data.a1Upgrade.length).toBeGreaterThan(100);
  }, 90000);
});
