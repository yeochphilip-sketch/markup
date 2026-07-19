import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rough token estimation: ~4 chars per token for English text
// More accurate: use tiktoken if available, otherwise estimate
function estimateTokens(text) {
  // GPT-4/llama tokenizer approximates ~0.25 tokens per character for English
  // For mixed content with formatting, use ~0.3 tokens/char as a conservative estimate
  return Math.round(text.length * 0.28);
}

function countLines(text) {
  return text.split('\n').length;
}

function extractConst(name, content) {
  // Try template literal first: const FOO = `...`;
  const templateRegex = new RegExp(`const\\s+${name}\\s*=\\s*\`([\\s\\S]*?)\`;`, 'gm');
  const templateMatch = templateRegex.exec(content);
  if (templateMatch) return templateMatch[1];
  
  // Try string literal: const FOO = '...' or "...";
  const stringRegex = new RegExp(`const\\s+${name}\\s*=\\s*['"]([\\s\\S]*?)['"];`, 'gm');
  const stringMatch = stringRegex.exec(content);
  if (stringMatch) return stringMatch[1];
  
  return null;
}

console.log('=== MARKUP AI PROMPT TOKEN COUNT ANALYSIS ===\n');

const promptsContent = readFileSync(path.join(__dirname, '..', 'lib', 'prompts.ts'), 'utf-8');

// Extract all key constants
const constants = {
  'CHAIN_OF_THOUGHT': extractConst('CHAIN_OF_THOUGHT', promptsContent),
  'CONFIDENCE_INSTRUCTIONS': extractConst('CONFIDENCE_INSTRUCTIONS', promptsContent),
  'QUALITY_RULES': extractConst('QUALITY_RULES', promptsContent),
  'SCHOOL_BENCHMARK_DATA': extractConst('SCHOOL_BENCHMARK_DATA', promptsContent),
  'ALL_FORMATS_INSTRUCTIONS': extractConst('ALL_FORMATS_INSTRUCTIONS', promptsContent),
};

// LORMS matrices need special handling since they're defined as multiple individual constants
const lormsConstants = {
  'SS_COMPARISON_LORMS': extractConst('SS_COMPARISON_LORMS', promptsContent),
  'SS_INFERENCE_LORMS': extractConst('SS_INFERENCE_LORMS', promptsContent),
  'SS_PURPOSE_LORMS': extractConst('SS_PURPOSE_LORMS', promptsContent),
  'SS_UTILITY_LORMS': extractConst('SS_UTILITY_LORMS', promptsContent),
  'SS_SYNTHESIS_LORMS': extractConst('SS_SYNTHESIS_LORMS', promptsContent),
  'SS_SRQ_LORMS': extractConst('SS_SRQ_LORMS', promptsContent),
  'SS_SEQ_LORMS': extractConst('SS_SEQ_LORMS', promptsContent),
  'HIST_COMPARISON_LORMS': extractConst('HIST_COMPARISON_LORMS', promptsContent),
  'HIST_INFERENCE_LORMS': extractConst('HIST_INFERENCE_LORMS', promptsContent),
  'HIST_RELIABILITY_LORMS': extractConst('HIST_RELIABILITY_LORMS', promptsContent),
  'HIST_UTILITY_LORMS': extractConst('HIST_UTILITY_LORMS', promptsContent),
  'HIST_PURPOSE_LORMS': extractConst('HIST_PURPOSE_LORMS', promptsContent),
  'HIST_SEQ_LORMS': extractConst('HIST_SEQ_LORMS', promptsContent),
};

