import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Answer SEQ Questions for Elective History (Complete Guide)',
  description:
    'Master the SEQ (Structured Essay Question) for O-Level Elective History. Learn the structure of Part A and Part B questions, how to plan and write essays, use contextual knowledge, and manage exam time.',
  openGraph: {
    title: 'How to Answer SEQ Questions for History — Complete Guide | MARKUP Tips',
    description:
      'Master the SEQ for O-Level Elective History. Part A vs Part B, planning, essay structure with PEEL, contextual knowledge, and time management strategies.',
  },
};

export default function SEQHistoryGuidePage() {
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
          <span className="text-slate-400">SEQ Guide</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Essay Tips</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">12 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Answer SEQ Questions for Elective History
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The SEQ (Structured Essay Question) is worth up to 25 marks in your O-Level History
            paper — the single highest-value component. Here&apos;s how to plan, structure, and
            write SEQ essays that score top LORMS bands.
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
            <li><a href="#what-is-seq" className="text-indigo-400 hover:text-indigo-300 transition">1. What Is the SEQ? Understanding the History Paper</a></li>
            <li><a href="#part-a-vs-part-b" className="text-indigo-400 hover:text-indigo-300 transition">2. Part A vs Part B — Two Different Skills</a></li>
            <li><a href="#planning" className="text-indigo-400 hover:text-indigo-300 transition">3. How to Plan Your SEQ Essay (5 Minutes)</a></li>
            <li><a href="#essay-structure" className="text-indigo-400 hover:text-indigo-300 transition">4. Essay Structure: Introduction, Body, Conclusion</a></li>
            <li><a href="#ck-seq" className="text-indigo-400 hover:text-indigo-300 transition">5. Using Contextual Knowledge in Your SEQ</a></li>
            <li><a href="#worked-example" className="text-indigo-400 hover:text-indigo-300 transition">6. Worked Example: A Full SEQ Answer</a></li>
            <li><a href="#time-management" className="text-indigo-400 hover:text-indigo-300 transition">7. Time Management for the History Paper</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-seq" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What Is the SEQ? Understanding the History Paper</h2>
          <p>
            The O-Level Elective History paper (Syllabus 2273/01 for the newer syllabus, or
            equivalent) is split into two sections:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Section A: SBQ</p>
              <p className="text-sm font-black text-white mt-1">Source-Based Case Study</p>
              <p className="text-xs text-slate-400 mt-1">
                3–4 sources with 5 sub-questions. Tests your ability to analyse, compare, evaluate
                reliability, infer purpose, and assess utility of historical sources.
              </p>
              <p className="text-[10px] text-indigo-400 mt-2 font-bold">~50 minutes</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Section B: SEQ</p>
              <p className="text-sm font-black text-white mt-1">Structured Essay Questions</p>
              <p className="text-xs text-slate-400 mt-1">
                Choose <strong className="text-slate-200">2 out of 3</strong> essay questions (each
                with Part A and Part B). Tests your ability to construct arguments, evaluate
                causes/consequences, and use contextual knowledge.
              </p>
              <p className="text-[10px] text-emerald-400 mt-2 font-bold">~50 minutes</p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">Why SEQ matters:</strong> The SEQ section is worth
              roughly 50% of your History grade (25 marks out of ~50 total). Your performance here
              often determines whether you score an A or a B.
            </p>
          </div>

          <p>
            <strong className="text-slate-200">Important note for Social Studies students:</strong> The
            Social Studies equivalent of the SEQ is the <strong className="text-slate-200">SRQ
            (Structured Response Question)</strong>. While the SRQ also uses the PEEL structure and
            tests similar skills, it is based on source material and shorter (8–10 marks per question)
            compared to the History SEQ (12–13 marks per question, testing wider contextual
            knowledge). Check out our{' '}
            <Link href="/tips/srq-guide" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              dedicated SRQ guide
            </Link>{' '}
            for Social Studies students.
          </p>
        </section>

        {/* Section 2 */}
        <section id="part-a-vs-part-b" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. Part A vs Part B — Two Different Skills</h2>
          <p>
            Every SEQ question has two parts. It&apos;s crucial to understand that they test
            <strong className="text-slate-200"> different cognitive skills</strong> and require
            different approaches.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Part A — Explanation</p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li><strong className="text-slate-200">Marks:</strong> 8–9 marks</li>
                <li><strong className="text-slate-200">Command words:</strong> Explain, describe, why, what were the causes/consequences</li>
                <li><strong className="text-slate-200">What to do:</strong> Explain historical events, processes, or developments. Demonstrate your knowledge and ability to use it to explain.</li>
                <li><strong className="text-slate-200">Skill focus:</strong> Description + explanation + use of CK</li>
                <li><strong className="text-slate-200">Structure:</strong> 3–4 PEEL paragraphs</li>
              </ul>
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-2 text-[10px] text-slate-400">
                <p className="font-bold text-amber-400">Example:</p>
                <p className="italic">&ldquo;Explain why the Cold War escalated in the period 1948–1962.&rdquo;</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Part B — Evaluation</p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li><strong className="text-slate-200">Marks:</strong> 12–13 marks</li>
                <li><strong className="text-slate-200">Command words:</strong> Evaluate, how far do you agree, assess, to what extent</li>
                <li><strong className="text-slate-200">What to do:</strong> Make a judgement. Argue for and against a proposition, weigh evidence, and reach a substantiated conclusion.</li>
                <li><strong className="text-slate-200">Skill focus:</strong> Evaluation + argument + synthesis of CK</li>
                <li><strong className="text-slate-200">Structure:</strong> 4–5 PEEL paragraphs + conclusion</li>
              </ul>
              <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-2 text-[10px] text-slate-400">
                <p className="font-bold text-rose-400">Example:</p>
                <p className="italic">&ldquo;How far do you agree that fear of communism was the main reason for the USA&apos;s involvement in the Vietnam War?&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⚠️ <strong className="text-white">Common mistake:</strong> Many students write a Part
              B answer as if it&apos;s a longer Part A — simply explaining more. A Part B answer
              must <em>evaluate</em>, not just explain. The examiner needs to see you weigh
              different factors and come to a judgement.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="planning" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. How to Plan Your SEQ Essay (5 Minutes)</h2>
          <p>
            The single biggest difference between average and top students is <strong className="text-slate-200">planning</strong>.
            Top students spend 5 minutes planning before they write. Here&apos;s the method:
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Unpack the Question (1 minute)</h3>
              </div>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li>Circle the <strong className="text-slate-200">command word</strong> (Explain? Evaluate? How far?)</li>
                <li>Underline the <strong className="text-slate-200">key concepts</strong> (e.g., &ldquo;fear of communism,&rdquo; &ldquo;main reason&rdquo;)</li>
                <li>Identify the <strong className="text-slate-200">scope</strong> (time period, countries involved)</li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Brainstorm Factors (2 minutes)</h3>
              </div>
              <p className="text-xs text-slate-400">
                For Part B (evaluation), list 2–3 factors <em>for</em> the proposition and 1–2 factors
                <em>against</em>. For Part A (explanation), list 3–4 factors to explain.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>Q: &ldquo;How far do you agree that economic factors caused the Cold War?&rdquo;</p>
                <p className="mt-1"><span className="text-emerald-400">✓ For:</span> Soviet reparations demand, Marshall Plan, need for markets</p>
                <p><span className="text-rose-400">✗ Against:</span> Ideological rivalry, personality clashes, nuclear arms race</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Write a Thesis &amp; Outline (2 minutes)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Write a one-sentence thesis that directly answers the question. Then outline your
                paragraphs — one PEEL paragraph per factor, in order of strength.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p><span className="text-indigo-400">Thesis:</span> &ldquo;While ideological rivalry between capitalism and communism set the stage, economic factors were the most immediate cause of Cold War tensions.&rdquo;</p>
                <p className="mt-1"><span className="text-slate-400">P1:</span> Soviet reparations demand &bull; <span className="text-slate-400">P2:</span> Marshall Plan &bull; <span className="text-slate-400">P3:</span> Cominform/COMECON</p>
                <p><span className="text-slate-400">P4 (counter):</span> Ideological rivalry &bull; <span className="text-slate-400">Conclusion:</span> Economic factors were primary</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              ⏱ <strong className="text-slate-200">Time breakdown per essay:</strong> 5 min plan →
              15 min write (Part A) → 20–22 min write (Part B) → 3 min review. Total: ~23–27 min per SEQ.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="essay-structure" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Essay Structure: Introduction, Body, Conclusion</h2>
          <p>
            Every SEQ essay — whether Part A or Part B — follows the same basic structure. The
            difference is in the <strong className="text-slate-200">depth of evaluation</strong>.
          </p>

          {/* Introduction */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-indigo-400">📝 Introduction</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your introduction should be <strong className="text-slate-200">short and direct</strong>:
            </p>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc pl-4">
              <li><strong className="text-slate-200">Part A:</strong> State what you will explain and preview your 3–4 factors. (2–3 sentences)</li>
              <li><strong className="text-slate-200">Part B:</strong> State your thesis — your overall judgement. Preview the main arguments. (3–4 sentences)</li>
            </ul>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;The Cold War escalated between 1948 and 1962 due to a combination of ideological, economic, and strategic factors. The most significant cause was the fundamental clash between Soviet and American ideologies, which shaped all other areas of conflict.&rdquo;</em></p>
            </div>
            <p className="text-[9px] text-rose-400 mt-1">❌ Don&apos;t write a long, vague introduction that re-states the question. Get straight to your argument.</p>
          </div>

          {/* Body Paragraphs */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-emerald-400">📝 Body Paragraphs (PEEL)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Each body paragraph follows the{' '}
              <Link href="/tips/peel-framework" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                PEEL structure
              </Link>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[10px]">
              <div className="bg-slate-900/70 rounded-lg p-2">
                <p className="font-bold text-indigo-400">P — Point</p>
                <p className="text-slate-400">Topic sentence that directly addresses the question. State one factor clearly.</p>
              </div>
              <div className="bg-slate-900/70 rounded-lg p-2">
                <p className="font-bold text-emerald-400">E — Evidence</p>
                <p className="text-slate-400">Specific historical facts, dates, statistics that prove your point.</p>
              </div>
              <div className="bg-slate-900/70 rounded-lg p-2">
                <p className="font-bold text-amber-400">E — Explanation</p>
                <p className="text-slate-400">HOW and WHY the evidence proves your point. Deep analysis, not description.</p>
              </div>
              <div className="bg-slate-900/70 rounded-lg p-2">
                <p className="font-bold text-rose-400">L — Link</p>
                <p className="text-slate-400">Connect back to the question. Alternatively, transition to the next point.</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              <strong className="text-slate-200">Part A:</strong> 3–4 PEEL paragraphs, one per factor.
              Focus on explanation. Each paragraph should feel like it builds on the last.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              <strong className="text-slate-200">Part B:</strong> 4–5 PEEL paragraphs. Include at
              least 1–2 counter-argument paragraphs (&ldquo;on the other hand&hellip;&rdquo;). Show
              that you can see both sides.
            </p>
          </div>

          {/* Conclusion */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-amber-400">📝 Conclusion</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your conclusion should <strong className="text-slate-200">do three things</strong>:
            </p>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc pl-4">
              <li>Return to your thesis (Part B) or summary (Part A)</li>
              <li>Synthesise — don&apos;t just repeat — your main arguments</li>
              <li>Make a final, clear judgement (for Part B)</li>
            </ul>
            <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
              <p>✅ <em>&ldquo;In conclusion, while ideological differences provided the underlying tension, it was the clash over economic systems — Soviet command economy versus American capitalist expansion — that made compromise impossible. Economic factors were therefore the primary driver of Cold War escalation.&rdquo;</em></p>
            </div>
            <p className="text-[9px] text-rose-400 mt-1">❌ Don&apos;t introduce new information in the conclusion. The examiner reads it last — make it count.</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="ck-seq" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Using Contextual Knowledge (CK) in Your SEQ</h2>
          <p>
            For the SEQ, <strong className="text-slate-200">contextual knowledge is everything</strong>.
            Unlike the SBQ where sources provide the evidence, the SEQ requires you to bring your
            own knowledge to the essay. Here&apos;s how to do it effectively.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-lg">✅</span>
                <h3 className="text-sm font-bold text-slate-200">Strong CK in SEQ</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 italic">
                &ldquo;The Marshall Plan, announced in 1947, injected over $13 billion into Western
                Europe. Crucially, it required recipients to adopt free-market economic policies —
                effectively locking Western Europe into the American economic sphere and deepening
                the economic division of Europe that the Truman Doctrine had initiated.&rdquo;
              </p>
              <p className="text-[10px] text-emerald-400 mt-1">✔ Specific date, dollar amount, and causal link</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-lg">❌</span>
                <h3 className="text-sm font-bold text-slate-200">Weak CK in SEQ</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 italic">
                &ldquo;The US gave a lot of money to Europe to help them recover. This made the
                USSR unhappy because they thought America was trying to spread its influence.&rdquo;
              </p>
              <p className="text-[10px] text-rose-400 mt-1">✘ Vague — no specific facts, dates, or depth</p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              📚 <strong className="text-slate-200">Building your CK bank:</strong> For each topic
              (Cold War, Vietnam War, Malayan Emergency, etc.), memorise 5–8 key facts: specific
              dates, names of key figures, statistics, and key events. This is your &ldquo;CK bank&rdquo;
              — the ammunition you bring into the exam.
            </p>
          </div>

          <p>
            For a complete guide on how to use contextual knowledge effectively, see our{' '}
            <Link href="/tips/historical-context-essays" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              dedicated guide to historical context in essays
            </Link>.
          </p>
        </section>

        {/* Section 6 */}
        <section id="worked-example" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Worked Example: A Full SEQ Answer</h2>
          <p>
            Here&apos;s a complete Part B SEQ answer demonstrating the structure in action:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Part B Question (12 marks)</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              &ldquo;How far do you agree that the failure of the Geneva Accords (1954) was the
              main reason for the outbreak of the Vietnam War? Explain your answer.&rdquo;
            </blockquote>

            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Introduction</p>
              <p className="border-l-2 border-indigo-500 pl-3 italic">
                &ldquo;The failure of the Geneva Accords was a significant factor, but to argue it
                was the <em>main</em> reason overlooks the crucial roles of Cold War ideology,
                US strategic interests in containing communism, and the persistent instability of
                South Vietnamese governments. I disagree with the proposition — while Geneva was a
                missed opportunity, structural Cold War factors were more decisive.&rdquo;
              </p>

              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-3">Body Paragraph 1 — Against (main factor)</p>
              <p className="border-l-2 border-emerald-500 pl-3 italic">
                &ldquo;Proponents argue that the Geneva Accords&apos; failure to hold the promised
                1956 elections was decisive. The Accords, signed in April 1954, temporarily divided
                Vietnam at the 17th parallel and called for national elections in 1956 to reunify
                the country. However, the US-backed government of Ngo Dinh Diem in South Vietnam
                refused to hold elections, fearing that Ho Chi Minh would win given his popularity
                as a nationalist leader. This failure to unify the country set the stage for the
                insurgency that followed. Without this breakdown, the argument goes, there may have
                been no war — merely a political transition.&rdquo;
              </p>

              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-3">Body Paragraph 2 — For (main factor is something else)</p>
              <p className="border-l-2 border-amber-500 pl-3 italic">
                &ldquo;However, the failure of Geneva alone cannot explain the scale of US
                involvement. The key driving force was the Cold War policy of containment,
                articulated by George Kennan in 1947. The US viewed Vietnam not as an isolated
                conflict but as a test of the domino theory — the belief that if one Southeast Asian
                country fell to communism, others would follow. This is why the US escalated from
                military advisors under Eisenhower (1955–1961) to combat troops under Kennedy and
                Johnson. The Geneva breakdown provided a <em>pretext</em> for US involvement, but
                containment ideology provided the <em>driver</em>.&rdquo;
              </p>

              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-3">Conclusion</p>
              <p className="border-l-2 border-rose-500 pl-3 italic">
                &ldquo;In conclusion, while the failure of the Geneva Accords created the political
                conditions for conflict, it was the broader context of Cold War ideology and the
                American commitment to containment that transformed a political impasse into a
                full-scale war. The Geneva breakdown was a necessary cause, but it was not the
                <em>main</em> reason — Cold War dynamics played a more fundamental role.&rdquo;
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            <strong className="text-slate-200">Notice:</strong> Each paragraph follows PEEL. The
            introduction states a clear thesis. Body paragraphs consider both sides. The conclusion
            directly answers the question with a clear judgement. The essay uses specific CK —
            dates, names, statistics — throughout.
          </p>
        </section>

        {/* Section 7 */}
        <section id="time-management" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Time Management for the History Paper</h2>
          <p>
            The History paper is 1 hour 40 minutes for both SBQ and SEQ. Here&apos;s how to allocate
            your time:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 pr-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Section</th>
                  <th className="text-left py-2 pr-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                  <th className="text-left py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">What to do</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 text-indigo-400 font-bold">SBQ</td>
                  <td className="py-2 pr-3">~50 min</td>
                  <td className="py-2 text-slate-400">Read sources (10 min) → Answer 5 sub-questions (40 min)</td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 text-emerald-400 font-bold">SEQ Part A (Q1)</td>
                  <td className="py-2 pr-3">~12 min</td>
                  <td className="py-2 text-slate-400">Plan (2 min) → Write (9 min) → Review (1 min)</td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 text-emerald-400 font-bold">SEQ Part B (Q1)</td>
                  <td className="py-2 pr-3">~15 min</td>
                  <td className="py-2 text-slate-400">Plan (3 min) → Write (11 min) → Review (1 min)</td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 text-emerald-400 font-bold">SEQ Part A (Q2)</td>
                  <td className="py-2 pr-3">~10 min</td>
                  <td className="py-2 text-slate-400">Plan (2 min) → Write (8 min)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-emerald-400 font-bold">SEQ Part B (Q2)</td>
                  <td className="py-2 pr-3">~13 min</td>
                  <td className="py-2 text-slate-400">Plan (3 min) → Write (10 min)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⏰ <strong className="text-white">Critical rule:</strong> Never spend more than the
              allocated time on any section. If you run out of time on an SEQ, write a short
              conclusion even if it&apos;s just one sentence. An ungraded essay with a conclusion
              is better than an unfinished one.
            </p>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              🎯 <strong className="text-slate-200">Pro tip:</strong> Choose your 2 SEQ questions
              wisely in the first 1–2 minutes. Pick the topics where your CK is strongest. Don&apos;t
              choose a question just because it looks easier — choose it because you know more about
              the topic.
            </p>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950/80 border border-emerald-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Practise History SEQ with instant grading</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate unlimited SEQ questions on every O-Level History topic. Write your essay in the
            canvas and get instant LORMS-aligned grading that evaluates your argument, CK, and structure.
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
            <Link href="/tips/historical-context-essays" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: Historical Context
            </Link>
            <Link href="/tips/srq-guide" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SRQ Guide →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
