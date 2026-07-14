import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId, examDate, examGoalLevel } = await request.json() as {
      userId: string;
      examDate: string;
      examGoalLevel: string;
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(url, key);

    const { error } = await supabaseAdmin
      .from('user_skill_metrics')
      .update({
        exam_date: examDate || null,
        exam_goal_level: examGoalLevel || null,
      } as never)
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
