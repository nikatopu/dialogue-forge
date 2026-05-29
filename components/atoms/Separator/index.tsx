"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";
import cn from "classnames";
import style from "./Separator.module.scss";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(style.separator, className)}
      {...props}
    />
  );
}

export { Separator };
