import { Settings, Palette, Keyboard, User, Info } from "lucide-react";
import type { Theme } from "@/types";

export const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], label: "Undo" }, { keys: ["Ctrl", "Y"], label: "Redo" },
  { keys: ["Ctrl", "D"], label: "Duplicate node" }, { keys: ["Ctrl", "C"], label: "Copy node" },
  { keys: ["Ctrl", "V"], label: "Paste node" }, { keys: ["Ctrl", "F"], label: "Search nodes" },
  { keys: ["Ctrl", "L"], label: "Auto layout" }, { keys: ["Ctrl", "S"], label: "Save / export" },
  { keys: ["Del"], label: "Delete selected node" }, { keys: ["Escape"], label: "Deselect / close" },
  { keys: ["Space"], label: "Pan canvas" }, { keys: ["Shift"], label: "Multi-select" },
];

export const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: "default",  label: "Default",  description: "Indigo" },
  { value: "ocean",    label: "Ocean",    description: "Cyan" },
  { value: "forest",   label: "Forest",   description: "Green" },
  { value: "midnight", label: "Midnight", description: "Violet" },
  { value: "rose",     label: "Rose",     description: "Rose" },
  { value: "cyber",    label: "Cyber",    description: "Lime" },
];

export const THEME_SWATCH_COLORS: Record<Theme, string> = {
  default:  "oklch(0.52 0.255 262)",
  ocean:    "oklch(0.68 0.18 220)",
  forest:   "oklch(0.72 0.16 155)",
  midnight: "oklch(0.68 0.22 295)",
  rose:     "oklch(0.72 0.22 355)",
  cyber:    "oklch(0.8 0.24 125)",
};

export type SettingsSection = "general" | "appearance" | "shortcuts" | "account" | "about";

export const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "general",    label: "General",    icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "shortcuts",  label: "Shortcuts",  icon: Keyboard },
  { id: "account",    label: "Account",    icon: User },
  { id: "about",      label: "About",      icon: Info },
];
