import type { Metadata } from 'next';
import Link from 'next/link';
import SbqTemplateForm from './SbqTemplateForm';
import PrintButton from './PrintButton';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Free O-Level SBQ Answer Template (Printable PDF) — MARKUP',
  description:
    'Free printable SBQ answer template for O-Level Social Studies and History. Sentence starters and structures for comparison, reliability, purpose, and utility questions — LORMS-aligned for top band.',
  openGraph: {
    title: 'Free O-Level SBQ Answer Template — MARKUP',
    description:
      'Printable SBQ answer templates and sentence starters for every question type. LORMS-aligned for top band.',
  },
  alternates: { canonical: '/resources/sbq-template' },
  robots: { index: true, follow: true },
};

export default function SbqTemplatePage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
          main { background: #ffffff !important; }
          .print-plain {
            background: #ffffff !important;
            border-color: #d1d5db !important;
            box-shadow: none !important;
          }
          .print-plain * { color: #111827 !important; }
          .print-plain .print-label { color: #6b7280 !important; }
          .print-plain .print-mono { color: #111827 !important; background: #f9fafb !important; }
        }
      `}</style>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        {/* Header */}
        <div className="no-print flex items-center gap-4 mb-4">
          <Link href="/tips" className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold whitespace-nowrap">
 ← All Tips & Guides
          </Link>
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>

        {/* Breadcrumb */}
        <nav className="no-print flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <Link href="/" className="hover:text-indigo-400 transition">Home</Link>
          <span>/</span>
          <Link href="/tips" className="hover:text-indigo-400 transition">Tips</Link>
          <span>/</span>
          <span className="text-slate-400">Free SBQ Template</span>
        </nav>
        {/* BreadcrumbList structured data (matches the visible nav above) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              breadcrumbJsonLd([
                { name: 'Home', href: '/' },
                { name: 'Tips & Guides', href: '/tips' },
                { name: 'Free SBQ Template', href: '/resources/sbq-template' },
              ])
            ),
          }}
        />

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <div className="no-print flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Free Resource</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">Printable · LORMS-aligned</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            The O-Level SBQ Answer Template
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            The exact sentence starters and structures top-band students use for every SBQ question
            type — comparison, reliability, purpose, and utility. Print it, memorise it, and never
            freeze under exam conditions again.
          </p>
          <div className="no-print flex items-center gap-3 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-black text-indigo-400">M</div>
            <div>
              <p className="text-sm font-bold text-slate-300">MARKUP Team</p>
              <p className="text-[10px] text-slate-600">Based on our LORMS-graded practice papers · Aug 2026</p>
            </div>
          </div>
        </div>

        {/* Email capture */}
        <SbqTemplateForm />

        {/* ── The Template ── */}

        {/* Quick overview */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest print-label">How to use this template</p>
          <ul className="text-xs text-slate-400 leading-relaxed space-y-1.5 list-disc pl-4">
            <li>Pick <strong className="text-slate-200">ONE</strong> question type per practice session. Write 2–3 answers with its structure until it feels automatic.</li>
 <li>Every template follows: <strong className="text-slate-200">Open → Prove → Judge</strong>. Examiners are looking for that judgement.</li>
            <li>To hit <strong className="text-slate-200">L4/L5</strong>, weave evidence from <strong className="text-slate-200">both/all sources together</strong> — never describe them one after the other.</li>
          </ul>
        </section>

        {/* 1. Comparison */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-black text-white">1. Comparison — 6 marks</h2>
          <p className="text-[10px] text-slate-500 print-label">Question: &ldquo;How similar are the views of the two sources on [aspect]?&rdquo;</p>
          <div className="print-mono bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 space-y-2">
 <p>• <em>&ldquo;Both sources offer a [similar/contrasting] view of [topic].&rdquo;</em></p>
 <p>• <em>&ldquo;A key similarity is that both sources [claim]. Source A states &lsquo;[quote]&rsquo; while Source B similarly notes &lsquo;[quote]&rsquo;.&rdquo;</em></p>
 <p>• <em>&ldquo;However, the sources differ in their emphasis. Source A focuses on [aspect] while Source B highlights [different aspect].&rdquo;</em></p>
 <p>• <em>&ldquo;Overall, the sources are [largely similar / more different than similar] because [reason].&rdquo;</em></p>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold print-label">Key to L4/6: weave BOTH sources into every paragraph. Never a paragraph on A followed by a paragraph on B.</p>
        </section>

        {/* 2. Reliability */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-black text-white">2. Reliability — 5/7 marks</h2>
          <p className="text-[10px] text-slate-500 print-label">Question: &ldquo;How reliable is Source [X] as evidence for [issue]?&rdquo;</p>
          <div className="print-mono bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 space-y-2">
 <p>• <em>&ldquo;Source [X] is [partially/fully/limited] reliable. As [author/position], the author had [first-hand access / reason to distort].&rdquo;</em></p>
 <p>• <em>&ldquo;Its reliability is supported by cross-referencing: Source [Y] corroborates this by stating &lsquo;[quote]&rsquo;.&rdquo;</em></p>
 <p>• <em>&ldquo;However, its reliability is limited by [bias/purpose/perspective]. Additionally, Source [Z] contradicts it on [point].&rdquo;</em></p>
 <p>• <em>&ldquo;On balance, Source [X] is useful for [purpose] but must be treated with caution regarding [limitation].&rdquo;</em></p>
          </div>
          <p className="text-[10px] text-purple-400 font-bold print-label">Key to L5/7: you need BOTH provenance analysis AND cross-referencing, plus a nuanced judgement (not just &ldquo;reliable&rdquo; / &ldquo;unreliable&rdquo;).</p>
        </section>

        {/* 3. Purpose */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-black text-white">3. Purpose — 5/7 marks</h2>
          <p className="text-[10px] text-slate-500 print-label">Question: &ldquo;What is the purpose of Source [X]?&rdquo; / &ldquo;Why did the author create it?&rdquo;</p>
          <div className="print-mono bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 space-y-2">
 <p>• <em>&ldquo;The purpose of Source [X] is to [persuade/justify/criticise/inform/warn] its audience about [topic].&rdquo;</em></p>
 <p>• <em>&ldquo;The author achieves this through [emotive language/rhetorical questions/exaggeration]. For example, &lsquo;[quote]&rsquo; suggests [effect].&rdquo;</em></p>
 <p>• <em>&ldquo;The intended audience appears to be [audience], evident from [language/context]. This supports the purpose of [purpose].&rdquo;</em></p>
 <p>• <em>&ldquo;In summary, the primary purpose is to [overall purpose], achieved through [techniques] for [audience].&rdquo;</em></p>
          </div>
          <p className="text-[10px] text-rose-400 font-bold print-label">Key to L5/7: don&apos;t stop at the message. Analyse language + audience + author identity — that&apos;s what separates top band.</p>
        </section>

        {/* 4. Utility / Comparison */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-black text-white">4. Utility / Comparison — 10 marks</h2>
          <p className="text-[10px] text-slate-500 print-label">Question: &ldquo;How far do the sources agree on [topic], and how useful are they for a historian?&rdquo;</p>
          <div className="print-mono bg-slate-900/70 rounded-lg p-3 text-[10px] font-mono text-slate-400 space-y-2">
 <p>• <em>&ldquo;The sources [largely/partially] agree on [topic], but their utility depends on the aspect being investigated.&rdquo;</em></p>
 <p>• <em>&ldquo;They agree that [point] — Source A states &lsquo;[quote]&rsquo;, echoed by Source B which argues &lsquo;[quote]&rsquo;. However, they differ on [aspect].&rdquo;</em></p>
 <p>• <em>&ldquo;Source [A] is useful for understanding [aspect] because [first-hand account/expertise], but limited for [aspect] because [bias/omission].&rdquo;</em> <span className="text-slate-600 print-label">(repeat per source)</span></p>
 <p>• <em>&ldquo;In conclusion, their combined utility is [high/moderate/limited] — for [specific aspect] they provide [valuable/partial] evidence, supplemented by [other sources/CK].&rdquo;</em></p>
          </div>
          <p className="text-[10px] text-violet-400 font-bold print-label">Key to L5/8: answer BOTH parts equally — comparison AND source-by-source utility — then a combined judgement.</p>
        </section>

        {/* Sentence starters table */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-black text-white">Quick-Reference Sentence Starters</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 pr-3 text-[9px] font-black text-slate-500 uppercase tracking-widest print-label">Skill</th>
                  <th className="text-left py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest print-label">Starters</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-indigo-400 align-top print-label">Similarity</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;Both sources suggest that&hellip;&rdquo; · &ldquo;A key similarity is&hellip;&rdquo; · &ldquo;This is echoed by Source B which&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-amber-400 align-top print-label">Difference</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;However, the sources differ on&hellip;&rdquo; · &ldquo;In contrast, Source B argues&hellip;&rdquo; · &ldquo;Whereas A emphasises X, B highlights Y&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-purple-400 align-top print-label">Provenance</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;As [a government official], the author&hellip;&rdquo; · &ldquo;Written in [date], the source is [contemporary/retrospective]&hellip;&rdquo; · &ldquo;The intended audience was&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-emerald-400 align-top print-label">Cross-reference</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;This is corroborated by Source B which&hellip;&rdquo; · &ldquo;However, Source C contradicts this by stating&hellip;&rdquo; · &ldquo;The consistency between A and B strengthens&hellip;&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-3 font-bold text-rose-400 align-top print-label">Judgement</td>
                  <td className="py-2 text-slate-400">
                    &ldquo;On balance, the source is [partially reliable]&hellip;&rdquo; · &ldquo;Overall, the sources are [largely similar]&hellip;&rdquo; · &ldquo;Their combined utility is [high/moderate/limited] for&hellip;&rdquo;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* LORMS levels */}
        <section className="print-plain space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-black text-white">What LORMS Levels Look Like in Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="print-plain bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest print-label">L2 — Stuck</p>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                &ldquo;Source A says X. Source B says Y. So they are different.&rdquo; — describes
                sources separately, no synthesis, no judgement.
              </p>
            </div>
            <div className="print-plain bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest print-label">L4/L5 — Top Band</p>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                Weaves both sources into each point, quotes specific evidence, analyses tone/
                provenance, and ends with a judgement that answers the question.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 print-label">
 MARKUP grades your answers to these exact levels and tells you, sentence by sentence,
            what to fix to reach the next band.
          </p>
        </section>

        {/* Print / CTA */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <PrintButton />
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-500/25"
          >
 Practise with AI Grading — Free →
          </Link>
        </div>

        {/* Footer note */}
        <p className="no-print text-center text-[9px] text-slate-600 pt-4">
          MARKUP · AI O-Level Humanities practice · {new Date().getFullYear()} ·{' '}
 <Link href="/tips" className="hover:text-indigo-400 transition underline underline-offset-2">More free guides →</Link>
        </p>
      </article>
    </main>
  );
}
