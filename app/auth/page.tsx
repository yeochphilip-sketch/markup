'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // MFA state
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaVerified, setMfaVerified] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const _start = Date.now();
    setIsLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setMessage('Check your email for a password reset link. It may take a few minutes.');
      setIsForgotPassword(false);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to send reset email. Try again.');
    } finally {
      const _elapsed = Date.now() - _start;
      if (_elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - _elapsed));
      setIsLoading(false);
    }
  };

  // ── Magic Link Login ──
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const _start = Date.now();
    setIsLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      setMessage('✅ Magic link sent! Check your email (and spam folder).');
      setIsMagicLink(false);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to send magic link.');
    } finally {
      const _elapsed = Date.now() - _start;
      if (_elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - _elapsed));
      setIsLoading(false);
    }
  };

  // ── MFA: Enroll TOTP ──
  const handleSetupMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setMfaFactorId(data.id);
      // data.totp.qr_code is a data URI (SVG QR code)
      setMfaQrCode(data.totp?.qr_code || '');
      setMfaSecret(data.totp?.secret || '');
      setShowMfaSetup(true);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to start MFA setup.');
    }
  };

  // ── MFA: Verify enrollment ──
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaVerifyCode.trim() || !mfaFactorId) return;
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaVerifyCode.trim(),
      });
      if (error) throw error;
      setMfaVerified(true);
      setShowMfaSetup(false);
      setMessage('✅ Two-factor authentication enabled successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Invalid code. Try again.');
    }
  };

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
    const _start = Date.now();
    setIsLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.user) {
          // Extract the username part from the email (e.g., "alex" from "alex@school.com")
          const fallbackName = email.split('@')[0];

          // 🚀 Manually seed their matching public profile tracking metrics row
          await supabase.from('user_profiles').insert([{
            id: data.user.id,
            full_name: fallbackName, // 🌟 Now dynamically uses their email prefix!
            email_address: email.toLowerCase().trim(),
            selected_plan: 'Free',
            billing_rate: 0,
            account_status: 'Active'
          }]);
        }
        
        setMessage('Welcome to MARKUP! Taking you to your dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
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
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'An error occurred during authentication.');
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

        {/* Magic Link Button */}
        <button
          onClick={() => { setIsMagicLink(true); setMessage(''); }}
          className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition text-xs"
        >
          ✉️ Send Magic Link
        </button>

        <div className="flex flex-col space-y-4 pt-2 border-t border-slate-900">
          {isMagicLink ? (
            <>
              <p className="text-[10px] text-slate-500 text-center">
                Enter your email and we&apos;ll send you a one-click login link. No password needed!
              </p>
              <form onSubmit={handleMagicLink} className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                      Sending...
                    </span>
                  ) : 'Send Magic Link'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMagicLink(false); setMessage(''); }}
                  className="text-xs text-slate-500 hover:text-indigo-400 underline underline-offset-4 transition"
                >
                  ← Back to Sign In
                </button>
              </form>

              {message && (
                <p className="text-[11px] text-center text-indigo-400 font-mono bg-indigo-950/20 py-2 rounded-lg border border-indigo-900/20">{message}</p>
              )}
            </>
          ) : isForgotPassword ? (
            <>
              <p className="text-[10px] text-slate-500 text-center">
                Enter your email and we&apos;ll send you a password reset link.
              </p>
              <form onSubmit={handleForgotPassword} className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setMessage(''); }}
                  className="text-xs text-slate-500 hover:text-indigo-400 underline underline-offset-4 transition"
                >
                  ← Back to Sign In
                </button>
              </form>

              {message && (
                <p className="text-[11px] text-center text-indigo-400 font-mono bg-indigo-950/20 py-2 rounded-lg border border-indigo-900/20">{message}</p>
              )}
            </>
          ) : showMfaSetup ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 text-center">🔐 Set Up Two-Factor Authentication</h3>
              {mfaQrCode ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-4 rounded-xl" dangerouslySetInnerHTML={{ __html: mfaQrCode }} />
                  <p className="text-[9px] text-slate-500 text-center max-w-xs">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
                    then enter the 6-digit code below.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-mono break-all">{mfaSecret}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Or manually enter this secret in your authenticator app.</p>
                </div>
              )}
              <form onSubmit={handleVerifyMfa} className="flex flex-col space-y-3">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={mfaVerifyCode}
                  onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 text-center tracking-[0.5em] font-mono font-bold focus:outline-none placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={mfaVerifyCode.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50"
                >
                  Verify & Enable 2FA
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMfaSetup(false); setMessage(''); }}
                  className="text-xs text-slate-500 hover:text-indigo-400 underline underline-offset-4 transition"
                >
                  ← Cancel
                </button>
              </form>
            </div>
          ) : (
            <>
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
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </span>
                  ) : isSignUp ? 'Continue with Email' : 'Log In'}
                </button>
              </form>

              {message && (
                <p className="text-[11px] text-center text-indigo-400 font-mono bg-indigo-950/20 py-2 rounded-lg border border-indigo-900/20">{message}</p>
              )}

              <div className="text-center space-y-2 pt-2">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
                  className="text-xs text-slate-400 hover:text-indigo-400 underline underline-offset-4 transition block w-full"
                >
                  {isSignUp ? 'If you have an account, log in' : "Don't have an account? Sign up here"}
                </button>
                <button
                  onClick={() => { setIsForgotPassword(true); setMessage(''); }}
                  className="block w-full text-xs text-slate-500 hover:text-indigo-400 underline underline-offset-4 transition"
                >
                  Forgot password?
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        setMessage('You need to sign in first before setting up 2FA.');
                        return;
                      }
                      await handleSetupMfa();
                    } catch {
                      setMessage('Please sign in to enable two-factor authentication.');
                    }
                  }}
                  className="block w-full text-xs text-slate-500 hover:text-emerald-400 underline underline-offset-4 transition"
                >
                  🔐 Enable Two-Factor Authentication (2FA)
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}