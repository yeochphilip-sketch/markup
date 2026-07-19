import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsContent = readFileSync(path.join(__dirname, '..', 'lib', 'prompts.ts'), 'utf-8');
const lines = promptsContent.split('\n');

function extractLines(startLine, endLine) {
  // 1-indexed line numbers as shown by grep -n
  return lines.slice(startLine - 1, endLine).join('\n');
}

function estimateTokens(text) {
  // More accurate: 0.25 tokens/char for English prose
  return Math.round(text.length * 0.25);
}

function tokenRange(desc, text) {
  const t = estimateTokens(text);
  const chars = text.length;
  console.log(`  ${desc}: ${chars.toLocaleString()} chars, ~${t.toLocaleString()} tokens`);
  return t;
}

console.log('=== PRECISE TOKEN COUNTING (by line ranges) ===\n');

console.log('--- SHARED PROMPT CONSTANTS ---\n');
let sharedTotal = 0;

sharedTotal += tokenRange('CHAIN_OF_THOUGHT', extractLines(14, 55));  // lines 14 to end of block
sharedTotal += tokenRange('CONFIDENCE_INSTRUCTIONS', extractLines(57, 72));
sharedTotal += tokenRange('QUALITY_RULES', extractLines(74, 156));
sharedTotal += tokenRange('SCHOOL_BENCHMARK_DATA', extractLines(164, 207));
const allFormatsInstr = extractLines(704, 846);
sharedTotal += tokenRange('ALL_FORMATS_INSTRUCTIONS', allFormatsInstr);
const generationSourceRules = extractLines(848, 875);
sharedTotal += tokenRange('GENERATION_SOURCE_RULES', generationSourceRules);

console.log(`  --- Shared total: ~${sharedTotal.toLocaleString()} tokens`);

console.log('\n--- LORMS MATRICES (individual) ---\n');
let lormsTotal = 0;

const lormsRanges = {
  'SS_COMPARISON_LORMS': [209, 221],
  'SS_INFERENCE_LORMS': [223, 232],
  'SS_PURPOSE_LORMS': [234, 244],
  'SS_UTILITY_LORMS': [246, 257],
  'SS_SYNTHESIS_LORMS': [259, 268],
  'SS_SRQ_LORMS': [270, 281],
  'SS_SEQ_LORMS': [283, 296],
  'HIST_COMPARISON_LORMS': [298, 307],
  'HIST_INFERENCE_LORMS': [309, 316],
  'HIST_PURPOSE_LORMS': [340, 349],
  'HIST_RELIABILITY_LORMS': [318, 327],
  'HIST_UTILITY_LORMS': [329, 338],
  'HIST_SEQ_LORMS': [351, 362],
};

for (const [name, [start, end]] of Object.entries(lormsRanges)) {
  lormsTotal += tokenRange(name, extractLines(start, end));
}
console.log(`  --- LORMS total: ~${lormsTotal.toLocaleString()} tokens`);

console.log('\n--- FEW-SHOT EXAMPLES (ALL) ---\n');
let fsTotal = 0;

const fsRanges = {
  'INVALID_CONTENT_EXAMPLES (3 ex)': [421, 457],  // lines 421 to 458 or so
  'SS_COMPARISON_EXAMPLES (2 ex)': [375, 403],
  'SS_INFERENCE_EXAMPLES (1 ex)': [405, 419],
  'SS_PURPOSE_EXAMPLES (1 ex)': [587, 603],
  'SS_UTILITY_EXAMPLES (1 ex)': [606, 623],
  'SS_SYNTHESIS_EXAMPLES (1 ex)': [625, 642],
  'SS_SRQ_EXAMPLES (2 ex)': [460, 490],
  'SS_SEQ_EXAMPLES (1 ex)': [492, 511],
  'HIST_COMPARISON_EXAMPLES (2 ex)': [513, 548],
  'HIST_INFERENCE_EXAMPLES (2 ex)': [550, 585],
  'HIST_SEQ_EXAMPLES (1 ex)': [644, 662],
  'HIST_RELIABILITY_EXAMPLES (2 ex)': [664, 700],
};

for (const [name, [start, end]] of Object.entries(fsRanges)) {
  fsTotal += tokenRange(name, extractLines(start, end));
}
console.log(`  --- Few-shot total: ~${fsTotal.toLocaleString()} tokens`);

console.log('\n========================================');
console.log('=== GRADE SYSTEM PROMPT — ALL FORMATS SS ===');
console.log('========================================\n');

