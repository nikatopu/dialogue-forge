"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { referrerHost } from "@/lib/analytics/attribution";
import { shouldSkipLanding, subscribeToLaunchMode } from "@/lib/launchPreference";

/**
 * Fires `landing_view` and applies the "open the editor instead" preference.
 *
 * The redirect is deliberately client-side. Doing it on the server would mean
 * reading the preference from a cookie — which this app does not set — and
 * would hand crawlers a redirect instead of the marketing page. `?stay=1`
 * overrides it for one visit, so someone who turned the preference on can
 * still reach the landing page from a footer or a shared link.
 *
 * The preference is read through `useSyncExternalStore` rather than copied
 * into state inside the effect: the server snapshot is false, so the marketing
 * page renders for crawlers and for the first paint either way.
 */
export function useLandingTracking() {
  const redirecting = useSyncExternalStore(
    subscribeToLaunchMode,
    shouldSkipLanding,
    () => false,
  );

  const router = useRouter();

  /*
   * Reads the preference directly rather than depending on `redirecting`: that
   * value starts false to match the server snapshot and flips after hydration,
   * which would send a second landing_view.
   */
  useEffect(() => {
    track("landing_view", {
      referrer_host: referrerHost(),
      skipped_to_editor: shouldSkipLanding(),
    });
  }, []);

  useEffect(() => {
    if (redirecting) router.replace("/editor");
  }, [redirecting, router]);

  return { redirecting };
}
