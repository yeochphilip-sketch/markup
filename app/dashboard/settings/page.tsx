'use client';

import Link from 'next/link';

export default function SettingsView() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Account Parameters</h1>
            <p className="text-xs text-slate-400 mt-0.5">Configure your active student membership attributes.</p>
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition">
            ← Return
          </Link>
        </div>

        {/* Plan Configuration Widget */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Tier Assignment</span>
              <p className="text-base font-bold text-white mt-0.5">Freemium Access Tracker</p>
            </div>
            <span className="bg-slate-900 text-slate-400 text-[10px] px-2.5 py-1 rounded font-bold uppercase border border-slate-800">
              Standard Account
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are currently running on the complimentary basic tier, restricted to 3 active daily analysis operations. 
          </p>
          <div className="pt-2">
            <Link href="/pricing" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
              Upgrade Subscription
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
