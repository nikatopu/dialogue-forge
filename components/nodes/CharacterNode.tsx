"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { User, MessageSquare, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useValidationStore } from "@/store/useValidationStore";
import type { CharacterFlowNode } from "@/types";

const EMOTION_COLORS: Record<string, string> = {
  happy: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  sad: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  angry: "text-red-400 bg-red-400/10 border-red-400/20",
  surprised: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  neutral: "text-muted-foreground bg-muted/50 border-border",
};

function CharacterNodeComponent({ id, data, selected }: NodeProps<CharacterFlowNode>) {
  const [expanded, setExpanded] = useState(false);
  const attrCount = (data.attributeSchema ?? []).length;
  const issueLevel = useValidationStore((s) => s.nodeLevels[id] ?? null);
  const emotionClass = data.emotion
    ? (EMOTION_COLORS[data.emotion.toLowerCase()] ?? EMOTION_COLORS.neutral)
    : null;

  return (
    <div
      className={cn(
        "w-55 rounded-xl border bg-card shadow-md",
        "transition-all duration-150 select-none",
        selected
          ? "border-primary shadow-[0_0_0_2px_oklch(0.585_0.233_260/20%)]"
          : issueLevel === "error"
          ? "border-rose-500/60 hover:border-rose-500/80"
          : issueLevel === "warning"
          ? "border-amber-500/60 hover:border-amber-500/80"
          : "border-border hover:border-border/80 hover:shadow-lg"
      )}
    >
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5! h-2.5! -top-1.25!"
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/50">
        {/* Portrait */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              "bg-indigo-500/12 border border-indigo-500/25"
            )}
          >
            {data.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.portrait}
                alt={data.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          {/* Status indicator */}
          <div
            className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card",
              issueLevel === "error"
                ? "bg-rose-400"
                : issueLevel === "warning"
                ? "bg-amber-400"
                : "bg-indigo-400"
            )}
          />
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">
            {data.name || "Unnamed"}
          </p>
          <span className="text-[10px] font-medium text-indigo-400/80 uppercase tracking-wider">
            Character
          </span>
        </div>
      </div>

      {/* Dialogue */}
      <div
        className={cn(
          "px-3 py-2.5 border-b border-border/30",
          "cursor-pointer"
        )}
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-1.5">
          <MessageSquare className="w-3 h-3 text-muted-foreground/50 mt-0.5 shrink-0" />
          <p
            className={cn(
              "text-[11px] text-muted-foreground leading-relaxed flex-1",
              !expanded && "line-clamp-2"
            )}
          >
            {data.dialogue ? (
              data.dialogue
            ) : (
              <span className="italic opacity-40">No dialogue set…</span>
            )}
          </p>
          {data.dialogue && data.dialogue.length > 80 && (
            <ChevronDown
              className={cn(
                "w-3 h-3 text-muted-foreground/40 shrink-0 mt-0.5 transition-transform",
                expanded && "rotate-180"
              )}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2">
        {data.emotion && emotionClass ? (
          <Badge
            variant="outline"
            className={cn("text-[9px] h-4 px-1.5 font-medium border", emotionClass)}
          >
            {data.emotion}
          </Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground/30 italic">
            no emotion
          </span>
        )}

        {attrCount > 0 && (
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            {attrCount} attr
          </span>
        )}
      </div>

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5! h-2.5! -bottom-1.25!"
      />
    </div>
  );
}

export const CharacterNode = memo(CharacterNodeComponent);
