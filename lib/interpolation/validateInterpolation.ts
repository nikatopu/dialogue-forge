import { parseVariableReferences } from "./parseVariableReferences";
import type { ProjectVariable } from "@/types";

export interface InterpolationIssue {
  token: string;
  reason: "unknown_variable" | "invalid_path";
  path: string[];
}

export function validateInterpolation(
  text: string,
  variables: ProjectVariable[],
): InterpolationIssue[] {
  const tokens = parseVariableReferences(text);
  const byName = new Map(variables.map((v) => [v.name, v]));
  const issues: InterpolationIssue[] = [];

  for (const token of tokens) {
    const rootVar = byName.get(token.path[0]);
    if (!rootVar) {
      issues.push({ token: token.raw, reason: "unknown_variable", path: token.path });
      continue;
    }
    if (token.path.length > 1) {
      const isValidNested =
        rootVar.type === "object" ||
        (rootVar.type === "list" && token.path[1] === "length" && token.path.length === 2);
      if (!isValidNested) {
        issues.push({ token: token.raw, reason: "invalid_path", path: token.path });
      }
    }
  }
  return issues;
}
