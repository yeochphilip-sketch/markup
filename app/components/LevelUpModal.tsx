'use client';

import { useEffect } from 'react';
import { getLevelConfig } from '@/lib/gamification';
import { useAutoDismiss } from '@/lib/useAutoDismiss';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpInfo: { from: string; to: string };
}

export default function LevelUpModal({
  isOpen,
  onClose,
  levelUpInfo,
}: LevelUpModalProps) {
  const { dismiss, startTimer, handleMouseEnter, handleMouseLeave, isHovered } = useAutoDismiss(onClose, 12000);

  useEffect(() => {
    if (isOpen) {
      startTimer();
    }
  }, [isOpen, startTimer]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center pt-16 bg-black/70 backdrop-blur-sm"
      onClick={dismiss}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="bg-slate-950 border border-indigo-500/40 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-indigo-500/20 animate-in zoom-in-95 duration-300 text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Close button top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition text-sm font-bold z-20"
        >
          ✕
        </button>

        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-950/50">
          <div className={`h-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-shrink-width ${isHovered ? 'animate-paused' : ''}`} />
        </div>
        
        <div className="relative z-10">
          <div className="text-5xl mb-3 animate-bounce">
            {getLevelConfig(levelUpInfo.to).icon}
          </div>
          <h2 className="text-lg font-black text-white mb-1">🎉 Level Up!</h2>
          <p className="text-sm text-slate-400 mb-4">
            You advanced from{' '}
            <span className="font-bold text-slate-300">{levelUpInfo.from}</span>
            {' '}to{' '}
            <span className={`font-bold ${getLevelConfig(levelUpInfo.to).color}`}>
              {levelUpInfo.to}
            </span>
            !
          </p>
          
          {/* Achievement card */}
          <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800 mb-5">
            <p className="text-xs text-slate-400 leading-relaxed">
              {levelUpInfo.to === 'Apprentice' && 'You\'ve proven you can grade well. Keep the momentum going — Scholar awaits!'}
              {levelUpInfo.to === 'Scholar' && 'You\'re mastering the material. Your skill radar will thank you for the practice!'}
              {levelUpInfo.to === 'Expert' && 'Exceptional consistency. You\'re among the top-tier students now.'}
              {levelUpInfo.to === 'Master' && 'The highest rank! You\'ve shown elite-level skill across every format.'}
              {levelUpInfo.to === 'Novice' && 'Every expert starts somewhere. Keep scanning!'}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
