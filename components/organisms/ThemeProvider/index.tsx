"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { applyTheme } from "@/lib/applyTheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(useEditorStore.getState().theme);

    let prev = useEditorStore.getState().theme;
    const unsub = useEditorStore.subscribe((state) => {
      if (state.theme !== prev) {
        prev = state.theme;
        applyTheme(state.theme);
      }
    });

    return unsub;
  }, []);

  return <>{children}</>;
}
