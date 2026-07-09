import { parseVariableReferences } from "./parseVariableReferences";
import type { RuntimeState } from "@/types";

export function interpolateText(template: string, state: RuntimeState): string {
  const tokens = parseVariableReferences(template);
  if (tokens.length === 0) return template;

  let result = template;
  // Process in reverse order to preserve string indices
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    const resolved = resolvePath(token.path, state);
    const replacement = resolved !== undefined ? formatValue(resolved) : token.raw;
    result = result.slice(0, token.start) + replacement + result.slice(token.end);
  }
  return result;
}

function resolvePath(path: string[], state: RuntimeState): unknown {
  let current: unknown = state[path[0]];
  for (let i = 1; i < path.length; i++) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[path[i]];
  }
  return current;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return String(value.length);
  if (typeof value === "object" && value !== null) return "[object]";
  if (value === null || value === undefined) return "";
  return String(value);
}
