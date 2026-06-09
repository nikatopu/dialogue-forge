"use client";

import { ArrowRight, Trash2, GitMerge } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Separator } from "@/components/atoms/Separator";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { ConditionBuilder } from "@/components/organisms/ConditionBuilder";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useShallow } from "zustand/react/shallow";
import type { CharacterNodeData, ActionNodeData, ConditionGroup } from "@/types";
import style from "./EdgeInspector.module.scss";

interface EdgeInspectorProps {
  edgeId: string;
}

export function EdgeInspector({ edgeId }: EdgeInspectorProps) {
  const { nodes, edges, updateEdgeLabel, updateEdgeConditions, removeEdge } = useGraphStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      updateEdgeLabel: s.updateEdgeLabel,
      updateEdgeConditions: s.updateEdgeConditions,
      removeEdge: s.removeEdge,
    })),
  );
  const { setSelectedEdgeId } = useEditorStore();

  const edge = edges.find((e) => e.id === edgeId);
  if (!edge) return null;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  function nodeLabel(nodeId: string): string {
    const n = nodes.find((x) => x.id === nodeId);
    if (!n) return "Unknown";
    if (n.type === "character") return (n.data as CharacterNodeData).name || "Unnamed";
    if (n.type === "start") return "Start";
    return (n.data as ActionNodeData).label || "Action";
  }

  function handleDelete() {
    removeEdge(edgeId);
    setSelectedEdgeId(null);
  }

  function handleConditionChange(group: ConditionGroup | null) {
    updateEdgeConditions(edgeId, group);
  }

  const hasCondition = !!edge.data?.conditionGroup;

  return (
    <div className={style.container}>
      {/* Identity strip */}
      <div className={style.strip}>
        <div className={style.stripIcon}>
          <ArrowRight size={13} style={{ color: "oklch(0.65 0.19 260)" }} />
        </div>
        <div className={style.stripMeta}>
          <p className={style.stripName}>
            {sourceNode ? nodeLabel(edge.source) : "?"}
            <span className={style.stripArrow}>→</span>
            {targetNode ? nodeLabel(edge.target) : "?"}
          </p>
          <p className={style.stripType}>Dialogue edge</p>
        </div>
        <div className={style.stripActions}>
          <Button
            variant="ghost"
            size="icon-sm"
            style={{ width: "1.5rem", height: "1.5rem", color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)" }}
            onClick={handleDelete}
            title="Delete edge"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      <ScrollArea style={{ flex: 1 }}>
        <div className={style.body}>
          {/* Option text */}
          <div className={style.field}>
            <p className={style.fieldLabel}>Option Text</p>
            <input
              value={edge.data?.optionText ?? ""}
              onChange={(e) => updateEdgeLabel(edgeId, e.target.value)}
              placeholder="Choice label shown to player…"
              className={style.textInput}
            />
            <p className={style.fieldHint}>
              Shown as a dialogue choice. Leave blank for automatic continuation.
            </p>
          </div>

          <Separator style={{ opacity: 0.4 }} />

          {/* Condition builder */}
          <div className={style.field}>
            <div className={style.condHeader}>
              <div className={style.condHeaderLeft}>
                <GitMerge size={12} style={{ color: hasCondition ? "var(--primary)" : "var(--muted-foreground)" }} />
                <p className={style.fieldLabel} style={{ color: hasCondition ? "var(--foreground)" : undefined }}>
                  Conditions
                </p>
                {hasCondition && (
                  <span className={style.condBadge}>active</span>
                )}
              </div>
            </div>
            <p className={style.fieldHint} style={{ marginBottom: "0.5rem" }}>
              This branch only appears when all conditions are met.
            </p>
            <ConditionBuilder
              value={edge.data?.conditionGroup ?? null}
              onChange={handleConditionChange}
            />
          </div>

          <Separator style={{ opacity: 0.4 }} />

          {/* Meta */}
          <div className={style.field}>
            <p className={style.fieldLabel}>Edge ID</p>
            <p className={style.metaBox}>{edgeId}</p>
          </div>
          <div className={style.field}>
            <p className={style.fieldLabel}>Source → Target</p>
            <p className={style.metaBox}>{edge.source} → {edge.target}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
