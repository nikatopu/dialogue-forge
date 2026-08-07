"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** "unknown" = not asked yet, so the banner shows and no scripts load. */
export type ConsentStatus = "unknown" | "granted" | "denied";

interface ConsentStore {
  status: ConsentStatus;
  /**
   * False until the persisted value has been read. Describes this page load,
   * not a stored preference, so it stays out of `partialize`. Without it the
   * banner would flash for returning visitors who already answered.
   */
  hydrated: boolean;
  setHydrated: () => void;
  accept: () => void;
  decline: () => void;
  /** Reopens the banner — used by the "Cookie preferences" link. */
  reset: () => void;
}

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set) => ({
      status: "unknown",
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      accept: () => set({ status: "granted" }),
      decline: () => set({ status: "denied" }),
      reset: () => set({ status: "unknown" }),
    }),
    {
      name: "dialogue-forge-consent",
      partialize: (s) => ({ status: s.status }),
      // Fires even when nothing was stored, so `hydrated` always resolves.
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
