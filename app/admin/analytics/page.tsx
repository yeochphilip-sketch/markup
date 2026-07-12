'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

// Secured UUID Anchor
const ADMIN_UUID = '815ac133-d392-4fbf-b6eb-a4f903705731';

interface ProfileRow {
  id: string;
  full_name: string;
  email_address: string;
  selected_plan: 'Premium Pro' | 'Basic Core' | 'Free';
  billing_rate: number;
  account_status: string;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function verifyAndStream() {
      try {
        // 🔒 Step 3: Server-side Identity check using dynamic token verification
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user || user.id !== ADMIN_UUID) {
          // Kick any unauthorized peers straight back to the safe dashboard route
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);

        // Fetch live rows from Supabase now that identity is established
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, email_address, selected_plan, billing_rate, account_status')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setProfiles(data as ProfileRow[]);
      } catch (err) {
        console.error('Security verification error:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    verifyAndStream();
  }, [router]);

  // Loading indicator for authorization validation phase
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-500 font-mono flex items-center justify-center text-xs">
        Verifying Security Layer Authentication Tokens...
      </div>
    );
  }

  // Compute live aggregates from your automated data collection matrices
  const totalRevenue = profiles.reduce((sum, item) => sum + Number(item.billing_rate || 0), 0);
  const premiumCount = profiles.filter(p => p.selected_plan === 'Premium Pro').length;
  const conversionRate = profiles.length > 0 ? ((premiumCount / profiles.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Summary Row */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-indigo-400 tracking-tight">Platform Insights</h1>
            <p className="text-xs text-slate-400 mt-1">Live data streams pulling users, tiers, and subscription allocations from your SQL database</p>
          </div>
          <a href="/dashboard" className="text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition">
            ← Return to Dashboard
          </a>
        </div>

        {/* Dynamic Metric Display Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Total Registered Users</div>
            <div className="text-3xl font-black text-white mt-2">{loading ? '...' : profiles.length}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">Live DB Headcount</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue</div>
            <div className="text-3xl font-black text-indigo-400 mt-2">${loading ? '...' : totalRevenue}</div>
            <div className="text-[10px] text-indigo-500 font-mono mt-1">Active billing allocations</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Premium Ratio</div>
            <div className="text-3xl font-black text-white mt-2">{loading ? '...' : `${conversionRate}%`}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Premium Pro adoption matrix</div>
          </div>
        </div>

        {/* Live Database Data Table */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-900">
            <h2 className="text-sm font-bold text-slate-200">Active Account Master Registry</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono animate-pulse">Syncing encrypted data rows...</div>
            ) : profiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">No registered profiles detected in table tracking logs.</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Assigned Plan</th>
                    <th className="p-4">Billing Rate</th>
                    <th className="p-4">Gateway Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{profile.full_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{profile.email_address || 'hidden-auth-node'}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-300">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          profile.selected_plan === 'Premium Pro' ? 'bg-indigo-500/10 text-indigo-400' :
                          profile.selected_plan === 'Basic Core' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {profile.selected_plan}
                        </span>
                      </td>
                      <td className="p-4 text-indigo-400 font-mono font-bold">${profile.billing_rate}/mo</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          profile.account_status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
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