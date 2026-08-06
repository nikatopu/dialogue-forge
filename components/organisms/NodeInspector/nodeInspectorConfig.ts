import {
  Zap, GitBranch, SkipForward, Square, Wrench, SlidersHorizontal,
  FileText, Sliders, Swords, Music, Hash, Clapperboard, Monitor,
  type LucideIcon,
} from "lucide-react";
import type {
  ActionType, TriggerCategory, TriggerExecutionMode, VariableOperation,
} from "@/types";

export const ACTION_STRIP: Record<ActionType, { icon: LucideIcon; label: string; color: string; bg: string; border: string; glow: string }> = {
  trigger:     { icon: Zap,               label: "Trigger",      color: "var(--accent-green)", bg: "oklch(0.52 0.18 155 / 15%)", border: "oklch(0.52 0.18 155 / 25%)", glow: "oklch(0.52 0.18 155 / 5%)" },
  branch:      { icon: GitBranch,         label: "Branch",       color: "var(--accent-orange)",  bg: "oklch(0.52 0.18 50 / 15%)",  border: "oklch(0.52 0.18 50 / 25%)",  glow: "oklch(0.52 0.18 50 / 5%)" },
  jump:        { icon: SkipForward,       label: "Jump",         color: "var(--accent-blue)", bg: "oklch(0.52 0.18 220 / 15%)", border: "oklch(0.52 0.18 220 / 25%)", glow: "oklch(0.52 0.18 220 / 5%)" },
  end:         { icon: Square,            label: "End",          color: "var(--accent-rose)", bg: "oklch(0.52 0.22 355 / 15%)", border: "oklch(0.52 0.22 355 / 25%)", glow: "oklch(0.52 0.22 355 / 5%)" },
  custom:      { icon: Wrench,            label: "Custom",       color: "var(--accent-violet)", bg: "oklch(0.52 0.19 290 / 15%)", border: "oklch(0.52 0.19 290 / 25%)", glow: "oklch(0.52 0.19 290 / 5%)" },
  setVariable: { icon: SlidersHorizontal, label: "Set Variable", color: "var(--accent-magenta)", bg: "oklch(0.52 0.19 310 / 15%)", border: "oklch(0.52 0.19 310 / 25%)", glow: "oklch(0.52 0.19 310 / 5%)" },
};

export const TABS = [
  { id: "properties", label: "Properties", icon: FileText },
  { id: "attributes", label: "Attributes",  icon: Sliders },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export const ACTION_TYPES: ActionType[] = ["trigger", "branch", "jump", "end", "custom", "setVariable"];

export const CATEGORY_ICONS: Record<TriggerCategory, LucideIcon> = { game: Swords, variable: Hash, audio: Music, animation: Clapperboard, ui: Monitor, custom: Wrench };
export const CATEGORY_COLORS: Record<TriggerCategory, string> = { game: "var(--accent-green)", variable: "var(--accent-violet)", audio: "var(--accent-blue)", animation: "var(--accent-orange)", ui: "var(--accent-indigo)", custom: "var(--accent-neutral)" };
export const EXECUTION_DESCRIPTIONS: Record<TriggerExecutionMode, string> = { immediate: "Fires at the moment this node is reached", beforeNext: "Fires before the next dialogue line plays", afterNext: "Fires after the next dialogue line plays" };
export const ALL_CATEGORIES: TriggerCategory[] = ["game", "variable", "audio", "animation", "ui", "custom"];

export const OPERATIONS: { value: VariableOperation; label: string }[] = [
  { value: "set",      label: "Set  (=)" },
  { value: "add",      label: "Add  (+=" },
  { value: "subtract", label: "Subtract (-=" },
  { value: "multiply", label: "Multiply (*=" },
  { value: "divide",   label: "Divide (/=" },
  { value: "toggle",   label: "Toggle" },
];

export function formatOpPreview(op: VariableOperation, value?: string | number | boolean): string {
  switch (op) {
    case "set":      return `= ${value ?? "…"}`;
    case "add":      return `+= ${value ?? "…"}`;
    case "subtract": return `-= ${value ?? "…"}`;
    case "multiply": return `*= ${value ?? "…"}`;
    case "divide":   return `/= ${value ?? "…"}`;
    case "toggle":   return "= !current";
    default:         return String(op);
  }
}
