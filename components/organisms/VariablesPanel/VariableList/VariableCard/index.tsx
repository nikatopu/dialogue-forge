"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, AlertCircle, X } from "lucide-react";
import cn from "classnames";
import { TypeBadge } from "@/components/atoms/TypeBadge";
import { computeVariableUsage } from "@/lib/variableUsage";
import type { ProjectVariable, ForgeNode, DialogueEdge } from "@/types";
import { TYPE_CONFIG } from "../../variableTypes";
import { computeDialogueCount } from "../../editorState";
import style from "./VariableCard.module.scss";

type VariableCardProps = {
  variable: ProjectVariable;
  nodes: ForgeNode[];
  edges: DialogueEdge[];
  isDeleting: boolean;
  onEdit: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

function formatDefault(v: ProjectVariable): string {
  if (v.type === "list") return `[${(v.defaultValue as string[]).join(", ")}]`;
  if (v.type === "object") return JSON.stringify(v.defaultValue);
  return String(v.defaultValue);
}

export function VariableCard({
  variable: v,
  nodes,
  edges,
  isDeleting,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: VariableCardProps) {
  const usage = computeVariableUsage(v.id, nodes, edges);
  const dialogueCount = computeDialogueCount(v.name, nodes);
  const cfg = TYPE_CONFIG[v.type];
  const Icon = cfg.icon;
  const totalUsage = usage.conditionCount + usage.actionCount + dialogueCount;

  const usageParts: string[] = [];
  if (dialogueCount > 0) usageParts.push(`${dialogueCount} dialogue`);
  if (usage.conditionCount > 0) usageParts.push(`${usage.conditionCount} condition${usage.conditionCount !== 1 ? "s" : ""}`);
  if (usage.actionCount > 0) usageParts.push(`${usage.actionCount} action${usage.actionCount !== 1 ? "s" : ""}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className={cn(style.card, isDeleting && style.cardDeleting)}
    >
      <div className={style.left}>
        <div
          className={style.typeIcon}
          style={{ color: cfg.color, backgroundColor: `color-mix(in oklch, ${cfg.color} 10%, transparent)` }}
        >
          <Icon size={12} />
        </div>
        <div className={style.info}>
          <p className={style.name}>{v.name}</p>
          <div className={style.metaRow}>
            <TypeBadge type={v.type} />
            <span className={style.metaSep}>·</span>
            <span className={style.meta}>
              default: <code className={style.default}>{formatDefault(v)}</code>
            </span>
          </div>
          {v.description && <p className={style.desc}>{v.description}</p>}
          {totalUsage > 0 && <p className={style.usage}>{usageParts.join(" · ")}</p>}
          {isDeleting && totalUsage > 0 && (
            <p className={style.deleteWarning}>
              Used in{dialogueCount > 0 ? ` ${dialogueCount} dialogue node${dialogueCount !== 1 ? "s" : ""},` : ""}
              {usage.conditionCount > 0 ? ` ${usage.conditionCount} condition${usage.conditionCount !== 1 ? "s" : ""},` : ""}
              {usage.actionCount > 0 ? ` ${usage.actionCount} action${usage.actionCount !== 1 ? "s" : ""}` : ""}
              .
            </p>
          )}
        </div>
      </div>
      <div className={style.actions}>
        {isDeleting ? (
          <>
            <button type="button" onClick={onConfirmDelete} className={cn(style.iconBtn, style.iconBtnDestructive)} title="Confirm delete">
              <AlertCircle size={13} />
            </button>
            <button type="button" onClick={onCancelDelete} className={style.iconBtn} title="Cancel">
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onEdit} className={style.iconBtn} title="Edit">
              <Pencil size={13} />
            </button>
            <button type="button" onClick={onRequestDelete} className={cn(style.iconBtn, style.iconBtnDestructiveHover)} title="Delete">
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
