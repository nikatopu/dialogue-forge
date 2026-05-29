import type { VersionedGraph } from "@/types/migrations";

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGraph(graph: VersionedGraph): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(graph.nodes)) {
    errors.push("Graph is missing nodes array");
    return { isValid: false, errors, warnings };
  }
  if (!Array.isArray(graph.edges)) {
    errors.push("Graph is missing edges array");
    return { isValid: false, errors, warnings };
  }

  const nodeIds = new Set<string>();

  for (const node of graph.nodes) {
    if (!node.id) {
      errors.push("Node found without id after repair — this should not happen");
      continue;
    }
    if (nodeIds.has(node.id)) {
      warnings.push(`Duplicate node id: ${node.id}`);
      continue;
    }
    nodeIds.add(node.id);

    if (!node.position || typeof node.position.x !== "number" || typeof node.position.y !== "number") {
      warnings.push(`Node ${node.id} has invalid position`);
    }
    if (!node.data) {
      warnings.push(`Node ${node.id} has no data`);
    }
  }

  const edgeIds = new Set<string>();

  for (const edge of graph.edges) {
    if (!edge.id) {
      warnings.push("Edge found without id");
      continue;
    }
    if (edgeIds.has(edge.id)) {
      warnings.push(`Duplicate edge id: ${edge.id}`);
      continue;
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      warnings.push(`Edge ${edge.id}: source "${edge.source}" not found in nodes`);
    }
    if (!nodeIds.has(edge.target)) {
      warnings.push(`Edge ${edge.id}: target "${edge.target}" not found in nodes`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
