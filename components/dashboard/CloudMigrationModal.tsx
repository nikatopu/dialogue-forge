"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, HardDrive, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectService } from "@/lib/services/projectService";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProjectStore } from "@/store/useProjectStore";
import { serializeGraph } from "@/lib/exportGraph";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Json } from "@/lib/supabase/types";

interface CloudMigrationModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the new project ID on success */
  onSuccess?: (projectId: string) => void;
}

export function CloudMigrationModal({ open, onClose, onSuccess }: CloudMigrationModalProps) {
  const [keepLocal, setKeepLocal] = useState(true);
  const [phase, setPhase] = useState<"idle" | "saving" | "done">("idle");

  const { nodes, edges, clearGraph } = useGraphStore();
  const { projectName, setCurrentProjectId } = useEditorStore();
  const { canCreateCloudProject, cloudProjectCount, loadProjects } = useProjectStore();

  const nodeCount = nodes.length;
  const atLimit = !canCreateCloudProject();

  async function handleImport() {
    if (atLimit) {
      toast.error("Cloud project limit reached (5/5). Upgrade to save more.");
      return;
    }

    setPhase("saving");
    try {
      const { theme } = useEditorStore.getState();
      const serialized = serializeGraph(
        nodes as Parameters<typeof serializeGraph>[0],
        edges as Parameters<typeof serializeGraph>[1],
        projectName,
      );

      const project = await projectService.create({
        name: projectName,
        graph: { nodes: serialized.nodes, edges: serialized.edges } as unknown as Json,
        mode: "cloud",
        theme,
      });

      setCurrentProjectId(project.id);
      await loadProjects();

      if (!keepLocal) clearGraph();

      setPhase("done");
      toast.success(`"${project.name}" saved to cloud`);

      setTimeout(() => {
        setPhase("idle");
        onSuccess?.(project.id);
        onClose();
      }, 900);
    } catch (err) {
      setPhase("idle");
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("not authenticated")) {
        toast.error("Sign in to save projects to the cloud.");
      } else if (!navigator.onLine) {
        toast.error("You're offline. Connect to the internet and try again.");
      } else {
        toast.error("Failed to save to cloud. Please try again.");
      }
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && phase === "idle") onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-border/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Import to Cloud</p>
                <p className="text-xs text-muted-foreground">Upload your local draft as a cloud project</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Draft summary */}
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-3.5 py-3">
                <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                  <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{projectName}</p>
                  <p className="text-[10px] text-muted-foreground">{nodeCount} node{nodeCount !== 1 ? "s" : ""} · local draft</p>
                </div>
                <Cloud className="w-3.5 h-3.5 text-sky-400/70 shrink-0" />
              </div>

              {/* Quota warning */}
              {atLimit && (
                <p className="text-xs text-destructive/80 bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
                  Cloud project limit reached ({cloudProjectCount}/5). Delete a project to continue.
                </p>
              )}

              {/* Keep local toggle */}
              <button
                type="button"
                onClick={() => setKeepLocal((v) => !v)}
                className="flex items-center gap-2.5 cursor-pointer select-none w-full text-left"
              >
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                  keepLocal ? "bg-primary border-primary" : "border-border hover:border-primary/50",
                )}>
                  {keepLocal && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-current text-primary-foreground" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,4 3.5,6.5 9,1" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Keep local copy after importing</span>
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs cursor-pointer"
                onClick={onClose}
                disabled={phase !== "idle"}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 cursor-pointer"
                onClick={handleImport}
                disabled={nodeCount === 0 || phase !== "idle" || atLimit}
              >
                {phase === "saving" ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
                ) : phase === "done" ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" />Saved!</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" />Import to Cloud</>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
