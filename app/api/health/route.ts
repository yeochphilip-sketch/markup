import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Lightweight health check for Vercel Cron Jobs and uptime monitors.
 * Returns 200 with status info — no auth required.
 */
export async function GET() {
  const start = Date.now();

  const checks: Record<string, string> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  };

  // Check required env vars (without revealing values)
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GROQ_API_KEY',
  ];

  const missing: string[] = [];
  for (const key of requiredVars) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    checks.status = 'degraded';
    checks.missing_env = missing.join(', ');
  } else {
    checks.env = 'all_configured';
  }

  checks.response_time = `${Date.now() - start}ms`;

  return NextResponse.json(checks, {
    status: checks.status === 'ok' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
