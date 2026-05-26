export type RoadmapStatus = "completed" | "in-progress" | "planned" | "future";

export interface RoadmapEntry {
  version: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  progress?: number;
  features: string[];
}

export const ROADMAP: RoadmapEntry[] = [
  {
    version: "v1.0",
    title: "Editor Foundation",
    description:
      "Core visual dialogue editor with graph workflows, preview, templates, and runtime export.",
    status: "completed",
    features: [
      "Visual graph editor",
      "Character / Action / Start nodes",
      "Branching dialogue flows",
      "Import / export (.forge.json)",
      "Preview mode",
      "Templates",
      "Undo / redo",
      "Validation system",
    ],
  },

  {
    version: "v1.1",
    title: "Narrative Events",
    description:
      "Multi-entry dialogue flows, runtime triggers, and reusable templates.",
    status: "completed",
    features: [
      "Start nodes",
      "Multiple dialogue entry points",
      "Trigger categories",
      "Chained event execution",
      "Jump workflows",
      "Production templates",
    ],
  },

  {
    version: "v1.2",
    title: "Responsive Experience",
    description:
      "Touch-first editing and mobile support across the entire editor.",
    status: "completed",
    features: [
      "Responsive layout",
      "Mobile editing",
      "Bottom sheets",
      "Touch interactions",
      "Mobile preview",
      "Tablet support",
    ],
  },

  {
    version: "v1.3",
    title: "Cloud Workspace",
    description:
      "Projects move beyond local storage with accounts, cloud sync and workspace management.",
    status: "completed",
    features: [
      "Google / GitHub auth",
      "Cloud projects",
      "Autosave",
      "Project dashboard",
      "Local → cloud migration",
      "Freemium foundations",
    ],
  },

  {
    version: "v1.4",
    title: "Gameplay State System",
    description:
      "Dialogue becomes gameplay-aware through variables and conditional logic.",
    status: "in-progress",
    progress: 0,
    features: [
      "Variables",
      "Conditions",
      "Conditional branches",
      "Runtime evaluation",
      "State preview",
      "Edge expressions",
      "Quest flags",
    ],
  },

  {
    version: "v1.5",
    title: "Narrative Database",
    description: "Reusable narrative assets shared across projects.",
    status: "planned",
    features: [
      "Character library",
      "Portrait management",
      "Voice metadata",
      "Global updates",
      "Reusable archetypes",
      "Character relationships",
      "Tagging system",
    ],
  },

  {
    version: "v1.6",
    title: "Quest & Narrative Systems",
    description: "Expand beyond dialogue into narrative design workflows.",
    status: "planned",
    features: [
      "Quest graphs",
      "Timeline view",
      "Quest dependencies",
      "Scene organization",
      "Narrative tags",
      "Story chapters",
      "Progress tracking",
    ],
  },

  {
    version: "v1.7",
    title: "Collaboration Workspace",
    description: "Narrative teams work together inside Dialogue Forge.",
    status: "planned",
    features: [
      "Shared projects",
      "Comments",
      "Review mode",
      "Version history",
      "Read-only links",
      "Roles",
    ],
  },

  {
    version: "v1.8",
    title: "Runtime Ecosystem",
    description: "Dialogue Forge becomes a deployable runtime platform.",
    status: "planned",
    features: [
      "dialogue-forge-runtime",
      "React player",
      "Unity SDK",
      "Godot plugin",
      "Unreal bridge",
      "Runtime debugger",
      "Live preview player",
    ],
  },

  {
    version: "v1.9",
    title: "Analytics & QA",
    description: "Validate and optimize narrative structures.",
    status: "planned",
    features: [
      "Unreachable nodes",
      "Path analysis",
      "Branch complexity",
      "Missing endings",
      "Dialogue analytics",
      "Heatmaps",
      "Validation reports",
    ],
  },

  {
    version: "v2.0",
    title: "AI Narrative Assistant",
    description: "AI-assisted narrative workflows.",
    status: "future",
    features: [
      "Dialogue generation",
      "Branch suggestions",
      "Tone rewriting",
      "Localization",
      "Character consistency",
      "Quest generation",
      "Narrative summaries",
    ],
  },

  {
    version: "Future",
    title: "Narrative Platform",
    description: "Long-term vision: complete narrative workflow ecosystem.",
    status: "future",
    features: [
      "Marketplace",
      "Template sharing",
      "Team workspaces",
      "Plugins",
      "Voice pipelines",
      "Visual scripting",
      "Mod support",
    ],
  },
];

export const STATUS_COLUMNS: RoadmapStatus[] = [
  "completed",
  "in-progress",
  "planned",
  "future",
];

export const STATUS_LABELS: Record<RoadmapStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
  future: "Future",
};
