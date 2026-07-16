'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setMessage('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const _start = Date.now();
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsSuccess(true);
      setMessage('Password updated successfully!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      const _elapsed = Date.now() - _start;
      if (_elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - _elapsed));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col space-y-5 sm:space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            {isSuccess ? 'Password updated!' : 'Set a new password for your account'}
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <p className="text-sm text-emerald-400 font-bold">{message}</p>
            <p className="text-[10px] text-slate-500">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">New Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                required
                minLength={6}
              />
            </div>

            {message && (
              <p className="text-[11px] text-center text-rose-400 font-mono bg-rose-950/20 py-2 rounded-lg border border-rose-900/20">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
              )}
              {isLoading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link
            href="/auth"
            className="text-xs text-slate-400 hover:text-indigo-400 underline underline-offset-4 transition"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
