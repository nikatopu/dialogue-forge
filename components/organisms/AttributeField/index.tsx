"use client";

import { useState, useEffect } from "react";
import cn from "classnames";
import type { AttributeDefinition } from "@/types";
import style from "./AttributeField.module.scss";

interface AttributeFieldProps {
  definition: AttributeDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function AttributeField({ definition, value, onChange }: AttributeFieldProps) {
  const { type, options } = definition;

  switch (type) {
    case "text":    return <TextValue value={String(value ?? "")} onChange={onChange} />;
    case "number":  return <NumberValue value={Number(value ?? 0)} onChange={onChange} />;
    case "boolean": return <BooleanValue value={Boolean(value)} onChange={onChange} />;
    case "dropdown":return <DropdownValue value={String(value ?? "")} options={options ?? []} onChange={onChange} />;
    case "color":   return <ColorValue value={String(value ?? "#6366f1")} onChange={onChange} />;
    case "list":    return <ListValue value={Array.isArray(value) ? value : []} onChange={onChange} />;
    case "object":  return <ObjectValue value={typeof value === "object" && value !== null ? value as Record<string, unknown> : {}} onChange={onChange} />;
    default: return null;
  }
}

function TextValue({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input value={local} onChange={(e) => setLocal(e.target.value)} onBlur={() => onChange(local)} onKeyDown={(e) => e.key === "Enter" && onChange(local)} className={style.input} placeholder="Enter text…" />
  );
}

function NumberValue({ value, onChange }: { value: number; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);
  return (
    <input type="number" value={local} onChange={(e) => setLocal(e.target.value)} onBlur={() => onChange(parseFloat(local) || 0)} onKeyDown={(e) => e.key === "Enter" && onChange(parseFloat(local) || 0)} className={cn(style.input, style.numberInput)} />
  );
}

function BooleanValue({ value, onChange }: { value: boolean; onChange: (v: unknown) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={cn(style.toggle, value ? style.toggleOn : style.toggleOff)} role="switch" aria-checked={value}>
      <span className={cn(style.toggleThumb, value ? style.toggleThumbOn : style.toggleThumbOff)} />
    </button>
  );
}

function DropdownValue({ value, options, onChange }: { value: string; options: string[]; onChange: (v: unknown) => void }) {
  if (options.length === 0) return <span className={style.noOptions}>No options defined</span>;
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={style.select}>
      <option value="">— Select —</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

function ColorValue({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  return (
    <div className={style.colorRow}>
      <div className={style.colorPreview} style={{ background: value }} />
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className={style.colorInput} />
      <span className={style.colorHex}>{value}</span>
    </div>
  );
}

function ListValue({ value, onChange }: { value: unknown[]; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(value.join("\n"));
  useEffect(() => setLocal(value.join("\n")), [value]);
  function commit() { onChange(local.split("\n").map((s) => s.trim()).filter(Boolean)); }
  return (
    <textarea value={local} onChange={(e) => setLocal(e.target.value)} onBlur={commit} rows={3} placeholder="One item per line…" className={style.textarea} />
  );
}

function ObjectValue({ value, onChange }: { value: Record<string, unknown>; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(false);
  useEffect(() => setLocal(JSON.stringify(value, null, 2)), [value]);
  function commit() {
    try { onChange(JSON.parse(local)); setError(false); }
    catch { setError(true); }
  }
  return (
    <div>
      <textarea value={local} onChange={(e) => { setLocal(e.target.value); setError(false); }} onBlur={commit} rows={4} spellCheck={false} className={cn(style.textarea, error && style.textareaError)} style={{ fontFamily: "monospace", fontSize: "0.625rem" }} />
      {error && <p className={style.errorMsg}>Invalid JSON</p>}
    </div>
  );
}
