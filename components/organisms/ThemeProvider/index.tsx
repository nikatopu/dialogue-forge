"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { applyTheme } from "@/lib/applyTheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useEditorStore((s) => s.theme);
  const mode = useEditorStore((s) => s.mode);

  /*
   * Deliberately no dependency array. The root layout ships `dark` in the
   * <html> className, so any re-render of the tree (hydration, soft
   * navigation) can reassert it and wipe `light`. Re-applying after every
   * render keeps the DOM matching the store; applyTheme is idempotent.
   */
  useEffect(() => {
    applyTheme(theme, mode);
  });

  return <>{children}</>;
}
