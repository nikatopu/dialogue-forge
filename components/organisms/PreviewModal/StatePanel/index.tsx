"use client";

import { SlidersHorizontal, ArrowRight } from "lucide-react";
import cn from "classnames";
import { Separator } from "@/components/atoms/Separator";
import type { StateChange, VarState } from "@/lib/simulateVariables";
import type { ProjectVariable } from "@/types";
import { formatVariableValue } from "../previewHelpers";
import style from "./StatePanel.module.scss";

type StatePanelProps = {
  variables: ProjectVariable[];
  varState: VarState;
  changes: StateChange[];
};

export function StatePanel({ variables, varState, changes }: StatePanelProps) {
  const recentIds = new Set(changes.slice(-5).map((c) => c.variableId));
  return (
    <div className={style.panel}>
      <Separator className={style.separator} />
      <div className={style.inner}>
        <p className={style.title}>
          <SlidersHorizontal size={11} />
          Variable State
        </p>
        <div className={style.grid}>
          {variables.map((v) => {
            const val = varState[v.id];
            const changed = recentIds.has(v.id);
            return (
              <div key={v.id} className={cn(style.item, changed && style.itemChanged)}>
                <span className={style.varName}>{v.name}</span>
                <code className={cn(style.val, changed && style.valChanged)}>{formatVariableValue(val, v.type)}</code>
              </div>
            );
          })}
        </div>
        {changes.length > 0 && (
          <div className={style.changeLog}>
            {changes.slice(-3).reverse().map((c, i) => (
              <div key={i} className={style.changeItem}>
                <ArrowRight size={9} className={style.changeIcon} />
                <span className={style.changeName}>{c.name}</span>
                <span className={style.changeFrom}>{String(c.from)}</span>
                <span className={style.changeArrow}>→</span>
                <span className={style.changeTo}>{String(c.to)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
