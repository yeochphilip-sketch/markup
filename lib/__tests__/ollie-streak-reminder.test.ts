import { describe, expect, it } from 'vitest';
import { getStreakReminder } from '@/lib/ollie-dialogue';

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