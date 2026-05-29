import type { SerialNode, SerialEdge, TriggerCategory, TriggerExecutionMode } from "@/types";
import type { VersionedGraph, MigrationReport } from "@/types/migrations";

const VALID_TRIGGER_CATEGORIES = new Set<string>([
  "game", "variable", "audio", "animation", "ui", "custom",
]);
const VALID_EXECUTION_MODES = new Set<string>([
  "immediate", "beforeNext", "afterNext",
]);

const VALID_NODE_TYPES = ["character", "action", "start"] as const;
const VALID_ACTION_TYPES = ["trigger", "branch", "jump", "end", "custom"] as const;

export function repairGraph(
  graph: VersionedGraph,
  report: MigrationReport,
): VersionedGraph {
  const localRepairs: string[] = [];
  const nodeIds = new Set<string>();
  const repairedNodes: SerialNode[] = [];
  let removedNodes = 0;

  for (const node of graph.nodes) {
    if (!node.id) {
      localRepairs.push("Removed node with missing id");
      removedNodes++;
      continue;
    }
    if (!node.type || !VALID_NODE_TYPES.includes(node.type as never)) {
      localRepairs.push(`Removed node ${node.id}: unrecognized type "${node.type}"`);
      removedNodes++;
      continue;
    }

    const repairedNode: SerialNode = {
      id: node.id,
      type: node.type as SerialNode["type"],
      position: isValidPosition(node.position)
        ? node.position
        : { x: 0, y: 0 },
      data: repairNodeData(node, localRepairs),
    };

    if (!isValidPosition(node.position)) {
      localRepairs.push(`Repaired node ${node.id}: missing position`);
    }

    nodeIds.add(node.id);
    repairedNodes.push(repairedNode);
  }

  const repairedEdges: SerialEdge[] = [];
  const seenEdgeIds = new Set<string>();
  let removedEdges = 0;

  for (const edge of graph.edges) {
    if (!edge.id || seenEdgeIds.has(edge.id)) {
      localRepairs.push(`Removed edge with duplicate or missing id`);
      removedEdges++;
      continue;
    }
    if (!edge.source || !edge.target) {
      localRepairs.push(`Removed edge ${edge.id}: missing source or target`);
      removedEdges++;
      continue;
    }
    if (!nodeIds.has(edge.source)) {
      localRepairs.push(`Removed edge ${edge.id}: source "${edge.source}" not found`);
      removedEdges++;
      continue;
    }
    if (!nodeIds.has(edge.target)) {
      localRepairs.push(`Removed edge ${edge.id}: target "${edge.target}" not found`);
      removedEdges++;
      continue;
    }

    const d = (edge.data ?? {}) as Record<string, unknown>;
    seenEdgeIds.add(edge.id);
    repairedEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: typeof edge.type === "string" ? edge.type : "dialogue",
      data: {
        optionText: typeof d.optionText === "string" ? d.optionText : "",
        conditions:
          d.conditions && typeof d.conditions === "object"
            ? (d.conditions as Record<string, unknown>)
            : {},
        metadata:
          d.metadata && typeof d.metadata === "object"
            ? (d.metadata as Record<string, unknown>)
            : {},
      },
    });
  }

  report.repairs.push(...localRepairs);
  report.removedNodes += removedNodes;
  report.removedEdges += removedEdges;

  return { ...graph, nodes: repairedNodes, edges: repairedEdges };
}

function isValidPosition(p: unknown): p is { x: number; y: number } {
  if (!p || typeof p !== "object") return false;
  const pos = p as Record<string, unknown>;
  return typeof pos.x === "number" && typeof pos.y === "number";
}

function repairNodeData(node: SerialNode, repairs: string[]): SerialNode["data"] {
  const d = (node.data ?? {}) as Record<string, unknown>;

  if (node.type === "character") {
    if (!d.name) repairs.push(`Repaired character node ${node.id}: missing name`);
    return {
      name: typeof d.name === "string" ? d.name : "",
      dialogue: typeof d.dialogue === "string" ? d.dialogue : "",
      emotion: typeof d.emotion === "string" ? d.emotion : undefined,
      portrait: typeof d.portrait === "string" ? d.portrait : undefined,
      attributeSchema: Array.isArray(d.attributeSchema) ? d.attributeSchema : [],
      attributes:
        d.attributes && typeof d.attributes === "object"
          ? (d.attributes as Record<string, unknown>)
          : {},
    };
  }

  if (node.type === "action") {
    const validActionType =
      typeof d.actionType === "string" && VALID_ACTION_TYPES.includes(d.actionType as never);
    if (!validActionType) {
      repairs.push(`Repaired action node ${node.id}: invalid actionType, defaulted to "custom"`);
    }
    const actionType = validActionType
      ? (d.actionType as "trigger" | "branch" | "jump" | "end" | "custom")
      : "custom";
    return {
      actionType,
      label: typeof d.label === "string" ? d.label : "",
      jumpTarget: typeof d.jumpTarget === "string" ? d.jumpTarget : undefined,
      category:
        typeof d.category === "string" && VALID_TRIGGER_CATEGORIES.has(d.category)
          ? (d.category as TriggerCategory)
          : undefined,
      event: typeof d.event === "string" ? d.event : undefined,
      params:
        d.params && typeof d.params === "object"
          ? (d.params as Record<string, string>)
          : undefined,
      executionMode:
        typeof d.executionMode === "string" && VALID_EXECUTION_MODES.has(d.executionMode)
          ? (d.executionMode as TriggerExecutionMode)
          : undefined,
      attributeSchema: Array.isArray(d.attributeSchema) ? d.attributeSchema : [],
      attributes:
        d.attributes && typeof d.attributes === "object"
          ? (d.attributes as Record<string, unknown>)
          : {},
    };
  }

  if (node.type === "start") {
    return {
      name: typeof d.name === "string" ? d.name : "",
    };
  }

  return node.data;
}
