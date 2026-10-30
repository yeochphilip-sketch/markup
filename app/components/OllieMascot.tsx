'use client';

import { useEffect, useRef } from 'react';

interface OllieMascotProps {
  /** Emotional state: "celebrating", "disappointed", "angry", or "neutral" */
  state: 'celebrating' | 'disappointed' | 'angry' | 'neutral';
  /** Optional custom alt text for the image */
  altText?: string;
  /** Optional on-click handler for interactive mascot */
  onClick?: () => void;
}

/**
 * Ollie the Otter — emotional state mascot component.
 * Maps emotional states to corresponding asset images for dynamic feedback.
 *
 * State → Image Mapping:
 * - "celebrating": watermarked_img_8699779485568366290.jpg (confetti/celebration)
 * - "disappointed": watermarked_img_1160690085154432921.jpg (sad/ disappointed)
 * - "angry": watermarked_img_14106792646225834855.jpg (roasting/ angry)
 * - "neutral": default otter sprite (neutral pose)
 */
export default function OllieMascot({
  state,
  altText,
  onClick,
}: OllieMascotProps) {
  // Map emotional states to corresponding asset images
  // User's Gemini-generated images in public/ folder
  const stateImageMap: Record<
    OllieMascotProps['state'],
    { src: string; alt: string }
  > = {
    celebrating: {
      src: '/mascot/ollie-celebrating.png',
      alt: altText || 'Ollie celebrating',
    },
    disappointed: {
      src: '/mascot/ollie-disappointed.png',
      alt: altText || 'Ollie disappointed',
    },
    angry: {
      src: '/mascot/ollie-angry.png',
      alt: altText || 'Ollie roasting',
    },
    neutral: {
      src: '/mascot/ollie-neutral.png',
      alt: altText || 'Ollie the otter',
    },
  };

  const { src, alt } = stateImageMap[state];
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add subtle emotion-based animation on mount/state change
    if (mountRef.current) {
      mountRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }
  }, [state]);

  // Emotion badge styles mapped by state
  const badgeBg: Record<string, string> = {
    celebrating: 'background: #10b981',
    disappointed: 'background: #ef4444',
    angry: 'background: #dc2626',
    neutral: 'background: #6b7280',
  };

  return (
    <div
      ref={mountRef}
      className="relative w-32 h-32 flex items-center justify-center"
      data-ollie-state={state}
    >
      {/* Emotion badge (small indicator) */}
      <div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-90"
        style={{ backgroundColor: badgeBg[state] }}
      >
        {state.charAt(0).toUpperCase()}
      </div>

      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-xl border-2 border-slate-900/50"
        onClick={onClick}
      />

      {/* Confetti effect for celebrating state */}
      {state === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ color: '#f59e0b' }}
          >
            ✨ ✨ ✨ ✨ ✨
          </div>
        </div>
      )}
    </div>
  );
}

/** Pre-defined roast/feedback strings mapped to score ranges */
/** Pre-defined roast/feedback strings mapped to score ranges */
export const ollieRoasts = {
  /** Perfect score / high band - L3/L4 or A1 */
  perfect: [
    'Outstanding work! 🎉 Ollie is celebrating with you!',
    'Level 4 excellence! Keep those high-level insights coming.',
    'A1 standard work — you\'re setting the bar high!',
  ],
  /** Strong pass - good elaboration */
  strong: [
    'Nice elaboration! You\'ve added real depth to your answer.',
    'Strong response with clear reasoning. Well done!',
    'Good use of examples to support your point.',
  ],
  /** Moderate - needs some improvement */
  moderate: [
    'Good effort! Consider adding one more elaboration sentence.',
    'Solid attempt — try expanding on your main point.',
    'You\'re on the right track with your reasoning.',
  ],
  /** Low score - needs significant work */
  low: [
    "Bro, you just said the exact same thing twice. Add an elaboration sentence!",
    'Try explaining your point with more detail — one extra sentence makes a big difference.',
    'Good start, but you need more elaboration to score higher.',
    "Ollie's roast: Explain like you're teaching someone who's never heard of this topic before.",
  ],
  /** Very low / missing - needs significant help */
  veryLow: [
    "Ollie says: Show your working! What was your thought process?",
    "Don't worry — every expert was a beginner once. Let's try again.",
    'Quick break, then tackle one sentence at a time.',
  ],
} as const;

/** Get Ollie's feedback based on score and state */
export function useOllieFeedback(
  score: number | null,
  errorType: string | null = null,
  maxScore: number = 10,
): { state: 'celebrating' | 'disappointed' | 'angry' | 'neutral'; roast: string; confetti: boolean } {
  if (score === null) {
    return { state: 'neutral', roast: "Ollie's waiting for your answer...", confetti: false };
  }

  const percentage = (score / maxScore) * 100;

  // High band: L3/L4 or A1 (70%+)
  if (percentage >= 70) {
    return {
      state: 'celebrating',
      roast: ollieRoasts.perfect[Math.floor(Math.random() * ollieRoasts.perfect.length)],
      confetti: true,
    };
  }

  // Moderate with errors
  if (errorType === 'NO_ELABORATION' || errorType === 'REPEATED_POINT') {
    return {
      state: 'disappointed',
      roast: ollieRoasts.low[Math.floor(Math.random() * ollieRoasts.low.length)],
      confetti: false,
    };
  }

  // Low score
  if (percentage < 50) {
    return {
      state: 'angry',
      roast: ollieRoasts.low[Math.floor(Math.random() * ollieRoasts.low.length)],
      confetti: false,
    };
  }

  // Neutral/moderate
  return {
    state: 'neutral',
    roast: ollieRoasts.moderate[Math.floor(Math.random() * ollieRoasts.moderate.length)],
    confetti: false,
  };
}

/** Loss aversion streak reminder - passive-aggressive local framing */
export function useStreakReminder({
  daysSinceLastPractice,
  currentStreak,
  lastPracticeDate,
}: {
  daysSinceLastPractice: number;
  currentStreak: number;
  lastPracticeDate: Date;
}): string {
  const lossAversionMessages: string[] = [
    // Losing a streak > 3 days
    `Another day gone... your ${currentStreak}-day streak is at risk! ${new Date(
      Date.now() - 86400000,
    ).toLocaleDateString('en-SG', { weekday: 'long' })} is slipping away.`,
    // Losing a streak 2 days
    `Hey ${currentStreak}-day streak holder — one more day without practice and it resets. Don't let that happen on ${new Date(
      Date.now() - 86400000,
    ).toLocaleDateString('en-SG', { weekday: 'long' })}.`,
    // Maintaining a streak
    `Nice! You're ${currentStreak} days strong. Keep it going before ${new Date(
      Date.now() + 86400000,
    ).toLocaleDateString('en-SG', { weekday: 'long' })}.`,
    // Exam period pressure
    `Exams coming up! ${currentStreak} days of practice isn't enough to stop now. ${new Date(
      Date.now() + 43200000,
    ).toLocaleDateString('en-SG', { weekday: 'long', hour: '2-digit' })} is your next session.`,
  ];

  return lossAversionMessages[daysSinceLastPractice % lossAversionMessages.length];
}