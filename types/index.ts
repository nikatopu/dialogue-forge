import { type Node, type Edge } from "@xyflow/react";

/* ─── Primitive enums ─────────────────────────────────── */

/** Colour palette. Each one ships in both `ThemeMode` variants. */
export type Theme = "default" | "ocean" | "forest" | "midnight" | "rose" | "cyber";

/** Light/dark axis, independent of the colour palette. */
export type ThemeMode = "dark" | "light";

export type ForgeNodeType = "character" | "action" | "start";

export type ActionType = "trigger" | "branch" | "jump" | "end" | "custom" | "setVariable";

/* ─── Variable system ─────────────────────────────────── */

export type VariableType = "number" | "float" | "boolean" | "string" | "list" | "object";

export interface ProjectVariable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: number | boolean | string | string[] | Record<string, unknown>;
  description?: string;
}

export type ConditionOperator =
  // number / float
  | "==" | "!=" | ">" | ">=" | "<" | "<="
  | "between" | "notBetween"
  // string
  | "contains" | "notContains" | "startsWith" | "endsWith"
  | "isEmpty" | "isNotEmpty"
  // boolean
  | "isTrue" | "isFalse"
  // list
  | "listContains" | "listNotContains" | "listIsEmpty" | "listIsNotEmpty"
  | "lengthEquals" | "lengthGreater" | "lengthLess"
  // object
  | "hasProperty" | "notHasProperty" | "propertyEquals";

export interface Condition {
  variableId: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  value2?: number; // upper bound for "between" / "notBetween"
}

export type RuntimeState = Record<string, number | boolean | string | string[] | Record<string, unknown>>;

export type ConditionLogic = "AND" | "OR";

export interface ConditionGroup {
  logic: ConditionLogic;
  conditions: (Condition | ConditionGroup)[];
}

export type VariableOperation = "set" | "add" | "subtract" | "multiply" | "divide" | "toggle";

export interface VariableAction {
  variableId: string;
  operation: VariableOperation;
  value?: string | number | boolean;
}

/**
 * When a trigger fires relative to the node it is attached to.
 * A trigger has exactly one job: emit `event` (plus `params`) at this moment.
 */
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
  /** Trigger-specific — the custom event name emitted to the host runtime */
  event?: string;
  /** Trigger-specific — flat string payload passed alongside the event */
  params?: Record<string, string>;
  /** Trigger-specific — when the event fires */
  executionMode?: TriggerExecutionMode;
  /** setVariable-specific */
  variableAction?: VariableAction;
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
  conditionGroup?: ConditionGroup | null;
  metadata: Record<string, unknown>;
}

export type DialogueEdge = Edge<DialogueEdgeData>;

/* ─── Serialisable snapshot ───────────────────────────── */

export interface GraphSnapshot {
  version?: string;
  nodes: SerialNode[];
  edges: SerialEdge[];
  variables?: ProjectVariable[];
  metadata?: Record<string, unknown>;
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

/* ─── Project / Cloud types ───────────────────────────── */

export type ProjectMode = "local" | "cloud";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export interface CloudProject {
  id: string;
  userId: string;
  name: string;
  graph: { version?: string; nodes: SerialNode[]; edges: SerialEdge[]; metadata?: Record<string, unknown> };
  /** Node count for list views — always accurate, even when `graph` is a placeholder (see projectService.list). */
  nodeCount: number;
  previewImage: string | null;
  mode: ProjectMode;
  isTemplate: boolean;
  theme: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  avatarUrl: string | null;
  fullName: string | null;
  provider: string | null;
}

/* ─── Template metadata (extended) ───────────────────── */

export type TemplateDifficulty = "beginner" | "intermediate" | "advanced";
