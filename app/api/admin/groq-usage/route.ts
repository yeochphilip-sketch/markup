import { NextResponse } from 'next/server';
import { getServerSupabase, getAuthUserId, resolveUserId, getServiceRoleClient } from '@/lib/supabase';
import { checkSupabaseRateLimit, GRADE_LIMIT, rateLimitResponse } from '@/lib/rate-limit-supabase';
import { getGroqUsageSummary } from '@/lib/groq-usage';

export const runtime = 'nodejs';
export const maxDuration = 30;

async function resolveAdmin(): Promise<{ userEmail: string; isAdmin: boolean } | { error: true; status: number; message: string }> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';
  const sessionWeb = await getServerSupabase();
  const { data: { user } = {} } = await sessionWeb.auth.getUser();
  const authUserId = user?.id;

  // Session + app_metadata / admin email allow-list (same as analytics gate)
  const isAdminFlag = user?.app_metadata?.is_admin === true;
  const isAdminEmail = adminEmail.length > 0 && user?.email?.toLowerCase() === adminEmail.toLowerCase();
  if (authUserId && (isAdminFlag || isAdminEmail)) {
    return { userEmail: user.email || '', isAdmin: true };
  }

  // Fall back to the service-role client, then the legacy static userId.
  const svc = await getServiceRoleClient();
  const { data: authUser, error: err } = await svc.auth.getUser();
  if (!err && authUser.user?.id) {
    const { data: adminRow } = await svc
      .from('admins')
      .select('user_id')
      .eq('user_id', authUser.user.id)
      .single();
    if (adminRow) return { userEmail: authUser.user.email || '', isAdmin: true };
  }

  // Legacy static farm admin account
  if (process.env.LEGACY_ADMIN_USER_ID) {
    const { data: legacyRow } = await svc
      .from('admins')
      .select('user_id')
      .eq('user_id', process.env.LEGACY_ADMIN_USER_ID)
      .single();
    if (legacyRow) return { userEmail: '', isAdmin: true };
  }

  return { error: true, status: 403, message: 'Unauthorized — admin access required' };
}

export async function GET(request: Request) {
  // ── Rate limit ──
  const rl = await checkSupabaseRateLimit(request, GRADE_LIMIT);
  if (rl && !rl.allowed) return rateLimitResponse(rl.headers);

  const auth = await resolveAdmin();
  const isAdmin = (auth as any).isAdmin;
  const userEmail = (auth as any).userEmail;
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('group_id');
  const { data: usage, error: usageErr } = await getGroqUsageSummary();

  if (usageErr) {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }

  return NextResponse.json({
    ...usage,
    is_admin: isAdmin,
    user_email: userEmail,
    group_id: groupId,
  });
}
