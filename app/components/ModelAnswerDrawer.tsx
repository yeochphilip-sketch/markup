'use client';

import { useEffect, useRef } from 'react';
import { useAutoDismiss } from '@/lib/useAutoDismiss';

interface ModelAnswerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  confidence: number;
  a1Upgrade: string;
  suggestedAnswer: string;
}

export default function ModelAnswerDrawer({
  isOpen,
  onClose,
  confidence,
  a1Upgrade,
  suggestedAnswer,
}: ModelAnswerDrawerProps) {
  const { dismiss, startTimer, handleMouseEnter, handleMouseLeave, isHovered } = useAutoDismiss(onClose, 12000);

  // Start auto-dismiss timer when modal opens
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
        className="bg-slate-950 border border-emerald-500/30 rounded-3xl w-full max-w-lg mx-4 shadow-2xl relative overflow-hidden max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar at top */}
        <div className="h-0.5 bg-emerald-900/30 shrink-0">
          <div className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width-12s ${isHovered ? 'animate-paused' : ''}`} />
        </div>
        {/* Close button top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition text-sm font-bold z-10"
        >
          ✕
        </button>
        <div className="overflow-y-auto p-6">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-4">
            <h3 className="text-sm font-black tracking-wider text-emerald-400 uppercase">Syllabus Model Answer</h3>
          </div>
          <div className="space-y-3">
            {confidence > 0 && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Model Confidence</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className={`h-full rounded-full ${
                      confidence >= 0.8 ? 'bg-emerald-500' :
                      confidence >= 0.6 ? 'bg-amber-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(confidence * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
            <div className="bg-slate-900/50 rounded-xl p-4 overflow-y-auto border border-slate-900 max-h-[60vh]">
              <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {a1Upgrade || suggestedAnswer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
