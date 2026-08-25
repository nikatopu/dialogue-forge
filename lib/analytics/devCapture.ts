"use client";

/**
 * Local event recorder powering the dev capture view at /dev/analytics.
 *
 * Every tracked event is appended here regardless of whether a transport is
 * live, which is what makes the funnel verifiable without a PostHog project:
 * run the app, walk through the product, watch the eight events arrive.
 *
 * Records are mirrored into sessionStorage so a full page reload — unavoidable
 * when the funnel spans landing and editor — does not wipe the log. Nothing is
 * written outside development.
 */

import type { AnalyticsEventName, TrackedProps } from "@/lib/analytics";

const STORAGE_KEY = "dialogue-forge-analytics-log";
const MAX_RECORDS = 200;

export interface CapturedEvent {
  event: AnalyticsEventName;
  props: TrackedProps;
  /** Epoch ms, stamped when the event was tracked. */
  at: number;
  /** Whether a transport actually sent this, or it was recorded only. */
  sent: boolean;
}

type Listener = (events: CapturedEvent[]) => void;

const enabled = process.env.NODE_ENV !== "production";

let records: CapturedEvent[] = [];
let hydrated = false;
const listeners = new Set<Listener>();

function persist(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* storage full or unavailable — the in-memory log still works */
  }
}

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) records = JSON.parse(raw) as CapturedEvent[];
  } catch {
    records = [];
  }
}

export function recordEvent(
  event: AnalyticsEventName,
  props: TrackedProps,
  sent: boolean,
): void {
  if (!enabled || typeof window === "undefined") return;
  hydrate();
  records = [...records.slice(-(MAX_RECORDS - 1)), { event, props, at: Date.now(), sent }];
  persist();
  listeners.forEach((listener) => listener(records));
}

export function getCapturedEvents(): CapturedEvent[] {
  hydrate();
  return records;
}

export function subscribeToCapture(listener: Listener): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearCapturedEvents(): void {
  records = [];
  persist();
  listeners.forEach((listener) => listener(records));
}
