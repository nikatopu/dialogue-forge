import { useCallback, useEffect, useRef } from "react";
import { useReactFlow, type NodeMouseHandler } from "@xyflow/react";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { computeAutoLayout } from "@/lib/autoLayout";
import { trackNodeAdded } from "@/lib/analytics/funnel";
import type { ForgeNodeType, ForgeNode } from "@/types";

/** Rough footprint of a freshly created node, before React Flow measures it. */
const NEW_NODE_SIZE = { width: 220, height: 120 };

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

  const placeNode = useCallback((nodeType: ForgeNodeType, position: { x: number; y: number }) => {
    const previousNodeCount = useGraphStore.getState().nodes.length;
    const id = addNode(nodeType, position);
    setSelectedNodeId(id);
    trackNodeAdded({
      nodeType,
      previousNodeCount,
      projectId: useEditorStore.getState().currentProjectId,
    });
  }, [addNode, setSelectedNodeId]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("application/forge-node-type") as ForgeNodeType;
    if (!nodeType) return;
    placeNode(nodeType, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
  }, [screenToFlowPosition, placeNode]);

  /*
   * Sidebar "+" button: drop the node at the centre of the visible canvas,
   * stepping down past any node already there so repeated clicks stack into
   * a readable column instead of on top of each other.
   */
  const pendingNodeAdd = useEditorStore((s) => s.pendingNodeAdd);
  useEffect(() => {
    if (!pendingNodeAdd) return;
    useEditorStore.getState().setPendingNodeAdd(null);
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const center = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    const position = { x: center.x - NEW_NODE_SIZE.width / 2, y: center.y - NEW_NODE_SIZE.height / 2 };
    const existing = useGraphStore.getState().nodes;
    const overlaps = (n: ForgeNode) => {
      const w = n.measured?.width ?? NEW_NODE_SIZE.width;
      const h = n.measured?.height ?? NEW_NODE_SIZE.height;
      return position.x < n.position.x + w && position.x + NEW_NODE_SIZE.width > n.position.x
        && position.y < n.position.y + h && position.y + NEW_NODE_SIZE.height > n.position.y;
    };
    for (let i = 0; i < 50; i++) {
      const hit = existing.find(overlaps);
      if (!hit) break;
      position.y = hit.position.y + (hit.measured?.height ?? NEW_NODE_SIZE.height) + 24;
    }
    placeNode(pendingNodeAdd, position);
  }, [pendingNodeAdd, screenToFlowPosition, placeNode]);

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
