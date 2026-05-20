"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronUp,
  CheckCircle2,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useValidationStore } from "@/store/useValidationStore";
import { useEditorStore } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";
import type { IssueLevel, ValidationIssue } from "@/lib/validate";

const LEVEL_CONFIG: Record<
  IssueLevel,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  error: {
    icon: AlertCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    label: "Error",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
  info: {
    icon: Info,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    label: "Info",
  },
};

export function ValidationBar() {
  const [open, setOpen] = useState(false);
  const { issues } = useValidationStore();
  const { setSelectedNodeId } = useEditorStore();

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");
  const hasIssues = issues.length > 0;

  const dominantLevel: IssueLevel | null = errors.length
    ? "error"
    : warnings.length
    ? "warning"
    : infos.length
    ? "info"
    : null;

  function handleIssueClick(issue: ValidationIssue) {
    if (issue.nodeId) {
      setSelectedNodeId(issue.nodeId);
    }
  }

  return (
    <div className="shrink-0 border-t border-border/50 bg-card/60 backdrop-blur-sm">
      {/* Expanded issue list */}
      <AnimatePresence>
        {open && hasIssues && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 192 }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="overflow-hidden border-b border-border/40"
          >
            <ScrollArea className="h-48">
              <div className="p-2 space-y-0.5">
                {issues.map((issue) => {
                  const cfg = LEVEL_CONFIG[issue.level];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => handleIssueClick(issue)}
                      className={cn(
                        "w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left",
                        "transition-colors hover:bg-muted/40",
                        issue.nodeId && "cursor-pointer"
                      )}
                    >
                      <Icon
                        className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", cfg.color)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          {issue.message}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-semibold uppercase tracking-wider shrink-0 mt-0.5",
                          cfg.color
                        )}
                      >
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="h-7 flex items-center px-3 gap-3">
        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={!hasIssues}
          className={cn(
            "flex items-center gap-1.5 text-[11px] transition-colors",
            "disabled:opacity-40 disabled:cursor-default",
            hasIssues
              ? "hover:text-foreground text-muted-foreground"
              : "text-muted-foreground"
          )}
        >
          {dominantLevel ? (
            (() => {
              const Icon = LEVEL_CONFIG[dominantLevel].icon;
              return (
                <Icon
                  className={cn(
                    "w-3 h-3",
                    LEVEL_CONFIG[dominantLevel].color
                  )}
                />
              );
            })()
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          )}

          {hasIssues ? (
            <span>
              {errors.length > 0 && (
                <span className="text-rose-400">{errors.length} error{errors.length !== 1 ? "s" : ""}</span>
              )}
              {errors.length > 0 && warnings.length > 0 && <span className="opacity-40 mx-1">·</span>}
              {warnings.length > 0 && (
                <span className="text-amber-400">{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>
              )}
              {(errors.length > 0 || warnings.length > 0) && infos.length > 0 && <span className="opacity-40 mx-1">·</span>}
              {infos.length > 0 && (
                <span className="text-sky-400">{infos.length} info</span>
              )}
            </span>
          ) : (
            <span className="text-emerald-400">No issues</span>
          )}

          {hasIssues && (
            <ChevronUp
              className={cn(
                "w-3 h-3 transition-transform",
                open && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Dismiss expanded panel */}
        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto p-0.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
