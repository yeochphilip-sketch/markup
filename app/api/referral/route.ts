import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';

async function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return getServerSupabase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, referralCode } = body as {
      action: 'claim';
      userId: string;
      referralCode: string;
    };

    if (!action || !userId) {
      return NextResponse.json({ error: 'action and userId required' }, { status: 400 });
    }

    const supabaseAdmin = await getClient();

    if (action === 'claim') {
      if (!referralCode) {
        return NextResponse.json({ error: 'referralCode required' }, { status: 400 });
      }

      // Find the referrer
      const { data: referrerProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, referral_count')
        .eq('referral_code', referralCode.toUpperCase())
        .single() as any;

      if (!referrerProfile) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
      }

      if (referrerProfile.id === userId) {
        return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
      }

      // Check if the user was already referred
      const { data: myProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('referred_by')
        .eq('id', userId)
        .single() as any;

      if (myProfile?.referred_by) {
        return NextResponse.json({ error: 'Already referred by someone' }, { status: 400 });
      }

      // Credit XP to referrer (200 XP)
      const REFERRAL_XP = 200;
      const { data: referrerMetrics } = await supabaseAdmin
        .from('user_skill_metrics')
        .select('total_xp')
        .eq('user_id', referrerProfile.id)
        .single() as any;

      const referrerXp = (referrerMetrics?.total_xp ?? 0) + REFERRAL_XP;

      // Update referrer
      await supabaseAdmin
        .from('user_skill_metrics')
        .update({ total_xp: referrerXp } as never)
        .eq('user_id', referrerProfile.id);

      await supabaseAdmin
        .from('user_profiles')
        .update({ referral_count: (referrerProfile.referral_count ?? 0) + 1 } as never)
        .eq('id', referrerProfile.id);

      // Credit XP to new user (100 XP for joining)
      const NEW_USER_XP = 100;
      const { data: myMetrics } = await supabaseAdmin
        .from('user_skill_metrics')
        .select('total_xp')
        .eq('user_id', userId)
        .single() as any;

      const myNewXp = (myMetrics?.total_xp ?? 0) + NEW_USER_XP;

      await supabaseAdmin
        .from('user_skill_metrics')
        .update({ total_xp: myNewXp } as never)
        .eq('user_id', userId);

      // Mark user as referred
      await supabaseAdmin
        .from('user_profiles')
        .update({ referred_by: referralCode.toUpperCase() } as never)
        .eq('id', userId);

      // Create notifications
      try {
        await supabaseAdmin.from('user_notifications').insert([
          {
            user_id: userId,
            type: 'info',
            title: '🎉 Welcome Bonus!',
            body: `You earned ${NEW_USER_XP} XP for joining via a referral!`,
          },
          {
            user_id: referrerProfile.id,
            type: 'info',
            title: '🎉 Referral Reward!',
            body: `Someone used your referral code! You earned ${REFERRAL_XP} XP.`,
          },
        ] as never);
      } catch (notifErr) {
        console.warn('Non-fatal: referral notification failed', notifErr);
      }

      return NextResponse.json({
        success: true,
        xpEarned: NEW_USER_XP,
        message: `You earned ${NEW_USER_XP} XP from the referral!`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('referral failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    const supabaseAdmin = await getClient();

    // Get user's referral info
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('referral_code, referred_by, referral_count')
      .eq('id', userId)
      .single() as any;

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure a referral code exists (generate if missing)
    if (!profile.referral_code) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabaseAdmin
        .from('user_profiles')
        .update({ referral_code: code } as never)
        .eq('id', userId);
      profile.referral_code = code;
    }

    // Get referral count from linked users
    const { count } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', profile.referral_code) as any;

    return NextResponse.json({
      referralCode: profile.referral_code,
      referredBy: profile.referred_by,
      referralCount: count ?? profile.referral_count ?? 0,
      referralLink: `https://markup-five.vercel.app?ref=${profile.referral_code}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('referral GET failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
