import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold whitespace-nowrap"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">Terms of Service</h2>
        <p className="text-xs text-slate-500 font-mono">Last updated: July 2026</p>

        <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
            <p>
              By accessing or using MARKUP (&ldquo;the Service&rdquo;), you agree to be bound by these
              Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">2. Description of Service</h3>
            <p>
              MARKUP is an AI-powered humanities practice platform designed for Singapore GCE
              O-Level Social Studies and Elective History students. The Service provides
              AI-generated practice papers, automated LORMS-aligned grading, progress tracking
              through gamification (XP, levels, achievements), and study group features.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">3. Beta Period</h3>
            <p>
              The Service is currently in beta. All features are provided free of charge during
              this period. We reserve the right to introduce pricing tiers after the beta period
              ends. Beta users may be offered preferential pricing as described on our pricing
              page.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">4. User Accounts</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must be a secondary school student or educator to use the Service</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You must provide accurate email information for account-related communications</li>
              <li>One person per account — sharing login credentials is not permitted</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">5. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to bypass our AI grading system or manipulate XP/achievements</li>
              <li>Upload malicious content or attempt to compromise the Service</li>
              <li>Use automated scripts to generate excessive API calls</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">6. AI Grading Disclaimer</h3>
            <p>
              AI-generated grades are provided as practice feedback and should not be considered
              equivalent to official SEAB marking. While we strive for LORMS accuracy, the AI
              may occasionally produce incorrect or inconsistent feedback. Always consult your
              teacher for official assessment of your work.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">7. Intellectual Property</h3>
            <p>
              The Service, including its code, design, and AI models, is owned by Markup
              Analytics. Generated practice papers and grading feedback are provided for your
              personal educational use. You retain ownership of your essay submissions.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">8. Limitation of Liability</h3>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranty. We are not liable for any
              damages arising from your use of the Service, including but not limited to
              academic performance or exam results.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">9. Changes to Terms</h3>
            <p>
              We may update these terms at any time. Users will be notified of material changes
              via email. Continued use of the Service after changes constitutes acceptance of
              the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">10. Contact</h3>
            <p>
              For questions about these terms, please submit feedback through the dashboard
              or contact us directly via the feedback form.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-900 text-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold underline underline-offset-4 transition">
            ← Back to MARKUP
          </Link>
        </div>
      </div>
    </div>
  );
}
