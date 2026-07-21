import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '10 Common O-Level Humanities Mistakes (And How to Fix Each One)',
  description:
    'The top 10 mistakes students make in O-Level Social Studies and Elective History — and exactly how to fix them. Covers SBQ, SEQ, SRQ, PEEL, CK, and time management.',
  openGraph: {
    title: '10 Common O-Level Humanities Mistakes — MARKUP Tips',
    description:
      'The top 10 mistakes in O-Level Social Studies and History. Proven fixes for SBQ, SEQ, SRQ, PEEL, contextual knowledge, and exam technique.',
  },
};

export default function CommonMistakesPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/tips" className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold whitespace-nowrap">← All Tips</Link>
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <Link href="/" className="hover:text-indigo-400 transition">Home</Link>
          <span>/</span>
          <Link href="/tips" className="hover:text-indigo-400 transition">Tips</Link>
          <span>/</span>
          <span className="text-slate-400">Common Mistakes</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Study Strategy</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">12 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            10 Common O-Level Humanities Mistakes (And How to Fix Each One)
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            After grading thousands of SBQ and essay answers, these are the mistakes we see
            most often. The good news? Every single one is fixable with the right technique.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-black text-indigo-400">M</div>
            <div>
              <p className="text-sm font-bold text-slate-300">MARKUP Team</p>
              <p className="text-[10px] text-slate-600">Updated July 2026</p>
            </div>
          </div>
        </div>

        {/* Mistake 1 */}
        <section id="mistake-1" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">1</span>
            <h2 className="text-xl font-black text-white">Treating SBQ Comparison as Two Separate Descriptions</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              &ldquo;Source A says X. Source B says Y. So they are different.&rdquo; — This is
              describing sources separately, not comparing them.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Use <strong className="text-slate-200">comparative language</strong> that weaves
              evidence from both sources together <strong className="text-slate-200">within the same sentence</strong>.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;Both sources acknowledge that X was effective, but Source A emphasises Y while Source B focuses on Z.&rdquo;</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/sbq-comparison" className="underline underline-offset-2">SBQ Comparison Guide</Link>
          </p>
        </section>

        {/* Mistake 2 */}
        <section id="mistake-2" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">2</span>
            <h2 className="text-xl font-black text-white">Vague CK Without Specific Facts</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              &ldquo;The US gave a lot of money to Europe after the war.&rdquo; — Vague statements
              without dates, names, or statistics are treated as &ldquo;general knowledge,&rdquo;
              not contextual knowledge.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Commit to memorising <strong className="text-slate-200">3-5 specific facts per topic</strong>.
              A strong CK statement includes a date, a name or policy, and a statistic or key detail.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;The Marshall Plan (1948) injected $13 billion into Western Europe, requiring recipients to adopt free-market policies — effectively locking them into the American economic sphere.&rdquo;</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/historical-context-essays" className="underline underline-offset-2">Historical Context Guide</Link>
          </p>
        </section>

        {/* Mistake 3 */}
        <section id="mistake-3" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">3</span>
            <h2 className="text-xl font-black text-white">No Synthesis in SBQ Comparison Answers</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              Writing a paragraph about Source A and a separate paragraph about Source B without
              ever comparing them. Even if individual paragraphs are good, this caps you at L3.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Organise your answer by <strong className="text-slate-200">theme or point of comparison</strong>,
              not by source. Each paragraph should discuss one aspect and draw evidence from both sources.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>Paragraph on &ldquo;economic impact&rdquo;: uses Source A quote + Source B quote within the same argument.</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/sbq-comparison" className="underline underline-offset-2">SBQ Comparison Guide</Link>
          </p>
        </section>

        {/* Mistake 4 */}
        <section id="mistake-4" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">4</span>
            <h2 className="text-xl font-black text-white">Ignoring Provenance in Reliability Questions</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              Evaluating reliability based only on source content without considering{' '}
              <strong className="text-slate-200">who wrote it, when, why, and for whom</strong>.
              This caps you at L3 on the 7-mark question.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-slate-200">Always start</strong> with provenance analysis.
              Who is the author? What is their perspective? When was it written — contemporary
              or retrospective? What type of source is it? Then <strong className="text-slate-200">cross-reference</strong>.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;As a British colonial official writing in 1955, the author had a vested interest in portraying colonial rule positively. However, his first-hand access to government records makes his factual claims about economic development more reliable.&rdquo;</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/sbq-reliability" className="underline underline-offset-2">SBQ Reliability Guide</Link>
          </p>
        </section>

        {/* Mistake 5 */}
        <section id="mistake-5" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">5</span>
            <h2 className="text-xl font-black text-white">Writing Description Instead of Analysis</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              &ldquo;The source says that the Japanese occupation was harsh. The source also says
              people suffered.&rdquo; — This is description, not analysis.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Analysis answers <strong className="text-slate-200">&ldquo;so what?&rdquo;</strong>{' '}
              After presenting evidence, explain its significance. How does it prove your point?
              What does it reveal about the author&apos;s motives? Why does it matter for the question?
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;The source&apos;s emphasis on suffering serves a purpose — it justifies the nationalist struggle against the Japanese and later the returning colonial powers.&rdquo;</em></p>
            </div>
          </div>
        </section>

        {/* Mistake 6 */}
        <section id="mistake-6" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">6</span>
            <h2 className="text-xl font-black text-white">Missing the Link in PEEL</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              Writing Point → Evidence → Explanation, but skipping the{' '}
              <strong className="text-slate-200">Link</strong> back to the question. The paragraph
              feels incomplete and the examiner can&apos;t see how your argument answers the
              question.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              End every body paragraph with a sentence that explicitly <strong className="text-slate-200">connects
              back to the question</strong>. Ask yourself: &ldquo;How does this paragraph prove
              my thesis?&rdquo;
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;Therefore, the EIP demonstrates that deliberate state intervention was effective in preventing ethnic enclaves, supporting the view that government policy can successfully manage diversity.&rdquo;</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/peel-framework" className="underline underline-offset-2">PEEL Framework Guide</Link>
          </p>
        </section>

        {/* Mistake 7 */}
        <section id="mistake-7" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">7</span>
            <h2 className="text-xl font-black text-white">No Conclusion or Judgement in Evaluation Questions</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              For Part B (evaluation) questions, writing a balanced essay that considers both
              sides but never reaches a final judgement. The rubric requires a{' '}
              <strong className="text-slate-200">substantiated conclusion</strong>.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Your conclusion must state a clear position. Use phrases like &ldquo;To a large/small
              extent,&rdquo; &ldquo;On balance,&rdquo; or &ldquo;Ultimately.&rdquo; Then{' '}
              <strong className="text-slate-200">justify why</strong> you&apos;ve reached that
              judgement.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;On balance, economic factors were more significant than ideological ones because they created material conditions that made compromise impossible — while ideology provided the rhetoric, economics provided the structural conflict.&rdquo;</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/seq-evaluation" className="underline underline-offset-2">SEQ Evaluation Guide</Link>
          </p>
        </section>

        {/* Mistake 8 */}
        <section id="mistake-8" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">8</span>
            <h2 className="text-xl font-black text-white">Forgetting to Cross-Reference in SBQ</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              For reliability questions, evaluating a source based only on its own provenance
              and content without comparing it to other sources. The L5 band requires
              <strong className="text-slate-200"> both</strong> provenance and cross-referencing.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              After analysing provenance, <strong className="text-slate-200">always check</strong>{' '}
              whether other sources support or contradict the source in question. Use this
              cross-reference to make a nuanced judgement.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;Source C&apos;s claim that the policy was successful is corroborated by Source D, which provides specific statistics showing a 30% increase. However, Source E contradicts this, suggesting the data was selectively presented.&rdquo;</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/sbq-source-analysis" className="underline underline-offset-2">SBQ Source Analysis Guide</Link>
          </p>
        </section>

        {/* Mistake 9 */}
        <section id="mistake-9" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">9</span>
            <h2 className="text-xl font-black text-white">Overwriting the Point in PEEL Paragraphs</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              Taking 3-4 sentences just to state the point of a paragraph. If your Point is
              long and meandering, the examiner loses focus before they even get to your evidence.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Keep your Point to <strong className="text-slate-200">one sentence</strong>. It should
              be a clear, arguable claim that directly addresses the question. If it takes more
              than one sentence, your point is probably not focused enough.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;The USSR&apos;s demand for $20 billion in reparations from Germany was the most immediate economic cause of Cold War tensions.&rdquo;</em> ← One sentence, clear claim.</p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/peel-framework" className="underline underline-offset-2">PEEL Framework Guide</Link>
          </p>
        </section>

        {/* Mistake 10 */}
        <section id="mistake-10" className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/30 flex items-center justify-center text-sm font-black text-red-400 shrink-0">10</span>
            <h2 className="text-xl font-black text-white">Poor Time Management in the Exam</h2>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Mistake</p>
            <p className="text-xs text-slate-400 italic mt-1">
              Spending too long on the first SBQ question (comparison, 6 marks) and running out
              of time for the last SBQ question (utility/comparison, 10 marks). Or spending so
              long on SBQ that your SEQ answers are rushed.
            </p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The Fix</p>
            <p className="text-xs text-slate-400 mt-1">
              Follow the <strong className="text-slate-200">mark-per-minute rule</strong>: spend
              roughly 1 minute per mark. A 6-mark comparison: 6-7 minutes. A 10-mark utility/
              comparison: 10-12 minutes. Total SBQ: ~50 min. Total SEQ (2 essays): ~50 min.
            </p>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>💡 <em>Set a mental checkpoint at the 50-minute mark — if you&apos;re not done with
              SBQ, force yourself to move to SEQ. A rushed SEQ answer scored L3 is better than
              a perfect SBQ with an unfinished SEQ.</em></p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold">
            📖 Related: <Link href="/tips/seq-history-guide" className="underline underline-offset-2">SEQ Time Management</Link>
          </p>
        </section>

        {/* Summary table */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5">
          <h2 className="text-sm font-black text-white mb-3">📊 Quick Reference: All 10 Mistakes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-1.5 pr-2 font-black text-slate-500 uppercase tracking-widest">#</th>
                  <th className="text-left py-1.5 pr-2 font-black text-slate-500 uppercase tracking-widest">Mistake</th>
                  <th className="text-left py-1.5 font-black text-slate-500 uppercase tracking-widest">One-Sentence Fix</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">1</td><td className="py-1.5 pr-2 text-slate-400">Two separated descriptions</td><td className="py-1.5 text-slate-400">Weave both sources into every sentence.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">2</td><td className="py-1.5 pr-2 text-slate-400">Vague CK</td><td className="py-1.5 text-slate-400">Every CK sentence needs a date, name, OR statistic.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">3</td><td className="py-1.5 pr-2 text-slate-400">No synthesis in comparison</td><td className="py-1.5 text-slate-400">Structure by theme, not by source.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">4</td><td className="py-1.5 pr-2 text-slate-400">Ignoring provenance</td><td className="py-1.5 text-slate-400">Always start reliability with provenance analysis.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">5</td><td className="py-1.5 pr-2 text-slate-400">Description over analysis</td><td className="py-1.5 text-slate-400">After every claim, ask &ldquo;So what?&rdquo; and answer.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">6</td><td className="py-1.5 pr-2 text-slate-400">Missing Link in PEEL</td><td className="py-1.5 text-slate-400">End every paragraph connecting back to the question.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">7</td><td className="py-1.5 pr-2 text-slate-400">No conclusion in evaluation</td><td className="py-1.5 text-slate-400">Always end with a clear, justified judgement.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">8</td><td className="py-1.5 pr-2 text-slate-400">No cross-referencing</td><td className="py-1.5 text-slate-400">Always check if other sources corroborate or contradict.</td></tr>
                <tr className="border-b border-slate-800/50"><td className="py-1.5 pr-2 text-red-400 font-bold">9</td><td className="py-1.5 pr-2 text-slate-400">Overwriting the Point</td><td className="py-1.5 text-slate-400">Keep your Point to one sentence — no exceptions.</td></tr>
                <tr><td className="py-1.5 pr-2 text-red-400 font-bold">10</td><td className="py-1.5 pr-2 text-slate-400">Poor time management</td><td className="py-1.5 text-slate-400">Follow the mark-per-minute rule strictly.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-amber-950/50 to-slate-950/80 border border-amber-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Check for these mistakes in your own answers</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Write an answer in MARKUP and get instant LORMS-aligned grading. The AI feedback
            will flag exactly which of these mistakes you&apos;re making — and tell you how to fix them.
          </p>
          <Link href="/dashboard" className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-amber-500/20">Start Practising — Free</Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/study-strategy" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">← Previous: Study Strategy</Link>
            <Link href="/tips/exam-week-strategy" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">Next: Exam Week Strategy →</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
