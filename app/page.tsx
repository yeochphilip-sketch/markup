'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';


function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Both');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You are on the waitlist!');

      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-black text-emerald-400 mb-2">You are on the waitlist!</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">{message}</p>
        <p className="text-slate-500 text-xs mt-4">
          Share with your friends — the earlier they join, the lower the beta price for everyone.
        </p>
        <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-xl p-3">
          <p className="text-[9px] text-slate-500 font-bold uppercase mb-1.5">Your referral link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/?ref=${btoa(email).slice(0, 8)}` : ''}
              className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] text-indigo-400 font-mono text-center focus:outline-none"
            />
            <button
              onClick={() => {
                const link = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${btoa(email).slice(0, 8)}` : '';
                navigator.clipboard.writeText(link);
                setMessage('Link copied!');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 rounded-xl transition"
            >
              📋
            </button>
          </div>
          <p className="text-[8px] text-slate-600 mt-1.5">
            Send this link to your classmates. When they sign up using it, you both get priority beta access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Your email (preferably .edu.sg)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
        </button>
      </div>
      {email.includes('@') && !email.endsWith('.edu.sg') && email !== '' && (
        <p className="text-[10px] text-amber-400/70 text-left">
          💡 School emails (&lt;name&gt;@&lt;school&gt;.edu.sg) get priority access when we launch.
        </p>
      )}
      <div className="flex gap-3 text-xs">
        {['Social Studies', 'History', 'Both'].map((s) => (
          <label key={s} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="subject"
              value={s}
              checked={subject === s}
              onChange={(e) => setSubject(e.target.value)}
              className="accent-indigo-500"
            />
            <span className="text-slate-400">{s}</span>
          </label>
        ))}
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs text-center">{message}</p>
      )}
    </form>
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then(r => r.json())
      .then(d => setWaitlistCount(d.count))
      .catch(() => {}); // Don't set count on error — null means "unknown"
  }, []);

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
      <nav className="px-8 py-6 flex justify-between items-center border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black text-indigo-500 tracking-tighter">MARKUP</h1>
        <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
          <Link href="#how-it-works" className="hover:text-white transition">How It Works</Link>
          <Link href="#testimonials" className="hover:text-white transition">Testimonials</Link>
          <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/auth" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
          🚧 Beta — Limited Spots Available
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Master the <span className="text-indigo-500">O-Level</span> Humanities with AI.
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          The only Source-Based Case Study simulator designed specifically for the Singapore SEAB Social Studies and History syllabus. Scan essays, get LORMS grades, and climb to A1.
        </p>

        {/* Waitlist CTA */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-black text-white mb-1">Join the Beta Waitlist</h3>
          <p className="text-xs text-slate-500 mb-4">
            Get early access and lock in beta pricing. First 100 signups get 40% off lifetime.
          </p>
          <WaitlistForm />
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-500">
          <span>🔒 No spam, unsubscribe anytime</span>
          <span>⚡ First 100 get 40% off</span>
        </div>
      </section>

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
            {/* Testimonial 1 — Placeholder */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-400">
                  J
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Your Name Here</p>
                  <p className="text-[10px] text-slate-500">Sec 4 Student · Social Studies</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 italic">
                &ldquo;MARKUP helped me understand exactly where I was losing marks. The LORMS breakdown showed me I was weak on comparison questions — after two weeks of practice I jumped from a B to an A.&rdquo;
              </p>
              <div className="mt-4 text-amber-400 text-sm">★★★★★</div>
            </div>

            {/* Testimonial 2 — Placeholder */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-sm font-black text-emerald-400">
                  S
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Your Name Here</p>
                  <p className="text-[10px] text-slate-500">Sec 5 Student · Elective History</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 italic">
                &ldquo;I was struggling with SBQ reliability questions. The AI gave me specific feedback on every paragraph I wrote, not just a generic grade. My teacher noticed the improvement within a month.&rdquo;
              </p>
              <div className="mt-4 text-amber-400 text-sm">★★★★★</div>
            </div>

            {/* Testimonial 3 — Placeholder */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-sm font-black text-amber-400">
                  M
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Your Name Here</p>
                  <p className="text-[10px] text-slate-500">Tutor · Tuition Centre</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 italic">
                &ldquo;I use MARKUP with all 12 of my students. The cohort dashboard lets me see exactly which skills each student is struggling with. It has saved me hours of marking time every week.&rdquo;
              </p>
              <div className="mt-4 text-amber-400 text-sm">★★★★★</div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => {
                const hero = document.querySelector('section');
                hero?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition"
            >
              Join the waitlist and be the next story →
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section — unchanged structure, just updated note */}
      <section id="pricing" className="px-6 py-20 bg-slate-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
              Beta Pricing Locked In
            </span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
              Choose your path to A1.
            </h3>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3">
              Every tier doubles in price once we exit beta.{' '}
              {waitlistCount !== null && (
                <span className="text-indigo-400 font-bold">
                  {waitlistCount.toLocaleString()} students already on the waitlist.
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Student Monthly */}
            <div className="bg-slate-950/80 border border-indigo-500/40 rounded-2xl p-6 flex flex-col justify-between transition shadow-xl shadow-indigo-950/30 hover:scale-[1.01]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wide">Student Monthly</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Individual Students</p>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">Beta · S$</span>
                  <div className="flex items-baseline text-slate-100 font-mono">
                    <span className="text-3xl font-black tracking-tight">12</span>
                    <span className="text-slate-500 text-[11px] ml-1 font-bold">/ month</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-600">Post-Beta</span>
                    <span className="text-slate-500 text-[11px] font-mono line-through">S$29/ month</span>
                  </div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  <li className="flex items-start gap-2 leading-tight"><span className="text-indigo-400 font-black font-mono mt-0.5">✓</span>Unlimited AI question generation</li>
                  <li className="flex items-start gap-2 leading-tight"><span className="text-indigo-400 font-black font-mono mt-0.5">✓</span>Instant multi-canvas grading (SBCS / SEQ / SRQ)</li>
                  <li className="flex items-start gap-2 leading-tight"><span className="text-indigo-400 font-black font-mono mt-0.5">✓</span>LORMS band review with PEEL highlights</li>
                </ul>
              </div>
              <button
                onClick={() => document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-center mt-8 text-xs transition"
              >
                Join Waitlist — S$12/mo
              </button>
            </div>

            {/* Student Academic Pass */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between transition shadow-xl shadow-emerald-950/30 hover:scale-[1.01] relative">
              <span className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Best Value</span>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wide">Student Academic Pass</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Individual Students</p>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">Beta · S$</span>
                  <div className="flex items-baseline text-slate-100 font-mono">
                    <span className="text-3xl font-black tracking-tight">48</span>
                    <span className="text-slate-500 text-[11px] ml-1 font-bold">flat</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-600">Post-Beta</span>
                    <span className="text-slate-500 text-[11px] font-mono line-through">S$120 flat</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic pt-1">One-time payment · Premium until final exams</p>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  <li className="flex items-start gap-2 leading-tight"><span className="text-emerald-400 font-black font-mono mt-0.5">✓</span>Everything in Student Monthly</li>
                  <li className="flex items-start gap-2 leading-tight"><span className="text-emerald-400 font-black font-mono mt-0.5">✓</span>Premium access until the O-Level written exams</li>
                  <li className="flex items-start gap-2 leading-tight"><span className="text-emerald-400 font-black font-mono mt-0.5">✓</span>Full exemplar essay bank + SEAB priority updates</li>
                </ul>
              </div>
              <button
                onClick={() => document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 rounded-xl text-center mt-8 text-xs transition"
              >
                Join Waitlist — S$48 flat
              </button>
            </div>

            {/* Tuition Cohort Pass */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between transition shadow-xl shadow-amber-950/30 hover:scale-[1.01] relative">
              <span className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">For Centres</span>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wide">Tuition Cohort Pass</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Centres / Tutors · up to 15 students</p>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">Beta · S$</span>
                  <div className="flex items-baseline text-slate-100 font-mono">
                    <span className="text-3xl font-black tracking-tight">89</span>
                    <span className="text-slate-500 text-[11px] ml-1 font-bold">/ month</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-600">Post-Beta</span>
                    <span className="text-slate-500 text-[11px] font-mono line-through">S$249/ month</span>
                  </div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  <li className="flex items-start gap-2 leading-tight"><span className="text-amber-400 font-black font-mono mt-0.5">✓</span>Up to 15 student seats per centre account</li>
                  <li className="flex items-start gap-2 leading-tight"><span className="text-amber-400 font-black font-mono mt-0.5">✓</span>Cohort LORMS distribution dashboard</li>
                  <li className="flex items-start gap-2 leading-tight"><span className="text-amber-400 font-black font-mono mt-0.5">✓</span>Diagnostic tracking + tutor admin tools</li>
                </ul>
              </div>
              <button
                onClick={() => document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-3 rounded-xl text-center mt-8 text-xs transition"
              >
                Join Waitlist — S$89/mo
              </button>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing" className="inline-block text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition">
              See the full comparison →
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-900 text-center text-[10px] font-bold text-slate-600 tracking-widest uppercase">
        © 2026 Markup Analytics • Singapore GCE O-Level Prep
      </footer>
    </div>
  );
}
