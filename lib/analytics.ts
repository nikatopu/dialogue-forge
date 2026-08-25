"use client";

/**
 * Activation-funnel analytics.
 *
 * This is the only module product code should import to record funnel events.
 * It owns the event catalogue, the anonymous identity, first-touch attribution
 * and the privacy rules; `lib/analytics/*` holds the pieces it composes.
 *
 * Design constraints, in priority order:
 *
 *   1. **No PII, ever.** Event names and props are declared below and nowhere
 *      else. Props are typed per event, and sanitised again at runtime, so no
 *      call site can smuggle dialogue text, project names or emails through.
 *   2. **Cookieless.** Identity is a random UUID in localStorage. No cookies
 *      are written, which is why this runs without the consent banner.
 *   3. **Opt-out is absolute.** Do-Not-Track or GPC means no transport loads.
 *   4. **Verifiable.** Every tracked event is recorded locally regardless of
 *      transport, and rendered by the dev capture view at /dev/analytics.
 *
 * Unrelated to `lib/analytics/analyticsService.ts`, which remains the Google
 * Analytics / Clarity path for the older consent-gated event catalogue.
 */

import type { ForgeNodeType } from "@/types";
import type { ExportEngine } from "./enginePreference";
import { getAnonymousId } from "./analytics/anonymousId";
import { captureAttribution } from "./analytics/attribution";
import { recordEvent } from "./analytics/devCapture";
import { registerVisit } from "./analytics/session";
import { claimMilestone, type Milestone } from "./analytics/milestones";
import {
  ensurePostHog,
  getPostHog,
  hasOptOutSignal,
  isTransportConfigured,
  setAttributionProperties,
} from "./analytics/posthogClient";

/* ─── Event catalogue ─────────────────────────────────────── */

/**
 * The complete set of funnel events. Adding a name here without adding its
 * props below is a type error, and so is tracking a name that is not here.
 */
export type AnalyticsEventName =
  | "landing_view"
  | "demo_loaded"
  | "project_created"
  | "first_node_added"
  | "first_branch_created"
  | "preview_run"
  | "export_clicked"
  | "return_visit";

/** Props are counts, enums and flags only — never anything a user typed. */
export interface AnalyticsEventProps {
  /** Marketing page mounted. Attribution rides along as person properties. */
  landing_view: {
    /** Host of the referring site, absent for direct traffic. */
    referrer_host?: string;
    /** Whether this visitor is being sent straight on to the editor. */
    skipped_to_editor: boolean;
  };
  /** Editor reached for the first time in this session. */
  demo_loaded: {
    /** How the editor was entered. */
    surface: "local" | "cloud";
    /** Nodes already on the canvas — 0 for a genuinely new visitor. */
    node_count: number;
  };
  /** A new, non-demo graph was started. */
  project_created: {
    source: "cloud" | "local" | "import";
  };
  /** The first node this visitor has ever added, on any project. */
  first_node_added: {
    node_type: ForgeNodeType;
  };
  /** The first Branch action node with two or more outgoing edges. */
  first_branch_created: {
    /** Choices hanging off the branch at the moment it qualified. */
    outgoing_edges: number;
  };
  /** The in-editor preview was opened. */
  preview_run: {
    surface: "toolbar" | "mobile";
    node_count: number;
  };
  /** A save or export was triggered. */
  export_clicked: {
    /** Target engine picked in the engine popup (or remembered from a prior pick). */
    engine: ExportEngine;
    trigger: "menu" | "toolbar_save";
    node_count: number;
  };
  /** A session that follows an earlier one. */
  return_visit: {
    days_since_last: number;
    visit_count: number;
  };
}

/** The shape props take once flattened for a transport. */
export type TrackedProps = Record<string, string | number | boolean | null>;

/* ─── Runtime PII guard ───────────────────────────────────── */

/**
 * Substrings that must never appear in a prop key. The type system already
 * prevents this; the runtime check is a second lock, because a regression here
 * leaks user content to a third party and would be invisible in review.
 */
const FORBIDDEN_KEY_PATTERNS = [
  "email",
  "name",
  "dialogue",
  "text",
  "content",
  "title",
  "label",
  "user",
  "author",
  "message",
  "search",
  "query",
];

/** Enum-ish values are short. Anything longer is a bug or an injection. */
const MAX_STRING_LENGTH = 64;

/** A hostname, not visitor data — exempt from the "name" pattern above. */
const KEY_ALLOWLIST = new Set(["referrer_host"]);

