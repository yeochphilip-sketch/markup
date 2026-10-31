import { describe, it, expect } from 'vitest';

describe('POST /api/grade', () => {
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
});
