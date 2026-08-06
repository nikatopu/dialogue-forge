"use client";

import { Plus, X } from "lucide-react";
import cn from "classnames";
import fields from "../../fields.module.scss";
import style from "./ParamsEditor.module.scss";

type ParamsEditorProps = {
  params: Record<string, string>;
  onUpdate: (p: Record<string, string>) => void;
};

export function ParamsEditor({ params, onUpdate }: ParamsEditorProps) {
  const entries = Object.entries(params);

  function addParam() { onUpdate({ ...params, "": "" }); }
  function updateKey(oldKey: string, newKey: string) {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) next[k === oldKey ? newKey : k] = v;
    onUpdate(next);
  }
  function updateValue(key: string, value: string) { onUpdate({ ...params, [key]: value }); }
  function removeParam(key: string) { const next = { ...params }; delete next[key]; onUpdate(next); }

  return (
    <div className={fields.field}>
      <div className={fields.sectionHeader}>
        <p className={fields.fieldLabel}>Parameters</p>
        <button type="button" onClick={addParam} className={style.addParamBtn}><Plus size={12} />Add</button>
      </div>
      {entries.length === 0
        ? <p className={fields.emptyNote}>No parameters. Click Add to pass data to the event.</p>
        : entries.map(([key, value], i) => (
          <div key={i} className={style.paramRow}>
            <input value={key} placeholder="key" onChange={(e) => updateKey(key, e.target.value)} className={cn(fields.inlineInput, style.keyInput)} />
            <span className={style.paramSep}>=</span>
            <input value={value} placeholder="value" onChange={(e) => updateValue(key, e.target.value)} className={cn(fields.inlineInput, style.valueInput)} />
            <button type="button" onClick={() => removeParam(key)} title="Remove parameter" className={style.paramRemove}><X size={12} /></button>
          </div>
        ))
      }
    </div>
  );
}
