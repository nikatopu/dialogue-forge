"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { useVariableStore } from "@/store/useVariableStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { renameVariableInGraph } from "@/lib/variableRename";
import { useShallow } from "zustand/react/shallow";
import type { ProjectVariable, SerialNode, SerialEdge } from "@/types";
import { blankEdit, editFromVariable, coerceDefaultValue, type EditingState } from "./editorState";
import { VariableEditor } from "./VariableEditor";
import { VariableList } from "./VariableList";
import style from "./VariablesPanel.module.scss";

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

    const defaultValue = coerceDefaultValue(editing);

    if (editing.id) {
      // Rename flow: if name changed, update dialogue references in graph
      const existingVar = variables.find((v) => v.id === editing.id);
      const oldName = existingVar?.name ?? "";
      if (oldName && oldName !== name) {
        const result = renameVariableInGraph(nodes as SerialNode[], edges as SerialEdge[], oldName, name);
        if (result.dialogueUpdated > 0) loadGraph(result.nodes, result.edges);
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

  if (!variablesPanelOpen) return null;

  return createPortal(
    <AnimatePresence>
      {variablesPanelOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={style.overlay}>
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
            <div className={style.header}>
              <div className={style.headerLeft}>
                <div className={style.headerIcon}>
                  <SlidersHorizontal size={13} className={style.headerIconGlyph} />
                </div>
                <span className={style.headerTitle}>Variables</span>
                {variables.length > 0 && <span className={style.headerCount}>{variables.length}</span>}
              </div>
              <div className={style.headerRight}>
                <Button variant="ghost" size="sm" onClick={() => setEditing(blankEdit())} className={style.newBtn} disabled={editing !== null}>
                  <Plus size={12} />
                  New
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setVariablesPanelOpen(false)} className={style.closeBtn} aria-label="Close variables panel">
                  <X size={14} />
                </Button>
              </div>
            </div>

            <Separator className={style.headerSeparator} />

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

            <ScrollArea className={style.scroll}>
              <div className={style.body}>
                <AnimatePresence>
                  {editing && (
                    <VariableEditor
                      editing={editing}
                      nameInputRef={nameInputRef}
                      onChange={setEditing}
                      onSave={handleSave}
                      onCancel={() => setEditing(null)}
                    />
                  )}
                </AnimatePresence>

                {variables.length === 0 && !editing && (
                  <div className={style.emptyState}>
                    <div className={style.emptyIcon}>
                      <SlidersHorizontal size={24} className={style.emptyIconGlyph} />
                    </div>
                    <p className={style.emptyTitle}>No variables yet</p>
                    <p className={style.emptySubtitle}>
                      Variables let you track game state — gold, quest progress, relationships, flags.
                    </p>
                    <Button size="sm" onClick={() => setEditing(blankEdit())} className={style.emptyBtn}>
                      <Plus size={12} />
                      Create your first variable
                    </Button>
                  </div>
                )}

                {filtered.length > 0 && (
                  <VariableList
                    variables={filtered}
                    nodes={nodes}
                    edges={edges}
                    deleteConfirmId={deleteConfirm}
                    onEdit={startEdit}
                    onRequestDelete={setDeleteConfirm}
                    onConfirmDelete={removeVariable}
                    onCancelDelete={() => setDeleteConfirm(null)}
                  />
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
