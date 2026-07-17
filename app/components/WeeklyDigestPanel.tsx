'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLevelConfig } from '@/lib/gamification';

interface WeeklyDigestData {
  essaysThisWeek: number;
  xpEarnedThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  currentLevel: string;
  currentXp: number;
  subjectsThisWeek: string[];
  daysActive: number;
  totalEvaluations: number;
  achievementCount: number;
  skillAverages: {
    inference: number;
    comparison: number;
    reliability: number;
    essay: number;
    conclusion: number;
  };
  weekStart: string;
  weekEnd: string;
}

interface WeeklyDigestPanelProps {
  userId: string | null;
  masteryPoints: number;
  levelTitle: string;
  streakData: { current: number; longest: number };
  totalEvaluations: number;
}

export default function WeeklyDigestPanel({
  userId,
  masteryPoints,
  levelTitle,
  totalEvaluations,
}: WeeklyDigestPanelProps) {
  const [digest, setDigest] = useState<WeeklyDigestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDigest = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weekly-digest?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(errData.error || `API returned ${res.status}`);
      }
      const data = await res.json();
      setDigest(data);
    } catch (err) {
      console.warn('Weekly digest fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly digest');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchDigest();
  }, [userId, fetchDigest]);

  // Get the icon for the current level
  const levelIcon = getLevelConfig(levelTitle).icon || '🌱';

  if (!userId) return null;

  return (
    <div className="bg-gradient-to-br from-slate-950/90 via-indigo-950/30 to-slate-950/90 border border-slate-800/60 rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-900/40 transition group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-base group-hover:scale-110 transition-transform">
            📊
          </div>
          <div className="text-left">
            <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              Weekly Digest
            </h3>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
              {digest
                ? `${digest.weekStart} – ${digest.weekEnd}`
                : loading
                ? 'Loading...'
                : 'Your weekly summary'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {digest && (
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
              <span className="text-[9px] font-black text-indigo-400 font-mono">
                +{digest.xpEarnedThisWeek} XP
              </span>
            </div>
          )}
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            } group-hover:text-slate-300`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-5 space-y-4">
          {/* Divider */}
          <div className="border-t border-slate-800/60" />

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-slate-500">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[10px] font-mono">Crunching your weekly stats...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-center">
              <p className="text-[9px] text-rose-400 font-medium">{error}</p>
              <button
                onClick={fetchDigest}
                className="mt-2 text-[9px] text-indigo-400 hover:text-indigo-300 underline font-bold"
              >
                Retry
              </button>
            </div>
          ) : digest ? (
            <div className="space-y-4">
              {/* ── Stats Grid ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* Essays this week */}
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Essays</p>
                  <p className="text-lg font-black font-mono text-indigo-400 mt-0.5">{digest.essaysThisWeek}</p>
                  <p className="text-[8px] text-slate-600 font-mono">this week</p>
                </div>

                {/* XP earned this week */}
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 text-center relative overflow-hidden">
                  {digest.xpEarnedThisWeek > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />
                  )}
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest relative">XP Earned</p>
                  <p className={`text-lg font-black font-mono mt-0.5 relative ${
                    digest.xpEarnedThisWeek > 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {digest.xpEarnedThisWeek > 0 ? '+' : ''}{digest.xpEarnedThisWeek}
                  </p>
                  <p className="text-[8px] text-slate-600 font-mono relative">this week</p>
                </div>

                {/* Streak */}
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Streak</p>
                  <p className={`text-lg font-black font-mono mt-0.5 ${
                    digest.currentStreak >= 3 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {digest.currentStreak}<span className="text-xs text-slate-500">d</span>
                  </p>
                  {digest.longestStreak > 1 && (
                    <p className="text-[8px] text-slate-600 font-mono">Best: {digest.longestStreak}d</p>
                  )}
                </div>

                {/* Days active */}
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Active Days</p>
                  <p className="text-lg font-black font-mono text-purple-400 mt-0.5">{digest.daysActive}</p>
                  <p className="text-[8px] text-slate-600 font-mono">this week</p>
                </div>
              </div>

              {/* ── Subjects practiced ── */}
              {digest.subjectsThisWeek.length > 0 && (
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-2">Subjects Practiced</p>
                  <div className="flex flex-wrap gap-1.5">
                    {digest.subjectsThisWeek.map((subject) => {
                      const isSS = subject === 'Social Studies';
                      return (
                        <span
                          key={subject}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                            isSS
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isSS ? '📖 Social Studies' : '🏛️ Elective History'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── XP Trend mini-visualization (bar showing XP vs level progress) ── */}
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{levelIcon}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{levelTitle}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">
                    {digest.currentXp.toLocaleString()} XP
                  </span>
                </div>
                {/* XP bar showing total progress */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                    style={{ width: `${Math.min((digest.currentXp / 5000) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[7px] text-slate-600 font-mono">0 XP</span>
                  <div className="flex items-center gap-2">
                    {digest.xpEarnedThisWeek > 0 && (
                      <span className="text-[7px] text-emerald-400 font-mono font-bold">
                        ▲ +{digest.xpEarnedThisWeek} this week
                      </span>
                    )}
                    <span className="text-[7px] text-slate-600 font-mono">{totalEvaluations} total essays</span>
                  </div>
                  <span className="text-[7px] text-slate-600 font-mono">5,000 XP</span>
                </div>
              </div>

              {/* ── Quick Stats Row ── */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 text-center">
                  <span className="text-base block mb-1">🏅</span>
                  <p className="text-[10px] font-black font-mono text-white">{digest.achievementCount}</p>
                  <p className="text-[8px] text-slate-500 font-mono">achievements</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 text-center">
                  <span className="text-base block mb-1">📝</span>
                  <p className="text-[10px] font-black font-mono text-white">{digest.totalEvaluations}</p>
                  <p className="text-[8px] text-slate-500 font-mono">all-time essays</p>
                </div>
              </div>

              {/* ── Skill Averages ── */}
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-2">Current Skill Levels</p>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { label: 'Inference', key: 'inference' as const, max: 5 },
                    { label: 'Compare', key: 'comparison' as const, max: 6 },
                    { label: 'Reliability', key: 'reliability' as const, max: 6 },
                    { label: 'Essay', key: 'essay' as const, max: 8 },
                    { label: 'Conc.', key: 'conclusion' as const, max: 2 },
                  ].map((s) => {
                    const val = digest.skillAverages[s.key] || 1;
                    const isHigh = val >= Math.ceil(s.max / 2);
                    return (
                      <div key={s.key} className="text-center">
                        <p className="text-[7px] text-slate-600 font-bold uppercase truncate">{s.label}</p>
                        <div className="h-14 sm:h-16 bg-slate-800 rounded-lg overflow-hidden relative flex items-end mt-1">
                          <div
                            className={`w-full rounded-t transition-all duration-700 ${
                              isHigh
                                ? 'bg-gradient-to-t from-indigo-500 to-purple-500'
                                : 'bg-gradient-to-t from-rose-500 to-orange-500'
                            }`}
                            style={{ height: `${Math.min((val / s.max) * 100, 100)}%` }}
                          />
                        </div>
                        <p className={`text-[9px] font-black font-mono mt-0.5 ${isHigh ? 'text-emerald-400' : 'text-rose-400'}`}>
                          L{val}/{s.max}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-5 text-center">
              <span className="text-2xl block mb-2">📋</span>
              <p className="text-[10px] text-slate-500 font-mono">
                No data yet this week. Start practicing to see your weekly digest!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-1">
            <button
              onClick={fetchDigest}
              className="text-[8px] text-slate-600 hover:text-indigo-400 transition font-mono"
              title="Refresh weekly data"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
