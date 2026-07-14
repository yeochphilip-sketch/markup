'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface ProfileRow {
  id: string;
  full_name: string;
  email_address: string | null;
  selected_plan: string;
  billing_rate: number;
  account_status: string;
  subscription_tier: string;
  is_admin: boolean;
}

interface WaitlistRow {
  id: string;
  email: string;
  name: string | null;
  subject: string;
  created_at: string;
}

interface EssayRow {
  id: string;
  created_at: string;
  subject: string | null;
  score_estimate: string;
}

interface SkillMetricsRow {
  user_id: string;
  total_xp: number;
  level_title: string;
  current_streak: number;
  longest_streak: number;
  achievements: string[];
  total_evaluations: number;
  total_xp_decayed: number;
}

// ── Helpers ──────────────────────────────────────────────────

function csvDownload(data: Record<string, string>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h]?.toString() ?? '';
          // Escape quotes and wrap in quotes if contains comma or quote
          return val.includes(',') || val.includes('"')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function getDateKey(iso: string) {
  return iso.slice(0, 10); // "2026-07-14"
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ── Bar chart mini component ─────────────────────────────────

function DailyBarChart({
  data,
  days,
  barColor,
  title,
}: {
  data: Record<string, number>;
  days: string[];
  barColor: string;
  title: string;
}) {
  const maxVal = Math.max(1, ...days.map((d) => data[d] || 0));

  return (
    <div>
      <div className="flex items-end h-32 gap-1">
        {days.map((day) => {
          const count = data[day] || 0;
          const h = Math.max(4, (count / maxVal) * 100);
          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className={`w-full rounded-t ${barColor} transition-all duration-300 hover:opacity-80 cursor-pointer`}
                style={{ height: `${h}%` }}
              />
              {/* Tooltip */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                {count}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex mt-1.5">
        {days.filter((_, i) => i % 3 === 0 || i === days.length - 1).map((day) => (
          <span key={day} className="flex-1 text-[8px] text-slate-600 font-mono text-center">
            {day.slice(5)}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 font-mono text-center mt-1.5">{title}</p>
    </div>
  );
}

// ── Main dashboard component ─────────────────────────────────

function AnalyticsDashboardContent() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [essays, setEssays] = useState<EssayRow[]>([]);
  const [profileSearch, setProfileSearch] = useState('');
  const [waitlistSearch, setWaitlistSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);
  const [loadingEssays, setLoadingEssays] = useState(true);
  const [skillMetrics, setSkillMetrics] = useState<SkillMetricsRow[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      const adminFlag =
        user?.app_metadata?.is_admin === true ||
        user?.user_metadata?.is_admin === true ||
        user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!user || !adminFlag) {
        router.replace('/dashboard');
        return;
      }

      setIsAuthorized(true);

      // Fetch profiles
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, email_address, selected_plan, billing_rate, account_status, subscription_tier, is_admin')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        if (data) setProfiles(data as ProfileRow[]);
      } catch (err) {
        console.error('Error fetching profiles:', err);
      } finally {
        setLoading(false);
      }

      // Fetch waitlist
      try {
        const { data, error } = await supabase
          .from('waitlist_signups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setWaitlist(data as WaitlistRow[]);
      } catch (err) {
        console.error('Error fetching waitlist:', err);
      } finally {
        setLoadingWaitlist(false);
      }

      // Fetch skill metrics for gamification stats
      try {
        const { data, error } = await supabase
          .from('user_skill_metrics')
          .select('user_id, total_xp, level_title, current_streak, longest_streak, achievements, total_evaluations, total_xp_decayed');

        if (error) throw error;
        if (data) setSkillMetrics(data as SkillMetricsRow[]);
      } catch (err) {
        console.error('Error fetching skill metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }

      // Fetch essays
      try {
        const { data, error } = await supabase
          .from('essay_evaluations')
          .select('id, created_at, subject, score_estimate')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setEssays(data as EssayRow[]);
      } catch (err) {
        console.error('Error fetching essays:', err);
      } finally {
        setLoadingEssays(false);
      }
    }

    bootstrap();
  }, [router]);

  // ── Gamification derived stats ────────────────────────────

  const totalXpAll = useMemo(
    () => skillMetrics.reduce((sum, m) => sum + (m.total_xp || 0), 0),
    [skillMetrics],
  );

  const avgXpPerUser = skillMetrics.length > 0
    ? Math.round(totalXpAll / skillMetrics.length)
    : 0;

  const totalXpDecayedAll = useMemo(
    () => skillMetrics.reduce((sum, m) => sum + (m.total_xp_decayed || 0), 0),
    [skillMetrics],
  );

  const totalAchievementsUnlocked = useMemo(
    () => skillMetrics.reduce((sum, m) => sum + (m.achievements?.length || 0), 0),
    [skillMetrics],
  );

  const usersWithStreaks = useMemo(
    () => skillMetrics.filter(m => (m.current_streak || 0) >= 3).length,
    [skillMetrics],
  );

  const topLevelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skillMetrics.forEach(m => {
      const t = m.level_title || 'Novice';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [skillMetrics]);

  // ── Derived stats ──────────────────────────────────────────

  const totalRevenue = useMemo(
    () => profiles.reduce((sum, p) => sum + Number(p.billing_rate || 0), 0),
    [profiles],
  );

  const premiumCount = useMemo(
    () =>
      profiles.filter(
        (p) =>
          p.subscription_tier === 'student_monthly' ||
          p.subscription_tier === 'student_academic' ||
          p.subscription_tier === 'tuition_cohort',
      ).length,
    [profiles],
  );

  const conversionRate =
    profiles.length > 0 ? ((premiumCount / profiles.length) * 100).toFixed(1) : '0.0';

  // Essay stats
  const essaysThisWeek = useMemo(
    () =>
      essays.filter((e) => {
        const d = new Date(e.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }).length,
    [essays],
  );

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    essays.forEach((e) => {
      const s = e.subject || 'Unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [essays]);

  // Waitlist subject breakdown
  const waitlistSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    waitlist.forEach((w) => {
      counts[w.subject] = (counts[w.subject] || 0) + 1;
    });
    return counts;
  }, [waitlist]);

  // Daily waitlist signups (last 14 days)
  const waitlistDays = useMemo(() => {
    const days = lastNDays(14);
    const counts: Record<string, number> = {};
    waitlist.forEach((w) => {
      const key = getDateKey(w.created_at);
      counts[key] = (counts[key] || 0) + 1;
    });
    return { days, counts };
  }, [waitlist]);

  // Daily essay submissions (last 14 days)
  const essayDays = useMemo(() => {
    const days = lastNDays(14);
    const counts: Record<string, number> = {};
    essays.forEach((e) => {
      const key = getDateKey(e.created_at);
      counts[key] = (counts[key] || 0) + 1;
    });
    return { days, counts };
  }, [essays]);

  // ── Filtered data ──────────────────────────────────────────

  const filteredWaitlist = useMemo(
    () =>
      waitlist.filter(
        (w) =>
          w.email.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
          (w.name || '').toLowerCase().includes(waitlistSearch.toLowerCase()) ||
          w.subject.toLowerCase().includes(waitlistSearch.toLowerCase()),
      ),
    [waitlist, waitlistSearch],
  );

  const filteredProfiles = useMemo(
    () =>
      profiles.filter(
        (p) =>
          (p.full_name || '').toLowerCase().includes(profileSearch.toLowerCase()) ||
          (p.email_address || '').toLowerCase().includes(profileSearch.toLowerCase()) ||
          p.subscription_tier.toLowerCase().includes(profileSearch.toLowerCase()),
      ),
    [profiles, profileSearch],
  );

  // ── Render ─────────────────────────────────────────────────

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-500 font-mono flex items-center justify-center text-xs">
        Loading Secure Registry Profile Matrix…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-indigo-400 tracking-tight">
              Platform Insights
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live data streams from users, essays, waitlist, and subscriptions
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth');
            }}
            className="text-[11px] font-bold text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>

        {/* ── Row 1: Core KPI tiles ────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Registered Users
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {loading ? '…' : profiles.length}
            </div>
            <div className="text-[9px] text-emerald-400 font-mono mt-1">Live headcount</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Monthly Revenue
            </div>
            <div className="text-3xl font-black text-indigo-400 mt-1">
              S${loading ? '…' : totalRevenue.toFixed(2)}
            </div>
            <div className="text-[9px] text-indigo-500 font-mono mt-1">Active billing</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Paid Conversion
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {loading ? '…' : `${conversionRate}%`}
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-1">Across 3 paid tiers</div>
          </div>
          <div className="bg-slate-950 border border-amber-500/30 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Waitlist Signups
            </div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {loadingWaitlist ? '…' : waitlist.length}
            </div>
            <div className="text-[9px] text-amber-500 font-mono mt-1">
              {Object.entries(waitlistSubjectCounts)
                .map(([s, c]) => `${s}: ${c}`)
                .join(' · ')}
            </div>
          </div>
        </div>

        {/* ── Gamification KPI tiles ────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-emerald-500/20 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Total XP Earned
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {loadingMetrics ? '…' : totalXpAll.toLocaleString()}
            </div>
            <div className="text-[9px] text-emerald-500 font-mono mt-1">Avg {avgXpPerUser}/user</div>
          </div>
          <div className="bg-slate-950 border border-amber-500/20 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Achievements
            </div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {loadingMetrics ? '…' : totalAchievementsUnlocked}
            </div>
            <div className="text-[9px] text-amber-500 font-mono mt-1">Unlocked across all users</div>
          </div>
          <div className="bg-slate-950 border border-rose-500/20 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              XP Decayed
            </div>
            <div className="text-3xl font-black text-rose-400 mt-1">
              {loadingMetrics ? '…' : totalXpDecayedAll}
            </div>
            <div className="text-[9px] text-rose-500 font-mono mt-1">Lost to inactivity</div>
          </div>
          <div className="bg-slate-950 border border-indigo-500/20 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Streak Users
            </div>
            <div className="text-3xl font-black text-indigo-400 mt-1">
              {loadingMetrics ? '…' : usersWithStreaks}
            </div>
            <div className="text-[9px] text-indigo-500 font-mono mt-1">≥3 day streak</div>
          </div>
        </div>

        {/* ── Level distribution ── */}
        {!loadingMetrics && Object.keys(topLevelCounts).length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(topLevelCounts).map(([level, count]) => (
              <div key={level} className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-center">
                <div className="text-xs font-black text-white">{count}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{level}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Row: Essay + usage KPI tiles ──────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-indigo-500/20 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Total Essays Graded
            </div>
            <div className="text-3xl font-black text-indigo-300 mt-1">
              {loadingEssays ? '…' : essays.length}
            </div>
            <div className="text-[9px] text-indigo-500 font-mono mt-1">All-time submissions</div>
          </div>
          <div className="bg-slate-950 border border-emerald-500/20 p-5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Essays This Week
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {loadingEssays ? '…' : essaysThisWeek}
            </div>
            <div className="text-[9px] text-emerald-500 font-mono mt-1">Last 7 days</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl col-span-2">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Subjects Practiced
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              {Object.entries(subjectCounts).length === 0 ? (
                <span className="text-xs text-slate-600 italic">No data yet</span>
              ) : (
                Object.entries(subjectCounts).map(([s, c]) => (
                  <div key={s} className="text-center">
                    <div className="text-lg font-black text-white">{c}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{s}</div>
                  </div>
                ))
              )}
            </div>
            <div className="text-[9px] text-slate-600 font-mono mt-1">Submissions per subject</div>
          </div>
        </div>

        {/* ── Charts row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                📈 Daily Waitlist Signups
              </h3>
              <span className="text-[9px] text-slate-600 font-mono">Last 14 days</span>
            </div>
            <DailyBarChart
              data={waitlistDays.counts}
              days={waitlistDays.days}
              barColor="bg-amber-500/70"
              title="Signups per day"
            />
          </div>
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                📝 Daily Essay Submissions
              </h3>
              <span className="text-[9px] text-slate-600 font-mono">Last 14 days</span>
            </div>
            <DailyBarChart
              data={essayDays.counts}
              days={essayDays.days}
              barColor="bg-indigo-500/70"
              title="Submissions per day"
            />
          </div>
        </div>

        {/* ── Waitlist table ──────────────────────────────── */}
        <div className="bg-slate-950 border border-amber-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-200">📋 Beta Waitlist</h2>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                {waitlist.length} signups
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by email, name, or subject..."
                value={waitlistSearch}
                onChange={(e) => setWaitlistSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 w-48"
              />
              <button
                onClick={() =>
                  csvDownload(
                    waitlist.map((w) => ({
                      Email: w.email,
                      Name: w.name || '',
                      Subject: w.subject,
                      'Signed Up': new Date(w.created_at).toLocaleDateString('en-SG'),
                    })),
                    'waitlist-signups',
                  )
                }
                className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition whitespace-nowrap"
              >
                ⬇ CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingWaitlist ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono animate-pulse">
                Loading waitlist data…
              </div>
            ) : filteredWaitlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                {waitlistSearch
                  ? 'No results match your search.'
                  : 'No waitlist signups yet. Share the landing page!'}
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                  <tr>
                    <th className="p-4">Email</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Signed Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredWaitlist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-4 font-medium text-slate-200">{entry.email}</td>
                      <td className="p-4 text-slate-400">{entry.name || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.subject === 'History'
                              ? 'bg-amber-500/10 text-amber-400'
                              : entry.subject === 'Social Studies'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {entry.subject}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        {new Date(entry.created_at).toLocaleDateString('en-SG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── User registry table ─────────────────────────── */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-200">👤 User Registry</h2>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                {profiles.length} users
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name, email, or tier..."
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 w-48"
              />
              <button
                onClick={() =>
                  csvDownload(
                    profiles.map((p) => ({
                      Name: p.full_name || 'Unnamed',
                      Email: p.email_address || '',
                      Plan: p.selected_plan,
                      Tier: p.subscription_tier,
                      'MRR (S$)': Number(p.billing_rate || 0).toFixed(2),
                      Status: p.account_status,
                    })),
                    'user-registry',
                  )
                }
                className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition whitespace-nowrap"
              >
                ⬇ CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono animate-pulse">
                Syncing data rows…
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                {profileSearch
                  ? 'No results match your search.'
                  : 'No registered profiles detected.'}
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Subscription Tier</th>
                    <th className="p-4">Plan Label</th>
                    <th className="p-4">MRR</th>
                    <th className="p-4">Gateway Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          {profile.full_name || 'Unnamed user'}
                          {profile.is_admin && (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {profile.email_address || 'hidden-auth-node'}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-300">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            profile.subscription_tier === 'tuition_cohort'
                              ? 'bg-amber-500/10 text-amber-400'
                              : profile.subscription_tier === 'student_academic'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : profile.subscription_tier === 'student_monthly'
                                  ? 'bg-indigo-500/10 text-indigo-400'
                                  : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {profile.subscription_tier}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{profile.selected_plan}</td>
                      <td className="p-4 text-indigo-400 font-mono font-bold">
                        S${Number(profile.billing_rate || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            profile.account_status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {profile.account_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] text-slate-500 font-mono flex items-center justify-center text-xs">
          Loading Security Shell…
        </div>
      }
    >
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
