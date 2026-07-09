import type { Condition, ConditionGroup, RuntimeState } from "@/types";

/**
 * Evaluates a single Condition against the current runtime state.
 * Returns true if the condition passes, false otherwise.
 */
export function evaluateCondition(c: Condition, state: RuntimeState): boolean {
  const val = state[c.variableId];

  switch (c.operator) {
    // ── Equality / comparison (number, float, string) ───────────────────────
    case "==":
      return val == c.value; // loose equality to handle coerced types
    case "!=":
      return val != c.value;
    case ">":
      return typeof val === "number" && val > Number(c.value);
    case ">=":
      return typeof val === "number" && val >= Number(c.value);
    case "<":
      return typeof val === "number" && val < Number(c.value);
    case "<=":
      return typeof val === "number" && val <= Number(c.value);

    // ── Range (number, float) ───────────────────────────────────────────────
    case "between":
      return (
        typeof val === "number" &&
        val >= Number(c.value) &&
        val <= Number(c.value2 ?? c.value)
      );
    case "notBetween":
      return (
        typeof val === "number" &&
        !(val >= Number(c.value) && val <= Number(c.value2 ?? c.value))
      );

    // ── String ─────────────────────────────────────────────────────────────
    case "contains":
      return String(val).includes(String(c.value));
    case "notContains":
      return !String(val).includes(String(c.value));
    case "startsWith":
      return String(val).startsWith(String(c.value));
    case "endsWith":
      return String(val).endsWith(String(c.value));
    case "isEmpty":
      return String(val).length === 0;
    case "isNotEmpty":
      return String(val).length > 0;

    // ── Boolean ────────────────────────────────────────────────────────────
    case "isTrue":
      return val === true || val === "true";
    case "isFalse":
      return val === false || val === "false";

    // ── List ───────────────────────────────────────────────────────────────
    case "listContains":
      return Array.isArray(val) && (val as string[]).includes(String(c.value));
    case "listNotContains":
      return Array.isArray(val) && !(val as string[]).includes(String(c.value));
    case "listIsEmpty":
      return Array.isArray(val) && val.length === 0;
    case "listIsNotEmpty":
      return Array.isArray(val) && val.length > 0;
    case "lengthEquals":
      return Array.isArray(val) && val.length === Number(c.value);
    case "lengthGreater":
      return Array.isArray(val) && val.length > Number(c.value);
    case "lengthLess":
      return Array.isArray(val) && val.length < Number(c.value);

    // ── Object ─────────────────────────────────────────────────────────────
    case "hasProperty":
      return typeof val === "object" && val !== null && String(c.value) in val;
    case "notHasProperty":
      return !(typeof val === "object" && val !== null && String(c.value) in val);
    case "propertyEquals":
      return (
        typeof val === "object" &&
        val !== null &&
        String((val as Record<string, unknown>)[String(c.value)]) ===
          String(c.value2 ?? "")
      );

    default:
      return false;
  }
}

/**
 * Evaluates a ConditionGroup (flat or nested) against the runtime state.
 * AND: all conditions must pass.
 * OR:  at least one condition must pass.
 */
export function evaluateConditionGroup(
  group: ConditionGroup,
  state: RuntimeState
): boolean {
  const results = group.conditions.map((item) => {
    if ("logic" in item) {
      // Nested group
      return evaluateConditionGroup(item as ConditionGroup, state);
    }
    return evaluateCondition(item as Condition, state);
  });

  return group.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}
