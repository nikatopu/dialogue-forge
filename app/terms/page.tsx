import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Dialogue Forge",
  description: "Terms of Service for Dialogue Forge — your rights, our responsibilities, and how the service works.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "May 25, 2026";

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-10 h-14 flex items-center gap-3 px-5 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Workflow className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold hidden sm:block">
            Dialogue Forge
          </span>
        </Link>
        <div className="w-px h-4 bg-border/60 hidden sm:block" />
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to editor
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-5 py-12 space-y-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-xs text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <Section title="Acceptance">
          <p>
            By accessing or using Dialogue Forge (&#34;the Service&#34;), you
            agree to these Terms of Service. If you do not agree, please do not
            use the Service.
          </p>
          <p>
            These terms apply to all users — guests using the editor locally and
            signed-in users with cloud projects.
          </p>
        </Section>

        <Section title="The Service">
          <p>
            Dialogue Forge is a web-based visual dialogue editor. It lets you
            create branching dialogue graphs, preview them, and export
            structured JSON for use in game engines and interactive experiences.
          </p>
          <p>
            The Service is provided free of charge. The free plan includes local
            editing (unlimited) and up to 5 cloud-synced projects for signed-in
            users.
          </p>
        </Section>

        <Section title="Your content">
          <p>
            You retain full ownership of all dialogue content, graphs, and
            projects you create with Dialogue Forge. We claim no intellectual
            property rights over your work.
          </p>
          <p>
            By saving a project to the cloud you grant us a limited,
            non-exclusive licence to store and transmit that content solely for
            the purpose of providing the Service to you.
          </p>
          <p>
            You are responsible for ensuring your content does not violate any
            applicable laws or third-party rights.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to use Dialogue Forge to:</p>
          <ul>
            <li>
              Upload or distribute unlawful, harmful, or infringing content
            </li>
            <li>
              Attempt to reverse-engineer, decompile, or extract the source code
            </li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Use automated tools to scrape, crawl, or abuse the Service</li>
            <li>Circumvent account limits or access controls</li>
            <li>Impersonate another person or entity</li>
          </ul>
        </Section>

        <Section title="Accounts">
          <p>
            Creating an account via Google or GitHub OAuth is optional. Cloud
            features require an account; local editing does not.
          </p>
          <p>
            You are responsible for maintaining the security of your account. We
            are not liable for loss or damage resulting from unauthorised access
            to your account.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms.
          </p>
        </Section>

        <Section title="Cloud projects & data">
          <p>
            Cloud projects are stored on Supabase infrastructure. While we take
            reasonable precautions to protect your data, we do not guarantee
            uninterrupted availability or freedom from data loss.
          </p>
          <p>
            <strong>
              We strongly recommend exporting your projects regularly
            </strong>{" "}
            (Settings → Export local data, or Ctrl + S in the editor) as an
            independent backup.
          </p>
          <p>
            We reserve the right to enforce plan limits (currently 5 cloud
            projects per account). Projects exceeding limits may become
            read-only until you delete others to free capacity.
          </p>
        </Section>

        <Section title="Availability & changes">
          <p>
            We provide the Service &#34;as is&#34; and &#34;as available&#34;.
            We may modify, suspend, or discontinue any part of the Service at
            any time, with or without notice.
          </p>
          <p>
            We will make reasonable efforts to preserve your data in the event
            of significant changes or discontinuation.
          </p>
        </Section>

        <Section title="Disclaimer of warranties">
          <p>
            The Service is provided without warranties of any kind, express or
            implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, or non-infringement.
          </p>
          <p>
            We do not warrant that the Service will be error-free,
            uninterrupted, or that defects will be corrected.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by applicable law, we are not liable
            for any indirect, incidental, special, consequential, or punitive
            damages — including loss of data, loss of profits, or loss of
            goodwill — arising from your use of or inability to use the Service.
          </p>
          <p>
            Our total liability to you for any claim arising from these Terms or
            the Service shall not exceed the amount you have paid us in the 12
            months preceding the claim. If you have not paid anything, our
            liability is zero.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            The Dialogue Forge application, its design, codebase, and brand are
            the intellectual property of its creator. You may not reproduce,
            distribute, or create derivative works of the application itself
            without explicit written permission.
          </p>
          <p>
            The export format (
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              .forge.json
            </code>
            ) is open for use in your own projects and runtimes without
            restriction.
          </p>
        </Section>

        <Section title="Changes to these Terms">
          <p>
            We may update these Terms from time to time. The &#34;Last
            updated&#34; date at the top of this page reflects the most recent
            revision.
          </p>
          <p>
            Continued use of the Service after changes are posted constitutes
            your acceptance of the new Terms. If you disagree with the updated
            Terms, you may stop using the Service and request deletion of your
            account.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These Terms are governed by the laws of Georgia (country). Any
            disputes shall be resolved in the courts of Georgia, unless
            otherwise required by applicable consumer protection law in your
            jurisdiction.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these Terms? Email us at{" "}
            <a
              href="mailto:nikatopu@gmail.com"
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              nikatopu@gmail.com
            </a>
            .
          </p>
        </Section>

        {/* Footer links */}
        <div className="pt-4 border-t border-border/40 flex gap-4">
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to editor
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:decoration-muted-foreground/40 [&_strong]:text-foreground [&_code]:font-mono">
        {children}
      </div>
    </section>
  );
}
