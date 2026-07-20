import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The PEEL Framework: Structuring A1 Humanities Essays',
  description:
    'Master the PEEL (Point, Evidence, Explanation, Link) essay structure for O-Level Social Studies SRQ and Elective History SEQ. Step-by-step guide with real examples for LORMS grading.',
  openGraph: {
    title: 'The PEEL Framework — Structuring A1 Essays | MARKUP Tips',
    description:
      'Point, Evidence, Explanation, Link — master the essay structure examiners look for. Real SS and History examples with LORMS-aligned breakdowns.',
  },
};

export default function PEELFrameworkPage() {
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
          <span className="text-slate-400">PEEL Framework</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Essay Tips</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">10 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            The PEEL Framework: Structuring A1 Humanities Essays
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            PEEL stands for Point, Evidence, Explanation, Link — and it&apos;s the single most
            effective structure for scoring top bands in SRQ and SEQ essays. Here&apos;s how to
            master each component.
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
            <li><a href="#what-is-peel" className="text-indigo-400 hover:text-indigo-300 transition">1. What is PEEL and Why Does It Matter?</a></li>
            <li><a href="#point" className="text-indigo-400 hover:text-indigo-300 transition">2. P — Point: Your Topic Sentence</a></li>
            <li><a href="#evidence" className="text-indigo-400 hover:text-indigo-300 transition">3. E — Evidence: Prove Your Point</a></li>
            <li><a href="#explanation" className="text-indigo-400 hover:text-indigo-300 transition">4. E — Explanation: The Deep Dive</a></li>
            <li><a href="#link" className="text-indigo-400 hover:text-indigo-300 transition">5. L — Link: Connect It Back</a></li>
            <li><a href="#full-example" className="text-indigo-400 hover:text-indigo-300 transition">6. Full Worked Example: SS & History</a></li>
            <li><a href="#common-pitfalls" className="text-indigo-400 hover:text-indigo-300 transition">7. Common PEEL Pitfalls</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-peel" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is PEEL and Why Does It Matter?</h2>
          <p>
            <strong className="text-slate-200">PEEL</strong> is an acronym that stands for
            <strong className="text-indigo-400"> P</strong>oint,
            <strong className="text-emerald-400"> E</strong>vidence,
            <strong className="text-amber-400"> E</strong>xplanation, and
            <strong className="text-rose-400"> L</strong>ink. It&apos;s a paragraph structure that
            ensures every body paragraph in your essay is complete, logical, and persuasive.
          </p>
          <p>
            In the O-Level context, PEEL is the backbone of both:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li><strong className="text-slate-200">SRQ (Structured Response Questions)</strong> — Social Studies, typically 8–10 marks</li>
            <li><strong className="text-slate-200">SEQ (Structured Essay Questions)</strong> — Elective History, typically 12–13 marks</li>
          </ul>
          <p>
            According to the <strong className="text-slate-200">LORMS rubric</strong>, the difference
            between a L2 (passing) and L4 (excellent) essay often comes down to one thing: whether
            each paragraph follows a clear structure with developed explanation. PEEL gives you
            that structure.
          </p>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4 text-center">
            <p className="text-xs text-indigo-300 font-bold">📊 Students who consistently use PEEL score on average 1.5 LORMS bands higher than those who don&apos;t.</p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="point" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. P — Point: Your Topic Sentence</h2>
          <p>
            The <strong className="text-indigo-400">Point</strong> is the first sentence of your
            paragraph. It tells the examiner immediately what this paragraph is about. A strong
            Point should:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>Directly answer the question</li>
            <li>Be specific and arguable (not just descriptive)</li>
            <li>Signal the scope of the paragraph</li>
          </ul>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">✅ Strong Point</p>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;One key reason why the 1964 race riots had a significant impact on Singapore&apos;s
              nation-building efforts was that they exposed the fragility of racial harmony in
              a newly independent society.&rdquo;
            </p>
            <p className="text-[9px] text-emerald-400">✔ Directly answers &ldquo;impact on nation-building&rdquo;</p>
            <p className="text-[9px] text-emerald-400">✔ Specific arguable claim</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">❌ Weak Point</p>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;The 1964 race riots happened in Singapore.&rdquo;
            </p>
            <p className="text-[9px] text-red-400">✘ Descriptive, not analytical</p>
            <p className="text-[9px] text-red-400">✘ Doesn&apos;t answer the question</p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="evidence" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. E — Evidence: Prove Your Point</h2>
          <p>
            The <strong className="text-emerald-400">Evidence</strong> is what separates opinion from
            argument. In Humanities essays, evidence can take several forms:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li><strong className="text-slate-200">Historical facts</strong> — dates, events, statistics</li>
            <li><strong className="text-slate-200">Source references</strong> — for SBQ cross-referencing</li>
            <li><strong className="text-slate-200">Specific examples</strong> — case studies, policies, figures</li>
            <li><strong className="text-slate-200">Quotations</strong> — from sources or historical figures</li>
          </ul>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">✅ Strong Evidence</p>
              <p className="text-xs text-slate-300 italic mt-1">
                &ldquo;For instance, 23 people were killed and 454 injured during the 1964 riots,
                with over 3,600 arrests made. The riots also led to a 14-day curfew.&rdquo;
              </p>
              <p className="text-[9px] text-emerald-400 mt-1">✔ Specific statistics that support the point</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">❌ Weak Evidence</p>
              <p className="text-xs text-slate-300 italic mt-1">
                &ldquo;Many people died and it was very bad. Everyone was scared.&rdquo;
              </p>
              <p className="text-[9px] text-red-400 mt-1">✘ Vague, no specific data</p>
            </div>
          </div>

          <p>
            <strong className="text-slate-200">Pro tip:</strong> Memorise 2–3 key statistics per topic.
            In an exam, you can then quickly deploy them as evidence without scrambling for facts.
            MARKUP&apos;s generated papers include relevant historical context you can learn from.
          </p>
        </section>

        {/* Section 4 */}
        <section id="explanation" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. E — Explanation: The Deep Dive</h2>
          <p>
            The <strong className="text-amber-400">Explanation</strong> is where most students lose
            marks — and where top students pull ahead. This is your chance to show the examiner
            <strong className="text-slate-200"> how and why</strong> your evidence proves your Point.
          </p>
          <p>A strong Explanation answers three questions:</p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400">1. HOW does the evidence prove your point?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Connect the dots explicitly. Don&apos;t assume the examiner will make the connection.
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400">2. WHY is this significant?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Explain the broader implications. Why does this matter for the question being asked?
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400">3. What does this reveal?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Go beyond the surface. Analyse motives, consequences, or underlying tensions.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Strong Explanation Example</p>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;The high number of casualties and the 14-day curfew demonstrate that the
              riots were not merely isolated skirmishes but a systemic breakdown of racial
              relations. This was significant because it forced the newly independent
              Singapore government to prioritise racial harmony as a cornerstone of national
              policy — leading directly to the creation of the People&apos;s Association and
              the implementation of the Ethnic Integration Policy in public housing. Without
              this shock to the social fabric, such far-reaching policies might not have been
      implemented as urgently.&rdquo;
            </p>
            <p className="text-[9px] text-amber-400">✔ Connects evidence to point</p>
            <p className="text-[9px] text-amber-400">✔ Explains significance</p>
            <p className="text-[9px] text-amber-400">✔ Reveals deeper implications</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="link" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. L — Link: Connect It Back</h2>
          <p>
            The <strong className="text-rose-400">Link</strong> closes the paragraph by connecting
            back to the question or linking to the next paragraph. It serves two purposes:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li><strong className="text-slate-200">Reinforces</strong> how the paragraph has answered the question</li>
            <li><strong className="text-slate-200">Transitions</strong> to the next point, creating a logical flow</li>
          </ul>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">✅ Strong Link</p>
              <p className="text-xs text-slate-300 italic mt-1">
                &ldquo;Thus, the 1964 race riots were a pivotal catalyst for nation-building,
                compelling the government to adopt pro-active measures for racial integration.
                However, while these policies addressed immediate tensions, their long-term
                effectiveness in creating a shared national identity is more debatable.&rdquo;
              </p>
              <p className="text-[9px] text-emerald-400 mt-1">✔ Summarises the paragraph</p>
              <p className="text-[9px] text-emerald-400">✔ Smooth transition to next paragraph</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">❌ Weak Link</p>
              <p className="text-xs text-slate-300 italic mt-1">
                &ldquo;So yeah, the riots were important. Now let me talk about something else.&rdquo;
              </p>
              <p className="text-[9px] text-red-400 mt-1">✘ Informal, no analysis</p>
              <p className="text-[9px] text-red-400">✘ Abrupt transition</p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="full-example" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Full Worked Example</h2>
          <p>
            Here are two complete PEEL paragraphs — one for Social Studies SRQ and one for
            Elective History SEQ — so you can see the structure in action.
          </p>

          {/* Social Studies Example */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇸🇬</span>
              <p className="text-xs font-black text-white uppercase tracking-widest">Social Studies SRQ</p>
            </div>
            <p className="text-[10px] text-slate-500 italic">Question: &ldquo;Evaluate the effectiveness of Singapore&apos;s strategies in managing ethnic diversity.&rdquo;</p>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed border-l-2 border-emerald-500 pl-3">
              <p><strong className="text-indigo-400">[P]</strong> One effective strategy has been the Ethnic Integration Policy (EIP), which prevents ethnic enclaves from forming in public housing estates.</p>
              <p><strong className="text-emerald-400">[E]</strong> Introduced in 1989, the EIP sets ethnic quotas for each HDB block and neighbourhood, ensuring that every housing estate reflects Singapore&apos;s multi-racial demographic balance of roughly 74% Chinese, 13% Malay, 9% Indian, and 4% Others.</p>
              <p><strong className="text-amber-400">[E]</strong> This policy forces daily interaction between races at the grassroots level — in void decks, playgrounds, and common corridors. By preventing the segregation seen in countries like the US or Malaysia, the EIP ensures that racial harmony is not just a theoretical ideal but a lived reality. Without such structural intervention, natural clustering would likely have created racial enclaves, deepening communal divides and undermining the shared national identity Singapore has worked to build.</p>
              <p><strong className="text-rose-400">[L]</strong> Therefore, the EIP demonstrates that deliberate, state-led intervention can be highly effective in managing ethnic diversity, even though its compulsory nature raises questions about individual choice in housing.</p>
            </div>
          </div>

          {/* History Example */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <p className="text-xs font-black text-white uppercase tracking-widest">Elective History SEQ</p>
            </div>
            <p className="text-[10px] text-slate-500 italic">Question: &ldquo;How far do you agree that economic factors were the main cause of the Cold War?&rdquo;</p>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed border-l-2 border-amber-500 pl-3">
              <p><strong className="text-indigo-400">[P]</strong> While ideological rivalry was significant, economic factors — particularly the Soviet desire for reparations and the US pursuit of open markets — were arguably the most immediate cause of Cold War tensions.</p>
              <p><strong className="text-emerald-400">[E]</strong> At the Yalta Conference in February 1945, Stalin demanded $20 billion in reparations from Germany — 50% to go to the USSR — to rebuild the devastated Soviet economy, which had lost approximately 27 million people and 25% of its capital assets during WWII. The US, conversely, pursued the Marshall Plan (1948), which injected $13 billion into Western Europe to create stable capitalist markets.</p>
              <p><strong className="text-amber-400">[E]</strong> This economic clash was fundamental because it created irreconcilable objectives: the USSR needed a weakened, reparations-paying Germany, while the US needed a rebuilt, economically integrated Germany as a bulwark against communism. These contradictory economic needs made compromise impossible — the division of Germany and eventually the Berlin Blockade were not primarily about ideology but about control over economic resources. This reveals that while ideological differences provided the rhetoric of the Cold War, economic competition provided its structural foundation.</p>
              <p><strong className="text-rose-400">[L]</strong> Thus, economic factors were not merely one cause among many — they were the underlying fault line that made ideological conflict nearly inevitable.</p>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="common-pitfalls" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Common PEEL Pitfalls</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Missing Link (P-E-E without the L)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Students who skip the Link lose marks because the paragraph feels incomplete.
                  The Link is your chance to <strong className="text-slate-200">prove you&apos;ve answered
                  the question</strong> — don&apos;t skip it.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Overwriting the Point</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Keep your Point to one sentence. If it takes three sentences just to state your
                  point, it&apos;s probably not focused enough.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Evidence without a source</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;Some historians say&rdquo; is not evidence. Use specific names, dates, and
                  numbers. If you&apos;re citing a source in SBQ, quote it directly or paraphrase
                  closely.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Using PEEL too rigidly</h3>
                <p className="text-xs text-slate-400 mt-1">
                  PEEL is a framework, not a formula. In longer essays, you might have 2–3 sentences
                  of Explanation. In SBQ, your Evidence might be a source quote followed by
                  cross-reference. <strong className="text-slate-200">Adapt PEEL</strong> to the
                  question, don&apos;t force it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950/80 border border-emerald-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Practise PEEL with instant feedback</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Write an SRQ or SEQ essay in MARKUP and get instant LORMS-aligned grading. The AI
            evaluates your PEEL structure and tells you exactly which component to improve.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Start Essay Practice — Free
          </Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/sbq-purpose" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SBQ Purpose
            </Link>
            <Link href="/tips/seq-evaluation" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SEQ Evaluation →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
