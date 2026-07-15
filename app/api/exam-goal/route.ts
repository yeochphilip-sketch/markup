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
    if (!url || !key) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(url, key);

    // Map subject to the correct columns
    const updateData: Record<string, any> = {};
    if (subject === 'ss') {
      updateData.ss_goal_level = goalLevel || null;
    } else if (subject === 'history') {
      updateData.history_goal_level = goalLevel || null;
      // If setting a History goal, mark user as taking History.
      // If clearing it, mark as not taking History.
      updateData.takes_history = goalLevel ? true : false;
    }

    const { error } = await supabaseAdmin
      .from('user_skill_metrics')
      .update(updateData as never)
      .eq('user_id', userId);

    if (error) {
      console.error('exam-goal update error:', error);
      return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('exam-goal failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
