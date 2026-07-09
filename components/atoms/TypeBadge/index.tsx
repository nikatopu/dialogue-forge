"use client";

import cn from "classnames";
import style from "./TypeBadge.module.scss";
import type { VariableType } from "@/types";

interface TypeBadgeProps {
  type: VariableType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span className={cn(style.badge, style[type], className)}>
      {type}
    </span>
  );
}
