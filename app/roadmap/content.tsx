"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Workflow,
  ChevronDown,
  MessageSquare,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackDestination } from "@/lib/backDestination";
import { childVariant } from "@/lib/motionVariants";
import {
  CHANGELOG,
  ROADMAP,
  STATUS_LABELS,
  type ChangelogRelease,
  type RoadmapItem,
} from "@/lib/roadmap";

const REPO_URL = "https://github.com/nikatopu/dialogue-forge";

/* ─── Release card (past updates, in detail) ─────────────────────────── */

function ReleaseCard({
  release,
  isLatest,
  defaultOpen,
}: {
  release: ChangelogRelease;
  isLatest: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-mono text-[10px] font-medium bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground">
              {release.version}
            </span>
            {isLatest && (
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                Latest
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">{release.date}</span>
          </div>
          <h3 className="text-sm font-semibold">{release.title}</h3>
          {!open && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{release.summary}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-border/30 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{release.summary}</p>

          <div className="space-y-3.5">
            {release.sections.map((section) => (
              <div key={section.heading}>
                <h4 className="text-xs font-semibold mb-1.5">{section.heading}</h4>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed"
                    >
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {release.previousVersion && (
            <a
              href={`${REPO_URL}/compare/${release.previousVersion}...${release.version}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitBranch className="w-3 h-3" />
              Full changelog: {release.previousVersion}...{release.version}
            </a>
          )}
        </div>
      )}
    </article>
  );
}

/* ─── Roadmap row (what's next, title only) ──────────────────────────── */

function RoadmapRow({ item }: { item: RoadmapItem }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="font-mono text-[10px] text-muted-foreground w-9 shrink-0">
        {item.version}
      </span>
      <span className="text-sm flex-1 min-w-0 truncate">{item.title}</span>
      <span
        className={cn(
          "text-[10px] font-medium border rounded-full px-2 py-0.5 shrink-0",
          item.status === "future"
            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
            : "text-muted-foreground bg-muted/50 border-border/50",
        )}
      >
        {STATUS_LABELS[item.status]}
      </span>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────────── */

export function RoadmapContent() {
  const back = useBackDestination();

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-10 h-14 flex items-center gap-3 px-5 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Workflow className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold hidden sm:block">
            Dialogue Forge
          </span>
        </Link>
        <div className="w-px h-4 bg-border/60 hidden sm:block" />
        <Link
          href={back.href}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {back.label}
        </Link>

        {/* Right: feedback + GitHub */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="mailto:nikatopu@gmail.com?subject=Dialogue Forge Feedback"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/40 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Feedback</span>
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/40 cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:block">GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <motion.div
        className="max-w-3xl mx-auto px-5 pt-10 pb-6"
        variants={childVariant}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
            Product Roadmap
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Dialogue Forge Roadmap
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Every release so far, in detail, and a look at what&apos;s coming next.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto px-5 pb-16 space-y-10">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Release notes
          </h2>
          <div className="space-y-3">
            {CHANGELOG.map((release, i) => (
              <motion.div
                key={release.version}
                variants={childVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <ReleaseCard release={release} isLatest={i === 0} defaultOpen={i === 0} />
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            What&apos;s next
          </h2>
          <div className="rounded-xl border border-border/50 bg-card px-4 divide-y divide-border/30">
            {ROADMAP.map((item) => (
              <motion.div
                key={item.version}
                variants={childVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
              >
                <RoadmapRow item={item} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
