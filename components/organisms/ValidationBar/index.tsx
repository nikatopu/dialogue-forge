"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, ChevronUp, CheckCircle2, X } from "lucide-react";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { useValidationStore } from "@/store/useValidationStore";
import { useEditorStore } from "@/store/useEditorStore";
import cn from "classnames";
import type { IssueLevel, ValidationIssue } from "@/lib/validate";
import style from "./ValidationBar.module.scss";

const LEVEL_CONFIG: Record<IssueLevel, { icon: React.ElementType; colorClass: string; label: string }> = {
  error:   { icon: AlertCircle,   colorClass: style.colorError,   label: "Error" },
  warning: { icon: AlertTriangle, colorClass: style.colorWarning, label: "Warning" },
  info:    { icon: Info,          colorClass: style.colorInfo,    label: "Info" },
};

export function ValidationBar() {
  const [open, setOpen] = useState(false);
  const { issues } = useValidationStore();
  const { setSelectedNodeId } = useEditorStore();

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");
  const hasIssues = issues.length > 0;
  const dominantLevel: IssueLevel | null = errors.length ? "error" : warnings.length ? "warning" : infos.length ? "info" : null;

  return (
    <div className={style.container}>
      <AnimatePresence>
        {open && hasIssues && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 192 }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className={style.issueList}
          >
            <ScrollArea className={style.issueScroll}>
              <div className={style.issuePad}>
                {issues.map((issue) => {
                  const cfg = LEVEL_CONFIG[issue.level];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => issue.nodeId && setSelectedNodeId(issue.nodeId)}
                      className={style.issueItem}
                    >
                      <Icon size={14} className={cn(style.issueLevelTag, cfg.colorClass)} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
                      <div className={style.issueContent}>
                        <p className={style.issueMessage}>{issue.message}</p>
                      </div>
                      <span className={cn(style.issueLevelTag, cfg.colorClass)}>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={style.bar}>
        <button type="button" onClick={() => setOpen((o) => !o)} disabled={!hasIssues} className={style.toggleBtn}>
          {dominantLevel ? (() => {
            const Icon = LEVEL_CONFIG[dominantLevel].icon;
            return <Icon size={12} className={LEVEL_CONFIG[dominantLevel].colorClass} />;
          })() : <CheckCircle2 size={12} className={style.colorOk} />}

          {hasIssues ? (
            <span>
              {errors.length > 0 && <span className={style.colorError}>{errors.length} error{errors.length !== 1 ? "s" : ""}</span>}
              {errors.length > 0 && warnings.length > 0 && <span className={style.dot}>·</span>}
              {warnings.length > 0 && <span className={style.colorWarning}>{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>}
              {(errors.length > 0 || warnings.length > 0) && infos.length > 0 && <span className={style.dot}>·</span>}
              {infos.length > 0 && <span className={style.colorInfo}>{infos.length} info</span>}
            </span>
          ) : (
            <span className={style.colorOk}>No issues</span>
          )}

          {hasIssues && <ChevronUp className={cn(style.chevron, open && style.chevronOpen)} />}
        </button>

        {open && (
          <button type="button" onClick={() => setOpen(false)} className={style.dismissBtn}>
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
