/**
 * Lightweight in-memory rate limiter for API routes.
 *
 * Tracks request counts per IP address within a sliding window.
 * Resets automatically when the window expires.
 *
 * ⚠️ Note: In-memory only — not shared across serverless instances.
 * For production with multiple Vercel instances, use Vercel KV or
 * a database-backed rate limiter instead. This is sufficient for beta.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowSeconds: 60,
};

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

export const GENEROUS_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
};

/**
 * Returns the client IP from a Request object.
 * Tries common headers used by Vercel, Cloudflare, and local dev.
 */
function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  );
}

/**
 * Checks if a request is rate-limited.
 *
 * @returns An object with `allowed` (boolean) and `headers` (response headers).
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): { allowed: boolean; headers: Record<string, string> } {
  const ip = getClientIp(request);
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(ip);

  // If no entry or window expired, create fresh
  if (!entry || entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(ip, entry);

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(config.maxRequests),
        'X-RateLimit-Remaining': String(config.maxRequests - 1),
        'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
      },
    };
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    headers: {
      'X-RateLimit-Limit': String(config.maxRequests),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
      ...(allowed ? {} : { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) }),
    },
  };
}

/**
 * Returns a 429 Response when a request is rate-limited.
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
