/**
 * Vitest setup file.
 *
 * Next.js loads `.env.local` automatically for the app, but Vitest does not.
 * Tests that hit live APIs (e.g. scripts/inspect-model-answer.test.ts) need the
 * Groq key locally. We load `.env.local` here WITHOUT overriding any variables
 * already present in the environment (so CI secrets still win).
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
