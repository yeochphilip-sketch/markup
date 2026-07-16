/**
 * Supabase PostgreSQL-based rate limiter.
 *
 * Unlike the in-memory version (lib/rate-limit.ts), this works across
 * all serverless instances by storing counters in your existing Supabase DB.
 *
 * Design:
 * - Each request creates a row with (ip, endpoint, window_expires_at, request_count)
 * - On each request we look for an unexpired window for that IP+endpoint
 * - If found, increment the counter; if expired, start a new window
 * - If counter exceeds limit, reject with 429
 *
 * Cleanup: expired rows are cleaned on read (ad-hoc) and an index on
 * window_expires_at lets you DELETE old rows periodically.
 */

import { createClient } from '@supabase/supabase-js';

export interface SupabaseRateLimitConfig {
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

// ── Per-endpoint limits ──

/** Generate question: 5 per 60s (expensive AI tokens) */
export const GENERATE_QUESTION_LIMIT: SupabaseRateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

/** Grade: 5 per 60s (expensive AI tokens) */
export const GRADE_LIMIT: SupabaseRateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

/** Feedback: 3 per 30s (lightweight but prevents spam) */
export const FEEDBACK_LIMIT: SupabaseRateLimitConfig = {
  maxRequests: 3,
  windowSeconds: 30,
};

// ── Helpers ──

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  );
}

/**
 * Round a timestamp down to the nearest `windowSeconds` boundary.
 * This creates clean, predictable windows (e.g. every 60s on the minute).
 */
function roundDownToWindow(date: Date, windowSeconds: number): Date {
  const ms = windowSeconds * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

/**
 * Create a Supabase client for rate limiting.
 * Prefers the service role key (bypasses RLS), falls back to anon key.
 * If neither works, returns null — the caller should allow the request
 * (degraded mode rather than blocking everyone).
 */
function getRateLimitClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return createClient(url, serviceKey);
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    return createClient(url, anonKey);
  }

  return null;
}

/**
 * Check if a request is rate-limited using Supabase PostgreSQL.
 *
 * @returns Object with `allowed` and `headers` (for 429 response) or null
 *          if the rate limiter couldn't connect (degraded mode).
 */
export async function checkSupabaseRateLimit(
  request: Request,
  config: SupabaseRateLimitConfig,
): Promise<{ allowed: boolean; headers: Record<string, string> } | null> {
  const supabase = getRateLimitClient();
  if (!supabase) {
    console.warn('[rate-limit] Supabase not configured — rate limiting disabled');
    return null;
  }

  const ip = getClientIp(request);
  const endpoint = new URL(request.url).pathname;
  const now = new Date();
  const windowStart = roundDownToWindow(now, config.windowSeconds);
  const windowExpiresAt = new Date(windowStart.getTime() + config.windowSeconds * 1000);

  try {
    // 1. Clean up expired windows for this IP+endpoint (ad-hoc maintenance)
    await supabase
      .from('rate_limits')
      .delete()
      .eq('ip_address', ip)
      .eq('endpoint', endpoint)
      .lt('window_expires_at', now.toISOString());

    // 2. Find the current window's record
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('id, request_count')
      .eq('ip_address', ip)
      .eq('endpoint', endpoint)
      .gte('window_expires_at', now.toISOString())
      .order('window_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Window exists — check if over limit
      if (existing.request_count >= config.maxRequests) {
        return {
          allowed: false,
          headers: {
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(windowExpiresAt.getTime() / 1000)),
            'Retry-After': String(Math.ceil((windowExpiresAt.getTime() - now.getTime()) / 1000)),
          },
        };
      }

      // Under limit — increment counter
      const { error: updateErr } = await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);

      if (updateErr) throw updateErr;

      const remaining = config.maxRequests - existing.request_count - 1;
      return {
        allowed: true,
        headers: {
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': String(Math.max(0, remaining)),
          'X-RateLimit-Reset': String(Math.ceil(windowExpiresAt.getTime() / 1000)),
        },
      };
    }

    // 3. No active window — create a new one
    const { error: insertErr } = await supabase
      .from('rate_limits')
      .insert({
        ip_address: ip,
        endpoint,
        request_count: 1,
        window_expires_at: windowExpiresAt.toISOString(),
      });

    if (insertErr) throw insertErr;

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(config.maxRequests),
        'X-RateLimit-Remaining': String(config.maxRequests - 1),
        'X-RateLimit-Reset': String(Math.ceil(windowExpiresAt.getTime() / 1000)),
      },
    };
  } catch (err) {
    // Non-fatal: rate limiter failed — allow the request in degraded mode
    console.warn('[rate-limit] Check failed, allowing request:', err);
    return null;
  }
}

/**
 * Returns a 429 Response for rate-limited requests.
 */
export function rateLimitResponse(headers: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please slow down and try again.',
      retryAfter: headers['Retry-After'] ?? '60',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    },
  );
}
