"use client";

/**
 * Which game engine a save/export is destined for.
 *
 * Asked once via a popup the first time a project is saved or exported, then
 * remembered so returning users aren't nagged on every click. "Don't show
 * this again" suppresses the popup for a week from the moment it's checked;
 * without it, the popup returns on the very next save/export.
 *
 * Deliberately a bare localStorage value rather than a Zustand store — same
 * rationale as `lib/launchPreference.ts`: it's read once at the moment of a
 * save/export click, not reactively rendered anywhere.
 */

const ENGINE_PREFERENCE_KEY = "dialogue-forge-engine-preference";

/** How long a "don't show again" answer is honored before asking again. */
const DONT_SHOW_AGAIN_MS = 7 * 24 * 60 * 60 * 1000;

export type ExportEngine = "unity" | "godot" | "unreal" | "other";

interface EnginePreference {
  engine: ExportEngine;
  /** Epoch ms until which the popup stays suppressed; absent = always ask. */
  dismissedUntil?: number;
}

function read(): EnginePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ENGINE_PREFERENCE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EnginePreference>;
    if (typeof parsed?.engine !== "string") return null;
    return parsed as EnginePreference;
  } catch {
    return null;
  }
}

/** The last engine the user picked, if any — used to preselect the popup. */
export function getLastEngine(): ExportEngine | null {
  return read()?.engine ?? null;
}

/** True if the popup should be shown before the next save/export proceeds. */
export function shouldShowEnginePopup(): boolean {
  const pref = read();
  if (!pref?.dismissedUntil) return true;
  return Date.now() >= pref.dismissedUntil;
}

/**
 * Records the engine choice. When `dontShowAgain` is set, the popup is
 * suppressed for a week from now; otherwise it's asked again next time.
 */
export function setEnginePreference(engine: ExportEngine, dontShowAgain: boolean): void {
  const pref: EnginePreference = {
    engine,
    dismissedUntil: dontShowAgain ? Date.now() + DONT_SHOW_AGAIN_MS : undefined,
  };
  try {
    window.localStorage.setItem(ENGINE_PREFERENCE_KEY, JSON.stringify(pref));
  } catch {
    /* storage unavailable — the popup just asks again next time */
  }
}
