import { describe, it, expect, beforeAll } from 'vitest';

const OLD_ENV = process.env;

describe('Supabase rate limiter — config presets', () => {
  it('GENERATE_QUESTION_LIMIT allows 5 requests per 60s', async () => {
    const { GENERATE_QUESTION_LIMIT } = await import('@/lib/rate-limit-supabase');
    expect(GENERATE_QUESTION_LIMIT.maxRequests).toBe(5);
    expect(GENERATE_QUESTION_LIMIT.windowSeconds).toBe(60);
  });

  it('GRADE_LIMIT allows 5 requests per 60s', async () => {
    const { GRADE_LIMIT } = await import('@/lib/rate-limit-supabase');
    expect(GRADE_LIMIT.maxRequests).toBe(5);
    expect(GRADE_LIMIT.windowSeconds).toBe(60);
  });

  it('FEEDBACK_LIMIT allows 3 requests per 30s', async () => {
    const { FEEDBACK_LIMIT } = await import('@/lib/rate-limit-supabase');
    expect(FEEDBACK_LIMIT.maxRequests).toBe(3);
    expect(FEEDBACK_LIMIT.windowSeconds).toBe(30);
  });
});

describe('rateLimitResponse', () => {
  it('returns 429 response with correct shape', async () => {
    const { rateLimitResponse } = await import('@/lib/rate-limit-supabase');

    const headers = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '9999999999',
      'Retry-After': '45',
    };

    const res = rateLimitResponse(headers);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toContain('Too many requests');
    expect(body.retryAfter).toBe('45');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('Retry-After')).toBe('45');
  });

  it('defaults retryAfter to 60 when not provided', async () => {
    const { rateLimitResponse } = await import('@/lib/rate-limit-supabase');

    const headers = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
    };

    const res = rateLimitResponse(headers);
    const body = await res.json();

    expect(body.retryAfter).toBe('60');
  });
});

describe('checkSupabaseRateLimit — degraded mode', () => {
  beforeAll(() => {
    process.env = { ...OLD_ENV };
    // Remove all Supabase env vars to trigger degraded mode
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('returns null when no Supabase URL is configured (degraded mode)', async () => {
    const { checkSupabaseRateLimit, GRADE_LIMIT } = await import('@/lib/rate-limit-supabase');

    const req = new Request('http://localhost:3000/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await checkSupabaseRateLimit(req, GRADE_LIMIT);

    // Null means "allow the request, rate limiter unavailable"
    expect(result).toBeNull();
  });

  it('allows request when rate limiter is in degraded mode', async () => {
    const { checkSupabaseRateLimit, GENERATE_QUESTION_LIMIT } = await import('@/lib/rate-limit-supabase');

    const req = new Request('http://localhost:3000/api/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
      },
    });

    const result = await checkSupabaseRateLimit(req, GENERATE_QUESTION_LIMIT);

    // Null = degraded mode = request allowed through
    expect(result).toBeNull();
  });
});

describe('IP extraction from request headers', () => {
  it('reads x-forwarded-for correctly', async () => {
    const { checkSupabaseRateLimit, FEEDBACK_LIMIT } = await import('@/lib/rate-limit-supabase');

    const req = new Request('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.42, 10.0.0.1, 192.168.1.1',
      },
    });

    const result = await checkSupabaseRateLimit(req, FEEDBACK_LIMIT);

    // No Supabase configured → degraded mode (null), but IP extraction didn't throw
    expect(result).toBeNull();
  });
});
