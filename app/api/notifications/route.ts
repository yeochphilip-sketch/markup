import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase, getAuthUserId } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // Fall back to session if no param
    if (!userId) {
      userId = await getAuthUserId();
    }
    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Try service role key first
    if (url && key) {
      const supabaseAdmin = createClient(url, key);
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

    // Resolve userId: try body first (for backward compat), then session
    let userId = bodyUserId ?? null;
    if (!userId) {
      userId = await getAuthUserId();
    }
    if (!userId) {
      return NextResponse.json({ success: true }); // Silently ignore
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Try service role key first
    if (url && key) {
      const supabaseAdmin = createClient(url, key);
      try {
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
      } catch (dbErr) {
        console.warn('user_notifications table may not exist yet:', dbErr);
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
