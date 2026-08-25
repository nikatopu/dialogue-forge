/** One grouped bullet list inside a release's detail body, e.g. "Light mode" → its bullets. */
export interface ChangelogSection {
  heading: string;
  items: string[];
}

/** A shipped release, rendered as a blog-style card on the roadmap page. */
export interface ChangelogRelease {
  version: string;
  /** The tag immediately before this one, for a "Full changelog: vX...vY" compare link. */
  previousVersion?: string;
  title: string;
  /** Short human date, e.g. "Aug 4, 2026". */
  date: string;
  summary: string;
  sections: ChangelogSection[];
}

/** Every shipped release, newest first. Mirrors the GitHub release notes. */
export const CHANGELOG: ChangelogRelease[] = [
  {
    version: "v1.4.3",
    previousVersion: "v1.4.2",
    title: "Landing Page Relaunch & Visitor Analytics",
    date: "Aug 25, 2026",
    summary:
      "The public site gets a real value proposition, an SEO pass, and a proper changelog — and under the hood, the app can now see which engines people actually export for.",
    sections: [
      {
        heading: "New landing page",
        items: [
          'Hero rewritten around a clear value prop, with a no-signup "Open the editor" CTA and an in-page "See how it works" link',
          "Three trust chips: no account needed, free including commercial use, exports to any engine",
          "The hero graph visual now shows the full loop, ending in a dialogue.json export card",
          "Smooth page-to-page transitions and staggered entrance animations across the marketing pages and the editor",
        ],
      },
      {
        heading: "Better SEO",
        items: [
          "New title, description, and a real 1200×630 Open Graph / Twitter card image",
          "staging.dialogueforge.org is now excluded from indexing — a noindex header plus a host-aware robots.txt keep search engines on production only",
        ],
      },
      {
        heading: "Release notes & What's New",
        items: [
          "The roadmap page is now a real changelog: past releases as expandable detailed cards, upcoming work as a simple planned/future list",
          'Returning visitors get a one-time "What\'s New" popup summarizing the latest release, with Support and How-to-use links',
        ],
      },
      {
        heading: "Visitor & activation analytics",
        items: [
          "Anonymous, cookieless visit tracking across the whole activation funnel — landing, first node, first branch, first export",
          "First-touch campaign attribution (UTM parameters and referrer), and a dev-only live capture view at /dev/analytics",
        ],
      },
      {
        heading: "Engine export tracking",
        items: [
          "A one-time picker asks which engine (Unity, Godot, Unreal, or other) a save or export is for, and remembers the answer",
          "Exports are now tagged by engine, so we can see what people are actually building for",
        ],
      },
    ],
  },

  {
    version: "v1.4.2",
    previousVersion: "v1.4.1",
    title: "Light Mode & Reworked Workspace",
    date: "Aug 4, 2026",
    summary:
      "The editor gets a new look and a workspace that stays out of your way: full light mode, a reorganized panel layout, and a simpler trigger model.",
    sections: [
      {
        heading: "Light mode",
        items: [
          "Full light theme across the entire editor",
          "Consistent theming for the canvas, panels, and node styling",
        ],
      },
      {
        heading: "Reworked workspace layout",
        items: [
          "Sidebar, inspector, and variable toggles moved to the edges of the screen",
          "Open-panel indicators so you always know what's expanded",
          "More usable canvas space at every window size",
        ],
      },
      {
        heading: "Triggers rework",
        items: [
          "Trigger categories removed entirely",
          "Triggers now expose emittable functions, easier to wire into your game",
          "Simpler, flatter trigger configuration in the inspector",
        ],
      },
      {
        heading: "Support & site improvements",
        items: [
          "New support page with direct email messaging, powered by Resend",
          "Analytics enabled only after cookie consent is given",
          "Corrected metadata for the new site URL",
        ],
      },
      {
        heading: "Under the hood",
        items: [
          "Large components split into smaller, focused subcomponents",
          "Cleaner separation of concerns across the editor",
        ],
      },
    ],
  },

  {
    version: "v1.4.1",
    previousVersion: "v1.4.0",
    title: "Dynamic Dialogue & Advanced Variables",
    date: "Jul 9, 2026",
    summary:
      "Dialogue can now react directly to your game state — variables can be used inside dialogue text, making conversations more dynamic and personal.",
    sections: [
      {
        heading: "What's new",
        items: [
          'Use variables directly in dialogue text, e.g. "So we finally meet, {playerName}."',
          "Player name and custom text variable support",
          "Dynamic text replacement during preview and at runtime",
          "New variable types and advanced condition operators",
          "Improved variable editor with a live preview of variable values",
          "A runtime interpolation engine, and better validation for variable references and conditions",
        ],
      },
    ],
  },

  {
    version: "v1.4.0",
    previousVersion: "v1.3.3",
    title: "Variables, Conditions & State Systems",
    date: "Jun 9, 2026",
    summary:
      "The biggest update yet. Dialogue is no longer limited to static trees — variables, conditions, and runtime logic make it possible to build RPG dialogue systems, quest chains, merchants, and companion relationships.",
    sections: [
      {
        heading: "Variables & actions",
        items: [
          "Project-wide variables: number, boolean, and string",
          "Set Variable action with set / add / subtract / multiply / divide / toggle",
        ],
      },
      {
        heading: "Conditions",
        items: [
          "Branches can now be gated by conditions, e.g. gold >= 5",
          "Condition groups combine multiple checks with AND / OR, built visually with no scripting",
        ],
      },
      {
        heading: "State-aware preview",
        items: [
          "Simulate gameplay state before starting a preview",
          "A live state panel showing current variables, recent changes, and triggered events",
        ],
      },
      {
        heading: "Validation & templates",
        items: [
          "New validation for missing variables, invalid references, and broken conditions",
          "Built-in templates upgraded to use variables and conditions",
          "Export format now includes variables, conditions, and actions — fully backward compatible",
        ],
      },
    ],
  },

  {
    version: "v1.3.3",
    previousVersion: "v1.3.2",
    title: "UI Architecture Refactor",
    date: "May 29, 2026",
    summary:
      "An internal frontend refactor with no new user-facing features — it lays the foundation for everything that shipped after it.",
    sections: [
      {
        heading: "What changed",
        items: [
          "Refactored the UI to follow Atomic Design (Atoms, Molecules, Organisms)",
          "Standardized component structure and migrated styling to modular SCSS",
          "Reduced duplicated UI and styling code",
          "Improved responsive styling organization",
          "Shared component conventions for future development",
        ],
      },
    ],
  },

  {
    version: "v1.3.2",
    previousVersion: "v1.3.1",
    title: "Project Migration & Self-Healing Data",
    date: "May 29, 2026",
    summary:
      "A migration and repair system that automatically updates projects to the latest format whenever they're loaded, for local and cloud projects alike.",
    sections: [
      {
        heading: "Migration & repair",
        items: [
          "Projects carry version metadata and are checked, repaired, and validated on open",
          "Self-healing for missing node fields, action properties, and metadata",
          "A backup is taken before any migration runs",
        ],
      },
      {
        heading: "Cloud & local",
        items: [
          "Cloud projects are migrated and re-saved transparently",
          "Local projects upgrade automatically — no prompts required",
        ],
      },
    ],
  },

  {
    version: "v1.3.1",
    previousVersion: "v1.3.0",
    title: "Local → Cloud Migration",
    date: "May 27, 2026",
    summary:
      "Completes the cloud migration workflow — existing local projects can now move into the cloud without losing any data.",
    sections: [
      {
        heading: "Migration",
        items: [
          "Import Local Projects, with Import All or Import Selected",
          "Preserves graph data, project metadata, theme preferences, and names",
          "First-login prompt to import existing local projects into the cloud",
        ],
      },
      {
        heading: "Project management",
        items: [
          'Per-project "Move to Cloud", with the option to keep a local copy',
          "Dashboard views for All, Recent, Cloud, and Local",
          "Immediate dashboard refresh and correct project counts",
        ],
      },
    ],
  },

  {
    version: "v1.3.0",
    previousVersion: "v1.2.0",
    title: "Cloud Workspace & Product Experience",
    date: "May 26, 2026",
    summary:
      "Dialogue Forge evolves from a local editor into a cloud-backed narrative workspace: accounts, cloud projects, a public roadmap, and a redesigned project experience.",
    sections: [
      {
        heading: "Cloud workspace",
        items: [
          "Google and GitHub authentication",
          "Cloud project storage with an autosave workflow",
          "A project dashboard with search, sorting, and duplicate / delete",
        ],
      },
      {
        heading: "Roadmap & templates",
        items: [
          "A public /roadmap page",
          "Insert-template workflow that preserves the current graph",
          "New production templates: Merchant, Quest Giver, Combat Encounter, and more",
        ],
      },
      {
        heading: "UX & themes",
        items: [
          "Redesigned header with fewer icons and overflow menus",
          "Fullscreen settings overlay in place of modal dialogs",
          "Six color themes: Default, Ocean, Forest, Midnight, Rose, Cyber",
        ],
      },
    ],
  },

  {
    version: "v1.2.0",
    previousVersion: "v1.1.0",
    title: "Mobile Support & Touch Editing",
    date: "May 24, 2026",
    summary:
      "Dialogue Forge is now fully usable on phones and tablets, with responsive layouts and touch-first interactions alongside the unchanged desktop experience.",
    sections: [
      {
        heading: "Touch editing",
        items: [
          "Pinch to zoom, two-finger pan, and touch node selection and dragging",
          "Double tap to open the inspector, plus long-press interactions",
        ],
      },
      {
        heading: "Mobile layout",
        items: [
          "Fullscreen canvas with a sidebar drawer, bottom-sheet inspector, and floating toolbar",
          "Node creation without drag-and-drop",
        ],
      },
      {
        heading: "Mobile preview & docs",
        items: [
          "Fullscreen preview with larger touch targets",
          "Responsive /how-to-use page with a mobile table of contents",
        ],
      },
    ],
  },

  {
    version: "v1.1.0",
    previousVersion: "v1.0.1",
    title: "Entry Points & Event System Expansion",
    date: "May 24, 2026",
    summary:
      "Multi-entry dialogue flows, an expanded event system, and chained runtime behavior.",
    sections: [
      {
        heading: "Start events",
        items: [
          "A dedicated Start node type for multiple independent dialogue roots — Main Story, Merchant, Combat, and more",
          "Entry selection during preview, with auto-layout clustering each root separately",
        ],
      },
      {
        heading: "Trigger events",
        items: [
          "Categories for Game, Variables, Audio, Animation, UI, and Custom events",
          "Chained execution timing: Immediate, Before Next, After Next",
        ],
      },
      {
        heading: "Templates & validation",
        items: [
          "Expanded template library: Multi Branch Story, Combat Encounter, and more",
          "Validation for isolated starts, empty branches, and misconfigured triggers",
        ],
      },
    ],
  },

  {
    version: "v1.0.1",
    title: "Branch Editor Improvements",
    date: "May 20, 2026",
    summary:
      "A patch release focused on dialogue authoring workflow improvements.",
    sections: [
      {
        heading: "Fixed",
        items: [
          "Branch nodes now allow custom branch names and player answer labels, instead of default placeholders",
        ],
      },
      {
        heading: "Added",
        items: [
          "Character name suggestions — reuse existing character names while editing, for consistency across a project",
        ],
      },
    ],
  },
];

export type RoadmapStatus = "planned" | "future";

/** What's coming next — deliberately just a title and a status, no detail yet. */
export interface RoadmapItem {
  version: string;
  title: string;
  status: RoadmapStatus;
}

export const ROADMAP: RoadmapItem[] = [
  { version: "v1.5", title: "Narrative Database", status: "planned" },
  { version: "v1.6", title: "Quest & Narrative Systems", status: "planned" },
  { version: "v1.7", title: "Collaboration Workspace", status: "planned" },
  { version: "v1.8", title: "Runtime Ecosystem", status: "planned" },
  { version: "v1.9", title: "Analytics & QA", status: "planned" },
  { version: "v2.0", title: "AI Narrative Assistant", status: "future" },
  { version: "Future", title: "Narrative Platform", status: "future" },
];

export const STATUS_LABELS: Record<RoadmapStatus, string> = {
  planned: "Planned",
  future: "Future",
};
