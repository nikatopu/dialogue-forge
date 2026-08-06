"use client";

import { Plus, GitMerge } from "lucide-react";
import { useVariableStore } from "@/store/useVariableStore";
import cn from "classnames";
import type { ConditionGroup, Condition, ConditionLogic } from "@/types";
import { OPERATORS_BY_TYPE, emptyGroup, emptyCondition } from "./conditionConfig";
import { ConditionRow } from "./ConditionRow";
import { ConditionPreview } from "./ConditionPreview";
import style from "./ConditionBuilder.module.scss";

interface ConditionBuilderProps {
  value: ConditionGroup | null;
  onChange: (group: ConditionGroup | null) => void;
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
    onChange(next.length === 0 ? null : { ...group, conditions: next });
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
      <div className={style.builderHeader}>
        <div className={style.builderLeft}>
          <GitMerge size={12} className={style.builderIcon} />
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
        <p className={style.noVarsNote}>No variables defined. Open the Variables panel to create some.</p>
      )}

      {conditions.length === 0 && variables.length > 0 && (
        <p className={style.emptyNote}>No conditions. This branch is always visible.</p>
      )}

      {conditions.length > 0 && (
        <>
          {conditions.length > 1 && (
            <div className={style.logicRow}>
              <span className={style.logicLabel}>Match</span>
              <div className={style.logicToggle}>
                {(["AND", "OR"] as ConditionLogic[]).map((l) => (
                  <button key={l} type="button" onClick={() => setLogic(l)} className={cn(style.logicBtn, group.logic === l && style.logicBtnActive)}>
                    {l}
                  </button>
                ))}
              </div>
              <span className={style.logicLabel}>{group.logic === "AND" ? "all conditions" : "any condition"}</span>
            </div>
          )}

          <div className={style.conditionList}>
            {group.conditions.map((c, i) => {
              if ("logic" in c) return null; // nested groups not rendered (flat only)
              return (
                <ConditionRow
                  key={i}
                  condition={c as Condition}
                  variables={variables}
                  onUpdate={(patch) => updateCondition(i, patch)}
                  onRemove={() => removeCondition(i)}
                />
              );
            })}
          </div>

          <ConditionPreview conditions={conditions} logic={group.logic} variables={variables} />
        </>
      )}
    </div>
  );
}
