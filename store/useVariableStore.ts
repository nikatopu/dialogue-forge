"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectVariable, VariableType } from "@/types";

function uid() {
  return `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultValueForType(type: VariableType): number | boolean | string {
  if (type === "number") return 0;
  if (type === "boolean") return false;
  return "";
}

interface VariableStore {
  variables: ProjectVariable[];
  addVariable: (def: Omit<ProjectVariable, "id">) => string;
  updateVariable: (id: string, patch: Partial<Omit<ProjectVariable, "id">>) => void;
  removeVariable: (id: string) => void;
  setVariables: (vars: ProjectVariable[]) => void;
  clearVariables: () => void;
}

export const useVariableStore = create<VariableStore>()(
  persist(
    (set) => ({
      variables: [],

      addVariable: (def) => {
        const id = uid();
        const variable: ProjectVariable = {
          id,
          name: def.name || "newVariable",
          type: def.type,
          defaultValue: def.defaultValue ?? defaultValueForType(def.type),
          description: def.description,
        };
        set((s) => ({ variables: [...s.variables, variable] }));
        return id;
      },

      updateVariable: (id, patch) =>
        set((s) => ({
          variables: s.variables.map((v) =>
            v.id === id ? { ...v, ...patch } : v,
          ),
        })),

      removeVariable: (id) =>
        set((s) => ({ variables: s.variables.filter((v) => v.id !== id) })),

      setVariables: (vars) => set({ variables: vars }),

      clearVariables: () => set({ variables: [] }),
    }),
    {
      name: "dialogue-forge-variables",
    },
  ),
);

export { defaultValueForType };
