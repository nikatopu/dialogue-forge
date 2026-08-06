"use client";

import { User, Flag, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData } from "@/types";
import { ACTION_STRIP } from "../nodeInspectorConfig";
import style from "./NodeStrip.module.scss";

type NodeStripProps = {
  node: ForgeNode;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function NodeStrip({ node, onDuplicate, onDelete }: NodeStripProps) {
  const isStart = node.type === "start";
  const isCharacter = node.type === "character";
  const data = node.data as CharacterNodeData | ActionNodeData | StartNodeData;
  const actionCfg = !isStart && !isCharacter ? (ACTION_STRIP[(data as ActionNodeData).actionType] ?? ACTION_STRIP.custom) : null;

  const glow = isStart ? "oklch(0.5 0.15 180 / 5%)" : isCharacter ? "oklch(0.52 0.255 262 / 5%)" : actionCfg!.glow;
  const iconBg = isStart ? "oklch(0.5 0.15 180 / 15%)" : isCharacter ? "oklch(0.52 0.255 262 / 15%)" : actionCfg!.bg;
  const iconBorder = isStart ? "oklch(0.5 0.15 180 / 25%)" : isCharacter ? "oklch(0.52 0.255 262 / 25%)" : actionCfg!.border;
  const iconColor = isStart ? "oklch(0.68 0.15 180)" : isCharacter ? "oklch(0.65 0.19 260)" : actionCfg!.color;
  const label = isStart ? (data as StartNodeData).name || "Entry Point" : isCharacter ? (data as CharacterNodeData).name || "Unnamed" : (data as ActionNodeData).label || "Action";
  const typeLabel = isStart ? "Start node" : isCharacter ? "Character node" : `${actionCfg!.label} node`;
  const Icon = isStart ? Flag : isCharacter ? User : actionCfg!.icon;

  return (
    <div className={style.strip} style={{ background: `linear-gradient(to right, ${glow}, transparent)` }}>
      <div className={style.stripIcon} style={{ backgroundColor: iconBg, borderColor: iconBorder }}>
        <Icon size={14} style={{ color: iconColor }} />
      </div>
      <div className={style.stripMeta}>
        <p className={style.stripName}>{label}</p>
        <p className={style.stripType}>{typeLabel}</p>
      </div>
      <div className={style.stripActions}>
        <Button variant="ghost" size="icon-sm" className={style.stripBtn} onClick={onDuplicate} aria-label="Duplicate node">
          <Copy size={12} />
        </Button>
        <Button variant="ghost" size="icon-sm" className={style.stripBtn} onClick={onDelete} aria-label="Delete node">
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}
