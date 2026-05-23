"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Zap,
  GitBranch,
  SkipForward,
  Square,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useValidationStore } from "@/store/useValidationStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useShallow } from "zustand/react/shallow";
import type { ActionFlowNode, ActionType } from "@/types";

const ACTION_CONFIG: Record<
  ActionType,
  { icon: LucideIcon; label: string; color: string; bg: string; border: string }
> = {
  trigger: {
    icon: Zap,
    label: "Trigger",
    color: "text-emerald-400",
    bg: "bg-emerald-500/12",
    border: "border-emerald-500/20",
  },
  branch: {
    icon: GitBranch,
    label: "Branch",
    color: "text-orange-400",
    bg: "bg-orange-500/12",
    border: "border-orange-500/20",
  },
  jump: {
    icon: SkipForward,
    label: "Jump",
    color: "text-sky-400",
    bg: "bg-sky-500/12",
    border: "border-sky-500/20",
  },
  end: {
    icon: Square,
    label: "End",
    color: "text-rose-400",
    bg: "bg-rose-500/12",
    border: "border-rose-500/20",
  },
  custom: {
    icon: Wrench,
    label: "Custom",
    color: "text-violet-400",
    bg: "bg-violet-500/12",
    border: "border-violet-500/20",
  },
};

function ActionNodeComponent({ id, data, selected }: NodeProps<ActionFlowNode>) {
  const cfg = ACTION_CONFIG[data.actionType] ?? ACTION_CONFIG.custom;
  const Icon = cfg.icon;
  const attrCount = (data.attributeSchema ?? []).length;
  const issueLevel = useValidationStore((s) => s.nodeLevels[id] ?? null);
  const branchEdges = useGraphStore(
    useShallow((s) =>
      data.actionType === "branch" ? s.edges.filter((e) => e.source === id) : []
    )
  );

  return (
    <div
      className={cn(
        "w-45 rounded-xl border bg-card shadow-md",
        "transition-all duration-150 select-none",
        selected
          ? "border-primary shadow-[0_0_0_2px_oklch(0.585_0.233_260/20%)]"
          : issueLevel === "error"
          ? "border-rose-500/60 hover:border-rose-500/80"
          : issueLevel === "warning"
          ? "border-amber-500/60 hover:border-amber-500/80"
          : "border-border hover:shadow-lg hover:border-border/80"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5! h-2.5! -top-1.25!"
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              cfg.bg,
              "border",
              cfg.border
            )}
          >
            <Icon className={cn("w-4 h-4", cfg.color)} />
          </div>
          {issueLevel && (
            <div
              className={cn(
                "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-card",
                issueLevel === "error" ? "bg-rose-400" : "bg-amber-400"
              )}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate">
            {data.label || "Action"}
          </p>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] h-4 px-1.5 mt-0.5 font-medium border",
              cfg.color,
              cfg.bg,
              cfg.border
            )}
          >
            {cfg.label}
          </Badge>
        </div>
      </div>

      {/* Trigger execution mode badge */}
      {data.actionType === "trigger" && data.executionMode && (
        <div className="px-3 pb-2 -mt-0.5">
          <span
            className={cn(
              "text-[9px] font-medium px-1.5 py-0.5 rounded border",
              data.executionMode === "immediate"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : data.executionMode === "beforeNext"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  : "bg-violet-500/10 text-violet-400 border-violet-500/20"
            )}
          >
            {data.executionMode === "immediate"
              ? "Immediate"
              : data.executionMode === "beforeNext"
                ? "Before Next"
                : "After Next"}
          </span>
        </div>
      )}

      {/* Branch options */}
      {data.actionType === "branch" && branchEdges.length > 0 && (
        <div className="px-3 pb-2.5 border-t border-border/30 pt-2 space-y-1">
          {branchEdges.map((edge, i) => (
            <div key={edge.id} className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0 w-3">
                {i + 1}
              </span>
              <span className="text-[10px] text-foreground/70 truncate leading-tight">
                {edge.data?.optionText || (
                  <span className="italic text-muted-foreground/35">unlabelled</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Attributes */}
      {attrCount > 0 && (
        <div className={cn("px-3 pb-2.5 pt-2", data.actionType !== "branch" || branchEdges.length === 0 ? "border-t border-border/30" : "")}>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            {attrCount} attribute{attrCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5! h-2.5! -bottom-1.25!"
      />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
