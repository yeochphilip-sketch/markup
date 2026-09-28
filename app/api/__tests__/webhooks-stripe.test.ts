import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Test doubles (must be hoisted before vi.mock factories) ──
const { constructEventMock, createClientMock, betaFlag } = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  createClientMock: vi.fn(),
  betaFlag: { SHOW_POST_BETA_PRICING: false },
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({ webhooks: { constructEvent: constructEventMock } }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock('@/lib/beta-flags', () => betaFlag);

// Mimic Stripe's constructEvent: throw unless a known-good signature is passed.
// This keeps the tests focused on the route's guard logic (not Stripe's crypto).
constructEventMock.mockImplementation((_payload: string, sig: string) => {
  if (!sig) throw new Error('No signatures found');
  if (sig === 't=1,v1=valid') {
    return {
      id: 'evt_1',
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_test', id: 'sub_test' } },
    };
  }
  throw new Error('Signature does not match');
});

function makeRequest(body: string, sig: string | null): Request {
  return new Request('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sig ? { 'stripe-signature': sig } : {}),
    },
    body,
  });
}

describe('POST /api/webhooks/stripe — security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    betaFlag.SHOW_POST_BETA_PRICING = false;
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  it('rejects a missing signature with 400 even during beta', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeRequest('{"id":"evt_1"}', null));

    expect(res.status).toBe(400);
    // The DB must never be touched for an unverified event
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('rejects a forged signature with 400 even during beta', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeRequest('{"id":"evt_1"}', 't=9999999999,v1=deadbeef'));

    expect(res.status).toBe(400);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('acknowledges but ignores a VALID event during beta — no DB writes', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeRequest('{"id":"evt_1"}', 't=1,v1=valid'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
    expect(body.ignored).toContain('beta');
    // The signed event must still NOT reach the database while beta is on
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('processes valid events once the post-beta flag is on', async () => {
    betaFlag.SHOW_POST_BETA_PRICING = true;
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeRequest('{"id":"evt_1"}', 't=1,v1=valid'));

    // Guard is lifted — the route proceeds to the DB path
    expect(createClientMock).toHaveBeenCalled();
    // (Response may be 500 because the mocked DB chain is incomplete — that's fine)
    expect([200, 500]).toContain(res.status);
  });
});
