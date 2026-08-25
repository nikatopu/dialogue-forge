"use client";

/**
 * First-touch acquisition source.
 *
 * UTM parameters are read once, on the first landing of a given browser, and
 * then frozen. Later visits keep the original source so a funnel can answer
 * "which campaign produced activated users", not "which link did they click
 * most recently".
 *
 * Only the campaign fields below are read. The rest of the query string is
 * ignored, so a stray `?email=` in an inbound link never reaches the wrapper.
 */

const ATTRIBUTION_KEY = "dialogue-forge-attribution";

/** Every field is a marketer-authored campaign label, never visitor data. */
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type UtmParam = (typeof UTM_PARAMS)[number];

export type Attribution = Partial<Record<UtmParam, string>> & {
  /** Registrable host of the referring page — never the full referring URL. */
  referrer_host?: string;
};

/** Campaign labels are short; anything longer is a malformed or hostile link. */
const MAX_VALUE_LENGTH = 96;

function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Host only — a full referrer URL can carry search terms or session tokens. */
export function referrerHost(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) return undefined;
  try {
    const url = new URL(document.referrer);
    if (url.host === window.location.host) return undefined; // internal navigation
    return url.host;
  } catch {
    return undefined;
  }
}

function readFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const found: Attribution = {};
  for (const key of UTM_PARAMS) {
    const value = clean(params.get(key));
    if (value) found[key] = value;
  }
  const host = referrerHost();
  if (host) found.referrer_host = host;
  return found;
}

/**
 * Parsed attribution is cached against the raw string it came from, so
 * repeated reads return the same object. The dev capture view reads this
 * through `useSyncExternalStore`, which compares snapshots by identity.
 */
let parseCache: { raw: string | null; value: Attribution | null } = { raw: null, value: null };

export function getStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    if (raw === parseCache.raw) return parseCache.value;
    const value = raw ? (JSON.parse(raw) as Attribution) : null;
    parseCache = { raw, value };
    return value;
  } catch {
    return null;
  }
}

/**
 * Resolves this browser's first-touch attribution, persisting it the first time
 * a landing carries campaign parameters (or an external referrer).
 *
 * Returns null when there is nothing to attribute — a direct visit with no
 * stored history — so callers can skip setting empty person properties.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const stored = getStoredAttribution();
  if (stored) return stored;

  const fresh = readFromUrl();
  if (Object.keys(fresh).length === 0) return null;

  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(fresh));
  } catch {
    /* storage unavailable — attribution stays session-scoped */
  }
  return fresh;
}
