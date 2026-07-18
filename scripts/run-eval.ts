/**
 * MARKUP Eval Runner
 *
 * Runs the EVAL_SET (from lib/eval-set.ts) against the live grading API
 * and reports pass/fail for each test case. Exits with code 1 if any
 * regression is found.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run the eval:          npx tsx scripts/run-eval.ts
 *
 * Or with a single command (requires `concurrently` or two terminals):
 *   npm run dev & sleep 15 && npx tsx scripts/run-eval.ts
 */

import { EVAL_SET, evaluateEvalSet } from '../lib/eval-set';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════
//  Load .env.local so that NEXT_PUBLIC_SITE_URL is available
// ═══════════════════════════════════════════════════════════════

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠  No .env.local found at', envPath);
    console.warn('   Using existing process.env values.');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

function color(s: string, c: 'red' | 'green' | 'yellow' | 'dim'): string {
  const codes: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    dim: '\x1b[2m',
  };
  return `${codes[c] || ''}${s}\x1b[0m`;
}

function pad(s: string, n: number): string {
  return s + ' '.repeat(Math.max(0, n - s.length));
}

// ═══════════════════════════════════════════════════════════════
//  Main
// ═══════════════════════════════════════════════════════════════

async function main() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║        MARKUP — Grading Eval Runner           ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Target API : ${BASE_URL}/api/grade`);
  console.log(`  Test cases : ${EVAL_SET.length}`);
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
        questionType: 'SBQ: Inference / Message (AO2)',
        subject: 'Social Studies',
        topic: 'test',
      }),
    });
    // 400 = validation error (expected — means server is alive)
    // 500 = API keys not configured
    if (health.status === 500) {
      const body = await health.json();
      console.error(color('  ✖ Server is running but grading is unavailable:', 'red'));
      console.error(`    ${body.error || 'Unknown error'}`);
      console.error('');
      console.error('  Make sure GROQ_API_KEY is set in .env.local');
      process.exit(1);
    }
    console.log(color('  ✓ Server is reachable', 'green'));
  } catch {
    console.error(color('  ✖ Cannot reach server at ' + BASE_URL, 'red'));
    console.error('');
    console.error('  Start the dev server first:  npm run dev');
    console.error('  Then run:                    npx tsx scripts/run-eval.ts');
    process.exit(1);
  }

  console.log('');

  // ── Define the grading function that calls the API ──
  const gradeFn = async (params: {
    sbcsAnswer: string;
    seqAnswer: string;
    srqAnswer: string;
    questionPrompt: string;
    questionType: string;
    subject: string;
    topic: string;
  }) => {
    const startTime = Date.now();
    const res = await fetch(`${BASE_URL}/api/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
      scoreLevel: data.scoreLevel || '',
      scoreLabel: data.scoreLabel || '',
      confidence: data.confidence ?? data.gradingConfidence ?? 0,
      _elapsed: elapsed,
      _model: data._model || 'unknown',
    };
  };

  // ── Run each test case sequentially ──
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const test of EVAL_SET) {
    const id = test.id;
    process.stdout.write(`  ${pad(id, 28)} `);

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

      const actualLevel = result.scoreLevel;
      const actualLabel = result.scoreLabel;

      // Level check
      const levelMatch = actualLevel === test.expectedLevel;

      // Label check (substring, case-insensitive)
      const labelMatch = actualLabel.toLowerCase().includes(
        test.expectedLabel.toLowerCase(),
      );

      // Confidence check
      const confidenceOk = result.confidence >= test.minConfidence;

      const errors: string[] = [];
      if (!levelMatch) {
        errors.push(
          `level: expected ${test.expectedLevel}, got ${actualLevel}`,
        );
      }
      if (!labelMatch) {
        errors.push(
          `label: expected "${test.expectedLabel}" in "${actualLabel.slice(0, 60)}"`,
        );
      }
      if (!confidenceOk) {
        errors.push(
          `confidence: expected >= ${test.minConfidence}, got ${result.confidence.toFixed(2)}`,
        );
      }

      if (errors.length === 0) {
        passed++;
        console.log(
          `${color('✓', 'green')}  ${color(actualLevel, 'dim')}  ${color(result.confidence.toFixed(2), 'dim')}  ${color(result._elapsed + 's', 'dim')}`,
        );
      } else {
        failed++;
        console.log(`${color('✖', 'red')}`);
        for (const err of errors) {
          console.log(`       ${color('→', 'yellow')} ${err}`);
        }
        failures.push(id);
      }
    } catch (err) {
      failed++;
      console.log(`${color('✖', 'red')}  ${color('ERROR', 'red')}`);
      console.log(`       ${color('→', 'yellow')} ${err instanceof Error ? err.message : String(err)}`);
      failures.push(id);
    }
  }

  // ── Summary ──
  console.log('');
  console.log('─'.repeat(52));
  const total = EVAL_SET.length;
  const pct = total > 0 ? ((passed / total) * 100).toFixed(0) : '0';
  console.log(`  ${color('✓', 'green')} ${passed} passed  ${color('✖', 'red')} ${failed} failed  ${pct}%`);
  console.log('─'.repeat(52));

  if (failures.length > 0) {
    console.log('');
    console.log(color('  Failed cases:', 'red'));
    for (const id of failures) {
      console.log(`    ${color('·', 'red')} ${id}`);
    }
    console.log('');
    console.log(color('  If this is expected (prompt changed), update the', 'yellow'));
    console.log(color('  expectedLevel/expectedLabel in lib/eval-set.ts', 'yellow'));
    process.exit(1);
  }

  console.log(color('\n  All checks passed — no regressions detected.\n', 'green'));
}

main().catch((err) => {
  console.error('\n  Fatal error:', err);
  process.exit(1);
});
