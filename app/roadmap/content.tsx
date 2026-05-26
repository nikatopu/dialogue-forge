"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Workflow,
  CheckCircle2,
  Clock,
  Circle,
  Sparkles,
  ChevronDown,
  MessageSquare,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROADMAP,
  STATUS_COLUMNS,
  STATUS_LABELS,
  type RoadmapEntry,
  type RoadmapStatus,
} from "@/lib/roadmap";

/* ─── Status config ─────────────────────────────────────── */

const STATUS_STYLE: Record<
  RoadmapStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    chip: string;
    col: string;
    dot: string;
  }
> = {
  completed: {
    icon: CheckCircle2,
    chip: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    col: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    icon: Clock,
    chip: "text-primary bg-primary/10 border-primary/20",
    col: "border-primary/30",
    dot: "bg-primary",
  },
  planned: {
    icon: Circle,
    chip: "text-muted-foreground bg-muted/50 border-border/50",
    col: "border-border/40",
    dot: "bg-muted-foreground/40",
  },
  future: {
    icon: Sparkles,
    chip: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    col: "border-amber-500/20",
    dot: "bg-amber-500",
  },
};

/* ─── Entry card ─────────────────────────────────────────── */

function EntryCard({ entry }: { entry: RoadmapEntry }) {
  const style = STATUS_STYLE[entry.status];
  const Icon = style.icon;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] font-medium bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground">
            {entry.version}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium border rounded-full px-2 py-0.5",
              style.chip,
            )}
          >
            <Icon className="w-2.5 h-2.5" />
            {STATUS_LABELS[entry.status]}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">{entry.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {entry.description}
        </p>
      </div>

      {entry.status === "in-progress" && entry.progress !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Progress</span>
            <span className="text-[10px] font-medium tabular-nums text-primary">
              {entry.progress}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/70 transition-all"
              style={{ width: `${entry.progress}%` }}
            />
          </div>
        </div>
      )}

      <ul className="space-y-1">
        {entry.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-1.5 text-xs text-muted-foreground/80"
          >
            <span
              className={cn("w-1 h-1 rounded-full shrink-0 mt-1.5", style.dot)}
            />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Accordion item (mobile) ────────────────────────────── */

function AccordionEntry({ entry }: { entry: RoadmapEntry }) {
  const [open, setOpen] = useState(entry.status === "in-progress");
  const style = STATUS_STYLE[entry.status];
  const Icon = style.icon;

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full shrink-0",
              entry.status === "completed"
                ? "bg-emerald-500/15"
                : entry.status === "in-progress"
                  ? "bg-primary/15"
                  : entry.status === "future"
                    ? "bg-amber-500/15"
                    : "bg-muted/40",
            )}
          >
            <Icon
              className={cn(
                "w-3 h-3",
                entry.status === "completed"
                  ? "text-emerald-400"
                  : entry.status === "in-progress"
                    ? "text-primary"
                    : entry.status === "future"
                      ? "text-amber-400"
                      : "text-muted-foreground",
              )}
            />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">
                {entry.version}
              </span>
              <span className="text-sm font-medium truncate">
                {entry.title}
              </span>
            </div>
            {!open && (
              <p className="text-xs text-muted-foreground truncate">
                {entry.description}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground leading-relaxed pt-3">
            {entry.description}
          </p>

          {entry.status === "in-progress" && entry.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Progress
                </span>
                <span className="text-[10px] font-medium tabular-nums text-primary">
                  {entry.progress}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${entry.progress}%` }}
                />
              </div>
            </div>
          )}

          <ul className="space-y-1.5">
            {entry.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className={cn(
                    "w-1 h-1 rounded-full shrink-0 mt-1.5",
                    style.dot,
                  )}
                />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Column header (desktop Kanban) ─────────────────────── */

function ColumnHeader({
  status,
  count,
}: {
  status: RoadmapStatus;
  count: number;
}) {
  const style = STATUS_STYLE[status];
  const Icon = style.icon;

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "w-3.5 h-3.5",
            status === "completed"
              ? "text-emerald-400"
              : status === "in-progress"
                ? "text-primary"
                : status === "future"
                  ? "text-amber-400"
                  : "text-muted-foreground",
          )}
        />
        <span className="text-xs font-semibold tracking-wide">
          {STATUS_LABELS[status]}
        </span>
      </div>
      <span className="text-[10px] font-medium tabular-nums bg-muted/50 border border-border/40 rounded-full px-1.5 py-0.5 text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────────── */

export function RoadmapContent() {
  const byStatus = Object.fromEntries(
    STATUS_COLUMNS.map((s) => [s, ROADMAP.filter((e) => e.status === s)]),
  ) as Record<RoadmapStatus, RoadmapEntry[]>;

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
          href="/"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to editor
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
            href="https://github.com/nikatopu/dialogue-forge"
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
      <div className="max-w-6xl mx-auto px-5 pt-10 pb-6">
        <div className="mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
            Product Roadmap
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Dialogue Forge Roadmap
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Where we&apos;ve been, where we&apos;re going. Track shipped features
          and upcoming work.
        </p>
      </div>

      {/* ── Desktop: Kanban ── */}
      <div className="hidden md:block max-w-6xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((status) => (
            <div key={status}>
              <ColumnHeader status={status} count={byStatus[status].length} />
              <div className="space-y-3">
                {byStatus[status].map((entry) => (
                  <EntryCard key={entry.version} entry={entry} />
                ))}
                {byStatus[status].length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/30 p-4 text-xs text-muted-foreground/50 text-center">
                    Nothing here yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: Accordion ── */}
      <div className="md:hidden max-w-xl mx-auto px-4 pb-16 space-y-6">
        {STATUS_COLUMNS.map((status) => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const Icon = STATUS_STYLE[status].icon;
                return (
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5",
                      status === "completed"
                        ? "text-emerald-400"
                        : status === "in-progress"
                          ? "text-primary"
                          : status === "future"
                            ? "text-amber-400"
                            : "text-muted-foreground",
                    )}
                  />
                );
              })()}
              <span className="text-xs font-semibold tracking-wide">
                {STATUS_LABELS[status]}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                ({byStatus[status].length})
              </span>
            </div>
            <div className="space-y-2">
              {byStatus[status].map((entry) => (
                <AccordionEntry key={entry.version} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
