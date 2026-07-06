'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  useEffect(() => {
    const target = searchParams.get('next');
    if (target === 'pricing') {
      setRedirectTo(`${window.location.origin}/pricing`);
    } else {
      setRedirectTo(`${window.location.origin}/dashboard`);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[400px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.05),_transparent_60%)] pointer-events-none" />
      
      <div className="w-full max-w-sm bg-slate-950/60 border border-slate-900 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative text-center space-y-6">
        <div className="flex justify-center">
          <svg className="w-8 h-8 text-indigo-500 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 80V25L45 55L70 25M70 25H50M70 25V45" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M65 55V80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Welcome to Markup</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticate securely to access your humanities workspace.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-slate-200 text-black font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2.5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.564-4.437 10.564-10.75 0-.724-.077-1.274-.173-1.68h-10.39z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
