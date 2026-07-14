import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseAdminInstance = createClient(url, key);
  return supabaseAdminInstance;
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

    if (!action || !userId) {
      return NextResponse.json({ error: 'action and userId required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    if (action === 'create') {
      if (!groupName) return NextResponse.json({ error: 'groupName required' }, { status: 400 });

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: group, error: createErr } = await (supabaseAdmin
        .from('study_groups')
        .insert({ name: groupName, join_code: code, owner_id: userId } as never)
        .select()
        .single() as any) as any;

      if (createErr) {
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
      }

      // Add creator as owner member
      await supabaseAdmin
        .from('study_group_members')
        .insert({ group_id: group.id, user_id: userId, is_owner: true } as never);

      return NextResponse.json({ group: { id: group.id, name: group.name, joinCode: group.join_code } });
    }

    if (action === 'join') {
      if (!joinCode) return NextResponse.json({ error: 'joinCode required' }, { status: 400 });

      const { data: group } = await supabaseAdmin
        .from('study_groups')
        .select('id, name')
        .eq('join_code', joinCode.toUpperCase())
        .single() as any;

      if (!group) return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });

      // Check if already a member
      const { data: existingMember } = await supabaseAdmin
        .from('study_group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', userId)
        .single() as any;

      if (existingMember) {
        return NextResponse.json({ group: { id: group.id, name: group.name }, alreadyMember: true });
      }

      await supabaseAdmin
        .from('study_group_members')
        .insert({ group_id: group.id, user_id: userId } as never);

      return NextResponse.json({ group: { id: group.id, name: group.name }, alreadyMember: false });
    }

    if (action === 'info') {
      // Get user's groups
      const { data: memberships } = await supabaseAdmin
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', userId) as any;

      if (!memberships || memberships.length === 0) {
        return NextResponse.json({ groups: [] });
      }

      const groupIds = memberships.map((m: any) => m.group_id);

      const { data: groups } = await supabaseAdmin
        .from('study_groups')
        .select('id, name, join_code')
        .in('id', groupIds) as any;

      return NextResponse.json({ groups: groups ?? [] });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('study-groups failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');

    if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    // Get group info
    const { data: group } = await supabaseAdmin
      .from('study_groups')
      .select('id, name, join_code')
      .eq('id', groupId)
      .single() as any;

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    // Get all members with their XP and streak
    const { data: members } = await supabaseAdmin
      .from('study_group_members')
      .select('user_id')
      .eq('group_id', groupId) as any;

    if (!members || members.length === 0) {
      return NextResponse.json({ group: { ...group, memberCount: 0 }, leaderboard: [] });
    }

    const userIds = members.map((m: any) => m.user_id);

    const { data: metrics } = await supabaseAdmin
      .from('user_skill_metrics')
      .select('user_id, total_xp, current_streak, level_title')
      .in('user_id', userIds) as any;

    const leaderboard = (metrics ?? [])
      .map((m: any) => ({
        userId: m.user_id,
        xp: m.total_xp ?? 0,
        streak: m.current_streak ?? 0,
        level: m.level_title ?? 'Novice',
        isMe: m.user_id === userId,
      }))
      .sort((a: any, b: any) => b.xp - a.xp)
      .map((entry: any, idx: number) => ({ ...entry, rank: idx + 1 }));

    return NextResponse.json({
      group: { ...group, memberCount: members.length },
      leaderboard,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('study-groups GET failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
