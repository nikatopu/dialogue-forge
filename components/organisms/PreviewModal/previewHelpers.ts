import type { ElementType } from "react";
import { Swords, Hash, Music, Clapperboard, Monitor, Wrench } from "lucide-react";
import type {
  ForgeNode, DialogueEdge, TriggerCategory, TriggerExecutionMode,
  ProjectVariable, RuntimeState, VariableType, ConditionGroup,
} from "@/types";

export type Phase = "entry" | "setup" | "playing";
export interface PreviewHistory { nodeId: string; choiceText?: string; }

export const CATEGORY_CONFIG: Record<TriggerCategory, { icon: ElementType; color: string; bg: string; border: string }> = {
  game:      { icon: Swords,       color: "oklch(0.72 0.18 155)", bg: "oklch(0.52 0.18 155 / 10%)", border: "oklch(0.52 0.18 155 / 25%)" },
  variable:  { icon: Hash,         color: "oklch(0.65 0.19 290)", bg: "oklch(0.52 0.19 290 / 10%)", border: "oklch(0.52 0.19 290 / 25%)" },
  audio:     { icon: Music,        color: "oklch(0.68 0.18 220)", bg: "oklch(0.52 0.18 220 / 10%)", border: "oklch(0.52 0.18 220 / 25%)" },
  animation: { icon: Clapperboard, color: "oklch(0.72 0.18 50)",  bg: "oklch(0.52 0.18 50 / 10%)",  border: "oklch(0.52 0.18 50 / 25%)" },
  ui:        { icon: Monitor,      color: "oklch(0.65 0.19 260)", bg: "oklch(0.52 0.255 262 / 10%)", border: "oklch(0.52 0.255 262 / 25%)" },
  custom:    { icon: Wrench,       color: "var(--muted-foreground)", bg: "color-mix(in oklch, var(--muted) 30%, transparent)", border: "color-mix(in oklch, var(--border) 50%, transparent)" },
};

export const EXECUTION_LABELS: Record<TriggerExecutionMode, string> = {
  immediate: "Immediate", beforeNext: "Before Next", afterNext: "After Next",
};

export function findStartNodes(nodes: ForgeNode[]): ForgeNode[] {
  return nodes.filter((n) => n.type === "start");
}

export function findFallbackRoot(nodes: ForgeNode[], edges: DialogueEdge[]): ForgeNode | null {
  if (nodes.length === 0) return null;
  const hasIncoming = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasIncoming.has(n.id));
  return roots[0] ?? nodes[0];
}

export function formatVariableValue(value: RuntimeState[string], type: VariableType): string {
  if (type === "list") {
    const arr = Array.isArray(value) ? value : [];
    return `${arr.length} ${arr.length === 1 ? "item" : "items"}`;
  }
  if (type === "object") {
    const obj = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
    const count = Object.keys(obj).length;
    return `${count} ${count === 1 ? "key" : "keys"}`;
  }
  return String(value ?? "");
}

export function formatConditionGroup(group: ConditionGroup, variables: ProjectVariable[]): string {
  const parts = group.conditions.map((c) => {
    if ("logic" in c) return `(${formatConditionGroup(c, variables)})`;
    const v = variables.find((vv) => vv.id === c.variableId);
    const name = v?.name ?? c.variableId;
    const opMap: Record<string, string> = { "==": "=", "!=": "≠", ">": ">", ">=": "≥", "<": "<", "<=": "≤", contains: "contains", startsWith: "starts with", endsWith: "ends with" };
    return `${name} ${opMap[c.operator] ?? c.operator} ${String(c.value)}`;
  });
  return parts.join(group.logic === "AND" ? " and " : " or ");
}

export function formatOpSymbol(op: string): string {
  switch (op) {
    case "set":      return "=";
    case "add":      return "+=";
    case "subtract": return "-=";
    case "multiply": return "*=";
    case "divide":   return "/=";
    case "toggle":   return "=";
    default:         return op;
  }
}
