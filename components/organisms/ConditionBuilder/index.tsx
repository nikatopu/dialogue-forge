"use client";

import { Plus, X, GitMerge } from "lucide-react";
import { useVariableStore } from "@/store/useVariableStore";
import cn from "classnames";
import type { ConditionGroup, Condition, ConditionLogic, ConditionOperator, VariableType } from "@/types";
import style from "./ConditionBuilder.module.scss";

/* Operators valid for each variable type */
const OPERATORS_BY_TYPE: Record<VariableType, ConditionOperator[]> = {
  number:  ["==", "!=", ">", ">=", "<", "<="],
  boolean: ["==", "!="],
  string:  ["==", "!=", "contains", "startsWith", "endsWith"],
};

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  "==":         "equals",
  "!=":         "not equals",
  ">":          "greater than",
  ">=":         "at least",
  "<":          "less than",
  "<=":         "at most",
  "contains":   "contains",
  "startsWith": "starts with",
  "endsWith":   "ends with",
};

interface ConditionBuilderProps {
  value: ConditionGroup | null;
  onChange: (group: ConditionGroup | null) => void;
}

function emptyGroup(): ConditionGroup {
  return { logic: "AND", conditions: [] };
}

function emptyCondition(): Condition {
  return { variableId: "", operator: "==", value: "" };
}

export function ConditionBuilder({ value, onChange }: ConditionBuilderProps) {
  const variables = useVariableStore((s) => s.variables);
  const group = value ?? emptyGroup();

  function setLogic(logic: ConditionLogic) {
    onChange({ ...group, logic });
  }

  function addCondition() {
    onChange({ ...group, conditions: [...group.conditions, emptyCondition()] });
  }

  function removeCondition(index: number) {
    const next = group.conditions.filter((_, i) => i !== index);
    if (next.length === 0) {
      onChange(null);
    } else {
      onChange({ ...group, conditions: next });
    }
  }

  function updateCondition(index: number, patch: Partial<Condition>) {
    onChange({
      ...group,
      conditions: group.conditions.map((c, i) => {
        if (i !== index || "logic" in c) return c;
        const updated = { ...(c as Condition), ...patch };
        // When variable changes, reset operator to first valid one for its type
        if (patch.variableId) {
          const varType = variables.find((v) => v.id === patch.variableId)?.type ?? "string";
          const ops = OPERATORS_BY_TYPE[varType];
          if (!ops.includes(updated.operator)) updated.operator = ops[0];
          updated.value = "";
        }
        return updated;
      }),
    });
  }

  const conditions = group.conditions.filter((c): c is Condition => !("logic" in c));

  return (
    <div className={style.builder}>
      {/* Header row */}
      <div className={style.builderHeader}>
        <div className={style.builderLeft}>
          <GitMerge size={12} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <span className={style.builderTitle}>Conditions</span>
          {conditions.length > 0 && <span className={style.builderCount}>{conditions.length}</span>}
        </div>
        {variables.length > 0 && (
          <button type="button" onClick={addCondition} className={style.addBtn}>
            <Plus size={11} />
            Add
          </button>
        )}
      </div>

      {variables.length === 0 && (
        <p className={style.noVarsNote}>
          No variables defined. Open the Variables panel to create some.
        </p>
      )}

      {conditions.length === 0 && variables.length > 0 && (
        <p className={style.emptyNote}>
          No conditions. This branch is always visible.
        </p>
      )}

      {conditions.length > 0 && (
        <>
          {/* Logic toggle */}
          {conditions.length > 1 && (
            <div className={style.logicRow}>
              <span className={style.logicLabel}>Match</span>
              <div className={style.logicToggle}>
                {(["AND", "OR"] as ConditionLogic[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLogic(l)}
                    className={cn(style.logicBtn, group.logic === l && style.logicBtnActive)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <span className={style.logicLabel}>
                {group.logic === "AND" ? "all conditions" : "any condition"}
              </span>
            </div>
          )}

          {/* Condition rows */}
          <div className={style.conditionList}>
            {group.conditions.map((c, i) => {
              if ("logic" in c) return null; // nested groups not rendered (flat only)
              const cond = c as Condition;
              const variable = variables.find((v) => v.id === cond.variableId);
              const varType = variable?.type ?? "string";
              const availableOps = OPERATORS_BY_TYPE[varType];

              return (
                <div key={i} className={style.conditionRow}>
                  {/* Variable select */}
                  <select
                    value={cond.variableId}
                    onChange={(e) => updateCondition(i, { variableId: e.target.value })}
                    className={cn(style.condSelect, style.condVarSelect)}
                    aria-label="Variable"
                  >
                    <option value="">variable</option>
                    {variables.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>

                  {/* Operator select */}
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(i, { operator: e.target.value as ConditionOperator })}
                    className={cn(style.condSelect, style.condOpSelect)}
                    aria-label="Operator"
                  >
                    {availableOps.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>

                  {/* Value input — boolean gets dropdown, others get text */}
                  {varType === "boolean" ? (
                    <select
                      value={String(cond.value)}
                      onChange={(e) => updateCondition(i, { value: e.target.value === "true" })}
                      className={cn(style.condSelect, style.condValSelect)}
                      aria-label="Value"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      value={String(cond.value)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const coerced = varType === "number" && !isNaN(Number(raw)) && raw !== ""
                          ? Number(raw)
                          : raw;
                        updateCondition(i, { value: coerced });
                      }}
                      placeholder={varType === "number" ? "0" : "value"}
                      className={cn(style.condInput, style.condValInput)}
                      aria-label="Comparison value"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removeCondition(i)}
                    className={style.removeBtn}
                    title="Remove condition"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Human-readable preview */}
          <div className={style.preview}>
            {conditions.filter((c) => c.variableId).map((c, i) => {
              const varName = variables.find((v) => v.id === c.variableId)?.name ?? c.variableId;
              const opLabel = OPERATOR_LABELS[c.operator] ?? c.operator;
              return (
                <span key={i} className={style.previewLine}>
                  {i > 0 && <span className={style.previewLogic}>{group.logic}</span>}
                  <code className={style.previewCode}>{varName} {c.operator} {String(c.value)}</code>
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
