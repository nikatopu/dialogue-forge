"use client";

/**
 * Internal analytics abstraction for Dialogue Forge.
 *
 * Events are forwarded to Google Analytics 4. Microsoft Clarity runs alongside
 * for session replay and heatmaps but needs no call sites — it instruments the
 * page on its own.
 *
 * Both scripts only load once the visitor accepts cookies, so every method
 * here is a no-op until then (`window.gtag` simply does not exist yet).
 *
 * Privacy: NO PII, NO dialogue content, NO graph data sent.
 * Only usage events with minimal metadata.
 */

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

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/* ─── Adapter interface ───────────────────────────────────── */

interface AnalyticsAdapter {
  track(event: AnalyticsEvent, metadata?: EventMetadata): void;
  page(path: string): void;
  identify(userId: string | null): void;
}

/* ─── Google Analytics adapter ───────────────────────────── */

class GoogleAnalyticsAdapter implements AnalyticsAdapter {
  private projectId: string | null = null;

  setProject(id: string | null) { this.projectId = id; }

  private get gtag(): GtagFn | null {
    if (typeof window === "undefined") return null;
    return window.gtag ?? null;
  }

  track(event: AnalyticsEvent, metadata: EventMetadata = {}) {
    // GA4 caps custom event names at 40 chars; ours are all well under.
    this.gtag?.("event", event, {
      ...metadata,
      ...(this.projectId ? { project_id: this.projectId } : {}),
    });
  }

  page(path: string) {
    this.gtag?.("event", "page_view", { page_path: path });
  }

  identify(userId: string | null) {
    // A Supabase UUID is an opaque identifier, not PII in GA's sense.
    this.gtag?.("set", { user_id: userId ?? undefined });
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
  identify(userId: string | null) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics:identify]", userId);
    }
  }
}

/* ─── Service singleton ──────────────────────────────────── */

const gaAdapter = new GoogleAnalyticsAdapter();

const adapters: AnalyticsAdapter[] = [gaAdapter, new ConsoleAdapter()];

export const analyticsService = {
  setUser(id: string | null) {
    adapters.forEach((a) => a.identify(id));
  },

  setProject(id: string | null) {
    gaAdapter.setProject(id);
  },

  track(event: AnalyticsEvent, metadata?: EventMetadata) {
    adapters.forEach((a) => a.track(event, metadata));
  },

  trackPage(path: string) {
    adapters.forEach((a) => a.page(path));
  },
};
