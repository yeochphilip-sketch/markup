import type { Metadata } from 'next';
import Link from 'next/link';
import TipsGrid from '@/app/components/TipsGrid';
import type { TipEntry } from '@/app/components/TipsGrid';

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

const TIPS: TipEntry[] = [
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
    type: ['SBQ'],
    subject: 'Both',
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
    type: ['SBQ'],
    subject: 'Both',
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
    type: ['SBQ'],
    subject: 'Both',
  },
  {
    slug: 'sbq-utility-comparison',
    title: 'How to Ace the SBQ 10-Mark Comparison/Utility Question (L5/8)',
    description:
      'The highest-value SBQ question — learn the 4-step method to assess how far sources agree, evaluate utility, and score the top L5/8 band.',
    icon: '⚡',
    gradient: 'from-violet-900/40 to-slate-900/40',
    tag: 'SBQ Guide',
    tagColor: 'indigo',
    readTime: '10 min read',
    type: ['SBQ'],
    subject: 'Both',
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
    type: ['SRQ', 'SEQ'],
    subject: 'Both',
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
    type: ['SEQ'],
    subject: 'History',
  },
  {
    slug: 'historical-context-essays',
    title: 'How to Use Historical Context in Your Humanities Essays',
    description:
      'Don\'t just describe — contextualise. Learn how to weave contextual knowledge (CK) into your essays to deepen your analysis and score top L3/7 bands.',
    icon: '🌐',
    gradient: 'from-teal-900/40 to-slate-900/40',
    tag: 'Essay Tips',
    tagColor: 'emerald',
    readTime: '11 min read',
    type: ['SRQ', 'SEQ'],
    subject: 'Both',
  },
  {
    slug: 'srq-guide',
    title: 'How to Answer SRQ Questions — Social Studies Guide',
    description:
      'Master the SRQ (Structured Response Question) for O-Level Social Studies. 3-step L3/8 framework with PEEL structure, evidence handling, and evaluation techniques.',
    icon: '📝',
    gradient: 'from-sky-900/40 to-slate-900/40',
    tag: 'SRQ Guide',
    tagColor: 'indigo',
    readTime: '11 min read',
    type: ['SRQ'],
    subject: 'Social Studies',
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
    type: ['SBQ', 'SRQ', 'SEQ'],
    subject: 'Both',
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
    type: ['SBQ', 'SRQ', 'SEQ'],
    subject: 'Both',
  },
  {
    slug: 'history-vs-social-studies',
    title: 'How to Study for History vs Social Studies',
    description:
      'Head-to-head comparison of content, exam format, skills, and study strategies. Learn how to ace both subjects and make the most of your study time.',
    icon: '🎓',
    gradient: 'from-cyan-900/40 to-slate-900/40',
    tag: 'Study Strategy',
    tagColor: 'amber',
    readTime: '10 min read',
    type: ['SBQ', 'SRQ', 'SEQ'],
    subject: 'Both',
  },
];

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

        {/* Filterable Grid */}
        <TipsGrid tips={TIPS} />

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
