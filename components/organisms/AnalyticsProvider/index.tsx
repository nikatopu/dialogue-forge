"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/**
 * Boots the cookieless activation-funnel analytics once per page load.
 *
 * Mounted from the root layout so first-touch UTM parameters are captured on
 * whichever page the visitor actually lands on, not just the marketing page.
 * Renders nothing; the transport is loaded lazily inside `initAnalytics`.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
