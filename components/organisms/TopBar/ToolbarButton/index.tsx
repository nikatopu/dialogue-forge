"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/Tooltip";
import style from "./ToolbarButton.module.scss";

type ToolbarButtonProps = {
  icon: LucideIcon;
  tooltip: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  iconSize?: number;
  className?: string;
  ariaLabel?: string;
  /** Hide the tooltip content (e.g. while a dropdown is open) */
  hideTooltip?: boolean;
};

export function ToolbarButton({
  icon: Icon, tooltip, onClick, disabled, iconSize = 14, className, ariaLabel, hideTooltip,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(className, disabled && style.dim)}
        >
          <Icon size={iconSize} />
        </Button>
      </TooltipTrigger>
      {!hideTooltip && <TooltipContent side="bottom">{tooltip}</TooltipContent>}
    </Tooltip>
  );
}