// Few-shot examples - we'll estimate these separately
const fsExamples = {
  'SS_COMPARISON_EXAMPLES': extractConst('SS_COMPARISON_EXAMPLES', promptsContent),
  'SS_INFERENCE_EXAMPLES': extractConst('SS_INFERENCE_EXAMPLES', promptsContent),
  'SS_PURPOSE_EXAMPLES': extractConst('SS_PURPOSE_EXAMPLES', promptsContent),
  'SS_UTILITY_EXAMPLES': extractConst('SS_UTILITY_EXAMPLES', promptsContent),
  'SS_SYNTHESIS_EXAMPLES': extractConst('SS_SYNTHESIS_EXAMPLES', promptsContent),
  'SS_SRQ_EXAMPLES': extractConst('SS_SRQ_EXAMPLES', promptsContent),
  'SS_SEQ_EXAMPLES': extractConst('SS_SEQ_EXAMPLES', promptsContent),
  'SS_INVALID_EXAMPLES': extractConst('INVALID_CONTENT_EXAMPLES', promptsContent),
  'HIST_COMPARISON_EXAMPLES': extractConst('HIST_COMPARISON_EXAMPLES', promptsContent),
  'HIST_INFERENCE_EXAMPLES': extractConst('HIST_INFERENCE_EXAMPLES', promptsContent),
  'HIST_SEQ_EXAMPLES': extractConst('HIST_SEQ_EXAMPLES', promptsContent),
  'HIST_RELIABILITY_EXAMPLES': extractConst('HIST_RELIABILITY_EXAMPLES', promptsContent),
};

console.log('--- Shared Prompt Constants ---\n');
let sharedTotalTokens = 0;
for (const [name, content] of Object.entries(constants)) {
  if (content) {
    const tokens = estimateTokens(content);
    const lines = countLines(content);
    sharedTotalTokens += tokens;
    console.log(`${name}:`);
    console.log(`  Characters: ${content.length.toLocaleString()}`);
    console.log(`  Lines: ${lines}`);
    console.log(`  Est. tokens: ${tokens.toLocaleString()}\n`);
  } else {
    console.log(`${name}: NOT FOUND in prompts.ts\n`);
  }
}

console.log('--- LORMS Matrices (All) ---\n');
let lormsTotalTokens = 0;
const allLormsNames = Object.keys(lormsConstants);
for (const name of allLormsNames) {
  const content = lormsConstants[name];
  if (content) {
    const tokens = estimateTokens(content);
    lormsTotalTokens += tokens;
    console.log(`${name}: ${tokens.toLocaleString()} tokens`);
  } else {
    console.log(`${name}: NOT FOUND`);
  }
}
console.log(`\nTotal LORMS matrices: ${lormsTotalTokens.toLocaleString()} tokens\n`);

console.log('--- Few-Shot Examples (All) ---\n');
let fsTotalTokens = 0;
for (const [name, content] of Object.entries(fsExamples)) {
  if (content) {
    const tokens = estimateTokens(content);
    fsTotalTokens += tokens;
    console.log(`${name}: ${tokens.toLocaleString()} tokens`);
  } else {
    console.log(`${name}: NOT FOUND`);
  }
}
console.log(`\nTotal few-shot examples: ${fsTotalTokens.toLocaleString()} tokens\n`);

console.log('========================================');
console.log('=== GRADE SYSTEM PROMPT BUDGET (All Formats, SS) ===\n');

// What the grade system prompt consists of for All Formats SS:
const gradeComponents = {
  'System instruction header': 200,
  'SS LORMS (ALL 7)': lormsTotalTokens,
  'CHAIN_OF_THOUGHT': estimateTokens(constants['CHAIN_OF_THOUGHT'] || ''),
  'FEW-SHOT (invalid + all SS examples)': 
    estimateTokens(fsExamples['SS_INVALID_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_COMPARISON_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_INFERENCE_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_PURPOSE_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_UTILITY_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_SYNTHESIS_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_SRQ_EXAMPLES'] || '') +
    estimateTokens(fsExamples['SS_SEQ_EXAMPLES'] || ''),
  'CONFIDENCE_INSTRUCTIONS': estimateTokens(constants['CONFIDENCE_INSTRUCTIONS'] || ''),
  'QUALITY_RULES': estimateTokens(constants['QUALITY_RULES'] || ''),
  'Output rules & instructions': 500,
  'SCHOOL_BENCHMARK_DATA': estimateTokens(constants['SCHOOL_BENCHMARK_DATA'] || ''),
  'FormatFewShotSection overhead': 200,
};

// Calculate rough formatting overhead
const formatOverhead = 400; // line breaks, spacing, markdown formatting etc.

