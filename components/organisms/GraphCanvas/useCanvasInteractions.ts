import { useCallback, useRef } from "react";
import { useReactFlow, type NodeMouseHandler } from "@xyflow/react";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { computeAutoLayout } from "@/lib/autoLayout";
import type { ForgeNodeType, ForgeNode } from "@/types";

export function useCanvasInteractions() {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const isMobile = useIsMobile();
  const {
    setSelectedNodeId, setContextMenu, setSearchOpen, setPickingJumpFor, setMobileInspectorOpen,
  } = useEditorStore();
  const {
    nodes, addNode, duplicateNode, removeNodes, copySelected, pasteSelected,
    setJumpTarget, undo, redo, saveSnapshot, setNodePositions,
  } = useGraphStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ nodeId: string; time: number } | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("application/forge-node-type") as ForgeNodeType;
    if (!nodeType) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const id = addNode(nodeType, position);
    setSelectedNodeId(id);
  }, [screenToFlowPosition, addNode, setSelectedNodeId]);

  const onNodeClick = useCallback<NodeMouseHandler>((_, node) => {
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
  }, [isMobile, setSelectedNodeId, setContextMenu, setJumpTarget, setPickingJumpFor, setMobileInspectorOpen]);

  const onPaneClick = useCallback(() => {
    if (useEditorStore.getState().pickingJumpFor) { setPickingJumpFor(null); return; }
    setSelectedNodeId(null);
    setContextMenu(null);
  }, [setSelectedNodeId, setContextMenu, setPickingJumpFor]);

  const onNodeContextMenu = useCallback<NodeMouseHandler>((e, node) => {
    e.preventDefault();
    setSelectedNodeId(node.id);
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
  }, [setSelectedNodeId, setContextMenu]);

  const isValidConnection = useCallback((connection: { target: string | null }) => {
    const target = nodes.find((n) => n.id === connection.target) as ForgeNode | undefined;
    return target?.type !== "start";
  }, [nodes]);

  const onNodeDragStart = useCallback(() => { saveSnapshot(); }, [saveSnapshot]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
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
      const selectedEdgeIds = currentEdges.filter((ed) => ed.selected).map((ed) => ed.id);
      if (selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) {
        removeNodes(selectedNodeIds, selectedEdgeIds);
        setSelectedNodeId(null);
      }
    }
  }, [undo, redo, duplicateNode, copySelected, pasteSelected, removeNodes, setSelectedNodeId, setContextMenu, setSearchOpen, setNodePositions, setPickingJumpFor, fitView]);

  return {
    reactFlowWrapper, isMobile,
    onDragOver, onDrop, onNodeClick, onPaneClick, onNodeContextMenu,
    isValidConnection, onNodeDragStart, onKeyDown,
  };
}
