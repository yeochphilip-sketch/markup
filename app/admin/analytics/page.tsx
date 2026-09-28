'use client';

import { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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

interface FeedbackRow {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  feedback_type: string;
  description: string;
  testimonial_rating?: number;
  testimonial_approved?: boolean;
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
  ss_goal_level: string | null;
  history_goal_level: string | null;
  /** 'Elective History' | 'Pure History' | null. Added by delta_migration.sql. */
  history_track: string | null;
  takes_history: boolean;
  trial_tries_used: number;
  trial_unlocked_until: string | null;
  /** Computed at fetch time (unlock is a rare event, so a stale flag is fine) */
  unlocked: boolean;
}

interface GroqUsage {
  provider: string;
  model: string;
  probedAt: string;
  probeStatus: number;
  probeError: string | null;
  tpm: { limit: number | null; used: number | null; remaining: number | null };
  rpd: { limit: number | null; used: number | null; remaining: number | null };
  /** Live daily-token usage — only present once Groq refused a request (429) */
  dailyTokens: { limit: number; used: number } | null;
  activity: {
    gradesToday: number;
    generationsToday: number;
    estimatedDailyTokens: number;
  };
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

// ── Quota gauge mini component ──────────────────────────────

function QuotaGauge({
  label,
  used,
  limit,
  unit,
  accent,
}: {
  label: string;
  used: number | null;
  limit: number | null;
  unit: string;
  accent: string;
}) {
  const pct =
    used !== null && limit !== null && limit > 0
      ? Math.min(100, Math.max(0, (used / limit) * 100))
      : null;
  const barColor =
    pct === null
      ? 'bg-slate-700/40'
      : pct >= 90
        ? 'bg-rose-500'
        : pct >= 70
          ? 'bg-amber-500'
          : accent;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] font-mono text-slate-300">
          {used !== null && limit !== null
            ? `${used.toLocaleString()} / ${limit.toLocaleString()} ${unit}`
            : '—'}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-mono text-slate-600">
        <span>{pct !== null ? `${Math.round(pct)}% used` : 'unavailable'}</span>
        {used !== null && limit !== null && limit - used > 0 && (
          <span className="text-emerald-500/70">
            {(limit - used).toLocaleString()} left
          </span>
        )}
      </div>
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
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testimonials, setTestimonials] = useState<FeedbackRow[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [groqUsage, setGroqUsage] = useState<GroqUsage | null>(null);
  const [loadingGroq, setLoadingGroq] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setLoadingWaitlist(true);
    setLoadingEssays(true);
    setLoadingMetrics(true);
    setLoadingFeedback(true);
    setLoadingTestimonials(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      // app_metadata only — user_metadata is end-user-editable.
      const adminFlag =
        user?.app_metadata?.is_admin === true ||
        user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!user || !adminFlag) {
        router.replace('/dashboard');
        return;
      }

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

      // Fetch skill metrics for gamification + trial funnel stats
      // Both of these arrive together with delta_migration.sql.
      const MIGRATION_COLUMNS = 'trial_tries_used, trial_unlocked_until, history_track';
      const BASE_METRIC_COLUMNS = 'user_id, total_xp, level_title, current_streak, longest_streak, achievements, total_evaluations, total_xp_decayed, ss_goal_level, history_goal_level, takes_history';
      try {
        // Try with the migration columns first
        let { data, error } = await supabase
          .from('user_skill_metrics')
          .select(`${BASE_METRIC_COLUMNS}, ${MIGRATION_COLUMNS}`);

        if (error) {
          // Pre-migration fallback: those columns don't exist yet — fetch without them
          const fallback = await supabase
            .from('user_skill_metrics')
            .select(BASE_METRIC_COLUMNS);
          data = fallback.data as SkillMetricsRow[] | null;
          error = fallback.error;
        }

        if (error) throw error;
        if (data) {
          // Compute the unlock flag once at fetch time (keeps render pure)
          const now = Date.now();
          setSkillMetrics(data.map(m => ({
            ...m,
            trial_tries_used: (m as { trial_tries_used?: number }).trial_tries_used ?? 0,
            trial_unlocked_until: (m as { trial_unlocked_until?: string | null }).trial_unlocked_until ?? null,
            // Rows written before the Elective/Pure split only carry the boolean;
            // back then Elective History was the only option offered.
            history_track:
              (m as { history_track?: string | null }).history_track ??
              (m.takes_history ? 'Elective History' : null),
            unlocked: !!m.trial_unlocked_until && new Date(m.trial_unlocked_until).getTime() > now,
          })));
        }
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
    // Fetch feedback
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFeedback(data as FeedbackRow[]);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }

    // Fetch testimonials (feedback with type 'Testimonial')
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('feedback_type', 'Testimonial')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTestimonials(data as FeedbackRow[]);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoadingTestimonials(false);
    }

    // Fetch Groq AI quota (admin-only endpoint — probe reads rate-limit headers)
    try {
      const res = await fetch('/api/admin/groq-usage', { cache: 'no-store' });
      if (res.ok) {
        setGroqUsage(await res.json());
      } else {
        setGroqUsage(null);
      }
    } catch (err) {
      console.error('Error fetching groq usage:', err);
      setGroqUsage(null);
    } finally {
      setLoadingGroq(false);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      // app_metadata only — user_metadata is end-user-editable.
      const adminFlag =
        user?.app_metadata?.is_admin === true ||
        user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!user || !adminFlag) {
        router.replace('/dashboard');
        return;
      }

      setIsAuthorized(true);
      await fetchAllData();
    }

    bootstrap();
  }, [router, fetchAllData]);

  const handleRefresh = async () => {
    const _start = Date.now();
    setIsRefreshing(true);
    await fetchAllData();
    const _elapsed = Date.now() - _start;
    if (_elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - _elapsed));
    setIsRefreshing(false);
  };

  /** Toggle testimonial approval status */
  const handleToggleApproval = async (id: string, currentlyApproved: boolean) => {
    setApprovingId(id);
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !currentlyApproved }),
      });
      if (!res.ok) throw new Error('Failed to toggle approval');
      // Optimistically update local state
      setTestimonials(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, testimonial_approved: !currentlyApproved }
            : t
        )
      );
    } catch (err) {
      console.error('Error toggling approval:', err);
    } finally {
      setApprovingId(null);
    }
  };

  /** Copy testimonial quote to clipboard */
  const handleCopyQuote = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /** Parse star rating from testimonial description or use testimonial_rating column */
  const extractRating = (t: FeedbackRow): number => {
    if (t.testimonial_rating) return t.testimonial_rating;
    const match = t.description?.match(/^(?:⭐\s*)?(\d)\/5/);
    return match ? parseInt(match[1], 10) : 0;
  };

  /** Extract the name from testimonial description (after last '—') */
  const extractName = (t: FeedbackRow): string | null => {
    const lines = t.description?.split('\n') ?? [];
    const lastLine = lines[lines.length - 1];
    if (lastLine?.startsWith('— ')) return lastLine.slice(2).trim();
    return t.user_email?.split('@')[0] || null;
  };

  /** Extract the rating label from the first line (e.g. "Amazing!") */
  const extractRatingLabel = (t: FeedbackRow): string => {
    const firstLine = t.description?.split('\n')[0] ?? '';
    // Match: 5/5 — Amazing! OR 5/5—Amazing!
    const match = firstLine.match(/—\s*(.+)$/);
    return match ? match[1].trim() : '';
  };

  /** Extract the user's written feedback text (between the star line and the name line) */
  const extractFeedback = (t: FeedbackRow): string => {
    const lines = t.description?.split('\n') ?? [];
    // Remove first line (stars header) and last line if it starts with — (name)
    const body = lines.filter((l: string, i: number) => {
      if (i === 0 && l.match(/^⭐?\s*\d\/5/)) return false;
      if (i === lines.length - 1 && l.startsWith('— ')) return false;
      return true;
    });
    return body.join('\n').trim();
  };

  /** Alias for CSV export */
  const extractQuote = extractFeedback;

  /** Render star icons */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xs ${i < rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
    ));
  };

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

  // Per-subject goal analytics — Elective and Pure History are tracked separately
  const subjectSplit = useMemo(() => {
    const total = skillMetrics.length;
    const elective = skillMetrics.filter(m => m.history_track === 'Elective History').length;
    const pure = skillMetrics.filter(m => m.history_track === 'Pure History').length;
    const ssOnly = total - elective - pure;
    return { total, ssOnly, elective, pure, takesHistory: elective + pure };
  }, [skillMetrics]);

  const ssGoalDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    skillMetrics.forEach(m => {
      const goal = m.ss_goal_level || 'Not set';
      counts[goal] = (counts[goal] || 0) + 1;
    });
    return counts;
  }, [skillMetrics]);

  const historyGoalDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    skillMetrics.filter(m => m.takes_history).forEach(m => {
      const goal = m.history_goal_level || 'Not set';
      counts[goal] = (counts[goal] || 0) + 1;
    });
    return counts;
  }, [skillMetrics]);

  const usersWithGoals = useMemo(
    () => skillMetrics.filter(m => m.ss_goal_level || (m.takes_history && m.history_goal_level)).length,
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

  // Waitlist subject percentages
  const waitlistSubjectPercentages = useMemo(() => {
    const total = waitlist.length || 1;
    const pcts: Record<string, string> = {};
    Object.entries(waitlistSubjectCounts).forEach(([s, c]) => {
      pcts[s] = ((c / total) * 100).toFixed(1);
    });
    return pcts;
  }, [waitlist, waitlistSubjectCounts]);

  // Waitlist → user conversion
  const waitlistConversionPct = useMemo(() => {
    const totalWaitlist = waitlist.length;
    const totalUsers = profiles.length;
    if (totalWaitlist === 0) return '0.0';
    return ((totalUsers / totalWaitlist) * 100).toFixed(1);
  }, [waitlist, profiles]);

  // Weekly waitlist growth rate
  const waitlistGrowthRate = useMemo(() => {
    const now = new Date();
    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const lastWeek = new Date(thisWeek);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const thisWkCount = waitlist.filter(w => new Date(w.created_at) >= thisWeek).length;
    const lastWkCount = waitlist.filter(w => {
      const d = new Date(w.created_at);
      return d >= lastWeek && d < thisWeek;
    }).length;

    if (lastWkCount === 0) return thisWkCount > 0 ? '+∞' : '0.0';
    const growth = ((thisWkCount - lastWkCount) / lastWkCount) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}`;
  }, [waitlist]);

  // Numeric view of the growth rate (handles '+∞' safely — NaN would silently break
  // the colour/insight logic below).
  const waitlistGrowthRateNum = useMemo(() => {
    if (waitlistGrowthRate === '+∞') return Infinity;
    const n = parseFloat(waitlistGrowthRate);
    return Number.isFinite(n) ? n : 0;
  }, [waitlistGrowthRate]);

  // Waitlist total signups last week
  const waitlistThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return waitlist.filter(w => new Date(w.created_at) >= weekAgo).length;
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

  const filteredTestimonials = useMemo(
    () =>
      testimonials.filter(
        (t) =>
          (t.user_email || '').toLowerCase().includes(testimonialSearch.toLowerCase()) ||
          t.description.toLowerCase().includes(testimonialSearch.toLowerCase()),
      ),
    [testimonials, testimonialSearch],
  );

  // ── Beta trial funnel stats ──────────────────────────────
  // `unlocked` is computed at fetch time, so these memos stay pure.
  const trialUnlockedCount = useMemo(
    () => skillMetrics.filter(m => m.unlocked).length,
    [skillMetrics],
  );

  const trialAtLimitCount = useMemo(
    () =>
      skillMetrics.filter(m => !m.unlocked && (m.trial_tries_used || 0) >= 3).length,
    [skillMetrics],
  );

  const trialAvgTries = useMemo(
    () =>
      skillMetrics.length > 0
        ? (skillMetrics.reduce((sum, m) => sum + (m.trial_tries_used || 0), 0) / skillMetrics.length).toFixed(1)
        : '0.0',
    [skillMetrics],
  );

  const trialTriesDistribution = useMemo(() => {
    const counts: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3+': 0 };
    skillMetrics.forEach(m => {
      const t = m.trial_tries_used || 0;
      if (t >= 3) counts['3+'] += 1;
      else counts[String(t)] += 1;
    });
    return counts;
  }, [skillMetrics]);

  // Join trial state with user email/name for the funnel table
  const trialRows = useMemo(() => {
    const emailByUser = new Map(
      profiles.map(p => [p.id, { email: p.email_address || '—', name: p.full_name || 'Unnamed' }]),
    );
    return skillMetrics
      .map(m => {
        const info = emailByUser.get(m.user_id) || { email: '—', name: '—' };
        return {
          ...m,
          email: info.email,
          name: info.name,
          unlocked: m.unlocked,
          unlockExpiry: m.trial_unlocked_until || null,
        };
      })
      .sort((a, b) => (b.trial_tries_used || 0) - (a.trial_tries_used || 0));
  }, [skillMetrics, profiles]);

  // ── Render ─────────────────────────────────────────────────

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-6">
        <LoadingSpinner size="lg" label="Authenticating..." color="indigo" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 sm:p-8 font-sans">
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
          <div className="flex items-center gap-3">
            <a
              href="/admin/ambassadors"
              className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg transition flex items-center gap-1.5"
            >
              Ambassadors
            </a>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`${isRefreshing ? 'animate-spin-fast' : ''}`}>⟳</span>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/auth');
              }}
              className="text-[11px] font-bold text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-lg transition"
            >
              Sign Out
          </button>
          </div>
        </div>

        {/* ── Groq AI Quota ─────────────────────────────────── */}
        {(() => {
          const tpmPct =
            groqUsage?.tpm.limit != null && groqUsage.tpm.used != null
              ? (groqUsage.tpm.used / groqUsage.tpm.limit) * 100
              : null;
          const rpdPct =
            groqUsage?.rpd.limit != null && groqUsage.rpd.used != null
              ? (groqUsage.rpd.used / groqUsage.rpd.limit) * 100
              : null;
          const worstPct = Math.max(tpmPct ?? 0, rpdPct ?? 0);

          let statusText = 'Healthy';
          let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          if (!groqUsage) {
            statusText = 'Unavailable';
            statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          } else if (groqUsage.probeError) {
            statusText = 'Unreachable';
            statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          } else if (groqUsage.dailyTokens) {
            statusText = 'Daily cap hit';
            statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          } else if (worstPct >= 90) {
            statusText = 'Critical';
            statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          } else if (worstPct >= 70) {
            statusText = 'Getting tight';
            statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          }

          const dailyLimit = groqUsage?.dailyTokens?.limit ?? null;
          const dailyUsed = groqUsage?.dailyTokens?.used ?? null;

          return (
            <div className="bg-slate-950 border border-purple-500/20 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
 <h2 className="text-sm font-bold text-slate-200">Groq AI Quota</h2>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                    probe: {groqUsage?.model ?? '…'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadge}`}>
                    {loadingGroq ? 'Checking…' : statusText}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600">
                    {groqUsage?.probedAt
                      ? `updated ${new Date(groqUsage.probedAt).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}`
                      : ''}
                  </span>
                </div>
              </div>

              {loadingGroq ? (
                <div className="flex items-center justify-center py-6">
                  <LoadingSpinner size="sm" label="Probing Groq…" color="indigo" />
                </div>
              ) : !groqUsage ? (
                <div className="py-6 text-center text-xs text-slate-500 font-mono">
 Groq quota unavailable — check that the admin endpoint and GROQ_API_KEY are configured.
                </div>
              ) : groqUsage.probeError ? (
                <div className="py-6 text-center text-xs text-slate-500 font-mono">
 {groqUsage.probeError}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <QuotaGauge
                    label="Tokens / min"
                    used={groqUsage?.tpm.used ?? null}
                    limit={groqUsage?.tpm.limit ?? null}
                    unit="tok"
                    accent="bg-purple-500"
                  />
                  <QuotaGauge
                    label="Requests / day"
                    used={groqUsage?.rpd.used ?? null}
                    limit={groqUsage?.rpd.limit ?? null}
                    unit="req"
                    accent="bg-indigo-500"
                  />
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Daily tokens
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        {dailyUsed !== null && dailyLimit !== null
                          ? `${dailyUsed.toLocaleString()} / ${dailyLimit.toLocaleString()} tok`
                          : '—'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          dailyUsed !== null && dailyLimit !== null
                            ? dailyUsed / dailyLimit >= 0.9
                              ? 'bg-rose-500'
                              : dailyUsed / dailyLimit >= 0.7
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            : 'bg-slate-700/40'
                        }`}
                        style={{
                          width: `${
                            dailyUsed !== null && dailyLimit !== null
                              ? Math.min(100, (dailyUsed / dailyLimit) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] font-mono text-slate-600">
                      <span>
                        {groqUsage?.dailyTokens
                          ? 'live (from 429)'
                          : 'est. from activity'}
                      </span>
                      <span>
                        ~{((groqUsage?.activity.estimatedDailyTokens ?? 0) / 1000).toFixed(0)}k est.
                      </span>
                    </div>
                    <p className="mt-1.5 text-[8px] font-mono text-slate-600">
                      Exact daily usage appears here once Groq starts refusing requests (429).
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-mono text-slate-500">
                      <span className="bg-slate-900/50 px-2 py-1 rounded-md">
 {groqUsage?.activity.gradesToday ?? 0} grades today
                      </span>
                      <span className="bg-slate-900/50 px-2 py-1 rounded-md">
 {groqUsage?.activity.generationsToday ?? 0} generations today
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
            <div className="text-[9px] text-amber-400 font-mono mt-1">
              {loadingWaitlist ? '…' : (
                <span className="flex items-center gap-1">
                  <span>{waitlistThisWeek} this week</span>
                  <span className={`text-[8px] ${
                    waitlistGrowthRateNum > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    ({waitlistGrowthRate}% vs last week)
                  </span>
                </span>
              )}
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

        {/* ── Subject Goal Analytics ───────────────────── */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Subject Goals
            </h3>
            <span className="text-[9px] text-slate-600 font-mono">
              {usersWithGoals} users with goals set
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject split */}
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Subject Split</p>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" label="" color="indigo" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                    <span className="text-[11px] text-slate-400">SS Only</span>
                    <span className="text-xs font-black font-mono text-indigo-400">{subjectSplit.ssOnly}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                    <span className="text-[11px] text-slate-400">SS + Elective History</span>
                    <span className="text-xs font-black font-mono text-amber-400">{subjectSplit.elective}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                    <span className="text-[11px] text-slate-400">SS + Pure History</span>
                    <span className="text-xs font-black font-mono text-emerald-400">{subjectSplit.pure}</span>
                  </div>
                  {/* Bar */}
                  {subjectSplit.total > 0 && (
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-indigo-500/70 transition-all"
                        style={{ width: `${((subjectSplit.ssOnly / subjectSplit.total) * 100)}%` }}
                      />
                      <div
                        className="h-full bg-amber-500/70 transition-all"
                        style={{ width: `${((subjectSplit.elective / subjectSplit.total) * 100)}%` }}
                      />
                      <div
                        className="h-full bg-emerald-500/70 transition-all"
                        style={{ width: `${((subjectSplit.pure / subjectSplit.total) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SS Goal Distribution */}
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">SS Target Goals</p>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" label="" color="indigo" />
                </div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(ssGoalDistribution).length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic">No goals set</p>
                  ) : (
                    Object.entries(ssGoalDistribution)
                      .sort((a, b) => {
                        const order = ['Master', 'Expert', 'Scholar', 'Apprentice', 'Novice', 'Not set'];
                        return order.indexOf(a[0]) - order.indexOf(b[0]);
                      })
                      .map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between bg-slate-900/30 rounded-lg px-3 py-1.5">
                          <span className={`text-[10px] font-bold ${
                            level === 'Not set' ? 'text-slate-600' :
                            level === 'Master' ? 'text-emerald-400' :
                            level === 'Expert' ? 'text-purple-400' :
                            level === 'Scholar' ? 'text-indigo-400' :
                            level === 'Apprentice' ? 'text-amber-400' :
                            'text-slate-400'
                          }`}>{level}</span>
                          <span className="text-[10px] font-mono text-slate-500">{count}</span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>

            {/* History Goal Distribution */}
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">History Target Goals</p>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" label="" color="indigo" />
                </div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(historyGoalDistribution).length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic">No goals set</p>
                  ) : (
                    Object.entries(historyGoalDistribution)
                      .sort((a, b) => {
                        const order = ['Master', 'Expert', 'Scholar', 'Apprentice', 'Novice', 'Not set'];
                        return order.indexOf(a[0]) - order.indexOf(b[0]);
                      })
                      .map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between bg-slate-900/30 rounded-lg px-3 py-1.5">
                          <span className={`text-[10px] font-bold ${
                            level === 'Not set' ? 'text-slate-600' :
                            level === 'Master' ? 'text-emerald-400' :
                            level === 'Expert' ? 'text-purple-400' :
                            level === 'Scholar' ? 'text-indigo-400' :
                            level === 'Apprentice' ? 'text-amber-400' :
                            'text-slate-400'
                          }`}>{level}</span>
                          <span className="text-[10px] font-mono text-slate-500">{count}</span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* ── Waitlist Progress & Percentages ────────────── */}
        {!loadingWaitlist && waitlist.length > 0 && (
          <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Waitlist Progress
              </h3>
              <span className="text-[9px] text-slate-600 font-mono">
                {waitlistConversionPct}% converted to registered users
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subject breakdown */}
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                  By Subject Interest
                </p>
                <div className="space-y-2.5">
                  {Object.entries(waitlistSubjectCounts).length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic">No data</p>
                  ) : (
                    Object.entries(waitlistSubjectCounts).map(([subject, count]) => {
                      const pct = waitlistSubjectPercentages[subject] || '0.0';
                      const colorMap: Record<string, string> = {
                        'Social Studies': 'bg-indigo-500',
                        'History': 'bg-amber-500',
                        'Both': 'bg-emerald-500',
                      };
                      const textColorMap: Record<string, string> = {
                        'Social Studies': 'text-indigo-400',
                        'History': 'text-amber-400',
                        'Both': 'text-emerald-400',
                      };
                      const iconMap: Record<string, string> = {
                        'Social Studies': 'Guide',
                        'History': 'History',
                        'Both': 'Study',
                      };
                      return (
                        <div key={subject}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold ${textColorMap[subject] || 'text-slate-400'}`}>
                              {iconMap[subject] || '•'} {subject}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {count} <span className="text-[9px] text-slate-600">({pct}%)</span>
                            </span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colorMap[subject] || 'bg-slate-600'} transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* Total bar */}
                <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400">Total</span>
                  <span className="text-[10px] font-black font-mono text-white">{waitlist.length}</span>
                </div>
              </div>

              {/* Conversion metrics */}
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                  Conversion Funnel
                </p>
                <div className="space-y-3">
                  <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Waitlist → User</p>
                    <p className="text-xl font-black font-mono text-amber-400 mt-1">{waitlistConversionPct}%</p>
                    <p className="text-[9px] text-slate-600 font-mono mt-0.5">
                      {profiles.length} registered · {waitlist.length} waitlisted
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Weekly Growth</p>
                    <p className={`text-xl font-black font-mono mt-1 ${
                      waitlistGrowthRateNum > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {waitlistGrowthRate}%
                    </p>
                    <p className="text-[9px] text-slate-600 font-mono mt-0.5">
                      {waitlistThisWeek} signups this week
                    </p>
                  </div>
                  {/* Funnel bar */}
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500/70 rounded-l-full transition-all"
                      style={{ width: `${Math.min(parseFloat(waitlistConversionPct), 100)}%` }}
                    />
                    <div
                      className={`h-full bg-slate-700/50 transition-all ${
                        parseFloat(waitlistConversionPct) >= 100 ? '' : 'rounded-r-full'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* This week's signups vs last week */}
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                  This Week vs Last Week
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] text-slate-400">This Week</span>
                    <span className="text-xs font-black font-mono text-amber-400">{waitlistThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] text-slate-400">Growth Rate</span>
                    <span className={`text-xs font-black font-mono ${
                      waitlistGrowthRateNum > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>{waitlistGrowthRate}%</span>
                  </div>
                  <div className="bg-slate-900/30 rounded-xl p-3">
                    <p className="text-[9px] text-slate-600 font-mono text-center leading-relaxed">
                      {waitlistGrowthRateNum === Infinity
 ? `Waitlist exploded from zero — ${waitlistThisWeek} signups this week!`
                        : waitlistGrowthRateNum > 0
                        ? `Waitlist is growing ${waitlistGrowthRate}% week-over-week. Keep driving traffic!`
                        : waitlistGrowthRateNum < 0
                        ? `Waitlist declined ${waitlistGrowthRate}% this week. Consider promotions.`
                        : 'Waitlist is steady week-over-week.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Beta Trial Funnel ──────────────────────────── */}
        <div className="bg-slate-950 border border-cyan-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
 <h2 className="text-sm font-bold text-slate-200">Beta Trial Funnel</h2>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
 3 free tries → waitlist unlock
              </span>
            </div>
            <button
              onClick={() =>
                csvDownload(
                  trialRows.map((r) => ({
                    Name: r.name,
                    Email: r.email,
                    'Tries Used': String(r.trial_tries_used || 0),
                    Status: r.unlocked ? 'Unlocked (7d)' : r.trial_tries_used >= 3 ? 'At Limit' : 'Trying',
                    'Unlock Expiry': r.unlockExpiry ? new Date(r.unlockExpiry).toLocaleDateString('en-SG') : '—',
                  })),
                  'trial-funnel',
                )
              }
              className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-lg hover:bg-cyan-500/20 transition whitespace-nowrap"
            >
                CSV
            </button>
          </div>

          {/* KPI tiles */}
          <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-900">
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Users Unlocked</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{loadingMetrics ? '…' : trialUnlockedCount}</p>
 <p className="text-[8px] text-slate-600 font-mono mt-0.5">joined waitlist → 7 days</p>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">At 3-Try Limit</p>
              <p className="text-xl font-black text-rose-400 mt-1">{loadingMetrics ? '…' : trialAtLimitCount}</p>
              <p className="text-[8px] text-slate-600 font-mono mt-0.5">waiting on the gate</p>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Avg Tries Used</p>
              <p className="text-xl font-black text-cyan-400 mt-1">{loadingMetrics ? '…' : trialAvgTries}</p>
              <p className="text-[8px] text-slate-600 font-mono mt-0.5">across all signed-in users</p>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-3 text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Unlock Rate</p>
              <p className="text-xl font-black text-amber-400 mt-1">
                {loadingMetrics ? '…' : skillMetrics.length > 0 ? `${Math.round((trialUnlockedCount / skillMetrics.length) * 100)}%` : '—'}
              </p>
              <p className="text-[8px] text-slate-600 font-mono mt-0.5">of signed-in users</p>
            </div>
          </div>

          {/* Tries distribution bar */}
          {!loadingMetrics && skillMetrics.length > 0 && (
            <div className="px-5 py-4 border-b border-slate-900">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Tries Used Distribution</p>
              <div className="flex items-end gap-2 h-16">
                {Object.entries(trialTriesDistribution).map(([tries, count]) => (
                  <div key={tries} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400">{count}</span>
                    <div
                      className={`w-full rounded-t ${tries === '3+' ? 'bg-rose-500/60' : 'bg-cyan-500/60'} transition-all`}
                      style={{ height: `${Math.max(4, (count / Math.max(1, skillMetrics.length)) * 100)}%` }}
                    />
                    <span className="text-[8px] font-mono text-slate-600">{tries} try{tries === '1' ? '' : 's'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-user trial table */}
          <div className="overflow-x-auto">
            {loadingMetrics ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner size="sm" label="Loading trial data..." color="indigo" />
              </div>
            ) : trialRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No signed-in users yet — the trial funnel fills in as users generate papers.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Tries Used</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Unlock Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {trialRows.slice(0, 50).map((row) => (
                    <tr key={row.user_id} className="hover:bg-slate-900/20 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{row.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{row.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${(row.trial_tries_used || 0) >= 3 && !row.unlocked ? 'text-rose-400' : 'text-slate-300'}`}>
                            {(row.trial_tries_used || 0)}/3
                          </span>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${(row.trial_tries_used || 0) >= 3 && !row.unlocked ? 'bg-rose-500' : 'bg-cyan-500'}`}
                              style={{ width: `${Math.min(100, ((row.trial_tries_used || 0) / 3) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.unlocked
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : (row.trial_tries_used || 0) >= 3
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
 {row.unlocked ? '✓ Unlocked' : (row.trial_tries_used || 0) >= 3 ? 'At Limit' : 'Trying'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        {row.unlockExpiry
                          ? new Date(row.unlockExpiry).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Charts row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daily Waitlist Signups
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
                Daily Essay Submissions
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
              <h2 className="text-sm font-bold text-slate-200">Beta Waitlist</h2>
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
                className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg hover:bg-amber-500/20 transition whitespace-nowrap"
              >
                CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingWaitlist ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner size="sm" label="Loading waitlist..." color="amber" />
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

        {/* ── Testimonials ─────────────────────────────── */}
        <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-200">Testimonials</h2>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                {testimonials.length} submissions
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-emerald-900/30 px-2 py-0.5 rounded-full">
                {testimonials.filter((t: FeedbackRow) => t.testimonial_approved).length} approved
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search testimonials..."
                value={testimonialSearch}
                onChange={(e) => setTestimonialSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 w-48"
              />
              <button
                onClick={() =>
                  csvDownload(
                    testimonials.map((t) => ({
                      Email: t.user_email || 'anonymous',
                      Rating: extractRating(t).toString(),
                      Quote: extractQuote(t).replace(/\n/g, ' '),
                      Approved: (t as any).testimonial_approved ? 'Yes' : 'No',
                      Date: new Date(t.created_at).toLocaleDateString('en-SG'),
                    })),
                    'testimonials',
                  )
                }
                className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg hover:bg-emerald-500/20 transition whitespace-nowrap"
              >
                CSV
              </button>
            </div>
          </div>

          {/* KPI mini row */}
          <div className="px-5 py-3 border-b border-slate-900 grid grid-cols-3 gap-4">
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Avg Rating</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {testimonials.length > 0
                  ? (testimonials.reduce((sum, t) => sum + extractRating(t), 0) / testimonials.length).toFixed(1)
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Stars</div>
              <div className="text-lg font-black text-indigo-400 mt-0.5">
                {testimonials.reduce((sum, t) => sum + extractRating(t), 0)}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Approved Rate</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                {testimonials.length > 0
                  ? `${Math.round((testimonials.filter((t: FeedbackRow) => t.testimonial_approved).length / testimonials.length) * 100)}%`
                  : '—'}
              </div>
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="p-4 sm:p-5">
            {loadingTestimonials ? (
              <div className="py-8 flex items-center justify-center">
                <LoadingSpinner size="sm" label="Loading testimonials..." color="emerald" />
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                {testimonialSearch
                  ? 'No testimonials match your search.'
                  : 'No testimonials collected yet. Ask users to rate after their scans!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredTestimonials.map((t: FeedbackRow) => {
                  const rating = extractRating(t);
                  const name = extractName(t);
                  const label = extractRatingLabel(t);
                  const feedbackText = extractFeedback(t);
                  const hasFeedback = feedbackText.length > 0;
                  const isApproved = t.testimonial_approved === true;
                  return (
                    <div
                      key={t.id}
                      className={`rounded-xl border p-4 flex flex-col transition-all ${
                        isApproved
                          ? 'bg-emerald-950/20 border-emerald-800/40'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                            isApproved
                              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {(name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isApproved ? 'text-slate-200' : 'text-slate-400'}`}>
                              {name || 'Anonymous'}
                            </p>
                            <p className="text-[9px] text-slate-600 font-mono truncate">
                              {t.user_email || ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {renderStars(rating)}
                        </div>
                      </div>

                      {/* Rating label */}
                      {label && (
                        <p className={`text-[10px] font-bold italic mb-2 ${
                          isApproved ? 'text-amber-400/80' : 'text-slate-500'
                        }`}>
                          &ldquo;{label}&rdquo;
                        </p>
                      )}

                      {/* Feedback text */}
                      {hasFeedback && (
                        <div className={`flex-1 rounded-lg p-2.5 text-[10px] leading-relaxed ${
                          isApproved
                            ? 'bg-slate-900/50 text-slate-400 border border-slate-800/60'
                            : 'bg-slate-900/30 text-slate-500 border border-slate-800/40'
                        }`}>
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Feedback
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed">{feedbackText}</p>
                        </div>
                      )}

                      {/* No feedback placeholder */}
                      {!hasFeedback && (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-[9px] text-slate-700 italic">No written feedback</p>
                        </div>
                      )}

                      {/* Footer actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900">
                        <div className="flex items-center gap-1.5">
                          {/* Approve toggle */}
                          <button
                            onClick={() => handleToggleApproval(t.id, isApproved)}
                            disabled={approvingId === t.id}
                            className={`text-[9px] font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                              isApproved
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            {approvingId === t.id ? (
                              <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin-fast" />
                            ) : isApproved ? (
                              '✓ Approved'
                            ) : (
                              'Approve'
                            )}
                          </button>
                          {/* Date */}
                          <span className="text-[8px] text-slate-700 font-mono">
                            {new Date(t.created_at).toLocaleDateString('en-SG', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        {/* Copy feedback */}
                        <button
                          onClick={() => handleCopyQuote(feedbackText || label || '', t.id)}
                          className="text-[9px] text-slate-600 hover:text-indigo-400 transition"
                        >
                          {copiedId === t.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Feedback Viewer ──────────────────────────── */}
        <div className="bg-slate-950 border border-rose-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-200">User Feedback</h2>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                {feedback.length} submissions
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search feedback..."
                value={feedbackSearch}
                onChange={(e) => setFeedbackSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50 w-48"
              />
              <button
                onClick={() =>
                  csvDownload(
                    feedback.map((f) => ({
                      Email: f.user_email || 'anonymous',
                      Type: f.feedback_type,
                      Description: f.description.replace(/\n/g, '\\n'),
                      Date: new Date(f.created_at).toLocaleDateString('en-SG'),
                    })),
                    'user-feedback',
                  )
                }
                className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg hover:bg-rose-500/20 transition whitespace-nowrap"
              >
                CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingFeedback ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner size="sm" label="Loading feedback..." color="rose" />
              </div>
            ) : feedback.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No feedback submissions yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {feedback
                    .filter(
                      (f) =>
                        (f.user_email || '').toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                        f.feedback_type.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                        f.description.toLowerCase().includes(feedbackSearch.toLowerCase()),
                    )
                    .map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-900/20 transition">
                        <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString('en-SG', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4 font-medium text-slate-200">{entry.user_email || 'anonymous'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.feedback_type === 'Bug'
                                ? 'bg-rose-500/10 text-rose-400'
                                : entry.feedback_type === 'Feature Request'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : entry.feedback_type === 'Compliment'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-indigo-500/10 text-indigo-400'
                            }`}
                          >
                            {entry.feedback_type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 max-w-md truncate">{entry.description}</td>
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
              <h2 className="text-sm font-bold text-slate-200">User Registry</h2>
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
              <div className="flex gap-2">
              <button
                onClick={() =>
                  csvDownload(
                    essays.map((e) => ({
                      ID: e.id,
                      Date: new Date(e.created_at).toLocaleDateString('en-SG'),
                      Subject: e.subject || '',
                      Score: e.score_estimate,
                    })),
                    'essay-evaluations',
                  )
                }
                className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg hover:bg-emerald-500/20 transition whitespace-nowrap"
                title="Export evaluations CSV"
              >
                Essays CSV
              </button>
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
                className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 rounded-lg hover:bg-indigo-500/20 transition whitespace-nowrap"
              >
                CSV
              </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner size="sm" label="Loading user data..." color="indigo" />
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
        <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-6">
          <LoadingSpinner size="lg" label="Loading Platform Insights..." color="indigo" />
        </div>
      }
    >
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
