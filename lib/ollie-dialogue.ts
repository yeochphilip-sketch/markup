/***
 * Ollie the Otter — Dynamic dialogue & state helper.
 * Maps grading scores and error types to mascot states & witty Singlish-roasted feedback.
 *
 * State → Score/Error Mapping:
 * - "celebrating": score >= 70% (L3/L4 or A1) — positive praise, confetti
 * - "disappointed": errorType === "NO_ELABORATION" or "REPEATED_POINT" — gentle roast
 * - "angry": score < 50% — stronger roast
 * - "neutral": default/loading state — "Ollie's waiting for your answer..."
 */

/*** OllieFeedback interface and getOllieFeedback function ***/

export interface OllieFeedback {
  /** Mascot emotional state */
  state: 'neutral' | 'celebrating' | 'disappointed' | 'angry';
  /** Witty feedback string (Singlish-infused) */
  roast: string;
  /** Whether to show confetti (celebrating state only) */
  confetti: boolean;
}

/**
 * Get Ollie's feedback based on a numerical score and error type.
 *
 * @param score Numeric score 0-10 (or percentage 0-100)
 * @param errorType One of: 'REPEATED_POINT', 'NO_ELABORATION', or null
 * @param maxScore Maximum possible score (default 10)
 * @returns OllieFeedback object with state, roast, and confetti flag
 */
export function getOllieFeedback(
  score: number | null,
  errorType: string | null = null,
  maxScore: number = 10,
): OllieFeedback {
  // No score yet — waiting for input
  if (score === null) {
    return {
      state: 'neutral',
      roast: "Ollie's waiting for your answer...",
      confetti: false,
    };
  }

  // Convert to percentage for band detection
  const percentage = (score / maxScore) * 100;

  // High band: L3/L4 or A1 (70%+)
  if (percentage >= 70) {
    const celebratingRoasts = [
      'Outstanding work! 🎉 Ollie is celebrating with you!',
      'Level 4 excellence! Keep those high-level insights coming!',
      'A1 standard work — you\'re setting the bar high!',
      'Wah! Score 70%+ — you clear the bar easily! Good job!',
      'Siao! You got L4 — that means your reasoning got real depth! Keep going!',
    ];

    return {
      state: 'celebrating',
      roast:
        celebratingRoasts[Math.floor(Math.random() * celebratingRoasts.length)],
      confetti: true,
    };
  }

  // Error types: no elaboration or repeated point
  if (errorType === 'NO_ELABORATION' || errorType === 'REPEATED_POINT') {
    const disappointedRoasts = [
      "Bro, you just said the exact same thing twice. Add an elaboration sentence!",
      "Eh, you make the point but never explain why. Add one more sentence lor!",
      "Never mind the claim — where got explanation? Explain lor, one extra sentence!",
      "Ollie say: Say the point also can, but must explain also can! Add detail!",
      "Hoh believe also can — make claim but no reasoning. One sentence only!",
    ];

    return {
      state: 'disappointed',
      roast:
        disappointedRoasts[Math.floor(Math.random() * disappointedRoasts.length)],
      confetti: false,
    };
  }

  // Low score (< 50%)
  if (percentage < 50) {
    const angryRoasts = [
      "Ollie says: Show your working! What was your thought process?",
      "Wah lat! Score so low — explain also cannot get it right one?",
      "Cannot even explain one point meh? Explain also got problem?",
      "Ollie roast: Explain like you're teaching someone who've never hear of this topic!",
      "Eh? You also cannot score also can one. Try also no use!",
    ];

    return {
      state: 'angry',
      roast:
        angryRoasts[Math.floor(Math.random() * angryRoasts.length)],
      confetti: false,
    };
  }

  // Neutral/moderate — passing but could improve
  const moderateRoasts = [
    'Good effort! Consider adding one more elaboration sentence.',
    'Solid attempt — try expanding on your main point with more detail.',
    "You're on the right track with your reasoning. One more sentence also can!",
    'Nice start! Add one more sentence of analysis to strengthen your point.',
    'Good try! But the explanation need a bit more detail lor.',
  ];

  return {
    state: 'neutral',
    roast:
      moderateRoasts[Math.floor(Math.random() * moderateRoasts.length)],
    confetti: false,
  };
}

/*** Streak reminder function ***/

/**
 * Singlish-infused loss aversion streak reminder for passive-aggressive framing.
 * Used in push notification / reminder messages to bring students back to practice.
 *
 * @param daysSinceLastPractice Days since the student last practiced
 * @param currentStreak Current practice streak count
 * @param lastPracticeDate Date of the last practice session
 * @returns A passive-aggressive loss-framed reminder string
 */
export function getStreakReminder(
  daysSinceLastPractice: number,
  currentStreak: number,
  lastPracticeDate: Date,
): string {
  const lossAversionMessages: string[] = [
    // Losing a streak > 3 days
    `Another day gone... your ${currentStreak}-day streak is at risk! ${new Date(
      Date.now() - 86400000,
    ).toLocaleDateString('en-SG', { weekday: 'long' })} is slipping away!`,
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

/**
 * Calculates days since last practice and triggers a streak reminder notification.
 *
 * Uses pre-fetched user metrics from Supabase (called from dashboard).
 * Calculates days since last practice, and shows a passive-aggressive loss-framed
 * reminder using getStreakReminder.
 *
 * @param currentStreak Current practice streak count from user metrics
 * @param longestStreak Longest streak from user metrics
 * @param lastPracticeDate Date of last practice session from user metrics
 * @param options Optional configuration
 * @returns The reminder message, or null if no reminder needed
 */
export function triggerStreakReminder(
  currentStreak: number,
  longestStreak: number,
  lastPracticeDate: Date,
  options: {
    /** Show reminder if streak is >= this many days */
    minimumStreakDays?: number;
    /** Show reminder if days since last practice >= this many */
    minimumDaysSinceLastPractice?: number;
    /** Auto-show as toast (vs just returning the message) */
    asToast?: boolean;
  } = {},
): string | null {
  const {
    minimumStreakDays = 3,
    minimumDaysSinceLastPractice = 1,
    asToast = false,
  } = options;

  if (!lastPracticeDate) return null;

  const lastPractice = new Date(lastPracticeDate);
  const daysSinceLastPractice = Math.floor((Date.now() - lastPractice.getTime()) / 86400000);
  const shouldRemind = daysSinceLastPractice >= minimumDaysSinceLastPractice;

  if (!shouldRemind) return null;

  const reminderMessage = getStreakReminder(
    daysSinceLastPractice,
    currentStreak,
    lastPractice,
  );

  if (asToast) {
    // Toast will be shown by the caller
  }

  return reminderMessage;
}
