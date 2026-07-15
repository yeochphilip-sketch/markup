'use client';

import { useRouter } from 'next/navigation';

type TierId = 'student_monthly' | 'student_academic' | 'tuition_cohort';

interface Tier {
  id: TierId;
  name: string;
  audience: string;
  cadence: string;
  betaLabel: string;
  betaPrice: string;
  betaCadence: string;
  regularPrice: string;
  regularCadence: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  accent: 'indigo' | 'emerald' | 'amber';
}

const TIERS: Tier[] = [
  {
    id: 'student_monthly',
    name: 'Student Monthly',
    audience: 'Individual Students',
    cadence: 'Per month',
    betaLabel: 'Beta',
    betaPrice: '12',
    betaCadence: '/ month',
    regularPrice: '29',
    regularCadence: '/ month',
    description:
      'Lightweight subscription for self-driven students who just want unlimited AI marking every week.',
    features: [
      'Unlimited AI question generation',
      'Instant multi-canvas grading scans (SBCS / SEQ / SRQ)',
      'LORMS band review with PEEL highlights',
      'Practise log archive with revisable history',
      'Cancel anytime, no lock-in',
    ],
    cta: 'Start Student Monthly',
    accent: 'indigo',
  },
  {
    id: 'student_academic',
    name: 'Student Academic Pass',
    audience: 'Individual Students',
    cadence: 'One-time payment',
    betaLabel: 'Beta',
    betaPrice: '48',
    betaCadence: 'flat',
    regularPrice: '120',
    regularCadence: 'flat',
    description:
      'Pay once, get the full premium suite until the O-Level / End-of-Year written exam window closes.',
    features: [
      'Everything in Student Monthly',
      'Full premium access until the final written exams',
      'Unlock the complete exemplar essay bank',
      'Priority access to SEAB syllabus prompt updates',
      'One-off payment — no recurring billing',
    ],
    cta: 'Lock In Academic Pass',
    badge: 'Best Value',
    accent: 'emerald',
  },
  {
    id: 'tuition_cohort',
    name: 'Tuition Cohort Pass',
    audience: 'Centres / Tutors (up to 15 students)',
    cadence: 'Per month',
    betaLabel: 'Beta',
    betaPrice: '89',
    betaCadence: '/ month',
    regularPrice: '249',
    regularCadence: '/ month',
    description:
      'Shared workspace for tuition centres to run cohort-based diagnostics across multiple students.',
    features: [
      'Up to 15 seats under one centre account',
      'Administrative dashboard for tutor oversight',
      'LORMS distribution charts across the cohort',
      'Cohort-level diagnostic tracking & exports',
      'Priority low-latency routing during peak hours',
    ],
    cta: 'Provision Cohort Pass',
    badge: 'For Centres',
    accent: 'amber',
  },
];

const ACCENT_MAP = {
  indigo: {
    border: 'border-indigo-500/40',
    shadow: 'shadow-indigo-950/30',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-500',
    badgeBg: 'bg-indigo-500/15 text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    ring: 'ring-indigo-500/30',
  },
  emerald: {
    border: 'border-emerald-500/40',
    shadow: 'shadow-emerald-950/30',
    bg: 'bg-emerald-500',
    bgHover: 'hover:bg-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    ring: 'ring-emerald-500/30',
  },
  amber: {
    border: 'border-amber-500/40',
    shadow: 'shadow-amber-950/30',
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-300',
    badgeBorder: 'border-amber-500/30',
    ring: 'ring-amber-500/30',
  },
} as const;

export default function PricingPage() {
  const router = useRouter();

  const handleChoosePlan = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-950/80 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
              🚧 Payments — Coming Soon
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              We are building something{' '}
              <span className="text-indigo-400">better</span>.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Full payment plans and checkout are being wired up. In the meantime,
              all features are <strong className="text-emerald-400">free to use</strong> during beta.
              Join the waitlist to lock in early-bird pricing when we launch.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => router.push('/#pricing')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
              >
                ← Back to Waitlist
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-8 py-3 rounded-xl text-sm transition border border-slate-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Tier cards — visually shown but disabled */}
        <div className="text-center">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
            Planned Pricing (subject to change)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-60 select-none">
          {TIERS.map((tier) => {
            const accent = ACCENT_MAP[tier.accent];
            return (
              <div
                key={tier.id}
                className={`relative bg-slate-950/80 border ${accent.border} rounded-2xl p-6 flex flex-col justify-between transition shadow-xl ${accent.shadow}`}
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
                      Beta Price · S$
                    </div>
                    <div className="flex items-baseline text-slate-100 font-mono">
                      <span className="text-3xl font-black tracking-tight">
                        {tier.betaPrice}
                      </span>
                      <span className="text-slate-500 text-[11px] ml-1 font-bold">
                        {tier.betaCadence}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[9px] font-black tracking-widest uppercase text-slate-600">
                        Post-Beta
                      </span>
                      <span className="text-slate-500 text-[11px] font-mono line-through">
                        S${tier.regularPrice}
                        {tier.regularCadence}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic pt-1">
                      {tier.cadence}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-900/60 text-center">
                  <span className="text-[10px] text-slate-600 font-mono italic">Coming with Stripe checkout</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[10px] text-slate-600 italic font-mono">
          Everything is free during beta. Pricing will be announced when we launch payments.
        </div>
      </div>
    </div>
  );
}
