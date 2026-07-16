'use client';

import { useEffect } from 'react';
import { useAutoDismiss } from '@/lib/useAutoDismiss';

interface LeaderboardData {
  myRank: number;
  totalUsers: number;
  percentile: number;
  decileLabel: string;
  myLevel: string;
  myXp: number;
  myStreak: number;
  myLongestStreak: number;
  recentEvalCount: number;
  trendDirection: string;
  sameLevelPeersCount: number;
  sameLevelPeers: { xp: number; streak: number }[];
  mostImproved: { xpGained: number }[];
  leaderboard: { rank: number; userId: string; isMe: boolean; xp: number; level: string }[];
  isInTopTwenty: boolean;
}

interface LeaderboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: LeaderboardData | null;
}

export default function LeaderboardDrawer({
  isOpen,
  onClose,
  isLoading,
  data,
}: LeaderboardDrawerProps) {
  const { dismiss, startTimer, handleMouseEnter, handleMouseLeave, isHovered } = useAutoDismiss(onClose, 12000);

  useEffect(() => {
    if (isOpen) {
      startTimer();
    }
  }, [isOpen, startTimer]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center pt-16 bg-black/60 backdrop-blur-sm"
      onClick={dismiss}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-950/50">
          <div className={`h-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-shrink-width-12s ${isHovered ? 'animate-paused' : ''}`} />
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[85vh] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase">🏆 Community</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition text-sm font-bold"
            >
              ✕
            </button>
          </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xs text-slate-500 font-mono animate-pulse">Loading community data...</p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* ── Your Personal Stats Card ── */}
            <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-5">
              <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-3">Your Profile</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Rank</p>
                  <p className="text-lg font-black font-mono text-indigo-400">#{data.myRank}</p>
                  <p className="text-[8px] text-slate-600">of {data.totalUsers}</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Percentile</p>
                  <p className="text-lg font-black font-mono text-emerald-400">{data.percentile}%</p>
                  <p className="text-[8px] text-emerald-500/60">{data.decileLabel}</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Level</p>
                  <p className="text-lg font-black font-mono text-amber-400">{data.myLevel}</p>
                  <p className="text-[8px] text-slate-600">{data.myXp} pts</p>
                </div>
              </div>

              {/* Streak + trend */}
              <div className="flex gap-3 mt-3">
                <div className="flex-1 bg-slate-900/60 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">🔥</span>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500">Streak</p>
                    <p className="text-sm font-black font-mono text-amber-400">{data.myStreak}d <span className="text-[9px] text-slate-600 font-normal">(best {data.myLongestStreak})</span></p>
                  </div>
                </div>
                <div className="flex-1 bg-slate-900/60 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">{data.trendDirection === 'up' ? '📈' : data.trendDirection === 'steady' ? '➡️' : '💤'}</span>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500">This Week</p>
                    <p className="text-sm font-black font-mono text-slate-300">
                      {data.recentEvalCount >= 5 ? 'On Fire!' :
                       data.recentEvalCount >= 3 ? 'Consistent' :
                       data.recentEvalCount >= 1 ? 'Getting Started' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Context for weaker students ── */}
            {data.percentile < 40 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs text-amber-300 font-bold mb-1">💪 You're building momentum!</p>
                <p className="text-[11px] text-amber-400/70 leading-relaxed">
                  Every paper you submit moves you up. Most high-rankers started where you are now.
                  Your next goal: practice 3 times this week to break into the top half.
                </p>
              </div>
            )}

            {/* ── Peers at Your Level ── */}
            {data.sameLevelPeers && data.sameLevelPeers.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Peers at Your Level</h3>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <p className="text-[11px] text-slate-400">
                    {data.sameLevelPeersCount} other {data.myLevel}(s) at similar XP — you're not alone!
                  </p>
                  <div className="flex gap-2 mt-2">
                    {data.sameLevelPeers.slice(0, 3).map((peer: any, i: number) => (
                      <div key={i} className="flex-1 bg-slate-800/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] font-mono text-slate-400">{peer.xp}pts</p>
                        <p className="text-[8px] text-slate-600">🔥{peer.streak}d</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Most Improved ── */}
            {data.mostImproved && data.mostImproved.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-2">📈 Most Improved This Week</h3>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  {data.mostImproved.map((improver: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-800/50 last:border-0">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold w-8">+{improver.xpGained}</span>
                      <span className="text-[10px] text-slate-500">pts this week</span>
                    </div>
                  ))}
                  <p className="text-[9px] text-slate-600 mt-2">Others are climbing — so can you! Every submission counts.</p>
                </div>
              </div>
            )}

            {/* ── Leaderboard Top 10 ── */}
            {data.leaderboard && data.leaderboard.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2">🏅 Top Students</h3>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
                  {data.leaderboard.slice(0, 10).map((entry: any) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-800/50 last:border-0 ${
                        entry.isMe ? 'bg-indigo-500/10 border-indigo-500/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center text-xs font-mono font-bold ${
                          entry.rank === 1 ? 'text-amber-400' :
                          entry.rank === 2 ? 'text-slate-300' :
                          entry.rank === 3 ? 'text-amber-700' : 'text-slate-600'
                        }`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <span className={`text-xs font-medium ${entry.isMe ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                          {entry.isMe ? 'You' : `${entry.level}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{entry.xp} pts</span>
                    </div>
                  ))}
                </div>
                {!data.isInTopTwenty && (
                  <p className="text-[9px] text-slate-600 text-center mt-2">You're climbing — keep submitting to reach the board!</p>
                )}
              </div>
            )}

            {/* ── Motivational Footer ── */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-600 italic">
                "The only person you should try to be better than is the person you were yesterday."
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xs text-slate-500">Could not load community data.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
