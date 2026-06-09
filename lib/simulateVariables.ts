import type {
  ProjectVariable,
  ConditionGroup,
  Condition,
  VariableAction,
} from "@/types";

export type VarState = Record<string, number | boolean | string>;

export function buildInitialState(variables: ProjectVariable[]): VarState {
  const state: VarState = {};
  for (const v of variables) {
    state[v.id] = v.defaultValue;
  }
  return state;
}

export function evaluateConditionGroup(group: ConditionGroup, state: VarState): boolean {
  const results = group.conditions.map((c) => {
    if ("logic" in c) return evaluateConditionGroup(c, state);
    return evaluateCondition(c as Condition, state);
  });
  return group.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

function evaluateCondition(condition: Condition, state: VarState): boolean {
  const value = state[condition.variableId];
  if (value === undefined) return false;

  const cv = condition.value;
  switch (condition.operator) {
    case "==":         return value == cv;
    case "!=":         return value != cv;
    case ">":          return Number(value) > Number(cv);
    case ">=":         return Number(value) >= Number(cv);
    case "<":          return Number(value) < Number(cv);
    case "<=":         return Number(value) <= Number(cv);
    case "contains":   return String(value).includes(String(cv));
    case "startsWith": return String(value).startsWith(String(cv));
    case "endsWith":   return String(value).endsWith(String(cv));
    default:           return false;
  }
}

export function applyVariableAction(action: VariableAction, state: VarState): VarState {
  const current = state[action.variableId];
  if (current === undefined) return state;

  let next: number | boolean | string;
  switch (action.operation) {
    case "set":
      next = action.value !== undefined ? action.value as number | boolean | string : current;
      break;
    case "add":
      next = Number(current) + Number(action.value ?? 0);
      break;
    case "subtract":
      next = Number(current) - Number(action.value ?? 0);
      break;
    case "multiply":
      next = Number(current) * Number(action.value ?? 1);
      break;
    case "divide": {
      const d = Number(action.value ?? 1);
      next = d !== 0 ? Number(current) / d : current as number;
      break;
    }
    case "toggle":
      next = !current;
      break;
    default:
      next = current;
  }

  return { ...state, [action.variableId]: next };
}

export interface StateChange {
  variableId: string;
  name: string;
  from: number | boolean | string;
  to: number | boolean | string;
}
