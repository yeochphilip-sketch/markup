/**
 * Test script to verify the SBCS/SEQ/SRQ track separation logic.
 * Tests both the pure logic functions and (optionally) the API endpoint.
 */

// ── Replicate the track type helpers from the route ──
function getTrackType(questionType) {
  const lower = questionType.toLowerCase();
  if (lower.includes('all formats') || lower.includes('bundle')) return 'all-formats';
  if (lower.startsWith('sbq:')) return 'sbcs';
  if (lower.startsWith('seq:')) return 'seq';
  if (lower.startsWith('srq:')) return 'srq';
  if (lower.includes('seq') || lower.includes('essay')) return 'seq';
  if (lower.includes('srq') || lower.includes('structured response')) return 'srq';
  return 'sbcs';
}

function getSourceCountForTrack(trackType, questionType) {
  if (trackType === 'all-formats') return 5;
  if (trackType === 'sbcs') {
    const lower = questionType.toLowerCase();
    if (lower.includes('assertion') || lower.includes('synthesis')) return 5;
    return 2;
  }
  return 0; // SEQ / SRQ → no sources
}

// ── Test cases ──
const tests = [
  { skill: 'All Formats (SBCS + SEQ + SRQ Bundle)',           expectedTrack: 'all-formats', expectedSources: 5 },
  { skill: 'SBQ: Inference / Message (AO2)',                  expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SBQ: Comparison & Contrast (AO3)',                expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SBQ: Synthesis Matrix Assertion (AO2)',           expectedTrack: 'sbcs',       expectedSources: 5 },
  { skill: 'SBQ: Synthesis Matrix Assertion (AO3)',           expectedTrack: 'sbcs',       expectedSources: 5 },
  { skill: 'SBQ: Purpose / Motive Evolution (AO2)',           expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SBQ: Utility & Reliability Limits (AO2)',         expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SBQ: Reliability & Cross-Referencing (AO3)',      expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SBQ: Evaluation of Utility (AO3)',                expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SBQ: Target Purpose Analysis (AO3)',              expectedTrack: 'sbcs',       expectedSources: 2 },
  { skill: 'SRQ: Structured Response Questions (AO1)',         expectedTrack: 'srq',       expectedSources: 0 },
  { skill: 'SEQ: Structured Essay Questions (AO1)',            expectedTrack: 'seq',       expectedSources: 0 },
  { skill: 'SEQ: High-Scoring Essay Factor Prioritization (AO1/AO2)', expectedTrack: 'seq', expectedSources: 0 },
];

let passed = 0;
let failed = 0;

console.log('=== TRACK TYPE & SOURCE COUNT TESTS ===\n');

for (const test of tests) {
  const track = getTrackType(test.skill);
  const sources = getSourceCountForTrack(track, test.skill);
  
  const trackOk = track === test.expectedTrack;
  const sourcesOk = sources === test.expectedSources;
  
  const status = trackOk && sourcesOk ? '✅ PASS' : '❌ FAIL';
  if (trackOk && sourcesOk) passed++; else failed++;
  
  console.log(`${status} | ${test.skill}`);
  console.log(`        Track: ${track} (expected: ${test.expectedTrack}) ${trackOk ? '✓' : '✗'}`);
  console.log(`        Sources: ${sources} (expected: ${test.expectedSources}) ${sourcesOk ? '✓' : '✗'}`);
  console.log('');
}

console.log(`=== RESULTS: ${passed} passed, ${failed} failed, ${tests.length} total ===\n`);

