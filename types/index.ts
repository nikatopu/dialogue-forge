import { type Node, type Edge } from "@xyflow/react";

/* ─── Primitive enums ─────────────────────────────────── */

export type Theme = "dark" | "light";

export type ForgeNodeType = "character" | "action" | "start";

export type ActionType = "trigger" | "branch" | "jump" | "end" | "custom";

export type TriggerCategory =
  | "game"
  | "variable"
  | "audio"
  | "animation"
  | "ui"
  | "custom";

export type TriggerExecutionMode = "immediate" | "beforeNext" | "afterNext";

export type AttributeType =
  | "text"
  | "number"
  | "boolean"
  | "dropdown"
  | "color"
  | "list"
  | "object";

/* ─── Attribute schema ────────────────────────────────── */

export interface AttributeDefinition {
  id: string;
  name: string;
  type: AttributeType;
  /** Only for type === "dropdown" */
  options?: string[];
  defaultValue?: unknown;
}

/* ─── Node data payloads ──────────────────────────────── */

export interface StartNodeData {
  name: string;
  [key: string]: unknown;
}

export interface CharacterNodeData {
  name: string;
  portrait?: string;
  dialogue: string;
  emotion?: string;
  attributeSchema: AttributeDefinition[];
  attributes: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ActionNodeData {
  actionType: ActionType;
  label: string;
  jumpTarget?: string;
  /** Trigger-specific */
  category?: TriggerCategory;
  event?: string;
  params?: Record<string, string>;
  executionMode?: TriggerExecutionMode;
  attributeSchema: AttributeDefinition[];
  attributes: Record<string, unknown>;
  [key: string]: unknown;
}

/* ─── Typed React Flow nodes ──────────────────────────── */

export type CharacterFlowNode = Node<CharacterNodeData, "character">;
export type ActionFlowNode = Node<ActionNodeData, "action">;
export type StartFlowNode = Node<StartNodeData, "start">;
export type ForgeNode = CharacterFlowNode | ActionFlowNode | StartFlowNode;

export interface ForgeNodeDataBase {
  attributeSchema: AttributeDefinition[];
  attributes: Record<string, unknown>;
}

/* ─── Edge data ───────────────────────────────────────── */

export interface DialogueEdgeData extends Record<string, unknown> {
  optionText: string;
  conditions: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export type DialogueEdge = Edge<DialogueEdgeData>;

/* ─── Serialisable snapshot ───────────────────────────── */

export interface GraphSnapshot {
  nodes: SerialNode[];
  edges: SerialEdge[];
}

export interface SerialNode {
  id: string;
  type: ForgeNodeType;
  position: { x: number; y: number };
  data: CharacterNodeData | ActionNodeData | StartNodeData;
}

export interface SerialEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data: DialogueEdgeData;
}

/* ─── Trigger event catalogue ─────────────────────────── */

export const TRIGGER_EVENTS: Record<TriggerCategory, string[]> = {
  game: ["QuestStarted", "QuestCompleted", "EnemyKilled", "CutsceneStart"],
  variable: ["SetVariable", "AddGold", "TrustIncrease"],
  audio: ["PlayMusic", "StopMusic", "PlaySFX"],
  animation: ["Idle", "Attack", "Wave", "Sit"],
  ui: ["OpenInventory", "ShowShop", "TutorialPopup", "ShowEscape"],
  custom: [],
};
