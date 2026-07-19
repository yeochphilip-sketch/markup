import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsContent = readFileSync(path.join(__dirname, '..', 'lib', 'prompts.ts'), 'utf-8');
const lines = promptsContent.split('\n');

function estimateTokens(text) {
  // ~0.25 tokens per character for English prose
  return Math.round(text.length * 0.25);
}

function extractLines(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  EXACT PROMPT ASSEMBLY TRACE — Generation vs Grading   ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ════════════════════════════════════════
// PIPELINE 1: QUESTION GENERATION
// ════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│  PIPELINE 1: QUESTION GENERATION                            │');
console.log('└─────────────────────────────────────────────────────────────┘\n');

console.log('── getGenerateSystemPrompt() output ──\n');

// getGenerateSystemPrompt (lines 878-917) builds the string from scratch using const vars
// It includes SCHOOL_BENCHMARK_DATA but NOT LORMS, NOT few-shots, NOT CoT, NOT quality rules
const genSystemPrompt = extractLines(882, 916);
const genTokens = estimateTokens(genSystemPrompt);
console.log(genSystemPrompt);
console.log(`\n  chars: ${genSystemPrompt.length},  ~${genTokens} tokens\n`);

console.log(`── getGenerateSystemPrompt70B() adds: ──`);
const gen70bExtra = extractLines(928, 937);
const gen70bExtraTokens = estimateTokens(gen70bExtra);
console.log(gen70bExtra);
console.log(`\n  chars: ${gen70bExtra.length},  ~${gen70bExtraTokens} tokens`);

// Model answer examples from school-papers.ts
const schoolPapersContent = readFileSync(path.join(__dirname, '..', 'lib', 'school-papers.ts'), 'utf-8');
const modelAnsFuncStart = schoolPapersContent.indexOf('export function getModelAnswerExamples');
const modelAnsFuncEnd = schoolPapersContent.indexOf('\nexport ', modelAnsFuncStart + 10);
const modelAnsFuncText = schoolPapersContent.substring(
  modelAnsFuncStart, 
  modelAnsFuncEnd >= 0 ? modelAnsFuncEnd : schoolPapersContent.length
);
const modelAnsReturnMatch = modelAnsFuncText.match(/return\s*`([\s\S]*?)`;/);
const modelAnsContent = modelAnsReturnMatch ? modelAnsReturnMatch[1] : '(unable to extract)';
const modelAnsTokens = estimateTokens(modelAnsContent);
console.log(`\n  Model answer examples content: ~${modelAnsTokens} tokens\n`);

console.log(`── User prompt from route.ts (All Formats): ──`);
const genUserPrompt = `Generate one complete O-Level Social Studies FULL EXAM PACKAGE on the topic "Healthcare".\nSkill track: All Formats — generate ALL components (5 sources, 5 SBQ questions part A-E, plus subject-specific SRQ/SEQ sections).\nAll 5 sources are required.\nThe sources must be designed to test a RANGE of skills (inference, comparison, purpose, reliability, assertion).`;
console.log(`  chars: ${genUserPrompt.length},  ~${estimateTokens(genUserPrompt)} tokens`);

console.log(`\n── JSON instruction appended: ~${estimateTokens('{"fields": ["..."]}')} tokens`);

const totalGen8B = genTokens + estimateTokens(genUserPrompt) + 50;
const totalGen70B = genTokens + gen70bExtraTokens + modelAnsTokens + estimateTokens(genUserPrompt) + 50;
console.log(`\n  ═══════════════════════════════════════`);
console.log(`  ★ TOTAL 8B GEN CALL:  ~${totalGen8B} tokens  ✅ tiny`);
console.log(`  ★ TOTAL 70B GEN CALL: ~${totalGen70B} tokens  ✅ tiny`);
console.log(`  ═══════════════════════════════════════\n\n`);

// ════════════════════════════════════════
// PIPELINE 2: ANSWER GRADING
// ════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│  PIPELINE 2: ANSWER GRADING                                 │');
console.log('└─────────────────────────────────────────────────────────────┘\n');

console.log('── getGradeSystemPrompt() — All Formats SS output ──\n');

// getGradeSystemPrompt (lines 1033-1100) includes:
// 1. Role header + AOIs + sections (lines 1047-1056)
// 2. LORMS intro (lines 1058-1060)
// 3. ALL 7 SS LORMS matrices (injected via getLormsMatrix)
// 4. CHAIN_OF_THOUGHT
// 5. Few-shot header + ALL 11 few-shot examples
// 6. CONFIDENCE_INSTRUCTIONS
// 7. QUALITY_RULES
// 8. Output rules
// 9. SCHOOL_BENCHMARK_DATA

const gradeRole = extractLines(1047, 1056);
const lormsIntro = extractLines(1058, 1060);

const lormsSS = [
  extractLines(209, 221),   // SS_COMPARISON_LORMS
  extractLines(223, 232),   // SS_INFERENCE_LORMS
  extractLines(234, 244),   // SS_PURPOSE_LORMS
  extractLines(246, 257),   // SS_UTILITY_LORMS
  extractLines(259, 268),   // SS_SYNTHESIS_LORMS
  extractLines(270, 281),   // SS_SRQ_LORMS
  extractLines(283, 296),   // SS_SEQ_LORMS
].join('\n');

const chainOfThought = extractLines(14, 55);
const fewShotHeader = extractLines(1064, 1067);

// Format the few-shot examples the same way formatFewShotSection does
function formatFewShot(lines) {
  // The formatFewShotSection wraps each example in:
  // ### Example N: {level} Student Response\n\n**Student answer:**\n"""\n{text}\n"""\n\n**Correct evaluation:**...
  return lines.map((text, i) => {
    return `### Example ${i+1}\n${text}`;
  }).join('\n\n');
}

const invalidExamples = extractLines(421, 457);
const ssComparisonExamples = extractLines(375, 403);
const ssInferenceExamples = extractLines(405, 419);
const ssPurposeExamples = extractLines(587, 603);
const ssUtilityExamples = extractLines(606, 623);
const ssSynthesisExamples = extractLines(625, 642);
const ssSrqExamples = extractLines(460, 490);
const ssSeqExamples = extractLines(492, 511);

const allSSExamples = [
  invalidExamples,
  ssComparisonExamples,
  ssInferenceExamples,
  ssPurposeExamples,
  ssUtilityExamples,
  ssSynthesisExamples,
  ssSrqExamples,
  ssSeqExamples,
].join('\n\n');

const confidenceInstr = extractLines(57, 72);
const qualityRules = extractLines(74, 156);
const outputRules = extractLines(1074, 1084);
const schoolBenchmark = extractLines(164, 207);
const benchmarkFinal = extractLines(1086, 1098);

// Calculate per-component tokens
const gradeComponents = [
  ['Role header + AOIs + sections', gradeRole],
  ['LORMS intro', lormsIntro],
  ['ALL 7 SS LORMS matrices', lormsSS],
  ['CHAIN_OF_THOUGHT (42 lines)', chainOfThought],
  ['Few-shot header', fewShotHeader],
  ['Few-shot examples (3 invalid + 8 SS = 11 total)', allSSExamples],
  ['CONFIDENCE_INSTRUCTIONS (16 lines)', confidenceInstr],
  ['QUALITY_RULES (83 lines)', qualityRules],
  ['Output rules (11 lines)', outputRules],
  ['SCHOOL_BENCHMARK_DATA (44 lines)', schoolBenchmark],
  ['Benchmark final instructions (13 lines)', benchmarkFinal],
];

let gradeSysTotal = 0;
for (const [label, text] of gradeComponents) {
  const t = estimateTokens(text);
  gradeSysTotal += t;
  console.log(`  ${label.padEnd(50)} ${String(text.length).padStart(5)} chars  ~${t} tokens`);
}

// Calculate whitespace between parts (there are \n\n separators between sections)
const whitespaceTokens = estimateTokens('\n\n'.repeat(gradeComponents.length + 3));
gradeSysTotal += whitespaceTokens;
console.log(`  Whitespace between sections`.padEnd(50) + `                 ~${whitespaceTokens} tokens`);

console.log(`\n  ───────────────────────────────────────────────────────`);
console.log(`  GRADE SYSTEM PROMPT TOTAL     ${String(gradeSysTotal).padStart(5)} tokens`);

// JSON instruction from tryGradeWithFallbacks in grade/route.ts
const jsonInstr = `\n\nYou MUST respond with ONLY a valid JSON object using these exact keys:\n{\n  "scoreLevel": "string (e.g. 'L3')",\n  "scoreMarks": "number (e.g. 6)",\n  "scoreMaxMarks": "number (e.g. 8)",\n  "scoreLabel": "string (human-readable score, at least 4 chars)",\n  "sbcsScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "seqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "srqScore": { "level": "string (optional)", "marks": 0, "maxMarks": 0, "label": "string (optional)" },\n  "pointStatus": "'Pass' or 'Fail'",\n  "evidenceStatus": "'Pass' or 'Fail'",\n  "critique": ["string (min 10 chars)", "..."],\n  "highlightedSegments": [{"text": "string", "type": "'correct' | 'weak' | 'error'"}],\n  "a1Upgrade": "string (min 40 chars)",\n  "gradingConfidence": 0.5,\n  "modelAnswerConfidence": 0.5,\n  "schoolBenchmark": { "topTierEstimate": "string", "midTierEstimate": "string", "standardEstimate": "string", "explanation": "string (min 10 chars)" }\n}\nNo markdown, no code fences, no other text. Just the JSON object.`;
const jsonTokens = estimateTokens(jsonInstr);

// User prompt (getGradeUserPrompt) 
const userGradePrompt = `\nQUESTION PROMPT:\nStudy all sources. To what extent do these sources support the assertion that the government's healthcare policy was effective?\n\nSUBJECT: Social Studies\nTOPIC: Healthcare\nSKILL TRACK: All Formats\n\nSTUDENT ESSAY (submitted sections only):\n"""\nSBCS Answer:\n... (student answer ~500 chars)\n"""`;
const userTokens = estimateTokens(userGradePrompt);

console.log(`  + JSON instruction (route.ts)    ${String(jsonTokens).padStart(5)} tokens`);
console.log(`  + User prompt                    ${String(userTokens).padStart(5)} tokens`);

const grandTotal = gradeSysTotal + jsonTokens + userTokens;
console.log(`  ───────────────────────────────────────────────────────`);
console.log(`  ★ GRAND TOTAL PER GRADE CALL       ${String(grandTotal).padStart(5)} tokens`);

console.log(`\n  Context limits:`);
console.log(`    Groq Llama 3.1 8B:  8,192 tokens`);
console.log(`    Groq Llama 3.3 70B: 32,768 tokens`);
console.log(`    Gemini 2.5 Flash:   ~1,000,000 tokens`);

if (grandTotal > 8192) {
  console.log(`\n  ❌ EXCEEDS 8B limit by ${grandTotal - 8192} tokens`);
} else {
  console.log(`\n  ✅ Fits in 8B (${8192 - grandTotal} tokens remaining)`);
}

// ════════════════════════════════════════
// SINGLE SKILL TRACK COMPARISON
// ════════════════════════════════════════
console.log(`\n\n┌─────────────────────────────────────────────────────────────┐`);
console.log(`│  COMPARISON: SINGLE SKILL vs ALL FORMATS (grade)           │`);
console.log(`└─────────────────────────────────────────────────────────────┘\n`);

// Single skill example: SS Comparison
const singleLorms = [extractLines(209, 221)].join('\n');
const singleExamples = [invalidExamples, ssComparisonExamples].join('\n\n');

const singleComponents = [
  gradeRole, lormsIntro, singleLorms, chainOfThought, fewShotHeader,
  singleExamples, confidenceInstr, qualityRules, outputRules, schoolBenchmark, benchmarkFinal
];
let singleTotal = 0;
for (const text of singleComponents) {
  singleTotal += estimateTokens(text);
}
singleTotal += whitespaceTokens + jsonTokens + userTokens;
console.log(`  Single skill (Comparison):`);
console.log(`    1 LORMS matrix + 2 example sets + same CoT/Quality/Benchmark`);
console.log(`  ★ SINGLE SKILL GRADE TOTAL: ~${singleTotal} tokens`);
if (singleTotal > 8192) {
  console.log(`  ❌ EXCEEDS 8B by ${singleTotal - 8192} tokens`);
} else {
  console.log(`  ✅ Fits in 8B (${8192 - singleTotal} remaining)`);
}

console.log(`\n\n  All Formats vs Single Skill difference:`);
console.log(`  LORMS:    7 matrices vs 1    = +${(estimateTokens(lormsSS) - estimateTokens(singleLorms))} tokens`);
console.log(`  Examples: 11 sets vs 2       = +${(estimateTokens(allSSExamples) - estimateTokens(singleExamples))} tokens`);
console.log(`  Total diff: ${grandTotal - singleTotal} tokens`);

// ════════════════════════════════════════
// ALL_FORMATS_INSTRUCTIONS check
// ════════════════════════════════════════
const allFormatsInstr = extractLines(704, 846);
console.log(`\n\n┌─────────────────────────────────────────────────────────────┐`);
console.log(`│  BONUS: ALL_FORMATS_INSTRUCTIONS usage check                │`);
console.log(`└─────────────────────────────────────────────────────────────┘\n`);
console.log(`  ALL_FORMATS_INSTRUCTIONS defined: yes (${allFormatsInstr.length} chars, ~${estimateTokens(allFormatsInstr)} tokens)`);

const genFuncOutput = extractLines(878, 917);
const genFunc70BOutput = extractLines(925, 938);
console.log(`  Referenced in getGenerateSystemPrompt():     ${genFuncOutput.includes('ALL_FORMATS_INSTRUCTIONS') ? 'YES' : 'NO'}`);
console.log(`  Referenced in getGenerateSystemPrompt70B():  ${genFunc70BOutput.includes('ALL_FORMATS_INSTRUCTIONS') ? 'YES' : 'NO'}`);

const gradeFunction = extractLines(1033, 1100);
console.log(`  Referenced in getGradeSystemPrompt():         ${gradeFunction.includes('ALL_FORMATS_INSTRUCTIONS') ? 'YES' : 'NO'}`);

const routeG = extractLines(699, 847);
console.log(`  Used anywhere in prompts.ts after definition: ${routeG.includes('ALL_FORMATS_INSTRUCTIONS') ? 'YES' : 'NO'}`);
