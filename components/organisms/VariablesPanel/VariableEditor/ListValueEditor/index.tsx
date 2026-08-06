"use client";

import { Plus, X } from "lucide-react";
import cn from "classnames";
import style from "./ListValueEditor.module.scss";

type ListValueEditorProps = {
  items: string[];
  input: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function ListValueEditor({ items, input, onInputChange, onAdd, onRemove }: ListValueEditorProps) {
  return (
    <div className={style.container}>
      {items.map((item, idx) => (
        <div key={idx} className={style.chip}>
          <span className={style.chipText}>{item}</span>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className={style.chipRemove}
            aria-label="Remove item"
          >
            <X size={9} />
          </button>
        </div>
      ))}
      <div className={style.addRow}>
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder="Add item…"
          className={cn(style.input, style.addInput)}
        />
        <button
          type="button"
          onClick={onAdd}
          className={style.addBtn}
          disabled={!input.trim()}
          title="Add item"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}
