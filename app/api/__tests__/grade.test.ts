import { describe, it, expect, beforeAll } from 'vitest';

const OLD_ENV = process.env;

describe('POST /api/grade', () => {
  beforeAll(() => {
    process.env = { ...OLD_ENV };
    // Ensure no API keys are set for validation tests
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  });

  it('returns 400 when all answers are empty', async () => {
    const { POST } = await import('@/app/api/grade/route');

    const req = new Request('http://localhost:3000/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sbcsAnswer: '',
        seqAnswer: '',
        srqAnswer: '',
        questionPrompt: 'Test question?',
        questionType: 'All Formats (SBCS + SEQ + SRQ Bundle)',
        subject: 'Social Studies',
        topic: 'Any Topic (Random Mix)',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('must be filled in');
  });

  it('returns 500 when no API keys are configured', async () => {
    const { POST } = await import('@/app/api/grade/route');

    const req = new Request('http://localhost:3000/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sbcsAnswer: 'This is a valid test answer for SBCS section.',
        seqAnswer: '',
        srqAnswer: '',
        questionPrompt: 'Test question about citizenship?',
        questionType: 'SBQ: Inference / Message (AO2)',
        subject: 'Social Studies',
        topic: 'Issue 1: Exploring Citizenship and Governance',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain('AI grading unavailable');
  });

  it('accepts multi-section answers (sbcs + seq + srq)', async () => {
    const { POST } = await import('@/app/api/grade/route');

    const req = new Request('http://localhost:3000/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sbcsAnswer: 'Source A suggests that the government prioritised economic growth through industrial policy.',
        seqAnswer: 'One key factor was the strategic location which allowed for trade routes to flourish.',
        srqAnswer: 'In my view, the most effective approach is a combination of top-down and bottom-up initiatives.',
        questionPrompt: 'Evaluate the government approach to economic development.',
        questionType: 'All Formats (SBCS + SEQ + SRQ Bundle)',
        subject: 'Social Studies',
        topic: 'Issue 2: Living in a Diverse Society',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    // Should fail due to no API keys, not validation
    expect(res.status).toBe(500);
    expect(body.error).toContain('AI grading unavailable');
  });
});
