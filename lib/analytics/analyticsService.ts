"use client";

/**
 * Internal analytics abstraction for Dialogue Forge.
 *
 * Architecture supports future adapters (PostHog, Plausible, Mixpanel) —
 * swap out the `adapters` array without touching call sites.
 *
 * Privacy: NO PII, NO dialogue content, NO graph data stored.
 * Only usage events with minimal metadata.
 */

import { createClient } from "@/lib/supabase/client";

/* ─── Event catalogue ─────────────────────────────────────── */

export type AnalyticsEvent =
  // Auth
  | "sign_in"
  | "sign_out"
  | "provider_connected"
  // Projects
  | "project_created"
  | "project_opened"
  | "project_deleted"
  | "project_duplicated"
  | "project_imported"
  | "project_exported"
  | "project_cloud_saved"
  | "project_local_saved"
  // Editor – nodes
  | "node_created"
  | "node_deleted"
  | "node_type_created"
  // Preview
  | "preview_started"
  | "preview_completed"
  | "branch_selected"
  | "template_loaded"
  | "template_inserted"
  | "template_replaced"
  | "template_type_used"
  // Usage
  | "mobile_user"
  | "desktop_user"
  | "touch_interaction";

export type EventMetadata = Record<string, string | number | boolean | null>;

/* ─── Adapter interface ───────────────────────────────────── */

interface AnalyticsAdapter {
  track(event: AnalyticsEvent, metadata?: EventMetadata): void | Promise<void>;
  page(path: string): void | Promise<void>;
}

/* ─── Supabase adapter ───────────────────────────────────── */

class SupabaseAdapter implements AnalyticsAdapter {
  private userId: string | null = null;
  private projectId: string | null = null;

  setUser(id: string | null) { this.userId = id; }
  setProject(id: string | null) { this.projectId = id; }

  async track(event: AnalyticsEvent, metadata: EventMetadata = {}) {
    try {
      const supabase = createClient();
      await supabase.from("analytics_events").insert({
        user_id: this.userId,
        project_id: this.projectId,
        event,
        metadata,
      });
    } catch {
      // Analytics failures are silent — never break the app
    }
  }

  page(_path: string) {
    // No page-view tracking in Supabase adapter
  }
}

/* ─── Console adapter (dev) ──────────────────────────────── */

class ConsoleAdapter implements AnalyticsAdapter {
  track(event: AnalyticsEvent, metadata?: EventMetadata) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, metadata);
    }
  }
  page(path: string) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics:page]", path);
    }
  }
}

/* ─── Future PostHog adapter stub ────────────────────────── */
// class PostHogAdapter implements AnalyticsAdapter {
//   track(event: AnalyticsEvent, metadata?: EventMetadata) {
//     posthog.capture(event, metadata);
//   }
//   page(path: string) { posthog.capture("$pageview", { path }); }
// }

/* ─── Service singleton ──────────────────────────────────── */

const supabaseAdapter = new SupabaseAdapter();

const adapters: AnalyticsAdapter[] = [
  supabaseAdapter,
  new ConsoleAdapter(),
];

export const analyticsService = {
  setUser(id: string | null) {
    supabaseAdapter.setUser(id);
  },

  setProject(id: string | null) {
    supabaseAdapter.setProject(id);
  },

  track(event: AnalyticsEvent, metadata?: EventMetadata) {
    adapters.forEach((a) => a.track(event, metadata));
  },

  trackPage(path: string) {
    adapters.forEach((a) => a.page(path));
  },
};
