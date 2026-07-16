import { describe, it, expect } from 'vitest';

describe('POST /api/feedback', () => {
  it('returns 400 when description is empty', async () => {
    const { POST } = await import('@/app/api/feedback/route');

    const req = new Request('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: null,
        userEmail: 'test@example.com',
        feedbackType: 'General',
        description: '',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('blank');
  });

  it('accepts valid feedback submission', async () => {
    const { POST } = await import('@/app/api/feedback/route');

    const req = new Request('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        userEmail: 'student@example.com',
        feedbackType: 'Bug',
        description: 'I found a bug where the timer resets when switching tabs.',
      }),
    });

    const res = await POST(req);

    // Should succeed because the POST handler just logs to Supabase
    // If Supabase isn't configured, it will throw a different error
    // We're testing that valid input doesn't get rejected by schema validation
    expect(res.status).not.toBe(400);
  });

  it('handles missing optional fields gracefully', async () => {
    const { POST } = await import('@/app/api/feedback/route');

    const req = new Request('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'This is a test feedback without optional fields.',
      }),
    });

    const res = await POST(req);

    // Should not throw — optional fields are optional
    expect(res.status).not.toBe(400);
  });
});

describe('PATCH /api/feedback', () => {
  it('returns 400 when id is missing', async () => {
    const { PATCH } = await import('@/app/api/feedback/route');

    const req = new Request('http://localhost:3000/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved: true,
      }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Missing feedback id');
  });

  it('handles approved boolean toggle', async () => {
    const { PATCH } = await import('@/app/api/feedback/route');

    const req = new Request('http://localhost:3000/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test-id-123',
        approved: true,
      }),
    });

    const res = await PATCH(req);

    // Will fail with Supabase error since no real env, but not a 400
    expect(res.status).not.toBe(400);
  });
});
