import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Ace SBQ Purpose Questions (L5/7 Framework)',
  description:
    'Master the SBQ Purpose / Author Intent question for O-Level Social Studies and Elective History. Learn the 4-step L5/7 framework to analyse why a source was created — with real SEAB-style examples.',
  openGraph: {
    title: 'How to Ace SBQ Purpose Questions — MARKUP Tips',
    description:
      'Master the SBQ Purpose question with the 4-step L5/7 framework. Learn to analyse message, audience, intention, and technique for top-band marks.',
  },
};

export default function SBQPurposePage() {
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
          <span className="text-slate-400">SBQ Purpose</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">9 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Ace SBQ Purpose Questions
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The Purpose question asks you to read between the lines — why was this source created,
            and what did the author want to achieve? Here&apos;s the 4-step framework that unlocks L5/7.
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
            <li><a href="#what-is-purpose" className="text-indigo-400 hover:text-indigo-300 transition">1. What is the SBQ Purpose Question?</a></li>
            <li><a href="#l5-framework" className="text-indigo-400 hover:text-indigo-300 transition">2. The L5/7 Framework — Explained</a></li>
            <li><a href="#four-step" className="text-indigo-400 hover:text-indigo-300 transition">3. The 4-Step Purpose Analysis Method</a></li>
            <li><a href="#techniques" className="text-indigo-400 hover:text-indigo-300 transition">4. Identifying Persuasive Techniques</a></li>
            <li><a href="#examples" className="text-indigo-400 hover:text-indigo-300 transition">5. Real Examples: L2 vs L5 Responses</a></li>
            <li><a href="#common-mistakes" className="text-indigo-400 hover:text-indigo-300 transition">6. Common Mistakes That Cost You Marks</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">7. How to Practice Effectively</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="what-is-purpose" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. What is the SBQ Purpose Question?</h2>
          <p>
            The SBQ Purpose question asks you to identify <strong className="text-slate-200">why</strong>{' '}
            a source was created and <strong className="text-slate-200">what the author intended</strong>{' '}
            to achieve. It is worth <strong className="text-slate-200">7 marks</strong> and is one of
            the most challenging SBQ skills because it requires you to infer the author&apos;s motivation
            from the source itself.
          </p>
          <p>The question typically takes the form:</p>
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 bg-slate-950/50 py-3 px-4 rounded-r-lg">
            &ldquo;Study Source D. What is the likely purpose of Source D? Explain your answer using
            details from the source and your knowledge of the historical context.&rdquo;
          </blockquote>
          <p>
            <strong className="text-slate-200">Key insight:</strong> The Purpose question is NOT asking
            you what the source <em>says</em> — it&apos;s asking you what the author{' '}
            <strong className="text-emerald-400">wanted to achieve</strong> by creating it. Two sources
            on the same topic can have completely different purposes depending on the author&apos;s
            goals and audience.
          </p>
        </section>

        {/* Section 2 */}
        <section id="l5-framework" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The L5/7 Framework — Explained</h2>
          <p>
            The LORMS rubric for SBQ Purpose awards marks across{' '}
            <strong className="text-slate-200">five bands</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 — 6–7 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Insightful Purpose Analysis</p>
              <p className="text-[10px] text-slate-500 mt-1">Identifies purpose with precision, explains HOW the source achieves it (using techniques), and links to the broader historical context.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">L4 — 5 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Clear Purpose</p>
              <p className="text-[10px] text-slate-500 mt-1">States the purpose with some supporting evidence from the source, but misses the persuasive techniques used.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">L3 — 3–4 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Implied Purpose</p>
              <p className="text-[10px] text-slate-500 mt-1">Vague statement of purpose without specific evidence. May confuse content with purpose.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L2 — 1–2 marks</p>
              <p className="text-xs text-slate-300 mt-1 font-bold">Describes Content</p>
              <p className="text-[10px] text-slate-500 mt-1">Describes what the source says without any analysis of why it was created.</p>
            </div>
          </div>
          <p className="mt-2">
            <strong className="text-slate-200">The key to L5:</strong> Go beyond simply stating the
            purpose. Show the examiner <strong className="text-emerald-400">how</strong> the source
            achieves its purpose through specific language, imagery, or persuasive techniques.
          </p>
        </section>

        {/* Section 3 */}
        <section id="four-step" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. The 4-Step Purpose Analysis Method</h2>
          <p>
            Use this structured method for every Purpose question. It will guide you from L2 to
            L5 analysis.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Identify the Message</h3>
              </div>
              <p className="text-xs text-slate-400">
                What is the source <strong className="text-slate-200">trying to say</strong>? What is
                its central argument or claim? Look for the main point the author is pushing, not
                just the facts they mention.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2">
                <p>💡 Example: A 1950s poster about Singapore&apos;s housing estates isn&apos;t just showing buildings — it&apos;s saying &ldquo;the government is improving your life.&rdquo;</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Identify the Audience</h3>
              </div>
              <p className="text-xs text-slate-400">
                Who is the source <strong className="text-slate-200">aimed at</strong>? The audience
                shapes the purpose — a speech to parliament and a speech to the general public will
                have very different purposes even if they are on the same topic.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 mt-2 space-y-1">
                <p>🎯 Audience categories to consider:</p>
                <p>• Domestic vs. international audience</p>
                <p>• Supporters vs. opponents vs. neutral observers</p>
                <p>• Elite (government, academics) vs. general public</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Identify the Intention</h3>
              </div>
              <p className="text-xs text-slate-400">
                What does the author <strong className="text-slate-200">want the audience to do or believe</strong>{' '}
                after reading or viewing the source? Common intentions include:
              </p>
              <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1 mt-2">
                <li><strong className="text-slate-200">Persuade</strong> — convince the audience to adopt a particular view</li>
                <li><strong className="text-slate-200">Inform</strong> — provide information (but usually with a slant)</li>
                <li><strong className="text-slate-200">Warn</strong> — alert the audience to a threat or danger</li>
                <li><strong className="text-slate-200">Justify</strong> — defend an action or policy that might be controversial</li>
                <li><strong className="text-slate-200">Mobilise</strong> — urge the audience to take action (vote, protest, enlist)</li>
                <li><strong className="text-slate-200">Reassure</strong> — calm fears or build confidence</li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400">4</span>
                <h3 className="text-sm font-black text-white">Identify the Persuasive Techniques</h3>
              </div>
              <p className="text-xs text-slate-400">
                This is what earns L5. Show <strong className="text-slate-200">how</strong> the source
                achieves its purpose through specific techniques. Quote or closely paraphrase the
                source to support your analysis. See the next section for a detailed breakdown of
                persuasive techniques.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="techniques" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Identifying Persuasive Techniques</h2>
          <p>
            To score L5, you must explain <strong className="text-slate-200">how</strong> the source
            carries out its purpose. Here are the most common persuasive techniques tested in the
            O-Levels:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-orange-400">Emotional Language</h3>
              <p className="text-[10px] text-slate-400 mt-1">Words designed to provoke an emotional response — fear, anger, sympathy, pride. Example: &ldquo;innocent victims,&rdquo; &ldquo;ruthless aggression.&rdquo;</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-orange-400">Exaggeration / Hyperbole</h3>
              <p className="text-[10px] text-slate-400 mt-1">Deliberate overstatement to make a point seem more dramatic or urgent. Example: &ldquo;the greatest threat to civilisation.&rdquo;</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-orange-400">Selective Use of Facts</h3>
              <p className="text-[10px] text-slate-400 mt-1">Including facts that support the argument while omitting those that don&apos;t. Example: citing rising employment but ignoring rising inflation.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-orange-400">Appeal to Authority</h3>
              <p className="text-[10px] text-slate-400 mt-1">Citing experts, leaders, or official sources to lend credibility. Example: &ldquo;As the Prime Minister himself stated…&rdquo;</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-orange-400">Labelling / Name-calling</h3>
              <p className="text-[10px] text-slate-400 mt-1">Using loaded labels to frame someone or something negatively. Example: &ldquo;extremists,&rdquo; &ldquo;radicals,&rdquo; &ldquo;traitors.&rdquo;</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-orange-400">Appeal to Common Good</h3>
              <p className="text-[10px] text-slate-400 mt-1">Framing an argument as being in everyone&apos;s interest. Example: &ldquo;for the sake of our nation&apos;s future.&rdquo;</p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Putting It Together — Technique + Purpose</p>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              &ldquo;Source D <strong className="text-slate-200">uses emotional language</strong> such as
              &apos;ruthless exploitation&apos; and &apos;innocent workers&apos; to evoke sympathy
              for the labour movement. This <strong className="text-slate-200">reveals</strong> its
              purpose: to mobilise public support for striking workers by framing their struggle as a
              moral issue rather than an economic one. The <strong className="text-slate-200">target
              audience</strong> is the general public, not just union members — the source wants to
              put pressure on employers by shaping public opinion.&rdquo;
            </p>
            <p className="text-[9px] text-emerald-400">✔ Identifies the specific technique (emotional language)</p>
            <p className="text-[9px] text-emerald-400">✔ Quotes evidence from the source</p>
            <p className="text-[9px] text-emerald-400">✔ Links technique to intended effect on the audience</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="examples" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Real Examples: L2 vs L5 Responses</h2>
          <p>
            See how a basic answer differs from a sophisticated purpose analysis on the same source.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Sample Question</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-400">
              Study Source E, a speech by the Prime Minister of Singapore in 1965 shortly after
              independence. What is the likely purpose of this speech? Explain your answer using
              details from the source.
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">L2 Response (1–2 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;The purpose of Source E is to talk about independence. It says that
                Singapore is now independent and the people should be proud.&rdquo;
              </p>
              <div className="text-[10px] text-red-400 space-y-1">
                <p>❌ Confuses content with purpose (describing ≠ analysing)</p>
                <p>❌ No mention of audience</p>
                <p>❌ No persuasive techniques identified</p>
                <p>❌ No link to historical context</p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">L5 Response (6–7 marks)</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;The purpose of Source E is to <strong className="text-slate-200">reassure</strong>{' '}
                Singaporeans about the future of the newly independent nation while{' '}
                <strong className="text-slate-200">justifying</strong> the separation from Malaysia.
                The <strong className="text-slate-200">target audience</strong> is the Singaporean
                public, who would have been anxious and uncertain about the future in 1965.
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed mt-2">
                To achieve this purpose, the speech uses{' '}
                <strong className="text-slate-200">optimistic emotional language</strong>, describing
                Singapore as a &apos;shining beacon&apos; and the future as &apos;full of
                promise.&apos; It also employs <strong className="text-slate-200">selective use of
                facts</strong> — emphasising Singapore&apos;s economic strengths while remaining
                silent about the political challenges of survival without Malaysia. By framing
                independence as a &apos;bold new chapter&apos; rather than a &apos;difficult
                separation,&apos; the Prime Minister seeks to <strong className="text-slate-200">build
                confidence</strong> and discourage the public from questioning the government&apos;s
                decision. The <strong className="text-slate-200">appeal to common good</strong> —
                &apos;together we will build a nation&apos; — further unifies the audience behind
                the government&apos;s vision.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 space-y-1 mt-2">
                <p>✅ Identifies specific purpose (reassure + justify)</p>
                <p>✅ Identifies audience and their concerns</p>
                <p>✅ Analyses persuasive techniques with quotes</p>
                <p>✅ Links to historical context (1965 separation)</p>
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
                <h3 className="text-sm font-bold text-slate-200">Describing content instead of analysing purpose</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This is the most common mistake. &ldquo;The source talks about X&rdquo; is L2.
                  &ldquo;The source uses X to persuade the audience to believe Y&rdquo; is L5.
                  <strong className="text-slate-200"> Purpose is about WHY, not WHAT.</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Vague purpose statements</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &ldquo;The purpose is to inform&rdquo; is not specific enough. <em>Inform who about
                  what, and why?</em> A good purpose statement includes the message, the audience,
                  and the intended effect.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Ignoring the audience</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Purpose and audience are linked. A speech to parliament has a different purpose
                  from the same speech broadcast on the radio to the public. Always consider who
                  the source is speaking to.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-red-400 text-lg">🚫</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">No reference to persuasive techniques</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The strongest answers don&apos;t just state the purpose — they show{' '}
                  <strong className="text-slate-200">how</strong> the source achieves it. Quote
                  specific words or phrases and explain why they were chosen.
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
              Generate unlimited SBQ papers with purpose-focused questions. MARKUP sources include
              rich provenance information and authentic O-Level style content. After writing your
              answer, receive instant LORMS-aligned grading that tells you exactly how well you
              identified purpose, audience, and persuasive techniques.
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
              <li>Before writing, jot down: message, audience, intention, and one technique used</li>
              <li>Practise with a 14-minute timer — same exam pace as the reliability question</li>
              <li>Use the phrase &ldquo;The purpose of Source X is to [verb] [audience] to [effect]&rdquo;</li>
              <li>Always quote at least 2 specific words or phrases as evidence of technique</li>
              <li>End by linking the purpose to the historical context (e.g., &ldquo;This makes sense because in [year], [event] was happening…&rdquo;)</li>
            </ul>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master purpose analysis with AI</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP grades your purpose analysis and gives you specific feedback on whether you
            identified the audience, persuasive techniques, and historical context correctly.
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
            <Link href="/tips/sbq-reliability" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SBQ Reliability
            </Link>
            <Link href="/tips/sbq-utility-comparison" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SBQ 10-Mark Comparison →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
