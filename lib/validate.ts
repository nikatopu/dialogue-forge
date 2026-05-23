import type {
  ForgeNode,
  DialogueEdge,
  CharacterNodeData,
  ActionNodeData,
  StartNodeData,
} from "@/types";

export type IssueLevel = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  level: IssueLevel;
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export function validateGraph(
  nodes: ForgeNode[],
  edges: DialogueEdge[]
): ValidationIssue[] {
  if (nodes.length === 0) return [];

  const issues: ValidationIssue[] = [];
  let seq = 0;

  function push(issue: Omit<ValidationIssue, "id">) {
    issues.push({ id: `v${seq++}`, ...issue });
  }

  /* ── Build edge maps ── */
  const nodeIds = new Set(nodes.map((n) => n.id));
  const outDeg = new Map<string, number>();
  const inDeg = new Map<string, number>();

  for (const n of nodes) {
    outDeg.set(n.id, 0);
    inDeg.set(n.id, 0);
  }

  for (const e of edges) {
    if (nodeIds.has(e.source)) outDeg.set(e.source, (outDeg.get(e.source) ?? 0) + 1);
    if (nodeIds.has(e.target)) inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  const startNodes = nodes.filter((n) => n.type === "start");

  /* ── Missing Start warning (only when graph has multiple nodes) ── */
  if (startNodes.length === 0 && nodes.length > 1) {
    push({
      level: "warning",
      code: "no_start_node",
      message: "No Start node found — add one to define an entry point",
    });
  }

  /* ── Per-node rules ── */
  for (const node of nodes) {
    const out = outDeg.get(node.id) ?? 0;
    const inc = inDeg.get(node.id) ?? 0;

    /* Generic orphan check (skip Start nodes — they're inherently entry points) */
    if (node.type !== "start" && out === 0 && inc === 0 && nodes.length > 1) {
      push({
        level: "error",
        code: "orphan_node",
        message: `Node "${getNodeLabel(node)}" has no connections`,
        nodeId: node.id,
      });
      continue;
    }

    /* ─── Start node rules ─── */
    if (node.type === "start") {
      const d = node.data as StartNodeData;

      if (inc > 0) {
        push({
          level: "error",
          code: "start_has_incoming",
          message: `Start node "${d.name || "Unnamed"}" must not have incoming edges`,
          nodeId: node.id,
        });
      }

      if (out === 0 && nodes.length > 1) {
        push({
          level: "warning",
          code: "empty_start_branch",
          message: `Start node "${d.name || "Unnamed"}" has no outgoing edges`,
          nodeId: node.id,
        });
      }

      continue;
    }

    /* ─── Character node rules ─── */
    if (node.type === "character") {
      const d = node.data as CharacterNodeData;
      if (!d.dialogue?.trim()) {
        push({
          level: "warning",
          code: "missing_dialogue",
          message: `"${d.name || "Unnamed"}" has no dialogue text`,
          nodeId: node.id,
        });
      }
    }

    /* ─── Action node rules ─── */
    if (node.type === "action") {
      const d = node.data as ActionNodeData;

      if (!d.label?.trim()) {
        push({
          level: "warning",
          code: "missing_label",
          message: "Action node has no label",
          nodeId: node.id,
        });
      }

      if (d.actionType !== "end" && out === 0 && nodes.length > 1) {
        push({
          level: "warning",
          code: "no_outgoing_edge",
          message: `Action "${d.label || "Unnamed"}" leads nowhere`,
          nodeId: node.id,
        });
      }

      /* Trigger-specific checks */
      if (d.actionType === "trigger") {
        if (!d.category) {
          push({
            level: "warning",
            code: "trigger_missing_category",
            message: `Trigger "${d.label || "Unnamed"}" has no category`,
            nodeId: node.id,
          });
        }
        if (!d.event?.trim()) {
          push({
            level: "warning",
            code: "trigger_missing_event",
            message: `Trigger "${d.label || "Unnamed"}" has no event`,
            nodeId: node.id,
          });
        }
      }
    }
  }

  /* ── Branch edge labels ── */
  const branchSources = new Set(
    nodes
      .filter(
        (n) => n.type === "action" && (n.data as ActionNodeData).actionType === "branch"
      )
      .map((n) => n.id)
  );

  for (const e of edges) {
    if (branchSources.has(e.source) && !e.data?.optionText?.trim()) {
      push({
        level: "info",
        code: "missing_edge_label",
        message: "Branch edge has no option text",
        edgeId: e.id,
        nodeId: e.source,
      });
    }
  }

  /* ── Cycle detection (DFS) ── */
  if (hasCycle(nodes, edges)) {
    push({
      level: "info",
      code: "cycle_detected",
      message: "Graph contains a loop — some paths may repeat indefinitely",
    });
  }

  return issues;
}

function getNodeLabel(node: ForgeNode): string {
  if (node.type === "character") return (node.data as CharacterNodeData).name || "Unnamed";
  if (node.type === "start") return (node.data as StartNodeData).name || "Start";
  return (node.data as ActionNodeData).label || "Action";
}

function hasCycle(nodes: ForgeNode[], edges: DialogueEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.source)?.push(e.target);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n.id, WHITE);

  function dfs(id: string): boolean {
    color.set(id, GRAY);
    for (const nb of adj.get(id) ?? []) {
      if (color.get(nb) === GRAY) return true;
      if (color.get(nb) === WHITE && dfs(nb)) return true;
    }
    color.set(id, BLACK);
    return false;
  }

  for (const n of nodes) {
    if (color.get(n.id) === WHITE && dfs(n.id)) return true;
  }
  return false;
}
