"use client";

/**
 * Where a returning visitor lands when they open the site root.
 *
 * The marketing page is the right first impression, and exactly the wrong
 * thing to show someone for the hundredth time. This preference lets a regular
 * user make `/` go straight to the editor.
 *
 * Deliberately a bare localStorage value rather than a Zustand store: it is
 * read once, synchronously, by the redirect gate before anything renders, and
 * a store would add a hydration round-trip to the critical path. The subscribe
 * hook below is what lets components read it through `useSyncExternalStore`
 * instead of copying it into state.
 */

const LAUNCH_MODE_KEY = "dialogue-forge-launch-mode";

export type LaunchMode = "landing" | "editor";

const listeners = new Set<() => void>();

export function getLaunchMode(): LaunchMode {
  if (typeof window === "undefined") return "landing";
  try {
    return window.localStorage.getItem(LAUNCH_MODE_KEY) === "editor" ? "editor" : "landing";
  } catch {
    return "landing";
  }
}

export function setLaunchMode(mode: LaunchMode): void {
  try {
    window.localStorage.setItem(LAUNCH_MODE_KEY, mode);
  } catch {
    /* storage unavailable — the visitor keeps seeing the landing page */
  }
  listeners.forEach((listener) => listener());
}

/** `useSyncExternalStore` subscriber, so a toggle re-renders its own switch. */
export function subscribeToLaunchMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True once the visitor has asked for the editor and is not overriding it. */
export function shouldSkipLanding(): boolean {
  if (typeof window === "undefined") return false;
  const stay = new URLSearchParams(window.location.search).get("stay") === "1";
  return !stay && getLaunchMode() === "editor";
}
