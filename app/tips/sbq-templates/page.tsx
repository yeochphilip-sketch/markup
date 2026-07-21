import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SBQ Sentence Starters & Answer Templates for Every Question Type',
  description:
    'Memorise these SBQ answer templates and sentence starters for O-Level Social Studies and History. Covers comparison, reliability, purpose, and utility questions with LORMS-aligned phrasing.',
  openGraph: {
    title: 'SBQ Sentence Starters & Answer Templates — MARKUP Tips',
    description:
      'Memorise these SBQ answer templates and sentence starters for O-Level Social Studies and History. Covers comparison, reliability, purpose, and utility questions.',
  },
};

export default function SBQTemplatesPage() {
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
          <span className="text-slate-400">SBQ Templates</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SBQ Guide</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">10 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            SBQ Sentence Starters & Answer Templates for Every Question Type
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            One of the biggest differences between L2 and L4/L5 SBQ answers is the language
            students use. Here are ready-to-use templates and sentence starters for every
            SBQ question type — memorise them, adapt them, and use them under exam conditions.
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
            <li><a href="#comparison-template" className="text-indigo-400 hover:text-indigo-300 transition">1. Comparison (6-mark) — Template</a></li>
            <li><a href="#reliability-template" className="text-indigo-400 hover:text-indigo-300 transition">2. Reliability (5/7-mark) — Template</a></li>
            <li><a href="#purpose-template" className="text-indigo-400 hover:text-indigo-300 transition">3. Purpose (5/7-mark) — Template</a></li>
            <li><a href="#utility-template" className="text-indigo-400 hover:text-indigo-300 transition">4. Utility/Comparison (10-mark) — Template</a></li>
            <li><a href="#sentence-starters" className="text-indigo-400 hover:text-indigo-300 transition">5. Quick-Reference Sentence Starters</a></li>
          </ul>
        </div>

        {/* Template 1 */}
        <section id="comparison-template" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-400 shrink-0">1</span>
            <h2 className="text-xl font-black text-white">Comparison (6-mark) — Template</h2>
          </div>
          <p>
            The comparison question asks: <em>&ldquo;How similar are the views of the two sources
            on [specific aspect]?&rdquo;</em> Use this template:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Opening — State the Dimension</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;Both sources offer a [similar/contrasting] view of [topic].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;With regard to [specific aspect], the sources [largely agree/share some similarities but also differ].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Similarity Paragraph</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;Both sources suggest that [claim]. Source A states that &lsquo;[quote]&rsquo; while Source B similarly notes that &lsquo;[quote]&rsquo;.&rdquo;</em></p>
              <p>🔹 <em>&ldquo;A key similarity is that [both sources agree on X]. For instance, Source A highlights [detail] and this is echoed by Source B which states [detail].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Difference Paragraph</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;However, the sources differ in their emphasis. Source A focuses on [aspect] while Source B highlights [different aspect].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;A noticeable difference is that Source A [claim], whereas Source B [contrasting claim]. Source A states &lsquo;[quote]&rsquo; but Source B takes a different view, arguing &lsquo;[quote]&rsquo;.&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Conclusion — Make a Judgement</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;Overall, the sources are [largely similar / more different than similar / partially similar] because [reason].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;In conclusion, while both sources acknowledge [shared view], they differ significantly on [aspect], making them [judgement].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">Key to L4/6:</strong> Every paragraph must
              weave evidence from <strong className="text-slate-200">both sources together</strong>.
              Never write a paragraph about Source A followed by a paragraph about Source B.
            </p>
          </div>
        </section>

        {/* Template 2 */}
        <section id="reliability-template" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-sm font-black text-purple-400 shrink-0">2</span>
            <h2 className="text-xl font-black text-white">Reliability (5/7-mark) — Template</h2>
          </div>
          <p>
            The reliability question asks: <em>&ldquo;How reliable is Source [X] as evidence for
            [specific issue]?&rdquo;</em> Use this template:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Opening — Define the Issue</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;Source [X] provides [useful/limited] evidence for understanding [topic]. Its reliability depends on an assessment of its provenance and the extent to which it is corroborated by other sources.&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Strength 1 — Provenance (Reliable Aspects)</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;One reason to find Source [X] reliable is its provenance. As [author/position], the author [had access to first-hand information / was an eyewitness to events].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;Furthermore, the source was written [in date], which is [contemporary to the events / close in time], making it likely to be a [genuine record / credible account].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Strength 2 — Cross-Referencing</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;The source&apos;s reliability is further supported by cross-referencing. Source [Y] corroborates [specific claim] by stating &lsquo;[quote]&rsquo;.&rdquo;</em></p>
              <p>🔹 <em>&ldquo;This consistency across different sources [with different perspectives] strengthens the reliability of Source [X]&apos;s account.&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Limitation — Bias or Weakness</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;However, the source&apos;s reliability is limited by [the author&apos;s perspective / purpose]. As [a government official / political figure], the author may have been motivated to [portray events in a certain way / justify their actions].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;Additionally, Source [Z] contradicts Source [X] on [specific point], stating &lsquo;[quote]&rsquo;. This discrepancy suggests that Source [X] may be [presenting a partial view / omitting key information].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Overall Judgement</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;On balance, Source [X] is [partially reliable / reliable in some aspects but limited in others / of limited reliability] as evidence for [topic]. It is useful for [purpose] but must be treated with caution regarding [specific limitation].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">Key to L5/7:</strong> You need{' '}
              <strong className="text-slate-200">both</strong> provenance analysis AND
              cross-referencing. A nuanced judgement (not just &ldquo;reliable&rdquo; or
              &ldquo;unreliable&rdquo;) is essential.
            </p>
          </div>
        </section>

        {/* Template 3 */}
        <section id="purpose-template" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-sm font-black text-rose-400 shrink-0">3</span>
            <h2 className="text-xl font-black text-white">Purpose (5/7-mark) — Template</h2>
          </div>
          <p>
            The purpose question asks: <em>&ldquo;What is the purpose of Source [X]?&rdquo;</em>
            or <em>&ldquo;Why did the author create this source?&rdquo;</em> Use this template:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Opening — Identify the Message</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;The purpose of Source [X] is to [persuade / justify / criticise / inform / warn] its audience about [topic].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;Source [X] was created to convey the message that [message]. The author achieves this through [language / tone / selection of evidence].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Body — Analyse How the Purpose Is Achieved</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;The author employs [emotive language / rhetorical questions / exaggeration] to [evoke sympathy / create urgency / persuade the reader]. For example, the phrase &lsquo;[quote]&rsquo; suggests [analysis].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;The choice to [include specific details / omit certain facts / appeal to emotion] reveals that the author&apos;s intention is to [shape the reader&apos;s view / justify a position / discredit an opponent].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;The tone of the source is [tone], which supports the purpose of [purpose]. A [neutral / critical / supportive] tone helps the author [achieve their goal].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Intended Audience</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;The intended audience appears to be [audience]. This is evident from [the language used / the publication context / the assumptions made].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;By targeting [specific audience], the author aims to [achieve specific effect — e.g., sway public opinion / justify policy to voters / reassure allies].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Conclusion — Overall Purpose</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;In summary, Source [X]&apos;s primary purpose is to [overall purpose]. The author achieves this through [key techniques], targeting [audience] with the message that [message].&rdquo;</em></p>
            </div>
          </div>
        </section>

        {/* Template 4 */}
        <section id="utility-template" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-sm font-black text-violet-400 shrink-0">4</span>
            <h2 className="text-xl font-black text-white">Utility/Comparison (10-mark) — Template</h2>
          </div>
          <p>
            The utility/comparison question combines comparison AND utility assessment. It asks:
            <em>&ldquo;How far do the sources agree on [topic] and how useful are they?&rdquo;</em>
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Opening</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;The sources [largely agree / partially agree / disagree] on [topic]. However, their utility depends on what aspect of the topic we are investigating and the strengths and limitations of each source.&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Comparison Section</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;The sources agree on [point]. Source [A] states &lsquo;[quote]&rsquo; and Source [B] similarly argues &lsquo;[quote]&rsquo;.&rdquo;</em></p>
              <p>🔹 <em>&ldquo;However, they differ on [aspect]. Source [A] emphasises [X] while Source [B] focuses on [Y], suggesting [interpretation].&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Utility Section — Source by Source</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;Source [A] is particularly useful for understanding [specific aspect] because [reason — e.g., first-hand account, specific data, expert perspective].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;However, its utility is limited when investigating [different aspect] because [limitation — e.g., bias, narrow perspective, lack of evidence on that point].&rdquo;</em></p>
              <p>🔹 <em>&ldquo;Source [B] complements Source [A] by providing [different perspective / additional information] on [aspect]. Together, they offer a [more comprehensive / contrasting] picture.&rdquo;</em></p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Conclusion — Overall Judgement</p>
            <div className="bg-slate-900/70 rounded-lg p-3 mt-2 text-[10px] font-mono text-slate-400 space-y-2">
              <p>🔹 <em>&ldquo;In conclusion, the sources [largely agree / partially agree] on [topic]. Their combined utility is [high / moderate / limited]. For a historian studying [specific aspect], they provide [valuable / partial] evidence, particularly for [purpose], though they must be supplemented by [other sources / contextual knowledge] for a complete picture.&rdquo;</em></p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="sentence-starters" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Quick-Reference Sentence Starters</h2>
          <p>
            Keep these starters in mind during the exam. They&apos;re designed to kickstart
            your thinking and ensure you&apos;re using analytical language.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 pr-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Skill</th>
                  <th className="text-left py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Sentence Starters</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-indigo-400 align-top">Similarity</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;Both sources suggest that&hellip;&rdquo;<br />
                    &ldquo;A key similarity is&hellip;&rdquo;<br />
                    &ldquo;Similarly, Source [B] states&hellip;&rdquo;<br />
                    &ldquo;This is echoed by Source [B] which&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-amber-400 align-top">Difference</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;However, the sources differ on&hellip;&rdquo;<br />
                    &ldquo;In contrast, Source [B] argues&hellip;&rdquo;<br />
                    &ldquo;Whereas Source [A] emphasises X, Source [B] highlights Y&hellip;&rdquo;<br />
                    &ldquo;A noticeable difference is&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-purple-400 align-top">Provenance</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;As [a government official], the author&hellip;&rdquo;<br />
                    &ldquo;Written in [date], the source is [contemporary/retrospective]&hellip;&rdquo;<br />
                    &ldquo;The type of source [private letter / public speech] suggests&hellip;&rdquo;<br />
                    &ldquo;The intended audience was&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-emerald-400 align-top">Cross-Referencing</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;This is corroborated by Source [B] which&hellip;&rdquo;<br />
                    &ldquo;However, Source [C] contradicts this by stating&hellip;&rdquo;<br />
                    &ldquo;Together, the sources suggest&hellip;&rdquo;<br />
                    &ldquo;The consistency between Sources [A] and [B] strengthens&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-rose-400 align-top">Judgement</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;On balance, the source is [partially reliable]&hellip;&rdquo;<br />
                    &ldquo;Overall, the sources are [largely similar]&hellip;&rdquo;<br />
                    &ldquo;In conclusion, while useful for [X], the source is limited for [Y]&hellip;&rdquo;<br />
                    &ldquo;The sources provide [high/moderate/limited] utility for&hellip;&rdquo;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              🎯 <strong className="text-slate-200">How to use this guide:</strong> Pick ONE
              template per practice session. Write 2-3 answers using it until the structure feels
              automatic. Then move to the next template. By exam day, these structures should be
              second nature.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Practise using these templates</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate an SBQ paper in MARKUP, pick ONE template, and write your answer using its
            structure. Get instant LORMS-aligned feedback on whether your answer hits top band.
          </p>
          <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20">Start SBQ Practice — Free</Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/sbq-utility-comparison" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">← Previous: SBQ Utility/Comparison</Link>
            <Link href="/tips/model-sbq-answer" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">Next: Model SBQ Answer →</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
