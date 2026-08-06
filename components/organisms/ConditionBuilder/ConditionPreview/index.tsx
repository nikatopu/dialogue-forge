"use client";

import type { Condition, ConditionLogic, ProjectVariable } from "@/types";
import { OPERATOR_LABELS, NO_VALUE_OPERATORS, TWO_VALUE_OPERATORS } from "../conditionConfig";
import style from "./ConditionPreview.module.scss";

type ConditionPreviewProps = {
  conditions: Condition[];
  logic: ConditionLogic;
  variables: ProjectVariable[];
};

export function ConditionPreview({ conditions, logic, variables }: ConditionPreviewProps) {
  return (
    <div className={style.preview}>
      {conditions.filter((c) => c.variableId).map((c, i) => {
        const varName = variables.find((v) => v.id === c.variableId)?.name ?? c.variableId;
        const opLabel = OPERATOR_LABELS[c.operator] ?? c.operator;
        const valueStr = NO_VALUE_OPERATORS.has(c.operator)
          ? ""
          : TWO_VALUE_OPERATORS.has(c.operator)
            ? `${String(c.value)} – ${c.value2 !== undefined ? String(c.value2) : "?"}`
            : String(c.value);
        return (
          <span key={i} className={style.previewLine}>
            {i > 0 && <span className={style.previewLogic}>{logic}</span>}
            <code className={style.previewCode}>
              {varName} {opLabel}{valueStr ? ` ${valueStr}` : ""}
            </code>
          </span>
        );
      })}
    </div>
  );
}
