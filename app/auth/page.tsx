'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

function AuthContent() {
  const searchParams = useSearchParams();
  const [authRedirectUrl, setAuthRedirectUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      const callbackUrl = new URL('/auth/callback', currentOrigin);
      
      const target = searchParams.get('next');
      if (target === 'pricing') {
        callbackUrl.searchParams.set('next', '/pricing');
      } else {
        callbackUrl.searchParams.set('next', '/dashboard');
      }
      
      setAuthRedirectUrl(callbackUrl.toString());
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    if (!authRedirectUrl) return;
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authRedirectUrl, // Cleaner option layout passing TypeScript validation
      },
    });
  };

  return (
    <div className="w-full max-w-sm bg-slate-950/60 border border-slate-900 p-8 rounded-2xl shadow-2xl backdrop-blur-md text-center space-y-6">
      <div className="flex justify-center">
        <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 100 100" fill="none">
          <path d="M15 80V25L45 55L70 25M70 25H50M70 25V45" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M65 55V80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Welcome to Markup</h2>
        <p className="text-xs text-slate-400 mt-1">Authenticate securely to access your workspace.</p>
      </div>
      <button 
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-slate-200 text-black font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2.5 shadow-sm"
      >
        Continue with Google
      </button>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading authentication configurations...</div>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
