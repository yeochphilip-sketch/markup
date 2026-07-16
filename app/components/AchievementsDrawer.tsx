'use client';

import { useEffect } from 'react';
import { ACHIEVEMENT_DEFS } from '@/lib/gamification';
import { useAutoDismiss } from '@/lib/useAutoDismiss';

interface AchievementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: string[];
}

export default function AchievementsDrawer({
  isOpen,
  onClose,
  achievements,
}: AchievementsDrawerProps) {
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
        className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800/30">
          <div className={`h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-shrink-width-12s ${isHovered ? 'animate-paused' : ''}`} />
        </div>
        {/* Scrollable content wrapper */}
        <div className="overflow-y-auto max-h-[80vh] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase">🏅 Achievements</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (dismiss) dismiss();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mb-4 text-center">
            {achievements.length} / {ACHIEVEMENT_DEFS.length} unlocked
          </div>

          <div className="space-y-2">
            {ACHIEVEMENT_DEFS.map((ach) => {
              const unlocked = achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`rounded-xl p-3 border flex items-center gap-3 transition ${
                    unlocked
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-slate-900/30 border-slate-800/50 opacity-50'
                  }`}
                >
                  <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                      {ach.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{ach.description}</p>
                  </div>
                  {unlocked && <span className="text-[9px] text-emerald-400">✅</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
