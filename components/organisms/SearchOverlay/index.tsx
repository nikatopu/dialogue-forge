"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import cn from "classnames";
import type { ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData } from "@/types";
import style from "./SearchOverlay.module.scss";

function getNodeLabel(node: ForgeNode): string {
  if (node.type === "character") return (node.data as CharacterNodeData).name || "Unnamed";
  if (node.type === "start") return (node.data as StartNodeData).name || "Entry Point";
  return (node.data as ActionNodeData).label || "Action";
}

function getNodeSubtitle(node: ForgeNode): string {
  if (node.type === "character") {
    const d = node.data as CharacterNodeData;
    return d.dialogue ? d.dialogue.slice(0, 60) + (d.dialogue.length > 60 ? "…" : "") : "";
  }
  if (node.type === "start") return "start";
  return (node.data as ActionNodeData).actionType;
}

function nodeMatchesQuery(node: ForgeNode, query: string): boolean {
  const q = query.toLowerCase();
  return getNodeLabel(node).toLowerCase().includes(q) || getNodeSubtitle(node).toLowerCase().includes(q);
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSelectedNodeId } = useEditorStore();
  const { nodes } = useGraphStore();
  const { setCenter } = useReactFlow();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && searchOpen) setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = query.trim() ? nodes.filter((n) => nodeMatchesQuery(n, query.trim())) : [];

  const handleSelect = useCallback(
    (node: ForgeNode) => {
      setSelectedNodeId(node.id);
      setCenter(node.position.x + 100, node.position.y + 60, { zoom: 1.2, duration: 400 });
      setSearchOpen(false);
    },
    [setSelectedNodeId, setCenter, setSearchOpen],
  );

  const typeBadgeClass = (type: string) => cn(
    style.typeBadge,
    type === "character" && style.typeBadgeCharacter,
    type === "start" && style.typeBadgeStart,
    type === "action" && style.typeBadgeAction,
  );

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={style.overlay}
        >
          <div className={style.panel}>
            <div className={style.inputRow}>
              <Search size={14} style={{ color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nodes…"
                aria-label="Search nodes"
                className={style.input}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className={style.clearBtn}>
                  <X size={14} />
                </button>
              )}
            </div>

            {query.trim() && (
              <div className={style.results}>
                {results.length === 0
                  ? <p className={style.empty}>No nodes match &ldquo;{query}&rdquo;</p>
                  : results.map((node) => (
                    <button key={node.id} type="button" onClick={() => handleSelect(node)} className={style.resultItem}>
                      <span className={typeBadgeClass(node.type)}>{node.type}</span>
                      <div className={style.resultInfo}>
                        <p className={style.resultName}>{getNodeLabel(node)}</p>
                        {getNodeSubtitle(node) && <p className={style.resultSub}>{getNodeSubtitle(node)}</p>}
                      </div>
                    </button>
                  ))
                }
              </div>
            )}

            {!query.trim() && (
              <p className={style.hint}>
                Type to search across {nodes.length} node{nodes.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
