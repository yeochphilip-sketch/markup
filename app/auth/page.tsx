'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        alert('Verification email dispatched! Check your inbox to confirm your registration.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // 🛠️ CRITICAL STEP 2 FIX: Sync cookies directly into browser storage handles
        if (data?.session) {
          await supabase.auth.setSession(data.session);
          
          // Force Next.js Layout elements to read the freshly active cookie state map
          router.refresh(); 
          
          // Switch route smoothly over to workspace console
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      alert(err.message || 'An unexpected verification error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-md shadow-2xl">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-widest text-indigo-500 font-mono">MARKUP</h1>
          <p className="text-xs text-slate-500 font-medium">
            {isSignUp ? 'Create your analytical study space profile' : 'Sign in to access your essay workspace diagnostics'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 p-3 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 p-3 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 mt-2 tracking-wide shadow-lg shadow-indigo-950/40"
          >
            {loading ? 'Processing Workspace Check...' : isSignUp ? 'Create Account' : 'Authenticate Console'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-900/60 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-slate-500 hover:text-indigo-400 font-medium transition underline underline-offset-4 decoration-slate-800 hover:decoration-indigo-500"
          >
            {isSignUp ? 'Already own an account profile? Log In' : "Don't have a practice account yet? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
