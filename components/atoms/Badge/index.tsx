import * as React from "react";
import { Slot } from "radix-ui";
import cn from "classnames";
import style from "./Badge.module.scss";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default:     style.default,
  secondary:   style.secondary,
  destructive: style.destructive,
  outline:     style.outline,
  ghost:       style.ghost,
  link:        style.link,
};

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
  asChild?: boolean;
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(style.badge, VARIANT_CLASS[variant], className)}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeVariant };
