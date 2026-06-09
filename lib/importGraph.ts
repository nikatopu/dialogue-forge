import type { SerialNode, SerialEdge, ProjectVariable } from "@/types";
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
  const variables: ProjectVariable[] =
    Array.isArray(graph.variables) && graph.variables.length > 0
      ? graph.variables
      : rawVariables;

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
