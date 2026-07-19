'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

type TierId = 'free' | 'scholar_pass' | 'expert_pass';

interface Tier {
  id: TierId;
  name: string;
  audience: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  accent: 'slate' | 'indigo' | 'amber';
}

const TIERS: Tier[] = [
  {
    id: 'expert_pass',
    name: 'Expert Pass',
    audience: 'Dedicated Students',
    price: '19.99',
    cadence: '/ month',
    description:
      'Maximum firepower for students aiming for A1 — priority grading, advanced diagnostics, and early feature access.',
    features: [
      'Everything in Scholar Pass',
      'Priority low-latency grading routing',
      'Advanced analytics & skill diagnostics',
      'Priority SEAB syllabus prompt updates',
      'Early access to new question formats & features',
    ],
    cta: 'Go Expert →',
    badge: 'Premium',
    accent: 'amber',
  },
  {
    id: 'scholar_pass',
    name: 'Scholar Pass',
    audience: 'Serious Students',
    price: '9.99',
    cadence: '/ month',
    description:
      'Unlock the full toolkit for self-driven practice. Unlimited papers, deeper analytics, and the complete essay bank.',
    features: [
      'Everything in Free',
      'Unlimited AI-generated practice papers',
      'Full LORMS grading with PEEL highlights',
      'Complete practice log archive with search',
      'Full essay exemplar bank access',
      'All achievements, leaderboards & badges',
      'Cancel anytime, no lock-in',
    ],
    cta: 'Go Scholar →',
    badge: 'Most Popular',
    accent: 'indigo',
  },
  {
    id: 'free',
    name: 'Free',
    audience: 'Getting Started',
    price: '0',
    cadence: '/ month',
    description:
      'Everything you need to try AI-powered O-Level Humanities practice — no commitment, no credit card.',
    features: [
      'AI-generated practice papers',
      'Standard LORMS grading with feedback',
      'Basic practice log & history',
      'XP tracking & daily streaks',
      'Access to achievement badges',
    ],
    cta: 'Start Free — No Card Needed',
    accent: 'slate',
  },
];

const ACCENT_MAP = {
  slate: {
    border: 'border-slate-700/40',
    shadow: 'shadow-slate-950/30',
    bg: 'bg-slate-600',
    bgHover: 'hover:bg-slate-500',
    badgeBg: 'bg-slate-500/15 text-slate-300',
    badgeBorder: 'border-slate-600/30',
    ring: 'ring-slate-500/30',
    text: 'text-slate-300',
    gradient: 'from-slate-500/40 to-slate-600/40',
  },
  indigo: {
    border: 'border-indigo-500/40',
    shadow: 'shadow-indigo-950/30',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-500',
    badgeBg: 'bg-indigo-500/15 text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    ring: 'ring-indigo-500/30',
    text: 'text-indigo-300',
    gradient: 'from-indigo-500/40 to-purple-500/40',
  },
  amber: {
    border: 'border-amber-500/40',
    shadow: 'shadow-amber-950/30',
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-300',
    badgeBorder: 'border-amber-500/30',
    ring: 'ring-amber-500/30',
    text: 'text-amber-300',
    gradient: 'from-amber-500/40 to-orange-500/40',
  },
} as const;

// ════════════════════════════════════════════════════════════
//  Feature matrix for comparison table
// ════════════════════════════════════════════════════════════
interface FeatureRow {
  label: string;
  free: string | boolean;
  scholar: string | boolean;
  expert: string | boolean;
}

