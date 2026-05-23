import type { ForgeNode, DialogueEdge } from "@/types";

const H_GAP = 230;
const V_GAP = 160;
const CLUSTER_GAP = 480;

/** BFS from a set of seed IDs; returns all reachable node IDs (including seeds). */
function bfsReachable(
  seeds: string[],
  adj: Map<string, string[]>
): Set<string> {
  const visited = new Set<string>(seeds);
  const queue = [...seeds];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const nb of adj.get(id) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  return visited;
}

/** Lay out a single cluster of nodes, returning positions relative to x=0. */
function layoutCluster(
  clusterNodes: ForgeNode[],
  clusterEdges: DialogueEdge[],
  roots: ForgeNode[]
): Record<string, { x: number; y: number }> {
  if (clusterNodes.length === 0) return {};

  const adj = new Map<string, string[]>();
  const nodeSet = new Set(clusterNodes.map((n) => n.id));

  for (const n of clusterNodes) adj.set(n.id, []);
  for (const e of clusterEdges) {
    if (nodeSet.has(e.source) && nodeSet.has(e.target)) {
      adj.get(e.source)?.push(e.target);
    }
  }

  const startIds = roots.map((r) => r.id);
  const level = new Map<string, number>();
  const queue: string[] = startIds.filter((id) => nodeSet.has(id));
  for (const id of queue) level.set(id, 0);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const lvl = level.get(id)!;
    for (const nb of adj.get(id) ?? []) {
      if (!level.has(nb)) {
        level.set(nb, lvl + 1);
        queue.push(nb);
      }
    }
  }

  for (const n of clusterNodes) {
    if (!level.has(n.id)) level.set(n.id, 0);
  }

  const byLevel = new Map<number, string[]>();
  for (const [id, lvl] of level) {
    const arr = byLevel.get(lvl) ?? [];
    arr.push(id);
    byLevel.set(lvl, arr);
  }

  const positions: Record<string, { x: number; y: number }> = {};
  for (const [lvl, ids] of byLevel) {
    const totalWidth = (ids.length - 1) * H_GAP;
    ids.forEach((id, i) => {
      positions[id] = { x: i * H_GAP - totalWidth / 2, y: lvl * V_GAP };
    });
  }

  return positions;
}

export function computeAutoLayout(
  nodes: ForgeNode[],
  edges: DialogueEdge[]
): Record<string, { x: number; y: number }> {
  if (nodes.length === 0) return {};

  const startNodes = nodes.filter((n) => n.type === "start");

  /* ── Single-cluster (no Start nodes, or only one) ─────────── */
  if (startNodes.length <= 1) {
    const inDeg = new Map<string, number>();
    const adj = new Map<string, string[]>();
    for (const n of nodes) {
      adj.set(n.id, []);
      inDeg.set(n.id, 0);
    }
    for (const e of edges) {
      adj.get(e.source)?.push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    }

    const roots =
      startNodes.length === 1
        ? startNodes
        : nodes.filter((n) => (inDeg.get(n.id) ?? 0) === 0);
    const starts = roots.length > 0 ? roots : [nodes[0]];

    return layoutCluster(nodes, edges, starts);
  }

  /* ── Multi-cluster: one lane per Start node ───────────────── */
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.source)?.push(e.target);

  const positions: Record<string, { x: number; y: number }> = {};
  const assigned = new Set<string>();
  let xOffset = 0;

  for (const startNode of startNodes) {
    const reachable = bfsReachable([startNode.id], adj);
    const clusterNodes = nodes.filter((n) => reachable.has(n.id));
    const clusterEdges = edges.filter(
      (e) => reachable.has(e.source) && reachable.has(e.target)
    );

    const localPositions = layoutCluster(clusterNodes, clusterEdges, [startNode]);

    /* Width of this cluster (max x span) */
    let maxX = 0;
    for (const pos of Object.values(localPositions)) {
      maxX = Math.max(maxX, pos.x);
    }
    const clusterWidth = maxX + H_GAP;

    for (const [id, pos] of Object.entries(localPositions)) {
      /* Centre the cluster around xOffset + half its width */
      positions[id] = {
        x: pos.x + xOffset + clusterWidth / 2,
        y: pos.y,
      };
      assigned.add(id);
    }

    xOffset += clusterWidth + CLUSTER_GAP;
  }

  /* Orphaned nodes (not in any Start cluster) */
  const orphans = nodes.filter((n) => !assigned.has(n.id));
  if (orphans.length > 0) {
    const orphanEdges = edges.filter(
      (e) => !assigned.has(e.source) || !assigned.has(e.target)
    );
    const inDeg = new Map<string, number>();
    for (const n of orphans) inDeg.set(n.id, 0);
    for (const e of orphanEdges) {
      inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    }
    const roots = orphans.filter((n) => (inDeg.get(n.id) ?? 0) === 0);
    const orphanStarts = roots.length > 0 ? roots : [orphans[0]];
    const orphanPos = layoutCluster(orphans, orphanEdges, orphanStarts);

    let maxX = 0;
    for (const pos of Object.values(orphanPos)) maxX = Math.max(maxX, pos.x);
    const clusterWidth = maxX + H_GAP;

    for (const [id, pos] of Object.entries(orphanPos)) {
      positions[id] = { x: pos.x + xOffset + clusterWidth / 2, y: pos.y };
    }
  }

  return positions;
}
