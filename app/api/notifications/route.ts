import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseAdminInstance = createClient(url, key);
  return supabaseAdminInstance;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('notifications GET failed:', message);
    return NextResponse.json({ notifications: [], unreadCount: 0, _debug: 'notif get catch: ' + message });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body as { userId: string; notificationId?: string };

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return NextResponse.json({ success: true });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('notifications PATCH failed:', message);
    return NextResponse.json({ success: true, _debug: 'notif patch catch: ' + message });
  }
}