const FEATURE_MATRIX: FeatureRow[] = [
  { label: 'AI-generated practice papers', free: 'Limited', scholar: 'Unlimited', expert: 'Unlimited' },
  { label: 'Standard LORMS grading', free: true, scholar: true, expert: true },
  { label: 'Full PEEL highlight grading', free: false, scholar: true, expert: true },
  { label: 'Practice log & history', free: 'Basic', scholar: 'Full archive', expert: 'Full archive' },
  { label: 'Essay exemplar bank', free: false, scholar: true, expert: true },
  { label: 'XP tracking & streaks', free: true, scholar: true, expert: true },
  { label: 'Achievements & leaderboards', free: 'Basic', scholar: 'Full', expert: 'Full' },
  { label: 'Advanced skill diagnostics', free: false, scholar: false, expert: true },
  { label: 'Priority low-latency grading', free: false, scholar: false, expert: true },
  { label: 'Priority SEAB syllabus updates', free: false, scholar: false, expert: true },
  { label: 'Early access to new features', free: false, scholar: false, expert: true },
  { label: 'Cancel anytime', free: true, scholar: true, expert: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <span className="text-emerald-400 text-sm font-bold">✓</span>;
  if (value === false) return <span className="text-slate-700 text-sm">—</span>;
  return <span className="text-[11px] text-slate-400 font-medium">{value}</span>;
}

// ════════════════════════════════════════════════════════════
//  FAQ data
// ════════════════════════════════════════════════════════════
interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'What happens when the beta ends?',
    a: 'Beta users keep their accounts and progress. You will be grandfathered into a discounted lifetime rate — the exact details will be announced before payments go live. You will have at least 30 days notice before any charges begin.',
  },
  {
    q: 'Can I switch between plans?',
    a: 'Yes. You can upgrade or downgrade at any time. If you upgrade mid-cycle, you are charged a prorated difference. If you downgrade, the new rate applies at the next billing period.',
  },
  {
    q: 'Is there a free tier forever?',
    a: 'Yes. The Free tier stays free forever. It includes a limited number of practice papers per month, standard grading, and basic progress tracking — enough to get a feel for the platform.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We use Stripe as our payment processor, so all major credit and debit cards are accepted (Visa, Mastercard, Amex). You will be billed in Singapore Dollars (SGD).',
  },
  {
    q: 'Can I get a refund?',
    a: 'If you are not satisfied within the first 7 days of your first paid subscription, email us and we will issue a full refund, no questions asked.',
  },
  {
    q: 'How do beta lifetime discounts work?',
    a: 'Anyone who signs up and uses MARKUP during the beta period will receive a preferential rate locked in for life. This applies whether you stay on the Free tier or upgrade to a paid plan — your discount percentage is permanent.',
  },
];

