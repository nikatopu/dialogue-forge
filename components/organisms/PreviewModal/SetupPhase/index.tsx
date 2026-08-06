"use client";

import { useState } from "react";
import { SlidersHorizontal, Play } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { buildInitialState, type VarState } from "@/lib/simulateVariables";
import type { ProjectVariable } from "@/types";
import style from "./SetupPhase.module.scss";

type SetupPhaseProps = {
  variables: ProjectVariable[];
  onStart: (state: VarState) => void;
  onSkip: () => void;
};

export function SetupPhase({ variables, onStart, onSkip }: SetupPhaseProps) {
  const [values, setValues] = useState<VarState>(() => buildInitialState(variables));

  function setValue(id: string, raw: string, type: ProjectVariable["type"]) {
    let coerced: number | boolean | string;
    if (type === "number") coerced = isNaN(Number(raw)) ? 0 : Number(raw);
    else if (type === "boolean") coerced = raw === "true";
    else coerced = raw;
    setValues((v) => ({ ...v, [id]: coerced }));
  }

  return (
    <div className={style.container}>
      <div className={style.hint}>
        <SlidersHorizontal size={14} className={style.hintIcon} />
        <p>Set the starting values for your variables. These simulate the game state when the dialogue begins.</p>
      </div>

      <div className={style.rows}>
        {variables.map((v) => (
          <div key={v.id} className={style.row}>
            <div className={style.rowLeft}>
              <p className={style.varName}>{v.name}</p>
              <span className={style.varType}>{v.type}</span>
            </div>
            {v.type === "boolean" ? (
              <select
                value={String(values[v.id] ?? v.defaultValue)}
                onChange={(e) => setValue(v.id, e.target.value, v.type)}
                className={style.select}
                aria-label={`Initial value for ${v.name}`}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                value={String(values[v.id] ?? v.defaultValue)}
                onChange={(e) => setValue(v.id, e.target.value, v.type)}
                className={style.input}
                placeholder={String(v.defaultValue)}
              />
            )}
          </div>
        ))}
      </div>

      <div className={style.actions}>
        <Button variant="outline" size="sm" onClick={onSkip} className={style.actionBtn}>
          Use Defaults
        </Button>
        <Button size="sm" onClick={() => onStart(values)} className={style.startBtn}>
          <Play size={12} className={style.playIcon} />
          Start Preview
        </Button>
      </div>
    </div>
  );
}
