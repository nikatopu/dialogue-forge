"use client";

import { useSyncExternalStore } from "react";

/**
 * Roadmap, How to use, and Support are reachable both from the marketing
 * landing page (LandingNav, ClosingCta, SiteFooter) and from inside the
 * editor (the More menu, the Settings panel's About section). A hardcoded
 * "back to editor" link is wrong for the first group and a hardcoded "back
 * to home" is wrong for the second, so links from the editor tag themselves
 * with `?from=editor` and these pages read that back to decide where a
 * visitor actually came from.
 */

export type BackDestination = { href: string; label: string };

const EDITOR_BACK: BackDestination = { href: "/editor", label: "Back to editor" };
const HOME_BACK: BackDestination = { href: "/", label: "Back to home" };

function cameFromEditor(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("from") === "editor";
}

/** The query string is read once and never changes after mount, so there's nothing to subscribe to. */
function subscribe(): () => void {
  return () => {};
}

/**
 * Resolves where a page's "back" link should point, via `useSyncExternalStore`
 * rather than copying the read into state inside an effect — the same
 * trade-off `useLandingTracking` makes for its own client-only, URL-driven
 * read: the server snapshot is false (home), so first paint matches for
 * crawlers and for the client alike, and it's correct on the client the
 * moment it renders rather than one render late.
 */
export function useBackDestination(): BackDestination {
  const fromEditor = useSyncExternalStore(subscribe, cameFromEditor, () => false);
  return fromEditor ? EDITOR_BACK : HOME_BACK;
}

/**
 * Carries the current origin onto a link to one of this page's siblings
 * (Roadmap ↔ How to use ↔ Support), so the origin survives hopping between
 * them instead of resetting to "home" on the next page.
 */
export function withOrigin(href: string, dest: BackDestination): string {
  return dest === EDITOR_BACK ? `${href}?from=editor` : href;
}
