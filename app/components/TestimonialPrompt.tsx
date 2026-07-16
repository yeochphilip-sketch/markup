'use client';

import { useState, useEffect, useCallback } from 'react';

interface TestimonialPromptProps {
  isOpen: boolean;
  isGuest: boolean;
  userName?: string;
  userEmail?: string;
  onClose: () => void;
}

const LS_KEY_SUBMITTED = 'markup_testimonial_submitted';
const LS_KEY_DISMISSED = 'markup_testimonial_dismissed';
const LS_KEY_SCAN_COUNT = 'markup_testimonial_scan_count';

/** Read scan count from localStorage (default 0) */
function getScanCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(LS_KEY_SCAN_COUNT) || '0', 10);
}

/** Increment scan counter in localStorage */
export function recordCompletedScan(): void {
  if (typeof window === 'undefined') return;
  const count = getScanCount() + 1;
  localStorage.setItem(LS_KEY_SCAN_COUNT, String(count));
}

/** Should we show the testimonial prompt? — only after 2nd+ scan, and never if dismissed/submitted */
export function shouldShowTestimonial(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(LS_KEY_SUBMITTED)) return false;
  if (localStorage.getItem(LS_KEY_DISMISSED)) return false;
  const count = getScanCount();
  return count >= 2;
}

/** User doesn't want to be asked again */
function dismissForever(): void {
  localStorage.setItem(LS_KEY_DISMISSED, 'true');
}

/** Mark as submitted */
function markSubmitted(): void {
  localStorage.setItem(LS_KEY_SUBMITTED, 'true');
}

/** Reset (for testing) */
export function resetTestimonialState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_KEY_SUBMITTED);
  localStorage.removeItem(LS_KEY_DISMISSED);
  localStorage.removeItem(LS_KEY_SCAN_COUNT);
}

const STARS = [1, 2, 3, 4, 5];
const STAR_LABELS: Record<number, string> = {
  1: 'Needs Work',
  2: 'Getting There',
  3: 'Good',
  4: 'Great!',
  5: 'Amazing!',
};

export default function TestimonialPrompt({
  isOpen,
  isGuest,
  userName,
  userEmail,
  onClose,
}: TestimonialPromptProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredStar(0);
      setFeedback('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (rating === 0) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: null, // anonymous is fine
          userEmail: userEmail || '',
          feedbackType: 'Testimonial',
          description: `⭐ ${rating}/5 — ${STAR_LABELS[rating]}${feedback ? `\n\n${feedback}` : ''}${userName ? `\n\n— ${userName}` : ''}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      markSubmitted();
      setStatus('success');
      setTimeout(() => onClose(), 2000);
    } catch {
      setStatus('error');
      setErrorMsg('Could not send. Please try again.');
    }
  }, [rating, feedback, userName, userEmail, onClose]);

  const handleDismiss = useCallback(() => {
    dismissForever();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {status === 'success' ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">🎉</div>
            <h3 className="text-lg font-black text-emerald-400">Thank You!</h3>
            <p className="text-xs text-slate-400">Your feedback helps make MARKUP better for everyone.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">How was your practice?</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Your feedback helps us improve</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition text-xs"
              >
                ✕
              </button>
            </div>

            {/* Star Rating */}
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-1.5">
                {STARS.map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className={`text-2xl transition-all duration-150 ${
                      star <= (hoveredStar || rating)
                        ? 'text-amber-400 scale-110'
                        : 'text-slate-700 hover:text-amber-400/50'
                    }`}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-[11px] font-bold text-amber-400 animate-in fade-in duration-200">
                  {STAR_LABELS[rating]}
                </p>
              )}
            </div>

            {/* Optional text feedback */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Care to share more? <span className="text-slate-700">(optional)</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={isGuest ? 'Tell us what you liked...' : 'What skill did you improve? What feature helped most?...'}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none font-sans resize-none placeholder-slate-600 focus:border-indigo-500/50 transition"
                maxLength={500}
              />
              <p className="text-right text-[8px] text-slate-600">{feedback.length}/500</p>
            </div>

            {/* Guest mode upsell */}
            {isGuest && (
              <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-indigo-300">
                  💡 Sign up free to save your progress and unlock streaks &amp; achievements!
                </p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <p className="text-[10px] text-red-400 text-center">{errorMsg}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || status === 'submitting'}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                    Sending...
                  </>
                ) : rating > 0 ? (
                  'Submit Feedback'
                ) : (
                  'Tap a star to rate'
                )}
              </button>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDismiss}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline underline-offset-4 transition"
                >
                  Don't ask again
                </button>
                <button
                  onClick={onClose}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline underline-offset-4 transition"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
