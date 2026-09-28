import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';

/**
 * Groq AI quota monitor for the admin analytics page.
 *
 * Groq has NO usage/quota endpoint (GET /usage → 404). Instead:
 *  - Every response carries rate-limit headers:
 *      x-ratelimit-limit-tokens / x-ratelimit-remaining-tokens (per-minute)
 *      x-ratelimit-limit-requests / x-ratelimit-remaining-requests (per-day)
 *  - When a request is refused for daily-token exhaustion, the 429 body
 *    contains the exact daily usage: "tokens per day (TPD): Limit X, Used Y".
 *
 * So we fire a minimal probe request (max_tokens=1) to read the headers, and
 * fall back to a DB-activity estimate for daily tokens when no 429 occurs.
 */

export const runtime = 'nodejs';
export const maxDuration = 30;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PROBE_MODEL = 'llama-3.1-8b-instant';
const PROBE_PROMPT = 'Reply with exactly: ok';

// Rough per-operation token cost for the DB-activity estimate. These are
// averages observed across generated papers and graded bundles (prompt-heavy).
const AVG_TOKENS_PER_GENERATE = 3500;
const AVG_TOKENS_PER_GRADE = 6000;

/**
 * Get a Supabase client for database reads.
 * Tries service role key first, falls back to cookie-based auth.
 */
async function getReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return await getServerSupabase();
}

/**
 * Verify the caller is authenticated and has admin privileges.
 * Uses cookie-based auth (getServerSupabase) — app_metadata only,
 * since user_metadata is end-user-editable.
 */
async function requireAdmin(): Promise<{ error?: NextResponse }> {
  let userEmail = '';
  let isAdminFlag = false;
  try {
    const sessionClient = await getServerSupabase();
    const { data } = await sessionClient.auth.getUser();
    // app_metadata only — user_metadata is end-user-editable
    isAdminFlag = data?.user?.app_metadata?.is_admin === true;
    userEmail = data?.user?.email ?? '';
  } catch {
    return { error: NextResponse.json({ error: 'Authentication check failed' }, { status: 403 }) };
  }

  // Match the analytics page's own gate: app_metadata flag OR the configured
  // admin email fallback (same as NEXT_PUBLIC_ADMIN_EMAIL used client-side).
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';
  const isAdmin =
    isAdminFlag ||
    (userEmail.length > 0 && adminEmail.length > 0 && userEmail.toLowerCase() === adminEmail.toLowerCase());

  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 403 }) };
  }
  return {};
}

/** Parse daily-token usage from a Groq 429 error body, e.g. "...(TPD): Limit 100000, Used 96772". */
function parseTpdFromBody(body: string): { limit: number; used: number } | null {
  const m = body.match(/tokens per day \(TPD\): Limit (\d+), Used (\d+)/i);
  if (!m) return null;
  const limit = parseInt(m[1], 10);
  const used = parseInt(m[2], 10);
  return Number.isFinite(limit) && Number.isFinite(used) ? { limit, used } : null;
}

/** Read numeric value from a header (or null if absent/invalid). */
function headerNum(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const apiKey = process.env.GROQ_API_KEY;

    // ── Probe Groq with a minimal request to read rate-limit headers ──
    let probeStatus = 0;
    const tpm = { limit: null as number | null, remaining: null as number | null };
    const rpd = { limit: null as number | null, remaining: null as number | null };
    let tpd: { limit: number; used: number } | null = null;
    let probeError: string | null = null;

    if (!apiKey) {
      probeError = 'GROQ_API_KEY not configured';
    } else {
      try {
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: PROBE_MODEL,
            messages: [{ role: 'user', content: PROBE_PROMPT }],
            max_tokens: 1,
          }),
          cache: 'no-store',
        });
        probeStatus = res.status;
        tpm.limit = headerNum(res.headers, 'x-ratelimit-limit-tokens');
        tpm.remaining = headerNum(res.headers, 'x-ratelimit-remaining-tokens');
        rpd.limit = headerNum(res.headers, 'x-ratelimit-limit-requests');
        rpd.remaining = headerNum(res.headers, 'x-ratelimit-remaining-requests');

        if (res.status === 429) {
          const body = await res.text();
          tpd = parseTpdFromBody(body);
          if (!tpd) probeError = `Groq rate limited (HTTP ${res.status})`;
        } else if (!res.ok) {
          probeError = `Groq probe failed (HTTP ${res.status})`;
        }
      } catch (err) {
        probeError = err instanceof Error ? err.message : String(err);
      }
    }

    // ── Daily-token estimate from DB activity (when no live TPD is known) ──
    let gradesToday = 0;
    let generationsToday = 0;
    try {
      const supabase = await getReadClient();
      const today = new Date().toISOString().slice(0, 10);

      const [{ count: g }, { count: q }] = await Promise.all([
        supabase
          .from('essay_evaluations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('generated_questions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
      ]);
      gradesToday = g ?? 0;
      generationsToday = q ?? 0;
    } catch (dbErr) {
      console.warn('[groq-usage] DB activity estimate failed:', dbErr);
    }

    const estimatedDailyTokens =
      gradesToday * AVG_TOKENS_PER_GRADE + generationsToday * AVG_TOKENS_PER_GENERATE;

    return NextResponse.json({
      provider: 'groq',
      model: PROBE_MODEL,
      probedAt: new Date().toISOString(),
      probeStatus,
      probeError,
      tpm: {
        limit: tpm.limit,
        used: tpm.limit !== null && tpm.remaining !== null ? tpm.limit - tpm.remaining : null,
        remaining: tpm.remaining,
      },
      rpd: {
        limit: rpd.limit,
        used: rpd.limit !== null && rpd.remaining !== null ? rpd.limit - rpd.remaining : null,
        remaining: rpd.remaining,
      },
      // Live daily-token usage — only known when Groq refused a request
      dailyTokens: tpd,
      // Estimate from today's DB activity (fallback / sanity check)
      activity: {
        gradesToday,
        generationsToday,
        estimatedDailyTokens,
      },
    });
  } catch (err) {
    console.error('[groq-usage] failed:', err);
    return NextResponse.json(
      { error: 'Failed to read Groq usage' },
      { status: 500 },
    );
  }
}
