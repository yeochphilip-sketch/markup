import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase, getAuthUserId, resolveUserId, getServiceRoleClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Resolve userId: strictly from the authenticated session.
    // We do NOT accept a caller-supplied userId — the client can only read
    // its own notifications (RLS boundary).
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const supabaseAdmin = getServiceRoleClient();
    if (supabaseAdmin) {
      // Service role bypasses RLS but we still constrain to the authenticated
      // user's row. Use eq('user_id', userId) to prevent cross-tenant reads.
      try {
        const { data: notifications } = await supabaseAdmin
          .from('user_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20) as any;

        const { count: unreadCount } = await supabaseAdmin
          .from('user_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false) as any;

        return NextResponse.json({
          notifications: notifications ?? [],
          unreadCount: unreadCount ?? 0,
        });
      } catch (dbErr) {
        console.warn('user_notifications table may not exist yet:', dbErr);
        return NextResponse.json({ notifications: [], unreadCount: 0 });
      }
    }

    // Fallback: use cookie-based session auth (respects RLS)
    const supabase = await getServerSupabase();
    try {
      const { data: notifications } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20) as any;

      const { count: unreadCount } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false) as any;

      return NextResponse.json({
        notifications: notifications ?? [],
        unreadCount: unreadCount ?? 0,
      });
    } catch (dbErr) {
      console.warn('user_notifications table may not exist yet:', dbErr);
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('notifications GET failed:', message);
    return NextResponse.json({ notifications: [], unreadCount: 0, _debug: 'notif get catch: ' + message });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId: bodyUserId, notificationId } = body as { userId?: string; notificationId?: string };

    // Resolve userId strictly from session. Body userId is only accepted if it
    // matches the authenticated session (defense-in-depth).
    let userId: string | null | undefined = bodyUserId;
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
      return NextResponse.json({ success: true }); // Silently ignore
    }

    const supabaseAdmin = getServiceRoleClient();
    if (supabaseAdmin) {
      if (notificationId) {
        await supabaseAdmin
          .from('user_notifications')
          .update({ is_read: true } as never)
          .eq('id', notificationId)
          .eq('user_id', userId);
      } else {
        await supabaseAdmin
          .from('user_notifications')
          .update({ is_read: true } as never)
          .eq('user_id', userId)
          .eq('is_read', false);
      }
      return NextResponse.json({ success: true });
    }

    // Fallback: use cookie-based session auth (respects RLS)
    const supabase = await getServerSupabase();
    try {
      if (notificationId) {
        await supabase
          .from('user_notifications')
          .update({ is_read: true } as never)
          .eq('id', notificationId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_notifications')
          .update({ is_read: true } as never)
          .eq('user_id', userId)
          .eq('is_read', false);
      }
    } catch (dbErr) {
      console.warn('user_notifications table may not exist yet:', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('notifications PATCH failed:', message);
    return NextResponse.json({ success: true, _debug: 'notif patch catch: ' + message });
  }
}
