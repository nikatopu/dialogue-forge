import type {
  ForgeNode, DialogueEdge, TriggerExecutionMode,
  ProjectVariable, RuntimeState, VariableType, ConditionGroup,
} from "@/types";

export type Phase = "entry" | "setup" | "playing";
export interface PreviewHistory { nodeId: string; choiceText?: string; }

/** Triggers are a single node kind, so they carry a single accent. */
export const TRIGGER_ACCENT = {
  color: "var(--accent-green)",
  bg: "oklch(0.52 0.18 155 / 10%)",
  border: "oklch(0.52 0.18 155 / 25%)",
} as const;

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
