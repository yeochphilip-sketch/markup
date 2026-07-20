'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Ambassador {
  id: string;
  full_name: string | null;
  email_address: string | null;
  referral_code: string | null;
  referral_count: number | null;
  subscription_tier: string;
  selected_plan: string;
  updated_at: string;
}

export default function AdminAmbassadorsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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
      await fetchAmbassadors();
      setLoading(false);
    }
    bootstrap();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const res = await fetch('/api/admin/promote-ambassador');
      if (res.ok) {
        const data = await res.json();
        setAmbassadors(data.ambassadors ?? []);
      }
    } catch {
      // silent
    }
  };

  const handlePromote = async () => {
    if (!promoteEmail.trim()) return;
    setPromoting(true);
    setMessage(null);

    try {
      // First lookup the user
      const lookupRes = await fetch('/api/admin/promote-ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', email: promoteEmail.trim() }),
      });

      if (!lookupRes.ok) {
        const err = await lookupRes.json();
        setMessage({ type: 'error', text: err.error || 'User not found' });
        setPromoting(false);
        return;
      }

      const { user } = await lookupRes.json();

      // Promote to ambassador
      const promoteRes = await fetch('/api/admin/promote-ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote', userId: user.id }),
      });

      if (promoteRes.ok) {
        const data = await promoteRes.json();
        setMessage({
          type: 'success',
          text: `✅ ${user.full_name || user.email_address} is now an ambassador! Referral code: ${data.ambassador?.referral_code || 'N/A'}`,
        });
        setPromoteEmail('');
        await fetchAmbassadors();
      } else {
        const err = await promoteRes.json();
        setMessage({ type: 'error', text: err.error || 'Failed to promote' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setPromoting(false);
    }
  };

  const handleDemote = async (ambassador: Ambassador) => {
    setMessage(null);
    try {
      const res = await fetch('/api/admin/promote-ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demote', userId: ambassador.id }),
      });

      if (res.ok) {
        setMessage({ type: 'info', text: `Demoted ${ambassador.full_name || ambassador.email_address} to free tier.` });
        await fetchAmbassadors();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to demote' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'info', text: 'Referral link copied!' });
    setTimeout(() => setMessage(null), 2000);
  };

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
              🤝 Ambassador Program
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage influencers who promote MARKUP — they get free premium access + earn XP for referrals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/analytics"
              className="text-[11px] font-bold text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-lg transition"
            >
              ← Back to Insights
            </a>
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

        {/* Promote user form */}
        <div className="bg-slate-950 border border-indigo-500/20 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-200 mb-4">✨ Promote a User to Ambassador</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="Enter user's email address..."
              className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handlePromote}
              disabled={promoting || !promoteEmail.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {promoting ? (
                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin-fast" /> Promoting...</>
              ) : '🚀 Promote to Ambassador'}
            </button>
          </div>
          <p className="text-[9px] text-slate-600 mt-2">
            The user gets free premium access automatically. Their existing referral code is used — just share their link with them.
          </p>

          {message && (
            <div className={`mt-3 px-3 py-2 rounded-xl text-[10px] font-medium ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : message.type === 'error'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Current ambassadors table */}
        <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-200">👑 Current Ambassadors</h2>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                {ambassadors.length} ambassador{ambassadors.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={fetchAmbassadors}
              className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition"
            >
              ⟳ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <LoadingSpinner size="sm" label="Loading ambassadors..." color="emerald" />
            </div>
          ) : ambassadors.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">🤝</p>
              <p className="text-xs text-slate-500 font-mono">No ambassadors yet. Promote your first user above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Referral Code</th>
                    <th className="p-4">Signups</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {ambassadors.map((a) => {
                    const referralLink = a.referral_code
                      ? `https://markup-five.vercel.app?ref=${a.referral_code}`
                      : '';
                    return (
                      <tr key={a.id} className="hover:bg-slate-900/20 transition">
                        <td className="p-4 font-medium text-slate-200">
                          {a.full_name || '—'}
                        </td>
                        <td className="p-4 text-slate-400">{a.email_address || '—'}</td>
                        <td className="p-4">
                          {a.referral_code ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-400 tracking-wider">
                                {a.referral_code}
                              </span>
                              <button
                                onClick={() => copyToClipboard(referralLink)}
                                className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded transition"
                              >
                                📋 Copy Link
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-emerald-400">
                            {a.referral_count ?? 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Ambassador
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDemote(a)}
                            className="text-[9px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-1 rounded transition"
                          >
                            Demote
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">📖 How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] text-slate-400 leading-relaxed">
            <div className="bg-slate-900/40 rounded-xl p-3">
              <span className="text-lg block mb-1">1️⃣</span>
              <strong className="text-indigo-400">Promote</strong> — Enter the influencer&apos;s email above and promote them to ambassador.
              They get free premium access (Scholar Pass equivalent).
            </div>
            <div className="bg-slate-900/40 rounded-xl p-3">
              <span className="text-lg block mb-1">2️⃣</span>
              <strong className="text-indigo-400">Share</strong> — Copy their referral link and send it to them. They share it with their
              audience: <code className="text-emerald-400 font-mono">markup.app?ref=CODE</code>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-3">
              <span className="text-lg block mb-1">3️⃣</span>
              <strong className="text-indigo-400">Track</strong> — See how many signups each ambassador drives. They earn XP
              for each referral (and you get free marketing!).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
