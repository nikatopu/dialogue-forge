"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap, GitBranch, SkipForward, Square, Wrench, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { useValidationStore } from "@/store/useValidationStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useShallow } from "zustand/react/shallow";
import cn from "classnames";
import type { ActionFlowNode, ActionType } from "@/types";
import style from "./ActionNode.module.scss";

const ACTION_CONFIG: Record<ActionType, { icon: LucideIcon; label: string; color: string; bg: string; border: string }> = {
  trigger: { icon: Zap,        label: "Trigger", color: "oklch(0.72 0.18 155)", bg: "oklch(0.52 0.18 155 / 12%)", border: "oklch(0.52 0.18 155 / 20%)" },
  branch:  { icon: GitBranch,  label: "Branch",  color: "oklch(0.72 0.18 50)",  bg: "oklch(0.52 0.18 50 / 12%)",  border: "oklch(0.52 0.18 50 / 20%)" },
  jump:    { icon: SkipForward,label: "Jump",    color: "oklch(0.68 0.18 220)", bg: "oklch(0.52 0.18 220 / 12%)", border: "oklch(0.52 0.18 220 / 20%)" },
  end:     { icon: Square,     label: "End",     color: "oklch(0.72 0.22 355)", bg: "oklch(0.52 0.22 355 / 12%)", border: "oklch(0.52 0.22 355 / 20%)" },
  custom:  { icon: Wrench,     label: "Custom",  color: "oklch(0.65 0.19 290)", bg: "oklch(0.52 0.19 290 / 12%)", border: "oklch(0.52 0.19 290 / 20%)" },
};

const EXEC_COLORS = {
  immediate:  { bg: "oklch(0.52 0.18 85 / 10%)", color: "oklch(0.72 0.18 85)", border: "oklch(0.52 0.18 85 / 20%)" },
  beforeNext: { bg: "oklch(0.52 0.18 220 / 10%)", color: "oklch(0.68 0.18 220)", border: "oklch(0.52 0.18 220 / 20%)" },
  afterNext:  { bg: "oklch(0.52 0.19 290 / 10%)", color: "oklch(0.65 0.19 290)", border: "oklch(0.52 0.19 290 / 20%)" },
};

function ActionNodeComponent({ id, data, selected }: NodeProps<ActionFlowNode>) {
  const cfg = ACTION_CONFIG[data.actionType] ?? ACTION_CONFIG.custom;
  const Icon = cfg.icon;
  const attrCount = (data.attributeSchema ?? []).length;
  const issueLevel = useValidationStore((s) => s.nodeLevels[id] ?? null);
  const branchEdges = useGraphStore(
    useShallow((s) => data.actionType === "branch" ? s.edges.filter((e) => e.source === id) : []),
  );

  return (
    <div className={cn(style.node, selected && style.nodeSelected, !selected && issueLevel === "error" && style.nodeError, !selected && issueLevel === "warning" && style.nodeWarning)}>
      <Handle type="target" position={Position.Top} className="w-2.5! h-2.5! -top-1.25!" />

      <div className={style.header}>
        <div className={style.iconWrap}>
          <div className={style.iconBox} style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
            <Icon size={16} style={{ color: cfg.color }} />
          </div>
          {issueLevel && (
            <div className={cn(style.issueDot, issueLevel === "error" ? style.issueDotError : style.issueDotWarning)} />
          )}
        </div>
        <div className={style.meta}>
          <p className={style.label}>{data.label || "Action"}</p>
          <Badge variant="outline" className="text-[9px] font-medium border mt-0.5" style={{ height: "1rem", padding: "0 0.375rem", color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}>
            {cfg.label}
          </Badge>
        </div>
      </div>

      {data.actionType === "trigger" && data.executionMode && (() => {
        const execColor = EXEC_COLORS[data.executionMode] ?? EXEC_COLORS.immediate;
        return (
          <div className={style.execBadge}>
            <span className={style.execTag} style={{ backgroundColor: execColor.bg, color: execColor.color, borderColor: execColor.border }}>
              {data.executionMode === "immediate" ? "Immediate" : data.executionMode === "beforeNext" ? "Before Next" : "After Next"}
            </span>
          </div>
        );
      })()}

      {data.actionType === "branch" && branchEdges.length > 0 && (
        <div className={style.branches}>
          {branchEdges.map((edge, i) => (
            <div key={edge.id} className={style.branchItem}>
              <span className={style.branchNum}>{i + 1}</span>
              <span className={style.branchText}>
                {edge.data?.optionText || <span style={{ fontStyle: "italic", opacity: 0.35 }}>unlabelled</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {attrCount > 0 && (
        <div className={cn(style.attrSection, (data.actionType !== "branch" || branchEdges.length === 0) ? "" : "")}>
          <span className={style.attrCount}>{attrCount} attribute{attrCount !== 1 ? "s" : ""}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-2.5! h-2.5! -bottom-1.25!" />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
