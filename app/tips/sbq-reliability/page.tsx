import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Ace SBQ Reliability Questions (L5/7 Framework)',
  description:
    'Master the SBQ Reliability & Cross-Referencing question for O-Level Social Studies and Elective History. Learn the proven framework to score L5/7 with provenance analysis, cross-referencing, and judgement.',
  openGraph: {
    title: 'How to Ace SBQ Reliability Questions — MARKUP Tips',
    description:
      'Master the SBQ Reliability & Cross-Referencing question with provenance analysis, cross-referencing, and the L5/7 framework. Step-by-step guide with real examples.',
  },
};

export default function SBQReliabilityPage() {
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
          <span className="text-slate-400">SBQ Reliability</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">9 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Ace SBQ Reliability Questions
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The reliability question is worth the most marks in the SBQ section — and it&apos;s
            where top students create the biggest gap. Here&apos;s the L5/7 framework that
            consistently scores top band.
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
            <li><a href="#what-is-reliability" className="text-indigo-400 hover:text-indigo-300 transition">1. What is the SBQ Reliability Question?</a></li>
            <li><a href="#l5-framework" className="text-indigo-400 hover:text-indigo-300 transition">2. The L5/7 Framework — Explained</a></li>
            <li><a href="#provenance" className="text-indigo-400 hover:text-indigo-300 transition">3. Provenance: Where Did the Source Come From?</a></li>
            <li><a href="#cross-reference" className="text-indigo-400 hover:text-indigo-300 transition">4. Cross-Referencing: Use Other Sources as Evidence</a></li>
            <li><a href="#examples" className="text-indigo-400 hover:text-indigo-300 transition">5. Real Examples: L3 vs L5 Responses</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">6. Common Mistakes That Cost You Marks</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">7. How to Practice Effectively</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-reliability" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is the SBQ Reliability Question?</h2>
          <p>
            The SBQ Reliability question asks you to evaluate <strong className="text-slate-200">how reliable</strong>{' '}
            a source is for a historian studying a particular topic. It is typically worth{' '}
            <strong className="text-slate-200">7 marks</strong> in the O-Level Social Studies and
            Elective History papers.
          </p>
          <p>The question usually takes the form:</p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;Study Source C. How reliable is Source C as evidence for [specific historical
            issue]? Explain your answer using details from the sources.&rdquo;
          </blockquote>
          <p>
            <strong className="text-slate-200">Important:</strong> The examiner is not asking whether
            the source is simply &ldquo;reliable&rdquo; or &ldquo;unreliable.&rdquo; They want you
            to assess the source&apos;s <strong className="text-emerald-400">strengths</strong> and
            <strong className="text-amber-400"> limitations</strong>, using both the source&apos;s
            provenance (who wrote it, when, why) and cross-referencing with other sources.
          </p>
          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4 text-center">
            <p className="text-xs text-indigo-300 font-bold">
              💡 The reliability question rewards you for nuance — the best answers show that a
              source is reliable <em>in some ways</em> and unreliable <em>in others</em>.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="l5-framework" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The L5/7 Framework — Explained</h2>
          <p>
            The LORMS rubric for SBQ Reliability awards marks across{' '}
            <strong className="text-slate-200">five bands</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 — 6–7 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Evaluative Judgement</p>
              <p className="text-[10px] text-slate-500 mt-1">Assesses reliability using BOTH provenance AND cross-referencing. Makes a nuanced judgement about strengths and limitations.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">L4 — 5 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Detailed Assessment</p>
              <p className="text-[10px] text-slate-500 mt-1">Uses provenance OR cross-referencing in depth, but not both. Good analysis, but one-sided.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L3 — 3–4 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Surface-level Reliability Check</p>
              <p className="text-[10px] text-slate-500 mt-1">General comments about reliability without specific evidence from sources.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L2 — 1–2 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Descriptive</p>
              <p className="text-[10px] text-slate-500 mt-1">Simply describes the source content without any assessment of reliability.</p>
            </div>
          </div>
          <p className="mt-2">
            <strong className="text-slate-200">The key to L5:</strong> You must demonstrate{' '}
            <strong className="text-emerald-400">both</strong> provenance awareness AND
            cross-referencing, and then combine them into an <strong className="text-slate-200">overall
            judgement</strong> about the source&apos;s reliability.
          </p>
        </section>

        {/* Section 3 */}
        <section id="provenance" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Provenance: Where Did the Source Come From?</h2>
          <p>
            Provenance refers to the <strong className="text-slate-200">origin</strong> of the source.
            Every source in your O-Level paper comes with a provenance line — that tiny text below
            the source that tells you who wrote it, when, and in what context. <strong className="text-emerald-400">This is your single most important piece of information</strong> for the reliability question.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Provenance Checklist — 5 Questions to Ask</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-emerald-400 font-bold text-xs">1.</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">Who wrote it?</p>
                  <p className="text-[10px] text-slate-400">A government official? A journalist? An eyewitness? An academic? The author&apos;s position affects their perspective and potential bias.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 font-bold text-xs">2.</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">When was it written?</p>
                  <p className="text-[10px] text-slate-400">Was it written at the time of the event (contemporary) or years later (retrospective)? Contemporary sources may have immediacy but limited perspective; retrospective sources may benefit from hindsight but suffer from memory lapses.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 font-bold text-xs">3.</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">Why was it written? (Purpose)</p>
                  <p className="text-[10px] text-slate-400">Was it a speech to rally support? A private diary? A propaganda poster? A newspaper report? The purpose shapes content — a source designed to persuade will emphasise some things and omit others.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 font-bold text-xs">4.</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">Who was the intended audience?</p>
                  <p className="text-[10px] text-slate-400">A speech to parliament and a conversation with a friend will reveal very different information. The audience affects what is said and how it is presented.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 font-bold text-xs">5.</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">What type of source is it?</p>
                  <p className="text-[10px] text-slate-400">Official government records, personal letters, newspaper articles, political speeches, photographs — each type has different conventions and purposes that affect reliability.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Provenance in Action — Example Analysis</p>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              &ldquo;Source D is <strong className="text-slate-200">useful</strong> as evidence because
              it is a <strong className="text-slate-200">government report</strong> published in 1954
              by the British colonial administration in Singapore. As an official record, it would
              have had access to detailed population statistics that other sources lacked. However,
              its <strong className="text-slate-200">reliability is limited</strong> because the
              British government had a vested interest in downplaying anti-colonial sentiment during
              this period — they may have deliberately omitted data about protest movements to
              present a picture of stability.&rdquo;
            </p>
            <p className="text-[9px] text-emerald-400">✔ Identifies provenance (government report, 1954)</p>
            <p className="text-[9px] text-emerald-400">✔ Considers strengths AND limitations</p>
            <p className="text-[9px] text-emerald-400">✔ Links bias to the author&apos;s vested interest</p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="cross-reference" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Cross-Referencing: Use Other Sources as Evidence</h2>
          <p>
            Cross-referencing is what separates L4 from L5. You need to use{' '}
            <strong className="text-slate-200">other sources in the paper</strong> as evidence to
            support your assessment of the source in question.
          </p>
          <p>There are two types of cross-referencing:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-400">✅ Supporting Cross-Reference</h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Source E agrees with Source D on a key point, which <strong className="text-slate-200">increases</strong>{' '}
                Source D&apos;s reliability because two independent sources are corroborating each other.
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-amber-400">✅ Contradicting Cross-Reference</h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Source F contradicts Source D on a specific fact, which{' '}
                <strong className="text-slate-200">challenges</strong> Source D&apos;s reliability.
                You must then consider which source is more reliable based on provenance.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Cross-Referencing in Action — Example</p>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              &ldquo;Source D&apos;s reliability is <strong className="text-slate-200">supported</strong>{' '}
              by Source E, a newspaper article from the same period, which reports similar statistics
              about population growth. This corroboration suggests that Source D&apos;s data is
              factually accurate. <strong className="text-amber-400">However</strong>, Source F — a
              personal letter from a local community leader — paints a very different picture of
            living conditions, suggesting that the government report exaggerated improvements. Given
              that Source F has no obvious political agenda, its contradiction undermines the
              reliability of Source D&apos;s more positive portrayal.&rdquo;
            </p>
            <p className="text-[9px] text-emerald-400">✔ Uses specific sources as evidence</p>
            <p className="text-[9px] text-emerald-400">✔ Shows both supporting and contradicting evidence</p>
            <p className="text-[9px] text-emerald-400">✔ Weighs the relative reliability of different sources</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Real Examples: L3 vs L5 Responses</h2>
          <p>
            See the difference between a mediocre L3 answer and a top-band L5 answer to the
            same question.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sample Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              Study Source C, a speech by the British Prime Minister in 1956. How reliable is Source C
              as evidence for British attitudes towards decolonisation in Southeast Asia? Explain your
              answer using details from the sources.
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L3 Response (3–4 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Source C is a speech so it might be biased. The British Prime Minister was
                trying to make Britain look good. So Source C is not very reliable for studying
                British attitudes.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 space-y-1">
                <p>❌ Generic claims about bias — no specific evidence</p>
                <p>❌ No provenance analysis (who, when, why, audience)</p>
                <p>❌ No cross-referencing with other sources</p>
                <p>❌ One-sided — only identifies limitations, ignores strengths</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 Response (6–7 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;Source C has limitations as evidence because it is a{' '}
                <strong className="text-slate-200">public speech</strong> by the British Prime
                Minister. As the head of government, he had a vested interest in presenting Britain&apos;s
                decolonisation policy in a positive light — especially in 1956, when international
                pressure to decolonise was growing. The speech likely exaggerates Britain&apos;s
                willingness to grant independence while downplaying the role of anti-colonial
                movements in forcing Britain&apos;s hand.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">However</strong>, Source C remains useful in some
                respects. As a Prime Ministerial speech, it accurately reflects the{' '}
                <strong className="text-slate-200">official government position</strong> — even if
                that position was self-serving. Additionally, Source D — a contemporaneous diplomatic
                cable — confirms that Britain was indeed planning to grant independence to Malaya,
                which <strong className="text-slate-200">corroborates</strong> part of Source C&apos;s claim.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                <strong className="text-slate-200">Overall judgement:</strong> Source C is reliable
                as evidence for Britain&apos;s <strong className="text-emerald-400">official
                narrative</strong> of decolonisation, but unreliable as evidence for the{' '}
                <strong className="text-amber-400">true motivations</strong> behind British policy,
                which must be supplemented by other sources.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 space-y-1 mt-2">
                <p>✅ Specific provenance analysis (speech, PM, 1956)</p>
                <p>✅ Identifies both strengths AND limitations</p>
                <p>✅ Cross-references with Source D</p>
                <p>✅ Makes an overall judgement about reliability</p>
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
                <h3 className="text-sm font-bold text-slate-200">Saying &ldquo;unreliable because biased&rdquo; without explaining</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Every source is biased in some way. The question is <strong className="text-slate-200">how</strong>{' '}
                  the bias affects reliability and <strong className="text-slate-200">what</strong> the
                  source can still tell you. Always link bias to the source&apos;s purpose and audience.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Ignoring provenance</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The provenance line is there for a reason. If you ignore who wrote the source and
                  when, you cannot score above L4. <strong className="text-slate-200">Always</strong>{' '}
                  start your analysis with provenance.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Only discussing limitations (no strengths)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A source can be useful even if it&apos;s biased. A propaganda poster, for example,
                  is very useful for studying what a government <em>wanted</em> people to believe.
                  Always address both sides.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No cross-referencing</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This is the number one reason students cap at L4. You must use{' '}
                  <strong className="text-slate-200">other sources</strong> from the paper to support
                  your assessment. Cross-referencing is worth a full band on the rubric.
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
              Generate unlimited SBQ practice papers with fresh sources. Each source comes with
              a rich provenance line designed to test your analytical skills. Write your reliability
              assessment and get instant LORMS-aligned grading with targeted feedback on your
              provenance analysis and cross-referencing technique.
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
              <li>Always circle the provenance line before you start writing — it&apos;s your anchor</li>
              <li>Spend 2 minutes planning: list one strength, one limitation, and one cross-reference</li>
              <li>Use the PEEL structure for each paragraph — Point, Evidence from the source, Explanation of reliability, Link back to the question</li>
              <li>End with an overall judgement: &ldquo;On balance, Source C is partially reliable because…&rdquo;</li>
              <li>Practise with a 14-minute timer — that&apos;s your exam pace for a 7-mark question</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master reliability with AI-powered practice</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP generates fresh O-Level sources, grades your reliability analysis, and shows you
            exactly which skills to improve — provenance, cross-referencing, or judgement.
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
            <Link href="/tips/sbq-source-analysis" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SBQ Source Analysis
            </Link>
            <Link href="/tips/sbq-purpose" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SBQ Purpose →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
