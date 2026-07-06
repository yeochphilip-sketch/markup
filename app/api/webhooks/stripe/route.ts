import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acme' as any, // Standard stable Stripe API initialization
});

// Initialize Supabase with the Master Admin Service Role Key to bypass RLS policies during webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Case 1: Student successfully checks out a premium tier plan
  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customerId = session.customer;
    const userUuid = session.client_reference_id; // Pass this from the checkout button link

    if (userUuid) {
      await supabaseAdmin
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          subscription_tier: 'pro', // Elevate user parameters to premium status
        })
        .eq('id', userUuid);
    }
  }

  // Case 2: Subscription ends or credit card failure cancels the plan
  if (event.type === 'customer.subscription.deleted') {
    const customerId = session.customer;
    
    await supabaseAdmin
      .from('profiles')
      .update({ subscription_tier: 'free' }) // Revoke premium tier features
      .eq('stripe_customer_id', customerId);
  }

  return NextResponse.json({ received: true });
}
