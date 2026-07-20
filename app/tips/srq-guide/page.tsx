import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Answer SRQ Questions — O-Level Social Studies Guide (L3/8 Framework)',
  description:
    'Master the SRQ (Structured Response Question) for O-Level Social Studies. Learn the 3-step framework to score L3/8 with PEEL structure, evidence handling, and evaluation techniques.',
  openGraph: {
    title: 'How to Answer SRQ Questions — MARKUP Tips',
    description:
      'Master the SRQ (Structured Response Question) for O-Level Social Studies. Learn the 3-step framework to score L3/8 with PEEL structure, evidence handling, and evaluation.',
  },
};

export default function SRQGuidePage() {
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
          <span className="text-slate-400">SRQ Guide</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SRQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">11 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Answer SRQ Questions — Social Studies
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The SRQ (Structured Response Question) is the essay component of the O-Level Social
            Studies paper. It tests your ability to construct arguments, use evidence, and make
            judgements. Here&apos;s the complete framework to score L3/8.
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
            <li><a href="#what-is-srq" className="text-indigo-400 hover:text-indigo-300 transition">1. What is the SRQ?</a></li>
            <li><a href="#l3-framework" className="text-indigo-400 hover:text-indigo-300 transition">2. The L3/8 Framework — Explained</a></li>
            <li><a href="#peel-srq" className="text-indigo-400 hover:text-indigo-300 transition">3. PEEL Structure for SRQs</a></li>
            <li><a href="#evidence" className="text-indigo-400 hover:text-indigo-300 transition">4. Using Evidence in SRQs</a></li>
            <li><a href="#evaluation" className="text-indigo-400 hover:text-indigo-300 transition">5. Evaluation &amp; Balanced Judgement</a></li>
            <li><a href="#examples" className="text-indigo-400 hover:text-indigo-300 transition">6. Real Examples: L1 vs L3 Responses</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">7. Common Mistakes That Cost You Marks</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">8. How to Practice Effectively</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-srq" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is the SRQ?</h2>
          <p>
            The SRQ (Structured Response Question) is the <strong className="text-slate-200">essay
            component</strong> of the O-Level Social Studies paper. It is typically worth{' '}
            <strong className="text-slate-200">8 marks</strong> and tests your ability to:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">📝</p>
              <h3 className="text-xs font-bold text-slate-200">Construct Arguments</h3>
              <p className="text-[10px] text-slate-400 mt-1">Take a position and defend it with reasoning</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">📊</p>
              <h3 className="text-xs font-bold text-slate-200">Use Evidence</h3>
              <p className="text-[10px] text-slate-400 mt-1">Support claims with specific examples and facts</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">⚖️</p>
              <h3 className="text-xs font-bold text-slate-200">Evaluate</h3>
              <p className="text-[10px] text-slate-400 mt-1">Make balanced judgements showing different perspectives</p>
            </div>
          </div>

          <p>The SRQ question typically takes the form:</p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;Do you agree that [statement]? Explain your answer.&rdquo;
          </blockquote>
          <p>
            Unlike the SEQ in History, the SRQ in Social Studies <strong className="text-slate-200">does not
            provide sources</strong> — you must rely entirely on your own knowledge and argumentation
            skills. This makes it a test of your ability to <strong className="text-emerald-400">think on
            your feet</strong> and construct a coherent argument from scratch.
          </p>
        </section>

        {/* Section 2 */}
        <section id="l3-framework" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The L3/8 Framework — Explained</h2>
          <p>
            The LORMS rubric for SRQ awards marks across{' '}
            <strong className="text-slate-200">three bands</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L3 — 6–8 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Sustained Argument with Evaluation</p>
              <p className="text-[10px] text-slate-500 mt-1">Clear thesis with well-developed arguments. Uses specific evidence. Shows balance by addressing counter-arguments. Makes a reasoned overall judgement.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L2 — 3–5 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Developed Argument</p>
              <p className="text-[10px] text-slate-500 mt-1">Has a clear argument with some evidence, but may be one-sided or lack depth. Partial PEEL structure.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L1 — 1–2 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Descriptive</p>
              <p className="text-[10px] text-slate-500 mt-1">Describes the issue without taking a position. No clear argument or evidence. Lacks structure.</p>
            </div>
          </div>
          <p>
            <strong className="text-slate-200">The key to L3:</strong> You need{' '}
            <strong className="text-emerald-400">all three elements</strong> — a clear position,
            specific evidence, and balanced evaluation. Missing any one of these caps you at L2.
          </p>
        </section>

        {/* Section 3 */}
        <section id="peel-srq" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. PEEL Structure for SRQs</h2>
          <p>
            The PEEL framework is the most effective structure for SRQ answers. Each body paragraph
            should follow this formula:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">P — Point</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">State your argument clearly</p>
              <p className="text-[10px] text-slate-400 mt-1">Start with a clear topic sentence that states your point. This should directly address the question and take a position.</p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;One key reason why the policy was effective is that it addressed the root cause of the problem.&rdquo;</em></p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">E — Evidence</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Support with specific examples</p>
              <p className="text-[10px] text-slate-400 mt-1">Provide concrete evidence: statistics, case studies, named examples, historical facts. Be as specific as possible.</p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;For example, after the implementation of [specific policy] in [year], [specific outcome] occurred. This is evidenced by…&rdquo;</em></p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">E — Explanation</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Explain how the evidence proves your point</p>
              <p className="text-[10px] text-slate-400 mt-1">This is the most important part. Don&apos;t just state evidence — explain <strong className="text-slate-200">why</strong> it supports your argument. Connect the dots for the examiner.</p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;This demonstrates effectiveness because it shows that… The reason this matters is…&rdquo;</em></p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">L — Link</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Link back to the question</p>
              <p className="text-[10px] text-slate-400 mt-1">End the paragraph by explicitly connecting back to the main question. This shows the examiner you haven&apos;t lost sight of the big picture.</p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;Therefore, this supports the view that the policy was effective in achieving its objectives.&rdquo;</em></p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 Aim for <strong className="text-slate-200">3–4 PEEL paragraphs</strong> in your SRQ.
              Two paragraphs arguing for your position, one paragraph presenting a counter-argument,
              and a conclusion that makes a balanced judgement.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="evidence" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Using Evidence in SRQs</h2>
          <p>
            Since the SRQ doesn&apos;t provide sources, your evidence comes from{' '}
            <strong className="text-slate-200">your own knowledge</strong>. Here&apos;s the hierarchy
            of evidence quality:
          </p>

          <div className="space-y-2">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-lg">🥇</span>
              <div>
                <p className="text-xs font-bold text-slate-200">Specific statistics &amp; data</p>
                <p className="text-[10px] text-slate-400">&ldquo;70% of respondents reported…&rdquo; or &ldquo;GDP increased by 5% between 2010 and 2015.&rdquo;</p>
              </div>
            </div>
            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3 flex items-center gap-3">
              <span className="text-indigo-400 font-bold text-lg">🥈</span>
              <div>
                <p className="text-xs font-bold text-slate-200">Named examples &amp; case studies</p>
                <p className="text-[10px] text-slate-400">&ldquo;The SERS programme in Singapore&apos;s Ang Mo Kio estate demonstrated…&rdquo;</p>
              </div>
            </div>
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex items-center gap-3">
              <span className="text-amber-400 font-bold text-lg">🥉</span>
              <div>
                <p className="text-xs font-bold text-slate-200">General trends &amp; patterns</p>
                <p className="text-[10px] text-slate-400">&ldquo;Many developed countries experienced a rise in… during the post-war period.&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <p className="text-xs text-red-300 font-bold">❌ Avoid vague evidence like &ldquo;many people think&rdquo; or &ldquo;studies show&rdquo; without specifics. The examiner has seen thousands of generic answers — specific evidence is what earns marks.</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="evaluation" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Evaluation &amp; Balanced Judgement</h2>
          <p>
            What separates L3 from L2 is <strong className="text-slate-200">evaluation</strong> —
            the ability to see both sides and make a reasoned judgement. Here&apos;s how to
            demonstrate evaluation in your SRQ:
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">🔄 Address Counter-Arguments</h3>
              <p className="text-xs text-slate-400">
                Dedicate one paragraph to the opposing view. This shows the examiner you understand
                the complexity of the issue. Use phrases like:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>🔹 &ldquo;However, some might argue that…&rdquo;</p>
                <p>🔹 &ldquo;On the other hand, it could be said that…&rdquo;</p>
                <p>🔹 &ldquo;A counter-argument to this view is…&rdquo;</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">⚖️ Weigh the Evidence</h3>
              <p className="text-xs text-slate-400">
                In your conclusion, don&apos;t just repeat your main points —{' '}
                <strong className="text-slate-200">weigh</strong> both sides and make a clear
                judgement. Use a nuanced conclusion:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>✅ <span className="text-emerald-400">&ldquo;On balance, while [counter-argument] has some merit, the evidence strongly supports [my position] because…&rdquo;</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Real Examples: L1 vs L3 Responses</h2>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sample Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              &ldquo;Do you agree that meritocracy is the most important principle in Singapore&apos;s
              education system? Explain your answer.&rdquo;
            </blockquote>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L1 Response (1–2 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Meritocracy is important in Singapore&apos;s education system. It means
                people are rewarded based on their abilities. Students work hard to do well in
                exams. This is good because it gives everyone a fair chance.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 space-y-1">
                <p>❌ No clear argument or thesis</p>
                <p>❌ No specific evidence or examples</p>
                <p>❌ Descriptive — doesn&apos;t answer &ldquo;most important&rdquo;</p>
                <p>❌ No evaluation or counter-argument</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L3 Response (7–8 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                While meritocracy is undeniably a cornerstone of Singapore&apos;s education system,
                I argue that it is not the <em>most</em> important principle — national cohesion
                and bilingualism have played equally critical roles in shaping Singapore&apos;s
                unique educational approach.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">One reason meritocracy is highly valued</strong>{' '}
                is that it drives academic excellence. Singapore&apos;s consistent top rankings in
                PISA and TIMSS — the gold standard of international education benchmarks —
                demonstrate that the competitive, exam-based system produces strong results.
                Students are motivated to excel because the system rewards hard work, as seen in
                the Edusave Awards and the encouragement of academic scholarships, which recognise
                and fund top performers regardless of background.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">However</strong>, some critics argue that an
                over-emphasis on meritocracy creates a narrow definition of success. The streaming
                system, while designed to cater to different learning paces, has been criticised
                for labelling students early and creating a &ldquo;sink or swim&rdquo; culture.
                Additionally, research has shown that students from higher-income families have
                access to more tuition and enrichment, which challenges the idea of a truly level
                playing field.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">Overall</strong>, while meritocracy is a
                significant principle, it works best alongside other values like inclusivity and
                holistic development. The most effective education systems balance academic rigour
                with social and emotional learning, as Singapore has increasingly recognised
                through its shift towards SkillsFuture and lifelong learning.
              </p>
              <div className="text-[10px] text-emerald-400 space-y-1 mt-2">
                <p>✅ Clear thesis with nuanced position</p>
                <p>✅ PEEL structure in each paragraph</p>
                <p>✅ Specific evidence (PISA, TIMSS, Edusave, SkillsFuture)</p>
                <p>✅ Addresses counter-argument (criticism of streaming, inequality)</p>
                <p>✅ Strong, balanced conclusion</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="common-mistakes" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Common Mistakes That Cost You Marks</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No thesis statement</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Starting your essay without a clear position. Your introduction must state{' '}
                  <strong className="text-slate-200">whether you agree or disagree</strong> and
                  give a brief preview of your argument.
                </p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">One-sided arguments</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Only presenting evidence that supports your position. Top students{' '}
                  <strong className="text-slate-200">actively engage with</strong> counter-arguments
                  and explain why their position still holds.
                </p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Weak conclusion</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A conclusion that just repeats the introduction. Your conclusion should{' '}
                  <strong className="text-slate-200">weigh the evidence</strong> and make a final
                  judgement that reflects the complexity of your argument.
                </p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Vague or generic evidence</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;Many countries have this problem&rdquo; or &ldquo;Research shows&rdquo;
                  without specifics. Every claim needs a{' '}
                  <strong className="text-slate-200">concrete example</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">8. How to Practice Effectively</h2>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-black text-indigo-300">🎯 Use MARKUP&apos;s Essay Generator</h3>
            <p className="text-xs text-slate-400">
              Generate unlimited SRQ questions on every O-Level Social Studies topic. Write your
              essay in the canvas, then get instant LORMS-aligned grading with feedback on your
              argument structure, use of evidence, and evaluation technique.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
            >
              Try SRQ Practice Now →
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Quick Practice Tips:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1.5">
              <li>Spend 3 minutes planning before writing — thesis, 3 body points, counter-argument, conclusion</li>
              <li>Use PEEL for every body paragraph — mark P, E, E, L in the margin if it helps</li>
              <li>Include at least one specific named example per paragraph</li>
              <li>Keep to a 20-minute timer — that&apos;s your exam pace for an 8-mark SRQ</li>
              <li>Review your graded essays — did you evaluate or just argue? Was your evidence specific enough?</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master SRQs with AI-powered practice</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP generates unlimited SRQ prompts, grades your essays, and gives you specific
            feedback on every LORMS criterion — including argument strength, evidence quality,
            and evaluation depth.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
          >
            Start SRQ Practice — Free
          </Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/historical-context-essays" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: Historical Context
            </Link>
            <Link href="/tips/study-strategy" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: Study Strategy →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
