"use client";

import { useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/useBreakpoint";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  BackgroundVariant, useReactFlow, type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Network, Mouse, Sparkles, SkipForward } from "lucide-react";
import { useGraphStore as useGraphStoreForDemo } from "@/store/useGraphStore";
import { useEditorStore as useEditorStoreForDemo } from "@/store/useEditorStore";
import { DEMO_NODES, DEMO_EDGES, DEMO_PROJECT_NAME } from "@/lib/demoProject";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { nodeTypes } from "@/components/nodes";
import { edgeTypes } from "@/components/edges";
import { ContextMenu } from "@/components/organisms/ContextMenu";
import { SearchOverlay } from "@/components/organisms/SearchOverlay";
import { computeAutoLayout } from "@/lib/autoLayout";
import cn from "classnames";
import type { ForgeNodeType, ForgeNode } from "@/types";
import style from "./GraphCanvas.module.scss";

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
      <ContextMenu />
    </ReactFlowProvider>
  );
}

export { SearchOverlay };

function FlowEditor() {
  const { screenToFlowPosition } = useReactFlow();
  const {
    setSelectedNodeId, setContextMenu, setSearchOpen,
    pickingJumpFor, setPickingJumpFor, setMobileInspectorOpen,
  } = useEditorStore();
  const isMobile = useIsMobile();
  const lastTapRef = useRef<{ nodeId: string; time: number } | null>(null);
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    addNode, duplicateNode, removeNode, removeNodes,
    copySelected, pasteSelected, setJumpTarget, undo, redo,
    saveSnapshot, setNodePositions,
  } = useGraphStore();
  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("application/forge-node-type") as ForgeNodeType;
      if (!nodeType) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = addNode(nodeType, position);
      setSelectedNodeId(id);
    },
    [screenToFlowPosition, addNode, setSelectedNodeId],
  );

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
      if (isMobile) {
        const now = Date.now();
        const last = lastTapRef.current;
        if (last && last.nodeId === node.id && now - last.time < 350) {
          setMobileInspectorOpen(true);
          lastTapRef.current = null;
        } else {
          lastTapRef.current = { nodeId: node.id, time: now };
        }
      }
    },
    [isMobile, setSelectedNodeId, setContextMenu, setJumpTarget, setPickingJumpFor, setMobileInspectorOpen],
  );

  const onPaneClick = useCallback(() => {
    if (useEditorStore.getState().pickingJumpFor) { setPickingJumpFor(null); return; }
    setSelectedNodeId(null);
    setContextMenu(null);
  }, [setSelectedNodeId, setContextMenu, setPickingJumpFor]);

  const onNodeContextMenu = useCallback<NodeMouseHandler>(
    (e, node) => {
      e.preventDefault();
      setSelectedNodeId(node.id);
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
    },
    [setSelectedNodeId, setContextMenu],
  );

  const isValidConnection = useCallback(
    (connection: { target: string | null }) => {
      const target = nodes.find((n) => n.id === connection.target) as ForgeNode | undefined;
      return target?.type !== "start";
    },
    [nodes],
  );

  const onNodeDragStart = useCallback(() => { saveSnapshot(); }, [saveSnapshot]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z") { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); return; }
      if (ctrl && e.key === "d") {
        e.preventDefault();
        const { selectedNodeId } = useEditorStore.getState();
        if (selectedNodeId) duplicateNode(selectedNodeId);
        return;
      }
      if (ctrl && e.key === "c") {
        const selectedIds = useGraphStore.getState().nodes.filter((n) => n.selected).map((n) => n.id);
        if (selectedIds.length > 0) copySelected(selectedIds);
        return;
      }
      if (ctrl && e.key === "v") {
        e.preventDefault();
        const newIds = pasteSelected();
        setSelectedNodeId(newIds.length === 1 ? newIds[0] : null);
        return;
      }
      if (ctrl && e.key === "f") { e.preventDefault(); setSearchOpen(true); return; }
      if (ctrl && e.key === "l") {
        e.preventDefault();
        const positions = computeAutoLayout(useGraphStore.getState().nodes, useGraphStore.getState().edges);
        setNodePositions(positions);
        setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
        return;
      }
      if (e.key === "Escape") { setPickingJumpFor(null); setSelectedNodeId(null); setContextMenu(null); return; }
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
    [undo, redo, duplicateNode, copySelected, pasteSelected, removeNodes, setSelectedNodeId, setContextMenu, setSearchOpen, setNodePositions, setPickingJumpFor, fitView],
  );

  return (
    <div
      ref={reactFlowWrapper}
      className={cn(style.wrapper, pickingJumpFor && style.picking)}
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
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        panActivationKeyCode="Space"
        zoomOnPinch={true}
        panOnDrag={isMobile ? [1, 2] : true}
        selectionOnDrag={!isMobile}
        preventScrolling={true}
        defaultEdgeOptions={{ type: "dialogue", animated: false }}
        connectionLineStyle={{ stroke: "oklch(0.585 0.233 260)", strokeWidth: 1.5, strokeDasharray: "5 5" }}
        className="outline-none"
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="oklch(1 0 0 / 7%)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) =>
            n.type === "character" ? "oklch(0.585 0.233 260)"
              : n.type === "start" ? "oklch(0.62 0.18 180)"
              : "oklch(0.62 0.22 170)"
          }
          maskColor="oklch(0 0 0 / 55%)"
          pannable zoomable ariaLabel="Minimap"
        />
      </ReactFlow>

      {pickingJumpFor && (
        <div className={style.pickBanner}>
          <SkipForward size={14} style={{ flexShrink: 0 }} />
          Click a node to set as jump target — or press
          <kbd className={style.kbd}>Esc</kbd> to cancel
        </div>
      )}

      <SearchOverlay />

      {nodes.length === 0 && (
        <div className={style.emptyState}>
          <div className={style.emptyInner}>
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

  return (
    <>
      <div className={style.emptyIconWrap}>
        <div className={style.emptyIconBox}>
          <Network size={32} style={{ color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)" }} />
        </div>
        <div className={style.emptyIconPing} />
      </div>

      <p className={style.emptyTitle}>Your canvas is empty</p>
      <p className={style.emptyDesc}>
        Drag a <span style={{ color: "oklch(0.68 0.15 180)", fontWeight: 500 }}>Start</span>,{" "}
        <span style={{ color: "oklch(0.65 0.19 260)", fontWeight: 500 }}>Character</span>, or{" "}
        <span style={{ color: "oklch(0.72 0.18 155)", fontWeight: 500 }}>Action</span> node from the sidebar to begin
      </p>

      <button
        type="button"
        onClick={() => { loadGraph(DEMO_NODES, DEMO_EDGES); setProjectName(DEMO_PROJECT_NAME); }}
        className={style.demoBtn}
      >
        <Sparkles size={14} />
        Load demo project
      </button>

      <div className={style.hints}>
        <span className={style.hintItem}><Mouse size={12} />Scroll to zoom</span>
        <span className={style.hintSep}>·</span>
        <KbdHint keys={["Space"]} label="pan" />
        <span className={style.hintSep}>·</span>
        <KbdHint keys={["Shift"]} label="multi-select" />
        <span className={style.hintSep}>·</span>
        <KbdHint keys={["Del"]} label="delete" />
        <span className={style.hintSep}>·</span>
        <KbdHint keys={["Ctrl", "D"]} label="duplicate" />
        <span className={style.hintSep}>·</span>
        <KbdHint keys={["Ctrl", "Z"]} label="undo" />
      </div>
    </>
  );
}

function KbdHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className={style.hintItem}>
      {keys.map((k) => <kbd key={k} className={style.hintKbd}>{k}</kbd>)}
      <span style={{ marginLeft: "0.125rem" }}>{label}</span>
    </span>
  );
}
