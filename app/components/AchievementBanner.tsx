'use client';

import { useEffect } from 'react';

interface AchievementData {
  id: string;
  icon: string;
  title: string;
  description: string;
  xpReward?: number;
}

interface AchievementBannerProps {
  /** Array of newly unlocked achievements to display */
  newlyUnlocked: AchievementData[];
  /** Called when the banner should dismiss (auto-timer or manual close) */
  onDismiss: () => void;
  /** If true, the auto-dismiss timer is paused (e.g. on hover) */
  isPaused?: boolean;
  /** Auto-dismiss duration in ms — defaults to 12000 (12s) */
  durationMs?: number;
}

/**
 * Achievement Unlocked Banner — slides in from the top of the screen
 * with a countdown progress bar, auto-dismiss timer, and close button.
 */
export default function AchievementBanner({
  newlyUnlocked,
  onDismiss,
  isPaused = false,
  durationMs = 12000,
}: AchievementBannerProps) {
  useEffect(() => {
    if (isPaused || newlyUnlocked.length === 0) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, isPaused, durationMs, newlyUnlocked.length]);

  if (newlyUnlocked.length === 0) return null;

  return (
    <div className="fixed top-safe left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-3 fade-in duration-300 max-w-3xl w-full">
      <div className="bg-gradient-to-r from-emerald-950/95 via-slate-950/95 to-indigo-950/95 border border-emerald-500/30 rounded-b-2xl shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
        {/* Countdown bar at bottom */}
        <div
          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width-12s ${
            isPaused ? 'animate-paused' : ''
          }`}
          style={{ animationDuration: `${durationMs}ms` }}
        />

        {/* Close button top right */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition text-sm font-bold z-10"
          aria-label="Dismiss achievement banner"
        >
          ✕
        </button>

        <div className="max-w-3xl mx-auto px-6 py-4 pr-12">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2">
            🎉 Achievement Unlocked!
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {newlyUnlocked.map((ach, i) => (
              <div key={ach.id || i} className="flex items-center gap-3 py-1">
                <span className="text-3xl">{ach.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{ach.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {ach.description}
                    {ach.xpReward ? (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                        +{ach.xpReward} XP
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
