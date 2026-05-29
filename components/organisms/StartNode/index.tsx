"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Flag } from "lucide-react";
import { useValidationStore } from "@/store/useValidationStore";
import cn from "classnames";
import type { StartFlowNode } from "@/types";
import style from "./StartNode.module.scss";

function StartNodeComponent({ id, data, selected }: NodeProps<StartFlowNode>) {
  const issueLevel = useValidationStore((s) => s.nodeLevels[id] ?? null);

  return (
    <div className={cn(
      style.node,
      selected && style.nodeSelected,
      !selected && issueLevel === "error" && style.nodeError,
      !selected && issueLevel === "warning" && style.nodeWarning,
    )}>
      <div className={style.header}>
        <div className={style.iconBox}>
          <Flag size={14} style={{ color: "oklch(0.68 0.15 180)" }} />
        </div>
        <div>
          <p className={style.typeLabel}>Start</p>
        </div>
        {issueLevel && (
          <div className={cn(style.issueDot, issueLevel === "error" ? style.issueDotError : style.issueDotWarning)} />
        )}
      </div>

      <div className={style.body}>
        <p className={style.name}>
          {data.name || <span style={{ fontStyle: "italic", color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)" }}>Unnamed</span>}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2.5! h-2.5! -bottom-1.25!" />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);
