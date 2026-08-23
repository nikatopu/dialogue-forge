"use client";

/**
 * Anonymous visitor identity.
 *
 * Dialogue Forge has no required login, so the activation funnel is stitched
 * together with a random UUID kept in localStorage. It is generated on the
 * device, never derived from anything about the person, and is the only
 * identifier the analytics layer ever sends.
 *
 * Clearing site data resets it — that is intentional, and the reason it is a
 * plain localStorage value rather than a cookie.
 */

const ANON_ID_KEY = "dialogue-forge-aid";

/** `crypto.randomUUID` needs a secure context; the fallback covers plain http. */
function newUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last resort: still opaque, still device-local, just lower entropy.
  return `anon-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

/**
 * The stable anonymous id for this browser, minting one on first call.
 * Returns null during SSR and when storage is unavailable (private mode,
 * blocked third-party contexts) — callers treat that as "cannot track".
 */
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
    const fresh = newUuid();
    window.localStorage.setItem(ANON_ID_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}

/** Used by the privacy page's "reset analytics identity" affordance. */
export function clearAnonymousId(): void {
  try {
    window.localStorage.removeItem(ANON_ID_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
