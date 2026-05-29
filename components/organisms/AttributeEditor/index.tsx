"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Pencil, Check, X, Settings2 } from "lucide-react";
import { AttributeField } from "@/components/organisms/AttributeField";
import { Badge } from "@/components/atoms/Badge";
import { useGraphStore } from "@/store/useGraphStore";
import cn from "classnames";
import type { AttributeDefinition, AttributeType } from "@/types";
import style from "./AttributeEditor.module.scss";

const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
  { value: "text", label: "Text" }, { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" }, { value: "dropdown", label: "Dropdown" },
  { value: "color", label: "Color" }, { value: "list", label: "List" }, { value: "object", label: "Object" },
];

const TYPE_COLORS: Record<AttributeType, string> = {
  text: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  number: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  boolean: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  dropdown: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  list: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  object: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

interface AttributeEditorProps {
  nodeId: string;
  schema: AttributeDefinition[];
  values: Record<string, unknown>;
}

export function AttributeEditor({ nodeId, schema, values }: AttributeEditorProps) {
  const { addAttribute, removeAttribute, renameAttribute, changeAttributeType, setAttributeOptions, setAttributeValue } = useGraphStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AttributeType>("text");
  const [newOptions, setNewOptions] = useState("");

  function commitAdd() {
    const name = newName.trim();
    if (!name) return;
    const options = newType === "dropdown" ? newOptions.split("\n").map((s) => s.trim()).filter(Boolean) : undefined;
    addAttribute(nodeId, { name, type: newType, options });
    setNewName(""); setNewType("text"); setNewOptions(""); setAdding(false);
  }

  return (
    <div className={style.container}>
      <AnimatePresence initial={false}>
        {schema.map((def) => (
          <motion.div key={def.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
            <AttributeRow
              nodeId={nodeId} def={def} value={values[def.id]}
              onRename={(name) => renameAttribute(nodeId, def.id, name)}
              onTypeChange={(type, opts) => changeAttributeType(nodeId, def.id, type, opts)}
              onOptionsChange={(opts) => setAttributeOptions(nodeId, def.id, opts)}
              onValueChange={(val) => setAttributeValue(nodeId, def.id, val)}
              onRemove={() => removeAttribute(nodeId, def.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {schema.length === 0 && !adding && <p className={style.emptyMsg}>No attributes defined — add one below</p>}

      <AnimatePresence>
        {adding ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
            <div className={style.addForm}>
              <p className={style.addFormTitle}>New Attribute</p>
              <div>
                <label className={style.addFormLabel}>Name</label>
                <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commitAdd()} placeholder="e.g. Emotion" className={style.addFormInput} />
              </div>
              <div>
                <label className={style.addFormLabel}>Type</label>
                <select value={newType} onChange={(e) => { setNewType(e.target.value as AttributeType); setNewOptions(""); }} className={style.addFormSelect}>
                  {ATTRIBUTE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              {newType === "dropdown" && (
                <div>
                  <label className={style.addFormLabel}>Options (one per line)</label>
                  <textarea value={newOptions} onChange={(e) => setNewOptions(e.target.value)} rows={3} placeholder={"Happy\nSad\nAngry"} className={style.addFormTextarea} />
                </div>
              )}
              <div className={style.addFormActions}>
                <button type="button" className={style.addBtn} onClick={commitAdd} disabled={!newName.trim()}>
                  <Check size={12} />Add
                </button>
                <button type="button" className={style.cancelBtn} onClick={() => { setAdding(false); setNewName(""); setNewType("text"); setNewOptions(""); }}>
                  <X size={12} />Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className={style.addFieldBtn} onClick={() => setAdding(true)}>
              <Plus size={14} />Add Field
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttributeRow({
  nodeId, def, value, onRename, onTypeChange, onOptionsChange, onValueChange, onRemove,
}: {
  nodeId: string; def: AttributeDefinition; value: unknown;
  onRename: (name: string) => void; onTypeChange: (type: AttributeType, options?: string[]) => void;
  onOptionsChange: (options: string[]) => void; onValueChange: (value: unknown) => void; onRemove: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameLocal, setNameLocal] = useState(def.name);
  const [expanded, setExpanded] = useState(false);

  function commitName() {
    const trimmed = nameLocal.trim();
    if (trimmed && trimmed !== def.name) onRename(trimmed);
    else setNameLocal(def.name);
    setEditingName(false);
  }

  return (
    <div className={style.row}>
      <div className={style.rowHeader}>
        {editingName ? (
          <input autoFocus value={nameLocal} onChange={(e) => setNameLocal(e.target.value)} onBlur={commitName} onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setNameLocal(def.name); setEditingName(false); } }} className={style.rowNameEdit} />
        ) : (
          <button onClick={() => setEditingName(true)} className={style.rowName}>
            {def.name}
            <Pencil size={10} style={{ display: "inline", marginLeft: "0.25rem", opacity: 0.4 }} />
          </button>
        )}
        <Badge variant="outline" className={cn("text-[9px] cursor-pointer shrink-0", TYPE_COLORS[def.type])} style={{ height: "1rem", padding: "0 0.375rem" }} onClick={() => setExpanded((e) => !e)}>
          {def.type}
        </Badge>
        <button onClick={() => setExpanded((e) => !e)} className={style.rowIconBtn}><Settings2 size={12} /></button>
        <button onClick={onRemove} className={cn(style.rowIconBtn, style.rowIconBtnDelete)}><Trash2 size={12} /></button>
      </div>
      <div className={style.rowValue}>
        <AttributeField definition={def} value={value} onChange={onValueChange} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: "hidden" }}>
            <div className={style.expanded}>
              <div>
                <p className={style.expandedLabel}>Field Type</p>
                <select value={def.type} onChange={(e) => onTypeChange(e.target.value as AttributeType)} className={style.typeSelect}>
                  {ATTRIBUTE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              {def.type === "dropdown" && (
                <DropdownOptionsEditor options={def.options ?? []} onChange={onOptionsChange} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownOptionsEditor({ options, onChange }: { options: string[]; onChange: (opts: string[]) => void }) {
  const [local, setLocal] = useState(options.join("\n"));
  function commit() { onChange(local.split("\n").map((s) => s.trim()).filter(Boolean)); }
  return (
    <div>
      <p className={style.expandedLabel}>Options (one per line)</p>
      <textarea value={local} onChange={(e) => setLocal(e.target.value)} onBlur={commit} rows={3} className={style.dropdownTextarea} placeholder={"Option A\nOption B\nOption C"} />
    </div>
  );
}
