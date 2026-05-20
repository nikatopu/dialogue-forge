import type { Metadata } from "next";
import { HowToUseContent } from "./content";

export const metadata: Metadata = {
  title: "How to Use | Dialogue Forge",
  description:
    "Complete guide to Dialogue Forge — build branching dialogue trees visually, understand every node type and keyboard shortcut, and export structured JSON ready for Unity, Godot, Unreal Engine, or any custom runtime.",
  keywords: [
    "dialogue editor",
    "branching dialogue",
    "visual novel editor",
    "game dialogue tree",
    "RPG dialogue",
    "dialogue graph",
    "interactive fiction",
    "JSON export",
    "Unity dialogue",
    "Godot dialogue",
    "Unreal dialogue",
  ],
  openGraph: {
    title: "How to Use | Dialogue Forge",
    description:
      "Visual node-based dialogue editor for games. Build branching conversations and export structured JSON for any game engine.",
    type: "article",
    siteName: "Dialogue Forge",
  },
  twitter: {
    card: "summary",
    title: "How to Use | Dialogue Forge",
    description:
      "Visual dialogue tree editor for games. Export structured JSON for Unity, Godot, Unreal, and web.",
  },
  robots: { index: true, follow: true },
};

export default function HowToUsePage() {
  return <HowToUseContent />;
}
