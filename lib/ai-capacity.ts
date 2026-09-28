import { NextResponse } from 'next/server';

/**
* Friendly user-facing message shown when the AI provider is at capacity
* (Groq daily token quota, per-minute rate limits, etc.).
*/
export const AI_CAPACITY_MESSAGE =
"AI is at capacity right now — please try again in a few minutes.";

/** Machine-readable code so clients can special-case the capacity state. */
export const AI_CAPACITY_CODE = 'AI_CAPACITY';

/**
* Detect whether a provider error message indicates AI capacity / quota
* exhaustion (user-facing, temporary) rather than a genuine model failure
* (bad JSON, validation errors — which should still surface as real errors).
*
* Groq free tier commonly emits:
* - "Rate limit reached ... on tokens per day (TPD): Limit 100000, Used ..."
* - "Request too large ... on tokens per minute (TPM): Limit 6000, Requested ..."
* - HTTP 429 / insufficient_quota
*
* NOTE: bare status codes are intentionally NOT matched (e.g. '429' or '503'
  * alone) — JSON.parse / Zod errors legitimately contain numbers like
* "in JSON at position 429", which would otherwise false-positive.
*/
export function isAiCapacityError(message: string): boolean {
  const lower = message.toLowerCase();
  return (lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('quota') ||
    lower.includes('insufficient_quota') ||
    lower.includes('tokens per day') ||
    lower.includes('tokens per minute') ||
    lower.includes('(tpd)') ||
    lower.includes('(tpm)') ||
    lower.includes('request too large') ||
    lower.includes('too many requests') ||
    lower.includes('http 429') ||
    lower.includes('status 429') ||
    lower.includes('overloaded') ||
    lower.includes('service unavailable') ||
    lower.includes('at capacity') ||
    lower.includes('try again later') ||
    lower.includes('temporarily unavailable')
  );
}

/**
* Thrown by the AI fallback chains when EVERY provider failed and at least
* one failure was quota/rate-limit exhaustion. Lets the route return a
* friendly 503 instead of leaking raw provider error text in a 500.
* Carries the best-guess retry ETA so the client can show a real countdown.
*/
export class AiCapacityError extends Error {
  retryAfterSeconds: number;

  constructor(message: string = AI_CAPACITY_MESSAGE, retryAfterSeconds = 60) {
    super(message);
    this.name = 'AiCapacityError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
* Estimate how long the user should realistically wait before retrying,
* based on which Groq limit was hit:
* - Per-minute token limit (TPM) / "request too large" → resets within ~60s
* - Per-day token limit (TPD) → resets at UTC midnight (up to ~24h away)
* Falls back to 60s when we can't tell.
*/
export function estimateRetryAfterSeconds(errors: string[]): number {
  const daily = errors.some((m) => /tokens per day|\s*\(tpd\)/i.test(m));
  if (daily) {
    // Groq daily quotas reset at 00:00 UTC
    const now = new Date();
    const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
    );
    return Math.max(60, Math.ceil((midnightUtc.getTime() - now.getTime()) / 1000));
  }
  return 60;
}

/**
* Returns a 503 response with a friendly, non-technical message and a real
* retry ETA (used by the dashboard for the countdown / "resets in…" label).
* 503 Service Unavailable is semantically correct for "AI is at capacity",
* and distinct from the 429 used by the per-user rate limiter.
*/
export function aiCapacityResponse(retryAfterSeconds = 60): NextResponse {
  const safe = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
  ? Math.floor(retryAfterSeconds)
  : 60;
  return NextResponse.json({
      error: AI_CAPACITY_MESSAGE,
      code: AI_CAPACITY_CODE,
      retryAfterSeconds: safe,
    },
    {
      status: 503,
      headers: {
        'Retry-After': String(safe),
      },
    },
  );
}
