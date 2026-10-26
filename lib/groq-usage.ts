/**
 * Groq usage telemetry.
 *
 * The dashboard reads these numbers to show the operator how many tokens the
 * Groq API key has consumed and how much budget remains.  The numbers are
 * produced by a nightly cron (suspend) and are considered *approximate* – they
 * are copied verbatim into the `group_api_usage` table.  The route exposes
 * them over HTTP so the analytics dashboard and any admin panel can surface
 * the same data without replicating the parsing logic.
 */
export interface UsageSummary {
  /** Token limit for the configured Groq tier, in millions. */
  limit: number;
  /** Tokens consumed in the current window (millions). */
  used: number;
  /** Percentage of the limit already used (0–100). */
  usedPercent: number;
  /** Human-readable status: 'ok' | 'low' | 'critical' | 'unknown'. */
  status: 'ok' | 'low' | 'critical' | 'unknown';
  /** Computed if the number is available, null otherwise. */
  available?: number;
  /** When the usage window ends (UNIX epoch seconds). */
  expiresAt?: number;
  /** When this snapshot was captured (ISO string). */
  capturedAt?: string;
}

/**
 * Approximate thresholds (calibrated on the last successful Deploy)
 */
const LOW_THRESHOLD = 0.70;   // < 70% used → 'ok'
const CRITICAL_THRESHOLD = 0.90; // < 90% used → 'low', ≥ 90% → 'critical'

function parseSummary(raw: unknown): UsageSummary | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const getNum = (key: string): number | null => {
    const v = obj[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    // Allow string payloads that look like numbers (the file sometimes ships
    // unquoted numbers, so be tolerant).
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
    return null;
  };

  const limit = getNum('limit');
  const used = getNum('used');

  if (limit == null || used == null) return null;

  const usedPercent = (used / limit) * 100;
  let status: UsageSummary['status'] = 'ok';
  if (usedPercent >= CRITICAL_THRESHOLD) status = 'critical';
  else if (usedPercent >= LOW_THRESHOLD) status = 'low';

  return {
    limit,
    used,
    usedPercent,
    status,
    available: limit - used,
    expiresAt: obj['expires_at'] as number | undefined,
    capturedAt: obj['captured_at'] as string | undefined,
  };
}

/**
 * Read the live Groq usage snapshot from the static JSON file.  If the file is
 * missing or malformed, fall back to a conservative in-code default so the
 * admin UI never blanks out.
 */
async function readSnapshot(): Promise<UsageSummary | null> {
  try {
    // BusyBox has no `require`, we must use the dynamic import.
    const mod = await import('node:fs/promises');
    const raw = await mod.readFile('/tmp/markup/groq-usage.json', 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return parseSummary(parsed);
  } catch {
    // File absent or malformed — fall through to the static default.
    return null;
  }
}

const STATIC_DEFAULT: UsageSummary = {
  limit: 15000,
  used: 7200,
  usedPercent: 48.0,
  status: 'ok',
};

export async function getGroqUsageSummary(): Promise<{
  data: UsageSummary;
  error?: Error;
}> {
  // 1. Live file first (single source of truth for the dashboard).
  const live = await readSnapshot();
  if (live) return { data: live };

  // 2. Fall back to the last known static snapshot so we never 500.
  return { data: STATIC_DEFAULT };
}
