"use client";

import { motion } from "framer-motion";
import { MousePointer2, Layers, Keyboard, Info, X } from "lucide-react";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Badge } from "@/components/atoms/Badge";
import { BottomSheet } from "@/components/atoms/BottomSheet";
import { NodeInspector } from "@/components/organisms/NodeInspector";
import { EdgeInspector } from "@/components/organisms/EdgeInspector";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import cn from "classnames";
import type { ForgeNode } from "@/types";
import style from "./InspectorPanel.module.scss";

const NODE_TYPE_BADGE: Record<string, string> = {
  character: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  action:    "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  start:     "text-teal-400 border-teal-500/30 bg-teal-500/10",
};

export function InspectorPanel() {
  const { inspectorOpen, selectedNodeId, selectedEdgeId, mobileInspectorOpen, setMobileInspectorOpen } = useEditorStore();
  const { nodes } = useGraphStore();
  const isMobile = useIsMobile();

  const selectedNode = selectedNodeId ? (nodes.find((n) => n.id === selectedNodeId) ?? null) : null;
  const showEdge = !selectedNode && !!selectedEdgeId;

  if (isMobile) {
    return (
      <BottomSheet open={mobileInspectorOpen} onClose={() => setMobileInspectorOpen(false)} size="full" title="Inspector">
        {selectedNode
          ? <NodeInspector node={selectedNode} />
          : showEdge
          ? <EdgeInspector edgeId={selectedEdgeId!} />
          : <EmptyInspector />
        }
      </BottomSheet>
    );
  }

  return (
    <motion.aside
      animate={{ width: inspectorOpen ? 300 : 0, opacity: inspectorOpen ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className={style.panel}
    >
      <div className={style.inner}>
        <InspectorHeader selectedNode={selectedNode} showEdge={showEdge} />
        {selectedNode
          ? <NodeInspector node={selectedNode} />
          : showEdge
          ? <EdgeInspector edgeId={selectedEdgeId!} />
          : <ScrollArea style={{ flex: 1 }}><EmptyInspector /></ScrollArea>
        }
      </div>
    </motion.aside>
  );
}

function InspectorHeader({ selectedNode, showEdge, onClose, showClose }: {
  selectedNode: ForgeNode | null;
  showEdge?: boolean;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <div className={style.panelHeader}>
      <div className={style.panelHeaderLeft}>
        <Layers size={14} style={{ color: "var(--muted-foreground)" }} />
        <span className={style.panelTitle}>Inspector</span>
      </div>
      <div className={style.panelHeaderRight}>
        {selectedNode && (
          <Badge
            variant="outline"
            className={cn("text-[10px] capitalize", NODE_TYPE_BADGE[selectedNode.type] ?? NODE_TYPE_BADGE.action)}
            style={{ height: "1rem", padding: "0 0.375rem" }}
          >
            {selectedNode.type}
          </Badge>
        )}
        {showEdge && !selectedNode && (
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ height: "1rem", padding: "0 0.375rem", color: "oklch(0.65 0.19 260)", borderColor: "oklch(0.52 0.255 262 / 30%)", backgroundColor: "oklch(0.52 0.255 262 / 10%)" }}
          >
            edge
          </Badge>
        )}
        {showClose && onClose && (
          <button type="button" onClick={onClose} aria-label="Close inspector" className={style.closeBtn}>
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyInspector() {
  return (
    <div className={style.emptyState}>
      <div className={style.emptyIcon}>
        <div className={style.emptyIconBox}>
          <MousePointer2 size={20} style={{ color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)" }} />
        </div>
        <div className={style.emptyIconDot}>
          <div className={style.emptyIconDotInner} />
        </div>
      </div>

      <p className={style.emptyTitle}>Nothing selected</p>
      <p className={style.emptySubtitle}>Tap a node on the canvas to inspect its properties</p>

      <div className={style.hints}>
        <HintRow icon={Info} text="Select a node to edit dialogue" />
        <HintRow icon={Layers} text="Shift+click for multi-select" />
        <HintRow icon={Keyboard} text="Del removes selected node" />
      </div>
    </div>
  );
}

function HintRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className={style.hintRow}>
      <Icon size={14} style={{ color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)", flexShrink: 0 }} />
      <span className={style.hintText}>{text}</span>
    </div>
  );
}
