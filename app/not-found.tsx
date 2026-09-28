import Link from 'next/link';

// Next.js already emits a `noindex` robots tag for not-found pages, so only the
// title is set here (avoids a duplicate <meta name="robots">).
export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8 py-24">
        {/* Oversized ghost grade marker */}
        <div className="relative select-none" aria-hidden="true">
          <p className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-indigo-500/25">
            L0
          </p>
          <p className="absolute inset-x-0 -bottom-4 text-[10px] font-black tracking-[0.4em] uppercase text-slate-700">
            Mark not found
          </p>
        </div>

        <div className="space-y-3 pt-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            This page didn&apos;t make the cut.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Don&apos;t worry —
            this one won&apos;t cost you marks.
          </p>
        </div>

        {/* Primary CTA + key internal links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
          >
 Start Practising — Free <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/tips"
            className="bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800 font-bold px-8 py-3 rounded-xl text-sm transition"
          >
            Browse Tips &amp; Guides
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-600 pt-2">
          <Link href="/resources/sbq-template" className="hover:text-emerald-400 transition underline underline-offset-4">
            Free SBQ Template
          </Link>
          <span className="text-slate-800">·</span>
          <Link href="/privacy" className="hover:text-indigo-400 transition underline underline-offset-4">
            Privacy
          </Link>
          <span className="text-slate-800">·</span>
          <Link href="/terms" className="hover:text-indigo-400 transition underline underline-offset-4">
            Terms
          </Link>
        </div>

        <p className="text-[10px] font-bold text-slate-700 tracking-widest uppercase pt-4">
          © 2026 Markup Analytics • Singapore GCE O-Level Prep
        </p>
      </div>
    </main>
  );
}
