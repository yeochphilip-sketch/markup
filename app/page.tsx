'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      
      {/* Background Radial Glow Matrix */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_55%)] pointer-events-none" />

      {/* Navigation Matrix Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900/60 bg-[#07090e]/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {/* Your Custom M Arrow Logo Blueprint */}
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

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto text-center px-6 pt-20 pb-12 flex flex-col items-center gap-6 z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/5 text-indigo-400 text-[11px] px-3 py-1 rounded-full font-semibold tracking-wide border border-indigo-500/10">
          ✨ Built for Singapore O-Level Humanities
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.1]">
          Humanities evaluations <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">your grade can trust</span>
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-medium">
          AI-generated mock frameworks, source sheets, and PEEL diagnostic breakdowns built entirely on native SEAB LORMS criteria matrices.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <Link href="/auth?next=pricing" className="bg-white hover:bg-slate-200 text-black text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-500/10">
            Start free
          </Link>
          <Link href="/auth" className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold px-6 py-3 rounded-xl transition">
            Explore pricing
          </Link>
        </div>
      </section>

      {/* Mockup Canvas Component Block */}
      <section className="max-w-5xl mx-auto px-6 pb-24 z-20 relative">
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur">
          <div className="h-6 w-full flex items-center gap-1.5 px-2 mb-4 border-b border-slate-900 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-48 bg-slate-900/20 rounded-xl border border-slate-900 p-4">
            <div className="border border-dashed border-slate-800/80 rounded-lg p-3 space-y-2">
              <div className="h-3 w-12 bg-indigo-500/10 rounded border border-indigo-500/20" />
              <div className="h-2 w-full bg-slate-800/50 rounded" />
              <div className="h-2 w-4/5 bg-slate-800/50 rounded" />
            </div>
            <div className="md:col-span-2 border border-dashed border-slate-800/80 rounded-lg p-3 space-y-2 relative">
              <div className="h-3 w-24 bg-purple-500/10 rounded border border-purple-500/20" />
              <div className="h-2 w-full bg-slate-800/50 rounded" />
              <div className="h-2 w-5/6 bg-slate-800/50 rounded" />
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-indigo-600 rounded text-[9px] font-bold">L4/6 Banded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid Row */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900/60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0b0f17] border border-slate-900 rounded-2xl p-8 space-y-4">
            <span className="text-xs font-bold text-indigo-400">01 / DRILL GENERATOR</span>
            <h3 className="text-lg font-bold text-white">Create case studies with a prompt</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe a historical focus point or current affairs conflict. Markup auto-compiles dual-source parameters and context summaries matching active exam profiles.
            </p>
          </div>
          <div className="bg-[#0b0f17] border border-slate-900 rounded-2xl p-8 space-y-4">
            <span className="text-xs font-bold text-purple-400">02 / STRUCTURE ANALYSIS</span>
            <h3 className="text-lg font-bold text-white">AI answers from your trusted metrics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define your parameters once. Our underlying prompt frameworks review cross-referencing criteria, provenance bias, and structural balance checks instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Tier Pricing Model */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900/60">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-xl font-black text-white">Simple, metric-driven packages</h2>
          <p className="text-xs text-slate-500">Practice smarter. Cancel or upgrade with a single toggle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#07090e] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-400">Freemium</h4>
              <p className="text-2xl font-black text-white mt-2">$0</p>
              <p className="text-[11px] text-slate-500 mt-1">Perfect for quick homework reviews</p>
              <div className="border-t border-slate-900 my-4" />
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>• 3 AI architecture scans daily</li>
                <li>• Social Studies syllabus</li>
              </ul>
            </div>
            <Link href="/auth" className="mt-6 block text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition">Start Basic</Link>
          </div>

          <div className="bg-[#0b0f17] border-2 border-indigo-500/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-indigo-950/20 relative">
            <span className="absolute -top-2.5 left-6 bg-indigo-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded">Best Value</span>
            <div>
              <h4 className="text-xs font-bold text-indigo-400">Pro Master</h4>
              <p className="text-2xl font-black text-white mt-2">$12<span className="text-xs font-normal text-slate-500"> /mo</span></p>
              <p className="text-[11px] text-slate-400 mt-1">For students targetting an A1 distinction</p>
              <div className="border-t border-slate-900 my-4" />
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li>• Unlimited structural grading</li>
                <li>• Full Elective History database access</li>
                <li>• Instant high-scoring exemplar rewrites</li>
              </ul>
            </div>
            <Link href="/auth?next=pricing" className="mt-6 block text-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition">Get Unlimited</Link>
          </div>

          <div className="bg-[#07090e] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-400">Institutional</h4>
              <p className="text-2xl font-black text-white mt-2">$89<span className="text-xs font-normal text-slate-500"> /mo</span></p>
              <p className="text-[11px] text-slate-500 mt-1">For private centers and classrooms</p>
              <div className="border-t border-slate-900 my-4" />
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>• 40 premium user licenses</li>
                <li>• Teacher analytical dashboard metrics</li>
              </ul>
            </div>
            <a href="mailto:support@markup.sg" className="mt-6 block text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition">Contact Support</a>
          </div>
        </div>
      </section>

    </div>
  );
}
