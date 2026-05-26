const ACCENT_THEMES = new Set(["ocean", "forest", "midnight", "rose", "cyber"]);

export function applyTheme(theme: string) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  if (ACCENT_THEMES.has(theme)) {
    html.setAttribute("data-theme", theme);
  } else {
    html.removeAttribute("data-theme");
  }
}
