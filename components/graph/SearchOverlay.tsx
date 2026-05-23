"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { cn } from "@/lib/utils";
import type { ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData } from "@/types";

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
  const label = getNodeLabel(node).toLowerCase();
  const sub = getNodeSubtitle(node).toLowerCase();
  return label.includes(q) || sub.includes(q);
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSelectedNodeId } = useEditorStore();
  const { nodes } = useGraphStore();
  const { setCenter } = useReactFlow();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Focus input when opened */
  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = query.trim()
    ? nodes.filter((n) => nodeMatchesQuery(n, query.trim()))
    : [];

  const handleSelect = useCallback(
    (node: ForgeNode) => {
      setSelectedNodeId(node.id);
      setCenter(node.position.x + 100, node.position.y + 60, {
        zoom: 1.2,
        duration: 400,
      });
      setSearchOpen(false);
    },
    [setSelectedNodeId, setCenter, setSearchOpen]
  );

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-80"
        >
          <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Input row */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
              <Search className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nodes…"
                aria-label="Search nodes"
                className={cn(
                  "flex-1 bg-transparent text-sm text-foreground",
                  "placeholder:text-muted-foreground/40 outline-none"
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            {query.trim() && (
              <div className="max-h-60 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 text-center py-4">
                    No nodes match &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  results.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSelect(node)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left",
                        "hover:bg-muted/40 transition-colors"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0",
                          node.type === "character"
                            ? "bg-indigo-500/15 text-indigo-400"
                            : node.type === "start"
                              ? "bg-teal-500/15 text-teal-400"
                              : "bg-emerald-500/15 text-emerald-400"
                        )}
                      >
                        {node.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {getNodeLabel(node)}
                        </p>
                        {getNodeSubtitle(node) && (
                          <p className="text-[10px] text-muted-foreground/50 truncate">
                            {getNodeSubtitle(node)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {!query.trim() && (
              <p className="text-[11px] text-muted-foreground/40 text-center py-3">
                Type to search across {nodes.length} node{nodes.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
