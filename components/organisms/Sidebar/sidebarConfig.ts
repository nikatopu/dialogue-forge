import type { CSSProperties, ComponentType } from "react";
import { User, Zap, Flag } from "lucide-react";

export const TAG_COLORS: Record<string, string> = {
  start:        "bg-teal-500/15 text-teal-400 border-teal-500/25",
  trigger:      "bg-amber-500/15 text-amber-400 border-amber-500/25",
  triggers:     "bg-amber-500/15 text-amber-400 border-amber-500/25",
  branch:       "bg-violet-500/15 text-violet-400 border-violet-500/25",
  choice:       "bg-violet-500/15 text-violet-400 border-violet-500/25",
  combat:       "bg-rose-500/15 text-rose-400 border-rose-500/25",
  audio:        "bg-sky-500/15 text-sky-400 border-sky-500/25",
  game:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  ui:           "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  jump:         "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "multi-entry":"bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  basic:        "",
  linear:       "",
};

export type NodeTemplate = {
  type: "character" | "action" | "start";
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  iconColor: CSSProperties;
  iconBg: CSSProperties;
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: "character",
    label: "Character",
    description: "Dialogue node",
    icon: User,
    iconColor: { color: "oklch(0.65 0.19 260)" },
    iconBg: { backgroundColor: "oklch(0.52 0.255 262 / 12%)" },
  },
  {
    type: "action",
    label: "Action",
    description: "Trigger / branch / jump",
    icon: Zap,
    iconColor: { color: "oklch(0.72 0.18 155)" },
    iconBg: { backgroundColor: "oklch(0.52 0.18 155 / 12%)" },
  },
  {
    type: "start",
    label: "Start",
    description: "Entry point",
    icon: Flag,
    iconColor: { color: "oklch(0.68 0.15 180)" },
    iconBg: { backgroundColor: "oklch(0.5 0.15 180 / 12%)" },
  },
];
