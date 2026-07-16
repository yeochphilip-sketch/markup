import { describe, it, expect, beforeAll } from 'vitest';

// Store original env
const OLD_ENV = process.env;

describe('POST /api/generate-question', () => {
  beforeAll(() => {
    process.env = { ...OLD_ENV };
    // Ensure no API keys are set for validation tests
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  });

  it('returns 500 when no API keys are configured', async () => {
    // Dynamic import to get fresh module state
    const { POST } = await import('@/app/api/generate-question/route');

    const req = new Request('http://localhost:3000/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Social Studies',
        topic: 'Any Topic (Random Mix)',
        questionType: 'All Formats (SBCS + SEQ + SRQ Bundle)',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain('AI generation unavailable');
  });

  it('returns 500 when given empty body', async () => {
    const { POST } = await import('@/app/api/generate-question/route');

    const req = new Request('http://localhost:3000/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain('AI generation unavailable');
  });

  it('accepts sourceCount parameter within valid range (2-5)', async () => {
    const { POST } = await import('@/app/api/generate-question/route');

    // Test with sourceCount=3 — should still fail with 500 because no API keys,
    // but the error should be about missing keys, not sourceCount validation
    const req = new Request('http://localhost:3000/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Social Studies',
        topic: 'Any Topic (Random Mix)',
        questionType: 'All Formats (SBCS + SEQ + SRQ Bundle)',
        sourceCount: 3,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    // Should fail due to no API keys, not due to invalid sourceCount
    expect(res.status).toBe(500);
    expect(body.error).toContain('AI generation unavailable');
  });
});
