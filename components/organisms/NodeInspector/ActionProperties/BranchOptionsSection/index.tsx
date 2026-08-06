"use client";

import { GitBranch, X } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";
import { useShallow } from "zustand/react/shallow";
import type { CharacterNodeData, ActionNodeData } from "@/types";
import { InlineInput } from "../../InlineInput";
import fields from "../../fields.module.scss";
import style from "./BranchOptionsSection.module.scss";

export function BranchOptionsSection({ nodeId }: { nodeId: string }) {
  const edges = useGraphStore(useShallow((s) => s.edges.filter((e) => e.source === nodeId)));
  const nodes = useGraphStore(useShallow((s) => s.nodes));
  const { updateEdgeLabel, removeEdge } = useGraphStore();

  function targetName(targetId: string): string {
    const n = nodes.find((x) => x.id === targetId);
    if (!n) return "Unknown";
    return n.type === "character" ? (n.data as CharacterNodeData).name || "Unnamed" : (n.data as ActionNodeData).label || "Action";
  }

  return (
    <div className={fields.field}>
      <div className={fields.sectionHeaderLeft}>
        <GitBranch size={12} className={style.branchIcon} />
        <p className={fields.fieldLabel}>Branch Options</p>
      </div>
      {edges.length === 0
        ? <p className={fields.emptyNote}>Draw edges from this node to add branch options.</p>
        : edges.map((edge, i) => (
          <div key={edge.id} className={style.branchEdge}>
            <div className={style.branchEdgeHeader}>
              <span className={style.branchNum}>Option {i + 1}</span>
              <div className={style.branchTarget}>
                <span className={style.branchTargetName} title={targetName(edge.target)}>→ {targetName(edge.target)}</span>
                <button type="button" onClick={() => removeEdge(edge.id)} title="Remove this branch option" className={style.removeEdgeBtn}><X size={12} /></button>
              </div>
            </div>
            <InlineInput value={edge.data?.optionText ?? ""} placeholder={`Choice ${i + 1} text…`} onCommit={(v) => updateEdgeLabel(edge.id, v)} />
          </div>
        ))
      }
    </div>
  );
}
