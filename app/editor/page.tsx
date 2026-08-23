import type { Metadata } from "next";
import { EditorLayout } from "@/components/organisms/EditorLayout";

export const metadata: Metadata = {
  title: "Editor",
  description:
    "Build branching dialogue trees on an infinite canvas. Add character lines, branches, conditions and variables, preview the conversation, and export structured JSON.",
  alternates: { canonical: "/editor" },
  openGraph: {
    title: "Editor | Dialogue Forge",
    description:
      "Visual node-based editor for branching dialogue. Design conversations as a graph and export structured JSON for any game engine.",
    type: "website",
    siteName: "Dialogue Forge",
  },
  // The editor is an application surface, not a page worth indexing — the
  // landing page at / is the canonical entry point for search.
  robots: { index: false, follow: true },
};

export default function EditorPage() {
  return <EditorLayout />;
}
