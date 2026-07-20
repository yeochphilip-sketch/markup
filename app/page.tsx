'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';


function HeroCTA() {
  return (
    <div className="flex flex-col items-center gap-4">        <Link
        href={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ref') ? `/dashboard?ref=${new URLSearchParams(window.location.search).get('ref')}` : '/dashboard'}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
      >
        Start Practicing Now
        <span className="text-xl">→</span>
      </Link>
      <p className="text-[11px] text-slate-500">
        Free to use. Sign up takes 30 seconds. No credit card needed.
      </p>
      <div className="flex items-center gap-6 text-xs text-slate-600">
        <span>🧠 AI-generated O-Level papers</span>
        <span>📊 Instant LORMS grading</span>
        <span>⚡ Takes 30 seconds</span>
      </div>
    </div>
  );
}

// Sample result cards for the rotating display
const SAMPLE_CARDS = [
  {
    scoreEstimate: 'L4/6',
    confidence: 0.88,
    subject: 'Social Studies',
    topic: 'Issue 1: Exploring Citizenship and Governance',
    skill: 'SBQ: Comparison & Contrast (AO2)',
    xpEarned: 120,
    levelTitle: 'Scholar',
    masteryPoints: 3400,
    streakDays: 12,
    critiqueCount: 34,
  },
  {
    scoreEstimate: 'L2/6 → L4/6',
    confidence: 0.82,
    subject: 'Elective History',
    topic: 'Case Study: Nazi Germany',
    skill: 'SBQ: Reliability & Cross-Referencing (AO3)',
    xpEarned: 95,
    levelTitle: 'Apprentice',
    masteryPoints: 1200,
    streakDays: 5,
    critiqueCount: 18,
  },
  {
    scoreEstimate: 'A1',
    confidence: 0.93,
    subject: 'Social Studies',
    topic: 'Issue 2: Living in a Diverse Society',
    skill: 'SRQ/SEQ: Structured Essay Explanations (AO1)',
    xpEarned: 200,
    levelTitle: 'Expert',
    masteryPoints: 6200,
    streakDays: 21,
    critiqueCount: 56,
  },
];

export default function LandingPage() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [stats, setStats] = useState<{ totalUsers: number | null; totalEvaluations: number | null; totalXp: number | null; avgStreak: number | null } | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [waitlistDiscount, setWaitlistDiscount] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Read ?ref= from URL (referral code)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) setReferralCode(ref);
    }

    // Fetch waitlist count + aggregate stats in parallel
    fetch('/api/waitlist/count')
      .then(r => r.json())
      .then(d => setWaitlistCount(d.count))
      .catch(() => {});
    
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  // Load user session (for checkout buttons)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setCurrentEmail(session.user.email || null);
        // Gracefully handle missing column (e.g. pre-migration)
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

  const handleCheckout = async (tier: string) => {
    if (!currentUserId) {
      window.location.href = '/auth';
      return;
    }
    setCheckoutLoading(tier);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, userId: currentUserId, email: currentEmail }),
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

  // Auto-rotate sample cards every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentCardIndex(prev => (prev + 1) % SAMPLE_CARDS.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const card = SAMPLE_CARDS[currentCardIndex];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl sm:text-2xl font-black text-indigo-500 tracking-tighter">MARKUP</h1>
        <div className="flex items-center gap-3 sm:gap-8 text-sm font-bold text-slate-400">
          {/* Desktop nav links - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-4 sm:gap-6">
            <Link href="#how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="#testimonials" className="hover:text-white transition">Testimonials</Link>
            <Link href="#blog" className="hover:text-white transition">Tips</Link>
            <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
          </div>
          <Link href={referralCode ? `/auth?ref=${referralCode}` : '/auth'} className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 whitespace-nowrap text-xs sm:text-sm">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
          🎓 Beta — Free for All Students
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Master the <span className="text-indigo-500">O-Level</span> Humanities with AI.
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          The only Source-Based Case Study simulator designed specifically for the Singapore SEAB Social Studies and History syllabus. Scan essays, get LORMS grades, and climb to A1.
        </p>

        {/* Direct CTA — no auth required */}
        <HeroCTA />
      </section>

      {/* Social proof counters — with real aggregate stats */}
      <div className="-mt-4 mb-10">
        <div className="flex items-center justify-center gap-6 sm:gap-10 text-center flex-wrap">
          {stats?.totalUsers !== null && stats?.totalUsers !== undefined ? (
            <>
              <div>
                <p className="text-xl font-black text-indigo-400 font-mono">{stats!.totalUsers!.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Students Onboard</p>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            </>
          ) : waitlistCount !== null ? (
            <>
              <div>
                <p className="text-xl font-black text-indigo-400 font-mono">{waitlistCount.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Students Onboard</p>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            </>
          ) : null}
          {stats?.totalEvaluations !== null && stats?.totalEvaluations !== undefined && (
            <>
              <div>
                <p className="text-xl font-black text-emerald-400 font-mono">{stats!.totalEvaluations!.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Papers Graded</p>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            </>
          )}
          <div>
            <p className="text-xl font-black text-amber-400 font-mono">SEAB</p>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Syllabus-Aligned</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-20 bg-slate-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
              How It Works
            </span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
              From prompt to A1 in three steps.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
                🧠
              </div>
              <h4 className="text-lg font-black text-white mb-2">1. Generate a Practice Paper</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pick your subject (Social Studies or Elective History), choose a topic and skill,
                and MARKUP instantly generates a complete O-Level paper with sources, provenance,
                and section-based prompts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
                ✍️
              </div>
              <h4 className="text-lg font-black text-white mb-2">2. Write Your Answers</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Type your SBCS, SEQ, and SRQ answers directly into the canvas. Use the built-in
                timer to simulate exam conditions. PEEL structure templates are one click away.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
                📊
              </div>
              <h4 className="text-lg font-black text-white mb-2">3. Get LORMS Grading</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan all three sections simultaneously. Receive a LORMS band estimate,
                diagnostic critique, and highlighted segment feedback — exactly like the
                actual SEAB marking rubric.
              </p>
            </div>
          </div>

          {/* Live Sample Result Cards — replaces static screenshot */}
          <div className="mt-16 max-w-md mx-auto">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                See what MARKUP produces
              </span>
            </div>
            <div className="transition-all duration-500 hover:scale-[1.02]">
              <div className="bg-[#0a0a1a] border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black tracking-widest text-indigo-500 uppercase">MARKUP</span>
                  <span className="text-[8px] font-mono text-slate-600">Real student result</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-3" />
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.subject}</p>
                  <p className="text-[8px] text-slate-600 mt-0.5">{card.skill}</p>
                  <div className="bg-slate-900/70 rounded-2xl px-6 py-3 border border-slate-800 mt-3 transition-all duration-700">
                    <p className="text-3xl font-black text-indigo-400 tracking-tight">{card.scoreEstimate}</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${card.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold font-mono text-emerald-400">
                      {(card.confidence * 100).toFixed(0)}% confident
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-slate-900/50 rounded-xl p-2 text-center">
                      <p className="text-[7px] text-slate-500 uppercase">Level</p>
                      <p className="text-xs font-black font-mono text-indigo-400">{card.levelTitle}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-2 text-center">
                      <p className="text-[7px] text-slate-500 uppercase">Total XP</p>
                      <p className="text-xs font-black font-mono text-amber-400">{card.masteryPoints}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-2 text-center">
                      <p className="text-[7px] text-slate-500 uppercase">Diagnostics</p>
                      <p className="text-xs font-black font-mono text-emerald-400">{card.critiqueCount}</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 text-[9px] text-slate-600 font-mono mt-3">
                    <span>🔥 {card.streakDays}d streak</span>
                    <span>📝 {card.critiqueCount} papers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-4">
              {SAMPLE_CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentCardIndex(i);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(() => {
                      setCurrentCardIndex(prev => (prev + 1) % SAMPLE_CARDS.length);
                    }, 4000);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentCardIndex
                      ? 'bg-indigo-500 w-4'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-2">
              Real student examples — grades auto-rotate every 4 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
              Testimonials
            </span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
              What early users are saying.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 — Jun Sheng */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-400">
                  J
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Jun Sheng</p>
                  <p className="text-[10px] text-slate-500">Sec 3 Student · SS/Geo</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 italic">
                &ldquo;The good points have really helped me with Social Studies. The notes are filled with useful ideas and relevant examples, so I don&rsquo;t have to spend ages thinking of what to write. Everything is explained clearly, making the topics much easier to understand. I also like how the points flow naturally from one to the next, which makes it easier to build my answers in a logical way. Instead of struggling to come up with arguments, I can focus on explaining and evaluating them. This website has made answering both structured and essay questions much faster, and I feel much more confident when writing my answers.&rdquo;
              </p>
              <div className="mt-4 text-amber-400 text-sm">★★★★★</div>
            </div>                {/* Testimonial 2 */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-sm font-black text-emerald-400">
                  S
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Priya</p>
                  <p className="text-[10px] text-slate-500">Sec 4 Student · Social Studies</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 italic">
                &ldquo;I was struggling with SBQ reliability questions. The AI gave me specific feedback on every paragraph I wrote, not just a generic grade. My teacher noticed the improvement within a month. I went from C5 to B3 in my prelims.&rdquo;
              </p>
              <div className="mt-4 text-amber-400 text-sm">★★★★★</div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-sm font-black text-amber-400">
                  M
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Ms. Tan</p>
                  <p className="text-[10px] text-slate-500">Tutor · Former MOE Teacher</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 italic">
                &ldquo;I use MARKUP with all my students. The LORMS-aligned grading gives them feedback that mirrors exactly what SEAB examiners look for. It has saved me hours of marking time and my students can practice every day without waiting for me.&rdquo;
              </p>
              <div className="mt-4 text-amber-400 text-sm">★★★★★</div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => {
                window.location.href = referralCode ? `/auth?ref=${referralCode}` : '/auth';
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition"
            >
              Join and be the next story →
            </button>
          </div>
        </div>
      </section>

      {/* Blog / Tips Section */}
      <section id="blog" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/50 border border-emerald-900/50 px-3 py-1 rounded-full">
              📝 Tips & Guides
            </span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
              Learn how to ace your Humanities.
            </h3>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3">
              Study strategies, SBQ techniques, essay frameworks, and exam tips — all from experienced educators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">                {/* Blog Post 1 */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 opacity-60">
              <div className="h-36 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 flex items-center justify-center text-5xl">
                📖
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[8px] text-slate-600 font-mono">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
                  <span>Coming soon</span>
                </div>
                <h4 className="text-sm font-black text-slate-400">
                  How to Ace SBQ Comparison Questions
                </h4>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  The SBQ comparison question is one of the most predictable parts of the paper. Learn the 3-step framework that top students use to consistently score L4/6.
                </p>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 opacity-60">
              <div className="h-36 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 flex items-center justify-center text-5xl">
                ✍️
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[8px] text-slate-600 font-mono">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Essay Tips</span>
                  <span>Coming soon</span>
                </div>
                <h4 className="text-sm font-black text-slate-400">
                  The PEEL Framework: Structuring A1 Essays
                </h4>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Point, Evidence, Explanation, Link — master the structure that examiners look for. We break down each component with real SS and History examples.
                </p>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 opacity-60">
              <div className="h-36 bg-gradient-to-br from-amber-900/40 to-slate-900/40 flex items-center justify-center text-5xl">
                🧠
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[8px] text-slate-600 font-mono">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Study Strategy</span>
                  <span>Coming soon</span>
                </div>
                <h4 className="text-sm font-black text-slate-400">
                  How to Use AI Practice Tools Effectively
                </h4>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Don't just generate and grade mindlessly. Learn how top students use MARKUP to target weak skills, build streaks, and track their improvements over time.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href={referralCode ? `/auth?ref=${referralCode}` : '/auth'}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition"
            >
              Start practicing while you read →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section — free for students during beta */}
      <section id="pricing" className="px-6 py-20 bg-slate-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/50 border border-emerald-900/50 px-3 py-1 rounded-full">
              🎓 Free for Students During Beta
            </span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
              Everything is <span className="text-emerald-400">free</span> right now.
            </h3>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3">
              No credit card needed. No payment required. Just sign up and start climbing to A1.{' '}
              {waitlistCount !== null && (
                <span className="text-indigo-400 font-bold">
                  {waitlistCount.toLocaleString()} students already onboard.
                </span>
              )}
            </p>
            <Link
              href={referralCode ? `/auth?ref=${referralCode}` : '/auth'}
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
            >
              Start Practicing Now — Free
            </Link>
          </div>

          {/* What students get */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="text-sm font-black text-white">Unlimited Practice</h4>
              <p className="text-[10px] text-slate-500 mt-1">Generate as many O-Level papers as you want, on any topic</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="text-sm font-black text-white">Full LORMS Grading</h4>
              <p className="text-[10px] text-slate-500 mt-1">AI scans SBCS + SEQ + SRQ with SEAB rubric feedback</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="text-sm font-black text-white">Gamified Progress</h4>
              <p className="text-[10px] text-slate-500 mt-1">XP, streaks, achievements and leaderboards keep you going</p>
            </div>
          </div>

          {/* Planned tiers — purely informational */}
          <div className="text-center mb-8">
            <span className="text-[9px] font-black text-slate-600 tracking-widest uppercase">
              Post-Beta Plans (not required to use today)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-60">
            {/* Expert Pass */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-amber-950/20 relative">
              <span className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Premium</span>
              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wide">Expert Pass</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Dedicated Students</p>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">S$</span>
                  <div className="flex items-baseline text-slate-100 font-mono">
                    <span className="text-2xl font-black tracking-tight">19.99</span>
                    <span className="text-slate-500 text-[10px] ml-1 font-bold">/ month</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Priority grading, advanced diagnostics, early feature access — the full arsenal for A1.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900/60 text-center">
                <button
                  onClick={() => handleCheckout('expert_pass')}
                  disabled={checkoutLoading === 'expert_pass' || !sessionLoaded}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading === 'expert_pass' ? (
                    <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin-fast" /> Redirecting...</>
                  ) : !sessionLoaded ? 'Loading...' : !currentUserId ? 'Sign In to Subscribe' : 'Subscribe Now'}
                </button>
                {waitlistDiscount > 0 && (
                  <p className="text-[9px] text-emerald-400 font-bold mt-2 text-center">🎉 {waitlistDiscount}% off applied</p>
                )}
              </div>
            </div>

            {/* Scholar Pass */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-indigo-950/20 relative ring-2 ring-indigo-500/20 scale-[1.02] z-10">
              <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wide">Scholar Pass</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Serious Students</p>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">S$</span>
                  <div className="flex items-baseline text-slate-100 font-mono">
                    <span className="text-2xl font-black tracking-tight">9.99</span>
                    <span className="text-slate-500 text-[10px] ml-1 font-bold">/ month</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Unlimited papers, full PEEL grading, essay bank, leaderboards — unlock everything for self-driven practice.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900/60 text-center">
                <button
                  onClick={() => handleCheckout('scholar_pass')}
                  disabled={checkoutLoading === 'scholar_pass' || !sessionLoaded}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading === 'scholar_pass' ? (
                    <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin-fast" /> Redirecting...</>
                  ) : !sessionLoaded ? 'Loading...' : !currentUserId ? 'Sign In to Subscribe' : 'Subscribe Now'}
                </button>
                {waitlistDiscount > 0 && (
                  <p className="text-[9px] text-emerald-400 font-bold mt-2 text-center">🎉 {waitlistDiscount}% off applied</p>
                )}
              </div>
            </div>

            {/* Free */}
            <div className="bg-slate-950/80 border border-slate-700/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-slate-950/20">
              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wide">Free</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Getting Started</p>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-slate-500/15 text-slate-300 border border-slate-600/30 text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">S$</span>
                  <div className="flex items-baseline text-slate-100 font-mono">
                    <span className="text-2xl font-black tracking-tight text-slate-300">0</span>
                    <span className="text-slate-500 text-[10px] ml-1 font-bold">/ month</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  AI practice papers, LORMS grading, and basic progress tracking — everything to get started.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900/60 text-center">
                <a
                  href="/auth"
                  className="inline-block w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded-xl text-xs transition text-center"
                >
                  Start Free
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-[10px] text-slate-600 italic">
              All features free during beta. No payment info required. Sign up and start in 30 seconds.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-900 text-center space-y-4">
        <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
          © 2026 Markup Analytics • Singapore GCE O-Level Prep
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
          <Link href="/privacy" className="hover:text-indigo-400 transition underline underline-offset-4">
            Privacy Policy
          </Link>
          <span className="text-slate-800">·</span>
          <Link href="/terms" className="hover:text-indigo-400 transition underline underline-offset-4">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
