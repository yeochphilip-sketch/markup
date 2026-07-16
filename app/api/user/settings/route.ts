import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * GET /api/user/settings?userId=xxx
 *
 * Returns the user's current settings: notification prefs, sound, exam goals.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { data: metrics, error } = await supabaseAdmin
      .from('user_skill_metrics')
      .select(`
        email_reminders_enabled,
        practice_receipt_enabled,
        ss_goal_level,
        history_goal_level,
        takes_history,
        exam_date,
        exam_goal_level,
        current_streak,
        total_xp,
        level_title,
        total_evaluations
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('settings GET error:', error);
      return NextResponse.json({
        email_reminders_enabled: true,
        practice_receipt_enabled: true,
        ss_goal_level: null,
        history_goal_level: null,
        takes_history: false,
        exam_date: null,
        exam_goal_level: null,
        streak: 0,
        xp: 0,
        level: 'Novice',
        evaluations: 0,
      });
    }

    return NextResponse.json({
      email_reminders_enabled: metrics?.email_reminders_enabled ?? true,
      practice_receipt_enabled: metrics?.practice_receipt_enabled ?? true,
      ss_goal_level: metrics?.ss_goal_level ?? null,
      history_goal_level: metrics?.history_goal_level ?? null,
      takes_history: metrics?.takes_history ?? false,
      exam_date: metrics?.exam_date ?? null,
      exam_goal_level: metrics?.exam_goal_level ?? null,
      streak: metrics?.current_streak ?? 0,
      xp: metrics?.total_xp ?? 0,
      level: metrics?.level_title ?? 'Novice',
      evaluations: metrics?.total_evaluations ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('settings GET failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/user/settings
 *
 * Updates user settings. Body accepts any subset of the fields below.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body as {
      userId: string;
      email_reminders_enabled?: boolean;
      practice_receipt_enabled?: boolean;
      ss_goal_level?: string | null;
      history_goal_level?: string | null;
      takes_history?: boolean;
      exam_date?: string | null;
      exam_goal_level?: string | null;
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Only update fields that were actually sent
    const allowedFields = [
      'email_reminders_enabled',
      'practice_receipt_enabled',
      'ss_goal_level',
      'history_goal_level',
      'takes_history',
      'exam_date',
      'exam_goal_level',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = (updates as any)[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Always bump updated_at so we know when settings last changed
    updateData.updated_at = new Date().toISOString();

    // Use upsert (onConflict: 'user_id') so the row is CREATED if it doesn't exist yet —
    // e.g. for users whose signup predated the user_skill_metrics trigger.
    // If the row already exists, only the fields in updateData are touched.
    const { error } = await supabaseAdmin
      .from('user_skill_metrics')
      .upsert(
        { user_id: userId, ...updateData } as never,
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('settings PATCH error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('settings PATCH failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
