/**
 * Ollie the Otter - Dialogue Helper
 * Returns emotional state and witty Singlish-infused feedback based on score and error type.
 * Used by the practice page to connect Ollie's reactions to grading results.
 */

export type OllieState = 'celebrating' | 'disappointed' | 'angry' | 'neutral';

export interface OllieFeedbackResult {
  state: OllieState;
  roast: string;
  confetti: boolean;
}

// Witty, Singlish-infused roasts and praise mapped to Ollie's emotional states
const SINGLISH_ROASTS = {
  celebrating: [
    'Wah lau! Solid L4 work! Ollie proud of you! 🎉',
    'Excellent! A1 standard — Ollie doing backstroke in joy!',
    'Superb elaboration! You got the L3 criteria on lock. Well done!',
    'High band material! Ollie popping corn in celebration!',
  ],
  disappointed: [
    'Bro, you just said the exact same thing twice. Add an elaboration sentence!',
    'Eh, point stated but no explanation. PEEL where the L is? Elaborate!',
    'Made a claim but where the reasoning? Ollie waiting for the analysis — don\'t leave him hanging!',
    'One sentence only? Need more development — elaborate like you explaining to your classmate.',
  ],
  angry: [
    'NO ELABORATION! Explain your point like you teaching someone — Ollie frustrated!',
    'Same point repeated? Waste of Ollie time. Add NEW analysis or go back and try again!',
    'You put quote but never interpret it. That how you get L1. Elaborate or get roasted!',
    'Point made, but zero development. That not L3 material — that L1. Add reasoning now!',
  ],
  neutral: [
    'Not bad, but can improve. Add more elaboration to reach L3.',
    'Solid attempt. Need more depth to score higher — try explaining the reasoning behind your point.',
    'Good start. Add one more sentence of analysis and you\'ll be in L3 territory.',
    'Getting there. Strengthen with evidence and explanation — PEEL structure helps!',
  ],
} as const;

export function getOllieFeedback(
  score: number,
  maxScore: number = 10,
  errorType: string | null = null,
): OllieFeedbackResult {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // High band: L3/L4 or A1 (70%+)
  if (percentage >= 70) {
    return {
      state: 'celebrating',
      roast: SINGLISH_ROASTS.celebrating[Math.floor(Math.random() * SINGLISH_ROASTS.celebrating.length)],
      confetti: true,
    };
  }

  // Moderate with errors
  if (errorType === 'NO_ELABORATION' || errorType === 'REPEATED_POINT') {
    return {
      state: 'disappointed',
      roast: SINGLISH_ROASTS.disappointed[Math.floor(Math.random() * SINGLISH_ROASTS.disappointed.length)],
      confetti: false,
    };
  }

  // Low score
  if (percentage < 50) {
    return {
      state: 'angry',
      roast: SINGLISH_ROASTS.angry[Math.floor(Math.random() * SINGLISH_ROASTS.angry.length)],
      confetti: false,
    };
  }

  // Neutral/moderate
  return {
    state: 'neutral',
    roast: SINGLISH_ROASTS.neutral[Math.floor(Math.random() * SINGLISH_ROASTS.neutral.length)],
    confetti: false,
  };
}

/**
 * Hook version for React components - returns Ollie state based on grading result.
 * Used in practice page to update Ollie's reaction after grading.
 */
export function useOllieFeedback(
  score: number | null,
  errorType: string | null,
  maxScore: number = 10,
): OllieFeedbackResult {
  if (score === null) {
    return {
      state: 'neutral',
      roast: "Ollie's waiting for your answer...",
      confetti: false,
    };
  }
  return getOllieFeedback(score, maxScore, errorType);
}
