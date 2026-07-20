import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Ace the SBQ 10-Mark Comparison/Utility Question (L5/8 Framework)',
  description:
    'Master the SBQ 10-mark comparison/utility question for O-Level Social Studies and Elective History. Learn to assess how far sources agree, analyse utility, and score the top L5/8 band with the proven 4-step framework.',
  openGraph: {
    title: 'How to Ace the SBQ 10-Mark Comparison/Utility Question — MARKUP Tips',
    description:
      'Master the SBQ 10-mark comparison/utility question. Learn to assess how far sources agree, analyse utility, and score the top L5/8 band.',
  },
};

export default function SBQUtilityComparisonPage() {
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
          <span className="text-slate-400">SBQ Utility/Comparison</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">10 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Ace the SBQ 10-Mark Comparison/Utility Question
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The 10-mark SBQ is the highest-value question in the SBQ section — and the one where
            top students build their biggest lead. Here&apos;s the 4-step L5/8 framework to assess
            how far sources agree or disagree, and evaluate their combined utility.
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
            <li><a href="#what-is-10mark" className="text-indigo-400 hover:text-indigo-300 transition">1. What is the 10-Mark SBQ Question?</a></li>
            <li><a href="#l5-framework" className="text-indigo-400 hover:text-indigo-300 transition">2. The L5/8 Framework — Explained</a></li>
            <li><a href="#four-step" className="text-indigo-400 hover:text-indigo-300 transition">3. The 4-Step Method for Top Marks</a></li>
            <li><a href="#utility-vs-comparison" className="text-indigo-400 hover:text-indigo-300 transition">4. Utility vs Comparison — Knowing the Difference</a></li>
            <li><a href="#examples" className="text-indigo-400 hover:text-indigo-300 transition">5. Real Examples: L3 vs L5 Responses</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">6. Common Mistakes That Cost You Marks</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">7. How to Practice Effectively</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-10mark" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is the 10-Mark SBQ Question?</h2>
          <p>
            The 10-mark SBQ question is typically the <strong className="text-slate-200">last part</strong>{' '}
            of the SBQ section (often part (d)). It combines elements of comparison and utility,
            asking you to evaluate <strong className="text-slate-200">how far</strong> two or more
            sources agree on a specific issue — and often to assess their combined value as evidence.
          </p>
          <p>The question usually takes the form:</p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;Study Sources A, B and C. How far do you agree that [specific claim]? Use
            the sources to explain your answer.&rdquo;
          </blockquote>
          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">Key difference from the 6-mark comparison:</strong>{' '}
              The 6-mark question asks &ldquo;How similar?&rdquo; — you compare two sources. The
              10-mark question asks &ldquo;How far do you agree?&rdquo; — you make a judgement
              using evidence from multiple sources and your own contextual knowledge.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="l5-framework" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The L5/8 Framework — Explained</h2>
          <p>
            The LORMS rubric for the 10-mark SBQ awards marks across{' '}
            <strong className="text-slate-200">five bands</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 — 8–10 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Sustained Evaluation</p>
              <p className="text-[10px] text-slate-500 mt-1">Makes a clear, well-supported judgement. Uses multiple sources effectively, synthesises evidence, and demonstrates strong contextual knowledge. Addresses both agreement and disagreement.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">L4 — 6–7 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Developed Evaluation</p>
              <p className="text-[10px] text-slate-500 mt-1">Good use of source evidence to support a judgement. May be one-sided or lack deep contextual knowledge.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L3 — 4–5 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Surface-level Evaluation</p>
              <p className="text-[10px] text-slate-500 mt-1">States a position but with limited evidence. Describes sources separately without synthesis.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L2 — 2–3 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Descriptive</p>
              <p className="text-[10px] text-slate-500 mt-1">Describes source content without addressing the question. No judgement or evaluation.</p>
            </div>
          </div>
          <p className="mt-2">
            <strong className="text-slate-200">The key to L5:</strong> You must{' '}
            <strong className="text-emerald-400">synthesise</strong> evidence from multiple sources
            into a coherent argument that addresses the question directly. Each paragraph should
            weave together what the sources say and what you know from your contextual knowledge
            to support or challenge the given claim.
          </p>
        </section>

        {/* Section 3 */}
        <section id="four-step" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. The 4-Step Method for Top Marks</h2>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Read the Claim & Identify Your Position</h3>
              </div>
              <p className="text-xs text-slate-400">
                The question presents a claim (e.g. &ldquo;Source C is the most useful source for
                understanding X&rdquo; or &ldquo;The sources show that the policy was a failure&rdquo;).
                Your job is to <strong className="text-slate-200">take a position</strong>. Do you
                mostly agree? Mostly disagree? Agree in some ways but not others?
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2">
                <p>💡 Start your introduction with a clear thesis: <span className="text-emerald-400">&ldquo;I largely agree/disagree, but with some reservations because…&rdquo;</span></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Group Sources by Agreement / Disagreement</h3>
              </div>
              <p className="text-xs text-slate-400">
                Don&apos;t go source-by-source. Instead, <strong className="text-slate-200">group sources</strong>{' '}
                that support each other. Create thematic paragraphs:
              </p>
              <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1 mt-2">
                <li><strong className="text-emerald-400">Paragraph 1:</strong> Sources that agree with the claim — quotes and synthesis</li>
                <li><strong className="text-amber-400">Paragraph 2:</strong> Sources that challenge or complicate the claim — counter-evidence</li>
                <li><strong className="text-indigo-400">Paragraph 3:</strong> Your contextual knowledge — what you know from your own learning that supports or refutes the claim</li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Weave in Your Contextual Knowledge</h3>
              </div>
              <p className="text-xs text-slate-400">
                This is what separates L4 from L5. After presenting source evidence, add your own
                knowledge to <strong className="text-slate-200">deepen the analysis</strong>. For
                example: &ldquo;The sources&apos; claim that the policy was popular is supported
                by my knowledge that the 1955 election saw a record turnout. However, this ignores
                the fact that opposition parties were suppressed during this period.&rdquo;
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400">4</span>
                <h3 className="text-sm font-black text-white">Conclude with a Clear Judgement</h3>
              </div>
              <p className="text-xs text-slate-400">
                End with a paragraph that <strong className="text-slate-200">weighs the evidence</strong>{' '}
                and states your final position. How far do you agree? Use a{' '}
                <strong className="text-slate-200">nuanced conclusion</strong>:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2">
                <p>✅ <span className="text-emerald-400">&ldquo;On balance, I largely agree that [claim] because the majority of the sources support it, and my knowledge of [historical context] corroborates this. However, Source C&amp;s perspective is limited by…&rdquo;</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="utility-vs-comparison" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Utility vs Comparison — Knowing the Difference</h2>
          <p>
            The 10-mark SBQ can focus on <strong className="text-slate-200">utility</strong> (how
            useful sources are as evidence) or <strong className="text-slate-200">comparison</strong>{' '}
            (how far sources agree or disagree). Sometimes it blends both. Here&apos;s how to
            recognise and handle each type:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-indigo-400">🔷 Comparison-Focused</h3>
              <p className="text-[10px] text-slate-400">
                <em>&ldquo;How far do the sources agree on the effectiveness of X?&rdquo;</em>
              </p>
              <ul className="space-y-1 text-[10px] text-slate-400 list-disc pl-3">
                <li>Focus on <strong className="text-slate-200">agreement vs disagreement</strong> between sources</li>
                <li>Groups sources by shared views</li>
                <li>Explains <em>why</em> sources differ (provenance, purpose)</li>
                <li>Ends with a judgement on the <strong className="text-emerald-400">extent of agreement</strong></li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400">🟢 Utility-Focused</h3>
              <p className="text-[10px] text-slate-400">
                <em>&ldquo;Which source is most useful for understanding X?&rdquo;</em>
              </p>
              <ul className="space-y-1 text-[10px] text-slate-400 list-disc pl-3">
                <li>Focus on the <strong className="text-slate-200">value</strong> of each source as evidence</li>
                <li>Compares sources by <strong className="text-slate-200">strengths vs limitations</strong></li>
                <li>Uses provenance and cross-referencing</li>
                <li>Ends with a judgement on <strong className="text-emerald-400">which is most useful and why</strong></li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⚡ Hybrid questions combine both: &ldquo;How far do you agree that Source C is the most
              useful source?&rdquo; — compare the sources AND evaluate their utility.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Real Examples: L3 vs L5 Responses</h2>
          <p>
            Let&apos;s look at a real SEAB-style question and compare two student responses.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sample Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              &ldquo;Study Sources D, E and F. How far do you agree that economic factors were the
              main cause of decolonisation in Southeast Asia? Use the sources to explain your answer.&rdquo;
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L3 Response (4–5 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Source D says economic factors were important. Source E also talks about
                the economy. Source F says it was about nationalism. So some sources agree and
                one doesn&apos;t. I think economic factors were quite important.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 space-y-1">
                <p>❌ No specific evidence or quotes from sources</p>
                <p>❌ Describes sources separately — no synthesis</p>
                <p>❌ No contextual knowledge</p>
                <p>❌ Weak, vague conclusion</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 Response (8–10 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;The sources present a mixed picture, and while economic factors were clearly
                important, I argue that they alone cannot explain decolonisation — political and
                social factors were equally significant.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                Sources D and E both support the claim that economic factors were central. Source
                D, a British colonial office memo from 1954, states that &apos;the financial burden
                of maintaining colonial administrations is no longer sustainable,&apos; suggesting
                that economic calculation drove British withdrawal. This is corroborated by Source
                E, an economic historian writing in 1980, who notes that &apos;the cost of empire
                outweighed its benefits by the 1950s.&apos; My own knowledge supports this — the
                post-war Marshall Plan and the shift to US economic dominance made the British
                Empire increasingly unviable.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">However</strong>, Source F complicates this picture.
                As a speech by a nationalist leader from the same period, it emphasises political
                self-determination over economics: &apos;We seek not just better wages, but the right
                to govern ourselves.&apos; This reminds us that anti-colonial movements were driven
                by nationalism as much as economics. Indeed, my knowledge of events like the 1948
                Emergency in Malaya shows that security concerns and political pressure from
                nationalist movements forced Britain&apos;s hand.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">Overall judgement:</strong> While the sources
                strongly support the importance of economic factors, I would argue that decolonisation
                was the result of a combination of economic, political, and social pressures. The
                sources that focus exclusively on economics provide only a partial picture.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 space-y-1 mt-2">
                <p>✅ Clear thesis with nuanced position</p>
                <p>✅ Sources grouped thematically, not listed separately</p>
                <p>✅ Specific quotes and evidence from each source</p>
                <p>✅ Contextual knowledge woven into the argument</p>
                <p>✅ Strong, balanced conclusion</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="common-mistakes" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Common Mistakes That Cost You Marks</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Going source-by-source instead of thematically</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;Source A says… Source B says… Source C says…&rdquo; is a one-way ticket to
                  L3. Instead, group sources by <strong className="text-slate-200">theme or argument</strong>{' '}
                  — which sources agree? Which disagree? What pattern emerges?
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No contextual knowledge</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The rubric explicitly rewards contextual knowledge. If you only use what&apos;s in
                  the sources, you cap at L4. Show the examiner what you know from your{' '}
                  <strong className="text-slate-200">own learning</strong>.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Vague or no conclusion</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The conclusion is where you earn top-band marks. Don&apos;t just repeat what you said
                  — <strong className="text-slate-200">weigh the evidence</strong> and make a clear
                  judgement about how far you agree.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Ignoring sources that contradict your position</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A top student doesn&apos;t cherry-pick evidence that supports their argument. They
                  actively engage with <strong className="text-slate-200">counter-evidence</strong> and
                  explain why their position still holds despite it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. How to Practice Effectively</h2>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-black text-indigo-300">🎯 Use MARKUP&apos;s SBQ Generator</h3>
            <p className="text-xs text-slate-400">
              Generate unlimited full SBQ papers with the 10-mark comparison/utility question
              included. Write your answer in the canvas, then get instant LORMS-aligned grading
              with feedback on your synthesis, use of evidence, and contextual knowledge.
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
              <li>Spend 3 minutes planning before you write — map out your thesis and which sources go in which paragraph</li>
              <li>Plan to write 3–4 substantial paragraphs (not including intro/conclusion)</li>
              <li>Each body paragraph should use at least <strong className="text-slate-200">two</strong> sources + your contextual knowledge</li>
              <li>Set an 18-minute timer — that&apos;s your exam pace for a 10-mark question</li>
              <li>Review your graded responses — did you synthesise or just describe? Did you include enough CK?</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master the 10-mark SBQ with AI practice</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP generates full SBQ papers with fresh sources on every O-Level topic. Write your
            answer and get instant LORMS grading with specific feedback on your evaluation technique.
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
            <Link href="/tips/sbq-purpose" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SBQ Purpose
            </Link>
            <Link href="/tips/peel-framework" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: PEEL Framework →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
