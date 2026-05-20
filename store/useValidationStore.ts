"use client";

import { create } from "zustand";
import type { ValidationIssue, IssueLevel } from "@/lib/validate";

interface ValidationStore {
  issues: ValidationIssue[];
  /** Highest severity level per nodeId — primitive value for efficient selectors */
  nodeLevels: Record<string, IssueLevel>;
  setIssues: (issues: ValidationIssue[]) => void;
}

export const useValidationStore = create<ValidationStore>((set) => ({
  issues: [],
  nodeLevels: {},

  setIssues: (issues) => {
    const nodeLevels: Record<string, IssueLevel> = {};
    const priority: Record<IssueLevel, number> = { error: 2, warning: 1, info: 0 };

    for (const issue of issues) {
      if (!issue.nodeId) continue;
      const current = nodeLevels[issue.nodeId];
      if (!current || priority[issue.level] > priority[current]) {
        nodeLevels[issue.nodeId] = issue.level;
      }
    }

    set({ issues, nodeLevels });
  },
}));
