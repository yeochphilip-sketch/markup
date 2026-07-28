import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '..', 'lib', 'prompts.ts');

let content = fs.readFileSync(filePath, 'utf-8');

// Fix duplicated header: "## SCHOOL BENCHMARKING (MANDATORY)## SCHOOL BENCHMARKING (MANDATORY)"
content = content.replace(
  '## SCHOOL BENCHMARKING (MANDATORY)## SCHOOL BENCHMARKING (MANDATORY)',
  '## SCHOOL BENCHMARKING (MANDATORY)'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed duplicate header.');

// Verify by counting occurrences
const count = (content.match(/## SCHOOL BENCHMARKING \(MANDATORY\)/g) || []).length;
console.log(`'## SCHOOL BENCHMARKING (MANDATORY)' appears ${count} times (should be 1 in getGradeSystemPrompt).`);
