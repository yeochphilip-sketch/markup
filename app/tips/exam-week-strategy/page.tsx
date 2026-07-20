import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Exam Week Strategy Guide — How to Ace Your Humanities Papers',
  description:
    'Your complete exam week playbook for O-Level Social Studies and Elective History. Learn the 7-day revision plan, morning-of strategies, time management per question type, and how to stay calm under pressure.',
  openGraph: {
    title: 'Exam Week Strategy — MARKUP Tips',
    description:
      'Your complete exam week playbook for O-Level Humanities. 7-day revision plan, time allocation per question, morning-of strategies, and mental prep techniques.',
  },
};

export default function ExamWeekStrategyPage() {
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
          <span className="text-slate-400">Exam Week Strategy</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Study Strategy</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">10 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Exam Week Strategy: Your 7-Day Humanities Playbook
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The week before your O-Level Humanities paper can make or break your score. Here&apos;s
            a day-by-day plan, time management strategies for each question type, and battle-tested
            mental preparation techniques.
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
            <li><a href="#before-exam-week" className="text-indigo-400 hover:text-indigo-300 transition">1. The Week Before: Setting Up for Success</a></li>
            <li><a href="#seven-day-plan" className="text-indigo-400 hover:text-indigo-300 transition">2. The 7-Day Revision Plan</a></li>
            <li><a href="#time-management" className="text-indigo-400 hover:text-indigo-300 transition">3. Time Management: Minutes Per Question</a></li>
            <li><a href="#morning-of" className="text-indigo-400 hover:text-indigo-300 transition">4. The Morning of the Paper</a></li>
            <li><a href="#during-exam" className="text-indigo-400 hover:text-indigo-300 transition">5. During the Exam: Your Battle Plan</a></li>
            <li><a href="#mental-prep" className="text-indigo-400 hover:text-indigo-300 transition">6. Mental Preparation & Staying Calm</a></li>
            <li><a href="#final-checklist" className="text-indigo-400 hover:text-indigo-300 transition">7. Final Checklist</a></li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="before-exam-week" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">1. The Week Before: Setting Up for Success</h2>
          <p>
            Exam week doesn&apos;t start on the day of the paper. It starts <strong className="text-slate-200">seven days before</strong>.
            The students who score A1s don&apos;t cram — they execute a plan.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">What to prepare before exam week:</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2">
                <span className="text-emerald-400">✅</span>
                <span><strong className="text-slate-200">Topic summaries</strong> — one page per chapter covering key events, dates, and vocabulary</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✅</span>
                <span><strong className="text-slate-200">SBQ cheat sheet</strong> — the LORMS framework for each question type (Comparison, Reliability, Purpose, Utility)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✅</span>
                <span><strong className="text-slate-200">Essay structure templates</strong> — PEEL for SRQs, TEAC for SEQs, your go-to introductions and conclusions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✅</span>
                <span><strong className="text-slate-200">Past paper folder</strong> — 3–5 completed papers with marked feedback so you know your weak spots</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✅</span>
                <span><strong className="text-slate-200">Exam kit</strong> — extra pens, water, watch (not a smartwatch), tissues, and any allowed materials</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section id="seven-day-plan" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">2. The 7-Day Revision Plan</h2>
          <p>
            Here&apos;s a day-by-day plan tailored for O-Level Humanities. Adjust based on whether
            your paper falls on a Monday or later in the week.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 pr-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Day</th>
                  <th className="text-left py-2 pr-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Focus</th>
                  <th className="text-left py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −7</td>
                  <td className="py-3 pr-4 text-indigo-400 font-bold align-top whitespace-nowrap">Diagnose</td>
                  <td className="py-3 text-slate-400">
                    Generate one full SBQ paper on MARKUP. Complete it under timed conditions (45 min max).
                    Review your graded feedback — identify which SBQ skill is your weakest
                    (Comparison? Reliability? Purpose?). This is your priority for the week.
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −6</td>
                  <td className="py-3 pr-4 text-emerald-400 font-bold align-top whitespace-nowrap">Content Review</td>
                  <td className="py-3 text-slate-400">
                    Review your topic summaries for the two most heavily tested chapters.
                    Create memory aids (mnemonics, timelines, mind maps) for key facts.
                    Spend 30 minutes on the SBQ skill you identified as weakest — review
                    the framework and re-read a model answer.
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −5</td>
                  <td className="py-3 pr-4 text-indigo-400 font-bold align-top whitespace-nowrap">SBQ Deep Dive</td>
                  <td className="py-3 text-slate-400">
                    Generate another SBQ paper — but this time, focus deliberately on your weak skill.
                    If Reliability was your issue, spend extra time on provenance analysis.
                    Compare your answer with the AI feedback. Repeat until you see improvement.
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −4</td>
                  <td className="py-3 pr-4 text-emerald-400 font-bold align-top whitespace-nowrap">Essay Practice</td>
                  <td className="py-3 text-slate-400">
                    Generate a SEQ/SRQ question. Plan your essay using the PEEL framework
                    (5 min planning, 20 min writing). Grade it and check: Did you write a clear
                    thesis? Did every paragraph link back to the question? Revise and rewrite
                    your weakest paragraph.
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −3</td>
                  <td className="py-3 pr-4 text-indigo-400 font-bold align-top whitespace-nowrap">Mixed Paper</td>
                  <td className="py-3 text-slate-400">
                    Generate a full <strong className="text-slate-200">All Formats</strong> paper
                    on MARKUP (SBQ + SEQ/SRQ). Complete both sections under timed conditions.
                    This builds exam stamina and helps you practise transitioning between
                    question types under pressure.
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −2</td>
                  <td className="py-3 pr-4 text-amber-400 font-bold align-top whitespace-nowrap">Light Review</td>
                  <td className="py-3 text-slate-400">
                    No more full papers. Review your cheat sheets and model answers.
                    Skim your topic summaries. Talk through a few essay outlines verbally
                    (explain your argument to a wall or a friend). Go to bed at a reasonable hour.
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/50 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200 align-top whitespace-nowrap">Day −1</td>
                  <td className="py-3 pr-4 text-red-400 font-bold align-top whitespace-nowrap">Rest & Prepare</td>
                  <td className="py-3 text-slate-400">
                    Pack your exam bag. Review your SBQ cheat sheet one last time (15 min max).
                    Do something relaxing — walk, stretch, listen to music. No screens 1 hour
                    before bed. Target 8 hours of sleep.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
            <p className="text-xs text-amber-300 font-bold">
              ⚡ Key principle: Active practice beats passive reading every time. Generating and
              grading papers on MARKUP is worth 3x more than re-reading your textbook.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="time-management" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">3. Time Management: Minutes Per Question</h2>
          <p>
            The #1 mistake students make in the Humanities paper is <strong className="text-slate-200">running out of time</strong>.
            Here&apos;s exactly how to allocate your time for the O-Level Social Studies paper
            (1 hour 45 minutes for the full paper):
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 pr-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Section</th>
                  <th className="text-left py-2 pr-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Question</th>
                  <th className="text-left py-2 pr-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Marks</th>
                  <th className="text-left py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                <tr>
                  <td className="py-2 pr-4 font-bold text-slate-200" rowSpan={4}>SBQ</td>
                  <td className="py-2 pr-4 text-slate-400">(a) Comparison</td>
                  <td className="py-2 pr-4 text-slate-400">6</td>
                  <td className="py-2 text-slate-400">12 min</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-400">(b) Reliability</td>
                  <td className="py-2 pr-4 text-slate-400">7</td>
                  <td className="py-2 text-slate-400">14 min</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-400">(c) Purpose/Utility</td>
                  <td className="py-2 pr-4 text-slate-400">7</td>
                  <td className="py-2 text-slate-400">14 min</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-400">(d) Comparison</td>
                  <td className="py-2 pr-4 text-slate-400">10</td>
                  <td className="py-2 text-slate-400">18 min</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-bold text-slate-200">SEQ</td>
                  <td className="py-2 pr-4 text-slate-400">Essay (choose 1 of 2)</td>
                  <td className="py-2 pr-4 text-slate-400">20</td>
                  <td className="py-2 text-slate-400">30 min</td>
                </tr>
                <tr className="border-t-2 border-slate-700">
                  <td className="py-2 pr-4 font-bold text-indigo-400" colSpan={2}>Buffer / Checking</td>
                  <td className="py-2 pr-4 text-indigo-400">—</td>
                  <td className="py-2 text-indigo-400">17 min</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Pro tips for time management:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1.5">
              <li><strong className="text-slate-200">Wear a simple analog watch</strong> — check it after every question</li>
              <li><strong className="text-slate-200">If you get stuck, move on.</strong> Spending 20 minutes on a 6-mark question means you&apos;ll rush your 20-mark essay</li>
              <li><strong className="text-slate-200">Plan before you write</strong> — 2 minutes of planning saves 5 minutes of rewriting</li>
              <li><strong className="text-slate-200">Leave 5 minutes at the end</strong> to check for obvious errors (names, dates, spelling)</li>
              <li><strong className="text-slate-200">Practise with a timer</strong> — use MARKUP&apos;s practice mode to get used to the clock</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="morning-of" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">4. The Morning of the Paper</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-400 mb-2">✅ Do</h3>
              <ul className="space-y-1.5 text-[10px] text-slate-400">
                <li>Wake up early enough to eat a proper breakfast</li>
                <li>Review your SBQ cheat sheet once (10 min, no more)</li>
                <li>Arrive at the exam venue 20 minutes early</li>
                <li>Use the bathroom before entering the hall</li>
                <li>Take deep breaths while waiting for the paper to start</li>
              </ul>
            </div>
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
              <h3 className="text-xs font-bold text-red-400 mb-2">❌ Don&apos;t</h3>
              <ul className="space-y-1.5 text-[10px] text-slate-400">
                <li>Cram new content — it increases anxiety, not performance</li>
                <li>Discuss the paper with friends before entering</li>
                <li>Drink too much coffee or sugary drinks</li>
                <li>Bring your phone into the exam hall</li>
                <li>Panic if others start writing before you — everyone works at different paces</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="during-exam" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">5. During the Exam: Your Battle Plan</h2>
          <p>
            When the invigilator says &ldquo;You may begin,&rdquo; follow this sequence:
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">1</span>
                <h3 className="text-sm font-black text-white">Read the Paper (3 minutes)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Scan the entire paper. Read all sources quickly. Identify which SBQ question
                seems hardest and which SEQ essay topic you prefer. This helps your subconscious
                start working on the hard problem while you tackle easier questions.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">2</span>
                <h3 className="text-sm font-black text-white">Do SBQ in Order (55 minutes)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Answer the SBQ questions in order — they&apos;re designed to build on each other.
                Don&apos;t skip ahead. For each question, spend 1–2 minutes planning before you write.
                If you&apos;re stuck on (c), write what you can and move on to (d).
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400">3</span>
                <h3 className="text-sm font-black text-white">Plan Your Essay (5 minutes)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Choose your essay question. Write a quick outline: your thesis statement, 3–4 PEEL
                paragraph points with evidence, and your conclusion. A good plan is the difference
                between a coherent argument and a rambling mess.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-[10px] font-black text-purple-400">4</span>
                <h3 className="text-sm font-black text-white">Write Your Essay (25 minutes)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Write at least 3–4 paragraphs, each following PEEL. Make sure every paragraph
                links back to the question. If you run short on time, write your conclusion
                anyway — a strong summary can salvage a rushed essay.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400">5</span>
                <h3 className="text-sm font-black text-white">Review & Check (remaining time)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Use any remaining time to check: Did you answer every question? Did you include
                specific evidence from the sources in your SBQ answers? Did you use historical
                terms correctly? Fix obvious typos.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="mental-prep" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">6. Mental Preparation & Staying Calm</h2>
          <p>
            Exam anxiety is normal — even top students feel it. The key is having strategies
            to manage it so it doesn&apos;t affect your performance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-indigo-400 mb-1">🧘 During the Exam</h3>
              <ul className="space-y-1.5 text-[10px] text-slate-400">
                <li>Feel panic? Close your eyes and take 3 deep breaths (4 sec in, 4 sec hold, 4 sec out)</li>
                <li>If your mind goes blank on a question, move to an easier one and come back</li>
                <li>Remember: the examiner wants you to succeed — write clearly and directly</li>
                <li>You don&apos;t need to be perfect, you just need to be better than enough</li>
              </ul>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-400 mb-1">🌙 The Night Before</h3>
              <ul className="space-y-1.5 text-[10px] text-slate-400">
                <li>Stop studying by 8 PM at the latest</li>
                <li>Do something relaxing — watch a show, talk to family, stretch</li>
                <li>Prepare your exam bag and clothes so you don&apos;t rush in the morning</li>
                <li>Remind yourself: you&apos;ve prepared for this. Trust your training.</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-bold text-center">
              💡 The students who score the highest aren&apos;t the ones who know the most content —
              they&apos;re the ones who execute their plan calmly under pressure.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="final-checklist" className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-black text-white">7. Final Checklist</h2>
          <p>
            Print this or memorise it. Run through it before your Humanities paper:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I have my exam kit (pens, water, watch, IC)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I&apos;ve reviewed my SBQ cheat sheet (not crammed new content)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I&apos;ve had breakfast and arrived early</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I will spend 15 min per 10 marks</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I will plan each answer before writing</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I will use source evidence in every SBQ answer</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I will check my answers with any time remaining</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-indigo-500" readOnly disabled />
              <span className="text-slate-300">I will stay calm and trust my preparation</span>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-amber-950/50 to-slate-950/80 border border-amber-800/50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-lg font-black text-white">Train like you&apos;ll fight</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The best exam preparation is realistic practice under timed conditions. Use MARKUP
            to generate full O-Level papers, get instant LORMS grading, and build the stamina
            you need for exam day.
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
            <Link href="/tips/study-strategy" className="text-xs text-slate-500 hover:text-slate-300 transition font-bold">
              ← Previous: Study Strategy
            </Link>
            <Link href="/tips/history-vs-social-studies" className="text-xs text-indigo-400 hover:text-indigo-300 transition font-bold">
              Next: History vs Social Studies →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
