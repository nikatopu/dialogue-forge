"use client";

import { SlidersHorizontal } from "lucide-react";
import { Separator } from "@/components/atoms/Separator";
import { useVariableStore } from "@/store/useVariableStore";
import type { ActionNodeData, VariableOperation } from "@/types";
import { OPERATIONS, formatOpPreview } from "../../nodeInspectorConfig";
import { InlineInput } from "../../InlineInput";
import fields from "../../fields.module.scss";
import style from "./VariableActionSection.module.scss";

type VariableActionSectionProps = {
  data: ActionNodeData;
  onUpdate: (p: Partial<ActionNodeData>) => void;
};

export function VariableActionSection({ data, onUpdate }: VariableActionSectionProps) {
  const variables = useVariableStore((s) => s.variables);
  const va = data.variableAction;

  function setField(patch: Partial<NonNullable<ActionNodeData["variableAction"]>>) {
    onUpdate({
      variableAction: {
        variableId: va?.variableId ?? "",
        operation: va?.operation ?? "set",
        value: va?.value,
        ...patch,
      },
    });
  }

  const selectedVar = variables.find((v) => v.id === va?.variableId);
  const isToggle = va?.operation === "toggle";

  return (
    <>
      <Separator className={style.separator} />
      <div className={fields.field}>
        <div className={fields.sectionHeaderLeft}>
          <SlidersHorizontal size={12} className={style.icon} />
          <p className={fields.fieldLabel}>Variable Action</p>
        </div>
        {variables.length === 0 ? (
          <p className={fields.emptyNote}>No variables defined. Open the Variables panel to create some.</p>
        ) : (
          <>
            <div className={fields.field}>
              <p className={fields.fieldLabel}>Variable</p>
              <select value={va?.variableId ?? ""} onChange={(e) => setField({ variableId: e.target.value })} className={fields.select} aria-label="Variable to modify">
                <option value="">— select variable —</option>
                {variables.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
              </select>
            </div>
            <div className={fields.field}>
              <p className={fields.fieldLabel}>Operation</p>
              <select value={va?.operation ?? "set"} onChange={(e) => setField({ operation: e.target.value as VariableOperation })} className={fields.select} aria-label="Operation">
                {OPERATIONS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
              </select>
            </div>
            {!isToggle && (
              <div className={fields.field}>
                <p className={fields.fieldLabel}>Value</p>
                {selectedVar?.type === "boolean" ? (
                  <select value={String(va?.value ?? "true")} onChange={(e) => setField({ value: e.target.value === "true" })} className={fields.select} aria-label="Boolean value">
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <InlineInput
                    value={String(va?.value ?? "")}
                    placeholder={selectedVar?.type === "number" ? "0" : "value"}
                    onCommit={(v) => {
                      const coerced = selectedVar?.type === "number" ? (isNaN(Number(v)) ? v : Number(v)) : v;
                      setField({ value: coerced as string | number });
                    }}
                  />
                )}
              </div>
            )}
            {va?.variableId && va?.operation && (
              <div className={style.varPreview}>
                <span className={style.varPreviewText}>{selectedVar?.name ?? "?"} {formatOpPreview(va.operation, va.value)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
