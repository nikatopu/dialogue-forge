import type {
  ForgeNode,
  DialogueEdge,
  CharacterNodeData,
  ActionNodeData,
  StartNodeData,
  ProjectVariable,
  ConditionGroup,
  Condition,
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
  edges: DialogueEdge[],
  variables: ProjectVariable[] = [],
): ValidationIssue[] {
  if (nodes.length === 0) return [];

  const issues: ValidationIssue[] = [];
  let seq = 0;

  function push(issue: Omit<ValidationIssue, "id">) {
    issues.push({ id: `v${seq++}`, ...issue });
  }

  const varMap = new Map(variables.map((v) => [v.id, v]));

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

      /* setVariable-specific checks */
      if (d.actionType === "setVariable") {
        if (!d.variableAction?.variableId) {
          push({
            level: "warning",
            code: "set_variable_missing",
            message: `Set Variable node "${d.label || "Unnamed"}" has no variable selected`,
            nodeId: node.id,
          });
        } else if (variables.length > 0 && !varMap.has(d.variableAction.variableId)) {
          push({
            level: "error",
            code: "set_variable_unknown",
            message: `Set Variable node "${d.label || "Unnamed"}" references a deleted variable`,
            nodeId: node.id,
          });
        } else if (d.variableAction?.variableId && varMap.has(d.variableAction.variableId)) {
          const variable = varMap.get(d.variableAction.variableId)!;
          const op = d.variableAction.operation;
          const val = d.variableAction.value;
          // Type-mismatch: numeric operations on non-number variables
          if (
            variable.type !== "number" &&
            (op === "add" || op === "subtract" || op === "multiply" || op === "divide")
          ) {
            push({
              level: "warning",
              code: "variable_type_mismatch",
              message: `"${d.label || "Unnamed"}" uses "${op}" on "${variable.name}" which is not a number`,
              nodeId: node.id,
            });
          }
          // Toggle on non-boolean
          if (variable.type !== "boolean" && op === "toggle") {
            push({
              level: "warning",
              code: "variable_type_mismatch",
              message: `"${d.label || "Unnamed"}" uses "toggle" on "${variable.name}" which is not a boolean`,
              nodeId: node.id,
            });
          }
          // Set with wrong type
          if (op === "set" && val !== undefined) {
            if (variable.type === "number" && typeof val === "string" && isNaN(Number(val))) {
              push({
                level: "warning",
                code: "variable_type_mismatch",
                message: `"${d.label || "Unnamed"}" sets number "${variable.name}" to a non-numeric value`,
                nodeId: node.id,
              });
            }
          }
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

  /* ── Edge condition checks ── */
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

    if (e.data?.conditionGroup) {
      const condIssues = validateConditionGroup(e.data.conditionGroup, varMap, e.id);
      issues.push(...condIssues.map((ci) => ({ id: `v${seq++}`, ...ci })));
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

function validateConditionGroup(
  group: ConditionGroup,
  varMap: Map<string, ProjectVariable>,
  edgeId: string,
): Omit<ValidationIssue, "id">[] {
  if (varMap.size === 0) return []; // No variables defined yet — skip

  const issues: Omit<ValidationIssue, "id">[] = [];

  for (const c of group.conditions) {
    if ("logic" in c) {
      issues.push(...validateConditionGroup(c, varMap, edgeId));
      continue;
    }

    const condition = c as Condition;
    if (!condition.variableId) continue;

    if (!varMap.has(condition.variableId)) {
      issues.push({
        level: "error",
        code: "condition_unknown_variable",
        message: "Condition references a deleted variable",
        edgeId,
      });
      continue;
    }

    const variable = varMap.get(condition.variableId)!;
    const op = condition.operator;

    // Type-mismatch: numeric operators on string/boolean variables
    if (
      variable.type !== "number" &&
      (op === ">" || op === ">=" || op === "<" || op === "<=")
    ) {
      issues.push({
        level: "warning",
        code: "condition_type_mismatch",
        message: `Condition uses "${op}" on "${variable.name}" which is not a number`,
        edgeId,
      });
    }

    // String operators on non-string variables
    if (
      variable.type !== "string" &&
      (op === "contains" || op === "startsWith" || op === "endsWith")
    ) {
      issues.push({
        level: "warning",
        code: "condition_type_mismatch",
        message: `Condition uses "${op}" on "${variable.name}" which is not a string`,
        edgeId,
      });
    }

    // Value type mismatch for == / !=
    if ((op === "==" || op === "!=") && condition.value !== undefined) {
      if (variable.type === "number" && typeof condition.value === "string" && condition.value !== "" && isNaN(Number(condition.value))) {
        issues.push({
          level: "warning",
          code: "condition_type_mismatch",
          message: `Condition compares number "${variable.name}" to a non-numeric value`,
          edgeId,
        });
      }
    }
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
