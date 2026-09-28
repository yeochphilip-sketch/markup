import Link from 'next/link';
import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data';
import { LEGAL_ENTITY, PRIVACY_EMAIL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How MARKUP collects, uses, and protects student data for the Singapore O-Level Humanities practice platform — accounts, practice submissions, AI grading, and analytics.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: 'Privacy Policy', href: '/privacy' },
            ])
          ),
        }}
      />
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
        <p className="text-xs text-slate-500 font-mono">Last updated: September 2026</p>

        <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">1. Who We Are</h3>
            <p>
              MARKUP is an independent study tool operated by {LEGAL_ENTITY} in Singapore. We are
              not affiliated with, endorsed by, or connected to the Singapore Examinations and
              Assessment Board (SEAB), the Ministry of Education (MOE), Cambridge Assessment, or
              any school.
            </p>
            <p>
              We have appointed a Data Protection Officer (DPO). For any question about this
              policy, or to make a request about your personal data, contact our DPO at{' '}
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                {PRIVACY_EMAIL}
              </a>
              . This is our published business contact for data protection matters.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">2. Information We Collect</h3>
            <p>We collect the following, and only what we need to run the Service:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account details</strong> — your email address, and your display name if
                you choose to provide it. Sign-in is by Google, an emailed magic link, or an
                email address and password.
              </li>
              <li>
                <strong>Study profile</strong> — the subjects and History paper you take, your
                target grade, and any exam date you enter.
              </li>
              <li>
                <strong>Practice content</strong> — the practice papers generated for you, the
                answers you type into the writing canvas, and the AI grading feedback returned
                to you. This may include anything you write, so please do not include personal
                information about yourself or anyone else in your answers.
              </li>
              <li>
                <strong>Progress data</strong> — XP, levels, streaks, achievements, and skill
                scores.
              </li>
              <li>
                <strong>Preferences</strong> — whether you want reminder and receipt emails.
              </li>
              <li>
                <strong>Technical data</strong> — IP address, browser and device type, and
                timestamps, generated when you use the Service.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">3. Students and Minors</h3>
            <p>
              MARKUP is built for secondary school students, so many of our users are under 18.
              We treat students&apos; personal data as sensitive and apply a higher standard of
              care to it.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Under 13.</strong> A parent or guardian must set up and consent to the
                account on the student&apos;s behalf. We do not knowingly collect personal data
                from a child under 13 without parent or guardian consent.
              </li>
              <li>
                <strong>13 to 17.</strong> You may consent on your own behalf, because we have
                written this policy and our Terms in plain language for your age group. If you
                do not understand any part of it, please ask a parent, guardian, or teacher
                before you sign up.
              </li>
              <li>
                If we learn that we hold personal data from a child under 13 without the
                required consent, we will delete it. A parent or guardian can ask us to review
                or delete a child&apos;s data at any time by emailing{' '}
                <a
                  href={`mailto:${PRIVACY_EMAIL}`}
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  {PRIVACY_EMAIL}
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">4. How We Use Your Information</h3>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>generate practice papers and grade your answers with AI feedback;</li>
              <li>save your progress, XP, achievements, and streaks;</li>
              <li>send you practice reminders and receipts, if you have them switched on;</li>
              <li>maintain your account and respond to your support requests; and</li>
              <li>keep the Service secure and detect misuse.</li>
            </ul>
            <p>
              We rely mainly on <strong>your consent</strong>, which you give when you create an
              account and choose your settings. We may also use your data where the PDPA permits
              it without consent — for example, to provide a service you have asked for, or to
              investigate a security incident. You can withdraw your consent at any time by
              changing your settings or emailing our DPO, though this may mean we can no longer
              provide parts of the Service.
            </p>
            <p>
              We do not use your answers to train, fine-tune, or improve our own AI models, and
              we do not sell your data.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">5. AI Processing</h3>
            <p>
              Grading is performed by third-party AI models. To grade your work, the text of
              your answers and the practice question are sent to those providers so they can
              return feedback. This is the core of the Service and cannot be switched off while
              you use it.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                AI providers act as our service providers, processing your answers so they can
                return grading to us — not for their own marketing.
              </li>
              <li>
                We do not sell your data, and we do not use your answers to train or improve our
                own models. Each provider&apos;s API terms govern how it may use submitted
                content, and we choose providers whose terms restrict this. Contact our DPO for
                the current list of providers and links to their terms.
              </li>
              <li>
                AI feedback is generated automatically. We do not routinely review individual
                answers by hand, and you should not treat AI grades as official assessment.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">6. Who We Share It With</h3>
            <p>
              <strong>We do not sell your personal data.</strong> We share it only with the
              service providers we need to run MARKUP. They may only use it to provide their
              service to us:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Supabase</strong> — authentication and database</li>
              <li><strong>Vercel</strong> — hosting, serverless functions, and aggregate analytics</li>
              <li><strong>Resend</strong> — sending reminder and receipt emails</li>
              <li>
                <strong>Groq and Google (Gemini)</strong> — AI model inference. The text of your
                answers is sent to these providers for grading (see section 5)
              </li>
              <li><strong>Stripe</strong> — payment processing, once paid plans are available</li>
            </ul>
            <p>
              Some parts of the Service are visible to other users. If you set a display name,
              it may appear on leaderboards and in study groups alongside your progress figures.
              You can change or clear your display name in Settings at any time.
            </p>
            <p>
              We may also disclose data if we are legally required to, or to protect the safety
              of our users. If we ever share aggregated statistics publicly, those will not
              identify any individual.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">7. Sending Data Outside Singapore</h3>
            <p>
              Our service providers are international, so your personal data is likely to be
              stored or processed outside Singapore, including in the United States. This
              includes your account details, your practice submissions, and the answers sent to
              our AI providers for grading.
            </p>
            <p>
              Before transferring personal data overseas, we require the receiving organisation
              to be bound by contractual obligations that give your data a standard of protection
              comparable to the protection it has in Singapore, as the PDPA requires.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">8. How Long We Keep It</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>While your account is active</strong>, we keep your profile and practice
                history so your progress and feedback stay continuous.
              </li>
              <li>
                <strong>When you delete your account</strong>, we delete or anonymise your
                personal data within 30 days, except for records we must keep for legal, tax, or
                security reasons. Records we must keep are stored so they cannot be used for any
                other purpose.
              </li>
              <li>
                <strong>Backups</strong> are deleted automatically as our backup rotation
                completes.
              </li>
              <li>
                <strong>Aggregated statistics</strong> that no longer identify you may be kept
                for longer, to help us understand how the Service is used.
              </li>
            </ul>
            <p>
              To delete your account and data, email our DPO at{' '}
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                {PRIVACY_EMAIL}
              </a>
              . We will confirm once it is done.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">9. How We Protect It</h3>
            <p>
              We use encryption in transit, access controls, and least-privilege access to your
              data. Because we hold students&apos; data, we review these measures regularly. No
              system is perfectly secure, but we work to reduce risk and to fix issues quickly.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">10. If Something Goes Wrong</h3>
            <p>
              If a data breach occurs, we will investigate and assess it promptly. Where the law
              requires it, we will notify the Personal Data Protection Commission (PDPC) within
              the required timeframe and tell affected users directly, so they can take steps to
              protect themselves.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">11. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Access</strong> the personal data we hold about you. You can download a
                copy of your data as a JSON file from the Settings page at any time.
              </li>
              <li><strong>Correct</strong> data that is inaccurate or incomplete.</li>
              <li>
                <strong>Withdraw consent</strong> to optional uses such as reminder emails, from
                your Settings page.
              </li>
              <li><strong>Delete</strong> your account and data, by emailing our DPO.</li>
            </ul>
            <p>
              For anything else, email{' '}
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                {PRIVACY_EMAIL}
              </a>
              . If you are not satisfied with our response, you may raise the matter with the
              PDPC.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">12. Cookies and Analytics</h3>
            <p>
              We use cookies and local storage that are needed for the Service to work — for
              example, to keep you signed in and to remember your preferences. We also use
              Vercel Analytics, which reports aggregate, anonymised usage figures rather than
              tracking you individually. We do not use advertising cookies or sell data to
              advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white">13. Changes to This Policy</h3>
            <p>
              We may update this policy as the Service changes or the law requires. If we make a
              material change, we will tell you by email or in the dashboard before it takes
              effect.
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
