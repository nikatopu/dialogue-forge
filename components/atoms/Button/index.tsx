import * as React from "react";
import { Slot } from "radix-ui";
import cn from "classnames";
import style from "./Button.module.scss";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "sm" | "lg" | "xs" | "icon" | "icon-sm" | "icon-xs" | "icon-lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default:     style.default,
  outline:     style.outline,
  secondary:   style.secondary,
  ghost:       style.ghost,
  destructive: style.destructive,
  link:        style.link,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  default:   style.sizeDefault,
  sm:        style.sizeSm,
  lg:        style.sizeLg,
  xs:        style.sizeXs,
  icon:      style.sizeIcon,
  "icon-sm": style.sizeIconSm,
  "icon-xs": style.sizeIconXs,
  "icon-lg": style.sizeIconLg,
};

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(style.button, VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      {...props}
    />
  );
}

export { Button };
export type { ButtonVariant, ButtonSize };
