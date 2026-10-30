'use client';

import { useState, useCallback, memo } from 'react';
import OllieMascot from '@/app/components/OllieMascot';

interface PracticeCardProps {
  /** Ollie's emotional state: 'neutral' | 'celebrating' | 'disappointed' | 'angry' */
  ollieState: 'neutral' | 'celebrating' | 'disappointed' | 'angry';
  /** Custom motivational/streak-retention quote shown in the speech bubble */
  ollieSpeech: string;
  /** Animated confetti burst when Ollie is celebrating */
  ollieConfetti: boolean;
  /** Show the primary action button */
  showStartButton: boolean;
  /** Label for the primary action button */
  startButtonLabel: string;
  /** Whether the start button is disabled */
  startButtonDisabled: boolean;
  /** Pass-through onClick on the whole card */
  onCardClick?: () => void;
  /** Pass-through onClick on the start button */
  onStartClick?: () => void;
  /** Optional best time (e.g. for streaks / times-table runs) */
  bestTime?: number;
}

/**
 * PracticeCard — the hero action card for "Ollie's Daily Practice".
 *
 * Duolingo-style layout:
 *  - horizontal Ollie mascot + motivational speech bubble on the left
 *  - clean progress / streak stat on the right
 *  - single primary "Start 10-Min Practice" call-to-action
 *
 * The surrounding dashboard keeps the Configurator panel tucked away in a
 * collapsible "Custom Practice" accordion so first-time users are not
 * overwhelmed.
 */
const PracticeCard = memo(function PracticeCard({
  ollieState,
  ollieSpeech,
  ollieConfetti,
  showStartButton,
  startButtonLabel,
  startButtonDisabled,
  onCardClick,
  onStartClick,
  bestTime,
}: PracticeCardProps) {
  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 sm:p-7 bg-[#07090e] rounded-3xl border border-slate-900/60 shadow-2xl shadow-indigo-950/30 overflow-hidden"
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStartClick?.();
        }
      }}
    >
      {/* Left — Ollie mascot + speech bubble */}
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        <OllieMascot
          state={ollieState}
          altText="Ollie the Otter"
          onClick={onCardClick}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {bestTime != null ? 'Best time' : 'Daily goal'}
          </p>
          <p
            className={`text-sm sm:text-base font-bold truncate transition-colors ${
              ollieState === 'celebrating'
                ? 'text-emerald-400'
                : ollieState === 'disappointed' || ollieState === 'angry'
                  ? 'text-rose-400'
                  : 'text-slate-200'
            }`}
          >
            {ollieSpeech}
          </p>
          {bestTime != null && (
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              {bestTime < 10 ? `${bestTime.toFixed(1)} min` : `${Math.round(bestTime)} min`}
            </p>
          )}
        </div>
      </div>

      {/* Right — primary CTA, no competing cards */}
      <div className="flex flex-col items-center justify-center gap-3 flex-shrink-0">
        {showStartButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartClick?.();
            }}
            disabled={startButtonDisabled}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-lg shadow-indigo-900/40"
          >
            <span className="w-2 h-2 rounded-full bg-white/70 animate-ping" />
            {startButtonLabel}
          </button>
        )}
        {!showStartButton && (
          <span className="text-sm font-medium text-slate-400">Ready when you are</span>
        )}
      </div>
    </div>
  );
});

export default PracticeCard;
