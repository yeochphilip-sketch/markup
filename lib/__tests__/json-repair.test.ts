import { describe, expect, it } from 'vitest';
import { parseJsonWithRepair } from '@/lib/json-repair';

describe('parseJsonWithRepair', () => {
 it('parses clean JSON directly', () => {
 const out = parseJsonWithRepair<{ scoreLevel: string; scoreMarks: number }>('{"scoreLevel": "L2", "scoreMarks": 3}',
 );
 expect(out.scoreLevel).toBe('L2');
 expect(out.scoreMarks).toBe(3);
 });

 it('escapes literal control characters inside string values (the #1 LLM failure mode)', () => {
 // Raw newline + tab inside a string value — plain JSON.parse would throw
 // "Bad control character in string literal".
 const bad =
 '{"a1Upgrade": "Line one\nLine two\ttabbed", "scoreLevel": "L4"}';
 const out = parseJsonWithRepair<{ a1Upgrade: string; scoreLevel: string }>(bad);
 expect(out.a1Upgrade).toBe('Line one\nLine two\ttabbed');
 expect(out.scoreLevel).toBe('L4');
 });

 it('strips json code fences', () => {
 const fenced = '```json\n{"scoreMarks": 6, "scoreMaxMarks": 8}\n```';
 const out = parseJsonWithRepair<{ scoreMarks: number; scoreMaxMarks: number }>(fenced);
 expect(out.scoreMarks).toBe(6);
 });

 it('extracts the object from surrounding prose and trailing junk', () => {
 const prose =
 'Here is your grade:\n{"scoreLevel": "L3", "critique": ["good effort"]}\nHope this helps!';
 const out = parseJsonWithRepair<{ scoreLevel: string }>(prose);
 expect(out.scoreLevel).toBe('L3');
 });

 it('handles fences and control characters together', () => {
 const both = '```json\n{"a1Upgrade": "First\nSecond", "critique": ["ok\nok"]}\n```';
 const out = parseJsonWithRepair<{ a1Upgrade: string }>(both);
 expect(out.a1Upgrade).toBe('First\nSecond');
 });

 it('preserves already-escaped sequences without double-escaping', () => {
 const clean = '{"a1Upgrade": "Line one\\nLine two", "scoreLevel": "L5"}';
 const out = parseJsonWithRepair<{ a1Upgrade: string }>(clean);
 expect(out.a1Upgrade).toBe('Line one\nLine two');
 });

 it('throws a descriptive error when no repair strategy works', () => {
 expect(() => parseJsonWithRepair('not json at all')).toThrow(/Could not parse AI JSON response/,
 );
 });
});
