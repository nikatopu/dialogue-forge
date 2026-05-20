import type { ForgeNode, DialogueEdge } from "@/types";

const H_GAP = 230;
const V_GAP = 160;

export function computeAutoLayout(
  nodes: ForgeNode[],
  edges: DialogueEdge[]
): Record<string, { x: number; y: number }> {
  if (nodes.length === 0) return {};

  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();

  for (const n of nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }
  for (const e of edges) {
    if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  /* BFS level assignment from root nodes */
  const roots = nodes.filter((n) => (inDeg.get(n.id) ?? 0) === 0);
  const starts = roots.length > 0 ? roots : [nodes[0]];

  const level = new Map<string, number>();
  const queue: string[] = starts.map((n) => n.id);
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

  /* Nodes unreachable from roots go to level 0 */
  for (const n of nodes) {
    if (!level.has(n.id)) level.set(n.id, 0);
  }

  /* Group by level and assign x positions */
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
      positions[id] = {
        x: i * H_GAP - totalWidth / 2,
        y: lvl * V_GAP,
      };
    });
  }

  return positions;
}
