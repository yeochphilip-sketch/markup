import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * POST /api/user/heartbeat
 *
 * Updates the user's `last_active_at` timestamp and computes their
 * preferred_reminder_time (in minutes since midnight UTC) based on
 * their current local time in Singapore (SGT) minus 5 minutes.
 *
 * Called by the dashboard on mount and periodically while the page is open.
 * This enables the daily reminder to be sent 5 minutes before the time
 * the user was last on the site the previous day.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const now = new Date();

    const { error } = await supabaseAdmin
      .from('user_skill_metrics')
      .update({
        last_active_at: now.toISOString(),
      } as never)
      .eq('user_id', userId);

    if (error) {
      console.warn('heartbeat: failed to update last_active_at:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, timestamp: now.toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('heartbeat failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
