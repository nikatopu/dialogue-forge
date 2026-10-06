"use client";

import { GripVertical, Plus } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import type { NodeTemplate } from "../sidebarConfig";
import style from "./NodeTypeCard.module.scss";

export function NodeTypeCard({ node }: { node: NodeTemplate }) {
  const Icon = node.icon;
  const setPendingNodeAdd = useEditorStore((s) => s.setPendingNodeAdd);

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/forge-node-type", node.type);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div draggable onDragStart={onDragStart} data-node-type={node.type} className={style.nodeCard}>
      <div className={style.nodeIconWrap} style={node.iconBg}>
        <Icon size={16} style={node.iconColor} />
      </div>
      <div className={style.nodeInfo}>
        <p className={style.nodeName}>{node.label}</p>
        <p className={style.nodeDesc}>{node.description}</p>
      </div>
      <button
        type="button"
        draggable={false}
        onClick={() => setPendingNodeAdd(node.type)}
        className={style.addBtn}
        aria-label={`Add ${node.label} node`}
        title={`Add ${node.label} node to canvas`}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
      <GripVertical className={style.gripIcon} />
    </div>
  );
}
