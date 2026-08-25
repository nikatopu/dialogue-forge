"use client";

/**
 * Funnel rules that more than one call site needs.
 *
 * Kept out of the components so "what counts as a branch" and "when does a
 * local project begin" are defined once, next to the events they produce,
 * rather than being re-derived wherever a node happens to be created.
 */

import type { ActionNodeData, DialogueEdge, ForgeNode, ForgeNodeType } from "@/types";
import { track, trackOnce } from "@/lib/analytics";

/**
 * Records a node creation.
 *
 * Adding the first node to an empty local canvas is also the moment a local
 * project comes into existence — there is no "new project" button for local
 * work — so that case emits `project_created` too. Loading the demo goes
 * through `loadGraph`, never here, which is what keeps the demo out of the
 * `project_created` count.
 */
export function trackNodeAdded(options: {
  nodeType: ForgeNodeType;
  /** Node count before this one was added. */
  previousNodeCount: number;
  /** Cloud project id, or null for the local draft. */
  projectId: string | null;
}): void {
  const { nodeType, previousNodeCount, projectId } = options;

  if (previousNodeCount === 0 && projectId === null) {
    track("project_created", { source: "local" });
  }

  trackOnce("first_node_added", { node_type: nodeType });
}

/**
 * A branch is "created" once a Branch action node has somewhere to branch to:
 * two or more outgoing edges. One outgoing edge is just a link.
 *
 * Returns the highest outgoing-edge count among qualifying branch nodes, or 0
 * when the graph has none.
 */
export function widestBranch(nodes: ForgeNode[], edges: DialogueEdge[]): number {
  const outgoing = new Map<string, number>();
  for (const edge of edges) {
    outgoing.set(edge.source, (outgoing.get(edge.source) ?? 0) + 1);
  }

  let widest = 0;
  for (const node of nodes) {
    if (node.type !== "action") continue;
    if ((node.data as ActionNodeData).actionType !== "branch") continue;
    const count = outgoing.get(node.id) ?? 0;
    if (count >= 2 && count > widest) widest = count;
  }

  return widest;
}
