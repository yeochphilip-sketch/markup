'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        // Redirecting Google sign-ins straight to the dashboard workspace
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // NEW SIGN UP FLOW
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.session) {
          await supabase.auth.setSession(data.session);
        }
        setMessage('Registration successful! Sending to plans...');
        setTimeout(() => {
          router.push('/pricing');
          router.refresh();
        }, 1000);
        
      } else {
        // RETURNING USER LOGIN FLOW
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data?.session) {
          await supabase.auth.setSession(data.session);
        }
        // Logs in straight to the dashboard workspace
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            {isSignUp ? 'Create your O-Level Humanities training account' : 'Sign in to your diagnostic platform workspace'}
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition text-sm shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex flex-col space-y-4 pt-2 border-t border-slate-900">
          <form onSubmit={handleEmailAuth} className="flex flex-col space-y-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500"
              required 
            />
            <input 
              type="password" 
              placeholder="Choose a secure password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500"
              required 
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50"
            >
              {isLoading ? 'Processing security layer...' : isSignUp ? 'Continue with Email' : 'Log In'}
            </button>
          </form>

          {message && (
            <p className="text-[11px] text-center text-indigo-400 font-mono bg-indigo-950/20 py-2 rounded-lg border border-indigo-900/20">{message}</p>
          )}

          <div className="text-center pt-2">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
              className="text-xs text-slate-400 hover:text-indigo-400 underline underline-offset-4 transition"
            >
              {isSignUp ? 'If you have an account, log in' : "Don't have an account? Sign up here"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}