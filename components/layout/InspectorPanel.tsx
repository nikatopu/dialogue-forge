"use client";

import { motion } from "framer-motion";
import {
  MousePointer2,
  Layers,
  Keyboard,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NodeInspector } from "@/components/inspector/NodeInspector";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { cn } from "@/lib/utils";

export function InspectorPanel() {
  const { inspectorOpen, selectedNodeId } = useEditorStore();
  const { nodes } = useGraphStore();

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  return (
    <motion.aside
      animate={{
        width: inspectorOpen ? 300 : 0,
        opacity: inspectorOpen ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="shrink-0 overflow-hidden border-l border-border bg-card flex flex-col"
    >
      <div className="w-75 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Inspector
            </span>
          </div>
          {selectedNode && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-4 px-1.5 capitalize",
                selectedNode.type === "character"
                  ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                  : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
              )}
            >
              {selectedNode.type}
            </Badge>
          )}
        </div>

        {/* Body */}
        {selectedNode ? (
          <NodeInspector node={selectedNode} />
        ) : (
          <ScrollArea className="flex-1">
            <EmptyInspector />
          </ScrollArea>
        )}
      </div>
    </motion.aside>
  );
}

function EmptyInspector() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-5 py-16 text-center">
      <div className="relative mb-5">
        <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
          <MousePointer2 className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </div>

      <p className="text-sm font-semibold text-foreground/80 mb-1">
        Nothing selected
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-45">
        Click a node on the canvas to inspect its properties
      </p>

      <div className="mt-7 w-full space-y-1.5">
        <HintRow icon={Info} text="Select a node to edit dialogue" />
        <HintRow icon={Layers} text="Shift+click for multi-select" />
        <HintRow icon={Keyboard} text="Del removes selected node" />
      </div>
    </div>
  );
}

function HintRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/25 border border-border/40">
      <Icon className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
      <span className="text-[11px] text-muted-foreground">{text}</span>
    </div>
  );
}
