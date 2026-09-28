'use client';

export default function PrintButton({ label = 'Print / Save as PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="bg-slate-800 hover:bg-slate-700 text-white font-black px-6 py-3 rounded-xl text-sm transition border border-slate-700"
    >
      {label}
    </button>
  );
}
