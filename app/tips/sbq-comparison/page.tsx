import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Ace SBQ Comparison Questions (L4/6 Framework)',
  description:
    'Master the SBQ Comparison & Contrast question for O-Level Social Studies and History. Learn the 3-step L4/6 framework used by top students, with real SEAB-style examples.',
  openGraph: {
    title: 'How to Ace SBQ Comparison Questions — MARKUP Tips',
    description:
      'Master the SBQ Comparison & Contrast question for O-Level Social Studies and History. Step-by-step L4/6 framework with real examples.',
  },
};

export default function SBQComparisonPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/tips"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold whitespace-nowrap"
          >
            ← All Tips
          </Link>
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <Link href="/" className="hover:text-indigo-400 transition">Home</Link>
          <span>/</span>
          <Link href="/tips" className="hover:text-indigo-400 transition">Tips</Link>
          <span>/</span>
          <span className="text-slate-400">SBQ Comparison</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">8 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Ace SBQ Comparison Questions
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The SBQ comparison question is one of the most predictable parts of the paper.
            Here&apos;s the exact 3-step framework that top students use to consistently score L4/6.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-black text-indigo-400">M</div>
            <div>
              <p className="text-sm font-bold text-slate-300">MARKUP Team</p>
              <p className="text-[10px] text-slate-600">Updated July 2026</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 space-y-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">In this guide</h2>
          <ul className="space-y-1.5 text-sm">
            <li><a href="#what-is-comparison" className="text-indigo-400 hover:text-indigo-300 transition">1. What is the SBQ Comparison Question?</a></li>
            <li><a href="#l4-framework" className="text-indigo-400 hover:text-indigo-300 transition">2. The L4/6 Framework — Explained</a></li>
            <li><a href="#step-by-step" className="text-indigo-400 hover:text-indigo-300 transition">3. Step-by-Step: How to Write an L4 Answer</a></li>
            <li><a href="#examples" className="text-indigo-400 hover:text-indigo-300 transition">4. Real Examples: L2 vs L4 Responses</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">5. Common Mistakes That Cost You Marks</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">6. How to Practice Effectively</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-comparison" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is the SBQ Comparison Question?</h2>
          <p>
            In the O-Level Social Studies and Elective History papers, the SBQ Comparison question
            asks you to <strong className="text-slate-200">compare and contrast</strong> two sources
            on a specific aspect. It typically appears as part (a) of the SBQ section and is worth
            <strong className="text-slate-200"> 6 marks</strong>.
          </p>
          <p>
            The question usually takes the form:
          </p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;Study Sources A and B. How similar are the views of the two sources on
            [specific issue]? Explain your answer using details from the sources.&rdquo;
          </blockquote>
          <p>
            The key word here is <strong className="text-slate-200">&ldquo;similar&rdquo;</strong> — you need
            to identify both <strong className="text-emerald-400">similarities</strong> and
            <strong className="text-amber-400"> differences</strong>, even if the question only asks about
            similarity. Top-scoring students always address both sides.
          </p>
        </section>

        {/* Section 2 */}
        <section id="l4-framework" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The L4/6 Framework — Explained</h2>
          <p>
            The LORMS rubric for SBQ Comparison awards marks across <strong className="text-slate-200">four bands</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L4 — 5–6 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Analytical Comparison</p>
              <p className="text-[10px] text-slate-500 mt-1">Identifies similarities AND differences with precise source evidence. Explains the comparison&apos;s significance.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">L3 — 3–4 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Detailed Comparison</p>
              <p className="text-[10px] text-slate-500 mt-1">Describes similarities OR differences with evidence, but lacks depth or misses one side.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L2 — 1–2 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Surface-level Comparison</p>
              <p className="text-[10px] text-slate-500 mt-1">General statements about similarity without specific source evidence.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L1 — 0 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">No Comparison</p>
              <p className="text-[10px] text-slate-500 mt-1">Describes sources separately without comparing them. No attempt at synthesis.</p>
            </div>
          </div>
          <p>
            <strong className="text-slate-200">The key to L4:</strong> You must show the examiner that you
            can <strong className="text-emerald-400">synthesise</strong> — weave evidence from both sources
            together, not just list what each source says separately.
          </p>
        </section>

        {/* Section 3 */}
        <section id="step-by-step" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Step-by-Step: How to Write an L4 Answer</h2>

          <div className="space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Identify the Dimension</h3>
              </div>
              <p className="text-xs text-slate-400">
                Before you start writing, identify <strong className="text-slate-200">what aspect</strong> the
                question wants you to compare. Is it the sources&apos; views on the effectiveness of a policy?
                Their assessment of a historical figure? Pinpoint this dimension — it&apos;s your anchor.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Find Similarities AND Differences</h3>
              </div>
              <p className="text-xs text-slate-400">
                Even if the question only asks about similarity, you <strong className="text-slate-200">must</strong>{' '}
                address both. Use a T-chart or Venn diagram during planning. Look for:
              </p>
              <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1 mt-2">
                <li><strong className="text-emerald-400">Similarity:</strong> Both sources agree on X. Use quotes from each source to prove it.</li>
                <li><strong className="text-amber-400">Difference:</strong> However, Source A goes further / is more critical / focuses on Y, while Source B emphasises Z.</li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Synthesise, Don&apos;t List</h3>
              </div>
              <p className="text-xs text-slate-400">
                This is what separates L4 from L3. Instead of writing &ldquo;Source A says… Source B says…&rdquo;,
                <strong className="text-slate-200"> weave the evidence together</strong> in each paragraph.
                Use comparative language:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2 space-y-1">
                <p>✅ <span className="text-emerald-400">Both</span> sources acknowledge that X was effective, <span className="text-amber-400">but</span> Source A emphasises Y <span className="text-amber-400">while</span> Source B focuses on Z.</p>
                <p className="text-slate-600 mt-1">❌ Source A says X. Source B says Y.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Real Examples: L2 vs L4 Responses</h2>
          <p>
            Let&apos;s look at a real SEAB-style question and compare two student responses.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sample Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              Study Sources A and B. How similar are the views of the two sources on the impact of
              the New Deal on American citizens? Explain your answer using details from the sources.
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L2 Response (1–2 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Source A talks about how the New Deal helped people get jobs. Source B
                also talks about the New Deal. Both sources are about the New Deal.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 space-y-1">
                <p>❌ No specific evidence from sources</p>
                <p>❌ Describes sources separately, no synthesis</p>
                <p>❌ No mention of difference</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L4 Response (5–6 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Both sources acknowledge that the New Deal had a positive impact on
                Americans — Source A states that it &apos;put millions back to work&apos; while
                Source B notes it &apos;restored faith in government.&apos; However, they differ
                in emphasis: Source A focuses on <strong className="text-slate-200">economic</strong>{' '}
                benefits (jobs, wages), whereas Source B highlights{' '}
                <strong className="text-slate-200">psychological</strong> benefits (hope, trust).
                This suggests that while both agree on the New Deal&apos;s success, they appeal
                to different aspects of its legacy.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 space-y-1">
                <p>✅ Specific evidence with quotes</p>
                <p>✅ Both similarity AND difference addressed</p>
                <p>✅ Evidence synthesised in each paragraph</p>
                <p>✅ Significance of the comparison explained</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="common-mistakes" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Common Mistakes That Cost You Marks</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Treating it as two separate descriptions</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Many students describe Source A and then Source B without ever comparing them.
                  The examiner needs to see <strong className="text-slate-200">synthesis</strong> — evidence
                  woven together in the same sentence or paragraph.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Ignoring differences</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Even when the question asks &ldquo;how similar,&rdquo; you must still address
                  differences. The rubric rewards students who show a nuanced understanding —
                  that sources rarely agree completely.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Vague statements without evidence</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;Both sources are similar&rdquo; is not enough. You must quote or closely
                  paraphrase specific details from each source to substantiate your comparison.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No concluding judgement</h3>
                <p className="text-xs text-slate-400 mt-1">
                  An L4 answer doesn&apos;t just list similarities and differences — it tells the
                  examiner <strong className="text-slate-200">how similar</strong> the sources are
                  overall. Are they &ldquo;largely similar&rdquo; or &ldquo;more different than
                  similar&rdquo;? Make a judgement call.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. How to Practice Effectively</h2>
          <p>
            Knowing the framework is one thing — being able to execute it under exam conditions
            is another. Here&apos;s how to drill SBQ Comparison skills:
          </p>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-black text-indigo-300">🎯 Use MARKUP&apos;s SBQ Generator</h3>
            <p className="text-xs text-slate-400">
              Generate unlimited SBQ practice papers with fresh sources on every O-Level topic.
              Write your answer in the canvas, then get instant LORMS-aligned grading with
              specific feedback on your comparison technique.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
            >
              Try SBQ Practice Now →
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Quick Practice Tips:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1.5">
              <li>Set a 12-minute timer per question — that&apos;s your pace for a 6-mark SBQ</li>
              <li>Before writing, spend 2 minutes planning your comparison points on scrap paper</li>
              <li>Always quote or paraphrase at least 2 details from each source</li>
              <li>End with a judgement: &ldquo;Overall, the sources are largely similar/different because…&rdquo;</li>
              <li>Review your graded responses and focus on the feedback about synthesis</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Ready to practise?</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate an SBQ paper right now with a single click. MARKUP creates fresh O-Level
            sources, grades your answer, and shows you exactly where to improve.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
          >
            Start SBQ Practice — Free
          </Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Back to All Tips
            </Link>
            <Link href="/tips/sbq-reliability" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SBQ Reliability →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
