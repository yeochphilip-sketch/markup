/**
* Beta trial gate — localStorage-based counter for the 3-free-tries funnel.
*
* Rules:
* - Each successful "Generate Practice" = 1 try (per user decision).
* - After 3 tries, generation is blocked until the user joins the waitlist.
* - Joining the waitlist + leaving feedback unlocks unlimited practice (7 base days,
  * plus any banked referral bonus days — the real expiry comes from the server).
*
* Stored in localStorage so it works for both anonymous guests and signed-in
* users on the same device. This is a soft funnel gate (not a security
  * boundary) — clearing localStorage resets the counter, which is acceptable
* for a beta waitlist funnel.
*/

export const TRIAL_LIMIT = 3;
export const UNLOCK_DURATION_DAYS = 7;

const TRIES_KEY = 'markup_trial_tries';
const UNLOCK_KEY = 'markup_trial_unlocked_until';

export interface TrialState {
  triesUsed: number;
  remaining: number;
  unlocked: boolean;
  unlockExpiry: number | null;
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private mode) — treat as no-op, gate degrades gracefully
  }
}

/** Read the current trial state (safe to call during render / on mount). */
export function getTrialState(): TrialState {
  const triesRaw = safeGet(TRIES_KEY);
  const triesUsed = triesRaw ? Math.max(0, parseInt(triesRaw, 10) || 0) : 0;

  const unlockRaw = safeGet(UNLOCK_KEY);
  const unlockExpiry = unlockRaw ? parseInt(unlockRaw, 10) || 0 : 0;
  const unlocked = unlockExpiry > Date.now();

  return {
    triesUsed,
    remaining: Math.max(0, TRIAL_LIMIT - triesUsed),
    unlocked,
    unlockExpiry: unlocked ? unlockExpiry : null,
  };
}

/** True when the user has exhausted their tries and is not unlocked. */
export function isTrialBlocked(): boolean {
  const state = getTrialState();
  return !state.unlocked && state.triesUsed >= TRIAL_LIMIT;
}

/** Register one completed generation. Returns the updated state. */
export function registerTry(): TrialState {
  const current = getTrialState();
  if (current.unlocked) return current;
  safeSet(TRIES_KEY, String(current.triesUsed + 1));
  return getTrialState();
}

/**
* Force the local counter to a specific value (used to mirror the
  * server-authoritative count for signed-in users).
*/
export function registerTryTo(triesUsed: number): TrialState {
  safeSet(TRIES_KEY, String(Math.max(0, triesUsed)));
  return getTrialState();
}

/** Unlock unlimited practice for 7 days (called after joining the waitlist). */
export function unlockTrial(): TrialState {
  const expiry = Date.now() + UNLOCK_DURATION_DAYS * 24 * 60 * 60 * 1000;
  safeSet(UNLOCK_KEY, String(expiry));
  return getTrialState();
}

/**
* Overwrite the local unlock with a server-provided expiry (ms epoch).
* Used when a signed-in user unlocks on another device, or to mirror the
* server's authoritative state after the waitlist flow.
*/
export function syncTrialUnlock(unlockExpiryMs: number | null): TrialState {
  if (unlockExpiryMs) {
    safeSet(UNLOCK_KEY, String(unlockExpiryMs));
  } else {
    safeSet(UNLOCK_KEY, '0');
  }
  return getTrialState();
}

/** Human-readable time remaining on the unlock (e.g. "6d 12h"). */
export function formatUnlockRemaining(unlockExpiry: number): string {
  const ms = Math.max(0, unlockExpiry - Date.now());
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m`;
}

/**
* Human-friendly "N days" label for an unlock expiry (e.g. "7 days", "9 days",
  * "1 day", "5h 20m"). Used by toasts and modal copy so bonus-day unlocks
* (referrals) display the real server-derived duration instead of a hardcoded 7.
*/
export function formatUnlockDays(unlockExpiry: number): string {
  const ms = Math.max(0, unlockExpiry - Date.now());
  // Ceil the minute count so a fresh unlock (a few seconds elapsed) still reads
  // the full grant instead of one unit short (e.g. "6 days 23h").
  const mins = Math.ceil(ms / (60 * 1000));
  if (mins >= 24 * 60) {
    // Round to the NEAREST day: a server-issued unlock is "now + 7 days" in
    // Postgres time, so by the time the browser computes it a few tens of ms of
    // network latency have passed and remaining = 7d + ε. Ceil would round that
    // up to "8 days"; round keeps it at the granted "7 days" (and "9 days" for
      // a 2-day bonus).
    const days = Math.round(mins / (24 * 60));
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours > 0) return `${hours}h ${remMins}m`;
  return `${Math.max(1, remMins)}m`;
}
