"use client";

import { useState, useEffect } from "react";

/**
 * Returns `true` when the viewport is narrower than 768 px (Tailwind `md`).
 * Starts as `false` on the server to avoid hydration mismatches.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
