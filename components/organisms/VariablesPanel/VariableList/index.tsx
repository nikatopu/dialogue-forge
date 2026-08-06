"use client";

import type { ProjectVariable, ForgeNode, DialogueEdge } from "@/types";
import { VariableCard } from "./VariableCard";
import style from "./VariableList.module.scss";

type VariableListProps = {
  variables: ProjectVariable[];
  nodes: ForgeNode[];
  edges: DialogueEdge[];
  deleteConfirmId: string | null;
  onEdit: (variable: ProjectVariable) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
};

export function VariableList({
  variables,
  nodes,
  edges,
  deleteConfirmId,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: VariableListProps) {
  return (
    <div className={style.list}>
      {variables.map((v) => (
        <VariableCard
          key={v.id}
          variable={v}
          nodes={nodes}
          edges={edges}
          isDeleting={deleteConfirmId === v.id}
          onEdit={() => onEdit(v)}
          onRequestDelete={() => onRequestDelete(v.id)}
          onConfirmDelete={() => onConfirmDelete(v.id)}
          onCancelDelete={onCancelDelete}
        />
      ))}
    </div>
  );
}
