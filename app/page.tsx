import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="px-8 py-6 flex justify-between items-center border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black text-indigo-500 tracking-tighter">MARKUP</h1>
        <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
          <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/auth" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Master the <span className="text-indigo-500">O-Level</span> Humanities with AI.
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          The only Source-Based Case Study simulator designed specifically for the Singapore SEAB Social Studies and History syllabus. Scan essays, get LORMS grades, and climb to A1.
        </p>
        <Link href="/auth" className="inline-block bg-slate-100 text-slate-950 font-black px-10 py-4 rounded-2xl text-lg hover:scale-105 transition active:scale-95 shadow-xl">
          Start Your First Paper →
        </Link>
      </section>

      {/* Pricing Section - 3 beta-locked tiers */}
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
              Every tier doubles in price once we exit beta. Lock in now.
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
              <Link href="/pricing" className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-950 font-black py-3 rounded-xl text-center mt-8 text-xs transition">Start Student Monthly</Link>
            </div>

            {/* Student Academic Pass */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between transition shadow-xl shadow-emerald-950/30 hover:scale-[1.01] relative">
              <span className="absolute -top-2.5 right-4 bg-emerald-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Best Value</span>
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
              <Link href="/pricing" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-center mt-8 text-xs transition">Lock In Academic Pass</Link>
            </div>

            {/* Tuition Cohort Pass */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between transition shadow-xl shadow-amber-950/30 hover:scale-[1.01] relative">
              <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">For Centres</span>
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
              <Link href="/pricing" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-center mt-8 text-xs transition">Provision Cohort Pass</Link>
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
