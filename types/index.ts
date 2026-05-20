import { type Node, type Edge } from "@xyflow/react";

/* ─── Primitive enums ─────────────────────────────────── */

export type Theme = "dark" | "light";

export type ForgeNodeType = "character" | "action";

export type ActionType = "trigger" | "branch" | "jump" | "end" | "custom";

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

export interface CharacterNodeData {
  name: string;
  portrait?: string;
  dialogue: string;
  emotion?: string;
  /** Per-node attribute schema (definitions) */
  attributeSchema: AttributeDefinition[];
  /** Actual attribute values keyed by AttributeDefinition.id */
  attributes: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ActionNodeData {
  actionType: ActionType;
  label: string;
  attributeSchema: AttributeDefinition[];
  attributes: Record<string, unknown>;
  [key: string]: unknown;
}

/* ─── Typed React Flow nodes ──────────────────────────── */

export type CharacterFlowNode = Node<CharacterNodeData, "character">;
export type ActionFlowNode = Node<ActionNodeData, "action">;
export type ForgeNode = CharacterFlowNode | ActionFlowNode;

/* Shared shape that both node types satisfy */
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
  data: CharacterNodeData | ActionNodeData;
}

export interface SerialEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data: DialogueEdgeData;
}
