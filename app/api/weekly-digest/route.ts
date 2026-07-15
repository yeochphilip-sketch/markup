import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST() {
  try {
    // This endpoint is called by a Vercel Cron Job every Sunday
    // It queries all active users and sends a weekly summary
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://markup-five.vercel.app';

    // Fetch all users with activity in the past week
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    // Get all users who have evaluations this week
    const { data: activeUsers } = await supabaseAdmin
      .from('essay_evaluations')
      .select('user_id')
      .gte('created_at', weekAgoStr) as any;

    const userIds = [...new Set((activeUsers ?? []).map((r: any) => r.user_id).filter(Boolean))] as string[];

    if (userIds.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No active users this week' });
    }

    // Fetch user profiles and metrics
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email_address, full_name')
      .in('id', userIds) as any;

    const { data: metrics } = await supabaseAdmin
      .from('user_skill_metrics')
      .select('user_id, total_xp, current_streak, total_evaluations, sbq_inference_score, sbq_comparison_score, sbq_reliability_score, seq_essay_score, seq_conclusion_score')
      .in('user_id', userIds) as any;

    const { data: evalCounts } = await supabaseAdmin
      .from('essay_evaluations')
      .select('user_id')
      .gte('created_at', weekAgoStr) as any;

    const weeklyCounts: Record<string, number> = {};
    (evalCounts ?? []).forEach((e: any) => {
      if (e.user_id) weeklyCounts[e.user_id] = (weeklyCounts[e.user_id] ?? 0) + 1;
    });

    let sentCount = 0;
    for (const profile of (profiles ?? []) as Array<{ id: string; email_address: string | null; full_name: string | null }>) {
      if (!profile.email_address) continue;

      const userMetrics = (metrics ?? []).find((m: any) => m.user_id === profile.id);
      const weeklyEvals = weeklyCounts[profile.id] ?? 0;
      const xp = userMetrics?.total_xp ?? 0;
      const streak = userMetrics?.current_streak ?? 0;

      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0a0a1a; color: #e2e8f0; border-radius: 16px;">
          <h1 style="color: #6366f1; font-size: 24px; font-weight: 900;">Your MARKUP Week</h1>
          <p style="color: #94a3b8; margin-top: 4px;">Hi ${profile.full_name || 'there'}! Here's your weekly summary.</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
            <div style="background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
              <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Essays</p>
              <p style="font-size: 28px; font-weight: 900; color: #6366f1; margin-top: 4px;">${weeklyEvals}</p>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
              <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Streak</p>
              <p style="font-size: 28px; font-weight: 900; color: #f59e0b; margin-top: 4px;">${streak}d</p>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
              <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Total XP</p>
              <p style="font-size: 28px; font-weight: 900; color: #10b981; margin-top: 4px;">${xp}</p>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
              <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">All Time</p>
              <p style="font-size: 28px; font-weight: 900; color: #f472b6; margin-top: 4px;">${userMetrics?.total_evaluations ?? 0}</p>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 16px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b;">
            <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Skill Radar</p>
            <div style="margin-top: 8px;">
              ${['sbq_inference_score', 'sbq_comparison_score', 'sbq_reliability_score', 'seq_essay_score', 'seq_conclusion_score'].map(col => {
                const val = (userMetrics as any)?.[col] ?? 0;
                const name = col.replace('sbq_', '').replace('seq_', 'SEQ ').replace('_score', '').replace('_', ' ');
                return `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 12px; color: #94a3b8;">${name}</span><span style="font-size: 12px; font-weight: 700; color: ${val >= 3 ? '#10b981' : '#f43f5e'};">L${val}</span></div>`;
              }).join('')}
            </div>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px;">
              Continue Practicing →
            </a>
            <p style="font-size: 10px; color: #475569; margin-top: 12px;">
              You're receiving this because you have a MARKUP account.
            </p>
          </div>
        </div>
      `;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.SEND_FROM_EMAIL || 'MARKUP <onboarding@resend.dev>',
            to: profile.email_address,
            subject: '📊 Your MARKUP Week — Weekly Practice Summary',
            html,
          }),
        });
        sentCount++;
      } catch (emailErr) {
        console.warn(`Failed to send weekly digest to ${profile.email_address}:`, emailErr);
      }
    }

    return NextResponse.json({ sent: sentCount, total: userIds.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('weekly-digest failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
