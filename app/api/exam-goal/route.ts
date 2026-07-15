import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, subject, goalLevel } = body as {
      userId: string;
      subject: 'ss' | 'history';
      goalLevel: string;
    };

    if (!userId || !subject) {
      return NextResponse.json({ error: 'userId and subject required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success: true });

    try {
      const supabaseAdmin = createClient(url, key);

      // Map subject to the correct columns
      const updateData: Record<string, any> = {};
      if (subject === 'ss') {
        updateData.ss_goal_level = goalLevel || null;
      } else if (subject === 'history') {
        updateData.history_goal_level = goalLevel || null;
        updateData.takes_history = !!goalLevel;
      }

      const { error } = await supabaseAdmin
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
