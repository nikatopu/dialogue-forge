"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AttributeField } from "./AttributeField";
import { useGraphStore } from "@/store/useGraphStore";
import { cn } from "@/lib/utils";
import type { AttributeDefinition, AttributeType } from "@/types";

const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "dropdown", label: "Dropdown" },
  { value: "color", label: "Color" },
  { value: "list", label: "List" },
  { value: "object", label: "Object" },
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
  const {
    addAttribute,
    removeAttribute,
    renameAttribute,
    changeAttributeType,
    setAttributeOptions,
    setAttributeValue,
  } = useGraphStore();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AttributeType>("text");
  const [newOptions, setNewOptions] = useState("");

  function commitAdd() {
    const name = newName.trim();
    if (!name) return;

    const options =
      newType === "dropdown"
        ? newOptions
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    addAttribute(nodeId, { name, type: newType, options });
    setNewName("");
    setNewType("text");
    setNewOptions("");
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      {/* Attribute list */}
      <AnimatePresence initial={false}>
        {schema.map((def) => (
          <motion.div
            key={def.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            <AttributeRow
              nodeId={nodeId}
              def={def}
              value={values[def.id]}
              onRename={(name) => renameAttribute(nodeId, def.id, name)}
              onTypeChange={(type, opts) =>
                changeAttributeType(nodeId, def.id, type, opts)
              }
              onOptionsChange={(opts) =>
                setAttributeOptions(nodeId, def.id, opts)
              }
              onValueChange={(val) =>
                setAttributeValue(nodeId, def.id, val)
              }
              onRemove={() => removeAttribute(nodeId, def.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {schema.length === 0 && !adding && (
        <p className="text-[11px] text-muted-foreground/50 italic px-1 py-2 text-center">
          No attributes defined — add one below
        </p>
      )}

      {/* Add attribute form */}
      <AnimatePresence>
        {adding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                New Attribute
              </p>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Name</label>
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && commitAdd()}
                  placeholder="e.g. Emotion"
                  className="h-7 text-xs bg-background/50 border-border/60"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Type</label>
                <select
                  value={newType}
                  onChange={(e) => {
                    setNewType(e.target.value as AttributeType);
                    setNewOptions("");
                  }}
                  className={cn(
                    "h-7 w-full rounded-md border border-border/60 bg-background/50 px-2",
                    "text-xs text-foreground appearance-none cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring/50"
                  )}
                >
                  {ATTRIBUTE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown options */}
              {newType === "dropdown" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">
                    Options (one per line)
                  </label>
                  <textarea
                    value={newOptions}
                    onChange={(e) => setNewOptions(e.target.value)}
                    rows={3}
                    placeholder={"Happy\nSad\nAngry"}
                    className={cn(
                      "w-full rounded-md border border-border/60 bg-background/50 px-2 py-1.5",
                      "text-xs text-foreground resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-ring/50"
                    )}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5 flex-1"
                  onClick={commitAdd}
                  disabled={!newName.trim()}
                >
                  <Check className="w-3 h-3" />
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => {
                    setAdding(false);
                    setNewName("");
                    setNewType("text");
                    setNewOptions("");
                  }}
                >
                  <X className="w-3 h-3" />
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs gap-1.5 border-dashed border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => setAdding(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Individual attribute row ──────────────────────── */

interface AttributeRowProps {
  nodeId: string;
  def: AttributeDefinition;
  value: unknown;
  onRename: (name: string) => void;
  onTypeChange: (type: AttributeType, options?: string[]) => void;
  onOptionsChange: (options: string[]) => void;
  onValueChange: (value: unknown) => void;
  onRemove: () => void;
}

function AttributeRow({
  def,
  value,
  onRename,
  onTypeChange,
  onOptionsChange,
  onValueChange,
  onRemove,
}: AttributeRowProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameLocal, setNameLocal] = useState(def.name);
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[def.type];

  function commitName() {
    const trimmed = nameLocal.trim();
    if (trimmed && trimmed !== def.name) onRename(trimmed);
    else setNameLocal(def.name);
    setEditingName(false);
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/15 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        {/* Name */}
        {editingName ? (
          <input
            autoFocus
            value={nameLocal}
            onChange={(e) => setNameLocal(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") {
                setNameLocal(def.name);
                setEditingName(false);
              }
            }}
            className="flex-1 text-xs bg-background/60 border border-border rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-ring/50"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex-1 text-left text-xs font-medium hover:text-primary transition-colors truncate group"
          >
            {def.name}
            <Pencil className="inline w-2.5 h-2.5 ml-1 opacity-0 group-hover:opacity-40 transition-opacity" />
          </button>
        )}

        {/* Type badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] h-4 px-1.5 cursor-pointer shrink-0",
            typeColor
          )}
          onClick={() => setExpanded((e) => !e)}
        >
          {def.type}
        </Badge>

        {/* Settings toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <Settings2 className="w-3 h-3" />
        </button>

        {/* Delete */}
        <button
          onClick={onRemove}
          className="text-muted-foreground/30 hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Value field */}
      <div className="px-2.5 pb-2.5">
        <AttributeField
          definition={def}
          value={value}
          onChange={onValueChange}
        />
      </div>

      {/* Expanded settings (type change, dropdown options) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="px-2.5 py-2.5 space-y-2 bg-muted/10">
              {/* Type changer */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  Field Type
                </label>
                <select
                  value={def.type}
                  onChange={(e) => onTypeChange(e.target.value as AttributeType)}
                  className={cn(
                    "h-6 w-full rounded border border-border/50 bg-background/40 px-1.5",
                    "text-[11px] text-foreground appearance-none cursor-pointer",
                    "focus:outline-none focus:ring-1 focus:ring-ring/50"
                  )}
                >
                  {ATTRIBUTE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown options editor */}
              {def.type === "dropdown" && (
                <DropdownOptionsEditor
                  options={def.options ?? []}
                  onChange={onOptionsChange}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownOptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (opts: string[]) => void;
}) {
  const [local, setLocal] = useState(options.join("\n"));

  function commit() {
    onChange(local.split("\n").map((s) => s.trim()).filter(Boolean));
  }

  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
        Options (one per line)
      </label>
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        rows={3}
        className={cn(
          "w-full rounded border border-border/50 bg-background/40 px-1.5 py-1",
          "text-[11px] text-foreground resize-none",
          "focus:outline-none focus:ring-1 focus:ring-ring/50"
        )}
        placeholder={"Option A\nOption B\nOption C"}
      />
    </div>
  );
}
