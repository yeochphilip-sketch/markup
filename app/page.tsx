'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Navbar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40 backdrop-blur">
        <span className="text-xl font-black tracking-tight text-indigo-400">MARKUP</span>
        <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10">
          Enter App
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-6 py-20 lg:py-32 flex flex-col items-center gap-6">
        <span className="bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-500/20">
          Built for Singapore O-Level Humanities
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Master the <span className="text-indigo-400">LORMS Matrix</span> Without the Premium Tutor Price.
        </h1>
        <p className="text-slate-400 text-base md:text-xl max-w-2xl leading-relaxed">
          Instant diagnostic scanning for Social Studies & Elective History. Scan your PEEL structure, pinpoint mark leaks, and instantly view perfect A1 upgrades.
        </p>
        <Link href="/dashboard" className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5">
          Start Practicing Free
        </Link>
      </section>

      {/* Pricing Section Grid Matrix */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Simple, High-Value Pricing</h2>
          <p className="text-slate-400 text-sm">Invest in your distinction. Upgrade or downgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Tier 1: Freemium Left Card */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Core</span>
              <h3 className="text-xl font-black text-white mt-1">Freemium</h3>
              <p className="text-3xl font-black text-white mt-4">$0 <span className="text-xs font-normal text-slate-500">/ forever</span></p>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">✓ 3 AI Scans per day</li>
                <li className="flex items-center gap-2">✓ Social Studies Core Skills</li>
                <li className="flex items-center gap-2">✓ Standard LORMS Banding</li>
              </ul>
            </div>
            <Link href="/dashboard" className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition text-sm">
              Get Started
            </Link>
          </div>

          {/* Tier 2: The Best Deal (Middle Highlight Card) */}
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-8 flex flex-col justify-between shadow-xl shadow-indigo-600/5 relative transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow">
              Most Popular / Best Deal
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Kiasu Unlimited</span>
              <h3 className="text-xl font-black text-white mt-1">Pro Master</h3>
              <p className="text-3xl font-black text-white mt-4">$12 <span className="text-xs font-normal text-indigo-300">/ month</span></p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2 text-indigo-400">★ Unlimited AI Architecture Scans</li>
                <li className="flex items-center gap-2">✓ Full Elective History Syllabus</li>
                <li className="flex items-center gap-2">✓ Deep PEEL Structural Refinement</li>
                <li className="flex items-center gap-2">✓ Unlimited Custom Mock Generator</li>
              </ul>
            </div>
            <Link href="/dashboard" className="mt-8 block text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-md shadow-indigo-600/10">
              Upgrade to Pro
            </Link>
          </div>

          {/* Tier 3: Expensive Enterprise Right Card */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tuition & School</span>
              <h3 className="text-xl font-black text-white mt-1">Institutional</h3>
              <p className="text-3xl font-black text-white mt-4">$89 <span className="text-xs font-normal text-slate-500">/ month</span></p>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">✓ Up to 40 Student Licenses</li>
                <li className="flex items-center gap-2">✓ Teacher Analytics Dashboard</li>
                <li className="flex items-center gap-2">✓ Bulk Custom Question Uploads</li>
              </ul>
            </div>
            <a href="mailto:support@markup.sg" className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition text-sm">
              Contact Sales
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
