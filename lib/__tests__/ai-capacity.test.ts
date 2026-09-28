import { describe, it, expect } from 'vitest';
import {
 isAiCapacityError,
 AiCapacityError,
 aiCapacityResponse,
 estimateRetryAfterSeconds,
 AI_CAPACITY_CODE,
} from '../ai-capacity';

describe('isAiCapacityError', () => {
 it('detects Groq daily token quota exhaustion (TPD)', () => {
 const msg = 'Groq Llama 3.3 70B: Rate limit reached for organization on tokens per day (TPD): Limit 100000, Used 96772. Please try again later.';
 expect(isAiCapacityError(msg)).toBe(true);
 });

 it('detects per-minute token limits (TPM)', () => {
 const msg = 'Groq Llama 3.1 8B: Request too large for model on tokens per minute (TPM): Limit 6000, Requested 7493.';
 expect(isAiCapacityError(msg)).toBe(true);
 });

 it('detects plain 429 responses with status context', () => {
 expect(isAiCapacityError('Error: 429 Too Many Requests')).toBe(true);
 expect(isAiCapacityError('Received status 429 from provider')).toBe(true);
 });

 it('detects insufficient quota errors', () => {
 expect(isAiCapacityError('insufficient_quota — you have exceeded your daily quota')).toBe(true);
 });

 it('detects generic overloaded / unavailable messages', () => {
 expect(isAiCapacityError('The service is overloaded. Please try again later.')).toBe(true);
 expect(isAiCapacityError('503 Service Unavailable')).toBe(true);
 });

 it('does NOT flag genuine model failures', () => {
 const badJson = 'Bad control character in string literal in JSON at position 42';
 expect(isAiCapacityError(badJson)).toBe(false);
 // Bare status codes inside parse/validation errors must NOT match
 expect(isAiCapacityError('Bad control character in string literal in JSON at position 429')).toBe(false);
 expect(isAiCapacityError('Invalid response: expected number, received 503')).toBe(false);
 const missingField = 'Invalid response: a1Upgrade is required';
 expect(isAiCapacityError(missingField)).toBe(false);
 const authError = 'Invalid API key provided';
 expect(isAiCapacityError(authError)).toBe(false);
 const empty = '';
 expect(isAiCapacityError(empty)).toBe(false);
 });
});

describe('AiCapacityError', () => {
 it('has a friendly default message and the right name', () => {
 const err = new AiCapacityError();
 expect(err).toBeInstanceOf(Error);
 expect(err.name).toBe('AiCapacityError');
 expect(err.message).toContain('AI is at capacity');
 expect(err.retryAfterSeconds).toBe(60);
 });

 it('carries a custom retry ETA', () => {
 const err = new AiCapacityError('daily quota hit', 17100);
 expect(err.retryAfterSeconds).toBe(17100);
 });
});

describe('estimateRetryAfterSeconds', () => {
 it('returns ~60s for per-minute (TPM) limits', () => {
 const errs = ['Request too large for model on tokens per minute (TPM): Limit 6000, Requested 7493.'];
 expect(estimateRetryAfterSeconds(errs)).toBe(60);
 });

 it('returns 60s when the limit type is unknown or empty', () => {
 expect(estimateRetryAfterSeconds(['the service is overloaded, try again later'])).toBe(60);
 expect(estimateRetryAfterSeconds([])).toBe(60);
 });

 it('returns seconds until UTC midnight for daily (TPD) limits, at least 60s', () => {
 const retry = estimateRetryAfterSeconds([
 'Rate limit reached for organization on tokens per day (TPD): Limit 100000, Used 96772.',
 ]);
 expect(retry).toBeGreaterThanOrEqual(60);
 // ≈ seconds until the next UTC midnight (allow small clock skew)
 const now = new Date();
 const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
 const expected = Math.max(60, Math.ceil((midnightUtc.getTime() - now.getTime()) / 1000));
 expect(Math.abs(retry - expected)).toBeLessThanOrEqual(5);
 });

 it('prefers the daily limit over the per-minute one when both appear', () => {
 const retry = estimateRetryAfterSeconds([
 'tokens per minute (TPM): Limit 6000, Requested 7493',
 'tokens per day (TPD): Limit 100000, Used 96772',
 ]);
 expect(retry).toBeGreaterThan(60);
 });
});

describe('aiCapacityResponse', () => {
 it('returns a 503 with a friendly message and machine-readable code', async () => {
 const res = aiCapacityResponse();
 expect(res.status).toBe(503);
 expect(res.headers.get('Retry-After')).toBe('60');

 const body = await res.json();
 expect(body.error).toContain('AI is at capacity');
 expect(body.code).toBe(AI_CAPACITY_CODE);
 expect(body.retryAfterSeconds).toBe(60);
 // Must NOT leak raw provider error text
 expect(JSON.stringify(body)).not.toContain('Limit 100000');
 });

 it('echoes the real ETA in both the body and the Retry-After header', async () => {
 const res = aiCapacityResponse(17100);
 expect(res.status).toBe(503);
 expect(res.headers.get('Retry-After')).toBe('17100');

 const body = await res.json();
 expect(body.retryAfterSeconds).toBe(17100);
 });

 it('sanitizes invalid ETAs down to 60s', async () => {
 const res = aiCapacityResponse(-5);
 expect(res.headers.get('Retry-After')).toBe('60');

 const body = await res.json();
 expect(body.retryAfterSeconds).toBe(60);
 });
});
