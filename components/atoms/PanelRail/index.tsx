"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cn from "classnames";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/Tooltip";
import style from "./PanelRail.module.scss";

type PanelRailProps = {
  /** Workspace edge this rail is docked to — decides border side and chevron direction */
  side: "left" | "right";
  open: boolean;
  onToggle: () => void;
  /** Panel name, drawn vertically along the rail while collapsed */
  label: string;
  /** Extra rail controls stacked under the toggle */
  children?: ReactNode;
};

export function PanelRail({ side, open, onToggle, label, children }: PanelRailProps) {
  // Chevron always points the way the panel will move: outward to collapse, inward to open.
  const pointsRight = side === "left" ? !open : open;
  const Chevron = pointsRight ? ChevronRight : ChevronLeft;
  const action = `${open ? "Hide" : "Show"} ${label.toLowerCase()}`;

  return (
    <div className={cn(style.rail, side === "left" ? style.left : style.right)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={action}
            className={cn(style.toggle, !open && style.collapsed)}
          >
            <Chevron size={14} className={style.chevron} />

            <span className={style.label}>{label}</span>
          </button>
        </TooltipTrigger>

        <TooltipContent side={side === "left" ? "right" : "left"}>{action}</TooltipContent>
      </Tooltip>

      {children && <div className={style.extras}>{children}</div>}
    </div>
  );
}
