"use client";

/**
 * Visit bookkeeping behind `return_visit`.
 *
 * A "session" ends after 30 minutes of inactivity, matching the convention most
 * analytics tools use. Only timestamps and a counter are stored — enough to say
 * "came back on day 3", never anything about who came back.
 */

const VISITS_KEY = "dialogue-forge-visits";

/** Idle gap that ends a session, in milliseconds. */
const SESSION_GAP_MS = 30 * 60 * 1000;

interface VisitRecord {
  /** Epoch ms of the very first visit. */
  first: number;
  /** Epoch ms of the last activity seen. */
  last: number;
  /** Number of distinct sessions, including the current one. */
  count: number;
}

export interface ReturnVisit {
  /** Whole days since the previous session started. 0 = same day. */
  days_since_last: number;
  /** Which session this is for the visitor: 2 on their first return. */
  visit_count: number;
}

function read(): VisitRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(VISITS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VisitRecord>;
    if (typeof parsed.last !== "number" || typeof parsed.count !== "number") return null;
    return { first: parsed.first ?? parsed.last, last: parsed.last, count: parsed.count };
  } catch {
    return null;
  }
}

function write(record: VisitRecord): void {
  try {
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — every visit then looks like a first visit */
  }
}

/**
 * Records that the visitor is here, and reports whether this counts as a
 * returning session. Call once per page load; the timestamp refresh keeps a
 * long single session from being counted twice.
 */
export function registerVisit(): ReturnVisit | null {
  if (typeof window === "undefined") return null;

  const now = Date.now();
  const previous = read();

  if (!previous) {
    write({ first: now, last: now, count: 1 });
    return null;
  }

  const elapsed = now - previous.last;

  // Same session, just a navigation or reload: refresh activity, stay quiet.
  if (elapsed < SESSION_GAP_MS) {
    write({ ...previous, last: now });
    return null;
  }

  const count = previous.count + 1;
  write({ first: previous.first, last: now, count });

  return {
    days_since_last: Math.floor(elapsed / 86_400_000),
    visit_count: count,
  };
}

/**
 * Whether this browser has a visit recorded from before this page load —
 * read-only, and safe to call during render rather than only from an effect.
 * Any code that needs a synchronous "is this visitor new or returning?" read
 * (the What's New popup, for one) should use this rather than `registerVisit`:
 * that function mutates the record and only reports a return on the first
 * call of a new session, which is the wrong shape for a plain read.
 */
export function hasPriorSession(): boolean {
  return read() !== null;
}

/** Dev capture view only — forces the next load to look like a return visit. */
export function resetVisits(): void {
  try {
    window.localStorage.removeItem(VISITS_KEY);
  } catch {
    /* nothing to reset */
  }
}
