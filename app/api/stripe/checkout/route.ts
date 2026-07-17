import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, getPriceId, WAITLIST_COUPON_ID } from '@/lib/stripe';

export const runtime = 'nodejs';
export const maxDuration = 15;

/**
 * POST /api/stripe/checkout
 *
 * Body: { tier: 'scholar_pass' | 'expert_pass', userId: string, email?: string }
 *
 * Creates a Stripe Checkout Session and returns the session URL.
 * If the user's profile has waitlist_discount > 0, a 20%-off coupon is applied.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tier: 'scholar_pass' | 'expert_pass';
      userId: string;
      email?: string;
    };
    const { tier, userId } = body;
    let email = body.email;

    if (!tier || !['scholar_pass', 'expert_pass'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = getPriceId(tier);

    // ── Fetch user profile to check for discount ──
    let waitlistDiscount = 0;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('waitlist_discount, stripe_customer_id, email_address')
          .eq('id', userId)
          .single();

        waitlistDiscount = profile?.waitlist_discount ?? 0;

        // Use profile email if not provided in request
        if (!email && profile?.email_address) {
          email = profile.email_address;
        }
      }
    } catch {
      // Non-fatal — proceed without discount
    }

    // ── Resolve or create Stripe customer ──
    const customerEmail = email || 'unknown@markup.app';

    // ── Build discount array ──
    const discounts: { coupon: string }[] = [];
    if (waitlistDiscount > 0) {
      discounts.push({ coupon: WAITLIST_COUPON_ID });
    }

    // ── Determine success/cancel URLs ──
    const origin = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // ── Create Checkout Session ──
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: discounts.length > 0 ? discounts : undefined,
      subscription_data: {
        metadata: {
          userId,
          tier,
          waitlistDiscount: String(waitlistDiscount),
        },
      },
      metadata: {
        userId,
        tier,
      },
      success_url: `${origin}/dashboard?checkout=success&tier=${tier}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('stripe/checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
