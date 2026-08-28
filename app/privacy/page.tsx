import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Workflow } from "lucide-react";
import { SiteFooter } from "@/components/organisms/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Dialogue Forge",
  description:
    "Privacy Policy for Dialogue Forge — what we collect, how we use it, and your rights.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "August 7, 2026";

export default function PrivacyPage() {
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
          href="/editor"
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
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <Section title="Overview">
          <p>
            Dialogue Forge is a visual dialogue editor. We respect your privacy
            and keep data collection minimal. This policy explains what
            information we collect, why we collect it, and how you can control
            it.
          </p>
          <p>
            Using Dialogue Forge locally (without an account) requires no
            personal data whatsoever. Cloud features are opt-in and require
            authentication.
          </p>
        </Section>

        <Section title="Information we collect">
          <Subsection title="When you use the editor (no account)">
            <p>
              Nothing. Your dialogue projects are stored only in your
              browser&#39;s local storage and never transmitted to our servers.
            </p>
          </Subsection>

          <Subsection title="When you sign in">
            <p>
              We collect the following from your OAuth provider (Google or
              GitHub):
            </p>
            <ul>
              <li>Email address</li>
              <li>Display name</li>
              <li>Profile picture URL</li>
              <li>OAuth provider identifier</li>
            </ul>
            <p>
              This information is stored in Supabase and is used solely to
              identify your account and display your profile in the app.
            </p>
          </Subsection>

          <Subsection title="Cookieless product analytics (PostHog)">
            <p>
              We use <strong>PostHog</strong>, hosted in the EU, to count how far
              people get through the product — landing on the site, opening the
              editor, adding a first node, creating a branch, running a preview,
              exporting. It runs <strong>without cookies</strong>: nothing is
              written to <code>document.cookie</code>, so it is not covered by the
              cookie banner and runs by default.
            </p>
            <p>
              <strong>If your browser sends Do Not Track or Global Privacy
              Control, it does not run at all</strong> — the script is never even
              downloaded. You are identified only by a random ID generated in your
              browser and stored in local storage; clearing your site data resets
              it. Your IP address is discarded rather than stored, and no
              geolocation is derived from it.
            </p>
            <p>
              Each event carries only counts and fixed labels — how many nodes are
              on the canvas, which export format, whether a visit is a return
              visit. If you arrive from a marketing link, its campaign parameters
              (<code>utm_source</code> and friends) are recorded against that
              anonymous ID so we can tell which channels bring people who actually
              use the editor.
            </p>
          </Subsection>

          <Subsection title="Usage analytics (only with your consent)">
            <p>
              Google Analytics and Microsoft Clarity run{" "}
              <strong>only if you accept cookies</strong> when asked. Decline, or
              ignore the banner, and neither script is loaded at all — nothing is
              requested, set, or sent. You can change your mind at any time via{" "}
              <strong>Cookie preferences</strong> in the footer.
            </p>
            <p>If you do accept, we collect:</p>
            <ul>
              <li>
                Feature interactions (template loaded, preview started, export
                triggered)
              </li>
              <li>Page views, session context (mobile or desktop), and device
                and browser type</li>
              <li>Project lifecycle events (created, deleted, duplicated)</li>
              <li>
                Anonymised session recordings and heatmaps showing how the
                interface is used — clicks, scrolling, and cursor movement
              </li>
            </ul>
            <p>
              <strong>We never collect:</strong> dialogue content, character
              names, node text, project names, or any part of your creative
              work.
            </p>
            <p>
              Analytics events are associated with an anonymous user ID — not
              your email or display name.
            </p>
          </Subsection>
        </Section>

        <Section title="How we use your information">
          <ul>
            <li>
              To authenticate you and associate cloud projects with your account
            </li>
            <li>To display your profile in the app (name, avatar)</li>
            <li>
              To understand how Dialogue Forge is used so we can improve it
            </li>
          </ul>
          <p>We do not sell, share, or use your data for advertising.</p>
        </Section>

        <Section title="Data storage">
          <p>
            Account data and cloud projects are stored in{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Supabase
            </a>
            . Supabase stores data in secure infrastructure and follows
            industry-standard security practices.
          </p>
          <p>
            Local projects (no account) are stored exclusively in your
            browser&#39;s{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              localStorage
            </code>
            . Clearing your browser data will delete them permanently.
          </p>
        </Section>

        <Section title="Third-party services">
          <ul>
            <li>
              <strong>Supabase</strong> — authentication, database, and storage.{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Supabase Privacy Policy
              </a>
            </li>
            <li>
              <strong>Google OAuth</strong> — optional sign-in provider.{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>GitHub OAuth</strong> — optional sign-in provider.{" "}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                GitHub Privacy Statement
              </a>
            </li>
            <li>
              <strong>PostHog (EU)</strong> — cookieless product analytics. Runs
              without cookies and is skipped entirely if your browser sends Do
              Not Track or Global Privacy Control.{" "}
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                PostHog Privacy Policy
              </a>
            </li>
            <li>
              <strong>Google Analytics</strong> — usage analytics. Loaded only
              after you accept cookies.{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>Microsoft Clarity</strong> — anonymised session replay and
              heatmaps. Loaded only after you accept cookies.{" "}
              <a
                href="https://privacy.microsoft.com/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Microsoft Privacy Statement
              </a>
            </li>
          </ul>
        </Section>

        <Section title="Your rights">
          <ul>
            <li>
              <strong>Access</strong> — you can export all your cloud projects
              at any time from the Settings modal.
            </li>
            <li>
              <strong>Deletion</strong> — you can delete individual projects
              from the Projects dashboard. To delete your account and all
              associated data, contact us at the address below.
            </li>
            <li>
              <strong>Portability</strong> — all projects export as standard
              JSON files you can use in any runtime.
            </li>
          </ul>
        </Section>

        <Section title="Cookies & local storage">
          <p>We use browser storage in two ways:</p>
          <ul>
            <li>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                localStorage
              </code>{" "}
              — to save your local project and editor preferences (theme, panel
              state).
            </li>
            <li>
              Supabase session cookies — to keep you signed in across page
              loads. These are essential for authentication and cannot be
              disabled while using cloud features.
            </li>
            <li>
              Analytics cookies set by Google Analytics and Microsoft Clarity —{" "}
              <strong>only if you accept them</strong>. Your choice is
              remembered in{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                localStorage
              </code>{" "}
              and can be changed at any time via{" "}
              <strong>Cookie preferences</strong> in the footer.
            </li>
          </ul>
          <p>We do not use advertising cookies, and we do not sell your data.</p>
        </Section>

        <Section title="Children">
          <p>
            Dialogue Forge is not directed at children under 13. We do not
            knowingly collect personal information from children under 13. If
            you believe we have done so unintentionally, contact us and we will
            delete it promptly.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Changes are
            effective when posted. The &#34;Last updated&#34; date at the top
            reflects the most recent revision. Continued use of Dialogue Forge
            after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions or requests about your data? Reach out at{" "}
            <a
              href="mailto:support@dialogueforge.org"
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              support@dialogueforge.org
            </a>
            .
          </p>
        </Section>

      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:decoration-muted-foreground/40 [&_strong]:text-foreground [&_code]:font-mono">
        {children}
      </div>
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