let gradeTotal = formatOverhead;
console.log('Component breakdown:');
for (const [name, tokens] of Object.entries(gradeComponents)) {
  console.log(`  ${name}: ~${tokens.toLocaleString()} tokens`);
  gradeTotal += tokens;
}

console.log(`\n  Formatting overhead: ~${formatOverhead} tokens`);
console.log(`\n  ≈ TOTAL GRADE SYSTEM PROMPT (All Formats SS): ~${gradeTotal.toLocaleString()} tokens`);
console.log(`  Groq Llama 3.1 8B context limit: 8,192 tokens`);
console.log(`  Groq Llama 3.3 70B context limit: 32,768 tokens`);
console.log(`  Gemini 2.5 Flash context limit: ~1,000,000 tokens`);

if (gradeTotal > 8192) {
  console.log(`\n  ⚠️  EXCEEDS 8B limit by ${(gradeTotal - 8192).toLocaleString()} tokens — 8B fallback will likely fail!`);
}
console.log('');

// Now let's also check the generation prompt
console.log('========================================');
console.log('=== GENERATION SYSTEM PROMPT BUDGET ===\n');

// getGenerateSystemPrompt consists of:
const genBaseComponents = {
  'System header + AOIs': 50,
  'Topic + skill track': 10,
  'General instructions': 400,
  'Skill-specific source rules': 300,
  'STRICT RULES section': 400,
  'SCHOOL_BENCHMARK_DATA': estimateTokens(constants['SCHOOL_BENCHMARK_DATA'] || ''),
  'Tier 1 calibration instruction': 50,
};
let genBaseTotal = 200;
console.log('Generation base prompt (getGenerateSystemPrompt):');
for (const [name, tokens] of Object.entries(genBaseComponents)) {
  console.log(`  ${name}: ~${tokens.toLocaleString()} tokens`);
  genBaseTotal += tokens;
}
console.log(`\n  ≈ TOTAL (base gen prompt): ~${genBaseTotal.toLocaleString()} tokens`);

// 70B version adds model answer examples
let gen70bTotal = genBaseTotal;
console.log(`\n70B generation prompt adds model answer examples:`);
const modelAnswerExamplesSize = 8000; // Rough estimate from the school-papers.ts output
gen70bTotal += modelAnswerExamplesSize;
console.log(`  Real MOE model answer examples: ~${modelAnswerExamplesSize.toLocaleString()} tokens`);
console.log(`\n  ≈ TOTAL (70B gen prompt): ~${gen70bTotal.toLocaleString()} tokens`);

// Check if ALL_FORMATS_INSTRUCTIONS is included
console.log(`\nALL_FORMATS_INSTRUCTIONS found: ${constants['ALL_FORMATS_INSTRUCTIONS'] ? 'YES' : 'NO'}`);
if (constants['ALL_FORMATS_INSTRUCTIONS']) {
  const afiTokens = estimateTokens(constants['ALL_FORMATS_INSTRUCTIONS']);
  console.log(`ALL_FORMATS_INSTRUCTIONS size: ${afiTokens.toLocaleString()} tokens`);
  console.log(`If included, 70B gen prompt would be: ~${(gen70bTotal + afiTokens).toLocaleString()} tokens`);
}

console.log('\n========================================');
console.log('=== GRADE USER PROMPT BUDGET ===\n');

// User prompt for grade = header + question + subject/topic/skill + student answer
const userPromptParts = {
  'Header text': 80,
  'Question prompt (typical)': 100,
  'Subject/topic/skill line': 30,
  'Student answer (typical ~500 chars)': 140,
};
let userTotal = 50;
for (const [name, tokens] of Object.entries(userPromptParts)) {
  userTotal += tokens;
}
console.log(`Typical grade user prompt: ~${userTotal.toLocaleString()} tokens`);
console.log(`Total per grade call (All Formats SS): ~${(gradeTotal + userTotal).toLocaleString()} tokens`);

if (gradeTotal + userTotal > 8192) {
  console.log(`\n⚠️  Total grade call EXCEEDS 8B context window!`);
} else {
  console.log(`\n✓ Total grade call fits within 8B context window`);
}
