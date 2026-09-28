import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';

/**
 * @deprecated Use PATCH /api/user/settings instead.
 * This route is kept for backward compatibility.
 * Dashboard now calls /api/user/settings directly.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, subject, goalLevel, historyTrack } = body as {
      userId: string;
      subject: 'ss' | 'history';
      goalLevel: string | null;
      /** 'Elective History' | 'Pure History' | null (takes no History). */
      historyTrack?: string | null;
    };

    if (!userId || !subject) {
      return NextResponse.json({ error: 'userId and subject required' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ success: true });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      // Try service role key first, fall back to session auth
      const client = key
        ? createClient(url, key)
        : await getServerSupabase();

      // Map subject to the correct columns
      const updateData: Record<string, any> = {};
      if (subject === 'ss') {
        updateData.ss_goal_level = goalLevel || null;
      } else if (subject === 'history') {
        // takes_history follows the track, not the goal: a student who takes
        // History but has not set a target grade still takes History.
        const track = historyTrack ?? null;
        updateData.history_goal_level = goalLevel || null;
        updateData.history_track = track;
        updateData.takes_history = !!track;
      }

      const { error } = await client
        .from('user_skill_metrics')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.warn('exam-goal update warning:', error);
      }
    } catch (dbErr) {
      console.warn('exam-goal DB error (non-fatal):', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('exam-goal failed:', message);
    return NextResponse.json({ success: true, _debug: 'exam-goal catch: ' + message });
  }
}
