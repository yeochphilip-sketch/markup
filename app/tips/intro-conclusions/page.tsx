import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Write Killer Introductions & Conclusions for SEQ and SRQ',
  description:
    'Master the art of writing powerful introductions and conclusions for O-Level History SEQ and Social Studies SRQ essays. Templates, examples, and LORMS-aligned advice for top bands.',
  openGraph: {
    title: 'How to Write Killer Introductions & Conclusions — MARKUP Tips',
    description:
      'Master introductions and conclusions for O-Level SEQ and SRQ essays. Templates, worked examples, and common mistakes that cost marks.',
  },
};

export default function IntroConclusionsPage() {
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
          <span className="text-slate-400">Intro & Conclusions</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Essay Tips</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">10 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Write Killer Introductions & Conclusions for SEQ and SRQ
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Most students spend 90% of their essay time on body paragraphs — but a weak intro
            or conclusion can drag down your entire LORMS band. Here&apos;s how to write bookends
            that impress examiners.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-black text-indigo-400">M</div>
            <div>
              <p className="text-sm font-bold text-slate-300">MARKUP Team</p>
              <p className="text-[10px] text-slate-600">Updated July 2026</p>
            </div>
          </div>
        </div>

        {/* ToC */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 space-y-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">In this guide</h2>
          <ul className="space-y-1.5 text-sm">
            <li><a href="#why-bookends" className="text-indigo-400 hover:text-indigo-300 transition">1. Why Your Intro and Conclusion Matter More Than You Think</a></li>
            <li><a href="#intro-formula" className="text-indigo-400 hover:text-indigo-300 transition">2. The 3-Part Introduction Formula</a></li>
            <li><a href="#intro-examples" className="text-indigo-400 hover:text-indigo-300 transition">3. Intro Examples: Strong vs Weak</a></li>
            <li><a href="#conclusion-formula" className="text-indigo-400 hover:text-indigo-300 transition">4. The 3-Part Conclusion Formula</a></li>
            <li><a href="#conclusion-examples" className="text-indigo-400 hover:text-indigo-300 transition">5. Conclusion Examples: Strong vs Weak</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">6. Common Mistakes With Bookends</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="why-bookends" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. Why Your Intro and Conclusion Matter More Than You Think</h2>
          <p>
            Here&apos;s something examiners don&apos;t tell you but every marker knows: they form
            their initial impression of your essay within <strong className="text-slate-200">the first
            15 seconds</strong> — and that impression heavily influences the final grade.
          </p>
          <p>
            Your <strong className="text-slate-200">introduction</strong> tells the examiner whether
            you understand the question and have a clear argument. Your{' '}
            <strong className="text-slate-200">conclusion</strong> tells them whether you can
            synthesise and make a final judgement. Together, they frame everything in between.
          </p>
          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">The framing effect:</strong> A weak intro
              raises doubts in the examiner&apos;s mind that are hard to shake, even if your body
              paragraphs are strong. A strong intro creates goodwill that carries through the
              entire essay.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="intro-formula" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The 3-Part Introduction Formula</h2>
          <p>
            Every strong introduction — whether for History SEQ or Social Studies SRQ — follows
            three steps. <strong className="text-slate-200">Keep it to 2-4 sentences total.</strong>
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Contextualise (1 sentence)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Briefly establish the historical or social context. Show the examiner you
                understand the broader picture. For History, name the time period and key
                events. For Social Studies, identify the issue or policy area.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>✅ <em>&ldquo;The Cuban Missile Crisis of October 1962 brought the world closer to nuclear war than any other event during the Cold War.&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">State Your Thesis (1-2 sentences)</h3>
              </div>
              <p className="text-xs text-slate-400">
                This is the most important sentence in your essay. Directly answer the question
                with a clear, arguable claim. For Part B (evaluation), this means taking a position
                — &ldquo;To a large extent…&rdquo; or &ldquo;I disagree that…&rdquo;
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>✅ <em>&ldquo;This essay will argue that while Khrushchev&apos;s decision to place missiles in Cuba was driven by Soviet security concerns, it was Kennedy&apos;s firm yet measured response that proved decisive in resolving the crisis.&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Preview Your Arguments (1 sentence)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Briefly signpost the main factors or points you will discuss. This gives the
                examiner a roadmap and shows you have a structured argument.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>✅ <em>&ldquo;This will be demonstrated by analysing the US naval blockade, the secret diplomatic backchannel, and Khrushchev&apos;s domestic pressures.&rdquo;</em></p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-xs text-emerald-300 font-bold">
              🎯 <strong className="text-white">The complete formula:</strong> Context → Thesis →
              Preview. That&apos;s it. 3-4 sentences max. If your introduction is longer than 5
              sentences, you&apos;re overwriting it.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="intro-examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Intro Examples: Strong vs Weak</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* History SEQ */}
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">History SEQ — Strong Introduction</p>
              <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                &ldquo;The Vietnam War (1955–1975) was the longest and most costly Cold War
                conflict for the United States. <span className="text-indigo-400">[Context]</span>{' '}
                This essay argues that while the US policy of containment was the primary driver
                of American involvement, the failure of the South Vietnamese government and the
                nature of guerrilla warfare were equally significant in prolonging the conflict.{' '}
                <span className="text-indigo-400">[Thesis]</span> These factors will be examined
                through the escalation under Kennedy, the strategic failures of the US military,
                and the political instability in Saigon.{' '}
                <span className="text-indigo-400">[Preview]</span>&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 mt-2 space-y-1">
                <p>✔ Context establishes time and scope</p>
                <p>✔ Thesis takes a clear position (not neutral)</p>
                <p>✔ Preview gives the examiner a roadmap</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">History SEQ — Weak Introduction</p>
              <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                &ldquo;The Vietnam War was a war that happened in Vietnam. Many people died.
                America was involved. This essay will talk about the causes of the war.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 mt-2 space-y-1">
                <p>✘ Vague context with no specifics</p>
                <p>✘ No thesis or argument — just &ldquo;talk about causes&rdquo;</p>
                <p>✘ No preview of what will be discussed</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            {/* SS SRQ */}
            <div className="bg-sky-950/20 border border-sky-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Social Studies SRQ — Strong Introduction</p>
              <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                &ldquo;Singapore&apos;s approach to managing ethnic diversity has evolved significantly
                since independence in 1965. <span className="text-indigo-400">[Context]</span> This
                essay will evaluate the effectiveness of key policies, arguing that while the
                Ethnic Integration Policy (EIP) has been largely successful in preventing ethnic
                enclaves, its limitations in fostering deeper social integration must be
                acknowledged. <span className="text-indigo-400">[Thesis]</span> The EIP, grassroots
                organisations like the CDCs, and national education programmes will be examined.{' '}
                <span className="text-indigo-400">[Preview]</span>&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 mt-2 space-y-1">
                <p>✔ Context establishes the issue and time frame</p>
                <p>✔ Thesis takes a nuanced position — acknowledges both sides</p>
                <p>✔ Preview lists the specific policies to be evaluated</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="conclusion-formula" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. The 3-Part Conclusion Formula</h2>
          <p>
            The conclusion is <strong className="text-slate-200">not</strong> a summary. The
            examiner has just read your essay — they don&apos;t need you to repeat it. Instead,
            your conclusion should do three things:
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400">1</span>
                <h3 className="text-sm font-black text-white">Synthesise, Don&apos;t Summarise</h3>
              </div>
              <p className="text-xs text-slate-400">
                Weave your main arguments together rather than listing them. Show how they interact.
                Instead of &ldquo;Factor A was important. Factor B was also important,&rdquo; write
                &ldquo;While Factor A created the conditions for X, it was Factor B that was decisive
                because&hellip;&rdquo;
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400">2</span>
                <h3 className="text-sm font-black text-white">Make a Final Judgement</h3>
              </div>
              <p className="text-xs text-slate-400">
                For Part B (evaluation), this is where you give your definitive answer to the
                question. Use weighted language: &ldquo;On balance,&rdquo; &ldquo;Ultimately,&rdquo;
                &ldquo;To a large/small extent.&rdquo; Don&apos;t sit on the fence — the rubric
                rewards clear judgement.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400">3</span>
                <h3 className="text-sm font-black text-white">End With Impact</h3>
              </div>
              <p className="text-xs text-slate-400">
                Leave the examiner with a final thought that reinforces your argument. This could
                be a broader implication, a connection to the present, or a powerful restatement
                of your thesis. Make it memorable.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="conclusion-examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Conclusion Examples: Strong vs Weak</h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">History SEQ — Strong Conclusion</p>
              <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                &ldquo;In conclusion, while containment ideology provided the strategic rationale
                and the instability of South Vietnam created the conditions for US involvement,
                it was the nature of guerrilla warfare — specifically the Viet Cong&apos;s
                ability to neutralise American technological superiority through hit-and-run
                tactics and the Ho Chi Minh Trail — that ultimately made the war unwinnable for
                the US. The political costs of a &lsquo;limited war&rsquo; against a determined
                insurgency, rather than any single cause, sealed America&apos;s defeat.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 mt-2 space-y-1">
                <p>✔ Synthesises factors together, not just listing them</p>
                <p>✔ Makes a clear final judgement</p>
                <p>✔ Ends with a strong, memorable claim</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">History SEQ — Weak Conclusion</p>
              <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                &ldquo;In conclusion, the Vietnam War had many causes. First, containment was
                important. Second, the South Vietnamese government was weak. Third, the Viet Cong
                used guerrilla warfare. So I think all these factors caused the war.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 mt-2 space-y-1">
                <p>✘ Simply repeats arguments without synthesis</p>
                <p>✘ No evaluative judgement — &ldquo;all these factors&rdquo; is vague</p>
                <p>✘ Informal language (&ldquo;So I think&rdquo;)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Social Studies SRQ — Strong Conclusion</p>
              <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                &ldquo;On balance, Singapore&apos;s strategies for managing ethnic diversity have
                been largely effective in achieving their primary goal of preventing racial conflict.
                The EIP has demonstrably prevented ethnic enclaves, while grassroots organisations
                have promoted inter-racial interaction. However, the persistence of racial
                stereotypes and the rise of online racial discourse suggest that these policies
                address structural integration more effectively than social integration. A holistic
                approach combining policy with education and community engagement remains
                necessary.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 mt-2 space-y-1">
                <p>✔ Synthesises the overall effectiveness with nuance</p>
                <p>✔ Makes a clear judgement (&ldquo;largely effective&rdquo;)</p>
                <p>✔ Acknowledges limitations without undermining the argument</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="common-mistakes" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Common Mistakes With Bookends</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg shrink-0">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Writing a &ldquo;shopping list&rdquo; introduction</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;This essay will talk about three factors: A, B, and C&rdquo; — this is
                  not a thesis. A thesis takes a <strong className="text-slate-200">position</strong>.
                  Without a position, your essay is descriptive, not argumentative.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg shrink-0">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Introducing new arguments in the conclusion</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The conclusion is for <strong className="text-slate-200">synthesis</strong>, not
                  discovery. If you think of a new point while writing the conclusion, add it as
                  a body paragraph instead.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg shrink-0">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Overwriting the introduction (5+ sentences)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A long intro wastes time and dilutes your thesis. Keep it tight. The examiner
                  wants to see your argument, not read a history of the topic. <strong className="text-slate-200">3-4 sentences max.</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg shrink-0">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Using &ldquo;In conclusion&rdquo; as a crutch</h3>
                <p className="text-xs text-slate-400 mt-1">
                  While &ldquo;In conclusion&rdquo; is fine, varying your transition shows
                  linguistic sophistication. Try &ldquo;On balance,&rdquo; &ldquo;Ultimately,&rdquo;
                  &ldquo;Taking all factors into account,&rdquo; or &ldquo;When weighed together.&rdquo;
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg shrink-0">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No conclusion at all</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Running out of time and skipping the conclusion costs you LORMS marks. Even a
                  single sentence synthesis and judgement is better than nothing. Prioritise
                  finishing your conclusion over perfecting your last body paragraph.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              🎯 <strong className="text-slate-200">Pro tip for exam conditions:</strong> Write your
              introduction first, then your body paragraphs, then your conclusion. If you&apos;re
              running short on time, write a one-sentence conclusion that makes your final judgement
              clear. A short conclusion beats no conclusion every time.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950/80 border border-emerald-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Practise writing intros & conclusions</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate an SEQ or SRQ question in MARKUP and write just the introduction and
            conclusion. Get instant LORMS-aligned feedback on your thesis clarity and
            synthesising ability.
          </p>
          <Link href="/dashboard" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20">Start Practising — Free</Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/peel-framework" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">← Previous: PEEL Framework</Link>
            <Link href="/tips/seq-evaluation" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">Next: SEQ Evaluation →</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
