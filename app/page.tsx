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

      {/* Pricing Section - Inverted Funnel */}
      <section id="pricing" className="px-6 py-20 bg-slate-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mb-3">Investment Plans</h3>
            <p className="text-3xl font-black">Choose your path to Distinction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: Ultimate (Best Value Anchor) */}
            <div className="bg-gradient-to-b from-indigo-600/20 to-slate-950 border-2 border-indigo-500/50 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Best Results</div>
              <h4 className="text-xl font-black mb-1">Ultimate Distinction</h4>
              <div className="text-4xl font-black mb-6 font-mono">$39<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-300">✅ Unlimited AI Simulations</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-300">✅ Parent Proficiency Reports</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-300">✅ Priority SEAB Prompt Updates</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-300">✅ Full Exemplar Essay Bank</li>
              </ul>
              <Link href="/auth" className="w-full bg-indigo-600 text-center py-4 rounded-2xl font-black hover:bg-indigo-500 transition">Get Ultimate</Link>
            </div>

            {/* Middle: Exam Ready (The Core Choice) */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col">
              <h4 className="text-xl font-black mb-1">Exam Ready</h4>
              <div className="text-4xl font-black mb-6 font-mono">$19<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-400">✅ 25 AI Papers Monthly</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-400">✅ Skill Analytics Dashboard</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-400">✅ Structured PEEL Scans</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-400">✅ History Logger</li>
              </ul>
              <Link href="/auth" className="w-full bg-slate-800 text-center py-4 rounded-2xl font-black hover:bg-slate-700 transition">Start Practice</Link>
            </div>

            {/* Right: Self-Guided (Freemium) */}
            <div className="bg-slate-950/20 border border-slate-900 p-8 rounded-[2.5rem] flex flex-col opacity-80">
              <h4 className="text-xl font-black mb-1 text-slate-500">Self-Guided</h4>
              <div className="text-4xl font-black mb-6 font-mono text-slate-500">$0</div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-500">✅ 3 AI Paper Simulations</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-500">✅ Basic Diagnostic Feedback</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-500">✅ Public Community Forum</li>
              </ul>
              <Link href="/auth" className="w-full bg-slate-900 text-center py-4 rounded-2xl font-black text-slate-500 border border-slate-800">Free Tier</Link>
            </div>

          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-900 text-center text-[10px] font-bold text-slate-600 tracking-widest uppercase">
        © 2026 Markup Analytics • Singapore GCE O-Level Prep
      </footer>
    </div>
  );
}
