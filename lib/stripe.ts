import Stripe from 'stripe';

// ════════════════════════════════════════════════════════════
//  Stripe server-side singleton
// ════════════════════════════════════════════════════════════

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  _stripe = new Stripe(key);
  // Stripe API version defaults to the latest stable version for the account.
  // Create recurring prices (monthly) in Stripe Dashboard for:
  //   - Scholar Pass ($9.99/mo) → set STRIPE_PRICE_SCHOLAR_PASS env var
  //   - Expert Pass ($19.99/mo) → set STRIPE_PRICE_EXPERT_PASS env var
  // Create a 20%-off coupon with id "BETA-WAITLIST-20" in Stripe Dashboard > Coupons.
  return _stripe;
}

// ════════════════════════════════════════════════════════════
//  Price IDs for each tier (set via env vars)
//  The user creates these in Stripe Dashboard.
// ════════════════════════════════════════════════════════════

export function getPriceId(tier: 'scholar_pass' | 'expert_pass'): string {
  const key =
    tier === 'scholar_pass'
      ? 'STRIPE_PRICE_SCHOLAR_PASS'
      : 'STRIPE_PRICE_EXPERT_PASS';
  const id = process.env[key];
  if (!id) throw new Error(`${key} is not configured`);
  return id;
}

// ════════════════════════════════════════════════════════════
//  Coupon ID for waitlist 20%-off discount
//  Create once in Stripe Dashboard → Coupons → "BETA-WAITLIST-20"
// ════════════════════════════════════════════════════════════

export const WAITLIST_COUPON_ID = 'BETA-WAITLIST-20';

// ════════════════════════════════════════════════════════════
//  Price lookup from tier ID (returns amount in cents)
// ════════════════════════════════════════════════════════════

export const TIER_PRICES_CENTS: Record<string, number> = {
  scholar_pass: 999,  // $9.99
  expert_pass: 1999,  // $19.99
};

export const TIER_NAMES: Record<string, string> = {
  scholar_pass: 'Scholar Pass',
  expert_pass: 'Expert Pass',
};
