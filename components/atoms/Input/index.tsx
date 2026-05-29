import * as React from "react";
import cn from "classnames";
import style from "./Input.module.scss";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(style.input, className)}
      {...props}
    />
  );
}

export { Input };
