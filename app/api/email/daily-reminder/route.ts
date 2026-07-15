import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Shared auth checker — accepts `x-cron-secret` header OR `?secret=` query param.
 * Supports both POST (header auth) and GET (query-param auth for cron-job.org).
 */
function isAuthorized(request: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true; // no secret configured = open

  const headerSecret = request.headers.get('x-cron-secret');
  if (headerSecret === expectedSecret) return true;

  const querySecret = request.nextUrl.searchParams.get('secret');
  if (querySecret === expectedSecret) return true;

  return false;
}

/**
 * GET /api/email/daily-reminder
 *
 * Same as POST but uses query-param auth — designed for cron-job.org which
 * sends GET requests by default. Add `?secret=YOUR_CRON_SECRET` to the URL.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Delegate to POST handler via shared logic
  return POST(request);
}

/**
 * POST /api/email/daily-reminder
 *
 * Personalized reminder system — for each user who hasn't received a reminder today,
 * this computes their "preferred time" = 5 minutes before their last_active_at time
 * (in Singapore timezone). If the preferred time falls within the next 45 minutes,
 * the user gets a reminder email.
 *
 * Designed to be called by a cron job (e.g. cron-job.org) every ~30 minutes.
 * Auth: `x-cron-secret` header OR `?secret=YOUR_CRON_SECRET` query param.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ sent: false, reason: 'RESEND_API_KEY not configured' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ sent: false, reason: 'Supabase not configured' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // ── Singapore timezone reference (UTC+8, no DST) ──
    const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Singapore',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    // Current time in SGT minutes (using UTC offset math to avoid locale string parsing)
    const now = new Date();
    const sgtNow = new Date(now.getTime() + SGT_OFFSET_MS);
    const currentSgtMinutes = sgtNow.getUTCHours() * 60 + sgtNow.getUTCMinutes();

    // ── Fetch users with last_active_at who haven't been reminded today ──
    const { data: users, error: fetchErr } = await supabaseAdmin
      .from('user_skill_metrics')
      .select(`
        user_id,
        last_active_at,
        current_streak,
        total_xp,
        level_title,
        last_practice_date,
        email_reminders_enabled,
        user_profiles!inner(email, display_name)
      `)
      .not('last_active_at', 'is', null)
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${todayStr}`)
      .eq('email_reminders_enabled', true)
      .limit(200) as unknown as {
      data: Array<{
        user_id: string;
        last_active_at: string;
        current_streak: number;
        total_xp: number;
        level_title: string;
        last_practice_date: string | null;
        user_profiles: { email: string; display_name: string | null } | { email: string; display_name: string | null }[];
      }>;
      error: any;
    };

    if (fetchErr) {
      console.warn('daily-reminder: failed to fetch users:', fetchErr);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ sent: false, reason: 'No users to remind', count: 0 });
    }

    // ── Filter users whose preferred reminder window is NOW ──
    const WINDOW_MINUTES = 45; // check if preferred time falls within next 45 min

    const dueUsers = users.filter((user) => {
      if (!user.last_active_at) return false;

      const lastActive = new Date(user.last_active_at);
      // UTC offset math (SGT = UTC+8, no DST) to get SGT minutes since midnight
      const sgtLast = new Date(lastActive.getTime() + SGT_OFFSET_MS);
      const sgtLastMinutes = sgtLast.getUTCHours() * 60 + sgtLast.getUTCMinutes();

      // Preferred reminder time = 5 minutes before last_active time (in SGT)
      const preferredMinutes = (sgtLastMinutes - 5 + 1440) % 1440;

      // Check if this falls within our window: current time → current + WINDOW_MINUTES
      const diff = (preferredMinutes - currentSgtMinutes + 1440) % 1440;
      return diff >= 0 && diff <= WINDOW_MINUTES;
    });

    if (dueUsers.length === 0) {
      return NextResponse.json({
        sent: false,
        reason: 'No users due in this window',
        checked: users.length,
        window: `${Math.floor(currentSgtMinutes / 60)}:${String(currentSgtMinutes % 60).padStart(2, '0')} → next ${WINDOW_MINUTES}min SGT`,
      });
    }

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://markup-five.vercel.app';

    // ── Send personalized reminders ──
    let sentCount = 0;
    const errors: string[] = [];

    for (const user of dueUsers) {
      const profiles = Array.isArray(user.user_profiles)
        ? user.user_profiles
        : [user.user_profiles];
      const profile = profiles[0];
      if (!profile?.email) continue;

      const name = profile.display_name || undefined;
      const streak = user.current_streak || 0;
      const levelTitle = user.level_title || 'Novice';
      const xp = user.total_xp || 0;
      const lastActive = new Date(user.last_active_at);
      // Display-friendly time in SGT (uses toLocaleString for display only — not for logic)
      const lastActiveTimeStr = lastActive.toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Build personalized message
      let streakMsg = '';
      if (streak > 0) {
        streakMsg = `🔥 You have a <strong style="color: #f59e0b;">${streak}-day streak</strong> — do not let it break!`;
      } else if (user.last_practice_date) {
        streakMsg = `⚡ Your streak ended. Start a new one today!`;
      } else {
        streakMsg = '🚀 Ready for your first practice session?';
      }

      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0a0a1a; color: #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #6366f1; font-size: 24px; font-weight: 900; margin: 0;">MARKUP</h1>
          </div>

          <h2 style="font-size: 18px; font-weight: 700; margin: 0;">⏰ Time for practice, ${name || 'champion'}!</h2>
          <p style="color: #94a3b8; margin-top: 8px;">
            You were last here around <strong style="color: #6366f1;">${lastActiveTimeStr}</strong> yesterday — time for another session!
          </p>

          <div style="margin-top: 16px; padding: 16px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; text-align: center;">
            <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5; margin: 0;">
              ${streakMsg}
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
            <div style="background: #0f172a; padding: 12px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
              <p style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Level</p>
              <p style="font-size: 15px; font-weight: 700; color: #6366f1; margin-top: 4px;">${levelTitle}</p>
            </div>
            <div style="background: #0f172a; padding: 12px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
              <p style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Total XP</p>
              <p style="font-size: 15px; font-weight: 700; color: #f59e0b; margin-top: 4px;">${xp.toLocaleString()}</p>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Practice Now ${streak > 0 ? '🔥' : '🚀'}
            </a>
          </div>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center;">
            <p style="font-size: 10px; color: #475569; margin: 0;">
              You are receiving this because you have a MARKUP account.
              <br/>
              <a href="${SITE_URL}/dashboard/settings" style="color: #6366f1; text-decoration: underline;">Manage preferences</a>
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
            to: profile.email,
            subject: streak > 0
              ? `⏰ ${name || 'Champion'} — do not lose your ${streak}-day streak!`
              : `⏰ Time to practice, ${name || 'future A1 student'}! You were here around ${lastActiveTimeStr} yesterday.`,
            html,
          }),
        });
        sentCount++;

        // Mark reminder as sent for today
        await supabaseAdmin
          .from('user_skill_metrics')
          .update({ last_reminder_sent_at: todayStr } as never)
          .eq('user_id', user.user_id)
          .throwOnError();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${profile.email}: ${msg}`);
      }
    }

    return NextResponse.json({
      sent: true,
      count: sentCount,
      total: dueUsers.length,
      checked: users.length,
      window: {
        currentTime: `${Math.floor(currentSgtMinutes / 60)}:${String(currentSgtMinutes % 60).padStart(2, '0')}`,
        windowMinutes: WINDOW_MINUTES,
        timezone: 'Asia/Singapore',
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('daily-reminder failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
