import type { ForgeNode, DialogueEdge, ActionNodeData, ConditionGroup } from "@/types";

export interface VariableUsage {
  conditionCount: number;
  actionCount: number;
  total: number;
}

function countConditionGroupRefs(group: ConditionGroup, variableId: string): number {
  let count = 0;
  for (const c of group.conditions) {
    if ("logic" in c) {
      count += countConditionGroupRefs(c, variableId);
    } else if (c.variableId === variableId) {
      count++;
    }
  }
  return count;
}

export function computeVariableUsage(
  variableId: string,
  nodes: ForgeNode[],
  edges: DialogueEdge[],
): VariableUsage {
  let conditionCount = 0;
  let actionCount = 0;

  for (const node of nodes) {
    if (node.type === "action") {
      const d = node.data as ActionNodeData;
      if (d.actionType === "setVariable" && d.variableAction?.variableId === variableId) {
        actionCount++;
      }
    }
  }

  for (const edge of edges) {
    if (edge.data?.conditionGroup) {
      conditionCount += countConditionGroupRefs(edge.data.conditionGroup, variableId);
    }
  }

  return { conditionCount, actionCount, total: conditionCount + actionCount };
}
