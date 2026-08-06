"use client";

import { Panel } from "@xyflow/react";
import { LayoutDashboard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/Tooltip";
import { useGraphStore } from "@/store/useGraphStore";
import { computeAutoLayout } from "@/lib/autoLayout";
import style from "./CanvasTools.module.scss";

/** Viewport-level tools, docked directly above the minimap. */
export function CanvasTools() {
  const { nodes, edges, setNodePositions } = useGraphStore();

  return (
    <Panel position="bottom-right" className={style.cluster}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={style.btn}
            disabled={nodes.length === 0}
            aria-label="Auto layout"
            onClick={() => setNodePositions(computeAutoLayout(nodes, edges))}
          >
            <LayoutDashboard size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Auto layout (Ctrl+L)</TooltipContent>
      </Tooltip>
    </Panel>
  );
}
