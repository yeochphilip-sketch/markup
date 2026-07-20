import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';

/**
 * Get a Supabase client for database writes.
 * Tries service role key first, falls back to cookie-based auth.
 */
async function getWriteClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return await getServerSupabase();
}

/**
 * Verify the caller is authenticated and has admin privileges.
 * Uses cookie-based auth (getServerSupabase) to read the actual user's session,
 * then uses the service-role client for DB writes only if authorized.
 */
async function requireAdmin(): Promise<{ supabase: ReturnType<typeof createClient>; error?: NextResponse }> {
  // Always verify using cookie-based auth (reads the request's session cookies)
  let user: any = null;
  try {
    const sessionClient = await getServerSupabase();
    const { data } = await sessionClient.auth.getUser();
    user = data?.user;
  } catch {
    return { supabase: null as any, error: NextResponse.json({ error: 'Authentication check failed' }, { status: 403 }) };
  }

  const isAdmin =
    user?.app_metadata?.is_admin === true ||
    user?.user_metadata?.is_admin === true;

  if (!user || !isAdmin) {
    return { supabase: null as any, error: NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 403 }) };
  }

  // Use service-role client for actual DB operations
  const supabase = await getWriteClient();
  return { supabase };
}

export async function POST(request: Request) {
  try {
    // ⚠️ Admin authorization check
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const { action, userId, email } = body as {
      action: 'promote' | 'demote' | 'lookup';
      userId?: string;
      email?: string;
    };

    if (!action) {
      return NextResponse.json({ error: 'action required' }, { status: 400 });
    }

    const supabase = await getWriteClient();

    // Promote a user to ambassador (free premium access)
    if (action === 'promote') {
      if (!userId && !email) {
        return NextResponse.json({ error: 'userId or email required' }, { status: 400 });
      }

      let targetUserId = userId;
      if (!targetUserId && email) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email_address', email.toLowerCase().trim())
          .single();
        if (!profile) {
          return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });
        }
        targetUserId = (profile as { id: string }).id;
      }

      // Update subscription tier to ambassador
      const { error: updateErr } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'ambassador',
          selected_plan: 'Ambassador',
          billing_rate: 0,
        } as never)
        .eq('id', targetUserId);

      if (updateErr) {
        return NextResponse.json({ error: 'Failed to promote user' }, { status: 500 });
      }

      // Fetch updated profile with referral info
      const { data: updated } = await supabase
        .from('user_profiles')
        .select('id, full_name, email_address, referral_code, referral_count, subscription_tier, selected_plan')
        .eq('id', targetUserId)
        .single();

      return NextResponse.json({
        success: true,
        ambassador: updated,
        message: 'User promoted to ambassador — free premium access granted!',
      });
    }

    // Demote an ambassador back to free
    if (action === 'demote') {
      if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
      }

      const { error: updateErr } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          selected_plan: 'Free',
        } as never)
        .eq('id', userId);

      if (updateErr) {
        return NextResponse.json({ error: 'Failed to demote user' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Ambassador demoted to free tier.',
      });
    }

    // Look up a user by email for promoting
    if (action === 'lookup') {
      if (!email) {
        return NextResponse.json({ error: 'email required' }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, full_name, email_address, referral_code, referral_count, subscription_tier, selected_plan, is_admin')
        .eq('email_address', email.toLowerCase().trim())
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });
      }

      return NextResponse.json({ user: profile });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('promote-ambassador failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET all ambassadors
export async function GET() {
  try {
    // ⚠️ Admin authorization check
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await getWriteClient();

    const { data: ambassadors, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email_address, referral_code, referral_count, subscription_tier, selected_plan, updated_at')
      .eq('subscription_tier', 'ambassador')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch ambassadors' }, { status: 500 });
    }

    return NextResponse.json({ ambassadors: ambassadors ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('list ambassadors failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
