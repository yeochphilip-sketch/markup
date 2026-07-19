import { NextResponse } from 'next/server';

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
    const { email, name, scoreEstimate, subject, topic, skill, xpEarned } = body as {
      email?: string;
      name?: string;
      scoreEstimate?: string;
      subject?: string;
      topic?: string;
      skill?: string;
      xpEarned?: number;
    };

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://markup-five.vercel.app';
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ sent: false, reason: 'RESEND_API_KEY not configured' });
    }

    const xpColor = (xpEarned || 0) >= 50 ? '#10b981' : (xpEarned || 0) >= 20 ? '#f59e0b' : '#6366f1';

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0a0a1a; color: #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #6366f1; font-size: 24px; font-weight: 900; margin: 0;">MARKUP</h1>
        </div>

        <h2 style="font-size: 18px; font-weight: 700; margin: 0;">Practice Complete! 📝</h2>
        <p style="color: #94a3b8; margin-top: 4px;">Hi ${name || 'there'}, here is your practice summary.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
          <div style="background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
            <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Subject</p>
            <p style="font-size: 13px; font-weight: 700; color: #6366f1; margin-top: 4px;">${subject || 'N/A'}</p>
          </div>
          <div style="background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
            <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Skill</p>
            <p style="font-size: 13px; font-weight: 700; color: #f59e0b; margin-top: 4px;">${skill || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-top: 16px; background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #1e293b;">
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Score Estimate</p>
          <p style="font-size: 32px; font-weight: 900; color: #6366f1; margin: 8px 0;">${scoreEstimate || 'N/A'}</p>
          <p style="font-size: 11px; color: #64748b; margin: 0;">${topic || ''}</p>
        </div>

        ${xpEarned ? `
        <div style="margin-top: 12px; background: #0f172a; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #1e293b;">
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">XP Earned</p>
          <p style="font-size: 28px; font-weight: 900; color: ${xpColor}; margin: 4px 0;">+${xpEarned}</p>
        </div>
        ` : ''}

        <div style="margin-top: 24px; text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px;">
            View Full Results →
          </a>
        </div>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center;">
          <p style="font-size: 10px; color: #475569; margin: 0;">
            Keep going! Every practice session earns XP and builds your skills.
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
        subject: `📝 Practice Complete — ${subject || 'Humanities'} (${scoreEstimate || 'N/A'})`,
        html,
      }),
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('practice-receipt email failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
