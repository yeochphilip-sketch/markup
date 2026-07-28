import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '..', 'lib', 'prompts.ts');

let content = fs.readFileSync(filePath, 'utf-8');

// Remove the orphaned SUGGESTED ANSWER section (lines ~1009-1120) 
// Markers: '===========================================\n=== SUGGESTED ANSWER / MODEL ANSWER'
// End: before '// ────────────────────────────────────────────────\n//  Few-Shot Examples\n// ────────────────────────────────────────────────\n\n' (but that's near the start)
// Actually the few-shot examples start much earlier. Let me find the right end marker.

const startMarker = '===========================================\n=== SUGGESTED ANSWER / MODEL ANSWER';
const endMarker = '\n// ────────────────────────────────────────────────\n//  LORMS Patterns (for consistent level labelling)';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx < 0 || endIdx < 0) {
  console.error('Could not find markers');
  console.error('startIdx:', startIdx);
  console.error('endIdx:', endIdx);
  process.exit(1);
}

// Remove from startMarker to endMarker (inclusive of endMarker line)
const removeEnd = endIdx + endMarker.length;
const before = content.substring(0, startIdx - 10); // include a few chars before for context cleanup
const after = content.substring(removeEnd);

content = before + after;

// Clean up any extra blank lines
content = content.replace(/\n{4,}/g, '\n\n\n');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Removed dead SUGGESTED ANSWER section.');
console.log('File size reduced from', content.length, 'to', content.length, 'chars');

// Count lines
const lines = content.split('\n');
console.log('Total lines:', lines.length);
