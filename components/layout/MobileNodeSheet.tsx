"use client";

import {
  Flag,
  User,
  GitBranch,
  Zap,
  SkipForward,
  Square,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { cn } from "@/lib/utils";
import type { ForgeNodeType, ActionType } from "@/types";

interface NodeOption {
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  nodeType: ForgeNodeType;
  actionType?: ActionType;
}

const NODE_OPTIONS: NodeOption[] = [
  {
    label: "Start",
    description: "Entry point for a dialogue flow",
    icon: Flag,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/15 border-teal-500/25",
    nodeType: "start",
  },
  {
    label: "Character",
    description: "A line of spoken dialogue",
    icon: User,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15 border-indigo-500/25",
    nodeType: "character",
  },
  {
    label: "Branch",
    description: "Present choices to the player",
    icon: GitBranch,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/15 border-orange-500/25",
    nodeType: "action",
    actionType: "branch",
  },
  {
    label: "Trigger",
    description: "Fire a game event",
    icon: Zap,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/25",
    nodeType: "action",
    actionType: "trigger",
  },
  {
    label: "Jump",
    description: "Redirect flow to another node",
    icon: SkipForward,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/15 border-sky-500/25",
    nodeType: "action",
    actionType: "jump",
  },
  {
    label: "End",
    description: "Terminate this dialogue path",
    icon: Square,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/15 border-rose-500/25",
    nodeType: "action",
    actionType: "end",
  },
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
    <BottomSheet
      open={nodeSheetOpen}
      onClose={() => setNodeSheetOpen(false)}
      title="Add Node"
    >
      <div className="p-3 grid grid-cols-2 gap-2 pb-8">
        {NODE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleAdd(opt)}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border border-border/60",
                "hover:bg-muted/40 active:scale-[0.97] transition-all duration-100",
                "text-left"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                  opt.iconBg,
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", opt.iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
