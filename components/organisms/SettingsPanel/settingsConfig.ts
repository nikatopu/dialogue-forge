import { Settings, Palette, Keyboard, User, Info, Moon, Sun } from "lucide-react";
import type { Theme, ThemeMode } from "@/types";

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

export const MODES: { value: ThemeMode; label: string; description: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { value: "dark",  label: "Dark",  description: "Default",     icon: Moon },
  { value: "light", label: "Light", description: "Bright rooms", icon: Sun },
];

/** Swatches mirror each palette's accent in the mode being previewed. */
export const THEME_SWATCH_COLORS: Record<ThemeMode, Record<Theme, string>> = {
  dark: {
    default:  "oklch(0.585 0.233 260)",
    ocean:    "oklch(0.68 0.18 220)",
    forest:   "oklch(0.72 0.16 155)",
    midnight: "oklch(0.68 0.22 295)",
    rose:     "oklch(0.72 0.22 355)",
    cyber:    "oklch(0.8 0.24 125)",
  },
  light: {
    default:  "oklch(0.52 0.255 262)",
    ocean:    "oklch(0.52 0.145 232)",
    forest:   "oklch(0.48 0.125 158)",
    midnight: "oklch(0.51 0.215 295)",
    rose:     "oklch(0.535 0.205 358)",
    cyber:    "oklch(0.5 0.155 132)",
  },
};

export type SettingsSection = "general" | "appearance" | "shortcuts" | "account" | "about";

export const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "general",    label: "General",    icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "shortcuts",  label: "Shortcuts",  icon: Keyboard },
  { id: "account",    label: "Account",    icon: User },
  { id: "about",      label: "About",      icon: Info },
];