// ════════════════════════════════════════════════════════════
//  Component
// ════════════════════════════════════════════════════════════
export default function PricingPage() {
  const router = useRouter();
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<TierId | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [waitlistDiscount, setWaitlistDiscount] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load user session (for checkout buttons)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setCurrentEmail(session.user.email || null);
        // Fetch waitlist discount
        supabase
          .from('user_profiles')
          .select('waitlist_discount')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.waitlist_discount) setWaitlistDiscount(data.waitlist_discount);
          }, () => {
            /* Column may not exist yet — default to 0 */
          });
      }
      setSessionLoaded(true);
    });
  }, []);

  const handleCheckout = async (tier: TierId) => {
    if (tier === 'free') {
      router.push('/auth');
      return;
    }
    if (!currentUserId) {
      router.push('/auth?redirect=/pricing');
      return;
    }
    setCheckoutLoading(tier);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          userId: currentUserId,
          email: currentEmail,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data.error);
        setCheckoutLoading(null);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutLoading(null);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistStatus('submitting');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, name: '', subject: 'Both' }),
      });
      if (!res.ok) throw new Error('Failed');
      setWaitlistStatus('success');
      setWaitlistEmail('');
    } catch {
      setWaitlistStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* ════════════════════════════════════════════════════
            HERO BANNER — Free During Beta
        ════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-950/80 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/50 border border-emerald-900/50 px-3 py-1 rounded-full">
              🎓 Free for Students During Beta
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Everything is{' '}
              <span className="text-emerald-400">free</span> right now.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              No credit card needed. No payment setup. Every single feature on MARKUP
              is <strong className="text-emerald-400">completely free</strong> during beta.{' '}
              These planned pricing tiers are for reference — you only pay when we launch
              (and beta users get lifetime discounts).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => router.push('/')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
              >
                Start Free Practice →
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-8 py-3 rounded-xl text-sm transition border border-slate-700"
              >
                Already have an account? Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            PLANNED PRICING — Tier Cards
        ════════════════════════════════════════════════════ */}
        <div className="text-center">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
            Planned Pricing (subject to change)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TIERS.map((tier) => {
            const accent = ACCENT_MAP[tier.accent];
            return (
              <div
                key={tier.id}
                className={`relative bg-slate-950/80 border ${accent.border} rounded-2xl p-6 flex flex-col justify-between transition shadow-xl ${accent.shadow} ${
                  tier.badge === 'Most Popular'
                    ? 'ring-2 ring-indigo-500/30 scale-[1.02] md:scale-105 z-10'
                    : ''
                }`}
              >
                {tier.badge && (
                  <span
                    className={`absolute -top-2.5 right-4 ${accent.bg} text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider`}
                  >
                    {tier.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">
                      {tier.name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {tier.audience}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1.5 ${accent.badgeBg} border ${accent.badgeBorder} text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full`}>
                      S$
                    </div>
                    <div className="flex items-baseline text-slate-100 font-mono">
                      <span className={`text-4xl font-black tracking-tight ${tier.id === 'free' ? 'text-slate-300' : 'text-white'}`}>
                        {tier.price}
                      </span>
                      <span className="text-slate-500 text-[11px] ml-1 font-bold">
                        {tier.cadence}
                      </span>
                    </div>
                    {tier.id !== 'free' && (
                      <p className="text-[10px] text-slate-600 italic pt-1">
                        Per month, cancel anytime
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[3rem]">
                    {tier.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <span className={`mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black ${accent.bg}/20 ${accent.text} border ${accent.badgeBorder} shrink-0`}>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-4 border-t border-slate-900/60 text-center">
                  {tier.id === 'free' ? (
                    <button
                      onClick={() => router.push('/auth')}
                      className={`w-full ${accent.bg} ${accent.bgHover} text-white font-bold py-2.5 rounded-xl text-xs transition`}
                    >
                      {tier.cta}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(tier.id)}
                      disabled={checkoutLoading === tier.id || !sessionLoaded}
                      className={`w-full ${accent.bg} ${accent.bgHover} text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {checkoutLoading === tier.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                          Redirecting...
                        </>
                      ) : !sessionLoaded ? (
                        'Loading...'
                      ) : !currentUserId ? (
                        'Sign In to Subscribe'
                      ) : (
                        tier.cta
                      )}
                    </button>
                  )}
                  {waitlistDiscount > 0 && tier.id !== 'free' && (
                    <p className="text-[9px] text-emerald-400 font-bold mt-2">
                      🎉 {waitlistDiscount}% off — waitlist discount applied
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════
            FEATURE COMPARISON TABLE
        ════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
              Feature Comparison
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-4">
              See exactly what you get at each tier.
            </h3>
          </div>

          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-0 border-b border-slate-900 bg-slate-900/40">
              <div className="p-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Feature</div>
              <div className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-amber-400">Expert Pass</div>
              <div className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-indigo-400">Scholar Pass</div>
              <div className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-500">Free</div>
            </div>

            {/* Table rows */}
            {FEATURE_MATRIX.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-0 border-b border-slate-900/50 ${
                  i % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/20'
                }`}
              >
                <div className="p-3 text-[11px] text-slate-300 font-medium">{row.label}</div>
                <div className="p-3 text-center"><FeatureCell value={row.expert} /></div>
                <div className="p-3 text-center"><FeatureCell value={row.scholar} /></div>
                <div className="p-3 text-center"><FeatureCell value={row.free} /></div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-600 text-center mt-3 italic">
            All features available for free during beta. Checkmarks reflect planned post-beta access.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════
            FAQ SECTION
        ════════════════════════════════════════════════════ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/50 border border-emerald-900/50 px-3 py-1 rounded-full">
              FAQ
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-4">
              Got questions? We have answers.
            </h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-950/80 border border-slate-900 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-bold text-slate-200">{faq.q}</span>
                  <span className={`text-slate-500 text-lg transition-transform duration-200 ${
                    openFaqIndex === i ? 'rotate-45' : ''
                  }`}>
                    +
                  </span>
                </button>
                {openFaqIndex === i && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            PAYMENT LAUNCH WAITLIST
        ════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-950/80 to-indigo-950/80 border border-amber-500/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-amber-400 tracking-widest uppercase bg-amber-950/50 border border-amber-900/50 px-3 py-1 rounded-full">
              🔔 Stay in the Loop
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Get notified when payments launch.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We will email you when the Scholar Pass and Expert Pass go live. Beta users who sign up now
              get <strong className="text-amber-400">lifetime discounted pricing</strong>.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                disabled={waitlistStatus === 'submitting' || waitlistStatus === 'success'}
                className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs font-medium p-3 rounded-xl focus:outline-none focus:border-amber-500/50 transition placeholder:text-slate-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={waitlistStatus === 'submitting' || waitlistStatus === 'success'}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl text-xs transition disabled:opacity-50 whitespace-nowrap"
              >
                {waitlistStatus === 'submitting' ? 'Sending...' :
                 waitlistStatus === 'success' ? '✓ You are on the list!' :
                 'Notify Me'}
              </button>
            </form>
            {waitlistStatus === 'error' && (
              <p className="text-[10px] text-red-400">Something went wrong. Please try again.</p>
            )}
            {waitlistStatus === 'success' && (
              <p className="text-[10px] text-emerald-400">We will let you know when payments go live!</p>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════ */}
        <div className="text-center space-y-3">
          <p className="text-[10px] text-slate-600 italic font-mono">
            Everything is free during beta. Pricing will be announced when we launch payments.
          </p>
          <div className="flex items-center justify-center gap-6 text-[9px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Upgrade anytime
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> No lock-in contracts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Beta users get lifetime discount
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
