"use client";

import { SkipForward, Crosshair } from "lucide-react";
import cn from "classnames";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useShallow } from "zustand/react/shallow";
import type { ForgeNode, CharacterNodeData, ActionNodeData } from "@/types";
import fields from "../../fields.module.scss";
import style from "./JumpTargetSection.module.scss";

export function JumpTargetSection({ nodeId }: { nodeId: string }) {
  const outEdge = useGraphStore(useShallow((s) => s.edges.find((e) => e.source === nodeId) ?? null));
  const nodes = useGraphStore(useShallow((s) => s.nodes));
  const { setJumpTarget } = useGraphStore();
  const { pickingJumpFor, setPickingJumpFor } = useEditorStore();
  const isPicking = pickingJumpFor === nodeId;

  function nodeName(n: ForgeNode): string {
    return n.type === "character" ? (n.data as CharacterNodeData).name || "Unnamed" : (n.data as ActionNodeData).label || "Action";
  }

  const candidates = nodes.filter((n) => n.id !== nodeId);

  return (
    <div className={fields.field}>
      <div className={fields.sectionHeader}>
        <div className={fields.sectionHeaderLeft}>
          <SkipForward size={12} className={style.jumpIcon} />
          <p className={fields.fieldLabel}>Jump To</p>
        </div>
        <button
          type="button"
          onClick={() => setPickingJumpFor(isPicking ? null : nodeId)}
          title={isPicking ? "Cancel picking" : "Click a node on the canvas to pick"}
          className={cn(style.pickBtn, isPicking && style.pickBtnActive)}
        >
          <Crosshair size={10} />
          {isPicking ? "Cancel" : "Pick"}
        </button>
      </div>
      <select value={outEdge?.target ?? ""} onChange={(e) => setJumpTarget(nodeId, e.target.value || null)} aria-label="Jump target node" className={fields.select}>
        <option value="">— none —</option>
        {candidates.map((n) => <option key={n.id} value={n.id}>{nodeName(n)}</option>)}
      </select>
      {!outEdge && !isPicking && <p className={fields.emptyNote}>Pick a target node or draw an edge on the canvas.</p>}
    </div>
  );
}
