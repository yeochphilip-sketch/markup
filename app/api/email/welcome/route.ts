import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Emails disabled during beta — re-enable post-launch
const EMAILS_ENABLED = false;

export async function POST(request: Request) {
  if (!EMAILS_ENABLED) {
    return NextResponse.json({ sent: false, reason: 'Emails disabled during beta' });
  }

  try {
    const body = await request.json();
    const { userId, email, name } = body as {
      userId?: string;
      email?: string;
      name?: string;
    };

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      // Silently skip if Resend not configured — non-critical
      return NextResponse.json({ sent: false, reason: 'RESEND_API_KEY not configured' });
    }

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://markup-five.vercel.app';

    // Build referral link
    let referralLink = '';
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        );
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('referral_code')
          .eq('id', userId)
          .single() as any;
        if (profile?.referral_code) {
          referralLink = `${SITE_URL}?ref=${profile.referral_code}`;
        }
      } catch {
        // non-fatal
      }
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0a0a1a; color: #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; font-size: 28px; font-weight: 900; margin: 0;">MARKUP</h1>
          <p style="color: #64748b; font-size: 11px; letter-spacing: 1px;">O-Level Humanities Practice</p>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; margin: 0;">Welcome to MARKUP, ${name || 'future A1 student'}! 🎉</h2>
        <p style="color: #94a3b8; line-height: 1.6; margin-top: 12px;">
          You have joined the beta for Singapore's first AI-powered O-Level Humanities practice platform.
          Everything is <strong style="color: #10b981;">completely free</strong> during beta.
        </p>

        <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-top: 20px; border: 1px solid #1e293b;">
          <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Your next steps</p>
          <div style="margin-top: 12px;">
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
              <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">1</span>
              <div>
                <p style="font-size: 14px; font-weight: 600; margin: 0; color: #e2e8f0;">Generate your first paper</p>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Pick a subject and topic, then hit \"Generate Practice\"</p>
              </div>
            </div>
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
              <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">2</span>
              <div>
                <p style="font-size: 14px; font-weight: 600; margin: 0; color: #e2e8f0;">Write your answers</p>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Type your SBCS, SEQ, and SRQ answers in the canvas</p>
              </div>
            </div>
            <div style="display: flex; gap: 12px;">
              <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">3</span>
              <div>
                <p style="font-size: 14px; font-weight: 600; margin: 0; color: #e2e8f0;">Get graded instantly</p>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Receive LORMS-aligned feedback, critique, and an A1 model answer</p>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Start Practicing →
          </a>
        </div>

        ${referralLink ? `
        <div style="margin-top: 20px; padding: 16px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">🔗 Share your referral link</p>
          <p style="font-size: 13px; color: #6366f1; font-weight: 700; margin: 8px 0 0 0; word-break: break-all;">${referralLink}</p>
          <p style="font-size: 10px; color: #475569; margin: 4px 0 0 0;">Invite friends — both of you get bonus XP when they join!</p>
        </div>
        ` : ''}

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center;">
          <p style="font-size: 10px; color: #475569; margin: 0;">
            You are receiving this because you created a MARKUP account.
          </p>
        </div>
      </div>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SEND_FROM_EMAIL || 'MARKUP <onboarding@resend.dev>',
        to: email,
        subject: '🎉 Welcome to MARKUP — Start Practicing',
        html,
      }),
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('welcome email failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
