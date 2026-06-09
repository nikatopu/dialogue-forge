import type { ForgeNode, DialogueEdge, SerialNode, SerialEdge, ProjectVariable } from "@/types";
import { CURRENT_VERSION } from "@/lib/migrations";

export interface GraphExport {
  version: string;
  name: string;
  exportedAt: string;
  variables: ProjectVariable[];
  nodes: SerialNode[];
  edges: SerialEdge[];
}

export function serializeGraph(
  nodes: ForgeNode[],
  edges: DialogueEdge[],
  name = "Untitled Project",
  variables: ProjectVariable[] = [],
): GraphExport {
  return {
    version: CURRENT_VERSION,
    name,
    exportedAt: new Date().toISOString(),
    variables,
    nodes: nodes.map(({ id, type, position, data }) => ({
      id,
      type: type as "character" | "action" | "start",
      position,
      data,
    })),
    edges: edges.map(({ id, source, target, type, data }) => ({
      id,
      source,
      target,
      type: type ?? "dialogue",
      data: data ?? { optionText: "", conditions: {}, conditionGroup: null, metadata: {} },
    })),
  };
}

export function downloadJson(payload: GraphExport, filename?: string) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `${slugify(payload.name)}.forge.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "project";
}
