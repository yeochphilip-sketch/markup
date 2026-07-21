import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Use Historical Context in Your Humanities Essays (L3/7 Framework)',
  description:
    'Master the art of weaving contextual knowledge (CK) into your O-Level SEQ and SRQ essays. Learn the L3/7 framework for using historical context to elevate arguments and score top bands.',
  openGraph: {
    title: 'How to Use Historical Context in Essays — MARKUP Tips',
    description:
      'Master the art of using contextual knowledge in O-Level Humanities essays. Learn the L3/7 framework to weave historical context into your SEQ and SRQ answers.',
  },
};

export default function HistoricalContextEssaysPage() {
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
          <span className="text-slate-400">Historical Context</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Essay Tips</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">11 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Use Historical Context in Your Humanities Essays
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            &ldquo;Use your contextual knowledge&rdquo; is written on every O-Level paper — but
            what does it actually look like in an answer? Here&apos;s the framework to weave
            historical context into your SEQ and SRQ essays so it elevates, not distracts from,
            your argument.
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
            <li><a href="#what-is-ck" className="text-indigo-400 hover:text-indigo-300 transition">1. What is Contextual Knowledge (CK)?</a></li>
            <li><a href="#l3-framework" className="text-indigo-400 hover:text-indigo-300 transition">2. The L3/7 Framework — How CK Is Assessed</a></li>
            <li><a href="#how-to-weave" className="text-indigo-400 hover:text-indigo-300 transition">3. How to Weave CK Into Your Essay</a></li>
            <li><a href="#types-of-ck" className="text-indigo-400 hover:text-indigo-300 transition">4. The 4 Types of Contextual Knowledge</a></li>
            <li><a href="#examples" className="text-indigo-400 hover:text-indigo-300 transition">5. Real Examples: No CK vs Strong CK</a></li>
            <li><a href="#social-studies-ck" className="text-indigo-400 hover:text-indigo-300 transition">6. CK for Social Studies — What&apos;s Different?</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">7. Common Mistakes That Cost You Marks</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">8. How to Build and Practise CK</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-ck" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is Contextual Knowledge (CK)?</h2>
          <p>
            Contextual knowledge (CK) is the information you know from{' '}
            <strong className="text-slate-200">outside the sources</strong> — what you&apos;ve learned
            in class, from your textbook, and from your own reading. In an O-Level Humanities essay,
            CK serves three purposes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🔍</p>
              <h3 className="text-xs font-bold text-slate-200">Corroborate</h3>
              <p className="text-[10px] text-slate-400 mt-1">Use CK to confirm or support what the sources say</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">⚡</p>
              <h3 className="text-xs font-bold text-slate-200">Challenge</h3>
              <p className="text-[10px] text-slate-400 mt-1">Use CK to question or complicate source claims</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🌐</p>
              <h3 className="text-xs font-bold text-slate-200">Contextualise</h3>
              <p className="text-[10px] text-slate-400 mt-1">Use CK to situate sources in their historical moment</p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">Why CK matters:</strong> The examiner already
              knows the sources. What they don&apos;t know is whether <em>you</em> can connect those
              sources to the wider historical picture. CK is what separates a student who understands
              from a student who merely describes.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="l3-framework" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The L3/7 Framework — How CK Is Assessed</h2>
          <p>
            Most O-Level SEQ/SRQ rubrics award CK marks across{' '}
            <strong className="text-slate-200">three bands</strong> for contextual knowledge:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L3 — Strong CK</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Integrated &amp; Analytical</p>
              <p className="text-[10px] text-slate-500 mt-1">CK is woven naturally into the argument. It supports, challenges, or deepens the analysis. Specific facts, dates, and examples are used precisely.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L2 — Partial CK</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Present but Not Integrated</p>
              <p className="text-[10px] text-slate-500 mt-1">CK is mentioned but feels tacked on. General statements without specific facts or dates. Doesn&apos;t deepen the argument.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L1 — No CK</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Source-Only</p>
              <p className="text-[10px] text-slate-500 mt-1">Only uses information from the sources. No evidence of wider knowledge. Answer is entirely source-dependent.</p>
            </div>
          </div>
          <p>
            <strong className="text-slate-200">The key difference:</strong> At L2, you mention CK
            because you feel you have to. At L3, you use CK because it{' '}
            <strong className="text-emerald-400">strengthens your argument</strong>. The CK feels
            essential, not optional.
          </p>
        </section>

        {/* Section 3 */}
        <section id="how-to-weave" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. How to Weave CK Into Your Essay</h2>
          <p>
            The secret to L3 CK is <strong className="text-slate-200">integration</strong>. Your
            CK should not be a separate paragraph labelled &ldquo;Context&rdquo; — it should be
            woven into every analytical paragraph. Here&apos;s the 3-step method:
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Start with Source Evidence</h3>
              </div>
              <p className="text-xs text-slate-400">
                Every analytical point should begin with something from the source. Quote or
                paraphrase a specific detail. This anchors your argument in the paper and shows
                the examiner you can select relevant evidence.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Extend with Your CK</h3>
              </div>
              <p className="text-xs text-slate-400">
                After presenting the source, use transition phrases to bring in your knowledge:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2 space-y-1">
                <p>🔹 &ldquo;This is consistent with my knowledge that…&rdquo;</p>
                <p>🔹 &ldquo;This reflects the broader context of… which I know from my study of…&rdquo;</p>
                <p>🔹 &ldquo;However, my knowledge suggests a more complex picture — for example…&rdquo;</p>
                <p>🔹 &ldquo;This can be explained by the fact that…&rdquo;</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Explain Significance</h3>
              </div>
              <p className="text-xs text-slate-400">
                Don&apos;t just state CK — explain <strong className="text-slate-200">why it matters</strong>{' '}
                for your argument. Connect the CK back to the question:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2">
                <p>✅ &ldquo;This CK matters <span className="text-emerald-400">because</span> it shows that the source&apos;s claim is supported / challenged by the historical record.&rdquo;</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="types-of-ck" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. The 4 Types of Contextual Knowledge</h2>
          <p>
            Not all CK is created equal. Top students use a variety of CK types to create a rich,
            multi-dimensional argument:
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">📅 1. Chronological CK</h3>
              <p className="text-xs text-slate-400">
                What happened before, during, or after the event in question. Knowing the sequence
                of events helps you explain <strong className="text-slate-200">causes and consequences</strong>.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;This source was written in 1957, just as Malaya was gaining independence — a time when British officials were particularly concerned about their legacy.&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">🏛️ 2. Political/Social CK</h3>
              <p className="text-xs text-slate-400">
                Knowledge of key figures, institutions, social movements, and political structures.
                This type of CK adds <strong className="text-slate-200">depth</strong> to your
                analysis of why things happened.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;The People&apos;s Action Party, led by Lee Kuan Yew, was at this time consolidating its political position by co-opting the trade union movement.&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">📊 3. Economic CK</h3>
              <p className="text-xs text-slate-400">
                Knowledge of economic conditions, trade patterns, financial pressures, and resource
                constraints. This is particularly important for questions about{' '}
                <strong className="text-slate-200">motivation</strong> and{' '}
                <strong className="text-slate-200">policy</strong>.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;Post-war Britain was facing severe economic hardship — rationing continued into the 1950s, and the country relied heavily on US Marshall Aid.&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">🌏 4. Historiographical CK</h3>
              <p className="text-xs text-slate-400">
                Knowledge of how historians have interpreted events. This is{' '}
                <strong className="text-slate-200">high-level CK</strong> that impresses examiners
                — showing you understand that history is debated.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;While traditional historians like David Lowenthal argue that X was driven by Y, revisionist scholars have challenged this view, pointing to evidence of Z.&rdquo;</em></p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Real Examples: No CK vs Strong CK</h2>
          <p>
            Let&apos;s compare two paragraphs written for the same question. Both use the same source,
            but one integrates CK while the other doesn&apos;t.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sample Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              &ldquo;How far do you agree that the Japanese occupation was the most important
              factor in the rise of nationalism in Southeast Asia? Explain your answer.&rdquo;
            </blockquote>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L1 CK — No Contextual Knowledge</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Source A says the Japanese occupation encouraged nationalism because it
                broke the myth of European superiority. Source B also says it was important. So
                the sources suggest the Japanese occupation was an important factor.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 space-y-1">
                <p>❌ Only describes source content</p>
                <p>❌ No additional facts, dates, or examples</p>
                <p>❌ No demonstration of wider historical understanding</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L3 CK — Strong Contextual Knowledge</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Source A argues that the Japanese occupation was crucial because it exposed
                Southeast Asians to the idea that European powers could be defeated. This is
                consistent with my knowledge that Japan&apos;s rapid conquest of Malaya, Singapore,
                and Indonesia in 1941–42 shattered the perception of European military invincibility
                — a perception that had been carefully cultivated over centuries of colonial rule.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">However</strong>, my knowledge of post-war
                developments suggests that the occupation was not sufficient on its own. The
                returning European powers faced organised nationalist movements — such as the
                Malayan Communist Party and the Vietnamese Viet Minh — that had gained military
                experience and political organisation during the Japanese occupation. But equally
                important was the broader post-war context: the decline of British power, the
                rise of the US and USSR as superpowers, and the growing international pressure
                for decolonisation exemplified by the 1945 United Nations Charter. These factors
                together created the conditions for nationalism to succeed.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 space-y-1 mt-2">
                <p>✅ Uses specific historical facts (dates, countries, organisations)</p>
                <p>✅ CK is woven into the argument, not tacked on</p>
                <p>✅ CK both supports AND challenges the source</p>
                <p>✅ Demonstrates understanding of complex historical causality</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 — Social Studies CK */}
        <section id="social-studies-ck" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. CK for Social Studies — What&apos;s Different?</h2>
          <p>
            While the previous sections focus on CK for History (dates, events, historiographical
            debates), CK for Social Studies looks <strong className="text-slate-200">different</strong>.
            In SS, your contextual knowledge is drawn from <strong className="text-slate-200">current affairs,
            government policies, and social issues</strong> rather than historical events.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-sky-400 mb-1">🇸🇬 Types of SS Contextual Knowledge</h3>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li><strong className="text-slate-200">Government policies:</strong> EIP, CPF, GST vouchers, SkillsFuture, Housing Grants — knowing specific policy names and how they work</li>
                <li><strong className="text-slate-200">Current affairs:</strong> Recent events in Singapore and globally that illustrate social issues</li>
                <li><strong className="text-slate-200">Case studies:</strong> Real-world examples of governance, diversity, or economic management (e.g., Singapore&apos;s response to COVID-19)</li>
                <li><strong className="text-slate-200">Statistics:</strong> Key figures from Singapore&apos;s Department of Statistics, MCI surveys, or international indices</li>
                <li><strong className="text-slate-200">Comparative examples:</strong> How other countries handle similar issues (e.g., healthcare systems in US vs UK vs Singapore)</li>
              </ul>
            </div>

            <div className="bg-sky-950/30 border border-sky-900/30 rounded-xl p-4">
              <h3 className="text-sm font-bold text-sky-300 mb-1">💡 How SS CK Differs from History CK</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse mt-2">
                  <thead>
                    <tr className="border-b border-sky-900/50">
                      <th className="text-left py-1.5 pr-3 font-black text-slate-500 uppercase tracking-widest">Aspect</th>
                      <th className="text-left py-1.5 pr-3 font-black text-amber-400 uppercase tracking-widest">History CK</th>
                      <th className="text-left py-1.5 font-black text-sky-400 uppercase tracking-widest">SS CK</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-sky-900/30">
                      <td className="py-1.5 pr-3 font-bold text-slate-300">Source</td>
                      <td className="py-1.5 pr-3 text-slate-400">Textbooks, historical records, historiography</td>
                      <td className="py-1.5 text-slate-400">News, government websites, current affairs</td>
                    </tr>
                    <tr className="border-b border-sky-900/30">
                      <td className="py-1.5 pr-3 font-bold text-slate-300">Key facts</td>
                      <td className="py-1.5 pr-3 text-slate-400">Dates, events, names, treaties</td>
                      <td className="py-1.5 text-slate-400">Policy names, statistics, recent examples</td>
                    </tr>
                    <tr className="border-b border-sky-900/30">
                      <td className="py-1.5 pr-3 font-bold text-slate-300">Purpose of CK</td>
                      <td className="py-1.5 pr-3 text-slate-400">Explain causes and evaluate significance</td>
                      <td className="py-1.5 text-slate-400">Corroborate/challenge sources, show awareness</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-slate-300">Temporal focus</td>
                      <td className="py-1.5 pr-3 text-slate-400">Past events (20th century)</td>
                      <td className="py-1.5 text-slate-400">Contemporary issues + historical examples</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">🎯 SS CK Example in an SRQ Answer</h3>
              <blockquote className="border-l-2 border-sky-500 pl-3 text-xs italic text-slate-300">
                &ldquo;Source A claims that government policies have been effective in promoting
                social mobility. This is corroborated by the fact that the proportion of resident
                households living in HDB flats rose from 82% in 2000 to over 80% today, with
                the Enhanced Housing Grant providing up to S$80,000 for lower-income families
                to purchase their first home. Furthermore, SkillsFuture, introduced in 2015,
                provides every Singaporean aged 25+ with S$500 in training credits — demonstrating
                the government&apos;s commitment to enabling upward mobility through education.
                However, Source B&apos;s concern about persistent income inequality reflects
                broader challenges — Singapore&apos;s Gini coefficient, while improving after
                transfers from 0.452 (2012) to 0.375 (2023), still shows significant disparity
                that concerns social observers.&rdquo;
              </blockquote>
              <div className="text-[10px] text-sky-400 mt-1 space-y-1">
                <p>✔ Uses specific policy names (EIP, SkillsFuture, Enhanced Housing Grant)</p>
                <p>✔ Uses statistics from credible sources</p>
                <p>✔ CK both supports AND complicates the source claims</p>
                <p>✔ Demonstrates awareness of current Singaporean social context</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              📰 <strong className="text-slate-200">Building your SS CK bank:</strong> Read the
              Straits Times or CNA weekly. Follow the Ministry of Social and Family Development
              (MSF) and Ministry of Education (MOE) websites. Keep a running list of 3–5 key
              statistics per topic. In the exam, this knowledge separates average answers from
              top-band responses.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="common-mistakes" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Common Mistakes That Cost You Marks</h2>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">The &ldquo;CK Dump&rdquo;</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Writing everything you know about a topic in one paragraph, disconnected from
                  the sources. The examiner sees this immediately. CK must <strong className="text-slate-200">engage</strong>{' '}
                  with the source evidence.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Vague generalisations</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;People were unhappy with colonial rule&rdquo; is not CK — it&apos;s a
                  vague statement anyone could make. Strong CK is <strong className="text-slate-200">specific</strong>:{' '}
                  names, dates, events, statistics.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Forcing irrelevant CK</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Including CK just to show you know it, even if it doesn&apos;t directly support
                  your argument. Irrelevant CK actually <strong className="text-slate-200">hurts</strong>{' '}
                  your score because it wastes time and dilutes your focus.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Contradicting the sources without explanation</h3>
                <p className="text-xs text-slate-400 mt-1">
                  It&apos;s fine to use CK to challenge a source — in fact, top students do this
                  regularly. But you must <strong className="text-slate-200">explain</strong> why
                  your CK might be more reliable, or acknowledge that different perspectives exist.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">8. How to Build and Practise CK</h2>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-black text-indigo-300">🎯 Use MARKUP&apos;s Essay Generator</h3>
            <p className="text-xs text-slate-400">
              Generate unlimited SEQ/SRQ questions on every O-Level topic. Write your essay in
              the canvas, then get instant LORMS-aligned grading that specifically evaluates your
              use of contextual knowledge. The feedback will show you exactly where your CK is
              strong — and where it needs more depth.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
            >
              Try Essay Practice Now →
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Quick Practice Tips:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1.5">
              <li>For every source you read, ask yourself: <strong className="text-slate-200">&ldquo;What do I know from class that connects to this?&rdquo;</strong></li>
              <li>Build a &ldquo;CK bank&rdquo; — a single page of key facts, dates, and quotes for each topic. Review it before every practice session.</li>
              <li>Practise writing paragraph transitions: source evidence → transition phrase → CK → significance</li>
              <li>When reviewing graded essays, highlight every instance of CK in green. If a paragraph has none, rewrite it to include some.</li>
              <li>Read model essays (including the ones in MARKUP&apos;s feedback) to see how strong CK looks in context</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950/80 border border-emerald-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Build your CK with AI-powered practice</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP grades your use of contextual knowledge specifically and shows you how to deepen
            your analysis. Every essay you write gets better.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
          >
            Start Practising — Free
          </Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/seq-evaluation" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SEQ Evaluation
            </Link>
            <Link href="/tips/seq-history-guide" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SEQ Guide (History) →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
