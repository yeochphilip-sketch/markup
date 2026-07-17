import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events:
 *  - checkout.session.completed  → update user subscription, link waitlist discount
 *  - customer.subscription.updated  → sync subscription tier changes
 *  - customer.subscription.deleted  → revert user to free tier
 *  - invoice.paid  → refresh billing_rate
 */
export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig || '', webhookSecret);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    switch (event.type) {
      // ═══════════════════════════════════════════════════
      //  checkout.session.completed
      // ═══════════════════════════════════════════════════
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_details?.email;

        if (!userId || !tier) {
          console.warn('stripe webhook: missing userId or tier in session metadata');
          break;
        }

        // Update user_profiles with subscription + Stripe customer info
        await supabase
          .from('user_profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_tier: tier,
            selected_plan: tier === 'scholar_pass' ? 'Scholar Pass' : 'Expert Pass',
            billing_rate: tier === 'scholar_pass' ? 9.99 : 19.99,
            account_status: 'Active',
          } as never)
          .eq('id', userId);

        // ── Link waitlist discount if user's email is on the waitlist ──
        if (customerEmail) {
          const { data: waitlistEntry } = await supabase
            .from('waitlist_signups')
            .select('email')
            .eq('email', customerEmail.toLowerCase().trim())
            .single();

          if (waitlistEntry) {
            // Set 20% discount for waitlist users
            await supabase
              .from('user_profiles')
              .update({ waitlist_discount: 20 } as never)
              .eq('id', userId);
          }
        }

        break;
      }

      // ═══════════════════════════════════════════════════
      //  customer.subscription.updated
      // ═══════════════════════════════════════════════════
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const subCustomerId = sub.customer;
        const subStatus = sub.status;
        const subItems = sub.items?.data || [];
        const subPriceId = subItems[0]?.price?.id;
        const subProductId = subItems[0]?.price?.product;

        // Determine which tier based on the price/product
        const priceId = subPriceId || '';
        // Map known price IDs to tiers — these match the env vars
        const scholarPriceId = process.env.STRIPE_PRICE_SCHOLAR_PASS || '';
        const expertPriceId = process.env.STRIPE_PRICE_EXPERT_PASS || '';

        let newTier = 'free';
        if (priceId === scholarPriceId) newTier = 'scholar_pass';
        else if (priceId === expertPriceId) newTier = 'expert_pass';

        const newPlan = newTier === 'scholar_pass' ? 'Scholar Pass' : newTier === 'expert_pass' ? 'Expert Pass' : 'Free';
        const newRate = newTier === 'scholar_pass' ? 9.99 : newTier === 'expert_pass' ? 19.99 : 0;

        await supabase
          .from('user_profiles')
          .update({
            subscription_tier: newTier,
            selected_plan: newPlan,
            billing_rate: newRate,
            stripe_subscription_id: sub.id,
            account_status: subStatus === 'active' ? 'Active' : subStatus === 'past_due' ? 'Past Due' : subStatus === 'canceled' ? 'Cancelled' : 'Active',
          } as never)
          .eq('stripe_customer_id', subCustomerId);

        break;
      }

      // ═══════════════════════════════════════════════════
      //  customer.subscription.deleted
      // ═══════════════════════════════════════════════════
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as any;
        const deletedCustomerId = deletedSub.customer;

        await supabase
          .from('user_profiles')
          .update({
            subscription_tier: 'free',
            selected_plan: 'Free',
            billing_rate: 0,
            stripe_subscription_id: null,
            account_status: 'Active',
          } as never)
          .eq('stripe_customer_id', deletedCustomerId);

        break;
      }

      // ═══════════════════════════════════════════════════
      //  invoice.paid — refresh billing rate
      // ═══════════════════════════════════════════════════
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const invCustomerId = invoice.customer;
        const invTotal = invoice.total; // amount in cents

        if (invTotal !== undefined) {
          await supabase
            .from('user_profiles')
            .update({ billing_rate: invTotal / 100 } as never)
            .eq('stripe_customer_id', invCustomerId);
        }
        break;
      }

      default:
        // Unhandled event types are silently ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('stripe webhook error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
