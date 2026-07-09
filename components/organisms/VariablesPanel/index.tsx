"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Search, SlidersHorizontal, Hash, ToggleLeft, Type,
  Pencil, Trash2, Check, AlertCircle, List, Braces,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { TypeBadge } from "@/components/atoms/TypeBadge";
import { useVariableStore, defaultValueForType } from "@/store/useVariableStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { computeVariableUsage } from "@/lib/variableUsage";
import { renameVariableInGraph } from "@/lib/variableRename";
import { parseVariableReferences } from "@/lib/interpolation/parseVariableReferences";
import { useShallow } from "zustand/react/shallow";
import cn from "classnames";
import type { ProjectVariable, VariableType, CharacterNodeData } from "@/types";
import style from "./VariablesPanel.module.scss";

const TYPE_CONFIG: Record<VariableType, { icon: React.ElementType; label: string; color: string }> = {
  number:  { icon: Hash,        label: "Number",  color: "oklch(0.72 0.18 220)" },
  float:   { icon: Hash,        label: "Float",   color: "oklch(0.72 0.18 240)" },
  boolean: { icon: ToggleLeft,  label: "Boolean", color: "oklch(0.72 0.18 155)" },
  string:  { icon: Type,        label: "String",  color: "oklch(0.72 0.18 50)"  },
  list:    { icon: List,        label: "List",    color: "oklch(0.72 0.18 290)" },
  object:  { icon: Braces,      label: "Object",  color: "oklch(0.72 0.18 30)"  },
};

interface EditingState {
  id: string | null; // null = creating new
  name: string;
  type: VariableType;
  defaultValue: string;
  description: string;
  /** For list type: the parsed array being edited */
  listItems: string[];
  /** For list type: the current "add item" input value */
  listInput: string;
  /** For object type: the parsed entries being edited */
  objectEntries: Array<{ key: string; value: string }>;
  /** For object type: show raw JSON textarea */
  objectJsonMode: boolean;
  /** For object type: raw JSON textarea text */
  objectJsonText: string;
}

function blankEdit(): EditingState {
  return {
    id: null,
    name: "",
    type: "number",
    defaultValue: "0",
    description: "",
    listItems: [],
    listInput: "",
    objectEntries: [],
    objectJsonMode: false,
    objectJsonText: "{}",
  };
}

function editFromVariable(v: ProjectVariable): EditingState {
  let listItems: string[] = [];
  let objectEntries: Array<{ key: string; value: string }> = [];
  let objectJsonText = "{}";
  let defaultValue = String(v.defaultValue);

  if (v.type === "list") {
    if (Array.isArray(v.defaultValue)) {
      listItems = v.defaultValue as string[];
    }
    defaultValue = "";
  } else if (v.type === "object") {
    const obj = (v.defaultValue && typeof v.defaultValue === "object" && !Array.isArray(v.defaultValue))
      ? v.defaultValue as Record<string, unknown>
      : {};
    objectEntries = Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
    objectJsonText = JSON.stringify(obj, null, 2);
    defaultValue = "";
  }

  return {
    id: v.id,
    name: v.name,
    type: v.type,
    defaultValue,
    description: v.description ?? "",
    listItems,
    listInput: "",
    objectEntries,
    objectJsonMode: false,
    objectJsonText,
  };
}

function computeDialogueCount(variableName: string, nodes: import("@/types").ForgeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type !== "character") continue;
    const data = node.data as CharacterNodeData;
    const dialogue = data.dialogue ?? "";
    const refs = parseVariableReferences(dialogue);
    for (const ref of refs) {
      if (ref.path[0] === variableName) count++;
    }
  }
  return count;
}

