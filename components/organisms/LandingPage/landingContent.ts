import {
  GitBranch, Variable, PlayCircle, FileJson, Cloud, Palette,
  type LucideIcon,
} from "lucide-react";

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Mirrors the feature set documented in the README, kept to one line each. */
export const FEATURES: LandingFeature[] = [
  {
    icon: GitBranch,
    title: "Node-based branching",
    description:
      "Drag Start, Character and Action nodes onto an infinite canvas and wire them into a conversation you can actually see.",
  },
  {
    icon: Variable,
    title: "Variables & conditions",
    description:
      "Gate choices behind project state. Numbers, booleans, strings, lists and objects, with a visual condition builder.",
  },
  {
    icon: PlayCircle,
    title: "Play it in the editor",
    description:
      "Step through the dialogue exactly as a player would, watch variables change, and catch dead ends before export.",
  },
  {
    icon: FileJson,
    title: "Engine-agnostic export",
    description:
      "One structured JSON file with no runtime library attached. Traverse it from Unity, Godot, Unreal or your own loop.",
  },
  {
    icon: Cloud,
    title: "Local first, cloud optional",
    description:
      "Everything works signed out and stays in your browser. Sign in only when you want projects on more than one device.",
  },
  {
    icon: Palette,
    title: "Six themes, light and dark",
    description:
      "The canvas is where you will spend hours. Pick a palette that does not fight you, on desktop, tablet or phone.",
  },
];

export interface LandingStep {
  number: string;
  title: string;
  description: string;
}

export const STEPS: LandingStep[] = [
  {
    number: "01",
    title: "Sketch the conversation",
    description: "Drop a Start node, add character lines, and connect them in the order they should play.",
  },
  {
    number: "02",
    title: "Branch on player choice",
    description: "Add a Branch action, give each outgoing edge its option text, and attach conditions where you need them.",
  },
  {
    number: "03",
    title: "Preview and export",
    description: "Run the conversation in the editor, fix what the validator flags, then export JSON for your engine.",
  },
];
