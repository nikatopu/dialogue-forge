"use client";

import { Plus, X } from "lucide-react";
import cn from "classnames";
import style from "./ObjectValueEditor.module.scss";

type ObjectEntry = { key: string; value: string };

type ObjectValueEditorProps = {
  entries: ObjectEntry[];
  jsonMode: boolean;
  jsonText: string;
  onToggleJsonMode: () => void;
  onJsonTextChange: (value: string) => void;
  onAddEntry: () => void;
  onUpdateEntry: (index: number, field: "key" | "value", value: string) => void;
  onRemoveEntry: (index: number) => void;
};

export function ObjectValueEditor({
  entries,
  jsonMode,
  jsonText,
  onToggleJsonMode,
  onJsonTextChange,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry,
}: ObjectValueEditorProps) {
  return (
    <div className={style.container}>
      <button type="button" onClick={onToggleJsonMode} className={style.jsonToggle}>
        {jsonMode ? "Structured view" : "Advanced JSON"}
      </button>
      {jsonMode ? (
        <textarea
          value={jsonText}
          onChange={(e) => onJsonTextChange(e.target.value)}
          className={style.jsonArea}
          rows={5}
          spellCheck={false}
          aria-label="Object JSON"
          placeholder="{}"
        />
      ) : (
        <>
          {entries.map((entry, idx) => (
            <div key={idx} className={style.row}>
              <input
                value={entry.key}
                onChange={(e) => onUpdateEntry(idx, "key", e.target.value)}
                placeholder="key"
                className={cn(style.input, style.keyInput)}
              />
              <span className={style.colon}>:</span>
              <input
                value={entry.value}
                onChange={(e) => onUpdateEntry(idx, "value", e.target.value)}
                placeholder="value"
                className={cn(style.input, style.valueInput)}
              />
              <button
                type="button"
                onClick={() => onRemoveEntry(idx)}
                className={style.removeBtn}
                aria-label="Remove property"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button type="button" onClick={onAddEntry} className={style.addBtn}>
            <Plus size={11} />
            Add property
          </button>
        </>
      )}
    </div>
  );
}
