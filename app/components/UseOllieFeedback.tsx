'use client';

import { useState, useEffect } from 'react';
import { ollieRoasts } from './OllieMascot';

/**
 * Hook that maps a grading score to Ollie's emotional state and feedback.
 *
 * Returns:
 * - state: 'celebrating' | 'disappointed' | 'angry' | 'neutral'
 * - roastIndex: index into the appropriate roast array
 * - confetti: whether to show celebration effects
 */
export function useOllieFeedback(
  score: number | null,
  maxScore: number
) {
  const [state, setState] = useState<'celebrating' | 'disappointed' | 'angry' | 'neutral'>(
    'neutral'
  );
  const [roastIndex, setRoastIndex] = useState(0);
  const [confetti, setConfetti] = useState(false);

  if (score === null) {
    setState('neutral');
    setRoastIndex(0);
    setConfetti(false);
    return { state, roastIndex, confetti };
  }

  const percentage = (score / maxScore) * 100;

  // High band: 80%+ → L3/L4 or A1 → celebrating
  if (percentage >= 80) {
    setState('celebrating');
    setRoastIndex(
      Math.floor(Math.random() * ollieRoasts.perfect.length)
    );
    setConfetti(true);
  }
  // Moderate: 50-79% → neutral with moderate feedback
  else if (percentage >= 50) {
    setState('neutral');
    setRoastIndex(
      Math.floor(Math.random() * ollieRoasts.moderate.length)
    );
    setConfetti(false);
  }
  // Low: below 50% → angry/roasting state
  else {
    setState('angry');
    setRoastIndex(
      Math.floor(Math.random() * ollieRoasts.low.length)
    );
    setConfetti(false);
  }

  return { state, roastIndex, confetti };
}