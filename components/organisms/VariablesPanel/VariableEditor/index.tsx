"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import { TYPE_CONFIG, VARIABLE_TYPES } from "../variableTypes";
import { editWithType, type EditingState } from "../editorState";
import { ListValueEditor } from "./ListValueEditor";
import { ObjectValueEditor } from "./ObjectValueEditor";
import style from "./VariableEditor.module.scss";

type VariableEditorProps = {
  editing: EditingState;
  nameInputRef: RefObject<HTMLInputElement | null>;
  onChange: (next: EditingState) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function VariableEditor({ editing, nameInputRef, onChange, onSave, onCancel }: VariableEditorProps) {
  const objectToggleJsonMode = () => {
    if (!editing.objectJsonMode) {
      const obj: Record<string, string> = {};
      for (const { key, value } of editing.objectEntries) {
        if (key.trim()) obj[key.trim()] = value;
      }
      onChange({ ...editing, objectJsonMode: true, objectJsonText: JSON.stringify(obj, null, 2) });
    } else {
      let entries = editing.objectEntries;
      try {
        const parsed = JSON.parse(editing.objectJsonText) as Record<string, unknown>;
        entries = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
      } catch { /* keep current entries on invalid JSON */ }
      onChange({ ...editing, objectJsonMode: false, objectEntries: entries });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={style.container}
    >
      <p className={style.title}>{editing.id ? "Edit variable" : "New variable"}</p>

      <div className={style.field}>
        <label className={style.label}>Name</label>
        <input
          ref={nameInputRef}
          value={editing.name}
          onChange={(e) => onChange({ ...editing, name: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
          placeholder="e.g. gold, hasKey, questState"
          className={style.input}
        />
      </div>

      <div className={style.field}>
        <label className={style.label}>Type</label>
        <div className={style.typeGrid}>
          {VARIABLE_TYPES.map((t) => {
            const cfg = TYPE_CONFIG[t];
            const Icon = cfg.icon;
            const active = editing.type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange(editWithType(editing, t))}
                className={cn(style.typeBtn, active && style.typeBtnActive)}
                style={active ? { color: cfg.color, borderColor: `color-mix(in oklch, ${cfg.color} 35%, transparent)` } : {}}
              >
                <Icon size={12} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={style.field}>
        <label className={style.label}>Default Value</label>
        {editing.type === "boolean" ? (
          <select
            value={editing.defaultValue}
            onChange={(e) => onChange({ ...editing, defaultValue: e.target.value })}
            className={style.select}
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        ) : editing.type === "float" ? (
          <input
            type="number"
            step="0.01"
            value={editing.defaultValue}
            onChange={(e) => onChange({ ...editing, defaultValue: e.target.value })}
            placeholder="0.0"
            className={style.input}
          />
        ) : editing.type === "list" ? (
          <ListValueEditor
            items={editing.listItems}
            input={editing.listInput}
            onInputChange={(listInput) => onChange({ ...editing, listInput })}
            onAdd={() => {
              const item = editing.listInput.trim();
              if (!item) return;
              onChange({ ...editing, listItems: [...editing.listItems, item], listInput: "" });
            }}
            onRemove={(idx) => onChange({ ...editing, listItems: editing.listItems.filter((_, i) => i !== idx) })}
          />
        ) : editing.type === "object" ? (
          <ObjectValueEditor
            entries={editing.objectEntries}
            jsonMode={editing.objectJsonMode}
            jsonText={editing.objectJsonText}
            onToggleJsonMode={objectToggleJsonMode}
            onJsonTextChange={(objectJsonText) => onChange({ ...editing, objectJsonText })}
            onAddEntry={() => onChange({ ...editing, objectEntries: [...editing.objectEntries, { key: "", value: "" }] })}
            onUpdateEntry={(idx, fieldName, val) =>
              onChange({ ...editing, objectEntries: editing.objectEntries.map((e, i) => i === idx ? { ...e, [fieldName]: val } : e) })}
            onRemoveEntry={(idx) => onChange({ ...editing, objectEntries: editing.objectEntries.filter((_, i) => i !== idx) })}
          />
        ) : (
          <input
            value={editing.defaultValue}
            onChange={(e) => onChange({ ...editing, defaultValue: e.target.value })}
            placeholder={editing.type === "number" ? "0" : "value"}
            className={style.input}
          />
        )}
      </div>

      <div className={style.field}>
        <label className={style.label}>Description <span className={style.optional}>(optional)</span></label>
        <input
          value={editing.description}
          onChange={(e) => onChange({ ...editing, description: e.target.value })}
          placeholder="What is this variable for?"
          className={style.input}
        />
      </div>

      <div className={style.actions}>
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={onSave} disabled={!editing.name.trim()} style={{ gap: "0.25rem" }}>
          <Check size={12} />
          {editing.id ? "Save" : "Create"}
        </Button>
      </div>
    </motion.div>
  );
}
