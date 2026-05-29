"use client";

import { Flag, User, GitBranch, Zap, SkipForward, Square } from "lucide-react";
import { BottomSheet } from "@/components/atoms/BottomSheet";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import type { ForgeNodeType, ActionType } from "@/types";
import style from "./MobileNodeSheet.module.scss";

interface NodeOption {
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  nodeType: ForgeNodeType;
  actionType?: ActionType;
}

const NODE_OPTIONS: NodeOption[] = [
  { label: "Start",     description: "Entry point for a dialogue flow",  icon: Flag,      iconColor: "oklch(0.68 0.15 180)", iconBg: "oklch(0.5 0.15 180 / 15%)",  borderColor: "oklch(0.5 0.15 180 / 25%)", nodeType: "start" },
  { label: "Character", description: "A line of spoken dialogue",         icon: User,      iconColor: "oklch(0.65 0.19 260)", iconBg: "oklch(0.52 0.255 262 / 15%)", borderColor: "oklch(0.52 0.255 262 / 25%)", nodeType: "character" },
  { label: "Branch",    description: "Present choices to the player",     icon: GitBranch, iconColor: "oklch(0.72 0.18 50)",  iconBg: "oklch(0.52 0.18 50 / 15%)",  borderColor: "oklch(0.52 0.18 50 / 25%)", nodeType: "action", actionType: "branch" },
  { label: "Trigger",   description: "Fire a game event",                 icon: Zap,       iconColor: "oklch(0.72 0.18 155)", iconBg: "oklch(0.52 0.18 155 / 15%)", borderColor: "oklch(0.52 0.18 155 / 25%)", nodeType: "action", actionType: "trigger" },
  { label: "Jump",      description: "Redirect flow to another node",     icon: SkipForward,iconColor: "oklch(0.68 0.18 220)", iconBg: "oklch(0.52 0.18 220 / 15%)", borderColor: "oklch(0.52 0.18 220 / 25%)", nodeType: "action", actionType: "jump" },
  { label: "End",       description: "Terminate this dialogue path",      icon: Square,    iconColor: "oklch(0.72 0.22 355)", iconBg: "oklch(0.52 0.22 355 / 15%)", borderColor: "oklch(0.52 0.22 355 / 25%)", nodeType: "action", actionType: "end" },
];

export function MobileNodeSheet() {
  const { nodeSheetOpen, setNodeSheetOpen, setSelectedNodeId } = useEditorStore();
  const { addNode, nodes } = useGraphStore();

  function handleAdd(opt: NodeOption) {
    const offset = nodes.length * 28;
    const id = addNode(
      opt.nodeType,
      { x: 80 + offset, y: 80 + offset },
      opt.actionType ? { actionType: opt.actionType, label: `New ${opt.label}` } : undefined,
    );
    setSelectedNodeId(id);
    setNodeSheetOpen(false);
  }

  return (
    <BottomSheet open={nodeSheetOpen} onClose={() => setNodeSheetOpen(false)} title="Add Node">
      <div className={style.grid}>
        {NODE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button key={opt.label} type="button" onClick={() => handleAdd(opt)} className={style.nodeBtn}>
              <div
                className={style.nodeIconWrap}
                style={{ backgroundColor: opt.iconBg, borderColor: opt.borderColor }}
              >
                <Icon size={18} style={{ color: opt.iconColor }} />
              </div>
              <div className={style.nodeInfo}>
                <p className={style.nodeName}>{opt.label}</p>
                <p className={style.nodeDesc}>{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
