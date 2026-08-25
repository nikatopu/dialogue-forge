"use client";

import { useSyncExternalStore } from "react";
import { hasPriorSession } from "./analytics/session";

/**
 * Gates the "What's New" popup: shown once per shipped version, and only to
 * visitors who have used Dialogue Forge before — a first-time visitor has no
 * prior version to catch up on, so `hasPriorSession()` (a plain localStorage
 * read, safe from render) is what tells the two apart.
 */

const DISMISSED_KEY = "dialogue-forge-whats-new-dismissed";

function getDismissedVersion(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

/** Records that `version` has been seen, so the popup won't show it again. */
export function dismissWhatsNew(version: string): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, version);
  } catch {
    /* storage unavailable — the popup just shows again next time, harmless */
  }
}

function shouldShowWhatsNew(currentVersion: string): boolean {
  if (typeof window === "undefined") return false;
  if (!hasPriorSession()) return false;
  return getDismissedVersion() !== currentVersion;
}

/** The dismissal is read once per mount; nothing external changes it mid-session. */
function subscribe(): () => void {
  return () => {};
}

/**
 * Whether the What's New popup should show for `currentVersion`, via
 * `useSyncExternalStore` — the same pattern `useBackDestination` and
 * `useLandingTracking` use for a client-only, storage-backed read: false on
 * the server so hydration doesn't flash the popup in, correct on the client
 * from its first render rather than one render late.
 */
export function useShouldShowWhatsNew(currentVersion: string): boolean {
  return useSyncExternalStore(subscribe, () => shouldShowWhatsNew(currentVersion), () => false);
}
