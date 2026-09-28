import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const runtime = 'nodejs';

const TRIAL_LIMIT = 3;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface TrialServerState {
  triesUsed: number;
  unlocked: boolean;
  unlockExpiry: number | null;
  trialLimit: number;
}

/**
 * GET /api/trial?userId=<uuid>
 * Returns the server-authoritative trial state for a signed-in user.
 * This is what makes the 3-try gate non-bypassable via localStorage clears.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('user_skill_metrics')
      .select('trial_tries_used, trial_unlocked_until')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Trial state fetch error:', error);
      return NextResponse.json({ error: 'Failed to load trial state' }, { status: 500 });
    }

    const triesUsed = Math.max(0, data?.trial_tries_used || 0);
    const unlockRaw = data?.trial_unlocked_until ? new Date(data.trial_unlocked_until).getTime() : 0;
    const unlocked = unlockRaw > Date.now();

    return NextResponse.json({
      triesUsed,
      unlocked,
      unlockExpiry: unlocked ? unlockRaw : null,
      trialLimit: TRIAL_LIMIT,
    } satisfies TrialServerState);
  } catch (err) {
    console.error('Trial GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trial
 * Body: { action: 'unlock', userId }
 *  - unlock: sets trial_unlocked_until = now + 7 days, but ONLY if the user's
 *    email is already on the waitlist (verified server-side via the unlock_trial
 *    RPC). This prevents self-service bypass of the funnel gate.
 */
export async function POST(request: Request) {
  try {
    const { action, userId } = await request.json() as {
      action?: 'unlock';
      userId?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (action !== 'unlock') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase.rpc('unlock_trial', { p_user_id: userId });

    if (error) {
      console.error('Trial unlock RPC error:', error);
      return NextResponse.json({ error: 'Failed to unlock trial' }, { status: 500 });
    }

    const result = (data ?? {}) as { unlocked?: boolean; reason?: string; unlockExpiry?: number };

    if (result.unlocked !== true) {
      // Email not on the waitlist yet — reject the unlock
      return NextResponse.json(
        {
          error: 'Join the waitlist first to unlock 7 days of practice.',
          code: 'NOT_ON_WAITLIST',
          reason: result.reason || 'not_on_waitlist',
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      unlocked: true,
      unlockExpiry: result.unlockExpiry ?? null,
      trialLimit: TRIAL_LIMIT,
    });
  } catch (err) {
    console.error('Trial POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
