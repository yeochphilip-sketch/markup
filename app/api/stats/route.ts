import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        totalUsers: null,
        totalEvaluations: null,
        totalXp: null,
        avgStreak: null,
        avgXp: null,
        topXp: null,
      }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Run all queries in parallel
    const [userCountResult, evalCountResult, xpSumResult, avgResult] = await Promise.allSettled([
      supabase.from('user_skill_metrics').select('*', { count: 'exact', head: true }),
      supabase.from('essay_evaluations').select('*', { count: 'exact', head: true }),
      supabase.from('user_skill_metrics').select('total_xp'),
      supabase.from('user_skill_metrics').select('total_xp, current_streak'),
    ]);

    const totalUsers = userCountResult.status === 'fulfilled' ? (userCountResult.value.count ?? 0) : 0;
    const totalEvaluations = evalCountResult.status === 'fulfilled' ? (evalCountResult.value.count ?? 0) : 0;

    let totalXp = 0;
    if (xpSumResult.status === 'fulfilled' && xpSumResult.value.data) {
      const rows = xpSumResult.value.data as Array<{ total_xp: number | null }>;
      totalXp = rows.reduce((sum, r) => sum + (r.total_xp ?? 0), 0);
    }

    let avgStreak = 0;
    let avgXp = 0;
    let topXp = 0;
    if (avgResult.status === 'fulfilled' && avgResult.value.data) {
      const rows = avgResult.value.data as Array<{ total_xp: number | null; current_streak: number | null }>;
      const count = rows.length || 1;
      avgStreak = Math.round(rows.reduce((sum, r) => sum + (r.current_streak ?? 0), 0) / count);
      avgXp = Math.round(rows.reduce((sum, r) => sum + (r.total_xp ?? 0), 0) / count);
      topXp = rows.reduce((max, r) => Math.max(max, r.total_xp ?? 0), 0);
    }

    return NextResponse.json({
      totalUsers,
      totalEvaluations,
      totalXp,
      avgStreak,
      avgXp,
      topXp,
    }, { status: 200 });
  } catch (err) {
    console.error('Stats endpoint error:', err);
    return NextResponse.json({
      totalUsers: null,
      totalEvaluations: null,
      totalXp: null,
      avgStreak: null,
      avgXp: null,
      topXp: null,
    }, { status: 200 });
  }
}
