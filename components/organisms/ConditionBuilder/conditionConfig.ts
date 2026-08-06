import type { ConditionGroup, Condition, ConditionOperator, VariableType } from "@/types";

/* Operators valid for each variable type */
export const OPERATORS_BY_TYPE: Record<VariableType, ConditionOperator[]> = {
  number:  ["==", "!=", ">", ">=", "<", "<=", "between", "notBetween"],
  float:   ["==", "!=", ">", ">=", "<", "<=", "between", "notBetween"],
  boolean: ["isTrue", "isFalse"],
  string:  ["==", "!=", "contains", "notContains", "startsWith", "endsWith", "isEmpty", "isNotEmpty"],
  list:    ["listContains", "listNotContains", "listIsEmpty", "listIsNotEmpty", "lengthEquals", "lengthGreater", "lengthLess"],
  object:  ["hasProperty", "notHasProperty", "propertyEquals"],
};

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  "==":             "equals",
  "!=":             "not equals",
  ">":              "greater than",
  ">=":             "at least",
  "<":              "less than",
  "<=":             "at most",
  "between":        "between",
  "notBetween":     "not between",
  "contains":       "contains",
  "notContains":    "does not contain",
  "startsWith":     "starts with",
  "endsWith":       "ends with",
  "isEmpty":        "is empty",
  "isNotEmpty":     "is not empty",
  "isTrue":         "is true",
  "isFalse":        "is false",
  "listContains":   "contains",
  "listNotContains":"does not contain",
  "listIsEmpty":    "is empty",
  "listIsNotEmpty": "is not empty",
  "lengthEquals":   "length equals",
  "lengthGreater":  "length greater than",
  "lengthLess":     "length less than",
  "hasProperty":    "has property",
  "notHasProperty": "does not have property",
  "propertyEquals": "property equals",
};

/* Operators that require no value input */
export const NO_VALUE_OPERATORS = new Set<ConditionOperator>([
  "isEmpty", "isNotEmpty", "listIsEmpty", "listIsNotEmpty", "isTrue", "isFalse",
]);

/* Operators that require two value inputs (min + max) */
export const TWO_VALUE_OPERATORS = new Set<ConditionOperator>([
  "between", "notBetween",
]);

export function emptyGroup(): ConditionGroup {
  return { logic: "AND", conditions: [] };
}

export function emptyCondition(): Condition {
  return { variableId: "", operator: "==", value: "" };
}
