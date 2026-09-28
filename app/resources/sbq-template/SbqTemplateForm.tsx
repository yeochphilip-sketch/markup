'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SbqTemplateForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: '', subject: 'Both' }),
      });
      const data = await res.json();
      // An "already on the waitlist" response is a success too.
      if (!res.ok && !(data.message && data.message.includes('already'))) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Check your connection and try again.');
    }
  };

  return (
    <div className="no-print bg-indigo-950/70 border border-indigo-800/40 rounded-2xl p-6">
      {status === 'success' ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
 Reward
          </div>
          <div>
            <p className="text-lg font-black text-white">You&apos;re on the list!</p>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              The printable is ready below — hit <strong className="text-emerald-400">Print / Save as PDF</strong>.
              You&apos;ve also unlocked <strong className="text-emerald-400">7 days of unlimited AI-graded practice</strong> — no credit card needed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/25"
            >
 Print / Save as PDF
            </button>
            <Link
              href="/dashboard"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/25"
            >
 Start Free Practice →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
 <span className="text-2xl shrink-0">Download</span>
            <div>
              <p className="text-sm font-black text-white">Get the printable + 7 days of free AI-graded practice</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Enter your email to save this template as a PDF and join the waitlist for free unlimited
                practice (no credit card). We&apos;ll only email you about your access.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu.sg"
              disabled={status === 'submitting'}
              className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs font-medium p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition placeholder-slate-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'submitting' || !email.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {status === 'submitting' ? (
                <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" /> Sending...</>
 ) : 'Get the Free Template →'}
            </button>
          </div>
          {status === 'error' && message && (
            <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/40 border border-rose-900/40 rounded-lg px-3 py-2">
 {message}
            </p>
          )}
          <p className="text-[9px] text-slate-600">
 No spam. One email when your access is ready. You can also just print the template below right now.
          </p>
        </form>
      )}
    </div>
  );
}
