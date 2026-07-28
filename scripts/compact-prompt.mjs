import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '..', 'lib', 'prompts.ts');

let content = fs.readFileSync(filePath, 'utf-8');

// Target: from line starting with '3. The `critique`' through '## SCHOOL BENCHMARKING (MANDATORY)'
const targetStart = '3. The \\`critique\\` array should contain 3\u20138 specific, actionable bullet points.';
const targetEnd = '## SCHOOL BENCHMARKING (MANDATORY)';

const startIdx = content.indexOf(targetStart);
const endIdx = content.indexOf(targetEnd, startIdx);

if (startIdx < 0 || endIdx < 0) {
  console.error('Could not find target markers.');
  console.error('startIdx:', startIdx);
  console.error('endIdx (from start):', startIdx >= 0 ? content.indexOf(targetEnd, startIdx) : -1);
  process.exit(1);
}

const replacement = `3. The \\\`critique\\\` array should contain 3\u20138 specific, actionable bullet points.
4. The \\\`a1Upgrade\\\` must be a complete rewritten answer at A1 (top-tier) standard. CRITICAL format requirements:
   - FIRST line MUST be a LORMS level label (e.g., \\\"L4 \u2014 Similarity AND Difference with core message matching:\\\")
   - ALL source quotes in DOUBLE quotation marks (\\\"...\\\") \u2014 NEVER single quotes
   - Every paragraph: **Point:**, **Evidence:**, **Explanation:**, **Link:**
   - Every paragraph: at least one double-quoted source quote (SEQ: specific evidence instead)
   - Every Part: end with \\\"Therefore:\\\" or \\\"Thus:\\\" conclusion
5. Each \\\`highlightedSegment\\\` must include the exact text from the student's answer.
6. Be encouraging, professional, and diagnostic \u2014 no generic fluff.
7. Under 12 words of actual content \u2192 flag as \\\"L0 \u2014 Insufficient content\\\" (quality gate applies). 12+ words but not a coherent analytical argument \u2192 L1 maximum with note.
8. Output a \\\`confidence\\\` score between 0.0 and 1.0.

## MODEL ANSWER EXAMPLE \u2014 MOE Victoria School SS 2020 (template for LORMS + double-quotes + PEEL):

\\\"L4 Will work AND Will NOT work based on content (6m):
Point: The resident would partially agree but ultimately believes it will NOT work.
Evidence: She acknowledges Singaporeans \\\"are still not very educated about how to recycle properly\\\" and the project aims to \\\"increase public awareness.\\\" However, she asks: \\\"Do you really think that Singaporeans will take the time out to do that?\\\" because recycling remains \\\"too tedious and time consuming.\\\"
Explanation: Source B assumes better design = better behaviour; Source C rejects this, seeing the root cause as cultural indifference.
Link: Therefore, the resident concedes education value but does NOT believe it will work because attitudes, not bin design, are the real barrier.\\\"

## SCHOOL BENCHMARKING (MANDATORY)`;

const before = content.substring(0, startIdx);
const afterStart = content.indexOf(targetEnd, startIdx);
const after = content.substring(afterStart);
content = before + replacement + after;

fs.writeFileSync(filePath, content, 'utf-8');
console.log('File updated successfully.');
console.log('Replaced from character', startIdx, 'to', afterStart, `(${afterStart - startIdx} chars)`);

// Show the result around the edit
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('OUTPUT RULES') || lines[i].includes('MODEL ANSWER') || lines[i].includes('SCHOOL BENCHMARKING')) {
    console.log(`\n--- Line ${i + 1} ---`);
    console.log(lines[i]);
    // Show next few lines
    for (let j = 1; j <= 3 && i + j < lines.length; j++) {
      if (lines[i + j].trim()) console.log(lines[i + j]);
    }
  }
}
