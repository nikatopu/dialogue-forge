import type { ForgeNode, DialogueEdge, SerialNode, SerialEdge } from "@/types";

export interface GraphExport {
  version: 1;
  name: string;
  exportedAt: string;
  nodes: SerialNode[];
  edges: SerialEdge[];
}

export function serializeGraph(
  nodes: ForgeNode[],
  edges: DialogueEdge[],
  name = "Untitled Project"
): GraphExport {
  return {
    version: 1,
    name,
    exportedAt: new Date().toISOString(),
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
      data: data ?? { optionText: "", conditions: {}, metadata: {} },
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