export function VariablesPanel() {
  const { variablesPanelOpen, setVariablesPanelOpen } = useEditorStore();
  const { variables, addVariable, updateVariable, removeVariable } = useVariableStore();
  const { nodes, edges, loadGraph } = useGraphStore(
    useShallow((s) => ({ nodes: s.nodes, edges: s.edges, loadGraph: s.loadGraph })),
  );

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [editing]);

  useEffect(() => {
    if (!variablesPanelOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editing) { setEditing(null); return; }
        setVariablesPanelOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variablesPanelOpen, editing, setVariablesPanelOpen]);

  const filtered = variables.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave() {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;

    let defaultValue: number | boolean | string | string[] | Record<string, unknown>;

    if (editing.type === "number") {
      defaultValue = isNaN(Number(editing.defaultValue)) ? 0 : Number(editing.defaultValue);
    } else if (editing.type === "float") {
      defaultValue = isNaN(parseFloat(editing.defaultValue)) ? 0.0 : parseFloat(editing.defaultValue);
    } else if (editing.type === "boolean") {
      defaultValue = editing.defaultValue === "true";
    } else if (editing.type === "list") {
      defaultValue = editing.listItems;
    } else if (editing.type === "object") {
      if (editing.objectJsonMode) {
        try {
          defaultValue = JSON.parse(editing.objectJsonText) as Record<string, unknown>;
        } catch {
          defaultValue = {};
        }
      } else {
        const obj: Record<string, string> = {};
        for (const { key, value } of editing.objectEntries) {
          if (key.trim()) obj[key.trim()] = value;
        }
        defaultValue = obj;
      }
    } else {
      defaultValue = editing.defaultValue;
    }

    if (editing.id) {
      // Rename flow: if name changed, update dialogue references in graph
      const existingVar = variables.find((v) => v.id === editing.id);
      const oldName = existingVar?.name ?? "";

      if (oldName && oldName !== name) {
        const result = renameVariableInGraph(
          nodes as import("@/types").SerialNode[],
          edges as import("@/types").SerialEdge[],
          oldName,
          name,
        );
        if (result.dialogueUpdated > 0) {
          loadGraph(result.nodes, result.edges);
        }
      }

      updateVariable(editing.id, {
        name,
        type: editing.type,
        defaultValue,
        description: editing.description || undefined,
      });
    } else {
      addVariable({ name, type: editing.type, defaultValue, description: editing.description || undefined });
    }
    setEditing(null);
  }

  function startEdit(v: ProjectVariable) {
    setEditing(editFromVariable(v));
  }

  function handleTypeChange(type: VariableType) {
    if (!editing) return;
    const rawDefault = defaultValueForType(type);
    const listItems = type === "list" ? [] : [];
    const objectEntries: Array<{ key: string; value: string }> = [];
    setEditing({
      ...editing,
      type,
      defaultValue: String(rawDefault),
      listItems,
      listInput: "",
      objectEntries,
      objectJsonMode: false,
      objectJsonText: "{}",
    });
  }

  // List helpers
  function listAddItem() {
    if (!editing) return;
    const item = editing.listInput.trim();
    if (!item) return;
    setEditing({ ...editing, listItems: [...editing.listItems, item], listInput: "" });
  }

  function listRemoveItem(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, listItems: editing.listItems.filter((_, i) => i !== idx) });
  }

  // Object helpers
  function objectAddEntry() {
    if (!editing) return;
    setEditing({ ...editing, objectEntries: [...editing.objectEntries, { key: "", value: "" }] });
  }

  function objectUpdateEntry(idx: number, field: "key" | "value", val: string) {
    if (!editing) return;
    const updated = editing.objectEntries.map((e, i) => i === idx ? { ...e, [field]: val } : e);
    setEditing({ ...editing, objectEntries: updated });
  }

  function objectRemoveEntry(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, objectEntries: editing.objectEntries.filter((_, i) => i !== idx) });
  }

  function objectToggleJsonMode() {
    if (!editing) return;
    if (!editing.objectJsonMode) {
      // switching to JSON mode — serialize current entries
      const obj: Record<string, string> = {};
      for (const { key, value } of editing.objectEntries) {
        if (key.trim()) obj[key.trim()] = value;
      }
      setEditing({ ...editing, objectJsonMode: true, objectJsonText: JSON.stringify(obj, null, 2) });
    } else {
      // switching back to structured mode — parse JSON
      let entries: Array<{ key: string; value: string }> = [];
      try {
        const parsed = JSON.parse(editing.objectJsonText) as Record<string, unknown>;
        entries = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
      } catch {
        entries = editing.objectEntries;
      }
      setEditing({ ...editing, objectJsonMode: false, objectEntries: entries });
    }
  }

  if (!variablesPanelOpen) return null;

  return createPortal(
    <AnimatePresence>
      {variablesPanelOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={style.overlay}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={style.backdrop}
            onClick={() => { if (!editing) setVariablesPanelOpen(false); }}
          />
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className={style.panel}
          >
            {/* Header */}
            <div className={style.header}>
              <div className={style.headerLeft}>
                <div className={style.headerIcon}>
                  <SlidersHorizontal size={13} style={{ color: "oklch(0.72 0.19 310)" }} />
                </div>
                <span className={style.headerTitle}>Variables</span>
                {variables.length > 0 && (
                  <span className={style.headerCount}>{variables.length}</span>
                )}
              </div>
              <div className={style.headerRight}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(blankEdit())}
                  className={style.newBtn}
                  disabled={editing !== null}
                >
                  <Plus size={12} />
                  New
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setVariablesPanelOpen(false)}
                  style={{ width: "1.75rem", height: "1.75rem" }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>

            <Separator style={{ opacity: 0.4 }} />

            {/* Search */}
            {variables.length > 0 && (
              <div className={style.searchArea}>
                <Search size={12} className={style.searchIcon} />
                <input
                  placeholder="Search variables…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={style.searchInput}
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className={style.clearBtn}>
                    <X size={10} />
                  </button>
                )}
              </div>
            )}

            <ScrollArea style={{ flex: 1 }}>
              <div className={style.body}>
                {/* Create / Edit form */}
                <AnimatePresence>
                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={style.editForm}
                    >
                      <p className={style.editFormTitle}>
                        {editing.id ? "Edit variable" : "New variable"}
                      </p>

                      <div className={style.formField}>
                        <label className={style.formLabel}>Name</label>
                        <input
                          ref={nameInputRef}
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(null); }}
                          placeholder="e.g. gold, hasKey, questState"
                          className={style.formInput}
                        />
                      </div>

                      <div className={style.formField}>
                        <label className={style.formLabel}>Type</label>
                        <div className={style.typeGrid}>
                          {(["number", "float", "boolean", "string", "list", "object"] as VariableType[]).map((t) => {
                            const cfg = TYPE_CONFIG[t];
                            const Icon = cfg.icon;
                            const active = editing.type === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleTypeChange(t)}
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

                      <div className={style.formField}>
                        <label className={style.formLabel}>Default Value</label>

                        {editing.type === "boolean" ? (
                          <select
                            value={editing.defaultValue}
                            onChange={(e) => setEditing({ ...editing, defaultValue: e.target.value })}
                            className={style.formSelect}
                          >
                            <option value="false">false</option>
                            <option value="true">true</option>
                          </select>
                        ) : editing.type === "float" ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.defaultValue}
                            onChange={(e) => setEditing({ ...editing, defaultValue: e.target.value })}
                            placeholder="0.0"
                            className={style.formInput}
                          />
                        ) : editing.type === "list" ? (
                          <div className={style.listEditor}>
                            {editing.listItems.map((item, idx) => (
                              <div key={idx} className={style.listChip}>
                                <span className={style.listChipText}>{item}</span>
                                <button
                                  type="button"
                                  onClick={() => listRemoveItem(idx)}
                                  className={style.listChipRemove}
                                  aria-label="Remove item"
                                >
                                  <X size={9} />
                                </button>
                              </div>
                            ))}
                            <div className={style.listAddRow}>
                              <input
                                value={editing.listInput}
                                onChange={(e) => setEditing({ ...editing, listInput: e.target.value })}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); listAddItem(); } }}
                                placeholder="Add item…"
                                className={cn(style.formInput, style.listAddInput)}
                              />
                              <button
                                type="button"
                                onClick={listAddItem}
                                className={style.listAddBtn}
                                disabled={!editing.listInput.trim()}
                                title="Add item"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          </div>
                        ) : editing.type === "object" ? (
                          <div className={style.objectEditor}>
                            <button
                              type="button"
                              onClick={objectToggleJsonMode}
                              className={style.objectJsonToggle}
                            >
                              {editing.objectJsonMode ? "Structured view" : "Advanced JSON"}
                            </button>
                            {editing.objectJsonMode ? (
                              <textarea
                                value={editing.objectJsonText}
                                onChange={(e) => setEditing({ ...editing, objectJsonText: e.target.value })}
                                className={style.objectJsonArea}
                                rows={5}
                                spellCheck={false}
                                aria-label="Object JSON"
                                placeholder="{}"
                              />
                            ) : (
                              <>
                                {editing.objectEntries.map((entry, idx) => (
                                  <div key={idx} className={style.objectRow}>
                                    <input
                                      value={entry.key}
                                      onChange={(e) => objectUpdateEntry(idx, "key", e.target.value)}
                                      placeholder="key"
                                      className={cn(style.formInput, style.objectKeyInput)}
                                    />
                                    <span className={style.objectColon}>:</span>
                                    <input
                                      value={entry.value}
                                      onChange={(e) => objectUpdateEntry(idx, "value", e.target.value)}
                                      placeholder="value"
                                      className={cn(style.formInput, style.objectValueInput)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => objectRemoveEntry(idx)}
                                      className={style.objectRemoveBtn}
                                      aria-label="Remove property"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={objectAddEntry}
                                  className={style.objectAddBtn}
                                >
                                  <Plus size={11} />
                                  Add property
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <input
                            value={editing.defaultValue}
                            onChange={(e) => setEditing({ ...editing, defaultValue: e.target.value })}
                            placeholder={editing.type === "number" ? "0" : "value"}
                            className={style.formInput}
                          />
                        )}
                      </div>

                      <div className={style.formField}>
                        <label className={style.formLabel}>Description <span className={style.optional}>(optional)</span></label>
                        <input
                          value={editing.description}
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                          placeholder="What is this variable for?"
                          className={style.formInput}
                        />
                      </div>

                      <div className={style.formActions}>
                        <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={!editing.name.trim()}
                          style={{ gap: "0.25rem" }}
                        >
                          <Check size={12} />
                          {editing.id ? "Save" : "Create"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {variables.length === 0 && !editing && (
                  <div className={style.emptyState}>
                    <div className={style.emptyIcon}>
                      <SlidersHorizontal size={24} style={{ color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)" }} />
                    </div>
                    <p className={style.emptyTitle}>No variables yet</p>
                    <p className={style.emptySubtitle}>
                      Variables let you track game state — gold, quest progress, relationships, flags.
                    </p>
                    <Button size="sm" onClick={() => setEditing(blankEdit())} style={{ gap: "0.375rem", marginTop: "0.5rem" }}>
                      <Plus size={12} />
                      Create your first variable
                    </Button>
                  </div>
                )}

                {/* Variable list */}
                {filtered.length > 0 && (
                  <div className={style.list}>
                    {filtered.map((v) => {
                      const usage = computeVariableUsage(v.id, nodes, edges);
                      const dialogueCount = computeDialogueCount(v.name, nodes);
                      const cfg = TYPE_CONFIG[v.type];
                      const Icon = cfg.icon;
                      const isDeleting = deleteConfirm === v.id;
                      const totalUsage = usage.conditionCount + usage.actionCount + dialogueCount;

                      const usageParts: string[] = [];
                      if (dialogueCount > 0) usageParts.push(`${dialogueCount} dialogue`);
                      if (usage.conditionCount > 0) usageParts.push(`${usage.conditionCount} condition${usage.conditionCount !== 1 ? "s" : ""}`);
                      if (usage.actionCount > 0) usageParts.push(`${usage.actionCount} action${usage.actionCount !== 1 ? "s" : ""}`);

                      return (
                        <motion.div
                          key={v.id}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className={cn(style.varCard, isDeleting && style.varCardDeleting)}
                        >
                          <div className={style.varCardLeft}>
                            <div className={style.varTypeIcon} style={{ color: cfg.color, backgroundColor: `color-mix(in oklch, ${cfg.color} 10%, transparent)` }}>
                              <Icon size={12} />
                            </div>
                            <div className={style.varInfo}>
                              <p className={style.varName}>{v.name}</p>
                              <div className={style.varMetaRow}>
                                <TypeBadge type={v.type} />
                                <span className={style.varMetaSep}>·</span>
                                <span className={style.varMeta}>
                                  default: <code className={style.varDefault}>
                                    {v.type === "list"
                                      ? `[${(v.defaultValue as string[]).join(", ")}]`
                                      : v.type === "object"
                                      ? JSON.stringify(v.defaultValue)
                                      : String(v.defaultValue)}
                                  </code>
                                </span>
                              </div>
                              {v.description && (
                                <p className={style.varDesc}>{v.description}</p>
                              )}
                              {totalUsage > 0 && (
                                <p className={style.varUsage}>
                                  {usageParts.join(" · ")}
                                </p>
                              )}
                              {isDeleting && totalUsage > 0 && (
                                <p className={style.varDeleteWarning}>
                                  Used in{dialogueCount > 0 ? ` ${dialogueCount} dialogue node${dialogueCount !== 1 ? "s" : ""},` : ""}
                                  {usage.conditionCount > 0 ? ` ${usage.conditionCount} condition${usage.conditionCount !== 1 ? "s" : ""},` : ""}
                                  {usage.actionCount > 0 ? ` ${usage.actionCount} action${usage.actionCount !== 1 ? "s" : ""}` : ""}
                                  .
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={style.varCardActions}>
                            {isDeleting ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => removeVariable(v.id)}
                                  className={cn(style.iconBtn, style.iconBtnDestructive)}
                                  title="Confirm delete"
                                >
                                  <AlertCircle size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm(null)}
                                  className={style.iconBtn}
                                  title="Cancel"
                                >
                                  <X size={13} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(v)}
                                  className={style.iconBtn}
                                  title="Edit"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm(v.id)}
                                  className={cn(style.iconBtn, style.iconBtnDestructiveHover)}
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {search && filtered.length === 0 && variables.length > 0 && (
                  <p className={style.noResults}>No variables match &ldquo;{search}&rdquo;</p>
                )}
              </div>
            </ScrollArea>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
