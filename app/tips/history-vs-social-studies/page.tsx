import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Study for History vs Social Studies — Complete O-Level Guide',
  description:
    'History or Social Studies? Learn the key differences in content, exam format, skills tested, and study strategies for each subject. Make an informed decision and ace both Humanities papers.',
  openGraph: {
    title: 'History vs Social Studies Study Guide — MARKUP Tips',
    description:
      'Learn the key differences between O-Level History and Social Studies in content, exam format, skills tested, and study strategies. Ace both Humanities papers.',
  },
};

export default function HistoryVsSocialStudiesPage() {
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
          <span className="text-slate-400">History vs Social Studies</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Study Strategy</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">10 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Study for History vs Social Studies
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            If you&apos;re taking both O-Level History (Elective) and Social Studies, you&apos;ve
            probably noticed they feel very different — even though they&apos;re both Humanities.
            Here&apos;s a head-to-head comparison of content, exam format, skills, and study
            strategies for each subject.
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
            <li><a href="#overview" className="text-indigo-400 hover:text-indigo-300 transition">1. Quick Overview: The Two Subjects</a></li>
            <li><a href="#content" className="text-indigo-400 hover:text-indigo-300 transition">2. Content: What You Study</a></li>
            <li><a href="#exam-format" className="text-indigo-400 hover:text-indigo-300 transition">3. Exam Format: Question Types Compared</a></li>
            <li><a href="#skills" className="text-indigo-400 hover:text-indigo-300 transition">4. Skills: What Each Subject Tests</a></li>
            <li><a href="#study-strategies" className="text-indigo-400 hover:text-indigo-300 transition">5. Study Strategies for Each Subject</a></li>
            <li><a href="#combined" className="text-indigo-400 hover:text-indigo-300 transition">6. How to Study Both Together</a></li>
            <li><a href="#which-harder" className="text-indigo-400 hover:text-indigo-300 transition">7. Which One Is Harder?</a></li>
            <li><a href="#practice" className="text-indigo-400 hover:text-indigo-300 transition">8. How MARKUP Helps with Both</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="overview" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. Quick Overview: The Two Subjects</h2>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-950 text-left">
                  <th className="p-3 font-black text-slate-400 uppercase tracking-widest">Aspect</th>
                  <th className="p-3 font-black text-indigo-400 uppercase tracking-widest">Social Studies</th>
                  <th className="p-3 font-black text-emerald-400 uppercase tracking-widest">Elective History</th>
                </tr>
              </thead>
              <tbody className="text-slate-400 divide-y divide-slate-900">
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Full Name</td>
                  <td className="p-3">Social Studies (Compulsory)</td>
                  <td className="p-3">Elective History (Optional)</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Mandatory?</td>
                  <td className="p-3 text-indigo-400 font-bold">Yes — all students take it</td>
                  <td className="p-3">No — you choose it as an elective</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Paper Duration</td>
                  <td className="p-3">1 hr 45 min</td>
                  <td className="p-3">1 hr 40 min</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Exam Sections</td>
                  <td className="p-3">SBQ + SRQ</td>
                  <td className="p-3">SBQ + SEQ</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Focus</td>
                  <td className="p-3">Contemporary issues & society</td>
                  <td className="p-3">Historical events & interpretations</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 If you&apos;re taking <strong className="text-slate-200">Combined Humanities</strong>,
              you&apos;ll do <strong className="text-emerald-400">Social Studies (Compulsory)</strong> + one
              elective (History, Geography, or Literature). This guide focuses on Social Studies + History.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="content" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. Content: What You Study</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-400 mb-2">📘 Social Studies — Contemporary Issues</h3>
              <p className="text-xs text-slate-400 mb-3">
                Social Studies is about <strong className="text-slate-200">understanding society</strong> —
                how Singapore works, the challenges it faces, and the values that shape its policies.
              </p>
              <ul className="space-y-1.5 text-[10px] text-slate-400 list-disc pl-4">
                <li><strong className="text-slate-200">Governance:</strong> How Singapore is governed, the role of government, citizen participation</li>
                <li><strong className="text-slate-200">Economic Development:</strong> Singapore&apos;s economic strategies, globalisation, sustainability</li>
                <li><strong className="text-slate-200">Social Issues:</strong> Income inequality, ageing population, racial harmony, immigration</li>
                <li><strong className="text-slate-200">National Identity:</strong> Nation-building, shared values, citizenship, defence</li>
                <li><strong className="text-slate-200">International Relations:</strong> Singapore&apos;s foreign policy, regional cooperation, ASEAN</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">📕 Elective History — The Past</h3>
              <p className="text-xs text-slate-400 mb-3">
                History is about <strong className="text-slate-200">understanding the past</strong> —
                key events that shaped Southeast Asia and the world, with a focus on cause, consequence,
                and change over time.
              </p>
              <ul className="space-y-1.5 text-[10px] text-slate-400 list-disc pl-4">
                <li><strong className="text-slate-200">Decolonisation:</strong> The end of European empires in Southeast Asia</li>
                <li><strong className="text-slate-200">Cold War:</strong> Superpower rivalry, proxy wars, impact on Southeast Asia</li>
                <li><strong className="text-slate-200">World War II:</strong> Japanese occupation, impact on nationalism</li>
                <li><strong className="text-slate-200">Post-Independence:</strong> Nation-building in Singapore and Malaysia</li>
                <li><strong className="text-slate-200">Key Themes:</strong> Power, conflict, cooperation, identity, change</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="exam-format" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Exam Format: Question Types Compared</h2>

          <p>
            Both subjects have an SBQ section, but their essay sections are different. Here&apos;s
            how they compare:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-950 text-left">
                  <th className="p-3 font-black text-slate-400 uppercase tracking-widest">Component</th>
                  <th className="p-3 font-black text-indigo-400 uppercase tracking-widest">Social Studies</th>
                  <th className="p-3 font-black text-emerald-400 uppercase tracking-widest">Elective History</th>
                </tr>
              </thead>
              <tbody className="text-slate-400 divide-y divide-slate-900">
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">SBQ Weight</td>
                  <td className="p-3">50% (30 marks)</td>
                  <td className="p-3">50% (30 marks)</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">SBQ Questions</td>
                  <td className="p-3">(a) 6m + (b) 7m + (c) 7m + (d) 10m</td>
                  <td className="p-3">Similar structure, similar marks</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Essay Weight</td>
                  <td className="p-3">50% — SRQ (8 marks)</td>
                  <td className="p-3">50% — SEQ (20 marks)</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Essay Format</td>
                  <td className="p-3">1 SRQ (choose 1 of 2)</td>
                  <td className="p-3">1 SEQ (choose 1 of 2)</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">Sources in Essay?</td>
                  <td className="p-3">No — pure argumentation</td>
                  <td className="p-3">Yes — sources provided</td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="p-3 font-bold text-slate-200">CK Requirement</td>
                  <td className="p-3">General knowledge & current affairs</td>
                  <td className="p-3">Specific historical knowledge</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⚡ Key difference: In Social Studies, the essay (SRQ) is source-free — you build arguments
              from your own knowledge. In History, the essay (SEQ) provides sources that you must
              use and evaluate.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="skills" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Skills: What Each Subject Tests</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-400 mb-2">🎯 Social Studies Skills</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <p className="font-bold text-slate-200">SBQ Skills (same as History)</p>
                  <p className="text-[10px]">Comparison, Reliability, Purpose, Utility, Cross-Referencing</p>
                </li>
                <li>
                  <p className="font-bold text-slate-200">SRQ — Argument Construction</p>
                  <p className="text-[10px]">Building a thesis, using evidence, making balanced judgements</p>
                </li>
                <li>
                  <p className="font-bold text-slate-200">Contemporary Awareness</p>
                  <p className="text-[10px]">Connecting issues to real-world events and current affairs</p>
                </li>
                <li>
                  <p className="font-bold text-slate-200">Perspective-Taking</p>
                  <p className="text-[10px]">Understanding multiple viewpoints on the same issue</p>
                </li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">🎯 History Skills</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <p className="font-bold text-slate-200">SBQ Skills (same as SS)</p>
                  <p className="text-[10px]">Comparison, Reliability, Purpose, Utility, Cross-Referencing</p>
                </li>
                <li>
                  <p className="font-bold text-slate-200">SEQ — Source Evaluation</p>
                  <p className="text-[10px]">Using and assessing sources in essay answers</p>
                </li>
                <li>
                  <p className="font-bold text-slate-200">Historical Knowledge</p>
                  <p className="text-[10px]">Mastering specific facts, dates, events, and sequences</p>
                </li>
                <li>
                  <p className="font-bold text-slate-200">Causal Analysis</p>
                  <p className="text-[10px]">Explaining why events happened and their consequences</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">
              💡 <strong className="text-slate-200">SBQ is the big overlap:</strong> The SBQ section is
              nearly identical in both papers. Master SBQ once and you&apos;ve mastered it for both subjects —
              that&apos;s 50% of each paper covered by the same skillset.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="study-strategies" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. Study Strategies for Each Subject</h2>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-indigo-400 mb-2">📘 For Social Studies</h3>
              <div className="space-y-3 text-xs text-slate-400">
                <div>
                  <p className="font-bold text-slate-200">1. Stay current with news</p>
                  <p className="text-[10px]">Social Studies rewards awareness of current affairs. Read The Straits Times or Channel NewsAsia weekly. Pay attention to government policy announcements, parliamentary debates, and social issues.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">2. Build a case study bank</p>
                  <p className="text-[10px]">For each topic (governance, economy, social issues), prepare 2–3 specific case studies with facts, figures, and dates. These are your SRQ ammunition.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">3. Practise argumentation, not memorisation</p>
                  <p className="text-[10px]">SRQs don&apos;t test rote learning. Practise constructing arguments on the spot. Use MARKUP&apos;s SRQ generator to get instant feedback on your reasoning.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">4. Drill SBQ — it&apos;s 50% of your mark</p>
                  <p className="text-[10px]">Focus on the highest-value SBQ questions (10-mark comparison/utility) to maximise your score.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">📕 For History</h3>
              <div className="space-y-3 text-xs text-slate-400">
                <div>
                  <p className="font-bold text-slate-200">1. Master the timeline</p>
                  <p className="text-[10px]">History is all about sequence. Create a timeline of key events with dates, causes, and consequences. Knowing what happened when is the foundation of all historical analysis.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">2. Learn key facts, not stories</p>
                  <p className="text-[10px]">For SEQ and SBQ, you need specific facts: names, dates, treaties, statistics. A question about the Cold War needs details like the 1955 Bandung Conference or the 1954 Geneva Accords.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">3. Practise source evaluation</p>
                  <p className="text-[10px]">History SEQ provides sources — you must use them. Practise weaving source evidence into your essay argument while adding your own contextual knowledge.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">4. Understand different interpretations</p>
                  <p className="text-[10px]">Top students know that historians disagree. Referencing different historical perspectives in your SEQ shows sophisticated understanding.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="combined" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. How to Study Both Together</h2>
          <p>
            If you&apos;re taking both subjects, you can save time by studying them{' '}
            <strong className="text-slate-200">strategically together</strong>. Here&apos;s how:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-400 mb-1">🔗 SBQ First</h3>
              <p className="text-[10px] text-slate-400">
                Study SBQ skills once, apply to both. The Comparison, Reliability, and Purpose
                frameworks are identical. Master them on one subject&apos;s sources, then practise
                on the other. This covers 50% of both papers.
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-400 mb-1">🔄 Alternate Subjects</h3>
              <p className="text-[10px] text-slate-400">
                Switch between Social Studies and History every 2–3 days. The change in content
                (contemporary vs historical) keeps your brain engaged and prevents fatigue from
                studying the same type of material.
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400 mb-1">🎯 Shared Resources</h3>
              <p className="text-[10px] text-slate-400">
                Use MARKUP&apos;s skill-based practice to work on the same SBQ skill (e.g.
                Reliability) across both subjects. The framework is the same — only the
                source content changes.
              </p>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-xs text-emerald-300 font-bold">
              🎯 <strong className="text-slate-200">The 80/20 rule for Combined Humanities:</strong>{' '}
              80% of your score improvement comes from mastering SBQ (shared skill) + your essay
              technique. Only 20% comes from content memorisation.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="which-harder" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Which One Is Harder?</h2>
          <p>
            The honest answer: it depends on your strengths. Here&apos;s how students typically
            compare them:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-400 mb-1">📘 Social Studies is harder if…</h3>
              <ul className="space-y-1.5 text-[10px] text-slate-400 list-disc pl-4">
                <li>You struggle to construct arguments from scratch (no sources in SRQ)</li>
                <li>You prefer memorising facts over thinking critically about current issues</li>
                <li>You find it difficult to think of specific real-world examples on the spot</li>
                <li>You&apos;re not up to date with current affairs</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-400 mb-1">📕 History is harder if…</h3>
              <ul className="space-y-1.5 text-[10px] text-slate-400 list-disc pl-4">
                <li>You struggle to remember dates, names, and specific events</li>
                <li>You find it hard to connect causes to consequences</li>
                <li>You don&apos;t enjoy learning about the past</li>
                <li>You find it difficult to evaluate historical sources critically</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⚡ The most common answer from students: Social Studies is harder to{' '}
              <em>prepare</em> for (open-ended content), but History is harder to <em>master</em>{' '}
              (specific knowledge demands). Both reward consistent practice over cramming.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section id="practice" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">8. How MARKUP Helps with Both</h2>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-black text-indigo-300">🎯 MARKUP covers both subjects</h3>
            <p className="text-xs text-slate-400">
              MARKUP generates fresh practice papers for both Social Studies and Elective History.
              Select your subject, choose the skill you want to practise, and get instant
              LORMS-aligned grading with detailed feedback. The SBQ skills you master on one
              subject transfer directly to the other.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc pl-4">
              <li>Generate SBQ papers for <strong className="text-slate-200">Social Studies</strong> or <strong className="text-slate-200">History</strong></li>
              <li>Choose <strong className="text-slate-200">SRQ</strong> (Social Studies essay) or <strong className="text-slate-200">SEQ</strong> (History essay) practice</li>
              <li>Pick specific skills: Comparison, Reliability, Purpose, Utility</li>
              <li>Get feedback on your contextual knowledge, argument strength, and evaluation depth</li>
              <li>Track your improvement over time with skill-level analytics</li>
            </ul>
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
            >
              Start Practising — Free
            </Link>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-amber-950/50 to-slate-950/80 border border-amber-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Master both subjects with one tool</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP covers Social Studies AND Elective History with the same powerful practice
            engine. Generate unlimited papers, get instant grading, and track your improvement
            across both subjects.
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
            <Link href="/tips/exam-week-strategy" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: Exam Week Strategy
            </Link>
            <Link href="/tips" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              All Tips →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
