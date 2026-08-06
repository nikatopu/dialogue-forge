"use client";

import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SkipForward } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { nodeTypes } from "@/components/nodes";
import { edgeTypes } from "@/components/edges";
import { ContextMenu } from "@/components/organisms/ContextMenu";
import { SearchOverlay } from "@/components/organisms/SearchOverlay";
import cn from "classnames";
import { useCanvasInteractions } from "./useCanvasInteractions";
import { EmptyCanvasState } from "./EmptyCanvasState";
import { CanvasTools } from "./CanvasTools";
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
  const { pickingJumpFor } = useEditorStore();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphStore();
  const {
    reactFlowWrapper, isMobile, onDragOver, onDrop, onNodeClick, onPaneClick,
    onNodeContextMenu, isValidConnection, onNodeDragStart, onKeyDown,
  } = useCanvasInteractions();

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
        className={style.flow}
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
        {!isMobile && <CanvasTools />}
      </ReactFlow>

      {pickingJumpFor && (
        <div className={style.pickBanner}>
          <SkipForward size={14} className={style.pickBannerIcon} />
          Click a node to set as jump target — or press
          <kbd className={style.kbd}>Esc</kbd> to cancel
        </div>
      )}

      <SearchOverlay />

      {nodes.length === 0 && <EmptyCanvasState />}
    </div>
  );
}
