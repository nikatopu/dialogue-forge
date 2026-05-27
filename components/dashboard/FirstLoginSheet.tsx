"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "dialogue-forge-migration-dismissed";

export function markMigrationDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* ignore */ }
}

export function isMigrationDismissed(): boolean {
  try { return !!localStorage.getItem(DISMISSED_KEY); } catch { return false; }
}

interface FirstLoginSheetProps {
  open: boolean;
  nodeCount: number;
  onImport: () => void;
  onChoose: () => void;
  onDismiss: () => void;
}

export function FirstLoginSheet({ open, nodeCount, onImport, onChoose, onDismiss }: FirstLoginSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 z-[200] md:left-auto md:right-5 md:bottom-5 md:max-w-sm"
        >
          <div className="rounded-t-2xl md:rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Local work found</p>
                  <p className="text-[10px] text-muted-foreground">{nodeCount} node{nodeCount !== 1 ? "s" : ""} in your local draft</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3.5 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have unsaved local work. Move it to cloud to access it from any device.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5 cursor-pointer"
                  onClick={onImport}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Import to cloud
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs cursor-pointer"
                  onClick={onChoose}
                >
                  Choose
                </Button>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="w-full text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-0.5 cursor-pointer"
              >
                Skip — keep working locally
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
