import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Analyse Sources for SBQ — A Complete Framework',
  description:
    'Master the foundational skill of source analysis for O-Level SBQ. Learn the 5-question provenance framework, tone analysis, content vs message, and cross-referencing techniques that apply to every SBQ question type.',
  openGraph: {
    title: 'How to Analyse Sources for SBQ — Complete Framework | MARKUP Tips',
    description:
      'Master source analysis for O-Level SBQ. Provenance framework, tone analysis, content vs message, and cross-referencing skills for every SBQ question type.',
  },
};

export default function SBQSourceAnalysisPage() {
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
          <span className="text-slate-400">Source Analysis</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">11 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Analyse Sources for SBQ — A Complete Framework
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Every SBQ question — comparison, reliability, purpose, utility — depends on one
            underlying skill: the ability to analyse a source. Master this first, and every
            SBQ question becomes easier. Here&apos;s the complete framework.
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
            <li><a href="#why-source-analysis" className="text-indigo-400 hover:text-indigo-300 transition">1. Why Source Analysis Is the Foundation of SBQ</a></li>
            <li><a href="#provenance" className="text-indigo-400 hover:text-indigo-300 transition">2. The 5-Question Provenance Framework</a></li>
            <li><a href="#tone" className="text-indigo-400 hover:text-indigo-300 transition">3. Tone and Language — What to Look For</a></li>
            <li><a href="#content-vs-message" className="text-indigo-400 hover:text-indigo-300 transition">4. Content vs Message — The Critical Distinction</a></li>
            <li><a href="#cross-referencing" className="text-indigo-400 hover:text-indigo-300 transition">5. Cross-Referencing Sources</a></li>
            <li><a href="#applying-skills" className="text-indigo-400 hover:text-indigo-300 transition">6. Applying Source Analysis to Different SBQ Types</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">7. How to Practise Source Analysis</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="why-source-analysis" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. Why Source Analysis Is the Foundation of SBQ</h2>
          <p>
            Most students dive straight into answering the specific SBQ question — &ldquo;How reliable
            is Source A?&rdquo; or &ldquo;What is the purpose of Source B?&rdquo; — without first
            doing the groundwork of <strong className="text-slate-200">source analysis</strong>.
            This is like trying to build a house without laying the foundation.
          </p>
          <p>
            <strong className="text-slate-200">Source analysis</strong> is the process of
            systematically examining a source to understand what it is, who made it, why it was
            made, and what it really says. These skills transfer directly to every SBQ question:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Comparison (6-mark)</h3>
              <p className="text-[10px] text-slate-400 mt-1">You need to identify similarities and differences in content, tone, and message — all source analysis skills.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Reliability (5/7-mark)</h3>
              <p className="text-[10px] text-slate-400 mt-1">You need to evaluate provenance, cross-reference, and assess typicality — all source analysis skills.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Purpose (5/7-mark)</h3>
              <p className="text-[10px] text-slate-400 mt-1">You need to infer message, audience, and intention — all source analysis skills.</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest">Utility/Comparison (10-mark)</h3>
              <p className="text-[10px] text-slate-400 mt-1">You need to analyse content for usefulness AND compare across sources — all source analysis skills.</p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">The insight:</strong> Top SBQ students don&apos;t
              just answer the question — they first <em>interrogate the source</em>. The best
              answers show the examiner that you&apos;ve really engaged with the source, not just
              extracted a relevant quote.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="provenance" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The 5-Question Provenance Framework</h2>
          <p>
            <strong className="text-slate-200">Provenance</strong> means &ldquo;where the source
            comes from.&rdquo; Before you even think about the content, ask these 5 questions
            about every source. Make this a habit — it takes 30 seconds.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-400 shrink-0">1</span>
                <div>
                  <h3 className="text-sm font-bold text-white">WHO is the author/speaker?</h3>
                  <p className="text-xs text-slate-400 mt-1">Is it an individual? An organisation? A government body? A journalist? An ordinary person? The author&apos;s identity tells you about their potential biases and perspective.</p>
                  <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                    <p>💡 <em>&ldquo;A British colonial official writing about Malaya&rdquo; vs &ldquo;A Malay nationalist writing about Malaya&rdquo; — same topic, radically different perspective.</em></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-sm font-black text-emerald-400 shrink-0">2</span>
                <div>
                  <h3 className="text-sm font-bold text-white">WHEN was the source created?</h3>
                  <p className="text-xs text-slate-400 mt-1">The date is not just a detail — it&apos;s one of the most important pieces of information. Was it written at the time of the events (contemporary) or later (retrospective)? Was it before, during, or after key events?</p>
                  <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                    <p>💡 <em>&ldquo;A speech by Lee Kuan Yew in 1965 (just after independence)&rdquo; vs &ldquo;Lee Kuan Yew&apos;s memoirs published in 2000&rdquo; — timing affects perspective and reliability differently.</em></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-sm font-black text-amber-400 shrink-0">3</span>
                <div>
                  <h3 className="text-sm font-bold text-white">WHAT TYPE of source is it?</h3>
                  <p className="text-xs text-slate-400 mt-1">Is it a government document (official record)? A personal letter (private opinion)? A newspaper article (public communication with possible bias)? A photograph (visual evidence that can be staged)? A speech (performance with audience in mind)?</p>
                  <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                    <p>💡 <em>A diplomatic cable (private, meant for few eyes) is very different from a political speech (public, meant to persuade). Don&apos;t treat them the same way.</em></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-sm font-black text-rose-400 shrink-0">4</span>
                <div>
                  <h3 className="text-sm font-bold text-white">WHY was the source created?</h3>
                  <p className="text-xs text-slate-400 mt-1">What was the author trying to achieve? To inform? To persuade? To justify? To criticise? To record? The purpose shapes the content dramatically.</p>
                  <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                    <p>💡 <em>A company&apos;s annual report (meant to attract investors) will present information differently from an independent journalist&apos;s investigation.</em></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-sm font-black text-cyan-400 shrink-0">5</span>
                <div>
                  <h3 className="text-sm font-bold text-white">FOR WHOM was the source intended?</h3>
                  <p className="text-xs text-slate-400 mt-1">Who is the intended audience? A domestic audience? An international audience? A specific group or the general public? Audience affects what the author emphasises or omits.</p>
                  <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                    <p>💡 <em>A speech about democracy aimed at Western audiences will differ from the same leader&apos;s speech on the same topic aimed at a domestic audience — even if the topic is the same.</em></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-xs text-emerald-300 font-bold">
              🎯 <strong className="text-white">Provenance cheat sheet for exams:</strong> Ask yourself
              &ldquo;What does the provenance tell me about this source&apos;s perspective, reliability,
              and purpose?&rdquo; — then write it down as your opening sentence for the question.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="tone" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Tone and Language — What to Look For</h2>
          <p>
            A source&apos;s <strong className="text-slate-200">tone</strong> — its emotional quality
            and attitude — is one of the most revealing aspects of source analysis. The same fact can
            be presented with radically different tones, revealing the author&apos;s attitude.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Common Tones</p>
              <ul className="text-xs text-slate-400 mt-2 space-y-1.5">
                <li><strong className="text-slate-200">Neutral/Objective</strong> — factual, balanced language</li>
                <li><strong className="text-slate-200">Critical/Hostile</strong> — negative language, attacks</li>
                <li><strong className="text-slate-200">Supportive/Praising</strong> — positive language, flattery</li>
                <li><strong className="text-slate-200">Urgent/Warning</strong> — language of danger or crisis</li>
                <li><strong className="text-slate-200">Sarcastic/Ironic</strong> — saying the opposite of what is meant</li>
                <li><strong className="text-slate-200">Persuasive/Rhetorical</strong> — designed to convince</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Key Language Features</p>
              <ul className="text-xs text-slate-400 mt-2 space-y-1.5">
                <li><strong className="text-slate-200">Emotive language</strong> — words that trigger emotions (&ldquo;tragic,&rdquo; &ldquo;heroic&rdquo;)</li>
                <li><strong className="text-slate-200">Exaggeration/Hyperbole</strong> — overstatement to make a point</li>
                <li><strong className="text-slate-200">Understatement</strong> — downplaying to minimise impact</li>
                <li><strong className="text-slate-200">Rhetorical questions</strong> — questions that imply answers</li>
                <li><strong className="text-slate-200">Loaded terms</strong> — words with strong connotations</li>
                <li><strong className="text-slate-200">Repetition</strong> — reinforcing a key message</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Tone Analysis Example</p>
            <blockquote className="border-l-2 border-slate-600 pl-3 text-xs italic text-slate-300">
              &ldquo;The government&apos;s reckless decision to increase taxes has brought untold
              suffering to hardworking families. Yet again, the authorities have demonstrated their
              complete indifference to the plight of ordinary citizens.&rdquo;
            </blockquote>
            <div className="text-[10px] text-slate-400 mt-2 space-y-1">
              <p>🔍 Tone: <strong className="text-slate-200">Critical and accusatory</strong></p>
              <p>🔍 Key language: &ldquo;Reckless&rdquo; (loaded term), &ldquo;untold suffering&rdquo; (emotive exaggeration), &ldquo;complete indifference&rdquo; (absolutist language)</p>
              <p>🔍 What this reveals: The author is hostile to the government. They are not simply reporting — they are <strong className="text-slate-200">arguing against</strong> the policy. This tells us about their purpose and likely bias.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="content-vs-message" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Content vs Message — The Critical Distinction</h2>
          <p>
            This is the single most important concept in SBQ that many students miss.
          </p>
          <p>
            <strong className="text-slate-200">Content</strong> is what the source says on the surface
            — the facts, claims, and information presented.
          </p>
          <p>
            <strong className="text-slate-200">Message</strong> is what the source is <em>trying
            to communicate</em> — the underlying argument, opinion, or point the author wants you to
            believe or understand.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Content Example</p>
              <p className="text-xs text-slate-400 mt-1 italic">
                &ldquo;The source says that the Japanese occupation lasted from 1942 to 1945 and that
                it was a difficult period for local people.&rdquo;
              </p>
              <p className="text-[9px] text-indigo-400 mt-1">This is just describing what the source says — basic comprehension.</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Message Example</p>
              <p className="text-xs text-slate-400 mt-1 italic">
                &ldquo;The source&apos;s message is that the Japanese occupation was a transformative experience
                for Southeast Asia that, despite its brutality, catalysed nationalist movements.&rdquo;
              </p>
              <p className="text-[9px] text-emerald-400 mt-1">This goes beyond description to identify the source&apos;s argument.</p>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⚠️ <strong className="text-white">Critical:</strong> Top-band SBQ answers are built on
              message analysis, not content description. When you write &ldquo;The source shows…&rdquo;
              or &ldquo;The source says…&rdquo;, check whether you&apos;re describing content or
              analysing message. Most students do the former; top students do the latter.
            </p>
          </div>

          <p>
            <strong className="text-slate-200">How to find the message:</strong> Ask yourself
            &ldquo;What does the author <em>want me to believe</em> after reading this source?&rdquo;
            The answer to that question is the message. For purpose questions, the message is
            the core of your analysis.
          </p>
        </section>

        {/* Section 5 */}
        <section id="cross-referencing" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Cross-Referencing Sources</h2>
          <p>
            Cross-referencing means comparing sources against each other to test their reliability,
            identify patterns, and spot contradictions. This skill is central to every SBQ question
            that involves multiple sources.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-400">✅ Supporting Cross-Reference</h3>
              <p className="text-xs text-slate-400 mt-1">
                Source A says X. Source B also says X, or provides additional evidence consistent
                with X. This <strong className="text-slate-200">corroboration</strong> makes Source
                A more likely to be reliable.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;Source A claims that the CIA funded the coup. This is corroborated by Source C, a declassified US Senate report, which states that &lsquo;substantial funds were channelled to opposition groups.&rsquo;&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-rose-400">❌ Contradicting Cross-Reference</h3>
              <p className="text-xs text-slate-400 mt-1">
                Source A says X, but Source B says Y (something that contradicts X). This raises
                questions about whose account is more reliable — you need to then evaluate
                provenance to decide.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;However, Source D, a speech by the prime minister of the time, claims the coup was &lsquo;a spontaneous uprising of the people.&rsquo; This directly contradicts Source A&apos;s claim about CIA involvement. Given that the prime minister had political reasons to deny foreign interference, Source A may be more reliable.&rdquo;</em></p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400">🔍 Complementary Cross-Reference</h3>
              <p className="text-xs text-slate-400 mt-1">
                Source A says X. Source B doesn&apos;t say X, but provides additional context that
                helps you understand X better. This is the most sophisticated type of
                cross-referencing.
              </p>
              <div className="bg-slate-900/70 rounded-lg p-2 mt-2 text-[10px] font-mono text-slate-400">
                <p>💡 <em>&ldquo;Source A focuses on the economic consequences of the policy. Source B, however, provides the social context — revealing that unemployment had reached 12% — which explains <em>why</em> the economic consequences were so severe.&rdquo;</em></p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              🎯 <strong className="text-slate-200">Always cross-reference:</strong> Even if the
              question doesn&apos;t explicitly ask you to compare sources, cross-referencing shows
              the examiner you&apos;re thinking critically about the sources as a set.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="applying-skills" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Applying Source Analysis to Different SBQ Types</h2>
          <p>
            Here&apos;s how source analysis skills transfer to each specific SBQ question type:
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 text-lg">📖</span>
                <h3 className="text-sm font-bold text-slate-200">Comparison (6-mark)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Use your content analysis, tone analysis, and message analysis to identify
                <strong className="text-slate-200"> similarities and differences</strong> between
                sources. Don&apos;t just list — explain what the similarities/differences reveal.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-lg">🔍</span>
                <h3 className="text-sm font-bold text-slate-200">Reliability (5/7-mark)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your provenance analysis is the <strong className="text-slate-200">foundation</strong>{' '}
                of reliability evaluation. Who wrote it? When? What type? Then cross-reference
                against other sources and your CK to assess typicality.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-lg">🎯</span>
                <h3 className="text-sm font-bold text-slate-200">Purpose (5/7-mark)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your message analysis is <strong className="text-slate-200">essential</strong> for
                purpose. Identify the message first, then explain <em>why</em> the author is
                communicating that message, to <em>whom</em>, and for what <em>intended effect</em>.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-violet-400 text-lg">⚡</span>
                <h3 className="text-sm font-bold text-slate-200">Utility/Comparison (10-mark)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your content analysis and cross-referencing skills determine how well you can
                assess how far sources agree AND evaluate their usefulness. Combine content
                analysis with provenance judgement.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. How to Practise Source Analysis</h2>

          <div className="space-y-3">
            <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-black text-indigo-300">🎯 Use the 30-Second Provenance Drill</h3>
              <p className="text-xs text-slate-400">
                Before you read the content of any source, take 30 seconds to ask the 5 provenance
                questions. Write down quick notes for each. Then read the source — you&apos;ll be
                amazed at how much more you notice.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200">📝 Source Analysis Template</h3>
              <p className="text-xs text-slate-400 mt-1">
                Use this template for every source in your practice:
              </p>
              <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-1">
                <p><span className="text-indigo-400">Author:</span> _________</p>
                <p><span className="text-emerald-400">Date:</span> _________</p>
                <p><span className="text-amber-400">Type:</span> _________</p>
                <p><span className="text-rose-400">Purpose:</span> _________</p>
                <p><span className="text-cyan-400">Audience:</span> _________</p>
                <p className="mt-2"><span className="text-indigo-400">Tone:</span> _________</p>
                <p><span className="text-emerald-400">Content:</span> _________</p>
                <p><span className="text-amber-400">Message:</span> _________</p>
                <p className="mt-2"><span className="text-rose-400">Cross-references:</span> _________</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200">📊 Practice with MARKUP</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate SBQ papers in MARKUP and practise your source analysis framework before
                answering the questions. Use the AI grading feedback to see whether your analysis
                of sources was thorough enough to support top-band answers.
              </p>
              <Link
                href="/dashboard"
                className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
              >
                Practise Source Analysis Now →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master SBQ with AI-powered feedback</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate O-Level SBQ papers and get instant LORMS-aligned grading. Focus on one
            skill at a time — comparison, reliability, purpose, or utility.
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
            <Link href="/tips/sbq-comparison" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SBQ Comparison
            </Link>
            <Link href="/tips/sbq-reliability" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: SBQ Reliability →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
