'use client';

import { useEffect, useState, Suspense } from 'react';
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

function AnalyticsDashboardContent() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      // Session-level admin check – server middleware already enforces this
      // for the route, but we double-check on the client too.
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      // NOTE: NEXT_PUBLIC_ADMIN_EMAIL is exposed in the JS bundle, which is
      // acceptable here because it's not a secret — we are checking equality
      // with a known admin email purely for bootstrap. Never put STRIPE_SECRET
      // or any other secret under the NEXT_PUBLIC_ prefix.
      const adminFlag =
        user?.app_metadata?.is_admin === true ||
        user?.user_metadata?.is_admin === true ||
        user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!user || !adminFlag) {
        router.replace('/dashboard');
        return;
      }

      setIsAuthorized(true);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(
            'id, full_name, email_address, selected_plan, billing_rate, account_status, subscription_tier, is_admin',
          )
          .order('updated_at', { ascending: false });

        if (error) throw error;
        if (data) setProfiles(data as ProfileRow[]);
      } catch (err) {
        console.error('Error fetching analytics registry data:', err);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-500 font-mono flex items-center justify-center text-xs">
        Loading Secure Registry Profile Matrix…
      </div>
    );
  }

  const totalRevenue = profiles.reduce(
    (sum, item) => sum + Number(item.billing_rate || 0),
    0,
  );
  const premiumCount = profiles.filter(
    (p) =>
      p.subscription_tier === 'student_monthly' ||
      p.subscription_tier === 'student_academic' ||
      p.subscription_tier === 'tuition_cohort',
  ).length;
  const conversionRate =
    profiles.length > 0
      ? ((premiumCount / profiles.length) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-indigo-400 tracking-tight">
              Platform Insights
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live data streams pulling users, tiers, and subscription
              allocations from your SQL database
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

        {/* KPI tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">
              Total Registered Users
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {loading ? '…' : profiles.length}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">
              Live DB Headcount
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">
              Monthly Recurring Revenue
            </div>
            <div className="text-3xl font-black text-indigo-400 mt-2">
              S${loading ? '…' : totalRevenue.toFixed(2)}
            </div>
            <div className="text-[10px] text-indigo-500 font-mono mt-1">
              Active billing allocations
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">
              Paid Conversion Rate
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {loading ? '…' : `${conversionRate}%`}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Across all 3 paid tiers
            </div>
          </div>
        </div>

        {/* Registry table */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-900">
            <h2 className="text-sm font-bold text-slate-200">
              Active Account Master Registry
            </h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono animate-pulse">
                Syncing encrypted data rows…
              </div>
            ) : profiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No registered profiles detected in table tracking logs.
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
                  {profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="hover:bg-slate-900/20 transition"
                    >
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
