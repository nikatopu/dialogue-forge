"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Search, SlidersHorizontal, Hash, ToggleLeft, Type,
  Pencil, Trash2, Check, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { useVariableStore, defaultValueForType } from "@/store/useVariableStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { computeVariableUsage } from "@/lib/variableUsage";
import { useShallow } from "zustand/react/shallow";
import cn from "classnames";
import type { ProjectVariable, VariableType } from "@/types";
import style from "./VariablesPanel.module.scss";

const TYPE_CONFIG: Record<VariableType, { icon: React.ElementType; label: string; color: string }> = {
  number:  { icon: Hash,        label: "Number",  color: "oklch(0.72 0.18 220)" },
  boolean: { icon: ToggleLeft,  label: "Boolean", color: "oklch(0.72 0.18 155)" },
  string:  { icon: Type,        label: "String",  color: "oklch(0.72 0.18 50)"  },
};

interface EditingState {
  id: string | null; // null = creating new
  name: string;
  type: VariableType;
  defaultValue: string;
  description: string;
}

function blankEdit(): EditingState {
  return { id: null, name: "", type: "number", defaultValue: "0", description: "" };
}

export function VariablesPanel() {
  const { variablesPanelOpen, setVariablesPanelOpen } = useEditorStore();
  const { variables, addVariable, updateVariable, removeVariable } = useVariableStore();
  const { nodes, edges } = useGraphStore(useShallow((s) => ({ nodes: s.nodes, edges: s.edges })));

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

    let defaultValue: number | boolean | string;
    if (editing.type === "number") {
      defaultValue = isNaN(Number(editing.defaultValue)) ? 0 : Number(editing.defaultValue);
    } else if (editing.type === "boolean") {
      defaultValue = editing.defaultValue === "true";
    } else {
      defaultValue = editing.defaultValue;
    }

    if (editing.id) {
      updateVariable(editing.id, { name, type: editing.type, defaultValue, description: editing.description || undefined });
    } else {
      addVariable({ name, type: editing.type, defaultValue, description: editing.description || undefined });
    }
    setEditing(null);
  }

  function startEdit(v: ProjectVariable) {
    setEditing({
      id: v.id,
      name: v.name,
      type: v.type,
      defaultValue: String(v.defaultValue),
      description: v.description ?? "",
    });
  }

  function handleTypeChange(type: VariableType) {
    if (!editing) return;
    setEditing({ ...editing, type, defaultValue: String(defaultValueForType(type)) });
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
                          {(["number", "boolean", "string"] as VariableType[]).map((t) => {
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
                      const cfg = TYPE_CONFIG[v.type];
                      const Icon = cfg.icon;
                      const isDeleting = deleteConfirm === v.id;

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
                              <p className={style.varMeta}>
                                {cfg.label} · default: <code className={style.varDefault}>{String(v.defaultValue)}</code>
                              </p>
                              {v.description && (
                                <p className={style.varDesc}>{v.description}</p>
                              )}
                              {usage.total > 0 && (
                                <p className={style.varUsage}>
                                  {usage.conditionCount > 0 && `${usage.conditionCount} condition${usage.conditionCount !== 1 ? "s" : ""}`}
                                  {usage.conditionCount > 0 && usage.actionCount > 0 && " · "}
                                  {usage.actionCount > 0 && `${usage.actionCount} action${usage.actionCount !== 1 ? "s" : ""}`}
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
