"use client";

import { useState } from "react";
import { CHANGELOG } from "@/lib/roadmap";
import { useShouldShowWhatsNew, dismissWhatsNew } from "@/lib/whatsNewPreference";

/**
 * Drives the What's New popup for the newest changelog entry. `dismissed`
 * layers a local, immediate close on top of `useShouldShowWhatsNew`'s
 * storage-backed read: writing to localStorage doesn't itself trigger a
 * re-render (the store has no listener to notify), so the popup needs its
 * own bit of state to disappear the instant it's closed.
 */
export function useWhatsNew() {
  const release = CHANGELOG[0];
  const shouldShow = useShouldShowWhatsNew(release.version);
  const [dismissed, setDismissed] = useState(false);

  function close() {
    dismissWhatsNew(release.version);
    setDismissed(true);
  }

  return { open: shouldShow && !dismissed, close, release };
}
