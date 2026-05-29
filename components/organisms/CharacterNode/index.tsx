"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { User, MessageSquare, ChevronDown } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { useValidationStore } from "@/store/useValidationStore";
import cn from "classnames";
import type { CharacterFlowNode } from "@/types";
import style from "./CharacterNode.module.scss";

const EMOTION_COLORS: Record<string, string> = {
  happy:     "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  sad:       "text-blue-400 bg-blue-400/10 border-blue-400/20",
  angry:     "text-red-400 bg-red-400/10 border-red-400/20",
  surprised: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  neutral:   "text-muted-foreground bg-muted/50 border-border",
};

function CharacterNodeComponent({ id, data, selected }: NodeProps<CharacterFlowNode>) {
  const [expanded, setExpanded] = useState(false);
  const attrCount = (data.attributeSchema ?? []).length;
  const issueLevel = useValidationStore((s) => s.nodeLevels[id] ?? null);
  const emotionClass = data.emotion ? (EMOTION_COLORS[data.emotion.toLowerCase()] ?? EMOTION_COLORS.neutral) : null;

  return (
    <div
      className={cn(
        style.node,
        selected && style.nodeSelected,
        !selected && issueLevel === "error" && style.nodeError,
        !selected && issueLevel === "warning" && style.nodeWarning,
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2.5! h-2.5! -top-1.25!" />

      <div className={style.header}>
        <div className={style.portrait}>
          <div className={style.portraitCircle}>
            {data.portrait
              ? <img src={data.portrait} alt={data.name} className={style.portraitImg} />
              : <User size={16} style={{ color: "oklch(0.65 0.19 260)" }} />
            }
          </div>
          <div className={cn(
            style.statusDot,
            issueLevel === "error" ? style.statusDotError : issueLevel === "warning" ? style.statusDotWarning : style.statusDotOk,
          )} />
        </div>
        <div className={style.meta}>
          <p className={style.name}>{data.name || "Unnamed"}</p>
          <span className={style.typeLabel}>Character</span>
        </div>
      </div>

      <div className={style.dialogue} onClick={() => setExpanded((e) => !e)}>
        <div className={style.dialogueInner}>
          <MessageSquare size={12} style={{ color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)", marginTop: "0.125rem", flexShrink: 0 }} />
          <p className={cn(style.dialogueText, !expanded && style.dialogueClamp)}>
            {data.dialogue ? data.dialogue : <span style={{ fontStyle: "italic", opacity: 0.4 }}>No dialogue set…</span>}
          </p>
          {data.dialogue && data.dialogue.length > 80 && (
            <ChevronDown className={cn(style.expandIcon, expanded && style.expandIconOpen)} />
          )}
        </div>
      </div>

      <div className={style.footer}>
        {data.emotion && emotionClass
          ? <Badge variant="outline" className={cn("text-[9px] font-medium border", emotionClass)} style={{ height: "1rem", padding: "0 0.375rem" }}>{data.emotion}</Badge>
          : <span style={{ fontSize: "0.625rem", color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)", fontStyle: "italic" }}>no emotion</span>
        }
        {attrCount > 0 && <span className={style.attrCount}>{attrCount} attr</span>}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2.5! h-2.5! -bottom-1.25!" />
    </div>
  );
}

export const CharacterNode = memo(CharacterNodeComponent);
