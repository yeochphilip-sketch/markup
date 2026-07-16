import Link from 'next/link';

export default function PrivacyPage() {
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

        <h2 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h2>
        <p className="text-xs text-slate-500 font-mono">Last updated: July 2026</p>

        <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">1. Information We Collect</h3>
            <p>
              When you sign up for MARKUP, we collect your email address, name (optional), and
              academic preferences (subjects you take, target grades). We also collect your
              practice submissions — including essay answers and AI grading results — to provide
              and improve our service.
            </p>
            <p>
              We use Supabase as our database provider. Your data is stored securely in
              Singapore-based servers (or as otherwise specified by Supabase&apos;s infrastructure).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">2. How We Use Your Data</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To generate practice questions and grade your essay submissions</li>
              <li>To track your progress, XP, achievements, and learning streaks</li>
              <li>To send you practice reminders and weekly digests (if enabled)</li>
              <li>To improve our AI grading models and LORMS accuracy</li>
              <li>To communicate with you about service updates and beta announcements</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">3. Data Sharing</h3>
            <p>
              We do not sell your personal data. We may share anonymised, aggregate data for
              research or product improvement purposes. Your essay submissions are used only
              to train and calibrate our grading AI — they are never shared with third parties
              in identifiable form.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">4. Data Retention</h3>
            <p>
              We retain your account data for as long as your account is active. You may request
              deletion of your data at any time by emailing us. Practice history and graded
              essays are retained to provide continuity of service.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">5. Third-Party Services</h3>
            <p>
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Supabase</strong> — Authentication, database, and storage</li>
              <li><strong>Vercel</strong> — Hosting and serverless functions</li>
              <li><strong>Resend</strong> — Transactional emails (reminders, receipts)</li>
              <li><strong>Groq & Gemini</strong> — AI model inference for grading</li>
              <li><strong>Stripe</strong> — Payment processing (future)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">6. Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal data. You can
              export your data from the Settings page at any time. For any privacy-related
              requests, please reach out via the feedback form in the dashboard.
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
