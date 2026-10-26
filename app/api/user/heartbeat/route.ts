import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase, getAuthUserId, resolveUserId, getServiceRoleClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * POST /api/user/heartbeat
 *
 * Updates the user's `last_active_at` timestamp. Authentication is enforced:
 * the caller must be signed in, and the update is scoped to their own
 * `user_skill_metrics` row (RLS).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Resolve userId strictly from the session. Body userId is accepted ONLY
    // if it matches the authenticated session.
    let userId = body?.userId;
    if (userId) {
      const sessionUserId = await getAuthUserId(request);
      if (sessionUserId && sessionUserId === userId) {
        // Match confirmed — use the caller-supplied ID.
      } else {
        userId = await getAuthUserId(request);
      }
    } else {
      userId = await getAuthUserId(request);
    }

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseAdmin = getServiceRoleClient();
    const now = new Date();

    if (supabaseAdmin) {
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
    }

    // Fallback: use cookie-based session auth (respects RLS)
    const supabase = await getServerSupabase();
    const { error } = await supabase
      .from('user_skill_metrics')
      .update({
        last_active_at: now.toISOString(),
      } as never)
      .eq('user_id', userId);

    if (error) {
      console.warn('heartbeat (fallback): failed to update last_active_at:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, timestamp: now.toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('heartbeat failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
