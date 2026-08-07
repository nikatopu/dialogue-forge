import Link from "next/link";
import {
  ArrowLeft, Workflow, Unlink, MessageSquareDashed,
  LayoutGrid, BookOpen, LifeBuoy, ChevronRight,
} from "lucide-react";
import style from "./NotFoundPage.module.scss";

/* Where a lost visitor most likely meant to go. Order matters — first entry is
   the primary action. */
const DESTINATIONS = [
  {
    href: "/",
    label: "Back to the editor",
    hint: "Pick up where you left off",
    Icon: Workflow,
  },
  {
    href: "/projects",
    label: "Your projects",
    hint: "Open a saved dialogue tree",
    Icon: LayoutGrid,
  },
  {
    href: "/how-to-use",
    label: "How to use",
    hint: "Nodes, variables, triggers, and export",
    Icon: BookOpen,
  },
  {
    href: "/support",
    label: "Support",
    hint: "FAQs and a direct line to us",
    Icon: LifeBuoy,
  },
];

export function NotFoundPage() {
  return (
    <div className={style.page}>
      <header className={style.header}>
        <Link href="/" className={style.brand}>
          <div className={style.brandMark}><Workflow size={14} /></div>
          <span className={style.brandName}>Dialogue Forge</span>
        </Link>
        <div className={style.headerDivider} />
        <Link href="/" className={style.backLink}>
          <ArrowLeft size={14} />Back to editor
        </Link>
      </header>

      <main className={style.main}>
        <section className={style.hero}>
          <div className={style.heroIcon}><Unlink size={20} /></div>
          <p className={style.code}>404</p>
          <h1 className={style.title}>This branch leads nowhere</h1>
          <p className={style.subtitle}>
            The page you were looking for isn&#39;t wired up — it may have moved,
            or the link that brought you here is out of date.
          </p>
        </section>

        <div className={style.card}>
          <div className={style.cardHeader}>
            <MessageSquareDashed size={14} className={style.cardIcon} />
            <span className={style.cardSpeaker}>Narrator</span>
            <span className={style.cardBadge}>Dead end</span>
          </div>
          <p className={style.cardLine}>
            &ldquo;You&#39;ve wandered off the graph. Nothing connects from
            here — but every other path is still open.&rdquo;
          </p>

          <nav aria-label="Suggested pages" className={style.choices}>
            {DESTINATIONS.map(({ href, label, hint, Icon }) => (
              <Link key={href} href={href} className={style.choice}>
                <span className={style.choiceIcon}><Icon size={14} /></span>
                <span className={style.choiceText}>
                  <span className={style.choiceLabel}>{label}</span>
                  <span className={style.choiceHint}>{hint}</span>
                </span>
                <ChevronRight size={14} className={style.choiceChevron} />
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}
