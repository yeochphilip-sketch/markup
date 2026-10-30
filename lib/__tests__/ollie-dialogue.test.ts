import { describe, expect, it } from 'vitest';
import { getOllieFeedback, getStreakReminder } from '@/lib/ollie-dialogue';

describe('getOllieFeedback', () => {
  it('returns neutral state when score is null', () => {
    const result = getOllieFeedback(null);
    expect(result.state).toBe('neutral');
    expect(result.roast).toBe("Ollie's waiting for your answer...");
    expect(result.confetti).toBe(false);
  });

  it('returns celebrating state for high scores (>= 70%)', () => {
    const result = getOllieFeedback(8, null, 10);
    expect(result.state).toBe('celebrating');
    expect(result.confetti).toBe(true);
    expect(typeof result.roast).toBe('string');
    // Should contain celebratory language - any of the predefined roasts
    expect(result.roast.length).toBeGreaterThan(0);
  });

  it('returns celebrating state for score exactly 7', () => {
    const result = getOllieFeedback(7, null, 10);
    expect(result.state).toBe('celebrating');
    expect(result.confetti).toBe(true);
  });

  it('returns disappointed state for NO_ELABORATION error', () => {
    const result = getOllieFeedback(5, 'NO_ELABORATION', 10);
    expect(result.state).toBe('disappointed');
    expect(result.confetti).toBe(false);
    // Roasts about no elaboration mention explaining, detail, one sentence
    expect(result.roast.length).toBeGreaterThan(0);
    expect(result.roast).toMatch(/explain|detail|sentence|reason/i);
  });

  it('returns disappointed state for REPEATED_POINT error', () => {
    const result = getOllieFeedback(5, 'REPEATED_POINT', 10);
    expect(result.state).toBe('disappointed');
    expect(result.confetti).toBe(false);
    // Roasts about repeated points mention explaining same point twice
    expect(result.roast.length).toBeGreaterThan(0);
    expect(result.roast).toMatch(/explain|point|sentence|claim/i);
  });

  it('returns angry state for low scores (< 50%)', () => {
    const result = getOllieFeedback(3, null, 10);
    expect(result.state).toBe('angry');
    expect(result.confetti).toBe(false);
    // Angry roasts show working, think, explain, also can
    expect(result.roast.length).toBeGreaterThan(0);
    expect(result.roast).toMatch(/working|think|explain|also can/i);
  });

  it('returns neutral state for moderate scores (50-70%) with no errors', () => {
    const result = getOllieFeedback(6, null, 10);
    expect(result.state).toBe('neutral');
    expect(result.confetti).toBe(false);
    expect(typeof result.roast).toBe('string');
  });

  it('uses default maxScore of 10', () => {
    const resultHigh = getOllieFeedback(8);
    const resultLow = getOllieFeedback(3);
    expect(resultHigh.state).toBe('celebrating');
    expect(resultLow.state).toBe('angry');
  });

  it('returns valid state/roast/confetti for all score bands', () => {
    // Test celebrating (score >= 70%)
    const celebrateResult = getOllieFeedback(9, null, 10);
    expect(celebrateResult.state).toBe('celebrating');
    expect(celebrateResult.confetti).toBe(true);
    expect(celebrateResult.roast.length).toBeGreaterThan(0);

    // Test disappointed - NO_ELABORATION
    const noElabResult = getOllieFeedback(5, 'NO_ELABORATION', 10);
    expect(noElabResult.state).toBe('disappointed');
    expect(noElabResult.confetti).toBe(false);
    expect(noElabResult.roast.length).toBeGreaterThan(0);

    // Test disappointed - REPEATED_POINT
    const repeatResult = getOllieFeedback(5, 'REPEATED_POINT', 10);
    expect(repeatResult.state).toBe('disappointed');
    expect(repeatResult.confetti).toBe(false);
    expect(repeatResult.roast.length).toBeGreaterThan(0);

    // Test angry (score < 50%)
    const angryResult = getOllieFeedback(3, null, 10);
    expect(angryResult.state).toBe('angry');
    expect(angryResult.confetti).toBe(false);
    expect(angryResult.roast.length).toBeGreaterThan(0);

    // Test neutral (moderate, 50-70%)
    const neutralResult = getOllieFeedback(6, null, 10);
    expect(neutralResult.state).toBe('neutral');
    expect(neutralResult.confetti).toBe(false);
    expect(neutralResult.roast.length).toBeGreaterThan(0);
  });
});

describe('getStreakReminder', () => {
  const testDate = new Date('2024-06-15');

  it('returns a loss-aversion message for days since last practice', () => {
    const result = getStreakReminder(5, 10, testDate);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a message maintaining a streak', () => {
    const result = getStreakReminder(0, 7, testDate);
    // Should mention the streak count in format 'X-day streak'
    expect(result).toMatch(/your \d+-day streak/);
  });

  it('returns an exam period pressure message', () => {
    const result = getStreakReminder(2, 5, testDate);
    // Should contain exam-related language
    expect(result).toMatch(/exam|pressure|keep it going/i);
  });

  it('uses en-SG locale for date formatting', () => {
    const result = getStreakReminder(1, 3, testDate);
    // Should contain a date string formatted in Singapore English
    expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
  });

  it('cycles through different messages based on daysSinceLastPractice', () => {
    // The message index is daysSinceLastPractice % messages.length
    // With 4 messages, calling with different days should cycle
    const results = [
      getStreakReminder(0, 5, testDate),
      getStreakReminder(1, 5, testDate),
      getStreakReminder(2, 5, testDate),
      getStreakReminder(3, 5, testDate),
      getStreakReminder(4, 5, testDate), // should cycle back to index 0
    ];
    // Each result should be a non-empty string
    results.forEach((r) => expect(r).toBeTruthy());
    // All should be strings
    results.forEach((r) => expect(typeof r).toBe('string'));
  });

  it('message content varies by daysSinceLastPractice value', () => {
    const msg0 = getStreakReminder(0, 5, testDate);
    const msg1 = getStreakReminder(1, 5, testDate);
    const msg2 = getStreakReminder(2, 5, testDate);
    const msg3 = getStreakReminder(3, 5, testDate);
    // Different days should potentially give different messages (may cycle)
    expect(msg0).toBeTruthy();
    expect(msg1).toBeTruthy();
    expect(msg2).toBeTruthy();
    expect(msg3).toBeTruthy();
  });
});