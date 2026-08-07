"use client";

import { useConsentStore } from "@/store/useConsentStore";
import style from "./CookiePreferencesLink.module.scss";

/** Reopens the consent banner so a visitor can change or withdraw their choice. */
export function CookiePreferencesLink({ className }: { className?: string }) {
  const reset = useConsentStore((s) => s.reset);

  return (
    <button type="button" onClick={reset} className={className ?? style.button}>
      Cookie preferences
    </button>
  );
}
