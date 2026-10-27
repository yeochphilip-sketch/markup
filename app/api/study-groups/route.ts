import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase, getAuthUserId, resolveUserId, getServiceRoleClient } from '@/lib/supabase';

/** ── Types ── */
interface StudyGroup {
  id: string;
  name: string;
  join_code?: string;
}

interface StudyGroupMember {
  group_id: string;
  user_id: string;
  is_owner?: boolean;
}

interface SkillMetric {
  user_id: string;
  total_xp: number;
  current_streak: number;
  level_title: string;
}

interface LeaderboardEntry {
  userId: string;
  xp: number;
  streak: number;
  level: string;
  isMe: boolean;
  rank: number;
}

interface GroupResponse {
  group: {
    id: string;
    name: string;
    joinCode?: string;
    memberCount?: number;
  };
  alreadyMember?: boolean;
  leaderboard?: LeaderboardEntry[];
}

/**
 * Resolve the effective user ID for this request.
 *
 * Rules:
 * 1. Strictly authenticate — the caller must be signed in.
 * 2. For read endpoints that may list *other* users' data (e.g. membership
 *    leaderboard), the caller's ID is only used as the "viewer". The caller
 *    cannot append arbitrary IDs to `userId` params unless they are the
 *    authenticated session user or an admin allow-listed ID.
 */
async function resolveCallerUserId(request: Request, allowedIds: string[] | null = null): Promise<string | null> {
  return resolveUserId(request, allowedIds ?? undefined);
}

/** Resolve a Supabase client.
 * Prefer the session-based client (respects RLS). Use only for the caller's
 * own rows. Falls back to admin client only when explicitly needed (e.g.
 * reading *all* users' metrics for a leaderboard) — never for updates/overwrites
 * of another user's data. */
async function getReadClientForUser(request: Request): Promise<Awaited<ReturnType<typeof getServerSupabase>>> {
  return getServerSupabase();
}

async function getWriteClientForUser(request: Request): Promise<Awaited<ReturnType<typeof getServerSupabase>>> {
  return getServerSupabase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, groupName, joinCode } = body as {
      action: 'create' | 'join' | 'info';
      userId: string;
      groupName?: string;
      joinCode?: string;
    };

    // Resolve the caller's real identity. We accept `userId` in the body ONLY
    // if it matches the authenticated session (or is within the admin allow-list).
    let resolvedUserId: string | null = null;
    if (userId) {
      const sessionUserId = await getAuthUserId(request);
      if (sessionUserId && sessionUserId === userId) {
        resolvedUserId = userId;
      } else {
        // Non-matching userId → reject (prevents cross-tenant writes)
        return NextResponse.json({ error: 'User ID mismatch. The provided userId does not match your session.' }, { status: 403 });
      }
    } else {
      resolvedUserId = await resolveCallerUserId(request);
    }

    if (!action || !resolvedUserId) {
      return NextResponse.json({ error: 'action and userId required' }, { status: 400 });
    }

    const supabase = await getWriteClientForUser(request);

    if (action === 'create') {
      if (!groupName) return NextResponse.json({ error: 'groupName required' }, { status: 400 });

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: group, error: createErr } = await supabase
        .from('study_groups')
        .insert({ name: groupName, join_code: code, owner_id: resolvedUserId })
        .select()
        .single();

      if (createErr || !group) {
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
      }

      // Add creator as owner member
      await supabase
        .from('study_group_members')
        .insert({ group_id: (group as StudyGroup).id, user_id: resolvedUserId, is_owner: true });

      return NextResponse.json({
        group: { id: (group as StudyGroup).id, name: (group as StudyGroup).name, joinCode: (group as StudyGroup).join_code }
      } satisfies { group: GroupResponse['group'] });
    }

    if (action === 'join') {
      if (!joinCode) return NextResponse.json({ error: 'joinCode required' }, { status: 400 });

      const { data: group } = await supabase
        .from('study_groups')
        .select('id, name')
        .eq('join_code', joinCode.toUpperCase())
        .single();

      const groupData = group as StudyGroup | null;
      if (!groupData) return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', resolvedUserId)
        .single();

      if (existingMember) {
        return NextResponse.json({ group: { id: groupData.id, name: groupData.name }, alreadyMember: true });
      }

      await supabase
        .from('study_group_members')
        .insert({ group_id: groupData.id, user_id: resolvedUserId });

      return NextResponse.json({ group: { id: groupData.id, name: groupData.name }, alreadyMember: false });
    }

    if (action === 'info') {
      // Get user's groups — strictly their own
      const { data: memberships } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', resolvedUserId);

      const membershipData = (memberships ?? []) as Pick<StudyGroupMember, 'group_id'>[];

      if (membershipData.length === 0) {
        return NextResponse.json({ groups: [] });
      }

      const groupIds: string[] = membershipData.map((m) => m.group_id);

      const { data: groups } = await supabase
        .from('study_groups')
        .select('id, name, join_code')
        .in('id', groupIds);

      return NextResponse.json({ groups: (groups as StudyGroup[]) ?? [] });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('study-groups failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET /api/study-groups/leaderboard?groupId=xxx
 * Read-only leaderboard for a study group's members — this is the only
 * cross-user read. It uses an admin client (service role) or falls back to the
 * current user's data (anonymous mode). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

    // Resolve the viewer (who asked for this page). Must be authenticated.
    const viewerUserId = await resolveCallerUserId(request);
    if (!viewerUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const adminClient = getServiceRoleClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Service role client not configured' }, { status: 500 });
    }

    // Get group info
    const { data: group } = await adminClient
      .from('study_groups')
      .select('id, name, join_code')
      .eq('id', groupId)
      .single();

    const groupData = group as StudyGroup | null;
    if (!groupData) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    // Get all members
    const { data: members } = await adminClient
      .from('study_group_members')
      .select('user_id')
      .eq('group_id', groupId);

    const memberData = (members ?? []) as Pick<StudyGroupMember, 'user_id'>[];

    if (memberData.length === 0) {
      return NextResponse.json({ group: { id: groupData.id, name: groupData.name, memberCount: 0 }, leaderboard: [] });
    }

    const userIds: string[] = memberData.map((m) => m.user_id);

    const { data: metrics } = await adminClient
      .from('user_skill_metrics')
      .select('user_id, total_xp, current_streak, level_title')
      .in('user_id', userIds);

    const metricsData = (metrics ?? []) as SkillMetric[];

    const leaderboard: LeaderboardEntry[] = metricsData
      .map((m) => ({
        userId: m.user_id,
        xp: m.total_xp ?? 0,
        streak: m.current_streak ?? 0,
        level: m.level_title ?? 'Novice',
        isMe: m.user_id === viewerUserId,
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    return NextResponse.json({
      group: { id: groupData.id, name: groupData.name, memberCount: memberData.length },
      leaderboard,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('study-groups GET failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
