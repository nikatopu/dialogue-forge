"use client";

import { X } from "lucide-react";
import cn from "classnames";
import type { Condition, ConditionOperator, ProjectVariable } from "@/types";
import { OPERATORS_BY_TYPE, OPERATOR_LABELS, NO_VALUE_OPERATORS, TWO_VALUE_OPERATORS } from "../conditionConfig";
import style from "./ConditionRow.module.scss";

type ConditionRowProps = {
  condition: Condition;
  variables: ProjectVariable[];
  onUpdate: (patch: Partial<Condition>) => void;
  onRemove: () => void;
};

export function ConditionRow({ condition: cond, variables, onUpdate, onRemove }: ConditionRowProps) {
  const variable = variables.find((v) => v.id === cond.variableId);
  const varType = variable?.type ?? "string";
  const availableOps = OPERATORS_BY_TYPE[varType];
  const isLengthOp = cond.operator === "lengthEquals" || cond.operator === "lengthGreater" || cond.operator === "lengthLess";
  const isNumericType = varType === "number" || varType === "float";

  return (
    <div className={style.conditionRow}>
      <select
        value={cond.variableId}
        onChange={(e) => onUpdate({ variableId: e.target.value })}
        className={cn(style.condSelect, style.condVarSelect)}
        aria-label="Variable"
      >
        <option value="">variable</option>
        {variables.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>

      <select
        value={cond.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as ConditionOperator })}
        className={cn(style.condSelect, style.condOpSelect)}
        aria-label="Operator"
      >
        {availableOps.map((op) => <option key={op} value={op}>{OPERATOR_LABELS[op] ?? op}</option>)}
      </select>

      {!NO_VALUE_OPERATORS.has(cond.operator) && TWO_VALUE_OPERATORS.has(cond.operator) ? (
        <>
          <input
            type="number"
            value={String(cond.value)}
            onChange={(e) => { const raw = e.target.value; onUpdate({ value: raw === "" ? "" : Number(raw) }); }}
            placeholder="from"
            className={cn(style.condInput, style.condValInput)}
            aria-label="Min value"
          />
          <input
            type="number"
            value={cond.value2 !== undefined ? String(cond.value2) : ""}
            onChange={(e) => { const raw = e.target.value; onUpdate({ value2: raw === "" ? undefined : Number(raw) }); }}
            placeholder="to"
            className={cn(style.condInput, style.condValInput)}
            aria-label="Max value"
          />
        </>
      ) : !NO_VALUE_OPERATORS.has(cond.operator) ? (
        <input
          type={isNumericType || isLengthOp ? "number" : "text"}
          value={String(cond.value)}
          onChange={(e) => {
            const raw = e.target.value;
            const coerced = isNumericType && !isNaN(Number(raw)) && raw !== "" ? Number(raw) : raw;
            onUpdate({ value: coerced });
          }}
          placeholder={isNumericType ? "0" : "value"}
          className={cn(style.condInput, style.condValInput)}
          aria-label="Comparison value"
        />
      ) : null}

      <button type="button" onClick={onRemove} className={style.removeBtn} title="Remove condition">
        <X size={11} />
      </button>
    </div>
  );
}
