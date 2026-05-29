import type { SerialNode, SerialEdge } from "@/types";
import { migrateProject } from "@/lib/migrations";

export interface ImportResult {
  ok: true;
  nodes: SerialNode[];
  edges: SerialEdge[];
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

  // Accept any version — the migration pipeline handles everything
  if (!("nodes" in obj) && !("graph" in obj)) {
    return {
      ok: false,
      error: "File does not appear to be a Dialogue Forge project.",
    };
  }

  // Support both flat { version, nodes, edges } and nested { graph: { nodes, edges } }
  const graphData = "nodes" in obj ? obj : (obj.graph as Record<string, unknown>);
  const name =
    typeof obj.name === "string" ? obj.name : undefined;

  const { graph } = migrateProject(graphData);

  return {
    ok: true,
    nodes: graph.nodes,
    edges: graph.edges,
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
