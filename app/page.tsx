'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_55%)] pointer-events-none" />

      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900/60 bg-[#07090e]/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6 text-indigo-500 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 80V25L45 55L70 25M70 25H50M70 25V45" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M65 55V80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-lg font-black tracking-wider text-white">MARKUP</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/auth" className="text-xs font-bold text-slate-400 hover:text-white transition">Log in</Link>
          <Link href="/auth?next=pricing" className="bg-white hover:bg-slate-200 text-black text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm">
            Start free
          </Link>
        </div>
      </header>

      <section className="relative max-w-5xl mx-auto text-center px-6 pt-20 pb-12 flex flex-col items-center gap-6 z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/5 text-indigo-400 text-[11px] px-3 py-1 rounded-full font-semibold tracking-wide border border-indigo-500/10">
          ✨ Built for Singapore O-Level Humanities
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.1]">
          Humanities evaluation <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">your grade can trust</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-medium">
          AI-generated mock frameworks, source sheets, and PEEL diagnostic breakdowns built entirely on native SEAB LORMS criteria matrices.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Link href="/auth?next=pricing" className="bg-white hover:bg-slate-200 text-black text-xs font-bold px-6 py-3 rounded-xl transition">
            Start free
          </Link>
        </div>
      </section>
    </div>
  );
}
