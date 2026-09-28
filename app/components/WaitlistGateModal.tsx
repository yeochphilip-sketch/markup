'use client';

import { useState } from 'react';
import { unlockTrial, formatUnlockDays } from '@/lib/trial-gate';

interface WaitlistGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the user completes the waitlist + feedback flow and gets unlocked */
  onUnlocked: () => void;
  /** Prefill the waitlist email if the user is signed in */
  userEmail?: string;
  userId?: string | null;
}

type Step = 'locked' | 'waitlist' | 'feedback' | 'success';

export default function WaitlistGateModal({
  isOpen,
  onClose,
  onUnlocked,
  userEmail,
  userId,
}: WaitlistGateModalProps) {
  const [step, setStep] = useState<Step>('locked');
  const [email, setEmail] = useState(userEmail || '');
  const [feedbackType, setFeedbackType] = useState('General');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockExpiry, setUnlockExpiry] = useState<number | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep('locked');
    setError(null);
    setFeedbackText('');
  };

  const handleClose = () => {
    // Once a user has exhausted their tries, closing just dismisses — they stay locked.
    reset();
    onClose();
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: '', subject: 'Both' }),
      });
      const data = await res.json();
      if (!res.ok && !(data.message && data.message.includes('already'))) {
        setError(data.error || 'Something went wrong joining the waitlist.');
        setIsSubmitting(false);
        return;
      }
      setStep('feedback');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    setError(null);
    // Feedback is optional — submit it if provided, then unlock regardless.
    if (feedbackText.trim()) {
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || null,
            userEmail: email.trim() || userEmail || undefined,
            feedbackType,
            description: feedbackText.trim(),
          }),
        });
      } catch {
        // Non-fatal — feedback is a nice-to-have
      }
    }
    if (userId) {
      // Signed-in: the dashboard persists the unlock server-side (waitlist-verified).
      // Don't set localStorage here — let the server confirm first.
      setStep('success');
      setIsSubmitting(false);
      return;
    }
    // Guest: unlock locally only.
    const state = unlockTrial();
    setUnlockExpiry(state.unlockExpiry);
    setStep('success');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-900 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
 Beta Access
            </span>
            <h3 className="text-lg font-black text-white mt-3 tracking-tight">
 {step === 'success' ? 'You&apos;re unlocked! ' : 'Your free tries are up'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Step: locked ── */}
        {step === 'locked' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
 Waiting
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">
                  You&apos;ve used your <span className="text-indigo-400">3 free practice papers</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Join the waitlist and share your feedback to unlock <strong className="text-emerald-400">7 more days of unlimited practice</strong> — free.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('waitlist')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]"
            >
 Unlock 7 More Days →
            </button>
            <button
              onClick={handleClose}
              className="w-full text-[11px] text-slate-500 hover:text-slate-300 transition font-bold py-1"
            >
              Maybe later
            </button>
          </div>
        )}

        {/* ── Step: waitlist ── */}
        {step === 'waitlist' && (
          <form onSubmit={handleJoinWaitlist} className="p-6 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              We&apos;re building the first AI O-Level Humanities simulator for Singapore students.
              Join the waitlist to <strong className="text-slate-200">unlock 7 more days of free practice</strong> and get early access to new features.
            </p>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!userId}
                readOnly={!!userId}
                placeholder="you@school.edu.sg"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder-slate-600 disabled:opacity-70 disabled:cursor-not-allowed"
              />
              {!!userId && (
                <p className="text-[8px] text-slate-600 mt-1">
 Using your account email — unlock is verified against it.
                </p>
              )}
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/40 border border-rose-900/40 rounded-lg px-3 py-2">
 {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" /> Joining...</>
              ) : 'Join Waitlist & Unlock'}
            </button>
            <button
              type="button"
              onClick={() => setStep('locked')}
              className="w-full text-[11px] text-slate-500 hover:text-slate-300 transition font-bold py-1"
            >
 ← Back
            </button>
          </form>
        )}

        {/* ── Step: feedback ── */}
        {step === 'feedback' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              ✓ You&apos;re on the waitlist! One last thing — <strong className="text-slate-200">what should we improve?</strong> Your feedback shapes the product.
            </p>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="General">General Review</option>
                <option value="AI Accuracy">AI Grading Accuracy</option>
                <option value="UI Suggestion">UX / Design</option>
                <option value="Bug">Bug / Crash</option>
                <option value="Content">Question / Topic Quality</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Feedback (optional)</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you love? What felt off? Anything you want before launch..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none placeholder-slate-600"
              />
            </div>
            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" /> Unlocking...</>
              ) : feedbackText.trim() ? 'Submit & Unlock' : 'Unlock Without Feedback'}
            </button>
          </div>
        )}

        {/* ── Step: success ── */}
        {step === 'success' && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30">
 Reward
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Welcome to the early crew!</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {unlockExpiry
                  ? <>You&apos;ve unlocked <strong className="text-emerald-400">unlimited practice for {formatUnlockDays(unlockExpiry)}</strong>.</>
                  : <>You&apos;ve unlocked <strong className="text-emerald-400">unlimited practice</strong>.</>}
              </p>
            </div>
            <button
              onClick={() => {
                reset();
                onUnlocked();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]"
            >
 Back to Practice →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
