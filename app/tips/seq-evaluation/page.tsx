import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Write A1 SEQ Evaluation Essays (L4/13 Framework)',
  description:
    'Master the SEQ Evaluation question for O-Level Elective History. Learn how to analyse, evaluate, and construct a balanced judgement with the 3-part framework that consistently scores L4/13.',
  openGraph: {
    title: 'How to Write A1 SEQ Evaluation Essays — MARKUP Tips',
    description:
      'Master the SEQ Evaluation question for O-Level History. 3-part framework for balanced analysis and judgement with real SEAB-style examples.',
  },
};

export default function SEQEvaluationPage() {
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
          <span className="text-slate-400">SEQ Evaluation</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Essay Tips</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">11 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Write A1 SEQ Evaluation Essays
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The SEQ Evaluation question is the most demanding question on the O-Level History paper —
            worth up to 13 marks. Here&apos;s the 3-part framework that top students use to construct
            sophisticated, balanced evaluations.
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
            <li><a href="#what-is-evaluation" className="text-indigo-400 hover:text-indigo-300 transition">1. What is the SEQ Evaluation Question?</a></li>
            <li><a href="#lorms-breakdown" className="text-indigo-400 hover:text-indigo-300 transition">2. The LORMS Breakdown for SEQ Evaluation</a></li>
            <li><a href="#three-part" className="text-indigo-400 hover:text-indigo-300 transition">3. The 3-Part Evaluation Framework</a></li>
            <li><a href="#judgement" className="text-indigo-400 hover:text-indigo-300 transition">4. Making a Sophisticated Judgement</a></li>
            <li><a href="#full-example" className="text-indigo-400 hover:text-indigo-300 transition">5. Full Worked Example: L4 Response</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">6. Common Mistakes That Cost You Bands</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">7. How to Practice Effectively</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-evaluation" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is the SEQ Evaluation Question?</h2>
          <p>
            The SEQ (Structured Essay Question) Evaluation question is the{' '}
            <strong className="text-slate-200">highest-stakes question</strong> on the O-Level Elective
            History paper, worth up to <strong className="text-slate-200">13 marks</strong>. It asks
            you to evaluate a historical statement or proposition and arrive at a balanced judgement.
          </p>
          <p>It typically takes one of these forms:</p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;How far do you agree that [statement about historical causation/impact/significance]?
            Explain your answer.&rdquo;
          </blockquote>
          <p>Or alternatively:</p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;To what extent was [historical development] the most important factor in [historical
            outcome]? Explain your answer.&rdquo;
          </blockquote>
          <p>
            These questions are deliberately designed to have <strong className="text-slate-200">no
            single correct answer</strong>. The examiner rewards you for the{' '}
            <strong className="text-emerald-400">quality of your reasoning</strong>, not your
            conclusion. You can argue that you completely agree, completely disagree, or (most
            commonly) take a nuanced middle position — as long as you support it with evidence.
          </p>
        </section>

        {/* Section 2 */}
        <section id="lorms-breakdown" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The LORMS Breakdown for SEQ Evaluation</h2>
          <p>
            Understanding the rubric is the first step to scoring L4. Here is how the marks are
            allocated:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L4 — 10–13 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Sophisticated Evaluation</p>
              <p className="text-[10px] text-slate-500 mt-1">Balanced argument with multiple factors evaluated. Clear, substantiated judgement. Uses precise historical evidence throughout.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">L3 — 6–9 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Explanatory</p>
              <p className="text-[10px] text-slate-500 mt-1">Good knowledge but largely descriptive. Identifies factors but evaluates superficially. Weak or absent judgement.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L2 — 3–5 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Descriptive</p>
              <p className="text-[10px] text-slate-500 mt-1">Narrative account without analysis. Does not address the question directly.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L1 — 0–2 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">IRRELEVANT</p>
              <p className="text-[10px] text-slate-500 mt-1">Off-topic or no historical knowledge displayed.</p>
            </div>
          </div>

          <p>
            <strong className="text-slate-200">Key insight:</strong> The jump from L3 to L4 is the
            hardest. Many students can explain factors well (L3), but fail to{' '}
            <strong className="text-emerald-400">evaluate</strong> them — weighing their importance
            relative to each other and arriving at a clear, justified conclusion.
          </p>
        </section>

        {/* Section 3 */}
        <section id="three-part" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. The 3-Part Evaluation Framework</h2>
          <p>
            Every top-scoring SEQ Evaluation essay follows this structure. Master it, and you
            can apply it to any evaluation question.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Introduction — Set Up Your Argument</h3>
              </div>
              <p className="text-xs text-slate-400">
                Your introduction should do three things:
              </p>
              <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1 mt-2">
                <li><strong className="text-slate-200">Address the question directly</strong> — rephrase it to show you understand what is being asked</li>
                <li><strong className="text-slate-200">State your position</strong> — take a clear stance (agree, disagree, or partially agree)</li>
                <li><strong className="text-slate-200">Signpost your argument</strong> — briefly outline the factors you will evaluate</li>
              </ul>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2">
                <p className="text-emerald-400">💡 Example opening:</p>
                <p className="italic">&ldquo;This essay will argue that while economic factors played a significant role in causing the Cold War, they were not the most important cause. Instead, ideological differences between the US and USSR were ultimately more significant because they shaped how each side interpreted the other&apos;s actions.&rdquo;</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Body Paragraphs — Evaluate, Don&apos;t Just Explain</h3>
              </div>
              <p className="text-xs text-slate-400">
                Each body paragraph should evaluate a single factor. Use the PEEL structure for
                each paragraph, but add a layer of <strong className="text-slate-200">evaluation</strong>{' '}
                at the end:
              </p>
              <div className="space-y-2 mt-2 text-[10px]">
                <p><strong className="text-indigo-400">P</strong>oint — State the factor you are evaluating</p>
                <p><strong className="text-emerald-400">E</strong>vidence — Provide specific historical evidence</p>
                <p><strong className="text-amber-400">E</strong>xplanation — Explain how this factor contributed to the outcome</p>
                <p><strong className="text-rose-400">L</strong>ink — <strong className="text-slate-200">Evaluate:</strong> How important is this factor compared to others? What are its limitations?</p>
              </div>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2">
                <p className="text-amber-400">💡 Evaluative Link examples:</p>
                <p className="italic mt-1">&ldquo;However, this factor alone cannot explain why tensions escalated into outright conflict — ideological rivalry provided the necessary hostility.&rdquo;</p>
                <p className="italic mt-1">&ldquo;While significant, this factor was time-bound: economic considerations mattered most in the immediate post-war period, whereas ideological divisions persisted for decades.&rdquo;</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Conclusion — A Substantiated Judgement</h3>
              </div>
              <p className="text-xs text-slate-400">
                The conclusion is where you <strong className="text-slate-200">weigh up</strong> the
                factors you have discussed and arrive at a final judgement. This is NOT a summary —
                it is your <strong className="text-emerald-400">most important paragraph</strong>.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                A strong conclusion answers three questions:
              </p>
              <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1 mt-2">
                <li>Which factor was <strong className="text-slate-200">most important</strong> and why?</li>
                <li>How do the factors <strong className="text-slate-200">relate to each other</strong>? (Some factors may be causes of other factors)</li>
                <li>What is your <strong className="text-slate-200">overall judgement</strong> on the question? (Agree/disagree/partially agree — and to what extent)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="judgement" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Making a Sophisticated Judgement</h2>
          <p>
            The single biggest difference between L3 and L4 is the quality of the{' '}
            <strong className="text-slate-200">judgement</strong>. Here are the characteristics of
            a sophisticated judgement:
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Prioritised, not just listed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Don&apos;t just say &ldquo;all factors were important.&rdquo; Rank them. Tell the
                  examiner which one was <strong className="text-slate-200">most</strong> important and
                  explain your reasoning.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Shows interconnection between factors</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Factors rarely operate in isolation. Show how they interact — for example, how
                  economic factors <strong className="text-slate-200">reinforced</strong> ideological
                  distrust, or how a key individual&apos;s actions were shaped by the political context.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Uses qualifying language</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Avoid absolute statements like &ldquo;this is definitely the most important factor.&rdquo;
                  Use nuanced language: &ldquo;arguably,&rdquo; &ldquo;to a large extent,&rdquo;
                  &ldquo;this was significant in the short term but less so in the long run.&rdquo;
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Acknowledges counterarguments</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A sophisticated judgement doesn&apos;t ignore the other side. Show that you have
                  considered alternative views before arriving at your conclusion.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Strong Judgement Example</p>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;In conclusion, while economic factors were undoubtedly a significant cause of the
              Cold War — particularly the clash between the US desire for open capitalist markets and
              the Soviet need for reparations — <strong className="text-slate-200">ideological
              differences</strong> were ultimately more important. This is because ideology shaped
              <strong className="text-slate-200">how each side interpreted</strong> the other&apos;s
              economic actions: the USSR viewed the Marshall Plan as capitalist encirclement, while
              the US saw Soviet control of Eastern Europe as communist expansionism. Without the
              ideological lens of mutually exclusive worldviews, economic competition could have been
              resolved through negotiation. Therefore, I agree to a <strong className="text-slate-200">limited
              extent</strong> that economic factors were the main cause — they created the conditions
              for conflict, but ideology made that conflict <strong className="text-emerald-400">inevitable</strong>.&rdquo;
            </p>
            <p className="text-[9px] text-emerald-400">✔ Prioritises factors (ideology &gt; economics)</p>
            <p className="text-[9px] text-emerald-400">✔ Shows interconnection (economics + ideology)</p>
            <p className="text-[9px] text-emerald-400">✔ Uses qualifying language (&ldquo;limited extent&rdquo;)</p>
            <p className="text-[9px] text-emerald-400">✔ Acknowledges both sides of the argument</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="full-example" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Full Worked Example: L4 Response</h2>
          <p>
            Here is a complete L4-level essay response to demonstrate how all the pieces come together.
            The question is on the Cold War, but the structure applies to any SEQ Evaluation topic.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              &ldquo;How far do you agree that the dropping of the atomic bombs was the main reason
              for Japan&apos;s surrender in 1945? Explain your answer.&rdquo;
            </blockquote>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="border-l-2 border-indigo-500 pl-3 text-xs text-slate-300 leading-relaxed space-y-3">
              <div>
                <p className="text-[9px] font-bold text-green-400 uppercase">Introduction</p>
                <p className="italic mt-1">
                  This essay argues that while the atomic bombs were a significant factor in Japan&apos;s
                  surrender, they were ultimately the <strong className="text-slate-200">&lsquo;final
                  push&rsquo;</strong> rather than the sole cause. The Soviet declaration of war and
                  Japan&apos;s already-deteriorating strategic position were equally, if not more,
                  important in forcing the surrender decision.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-green-400 uppercase">Body 1: The Atomic Bombs</p>
                <p className="italic mt-1">
                  <strong className="text-indigo-400">[P]</strong> The atomic bombs were undoubtedly
                  significant in Japan&apos;s decision to surrender. <strong className="text-emerald-400">[E]</strong>{' '}
                  The bombing of Hiroshima on 6 August 1945 killed an estimated 140,000 people, and
                  the Nagasaki bombing three days later killed a further 70,000. The destruction was
                  unprecedented — a single bomb could annihilate an entire city. <strong className="text-amber-400">[E]</strong>{' '}
                  This shocked the Japanese leadership, who had been preparing for a conventional
                  invasion that would have allowed them to inflict heavy casualties on the Allies.
                  The atomic bomb changed the nature of war overnight. <strong className="text-rose-400">[L]</strong>{' '}
                  However, the bomb alone did not cause surrender — the Japanese Supreme Council was
                  deadlocked even after Hiroshima, and the military wanted to continue fighting. This
                  suggests that the bomb was a powerful shock, but not sufficient on its own.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-green-400 uppercase">Body 2: The Soviet Declaration of War</p>
                <p className="italic mt-1">
                  <strong className="text-indigo-400">[P]</strong> The Soviet declaration of war on
                  8 August 1945 was arguably the decisive factor. <strong className="text-emerald-400">[E]</strong>{' '}
                  The Soviet Union had remained neutral under the 1941 Soviet-Japanese Neutrality Pact.
                  However, at the Yalta Conference, Stalin agreed to enter the war against Japan within
                  three months of Germany&apos;s surrender. On 8 August, the USSR launched Operation
                  August Storm, invading Japanese-occupied Manchuria. <strong className="text-amber-400">[E]</strong>{' '}
                  This destroyed Japan&apos;s last strategic hope. Japanese military planners had been
                  counting on the Soviet Union to mediate a negotiated peace — not to join the attack.
                  With the USSR now an enemy, Japan faced simultaneous threats from all sides with no
                  diplomatic exit. <strong className="text-rose-400">[L]</strong> This factor was likely
                  more decisive than the atomic bombs because it removed Japan&apos;s last viable
                  diplomatic option — the bombs were a military shock, but the Soviet entry was a
                  strategic catastrophe.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-green-400 uppercase">Body 3: Japan&apos;s Deteriorating Position</p>
                <p className="italic mt-1">
                  <strong className="text-indigo-400">[P]</strong> Japan&apos;s already desperate
                  strategic situation before August 1945 must also be considered. <strong className="text-emerald-400">[E]</strong>{' '}
                  By mid-1945, Japan&apos;s navy had been destroyed, its merchant fleet was crippled
                  by US submarines, its cities were being firebombed (Tokyo alone lost 100,000
                  civilians in March 1945), and it was running critically short of oil, food, and
                  industrial capacity. <strong className="text-amber-400">[E]</strong> This meant that
                  Japan was already defeated in any conventional sense — the atomic bombs accelerated
                  a surrender that was already inevitable. <strong className="text-rose-400">[L]</strong>{' '}
                  While this context was the underlying condition that made surrender possible, it
                  failed to produce surrender by itself (the military was still fighting). This shows
                  that a combination of factors, not any single one, was needed to break the
                  deadlock.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-green-400 uppercase">Conclusion (Judgement)</p>
                <p className="italic mt-1">
                  In conclusion, I agree <strong className="text-slate-200">to a limited extent</strong>{' '}
                  that the atomic bombs were the main reason for Japan&apos;s surrender. The bombs
                  provided the psychological shock that pushed the leadership towards surrender, but
                  they were effective largely because Japan was already strategically defeated, and
                  because the Soviet entry into the war removed Japan&apos;s last diplomatic hope. The
                  most important factor was arguably the combination of the Soviet declaration of war
                  and Japan&apos;s already hopeless position — the bombs were the catalyst that
                  triggered a decision that had become inevitable. Therefore, while the atomic bombs
                  were significant, they should be understood as <strong className="text-slate-200">the
                  final push</strong> rather than the main cause of Japan&apos;s surrender.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="common-mistakes" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Common Mistakes That Cost You Bands</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Writing a narrative instead of an evaluation</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;First this happened, then that happened&rdquo; is a story, not an evaluation.
                  Every paragraph must <strong className="text-slate-200">argue a point</strong> about
                  the question, not just describe events.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No clear judgement</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;There were many factors&rdquo; is not a judgement. The examiner needs to
                  know <strong className="text-slate-200">which factor you think mattered most</strong>{' '}
                  and why. If you can&apos;t decide, the essay is still at L3.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Treating factors in isolation</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Factors interact. Economic causes fuel ideological conflict. Key individuals exploit
                  political circumstances. The best essays show{' '}
                  <strong className="text-slate-200">how factors connect</strong> and reinforce each other.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Ignoring the counterargument</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A one-sided essay is not an evaluation. Always acknowledge why someone might disagree
                  with your position, then explain why your view is stronger. This demonstrates
                  <strong className="text-slate-200"> higher-order thinking</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. How to Practice Effectively</h2>

          <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-black text-emerald-300">🎯 Use MARKUP&apos;s SEQ Generator</h3>
            <p className="text-xs text-slate-400">
              MARKUP generates full SEQ Evaluation questions on every O-Level History topic. Write
              your essay in the canvas and get instant LORMS-aligned grading that evaluates your
              argument structure, evidence use, and quality of judgement. The AI feedback tells you
              exactly which band your essay is at and what to improve.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
            >
              Try SEQ Practice Now →
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Quick Practice Tips:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1.5">
              <li>Before writing, spend 5 minutes planning your factors and your final judgement</li>
              <li>Aim for 3–4 body paragraphs, each evaluating a different factor</li>
              <li>Allocate time: 5 min planning → 35 min writing → 5 min reviewing for a 13-mark question</li>
              <li>Always end each paragraph with an evaluative link back to the question</li>
              <li>Use the MARKUP grading feedback to identify whether your conclusion is truly evaluative or just descriptive</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950/80 border border-emerald-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master evaluation with AI feedback</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Write a full SEQ essay in MARKUP and get instant LORMS grading with feedback on your
            argument structure, evidence, and judgement quality.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Start SEQ Practice — Free
          </Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/intro-conclusions" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: Intro & Conclusions
            </Link>
            <Link href="/tips/historical-context-essays" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: Historical Context →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
