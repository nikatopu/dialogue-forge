import type { ThemeMode } from "@/types";

const ACCENT_THEMES = new Set(["ocean", "forest", "midnight", "rose", "cyber"]);

/**
 * Writes both theming axes onto <html>: `.dark`/`.light` for the mode and
 * `data-theme` for the colour palette. Kept in sync with the pre-paint
 * inline script in app/layout.tsx — change both together.
 */
export function applyTheme(theme: string, mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;

  html.classList.toggle("dark", mode !== "light");
  html.classList.toggle("light", mode === "light");
  html.style.colorScheme = mode === "light" ? "light" : "dark";

  if (ACCENT_THEMES.has(theme)) {
    html.setAttribute("data-theme", theme);
  } else {
    html.removeAttribute("data-theme");
  }
}
