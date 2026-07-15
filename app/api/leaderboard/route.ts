import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getLevelTitle } from '@/lib/gamification';

export const runtime = 'nodejs';
export const maxDuration = 20;

type SupabaseAdmin = ReturnType<typeof createClient>;

let supabaseAdminInstance: SupabaseAdmin | null = null;
function getSupabaseAdmin(): SupabaseAdmin | null {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseAdminInstance = createClient(url, key);
  return supabaseAdminInstance;
}

function getDecileLabel(percentile: number): string {
  if (percentile >= 95) return 'Top 5% — Elite';
  if (percentile >= 80) return 'Top 20% — Strong';
  if (percentile >= 60) return 'Top 40% — Advancing';
  if (percentile >= 40) return 'Middle 40% — Building';
  if (percentile >= 20) return 'Bottom 40% — Growing';
  return 'Bottom 20% — Rising';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // ── 1. Fetch current user's gamification state ──
    let myMetrics: any = null;
    try {
      const { data, error: myErr } = await (supabaseAdmin
        .from('user_skill_metrics')
        .select('total_xp, level_title, current_streak, longest_streak, last_practice_date, updated_at, sbq_inference_score, sbq_comparison_score, sbq_reliability_score, seq_essay_score, seq_conclusion_score')
        .eq('user_id', userId)
        .single() as any);
      if (!myErr && data) myMetrics = data;
    } catch (fetchErr) {
      console.warn('Leaderboard fetch warning:', fetchErr);
    }

    if (!myMetrics) {
      return NextResponse.json({ error: 'User metrics not available yet' }, { status: 404 });
    }

    const myXp = myMetrics.total_xp ?? 0;

    // ── 2. Count total active users and my rank ──
    const { count: totalUsers } = await (supabaseAdmin
      .from('user_skill_metrics')
      .select('*', { count: 'exact', head: true }) as any);

    const userCount = totalUsers ?? 1;

    const { data: higherThanMe } = await (supabaseAdmin
      .from('user_skill_metrics')
      .select('id')
      .gt('total_xp', myXp) as any);

    const myRank = (higherThanMe?.length ?? 0) + 1;
    const percentile = Math.max(1, Math.round(((userCount - myRank + 1) / userCount) * 100));

    // ── 3. My rank trend (compare against past evaluations) ──
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    const { count: recentEvaluations } = await (supabaseAdmin
      .from('essay_evaluations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgoStr) as any);

    // ── 4. Most improved this week ──
    const { data: recentActiveUsers } = await (supabaseAdmin
      .from('essay_evaluations')
      .select('user_id')
      .gte('created_at', weekAgoStr) as any);

    const evalCounts: Record<string, number> = {};
    if (recentActiveUsers) {
      for (const row of recentActiveUsers as Array<{ user_id: string }>) {
        if (row.user_id) {
          evalCounts[row.user_id] = (evalCounts[row.user_id] ?? 0) + 1;
        }
      }
    }

    const activeUserIds = Object.keys(evalCounts).filter(id => id !== userId);
    let mostImproved: { userId: string; xpGained: number }[] = [];

    if (activeUserIds.length > 0) {
      const { data: improverMetrics } = await (supabaseAdmin
        .from('user_skill_metrics')
        .select('user_id, total_xp')
        .in('user_id', activeUserIds) as any);

      if (improverMetrics) {
        mostImproved = (improverMetrics as Array<{ user_id: string; total_xp: number }>)
          .map(u => ({
            userId: u.user_id,
            xpGained: evalCounts[u.user_id] * 100,
          }))
          .sort((a, b) => b.xpGained - a.xpGained)
          .slice(0, 5);
      }
    }

    // ── 5. Peers at similar level ──
    const myLevel = getLevelTitle(myXp);
    const { data: sameLevelPeers } = await (supabaseAdmin
      .from('user_skill_metrics')
      .select('user_id, total_xp, current_streak')
      .eq('level_title', myLevel)
      .neq('user_id', userId)
      .order('total_xp', { ascending: false })
      .limit(5) as any);

    // ── 6. Average stats for reference ──
    const { data: avgStats } = await (supabaseAdmin
      .from('user_skill_metrics')
      .select('total_xp, current_streak') as any);

    const typedAvgStats = avgStats as Array<{ total_xp: number; current_streak: number }> | null;
    const avgXp = typedAvgStats && typedAvgStats.length > 0
      ? Math.round(typedAvgStats.reduce((sum, s) => sum + (s.total_xp ?? 0), 0) / typedAvgStats.length)
      : 0;

    const avgStreak = typedAvgStats && typedAvgStats.length > 0
      ? Math.round(typedAvgStats.reduce((sum, s) => sum + (s.current_streak ?? 0), 0) / typedAvgStats.length)
      : 0;

    const topXp = typedAvgStats && typedAvgStats.length > 0
      ? Math.max(...typedAvgStats.map(s => s.total_xp ?? 0))
      : 0;

    // ── 7. Leaderboard top 20 ──
    const { data: topTwenty } = await (supabaseAdmin
      .from('user_skill_metrics')
      .select('user_id, total_xp, level_title')
      .order('total_xp', { ascending: false })
      .limit(20) as any);

    const isInTopTwenty = myRank <= 20;

    const typedTopTwenty = topTwenty as Array<{ user_id: string; total_xp: number; level_title: string }> | null;
    const leaderboard = typedTopTwenty?.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.user_id,
      isMe: entry.user_id === userId,
      xp: entry.total_xp ?? 0,
      level: entry.level_title ?? 'Novice',
    })) ?? [];

    const typedSameLevelPeers = sameLevelPeers as Array<{ total_xp: number; current_streak: number }> | null;

    return NextResponse.json({
      myRank,
      totalUsers: userCount,
      percentile,
      decileLabel: getDecileLabel(percentile),
      myXp,
      myLevel,
      myStreak: myMetrics.current_streak ?? 0,
      myLongestStreak: myMetrics.longest_streak ?? 0,
      lastPracticeDate: myMetrics.last_practice_date,
      recentEvalCount: recentEvaluations ?? 0,

      avgXp,
      avgStreak,
      topXp,
      xpToNextLevel: myLevel === 'Master' ? 0 : 500,
      isInTopTwenty,

      sameLevelPeersCount: typedSameLevelPeers?.length ?? 0,
      sameLevelPeers: typedSameLevelPeers?.slice(0, 3).map(p => ({
        xp: p.total_xp ?? 0,
        streak: p.current_streak ?? 0,
      })) ?? [],

      mostImproved: mostImproved.slice(0, 5).map(m => ({
        xpGained: m.xpGained,
      })),

      leaderboard,

      trendDirection:
        (recentEvaluations ?? 0) >= 3 ? 'up' :
        (recentEvaluations ?? 0) >= 1 ? 'steady' : 'inactive',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown leaderboard error';
    console.error('leaderboard failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