// The grade system prompt includes:
// - Header (~20 lines) = ~200 tokens
// - ALL 7 SS LORMS matrices = lormsTotal
// - CHAIN_OF_THOUGHT
// - FEW-SHOT = invalid (3) + all SS examples (9) = subset of fsTotal
// - CONFIDENCE_INSTRUCTIONS
// - QUALITY_RULES
// - Output instructions (~30 lines)
// - SCHOOL_BENCHMARK_DATA

// SS few-shot examples + invalid
const ssFsTotal = 
  tokenRange('INVALID (3 ex)', extractLines(421, 457)) +
  tokenRange('COMPARISON (2 ex)', extractLines(375, 403)) +
  tokenRange('INFERENCE (1 ex)', extractLines(405, 419)) +
  tokenRange('PURPOSE (1 ex)', extractLines(587, 603)) +
  tokenRange('UTILITY (1 ex)', extractLines(606, 623)) +
  tokenRange('SYNTHESIS (1 ex)', extractLines(625, 642)) +
  tokenRange('SRQ (2 ex)', extractLines(460, 490)) +
  tokenRange('SEQ (1 ex)', extractLines(492, 511));

// Now build the full grade system prompt
let gradeTotal = 0;

console.log('\n--- FINAL ASSEMBLY ---\n');
gradeTotal += tokenRange('1. System header + AOIs + sections', extractLines(1047, 1056));
gradeTotal += tokenRange('2. LORMS intro text', extractLines(1058, 1060));
gradeTotal += lormsTotal;
gradeTotal += tokenRange('3. Blank line + CHAIN_OF_THOUGHT label', '');
gradeTotal += tokenRange('   CHAIN_OF_THOUGHT', extractLines(14, 55));
gradeTotal += tokenRange('4. Few-shot header', extractLines(1064, 1067));
gradeTotal += ssFsTotal;
gradeTotal += tokenRange('5. CONFIDENCE_INSTRUCTIONS', extractLines(57, 72));
gradeTotal += tokenRange('6. QUALITY_RULES', extractLines(74, 156));
gradeTotal += tokenRange('7. Output rules (lines 1074-1084)', extractLines(1074, 1084));
gradeTotal += tokenRange('8. SCHOOL_BENCHMARK_DATA', extractLines(164, 207));
gradeTotal += tokenRange('9. School benchmark final instructions (1096-1098)', extractLines(1096, 1098));

// Markdown/format overhead (~15%)
const overhead = Math.round(gradeTotal * 0.15);

console.log(`\n   Markdown/formatting overhead (15%): ~${overhead} tokens`);
console.log(`\n  ════════════════════════════════════════`);
console.log(`  TOTAL GRADE SYSTEM PROMPT: ~${(gradeTotal + overhead).toLocaleString()} tokens`);
console.log(`  + JSON instruction (appended in route): ~${150} tokens`);
console.log(`  + User prompt (question + answer, ~500 chars): ~${125} tokens`);
console.log(`  ────────────────────────────────────────`);
const grandTotal = gradeTotal + overhead + 150 + 125;
console.log(`  GRAND TOTAL PER GRADE CALL: ~${grandTotal.toLocaleString()} tokens`);
console.log(`  ════════════════════════════════════════\n`);

console.log(`  Groq Llama 3.1 8B context window:  8,192 tokens`);
console.log(`  Groq Llama 3.3 70B context window: 32,768 tokens`);
console.log(`  Gemini 2.5 Flash context window:   ~1,000,000 tokens`);

if (grandTotal > 8192) {
  console.log(`\n  ❌ EXCEEDS 8B limit by ${(grandTotal - 8192).toLocaleString()} tokens!`);
} else {
  const remaining = 8192 - grandTotal;
  console.log(`\n  ✅ Fits within 8B limit (${remaining.toLocaleString()} tokens remaining)`);
}

console.log('\n========================================');
console.log('=== GENERATION PROMPT (All Formats) ===');
console.log('========================================\n');

// getGenerateSystemPrompt
let genTotal = 0;
genTotal += tokenRange('1. SEAB examiner header', extractLines(882, 890));
genTotal += tokenRange('2. General instructions', extractLines(891, 893));
genTotal += tokenRange('3. Source requirements', extractLines(895, 897));
genTotal += tokenRange('4. Strict rules', extractLines(899, 908));
genTotal += tokenRange('5. SCHOOL_BENCHMARK_DATA', extractLines(164, 207));

const genOverhead = Math.round(genTotal * 0.10);
console.log(`\n   Overhead: ~${genOverhead} tokens`);
console.log(`\n  TOTAL GENERATION SYSTEM PROMPT: ~${(genTotal + genOverhead).toLocaleString()} tokens`);

