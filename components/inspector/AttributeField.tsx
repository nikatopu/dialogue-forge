"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AttributeDefinition } from "@/types";

interface AttributeFieldProps {
  definition: AttributeDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function AttributeField({ definition, value, onChange }: AttributeFieldProps) {
  const { type, options } = definition;

  switch (type) {
    case "text":
      return (
        <TextValue
          value={String(value ?? "")}
          onChange={onChange}
        />
      );

    case "number":
      return (
        <NumberValue
          value={Number(value ?? 0)}
          onChange={onChange}
        />
      );

    case "boolean":
      return (
        <BooleanValue
          value={Boolean(value)}
          onChange={onChange}
        />
      );

    case "dropdown":
      return (
        <DropdownValue
          value={String(value ?? "")}
          options={options ?? []}
          onChange={onChange}
        />
      );

    case "color":
      return (
        <ColorValue
          value={String(value ?? "#6366f1")}
          onChange={onChange}
        />
      );

    case "list":
      return (
        <ListValue
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );

    case "object":
      return (
        <ObjectValue
          value={typeof value === "object" && value !== null ? value as Record<string, unknown> : {}}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

/* ── Field implementations ─────────────────────────── */

function TextValue({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onChange(local)}
      onKeyDown={(e) => e.key === "Enter" && onChange(local)}
      className="h-7 text-xs bg-background/40 border-border/60"
      placeholder="Enter text…"
    />
  );
}

function NumberValue({ value, onChange }: { value: number; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);

  return (
    <Input
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onChange(parseFloat(local) || 0)}
      onKeyDown={(e) => e.key === "Enter" && onChange(parseFloat(local) || 0)}
      className="h-7 text-xs bg-background/40 border-border/60 tabular-nums"
    />
  );
}

function BooleanValue({ value, onChange }: { value: boolean; onChange: (v: unknown) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-5 w-9 rounded-full border transition-colors duration-200",
        value
          ? "bg-primary border-primary"
          : "bg-muted/50 border-border"
      )}
      role="switch"
      aria-checked={value}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm",
          "transition-transform duration-200",
          value ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function DropdownValue({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: unknown) => void;
}) {
  if (options.length === 0) {
    return (
      <span className="text-[10px] text-muted-foreground italic">
        No options defined
      </span>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-7 w-full rounded-md border border-border/60 bg-background/40 px-2",
        "text-xs text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/50",
        "appearance-none cursor-pointer"
      )}
    >
      <option value="">— Select —</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function ColorValue({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded border border-border/60 shrink-0"
        style={{ background: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-md border border-border/60 bg-background/40 px-1 cursor-pointer text-xs"
      />
      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
        {value}
      </span>
    </div>
  );
}

function ListValue({ value, onChange }: { value: unknown[]; onChange: (v: unknown) => void }) {
  const [local, setLocal] = useState(value.join("\n"));
  useEffect(() => setLocal(value.join("\n")), [value]);

  function commit() {
    const items = local
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(items);
  }

  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      rows={3}
      placeholder="One item per line…"
      className={cn(
        "w-full rounded-md border border-border/60 bg-background/40 px-2 py-1.5",
        "text-xs text-foreground resize-none",
        "focus:outline-none focus:ring-2 focus:ring-ring/50"
      )}
    />
  );
}

function ObjectValue({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (v: unknown) => void;
}) {
  const [local, setLocal] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(false);
  useEffect(() => setLocal(JSON.stringify(value, null, 2)), [value]);

  function commit() {
    try {
      onChange(JSON.parse(local));
      setError(false);
    } catch {
      setError(true);
    }
  }

  return (
    <div className="space-y-1">
      <textarea
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          setError(false);
        }}
        onBlur={commit}
        rows={4}
        spellCheck={false}
        className={cn(
          "w-full rounded-md border px-2 py-1.5",
          "font-mono text-[10px] text-foreground bg-background/40 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-ring/50",
          error ? "border-destructive" : "border-border/60"
        )}
      />
      {error && (
        <p className="text-[10px] text-destructive">Invalid JSON</p>
      )}
    </div>
  );
}