function isForbiddenKey(key: string): boolean {
  if (KEY_ALLOWLIST.has(key)) return false;
  const lower = key.toLowerCase();
  return FORBIDDEN_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Drops anything that could carry user content: forbidden keys, non-primitive
 * values, and over-long strings. In development the drop is logged loudly so a
 * mistake surfaces the moment it is written rather than in a privacy audit.
 */
function sanitize(event: AnalyticsEventName, props: Record<string, unknown>): TrackedProps {
  const clean: TrackedProps = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;

    if (isForbiddenKey(key)) {
      warnDropped(key, event, "key looks like PII");
      continue;
    }

    if (value === null || typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
      continue;
    }

    if (typeof value === "string") {
      if (value.length > MAX_STRING_LENGTH) {
        warnDropped(key, event, "string too long to be an enum");
        continue;
      }
      clean[key] = value;
      continue;
    }

    warnDropped(key, event, "only primitives are allowed");
  }

  return clean;
}

function warnDropped(key: string, event: AnalyticsEventName, reason: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[analytics] dropped prop "${key}" on "${event}" — ${reason}`);
  }
}

/* ─── Public API ──────────────────────────────────────────── */

/**
 * Records a funnel event.
 *
 * Always safe to call: on the server, before init, with the transport disabled,
 * or for a visitor who opted out. In every one of those cases the call is a
 * no-op for the network and still shows up in the dev capture view.
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  props: AnalyticsEventProps[E],
): void {
  if (typeof window === "undefined") return;

  const safeProps = sanitize(event, props as Record<string, unknown>);
  const posthog = getPostHog();

  if (posthog && !hasOptOutSignal()) {
    posthog.capture(event, safeProps);
    recordEvent(event, safeProps, true);
    return;
  }

  recordEvent(event, safeProps, false);
}

/**
 * Fires an event at most once per visitor, for milestones like
 * `first_node_added`. Returns whether this call was the one that fired.
 */
export function trackOnce<E extends AnalyticsEventName & Milestone>(
  event: E,
  props: AnalyticsEventProps[E],
): boolean {
  if (typeof window === "undefined") return false;
  if (!claimMilestone(event)) return false;
  track(event, props);
  return true;
}

const SESSION_ONCE_KEY = "dialogue-forge-analytics-session";

/**
 * Fires an event at most once per browser session, for funnel steps that
 * describe reaching a place rather than repeating an action — `demo_loaded`
 * fires when the editor is first reached, not on every navigation back to it.
 *
 * Returns whether this call was the one that fired.
 */
export function trackSessionOnce<E extends AnalyticsEventName>(
  event: E,
  props: AnalyticsEventProps[E],
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.sessionStorage.getItem(SESSION_ONCE_KEY);
    const fired = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    if (fired.has(event)) return false;
    fired.add(event);
    window.sessionStorage.setItem(SESSION_ONCE_KEY, JSON.stringify([...fired]));
  } catch {
    // Storage unavailable: better to send a duplicate than to lose the step.
  }

  track(event, props);
  return true;
}

let initialised = false;

/**
 * Boots analytics for the page load: mints the anonymous id, freezes
 * first-touch attribution, starts the transport if permitted, and emits
 * `return_visit` when this load begins a new session for a known visitor.
 *
 * Idempotent per page load; the provider calls it once from the root layout.
 */
export function initAnalytics(): void {
  if (typeof window === "undefined" || initialised) return;
  initialised = true;

  const returning = registerVisit();
  const attribution = captureAttribution();

  // Recorded locally even with no transport, so the dev capture view still
  // proves the event fires.
  const emitReturnVisit = () => {
    if (returning) track("return_visit", returning);
  };

  const anonymousId = getAnonymousId();

  if (!isTransportConfigured() || hasOptOutSignal() || !anonymousId) {
    emitReturnVisit();
    return;
  }

  ensurePostHog(anonymousId).then(() => {
    if (attribution) setAttributionProperties(attribution);
    emitReturnVisit();
  });
}

export interface TransportStatus {
  configured: boolean;
  optedOut: boolean;
  live: boolean;
  anonymousId: string | null;
}

let cachedStatus: TransportStatus | null = null;

/**
 * Whether events are currently reaching PostHog — for the dev capture view.
 *
 * The result is cached and only replaced when a field actually changes, so it
 * is safe to read from `useSyncExternalStore`, which compares snapshots by
 * identity and would loop forever on a fresh object each call.
 */
export function getTransportStatus(): TransportStatus {
  const next: TransportStatus = {
    configured: isTransportConfigured(),
    optedOut: hasOptOutSignal(),
    live: getPostHog() !== null,
    anonymousId: getAnonymousId(),
  };

  if (
    cachedStatus &&
    cachedStatus.configured === next.configured &&
    cachedStatus.optedOut === next.optedOut &&
    cachedStatus.live === next.live &&
    cachedStatus.anonymousId === next.anonymousId
  ) {
    return cachedStatus;
  }

  cachedStatus = next;
  return next;
}
