import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Use AI Practice Tools to Maximise Your O-Level Humanities Score',
  description:
    'Smart strategies for using AI practice tools like MARKUP effectively. Learn how top students target weak skills, build streaks, and track improvements for O-Level Social Studies and History.',
  openGraph: {
    title: 'How to Use AI Practice Tools Effectively | MARKUP Tips',
    description:
      'Don\'t just generate and grade mindlessly. Learn how top students use AI to target weak skills, build streaks, and maximise score improvements for the O-Level Humanities.',
  },
};

export default function StudyStrategyPage() {
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
          <span className="text-slate-400">Study Strategy</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Study Strategy</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">9 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            How to Use AI Practice Tools to Maximise Your Score
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            AI tools like MARKUP are powerful — but only if you use them strategically.
            Here&apos;s the study system that top performers use to turn practice into progress.
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
            <li><a href="#the-trap" className="text-indigo-400 hover:text-indigo-300 transition">1. The Trap: Mindless Practice</a></li>
            <li><a href="#diagnose" className="text-indigo-400 hover:text-indigo-300 transition">2. Diagnose First: Know Your Weakest Skill</a></li>
            <li><a href="#targeted" className="text-indigo-400 hover:text-indigo-300 transition">3. Targeted Practice: One Skill at a Time</a></li>
            <li><a href="#streaks" className="text-indigo-400 hover:text-indigo-300 transition">4. Build a Streak Habit (Not Just for Gamification)</a></li>
            <li><a href="#review" className="text-indigo-400 hover:text-indigo-300 transition">5. The Review Loop: Learn from Every Grade</a></li>
            <li><a href="#combine" className="text-indigo-400 hover:text-indigo-300 transition">6. Combine AI Practice with School Work</a></li>
            <li><a href="#schedule" className="text-indigo-400 hover:text-indigo-300 transition">7. Sample Weekly Study Schedule</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="the-trap" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. The Trap: Mindless Practice</h2>
          <p>
            Here&apos;s the most common mistake students make with AI tools: they generate a paper,
            write answers, get a grade, and immediately generate the next paper without
            <strong className="text-slate-200"> reflecting</strong> on the feedback.
          </p>
          <p>
            This is the academic equivalent of shooting arrows into a forest and only looking at
            where they land — you&apos;re not improving your aim, you&apos;re just burning through arrows.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">📊 The 80/20 Rule for AI Practice</p>
            <p className="text-xs text-slate-300 mt-1">
              20% of your time should be spent <strong className="text-slate-200">generating and writing</strong>.
              80% should be spent <strong className="text-slate-200">reviewing feedback, understanding mistakes,
              and applying learnings</strong> to the next attempt.
            </p>
          </div>

          <p>
            The students who improve fastest aren&apos;t the ones who do the most papers — they&apos;re
            the ones who <strong className="text-slate-200">learn the most from each paper</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section id="diagnose" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. Diagnose First: Know Your Weakest Skill</h2>
          <p>
            Before you do anything else, you need to know <strong className="text-slate-200">where you
            stand</strong>. The SBQ section tests multiple distinct skills — Comparison, Reliability,
            Purpose, Utility, and Cross-Referencing — and most students are strong in some but
            weak in others.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">SBQ Skills (SS)</p>
              <ul className="text-xs text-slate-400 space-y-1 mt-2">
                <li>• Comparison &amp; Contrast (AO2)</li>
                <li>• Reliability &amp; Cross-Referencing (AO3)</li>
                <li>• Purpose &amp; Message (AO2)</li>
                <li>• Utility &amp; Limitation (AO3)</li>
                <li>• Sequence &amp; Chronology (AO2)</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SEQ/SRQ Skills (SS &amp; Hist)</p>
              <ul className="text-xs text-slate-400 space-y-1 mt-2">
                <li>• Argument Construction (AO1)</li>
                <li>• Evidence &amp; Examples (AO1)</li>
                <li>• Explanation &amp; Analysis (AO2)</li>
                <li>• Evaluation &amp; Judgement (AO3)</li>
                <li>• PEEL Structure (AO1)</li>
              </ul>
            </div>
          </div>

          <p>
            <strong className="text-slate-200">How to diagnose:</strong> Complete 2–3 full papers
            covering different skills. MARKUP&apos;s analytics dashboard will show you a breakdown of
            your scores per skill area. Focus on the <strong className="text-amber-400">lowest-scoring
            skill</strong> first — that&apos;s where the fastest gains are hiding.
          </p>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold">💡 MARKUP&apos;s Weakest Skill Card automatically surfaces your lowest-performing skill and suggests targeted practice — look for it on your dashboard.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="targeted" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Targeted Practice: One Skill at a Time</h2>
          <p>
            Once you&apos;ve identified your weakest skill, the next step is
            <strong className="text-slate-200"> targeted repetition</strong>. Instead of doing full
            mixed-skill papers, generate papers that focus on <strong className="text-amber-400">one
            specific skill</strong> until you&apos;ve mastered it.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Select your target skill</h3>
              </div>
              <p className="text-xs text-slate-400">
                In MARKUP&apos;s generator, choose one skill (e.g. &ldquo;SBQ: Reliability &amp;
                Cross-Referencing&rdquo;). The AI will tailor all sources and questions to
                that specific skill.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Do 3–5 focused sessions</h3>
              </div>
              <p className="text-xs text-slate-400">
                Complete 3–5 practice sessions on that single skill over a week. Each session,
                review the feedback from the previous one before starting.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Re-assess and move on</h3>
              </div>
              <p className="text-xs text-slate-400">
                After 5 sessions, your score on that skill should improve noticeably. If not,
                go deeper into the feedback. Once you&apos;re comfortable, move to the next
                weakest skill.
              </p>
            </div>
          </div>

          <p>
            <strong className="text-slate-200">Why this works:</strong> Mixed practice (doing different
            skills randomly) feels more natural but is less effective for skill acquisition.
            <strong className="text-emerald-400"> Blocked practice</strong> — repeating the same skill
            type — builds neural pathways faster. Once a skill is strong, you can maintain it through
            mixed practice.
          </p>
        </section>

        {/* Section 4 */}
        <section id="streaks" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. Build a Streak Habit</h2>
          <p>
            MARKUP tracks your practice streaks — consecutive days of completing at least one
            practice session. This isn&apos;t just a fun game mechanic. <strong className="text-slate-200">Streaks
            are scientifically proven to improve learning outcomes.</strong>
          </p>

          <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-xs text-emerald-300 font-bold">🧠 The Science</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Studies on &ldquo;spaced repetition&rdquo; show that 15 minutes of daily practice is more effective
              than 3 hours of cramming once a week. Streaks work because they leverage the
              <strong className="text-slate-200"> spacing effect</strong> — your brain consolidates
              information better when learning is distributed over time.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Tips for maintaining streaks:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1.5">
              <li><strong className="text-slate-200">Set a minimum viable session:</strong> On busy days, just do one 12-minute SBQ question. That counts.</li>
              <li><strong className="text-slate-200">Use the timer:</strong> Simulate exam conditions. A focused 15-minute session beats an hour of distracted work.</li>
              <li><strong className="text-slate-200">Stack it with an existing habit:</strong> &ldquo;After I finish my homework, I do one MARKUP question.&rdquo;</li>
              <li><strong className="text-slate-200">Don&apos;t break the chain:</strong> The visual streak counter on your dashboard is motivation. Once you&apos;ve hit 7 days, you won&apos;t want to lose it.</li>
            </ul>
          </div>

          <p>
            <strong className="text-slate-200">Pro tip:</strong> MARKUP sends a daily reminder
            if you haven&apos;t practised yet. Enable notifications in your settings to keep your
            streak alive.
          </p>
        </section>

        {/* Section 5 */}
        <section id="review" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. The Review Loop: Learn from Every Grade</h2>
          <p>
            Getting a grade is not the end — it&apos;s the beginning. Here&apos;s the review loop that
            top students use after every MARKUP session:
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-400 shrink-0">1</div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Read the critique</h3>
                <p className="text-xs text-slate-400">Don&apos;t just look at the LORMS band. Read every sentence of the AI feedback. Where did you lose marks? What was the specific comment about your explanation?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-sm font-black text-emerald-400 shrink-0">2</div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Identify the gap</h3>
                <p className="text-xs text-slate-400">Was it a knowledge gap (didn&apos;t know the content)? A structure gap (weak PEEL)? A skill gap (don&apos;t understand how to compare)? Be specific about what went wrong.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-sm font-black text-amber-400 shrink-0">3</div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Rewrite one paragraph</h3>
                <p className="text-xs text-slate-400">Don&apos;t rewrite the whole answer — pick the <strong className="text-slate-200">weakest paragraph</strong> and rewrite it using the feedback. This is the highest-leverage activity in the loop.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-sm font-black text-rose-400 shrink-0">4</div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Save a note</h3>
                <p className="text-xs text-slate-400">Write down 2–3 takeaways from the session. &ldquo;Next time: always mention provenance in reliability answers.&rdquo; This creates a personal error log you can review before exams.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">📝 The 4-Step Review Loop takes about 10 minutes. Doing it after every session doubles your rate of improvement.</p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="combine" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Combine AI Practice with School Work</h2>
          <p>
            MARKUP is designed to <strong className="text-slate-200">complement</strong> — not replace —
            your school work. Here&apos;s how to integrate the two:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-400">📚 Before a test</h3>
              <ul className="text-xs text-slate-400 space-y-1 mt-2 list-disc pl-4">
                <li>Generate papers on the specific topic</li>
                <li>Do 2–3 timed sessions to simulate test conditions</li>
                <li>Review feedback to identify last-minute gaps</li>
                <li>Focus on your weakest skill area</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-400">📝 After school</h3>
              <ul className="text-xs text-slate-400 space-y-1 mt-2 list-disc pl-4">
                <li>Use the topic you just learned in class</li>
                <li>Generate a paper on that topic to reinforce</li>
                <li>The AI creates fresh sources, not textbook examples</li>
                <li>Compare your AI grade with your school performance</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400">📊 During holidays</h3>
              <ul className="text-xs text-slate-400 space-y-1 mt-2 list-disc pl-4">
                <li>Do focused skill-building blocks (3–5 sessions per skill)</li>
                <li>Build a long streak (20+ days is achievable over a break)</li>
                <li>Cover topics you haven&apos;t studied in class yet</li>
                <li>Review your analytics to see overall improvement</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-rose-400">👥 With study groups</h3>
              <ul className="text-xs text-slate-400 space-y-1 mt-2 list-disc pl-4">
                <li>Generate the same paper as a friend</li>
                <li>Compare your answers and AI feedback</li>
                <li>Discuss why the AI gave different grades</li>
                <li>Learn from each other&apos;s approaches</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="schedule" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Sample Weekly Study Schedule</h2>
          <p>
            Here&apos;s a realistic weekly schedule for a Sec 4 student using MARKUP to prepare
            for O-Level Humanities:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-950 text-left">
                  <th className="p-3 font-black text-slate-400 uppercase tracking-widest">Day</th>
                  <th className="p-3 font-black text-slate-400 uppercase tracking-widest">Activity</th>
                  <th className="p-3 font-black text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="p-3 font-black text-slate-400 uppercase tracking-widest">Focus</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-t border-slate-800">
                  <td className="p-3 font-bold text-slate-200">Monday</td>
                  <td className="p-3">School topic SS: Citizen participation</td>
                  <td className="p-3 font-mono">15 min</td>
                  <td className="p-3"><span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-[9px]">SBQ Comparison</span></td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="p-3 font-bold text-slate-200">Tuesday</td>
                  <td className="p-3">SBQ Reliability focused paper</td>
                  <td className="p-3 font-mono">20 min</td>
                  <td className="p-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[9px]">SBQ Reliability</span></td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="p-3 font-bold text-slate-200">Wednesday</td>
                  <td className="p-3">Review Monday&apos;s feedback + rewrite</td>
                  <td className="p-3 font-mono">15 min</td>
                  <td className="p-3"><span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[9px]">Review Loop</span></td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="p-3 font-bold text-slate-200">Thursday</td>
                  <td className="p-3">SEQ: PEEL structure practice</td>
                  <td className="p-3 font-mono">25 min</td>
                  <td className="p-3"><span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-[9px]">PEEL / SEQ</span></td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="p-3 font-bold text-slate-200">Friday</td>
                  <td className="p-3">Full mixed-skill paper (simulated exam)</td>
                  <td className="p-3 font-mono">45 min</td>
                  <td className="p-3"><span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full text-[9px]">Full Mock</span></td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="p-3 font-bold text-slate-200">Weekend</td>
                  <td className="p-3">Review week&apos;s analytics + rest day</td>
                  <td className="p-3 font-mono">15 min</td>
                  <td className="p-3"><span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full text-[9px]">Review</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 italic">
            Total: ~2.5 hours per week. That&apos;s all it takes to see meaningful improvement.
            Consistency beats intensity every time.
          </p>
        </section>

        {/* Quick Reference */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/80 border border-indigo-900/40 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-black text-white">Quick Reference: The Study System</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl">🎯</p>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider mt-1">Diagnose</p>
              <p className="text-[8px] text-slate-500">Find your weakest skill first</p>
            </div>
            <div>
              <p className="text-2xl">🔁</p>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider mt-1">Block</p>
              <p className="text-[8px] text-slate-500">3–5 sessions on one skill</p>
            </div>
            <div>
              <p className="text-2xl">🔥</p>
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider mt-1">Maintain</p>
              <p className="text-[8px] text-slate-500">Daily streaks, even if short</p>
            </div>
            <div>
              <p className="text-2xl">📝</p>
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-wider mt-1">Review</p>
              <p className="text-[8px] text-slate-500">10 min review per session</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-amber-950/50 to-slate-950/80 border border-amber-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Start your study system today</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            MARKUP tracks your skills, streaks, and improvement over time. Generate your first
            diagnostic paper now — it takes 30 seconds to start.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
          >
            Start Practising — Free
          </Link>
        </div>

        {/* Next Article */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex items-center justify-between">
            <Link href="/tips/srq-guide" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: SRQ Guide
            </Link>
            <Link href="/tips/exam-week-strategy" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: Exam Week Strategy →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