// 70B version adds model answer examples
const schoolPapersContent = readFileSync(path.join(__dirname, '..', 'lib', 'school-papers.ts'), 'utf-8');
// The model answer examples are the getModelAnswerExamples function output
// Let's search for the function
const ansMatch = schoolPapersContent.match(/export function getModelAnswerExamples[\s\S]*?^export|export function getFormatForFewShot[\s\S]*?^export/);
const ansExamplesStart = schoolPapersContent.indexOf('export function getModelAnswerExamples');
let ansExamplesText = '';
if (ansExamplesStart >= 0) {
  // Find the next export or end of file
  const nextExport = schoolPapersContent.indexOf('\nexport ', ansExamplesStart + 10);
  ansExamplesText = nextExport >= 0 
    ? schoolPapersContent.substring(ansExamplesStart, nextExport)
    : schoolPapersContent.substring(ansExamplesStart);
}

console.log(`\n--- 70B ADDITION: Model Answer Examples ---`);
const ansTokens = estimateTokens(ansExamplesText);
console.log(`  Characters: ${ansExamplesText.length.toLocaleString()}`);
console.log(`  Est tokens: ~${ansTokens.toLocaleString()}`);

const gen70bTotal = genTotal + genOverhead + ansTokens;
console.log(`\n  TOTAL 70B GENERATION PROMPT: ~${gen70bTotal.toLocaleString()} tokens`);

// Check if ALL_FORMATS_INSTRUCTIONS is referenced in generation
const genFuncMatch = promptsContent.match(/export function getGenerateSystemPrompt[\s\S]*?(?=export function getGenerateSystemPrompt70B)/);
const genFuncText = genFuncMatch ? genFuncMatch[0] : '';
const usesAllFormats = genFuncText.includes('ALL_FORMATS_INSTRUCTIONS');
console.log(`\n  ALL_FORMATS_INSTRUCTIONS used in base gen prompt: ${usesAllFormats ? 'YES' : 'NO'}`);

const gen70bFuncMatch = promptsContent.match(/export function getGenerateSystemPrompt70B[\s\S]*?(?=function getSubjectLabel)/);
const gen70bFuncText = gen70bFuncMatch ? gen70bFuncMatch[0] : '';
const usesAllFormats70b = gen70bFuncText.includes('ALL_FORMATS_INSTRUCTIONS');
console.log(`  ALL_FORMATS_INSTRUCTIONS used in 70B gen prompt: ${usesAllFormats70b ? 'YES' : 'NO'}`);

console.log(`\n  ALL_FORMATS_INSTRUCTIONS is defined but: ${(!usesAllFormats && !usesAllFormats70b) ? '⚠️  NOT USED in generation prompts!' : '✅ USED'}`);

console.log('\n========================================');
console.log('=== DUPLICATION ANALYSIS ===');
console.log('========================================\n');

// Check overlap between CHAIN_OF_THOUGHT and QUALITY_RULES
const cot = extractLines(14, 55);
const qr = extractLines(74, 156);

// Count overlapping content (e.g., both mention quality gate)
const cotHasQualityGate = cot.toLowerCase().includes('quality gate');
const qrHasQualityGate = qr.toLowerCase().includes('quality gate');
const cotHasReject = cot.toLowerCase().includes('reject as');
const qrHasReject = qr.toLowerCase().includes('explicitly reject');

console.log(`CHAIN_OF_THOUGHT mentions quality gate: ${cotHasQualityGate}`);
console.log(`QUALITY_RULES mentions quality gate: ${qrHasQualityGate}`);
console.log(`CHAIN_OF_THOUGHT has rejection rules: ${cotHasReject}`);
console.log(`QUALITY_RULES has rejection rules: ${qrHasReject}`);
console.log(`\nOverlapping token estimate: ~${Math.round(estimateTokens(cot) * 0.60).toLocaleString()} tokens`);
console.log(`(roughly 60% of CHAIN_OF_THOUGHT duplicated in QUALITY_RULES)\n`);

// Count total duplicate ratio by checking overlapping keywords
const cotWords = new Set(cot.toLowerCase().split(/\s+/));
const qrWords = qr.toLowerCase().split(/\s+/);
let overlapCount = 0;
for (const word of qrWords) {
  if (word.length > 3 && cotWords.has(word)) overlapCount++;
}
const overlapPercent = Math.round((overlapCount / qrWords.filter(w => w.length > 3).length) * 100);
console.log(`Lexical overlap (>3 char words): ~${overlapPercent}%`);
