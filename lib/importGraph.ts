import type { SerialNode, SerialEdge, ProjectVariable, VariableType } from "@/types";
import { migrateProject } from "@/lib/migrations";

export interface ImportResult {
  ok: true;
  nodes: SerialNode[];
  edges: SerialEdge[];
  variables: ProjectVariable[];
  name?: string;
}

export interface ImportError {
  ok: false;
  error: string;
}

const KNOWN_TYPES = new Set<VariableType>(["number", "float", "boolean", "string", "list", "object"]);

function coerceDefaultValue(
  type: VariableType,
  raw: unknown
): ProjectVariable["defaultValue"] {
  switch (type) {
    case "number":
      return typeof raw === "number" ? raw : 0;
    case "float":
      return typeof raw === "number" ? raw : 0.0;
    case "boolean":
      return typeof raw === "boolean" ? raw : false;
    case "string":
      return typeof raw === "string" ? raw : "";
    case "list":
      return Array.isArray(raw) ? (raw as string[]).filter(i => typeof i === "string") : [];
    case "object":
      return typeof raw === "object" && raw !== null && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};
    default:
      return "";
  }
}

export function parseGraphJson(raw: string): ImportResult | ImportError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "File does not contain a valid project object." };
  }

  const obj = parsed as Record<string, unknown>;

  if (!("nodes" in obj) && !("graph" in obj)) {
    return {
      ok: false,
      error: "File does not appear to be a Dialogue Forge project.",
    };
  }

  const graphData = "nodes" in obj ? obj : (obj.graph as Record<string, unknown>);
  const name = typeof obj.name === "string" ? obj.name : undefined;

  // Extract top-level variables from the export (not inside graphData)
  const rawVariables = Array.isArray(obj.variables)
    ? (obj.variables as ProjectVariable[])
    : Array.isArray((graphData as Record<string, unknown>).variables)
    ? ((graphData as Record<string, unknown>).variables as ProjectVariable[])
    : [];

  const { graph } = migrateProject(graphData);

  // Prefer variables from migration result, fall back to raw extract
  const mergedVariables: ProjectVariable[] =
    Array.isArray(graph.variables) && graph.variables.length > 0
      ? graph.variables
      : rawVariables;

  // Validate and coerce each variable's type and defaultValue
  const variables: ProjectVariable[] = mergedVariables.map((v) => {
    const rawType = v.type as string;
    const safeType: VariableType = KNOWN_TYPES.has(rawType as VariableType)
      ? (rawType as VariableType)
      : "string";
    return {
      ...v,
      type: safeType,
      defaultValue: coerceDefaultValue(safeType, v.defaultValue),
    };
  });

  return {
    ok: true,
    nodes: graph.nodes,
    edges: graph.edges,
    variables,
    name,
  };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
