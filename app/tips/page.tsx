import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tips & Guides',
  description:
    'Free O-Level Humanities study guides for Singapore Social Studies and Elective History. Master SBQ, PEEL essay structure, and study strategies with AI-powered practice tips.',
  openGraph: {
    title: 'Tips & Guides — MARKUP',
    description:
      'Free study guides for O-Level Humanities. Learn SBQ techniques, PEEL essay structure, and exam strategies with AI-powered practice tips from experienced educators.',
  },
};

const TIPS = [
  {
    slug: 'sbq-comparison',
    title: 'How to Ace SBQ Comparison Questions (L4/6 Framework)',
    description:
      'The SBQ comparison question is one of the most predictable parts of the paper. Learn the 3-step framework that top students use to consistently score L4/6.',
    icon: '📖',
    gradient: 'from-indigo-900/40 to-slate-900/40',
    tag: 'SBQ Guide',
    tagColor: 'indigo',
    readTime: '8 min read',
  },
  {
    slug: 'sbq-reliability',
    title: 'How to Ace SBQ Reliability Questions (L5/7 Framework)',
    description:
      'Master provenance analysis, cross-referencing, and evaluative judgement. The complete guide to scoring L5/7 on the highest-value SBQ question.',
    icon: '🔍',
    gradient: 'from-purple-900/40 to-slate-900/40',
    tag: 'SBQ Guide',
    tagColor: 'indigo',
    readTime: '9 min read',
  },
  {
    slug: 'sbq-purpose',
    title: 'How to Ace SBQ Purpose Questions (L5/7 Framework)',
    description:
      'Learn the 4-step method to analyse author intent. Identify message, audience, intention, and persuasive techniques to unlock top-band marks.',
    icon: '🎯',
    gradient: 'from-rose-900/40 to-slate-900/40',
    tag: 'SBQ Guide',
    tagColor: 'indigo',
    readTime: '9 min read',
  },
  {
    slug: 'peel-framework',
    title: 'The PEEL Framework: Structuring A1 Humanities Essays',
    description:
      'Point, Evidence, Explanation, Link — master the structure that examiners look for. We break down each component with real Social Studies and History examples.',
    icon: '✍️',
    gradient: 'from-emerald-900/40 to-slate-900/40',
    tag: 'Essay Tips',
    tagColor: 'emerald',
    readTime: '10 min read',
  },
  {
    slug: 'seq-evaluation',
    title: 'How to Ace SEQ Evaluation Questions (L5/7 Framework)',
    description:
      'The SEQ Evaluation question tests your ability to make judgements. Learn how to argue, evaluate, and conclude at the highest LORMS band.',
    icon: '⚖️',
    gradient: 'from-blue-900/40 to-slate-900/40',
    tag: 'Essay Tips',
    tagColor: 'emerald',
    readTime: '10 min read',
  },
  {
    slug: 'study-strategy',
    title: 'How to Use AI Practice Tools to Maximise Your Score',
    description:
      'Don\'t just generate and grade mindlessly. Learn how top students use AI to target weak skills, build streaks, and track their improvement over time.',
    icon: '🧠',
    gradient: 'from-amber-900/40 to-slate-900/40',
    tag: 'Study Strategy',
    tagColor: 'amber',
    readTime: '9 min read',
  },
  {
    slug: 'exam-week-strategy',
    title: 'Exam Week Strategy: Your 7-Day Humanities Playbook',
    description:
      'The week before your O-Level Humanities paper can make or break your score. Day-by-day plan, time management per question, and mental prep techniques.',
    icon: '🏆',
    gradient: 'from-orange-900/40 to-slate-900/40',
    tag: 'Study Strategy',
    tagColor: 'amber',
    readTime: '10 min read',
  },
];

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

export default function TipsPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold whitespace-nowrap"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>

        {/* Hero */}
        <div className="text-center space-y-4 pt-4">
          <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/50 border border-emerald-900/50 px-3 py-1 rounded-full">
            📝 Tips & Guides
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Master the O-Level Humanities
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Free study guides written by experienced educators. Learn SBQ techniques, master the
            PEEL essay framework, and discover how to use AI practice tools for maximum score improvement.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIPS.map((tip) => {
            const style = TAG_STYLES[tip.tagColor] || TAG_STYLES.indigo;
            return (
              <Link
                key={tip.slug}
                href={`/tips/${tip.slug}`}
                className="group block bg-slate-950/80 border border-slate-900 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-950/20 hover:scale-[1.02]"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${tip.gradient} flex items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-105`}
                >
                  {tip.icon}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[8px] text-slate-600 font-mono">
                    <span
                      className={`${style.bg} ${style.text} ${style.border} border px-2 py-0.5 rounded-full`}
                    >
                      {tip.tag}
                    </span>
                    <span>{tip.readTime}</span>
                  </div>
                  <h2 className="text-sm font-black text-slate-200 group-hover:text-white transition-colors leading-snug">
                    {tip.title}
                  </h2>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {tip.description}
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
                      Read Guide →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Trust & CTA Section */}
        <div className="bg-gradient-to-br from-slate-950/80 to-slate-950/50 border border-slate-900 rounded-2xl p-8 text-center space-y-4 mt-8">
          <h2 className="text-xl font-black text-white">Practise what you learn</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Every guide pairs perfectly with MARKUP&apos;s AI practice system. Read a technique, then
            immediately try it on a real O-Level paper with instant LORMS grading.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
          >
            Start Practising — Free
          </Link>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-900 text-center space-y-3">
          <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
            © 2026 Markup Analytics • Singapore GCE O-Level Prep
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
            <Link href="/privacy" className="hover:text-indigo-400 transition underline underline-offset-4">
              Privacy Policy
            </Link>
            <span className="text-slate-800">·</span>
            <Link href="/terms" className="hover:text-indigo-400 transition underline underline-offset-4">
              Terms of Service
            </Link>
            <span className="text-slate-800">·</span>
            <Link href="/" className="hover:text-indigo-400 transition underline underline-offset-4">
              Home
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
