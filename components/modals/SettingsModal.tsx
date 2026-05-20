"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Keyboard,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { ConfirmModal } from "./ConfirmModal";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], label: "Undo" },
  { keys: ["Ctrl", "Y"], label: "Redo" },
  { keys: ["Ctrl", "D"], label: "Duplicate node" },
  { keys: ["Ctrl", "C"], label: "Copy node" },
  { keys: ["Ctrl", "V"], label: "Paste node" },
  { keys: ["Ctrl", "F"], label: "Search nodes" },
  { keys: ["Ctrl", "L"], label: "Auto layout" },
  { keys: ["Ctrl", "S"], label: "Save / export" },
  { keys: ["Del"], label: "Delete selected node" },
  { keys: ["Escape"], label: "Deselect / close" },
  { keys: ["Space"], label: "Pan canvas" },
  { keys: ["Shift"], label: "Multi-select" },
];

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useEditorStore();
  const { clearGraph, nodes } = useGraphStore();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !confirmClear) setSettingsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, confirmClear, setSettingsOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setSettingsOpen(false)}
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <h2 className="text-sm font-semibold">Settings</h2>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-muted/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Keyboard shortcuts */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Keyboard className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Keyboard Shortcuts
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    {SHORTCUTS.map((s, i) => (
                      <div
                        key={s.label}
                        className={cn(
                          "flex items-center justify-between px-3 py-2",
                          i !== SHORTCUTS.length - 1 && "border-b border-border/30"
                        )}
                      >
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <div className="flex items-center gap-1">
                          {s.keys.map((k) => (
                            <kbd
                              key={k}
                              className="font-mono bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-[10px] text-foreground/70"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator className="opacity-40" />

                {/* About */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      About
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    Dialogue Forge is a visual branching dialogue editor for games and interactive fiction.
                    Your work is auto-saved to the browser.
                  </p>
                </section>

                <Separator className="opacity-40" />

                {/* Danger zone */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-destructive/70">
                      Danger Zone
                    </span>
                  </div>
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-foreground">Clear workspace</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Delete all nodes, edges, and undo history. This cannot be undone.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="shrink-0 h-7 px-3 text-xs"
                        disabled={nodes.length === 0}
                        onClick={() => setConfirmClear(true)}
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmClear}
        title="Clear workspace?"
        message="This will permanently delete all nodes, edges, and undo history. This action cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={() => {
          clearGraph();
          setConfirmClear(false);
          setSettingsOpen(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>,
    document.body
  );
}
