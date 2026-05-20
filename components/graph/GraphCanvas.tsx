"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Network, Mouse, Sparkles, SkipForward } from "lucide-react";
import { useGraphStore as useGraphStoreForDemo } from "@/store/useGraphStore";
import { useEditorStore as useEditorStoreForDemo } from "@/store/useEditorStore";
import { DEMO_NODES, DEMO_EDGES, DEMO_PROJECT_NAME } from "@/lib/demoProject";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { nodeTypes } from "@/components/nodes";
import { edgeTypes } from "@/components/edges";
import { ContextMenu } from "./ContextMenu";
import { SearchOverlay } from "./SearchOverlay";
import { computeAutoLayout } from "@/lib/autoLayout";
import { cn } from "@/lib/utils";
import type { ForgeNodeType } from "@/types";

/* ─── Provider wrapper ─────────────────────────────────────── */

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
      <ContextMenu />
    </ReactFlowProvider>
  );
}

export { SearchOverlay };

/* ─── Inner editor (can use useReactFlow) ──────────────────── */

function FlowEditor() {
  const { screenToFlowPosition } = useReactFlow();
  const { setSelectedNodeId, setContextMenu, setSearchOpen, pickingJumpFor, setPickingJumpFor } = useEditorStore();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    duplicateNode,
    removeNode,
    removeNodes,
    copySelected,
    pasteSelected,
    setJumpTarget,
    undo,
    redo,
    saveSnapshot,
    setNodePositions,
  } = useGraphStore();
  const { fitView } = useReactFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  /* ── DnD from sidebar ── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData(
        "application/forge-node-type"
      ) as ForgeNodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = addNode(nodeType, position);
      setSelectedNodeId(id);
    },
    [screenToFlowPosition, addNode, setSelectedNodeId]
  );

  /* ── Node selection ── */
  const onNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      const { pickingJumpFor: picking } = useEditorStore.getState();
      if (picking) {
        if (node.id !== picking) setJumpTarget(picking, node.id);
        setPickingJumpFor(null);
        return;
      }
      setSelectedNodeId(node.id);
      setContextMenu(null);
    },
    [setSelectedNodeId, setContextMenu, setJumpTarget, setPickingJumpFor]
  );

  const onPaneClick = useCallback(() => {
    if (useEditorStore.getState().pickingJumpFor) {
      setPickingJumpFor(null);
      return;
    }
    setSelectedNodeId(null);
    setContextMenu(null);
  }, [setSelectedNodeId, setContextMenu, setPickingJumpFor]);

  /* ── Context menu ── */
  const onNodeContextMenu = useCallback<NodeMouseHandler>(
    (e, node) => {
      e.preventDefault();
      setSelectedNodeId(node.id);
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
    },
    [setSelectedNodeId, setContextMenu]
  );

  /* ── Snapshot before drag so position changes are undoable ── */
  const onNodeDragStart = useCallback(() => {
    saveSnapshot();
  }, [saveSnapshot]);

  /* ── Keyboard shortcuts ── */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      /* Don't intercept when user is typing in an input */
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
        return;
      }
      if (ctrl && e.key === "d") {
        e.preventDefault();
        const { selectedNodeId } = useEditorStore.getState();
        if (selectedNodeId) duplicateNode(selectedNodeId);
        return;
      }
      if (ctrl && e.key === "c") {
        /* Copy all selected nodes (+ edges between them) */
        const selectedIds = useGraphStore.getState().nodes
          .filter((n) => n.selected)
          .map((n) => n.id);
        if (selectedIds.length > 0) copySelected(selectedIds);
        return;
      }
      if (ctrl && e.key === "v") {
        e.preventDefault();
        const newIds = pasteSelected();
        /* Select the single pasted node in the inspector if only one */
        setSelectedNodeId(newIds.length === 1 ? newIds[0] : null);
        return;
      }
      if (ctrl && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (ctrl && e.key === "l") {
        e.preventDefault();
        const positions = computeAutoLayout(
          useGraphStore.getState().nodes,
          useGraphStore.getState().edges
        );
        setNodePositions(positions);
        setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
        return;
      }
      if (e.key === "Escape") {
        setPickingJumpFor(null);
        setSelectedNodeId(null);
        setContextMenu(null);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const { nodes: currentNodes, edges: currentEdges } = useGraphStore.getState();
        const selectedNodeIds = currentNodes.filter((n) => n.selected).map((n) => n.id);
        const selectedEdgeIds = currentEdges.filter((e) => e.selected).map((e) => e.id);
        if (selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) {
          removeNodes(selectedNodeIds, selectedEdgeIds);
          setSelectedNodeId(null);
        }
      }
    },
    [undo, redo, duplicateNode, copySelected, pasteSelected, removeNodes, setSelectedNodeId, setContextMenu, setSearchOpen, setNodePositions, setPickingJumpFor, fitView]
  );

  const hasNodes = nodes.length > 0;

  return (
    <div
      ref={reactFlowWrapper}
      className={cn("flex-1 relative overflow-hidden bg-background min-w-0", pickingJumpFor && "cursor-crosshair")}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDragStart={onNodeDragStart}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        panActivationKeyCode="Space"
        defaultEdgeOptions={{
          type: "dialogue",
          animated: false,
        }}
        connectionLineStyle={{
          stroke: "oklch(0.585 0.233 260)",
          strokeWidth: 1.5,
          strokeDasharray: "5 5",
        }}
        className="outline-none"
        proOptions={{ hideAttribution: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="oklch(1 0 0 / 7%)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) =>
            n.type === "character"
              ? "oklch(0.585 0.233 260)"
              : "oklch(0.62 0.22 170)"
          }
          maskColor="oklch(0 0 0 / 55%)"
          pannable
          zoomable
          ariaLabel="Minimap"
        />
      </ReactFlow>

      {/* Jump-picking banner */}
      {pickingJumpFor && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-xl border border-sky-500/40 bg-sky-500/10 backdrop-blur-sm shadow-lg text-sm text-sky-300 pointer-events-none select-none">
          <SkipForward className="w-3.5 h-3.5 shrink-0" />
          Click a node to set as jump target — or press <kbd className="font-mono bg-sky-500/20 border border-sky-500/30 rounded px-1 text-[11px]">Esc</kbd> to cancel
        </div>
      )}

      {/* Search overlay */}
      <SearchOverlay />

      {/* Empty state */}
      {!hasNodes && (
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          <div className="pointer-events-auto">
            <EmptyCanvasState />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCanvasState() {
  const { loadGraph } = useGraphStoreForDemo();
  const { setProjectName } = useEditorStoreForDemo();

  function handleLoadDemo() {
    loadGraph(DEMO_NODES, DEMO_EDGES);
    setProjectName(DEMO_PROJECT_NAME);
  }

  return (
    <div className="flex flex-col items-center text-center px-6 -mt-16">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl border border-border/60 bg-card/80 flex items-center justify-center shadow-lg">
          <Network className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <div className="absolute inset-0 rounded-2xl border border-primary/20 animate-ping animation-duration-[3s]" />
      </div>

      <p className="text-base font-semibold text-foreground/60 mb-1.5">
        Your canvas is empty
      </p>
      <p className="text-sm text-muted-foreground/60 max-w-65 leading-relaxed">
        Drag a{" "}
        <span className="text-indigo-400 font-medium">Character</span> or{" "}
        <span className="text-emerald-400 font-medium">Action</span> node from
        the sidebar to start
      </p>

      {/* EmptyCanvasState is only shown when nodes.length === 0, so no confirm needed */}
      <button
        type="button"
        onClick={handleLoadDemo}
        className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-medium text-primary/80"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Load demo project
      </button>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground/40 select-none pointer-events-none">
        <span className="flex items-center gap-1.5">
          <Mouse className="w-3 h-3" />
          Scroll to zoom
        </span>
        <span className="opacity-30">·</span>
        <KbdHint keys={["Space"]} label="pan" />
        <span className="opacity-30">·</span>
        <KbdHint keys={["Shift"]} label="multi-select" />
        <span className="opacity-30">·</span>
        <KbdHint keys={["Del"]} label="delete" />
        <span className="opacity-30">·</span>
        <KbdHint keys={["Ctrl", "D"]} label="duplicate" />
        <span className="opacity-30">·</span>
        <KbdHint keys={["Ctrl", "Z"]} label="undo" />
      </div>
    </div>
  );
}

function KbdHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="font-mono bg-muted/40 border border-border/40 rounded px-1 py-0.5 text-[10px]"
        >
          {k}
        </kbd>
      ))}
      <span className="ml-0.5">{label}</span>
    </span>
  );
}
