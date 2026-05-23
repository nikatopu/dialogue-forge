"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useValidationStore } from "@/store/useValidationStore";
import type { StartFlowNode } from "@/types";

function StartNodeComponent({ id, data, selected }: NodeProps<StartFlowNode>) {
  const issueLevel = useValidationStore((s) => s.nodeLevels[id] ?? null);

  return (
    <div
      className={cn(
        "w-48 rounded-xl border bg-card shadow-md",
        "transition-all duration-150 select-none",
        selected
          ? "border-teal-400 shadow-[0_0_0_2px_oklch(0.7_0.15_180/20%)]"
          : issueLevel === "error"
          ? "border-rose-500/60 hover:border-rose-500/80"
          : issueLevel === "warning"
          ? "border-amber-500/60 hover:border-amber-500/80"
          : "border-teal-500/40 hover:border-teal-500/60 hover:shadow-lg"
      )}
    >
      {/* Header band */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-teal-500/8 rounded-t-xl border-b border-teal-500/20">
        <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
          <Flag className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-teal-400/80">
            Start
          </p>
        </div>
        {issueLevel && (
          <div
            className={cn(
              "ml-auto w-2 h-2 rounded-full border-2 border-card",
              issueLevel === "error" ? "bg-rose-400" : "bg-amber-400"
            )}
          />
        )}
      </div>

      {/* Name */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground/90 truncate">
          {data.name || <span className="italic text-muted-foreground/50">Unnamed</span>}
        </p>
      </div>

      {/* Only source handle — no incoming edges allowed */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5! h-2.5! -bottom-1.25!"
      />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);
