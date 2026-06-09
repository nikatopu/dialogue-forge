"use client";

import { memo, useState, useRef, useCallback } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { GitMerge } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import cn from "classnames";
import type { DialogueEdge as DialogueEdgeType } from "@/types";
import style from "./DialogueEdge.module.scss";

function DialogueEdgeComponent({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected,
}: EdgeProps<DialogueEdgeType>) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateEdgeLabel } = useGraphStore();
  const { selectedEdgeId, setSelectedEdgeId, setSelectedNodeId } = useEditorStore();

  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const active = selected || hovered || selectedEdgeId === id;
  const hasCondition = !!(data?.conditionGroup);

  const startEdit = useCallback(() => {
    setDraft(data?.optionText ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [data?.optionText]);

  const commitEdit = useCallback(() => {
    updateEdgeLabel(id, draft.trim());
    setEditing(false);
  }, [id, draft, updateEdgeLabel]);

  const handleClick = useCallback(() => {
    setSelectedEdgeId(selectedEdgeId === id ? null : id);
    setSelectedNodeId(null);
  }, [id, selectedEdgeId, setSelectedEdgeId, setSelectedNodeId]);

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        onDoubleClick={startEdit}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: active
            ? "oklch(0.585 0.233 260)"
            : hasCondition
            ? "oklch(0.65 0.19 290 / 60%)"
            : "oklch(1 0 0 / 25%)",
          strokeWidth: active ? 2 : 1.5,
          transition: "stroke 0.15s, stroke-width 0.15s",
          strokeDasharray: hasCondition && !active ? "4 3" : undefined,
        }}
      />
      {(data?.optionText || active || hasCondition) && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: "all" }}
            className="absolute nodrag nopan"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
                aria-label="Edge option text"
                className={style.labelInput}
              />
            ) : (
              <div className={style.labelWrap} onClick={handleClick}>
                <button
                  type="button"
                  onDoubleClick={startEdit}
                  title="Double-click to edit"
                  className={cn(style.labelBtn, active ? style.labelBtnActive : style.labelBtnIdle, !data?.optionText && style.labelBtnEmpty)}
                >
                  {data?.optionText || <span style={{ fontStyle: "italic", opacity: 0.5 }}>add label…</span>}
                </button>
                {hasCondition && (
                  <span className={cn(style.condBadge, active && style.condBadgeActive)} title="Has conditions">
                    <GitMerge size={8} />
                  </span>
                )}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const DialogueEdge = memo(DialogueEdgeComponent);