// ── Optional: Test the API endpoint if server is available ──
(async () => {
  // Test SEQ generation
  try {
    console.log('=== TESTING SEQ API ENDPOINT ===\n');
    const seqRes = await fetch('http://localhost:3002/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Social Studies',
        topic: 'Issue 1: Exploring Citizenship and Governance',
        questionType: 'SEQ: Structured Essay Questions (AO1)',
      }),
    });
    
    if (seqRes.ok) {
      const data = await seqRes.json();
      console.log('SEQ Response keys:', Object.keys(data));
      console.log('trackType:', data.trackType);
      console.log('sourceA empty?', !data.sourceA);
      console.log('sourceB empty?', !data.sourceB);
      console.log('sbcsPrompt empty?', !data.sbcsPrompt);
      console.log('seqQuestion1:', data.seqQuestion1?.slice(0, 80) + '...');
      console.log('seqQuestion2:', data.seqQuestion2?.slice(0, 80) + '...');
      console.log('seqQuestion3:', data.seqQuestion3?.slice(0, 80) + '...');
      console.log('suggestedAnswer length:', data.suggestedAnswer?.length);
      console.log('Has sourceCount?', 'sourceCount' in data ? data.sourceCount : 'NOT in response');
      
      const seqOk = data.trackType === 'seq' && !data.sourceA && !data.sbcsPrompt && data.seqQuestion1;
      console.log(`\nSEQ Test: ${seqOk ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      const err = await seqRes.text();
      console.log('SEQ API Error:', err);
    }
  } catch (e) {
    console.log('SEQ API test skipped (server not available):', e.message);
  }

  // Test SBQ (comparison) generation
  try {
    console.log('\n=== TESTING SBQ COMPARISON API ENDPOINT ===\n');
    const sbqRes = await fetch('http://localhost:3002/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Social Studies',
        topic: 'Issue 2: Living in a Diverse Society',
        questionType: 'SBQ: Comparison & Contrast (AO2)',
      }),
    });
    
    if (sbqRes.ok) {
      const data = await sbqRes.json();
      console.log('SBQ Response keys:', Object.keys(data));
      console.log('trackType:', data.trackType);
      console.log('sourceA length:', data.sourceA?.length);
      console.log('sourceB length:', data.sourceB?.length);
      console.log('sourceC present?', !!data.sourceC);
      console.log('sbcsPrompt:', data.sbcsPrompt?.slice(0, 80) + '...');
      console.log('seqPrompt empty?', !data.seqPrompt);
      console.log('srqPrompt empty?', !data.srqPrompt);
      console.log('sourceCount:', data.sourceCount);
      
      const sbqOk = data.trackType === 'sbcs' && data.sourceA && data.sourceB && !data.sourceC && data.sbcsPrompt;
      console.log(`\nSBQ Test: ${sbqOk ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      const err = await sbqRes.text();
      console.log('SBQ API Error:', err);
    }
  } catch (e) {
    console.log('SBQ API test skipped (server not available):', e.message);
  }
  
  // Test SRQ generation
  try {
    console.log('\n=== TESTING SRQ API ENDPOINT ===\n');
    const srqRes = await fetch('http://localhost:3002/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Social Studies',
        topic: 'Issue 3: Responding to a Globalised World',
        questionType: 'SRQ: Structured Response Questions (AO1)',
      }),
    });
    
    if (srqRes.ok) {
      const data = await srqRes.json();
      console.log('SRQ Response keys:', Object.keys(data));
      console.log('trackType:', data.trackType);
      console.log('sourceA empty?', !data.sourceA);
      console.log('sbcsPrompt empty?', !data.sbcsPrompt);
      console.log('seqPrompt empty?', !data.seqPrompt);
      console.log('srqQuestionA:', data.srqQuestionA?.slice(0, 80) + '...');
      console.log('srqQuestionB:', data.srqQuestionB?.slice(0, 80) + '...');
      console.log('srqBackgroundContext:', data.srqBackgroundContext?.slice(0, 80) + '...');
      console.log('sourceCount:', data.sourceCount);
      
      const srqOk = data.trackType === 'srq' && !data.sourceA && data.srqQuestionA && data.srqQuestionB;
      console.log(`\nSRQ Test: ${srqOk ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      const err = await srqRes.text();
      console.log('SRQ API Error:', err);
    }
  } catch (e) {
    console.log('SRQ API test skipped (server not available):', e.message);
  }

  // Test Assertion (5 sources) generation
  try {
    console.log('\n=== TESTING ASSERTION (5-SOURCE) API ENDPOINT ===\n');
    const asRes = await fetch('http://localhost:3002/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Social Studies',
        topic: 'Issue 2: Living in a Diverse Society',
        questionType: 'SBQ: Synthesis Matrix Assertion (AO2)',
      }),
    });
    
    if (asRes.ok) {
      const data = await asRes.json();
      console.log('Assertion Response keys:', Object.keys(data));
      console.log('trackType:', data.trackType);
      console.log('sourceA present?', !!data.sourceA);
      console.log('sourceB present?', !!data.sourceB);
      console.log('sourceC present?', !!data.sourceC);
      console.log('sourceD present?', !!data.sourceD);
      console.log('sourceE present?', !!data.sourceE);
      console.log('sourceCount:', data.sourceCount);
      console.log('sbcsPrompt:', data.sbcsPrompt?.slice(0, 80) + '...');
      
      const asOk = data.trackType === 'sbcs' && data.sourceA && data.sourceC && data.sourceE && data.sbcsPrompt;
      console.log(`\nAssertion Test: ${asOk ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      const err = await asRes.text();
      console.log('Assertion API Error:', err);
    }
  } catch (e) {
    console.log('Assertion API test skipped (server not available):', e.message);
  }

  process.exit(failed > 0 ? 1 : 0);
})();
