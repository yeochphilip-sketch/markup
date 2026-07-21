import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Model Answer Breakdown: An Annotated L4 SBQ Paper',
  description:
    'See a complete O-Level SBQ paper with annotated L4/L5 model answers for every question type. Understand exactly why each sentence scores top band — and how you can replicate it.',
  openGraph: {
    title: 'Model Answer Breakdown: Annotated L4 SBQ Paper — MARKUP Tips',
    description:
      'See a complete O-Level SBQ paper with annotated L4/L5 model answers. Understand why every sentence scores top band.',
  },
};

export default function ModelSBQAnswerPage() {
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
          <span className="text-slate-400">Model SBQ Answer</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">14 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Model Answer Breakdown: An Annotated L4 SBQ Paper
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Theory is useful, but seeing a real top-band answer — annotated, line by line —
            is what makes everything click. Here is a complete SBQ paper with L4/L5 model
            answers and detailed commentary on why each sentence works.
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
            <li><a href="#the-question" className="text-indigo-400 hover:text-indigo-300 transition">1. The SBQ Paper — Context & Sources</a></li>
            <li><a href="#model-comparison" className="text-indigo-400 hover:text-indigo-300 transition">2. Model Answer (a) — Comparison (6 marks)</a></li>
            <li><a href="#model-reliability" className="text-indigo-400 hover:text-indigo-300 transition">3. Model Answer (b) — Reliability (7 marks)</a></li>
            <li><a href="#model-purpose" className="text-indigo-400 hover:text-indigo-300 transition">4. Model Answer (c) — Purpose (7 marks)</a></li>
            <li><a href="#model-utility" className="text-indigo-400 hover:text-indigo-300 transition">5. Model Answer (d) — Utility/Comparison (10 marks)</a></li>
            <li><a href="#key-takeaways" className="text-indigo-400 hover:text-indigo-300 transition">6. Key Takeaways Across All Questions</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="the-question" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. The SBQ Paper — Context & Sources</h2>
          <p>
            <strong className="text-slate-200">Topic:</strong> The impact of the Japanese occupation
            on Southeast Asian nationalism (1942–1945)
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Source A</p>
            <blockquote className="border-l-2 border-indigo-500 pl-3 text-xs italic text-slate-300">
              &ldquo;The Japanese occupation was a turning point for Southeast Asia. It broke the
              myth of European superiority and showed local populations that Asians could govern
              themselves. Nationalism, which had been a luxury of the educated elite, became a
              mass movement. Without the occupation, independence might have taken decades longer
              to achieve.&rdquo;
            </blockquote>
            <p className="text-[9px] text-slate-600">Source: From a 1975 memoir by a retired Indonesian nationalist leader who fought against the Dutch.</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Source B</p>
            <blockquote className="border-l-2 border-emerald-500 pl-3 text-xs italic text-slate-300">
              &ldquo;The Japanese occupation was undoubtedly harsh, but its role in fostering
              nationalism is often exaggerated. Most Southeast Asians were primarily concerned
              with survival during the war. The real stimulus for nationalism came after 1945,
              with the return of the colonial powers — who were now weaker, poorer, and facing
              a transformed international order.&rdquo;
            </blockquote>
            <p className="text-[9px] text-slate-600">Source: From a 1995 academic article by a British historian specialising in Southeast Asian colonial history.</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Source C</p>
            <blockquote className="border-l-2 border-amber-500 pl-3 text-xs italic text-slate-300">
              &ldquo;The period of Japanese rule was a brutal one. Thousands of Southeast Asian
              labourers died building the Thai-Burma Railway. Food shortages were widespread, and
              resistance movements were brutally suppressed. Yet it was during this occupation that
              many future nationalist leaders — including Ho Chi Minh in Vietnam and Sukarno in
              Indonesia — gained both military experience and political credibility.&rdquo;
            </blockquote>
            <p className="text-[9px] text-slate-600">Source: From a 2008 textbook used in Singapore secondary schools, written by Ministry of Education curriculum specialists.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">The Questions</p>
              <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-decimal pl-4">
                <li><strong className="text-slate-200">(a) 6 marks:</strong> Study Sources A and B. How similar are the views of the two sources on the impact of the Japanese occupation on Southeast Asian nationalism?</li>
                <li><strong className="text-slate-200">(b) 7 marks:</strong> Study Source C. How reliable is Source C as evidence for understanding the impact of the Japanese occupation on Southeast Asian nationalism?</li>
                <li><strong className="text-slate-200">(c) 7 marks:</strong> Study Source A. What is the purpose of Source A?</li>
                <li><strong className="text-slate-200">(d) 10 marks:</strong> Study Sources A, B, C. How far do the sources agree on the impact of the Japanese occupation on Southeast Asian nationalism, and how useful are they for a historian studying this topic?</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section id="model-comparison" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. Model Answer (a) — Comparison (6 marks) — L4/6</h2>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L4 Model Answer</p>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="border-l-2 border-indigo-500 pl-3">
                Both sources offer <strong className="text-slate-200">contrasting</strong> views
                on the impact of the Japanese occupation on Southeast Asian nationalism.{' '}
                <span className="text-[9px] text-indigo-400">[Opening states the dimension and gives an overall judgement]</span>
              </p>
              <p className="border-l-2 border-emerald-500 pl-3 mt-2">
                A key <strong className="text-slate-200">similarity</strong> is that both sources
                acknowledge the occupation was a significant moment in the development of
                nationalism. Source A describes it as a &ldquo;turning point&rdquo; that made
                nationalism a &ldquo;mass movement,&rdquo; while Source B concedes that it
                played a role, though it argues this role is &ldquo;often exaggerated.&rdquo;
                Both agree that the occupation changed the political landscape, even if they
                differ on how decisive that change was.{' '}
                <span className="text-[9px] text-emerald-400">[Similarity with evidence from BOTH sources woven together]</span>
              </p>
              <p className="border-l-2 border-amber-500 pl-3 mt-2">
                However, the sources differ significantly in their <strong className="text-slate-200">overall assessment</strong>.
                Source A presents the occupation as a positive catalyst — it &ldquo;broke the myth
                of European superiority&rdquo; and enabled independence. The tone is celebratory
                and definitive. In contrast, Source B is more cautious and analytical, arguing
                that the occupation&apos;s role is exaggerated and that the real stimulus for
                nationalism was the post-war context — the weakened colonial powers and the
                changing international order.{' '}
                <span className="text-[9px] text-amber-400">[Difference with specific evidence — uses quotes and tone analysis]</span>
              </p>
              <p className="border-l-2 border-rose-500 pl-3 mt-2">
                In conclusion, while both sources recognise the Japanese occupation as relevant
                to the rise of nationalism, they are <strong className="text-slate-200">more different than similar</strong>.
                Source A portrays it as a decisive, positive turning point, while Source B sees
                its role as limited and secondary to post-war factors.{' '}
                <span className="text-[9px] text-rose-400">[Clear judgement answering &ldquo;how similar&rdquo;]</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">✍️ Why This Scores L4/6</p>
            <ul className="text-[10px] text-slate-400 mt-2 space-y-1 list-disc pl-4">
              <li><strong className="text-slate-200">Synthesis:</strong> Every paragraph weaves evidence from both sources together. Never two separate descriptions.</li>
              <li><strong className="text-slate-200">Both sides:</strong> Addresses similarity AND difference, even though the question only says &ldquo;how similar&rdquo;</li>
              <li><strong className="text-slate-200">Specific quotes:</strong> Uses direct quotes from both sources throughout</li>
              <li><strong className="text-slate-200">Tone analysis:</strong> Notes that Source A is &ldquo;celebratory and definitive&rdquo; while Source B is &ldquo;cautious and analytical&rdquo;</li>
              <li><strong className="text-slate-200">Judgement:</strong> Clear concluding sentence that answers &ldquo;how similar&rdquo;</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section id="model-reliability" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Model Answer (b) — Reliability (7 marks) — L5/7</h2>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 Model Answer</p>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="border-l-2 border-purple-500 pl-3">
                Source C provides <strong className="text-slate-200">partially reliable</strong>{' '}
                evidence for understanding the impact of the Japanese occupation on Southeast
                Asian nationalism. Its reliability depends on an assessment of its provenance
                and the extent to which it is corroborated by other sources.{' '}
                <span className="text-[9px] text-purple-400">[Opening defines the issue and signals a nuanced approach]</span>
              </p>
              <p className="border-l-2 border-emerald-500 pl-3 mt-2">
                One reason to find Source C reliable is its <strong className="text-slate-200">provenance</strong>.
                It was written by Ministry of Education curriculum specialists for a 2008
                Singapore secondary school textbook. As an official publication, it is likely
                to be factually accurate — errors in textbooks would be subject to review and
                correction. Furthermore, as a textbook published over 60 years after the events,
                it benefits from historical distance and access to a wide range of scholarly
                research.{' '}
                <span className="text-[9px] text-emerald-400">[Provenance analysis — who wrote it, when, and why that matters]</span>
              </p>
              <p className="border-l-2 border-indigo-500 pl-3 mt-2">
                The source&apos;s reliability is <strong className="text-slate-200">corroborated</strong>{' '}
                by Source A, which similarly acknowledges the occupation&apos;s role in developing
                nationalist leaders and movements. Source A&apos;s first-hand perspective as a
                nationalist leader himself supports Source C&apos;s claim about figures like
                Sukarno gaining political credibility.{' '}
                <span className="text-[9px] text-indigo-400">[Cross-referencing — uses another source for support]</span>
              </p>
              <p className="border-l-2 border-amber-500 pl-3 mt-2">
                However, the source&apos;s reliability is <strong className="text-slate-200">limited</strong>{' '}
                by its nature as a textbook. Textbooks aim to present a balanced, curriculum-aligned
                view, which may lead to the omission of more controversial or complex aspects of
                the occupation&apos;s impact. The source is silent, for instance, on the collaboration
                of some Southeast Asian nationalists with the Japanese, which complicates the
                narrative of nationalist &ldquo;resistance.&rdquo; Additionally, as an educational
                text, it may simplify complex historical debates for a young audience.{' '}
                <span className="text-[9px] text-amber-400">[Limitations — considers what the source OMITS]</span>
              </p>
              <p className="border-l-2 border-rose-500 pl-3 mt-2">
                On balance, Source C is <strong className="text-slate-200">partially reliable</strong>{' '}
                as evidence. It is useful for establishing basic factual claims about the
                occupation and its link to nationalism — its claims about specific leaders and
                events are supported by other sources. However, its reliability is limited for
                understanding the more contested aspects of the occupation&apos;s legacy, and
                a historian would need to consult additional sources, particularly from
                Southeast Asian perspectives, for a more complete picture.{' '}
                <span className="text-[9px] text-rose-400">[Overall nuanced judgement — not just &ldquo;reliable&rdquo; or &ldquo;unreliable&rdquo;]</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">✍️ Why This Scores L5/7</p>
            <ul className="text-[10px] text-slate-400 mt-2 space-y-1 list-disc pl-4">
              <li><strong className="text-slate-200">Both provenance AND cross-referencing:</strong> Required for L5 on the 7-mark question</li>
              <li><strong className="text-slate-200">Nuanced judgement:</strong> Not &ldquo;reliable&rdquo; or &ldquo;unreliable&rdquo; but &ldquo;partially reliable&rdquo; with specific strengths and limitations</li>
              <li><strong className="text-slate-200">Specific analysis:</strong> Notes what the source <em>omits</em> (collaboration with Japanese) — this is sophisticated analysis</li>
              <li><strong className="text-slate-200">Clear structure:</strong> Strengths → cross-reference → limitations → overall judgement</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="model-purpose" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Model Answer (c) — Purpose (7 marks) — L5/7</h2>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 Model Answer</p>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="border-l-2 border-rose-500 pl-3">
                The purpose of Source A is to <strong className="text-slate-200">celebrate and justify</strong>{' '}
                the role of the Japanese occupation in catalysing Southeast Asian nationalism,
                with the broader intention of legitimising the post-independence nationalist
                movements and their leadership.{' '}
                <span className="text-[9px] text-rose-400">[Clear statement of purpose — what and why]</span>
              </p>
              <p className="border-l-2 border-emerald-500 pl-3 mt-2">
                The author achieves this purpose through <strong className="text-slate-200">emotive and
                definitive language</strong>. The occupation is described as a &ldquo;turning point&rdquo;
                that &ldquo;broke the myth of European superiority&rdquo; — language that is
                triumphal and absolute. The claim that nationalism was transformed from a
                &ldquo;luxury of the educated elite&rdquo; into a &ldquo;mass movement&rdquo;
                is designed to present nationalism as inevitable and broadly supported.{' '}
                <span className="text-[9px] text-emerald-400">[Analyses specific language choices and their effects]</span>
              </p>
              <p className="border-l-2 border-amber-500 pl-3 mt-2">
                The intended audience appears to be <strong className="text-slate-200">a post-colonial
                Southeast Asian readership</strong>, possibly from the author&apos;s own country.
                By writing a memoir in 1975 — 30 years after the occupation and a decade after
                Indonesia&apos;s independence — the author is participating in a nation-building
                narrative. The source reinforces the idea that independence was achieved through
                a heroic struggle, which serves to legitimise the post-independence government
                and inspire national pride.{' '}
                <span className="text-[9px] text-amber-400">[Identifies audience and explains why purpose is relevant to them]</span>
              </p>
              <p className="border-l-2 border-indigo-500 pl-3 mt-2">
                Furthermore, the author&apos;s <strong className="text-slate-200">identity</strong>{' '}
                as a retired nationalist leader is crucial to understanding the source&apos;s
                purpose. The memoir gives him the opportunity to present his own role — and that
                of his movement — in the most favourable light. By attributing independence to
                the transformative experience of the occupation, the source implicitly argues that
                nationalist leaders (including the author) were the legitimate heirs to power.{' '}
                <span className="text-[9px] text-indigo-400">[Considers author identity and motivation]</span>
              </p>
              <p className="border-l-2 border-rose-500 pl-3 mt-2">
                In summary, Source A&apos;s primary purpose is to <strong className="text-slate-200">celebrate
                the nationalist narrative</strong> of the Japanese occupation. Through emotive
                language and a definitive tone, the retired nationalist leader presents the
                occupation as a decisive, positive catalyst for independence, thereby legitimising
                his own movement and the post-colonial order it helped create.{' '}
                <span className="text-[9px] text-rose-400">[Restates overall purpose with synthesis of key points]</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">✍️ Why This Scores L5/7</p>
            <ul className="text-[10px] text-slate-400 mt-2 space-y-1 list-disc pl-4">
              <li><strong className="text-slate-200">Clear message → purpose link:</strong> Identifies the message first, then explains why the author communicates it</li>
              <li><strong className="text-slate-200">Language analysis:</strong> Quotes specific phrases and explains their persuasive effect</li>
              <li><strong className="text-slate-200">Audience awareness:</strong> Considers who the source is for and how that shapes the purpose</li>
              <li><strong className="text-slate-200">Author identity:</strong> Links the author&apos;s background to the purpose — a top-band skill</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section id="model-utility" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Model Answer (d) — Utility/Comparison (10 marks) — L5/8</h2>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 Model Answer</p>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="border-l-2 border-violet-500 pl-3">
                The three sources <strong className="text-slate-200">partially agree</strong> on the
                impact of the Japanese occupation on Southeast Asian nationalism. Their combined
                utility for a historian is moderate — each source offers valuable insights, but
                all have significant limitations that must be considered.{' '}
                <span className="text-[9px] text-violet-400">[Opening gives an overview of agreement AND utility]</span>
              </p>
              <p className="border-l-2 border-emerald-500 pl-3 mt-2">
                There is <strong className="text-slate-200">broad agreement</strong> that the
                occupation was a significant event for nationalism. All three sources acknowledge
                a connection between the occupation and the rise of nationalist movements. Source
                A calls it a &ldquo;turning point,&rdquo; Source C notes that future leaders
                gained experience during this period, and even Source B, which is the most
                sceptical, concedes the occupation played &ldquo;a role.&rdquo; This consensus
                suggests that a historian can confidently assert the occupation was <em>relevant</em>{' '}
                to nationalism, even if its precise significance is debated.{' '}
                <span className="text-[9px] text-emerald-400">[Synthesises agreement across all three sources]</span>
              </p>
              <p className="border-l-2 border-amber-500 pl-3 mt-2">
                However, the sources <strong className="text-slate-200">differ sharply</strong> on
                the <em>degree</em> and <em>nature</em> of the occupation&apos;s impact. Source A
                presents it as decisive and positive, a &ldquo;turning point&rdquo; that directly
                enabled independence. Source B dismisses this as exaggeration, arguing that post-war
                factors were more important. Source C occupies a middle ground — it acknowledges
                the brutality of the occupation while noting the political benefits for nationalist
                leaders. This disagreement reveals that the debate among historians is not settled.{' '}
                <span className="text-[9px] text-amber-400">[Difference across all three sources with nuanced characterisation]</span>
              </p>
              <p className="border-l-2 border-indigo-500 pl-3 mt-2">
                In terms of <strong className="text-slate-200">utility</strong>, Source A is most
                useful for understanding how nationalists themselves perceived the occupation&apos;s
                impact. As a first-hand account by a participant, it provides an insider perspective
                that no second-hand source can match. However, its utility is limited by its
                purpose — a memoir written to celebrate the nationalist struggle — which means it
                may exaggerate the occupation&apos;s positive role and downplay other factors.{' '}
                <span className="text-[9px] text-indigo-400">[Source A utility — strength and limitation]</span>
              </p>
              <p className="border-l-2 border-purple-500 pl-3 mt-2">
                Source B is useful as an <strong className="text-slate-200">academic counterpoint</strong>.
                Written by a specialist historian, it benefits from scholarly rigour and distance.
                Its utility is particularly high for understanding the historiographical debate
                about the occupation. However, as a Western academic source, it may not fully
                capture Southeast Asian perspectives, and its critical stance could reflect
                academic trends that downplay nationalist narratives.{' '}
                <span className="text-[9px] text-purple-400">[Source B utility — strength and limitation]</span>
              </p>
              <p className="border-l-2 border-teal-500 pl-3 mt-2">
                Source C is useful as a <strong className="text-slate-200">balanced educational
                account</strong>. Its reliability for basic facts is high, given its official
                publication context. However, its utility for understanding the depth of
                historiographical debate is limited by its textbook format, which simplifies
                complex arguments for students. It provides a useful baseline but lacks the
                analytical depth of Sources A or B.{' '}
                <span className="text-[9px] text-teal-400">[Source C utility — strength and limitation]</span>
              </p>
              <p className="border-l-2 border-rose-500 pl-3 mt-2">
                In conclusion, the sources <strong className="text-slate-200">partially agree</strong>{' '}
                — they all recognise the occupation as relevant, but disagree on its significance.
                Their combined utility is <strong className="text-slate-200">moderate</strong>.
                  For a historian studying how nationalists viewed the occupation, Source A is
                  invaluable. For understanding historiographical debates, Source B is essential.
                  For establishing basic factual claims, Source C is reliable. To construct a
                  complete picture, a historian would need to supplement these sources with
                  additional Southeast Asian perspectives and primary documentary evidence from
                  the occupation period itself.{' '}
                <span className="text-[9px] text-rose-400">[Overall judgement — answers BOTH parts of the question]</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">✍️ Why This Scores L5/8</p>
            <ul className="text-[10px] text-slate-400 mt-2 space-y-1 list-disc pl-4">
              <li><strong className="text-slate-200">Answers both parts:</strong> Covers comparison AND utility equally</li>
              <li><strong className="text-slate-200">Source-by-source utility:</strong> Each source assessed individually for what it&apos;s useful for and where it&apos;s limited</li>
              <li><strong className="text-slate-200">Combined utility:</strong> Ends with overall assessment of what the sources can achieve together</li>
              <li><strong className="text-slate-200">Historiographical awareness:</strong> Notes the debate among historians — sophisticated CK</li>
              <li><strong className="text-slate-200">Synthesis across all three:</strong> Compares and contrasts A, B, and C throughout</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section id="key-takeaways" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Key Takeaways Across All Questions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">What Top Students Do</p>
              <ul className="text-[10px] text-slate-400 mt-2 space-y-1 list-disc pl-4">
                <li>Always address <strong className="text-slate-200">both sides</strong> — similarity AND difference, strength AND limitation</li>
                <li>Use <strong className="text-slate-200">specific quotes</strong> from sources throughout</li>
                <li>Link every point back to <strong className="text-slate-200">provenance</strong> — who, when, why, for whom</li>
                <li><strong className="text-slate-200">Cross-reference</strong> across multiple sources</li>
                <li>End with a <strong className="text-slate-200">clear judgement</strong> that directly answers the question</li>
                <li>Use <strong className="text-slate-200">comparative language</strong> that weaves sources together</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">What Students Often Miss</p>
              <ul className="text-[10px] text-slate-400 mt-2 space-y-1 list-disc pl-4">
                <li>Only describing individual sources without <strong className="text-slate-200">synthesis</strong></li>
                <li>Forgetting to consider the <strong className="text-slate-200">audience</strong> for purpose questions</li>
                <li>Treating reliability as a <strong className="text-slate-200">binary</strong> — reliable OR unreliable</li>
                <li>Ignoring <strong className="text-slate-200">cross-referencing</strong> in reliability answers</li>
                <li>Not making a <strong className="text-slate-200">judgement</strong> about <em>how</em> similar/different</li>
                <li>Writing paragraphs about Source A and then Source B <strong className="text-slate-200">separately</strong></li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              🎯 <strong className="text-slate-200">Your next step:</strong> Generate an SBQ paper
              in MARKUP and try to replicate this structure. Write your answer, get graded, and
              compare your response to the feedback. Focus on ONE question type at a time —
              master comparison first, then reliability, then purpose, then utility.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Generate your own SBQ paper now</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP generates fresh O-Level SBQ papers with LORMS-aligned grading. Write your
            answer and get instant feedback that tells you exactly how to improve.
          </p>
          <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20">Start SBQ Practice — Free</Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/sbq-templates" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">← Previous: SBQ Templates</Link>
            <Link href="/tips/peel-framework" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">Next: PEEL Framework →</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
