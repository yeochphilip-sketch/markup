import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase, getAuthUserId } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * Shared SQL query + response builder for user_skill_metrics.
 * Accepts any Supabase-compatible client (service-role or authenticated).
 */
const METRICS_SELECT = `
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
`;

function buildMetricsResponse(metrics: Record<string, any> | null) {
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
}

function defaultMetricsResponse() {
  return buildMetricsResponse(null);
}

async function fetchUserMetrics(supabase: any, userId: string) {
  const { data: metrics, error } = await supabase
    .from('user_skill_metrics')
    .select(METRICS_SELECT)
    .eq('user_id', userId)
    .single();
  return { metrics, error };
}

/**
 * Resolve the effective user ID: prefer the request param (for backward compat
 * with service-role-key setups), fall back to the authenticated session.
 */
async function resolveUserId(request: Request): Promise<string | null> {
  try {
    const { searchParams } = new URL(request.url);
    const paramId = searchParams.get('userId');
    if (paramId) return paramId;
  } catch { /* ignore */ }
  return getAuthUserId();
}

/**
 * GET /api/user/settings?userId=xxx
 */
export async function GET(request: Request) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { metrics, error } = await fetchUserMetrics(createClient(supabaseUrl, supabaseKey), userId);
      if (!error) {
        return buildMetricsResponse(metrics);
      }
      console.warn('settings GET error (falling back to session auth):', error);
    }

    // Fallback: cookie-based session auth (respects RLS)
    const { metrics, error } = await fetchUserMetrics(await getServerSupabase(), userId);
    if (error) {
      console.warn('settings GET (fallback) error:', error);
      return defaultMetricsResponse();
    }
    return buildMetricsResponse(metrics);
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
    const { userId: bodyUserId, ...updates } = body as {
      userId?: string;
      email_reminders_enabled?: boolean;
      practice_receipt_enabled?: boolean;
      ss_goal_level?: string | null;
      history_goal_level?: string | null;
      takes_history?: boolean;
      exam_date?: string | null;
      exam_goal_level?: string | null;
    };

    // Resolve userId: try request body first (for backward compat), then session
    let userId = bodyUserId ?? null;
    if (!userId) {
      userId = await getAuthUserId();
    }
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Try service role key first (may fail if env var is misconfigured)
    if (supabaseUrl && supabaseKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabaseAdmin
        .from('user_skill_metrics')
        .upsert(
          { user_id: userId, ...updateData } as never,
          { onConflict: 'user_id' }
        );
      if (!error) {
        return NextResponse.json({ success: true });
      }
      console.warn('settings PATCH service-role error (falling back to session auth):', error.message);
    }

    // Fallback: use cookie-based session auth (respects RLS)
    const supabase = await getServerSupabase();
    const { error } = await supabase
      .from('user_skill_metrics')
      .upsert(
        { user_id: userId, ...updateData } as never,
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('settings PATCH (fallback) error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('settings PATCH failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
