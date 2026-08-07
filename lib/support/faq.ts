export interface FaqEntry {
  id: string;
  question: string;
  /** Plain paragraphs — rendered in order. */
  answer: string[];
}

export interface FaqGroup {
  title: string;
  entries: FaqEntry[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Getting started",
    entries: [
      {
        id: "account-needed",
        question: "Do I need an account to use Dialogue Forge?",
        answer: [
          "No. The editor works fully offline in your browser with no sign-in. Projects you build that way are saved to your browser's local storage and never leave your machine.",
          "Signing in with Google or GitHub unlocks cloud projects, autosave, and the project dashboard — useful if you want the same graph on more than one device.",
        ],
      },
      {
        id: "where-stored",
        question: "Where are my projects stored?",
        answer: [
          "Local projects live in your browser's local storage, tied to that browser on that device. Clearing site data removes them.",
          "Cloud projects are stored against your account and sync automatically as you edit. You can move a local project to the cloud at any time from the project dashboard.",
        ],
      },
      {
        id: "node-types",
        question: "What is each node type for?",
        answer: [
          "Start marks an entry point — you can have several in one file, one per quest, NPC, or scene. Character holds a spoken line with a name, emotion, and portrait.",
          "Action covers the rest: Branch turns outgoing edges into player choices, Trigger emits a single named event to your engine, Set Variable changes project state, Jump redirects the flow, and End closes the conversation.",
        ],
      },
    ],
  },
  {
    title: "Building dialogue",
    entries: [
      {
        id: "trigger-node",
        question: "What exactly does a Trigger node do?",
        answer: [
          "A Trigger has one job: emit a single named event to your game engine, then auto-advance. You choose the event name — Dialogue Forge never interprets it, it just passes it through on export.",
          "You can attach an optional key=value parameter payload and pick when it fires: immediately, before the next line, or after it. Anything that changes project state belongs on a Set Variable node instead.",
        ],
      },
      {
        id: "variables",
        question: "Can I use variables inside dialogue text?",
        answer: [
          "Yes. Wrap a variable name in braces — {playerName} — and it is replaced at preview and runtime. The stored text stays raw, so nothing is baked in at author time.",
          "Type an opening brace in the dialogue editor to open autocomplete, which lists every variable in the project. You can also traverse into object and list variables, like {stats.level} or {inventory.length}.",
        ],
      },
      {
        id: "conditions",
        question: "How do I make a choice appear only sometimes?",
        answer: [
          "Select the edge for that choice and add a condition group. Conditions compare project variables using operators appropriate to their type, and can be nested with AND / OR logic.",
          "Locked choices are shown as unavailable in the in-editor preview, along with the reason, so you can test every path without leaving the app.",
        ],
      },
    ],
  },
  {
    title: "Export & integration",
    entries: [
      {
        id: "export",
        question: "How do I get my dialogue into my game?",
        answer: [
          "Export JSON writes a single .forge.json file containing every node, edge, and variable in the project, plus the schema version it was written with.",
          "The format is engine-agnostic plain JSON — no runtime library is required. The How to use page walks through a minimal TypeScript runner and shows the equivalent approach for Unity, Unreal, and Godot.",
        ],
      },
      {
        id: "old-files",
        question: "Will an old .forge.json still open after an update?",
        answer: [
          "Yes. Files are versioned, and older projects are migrated forward automatically the moment they are loaded. Missing fields are filled with sensible defaults rather than dropped.",
          "Before any migration runs, a snapshot of the file as it was is kept in your browser's local storage, so an unexpected result is recoverable.",
        ],
      },
      {
        id: "collaboration",
        question: "Can my team work on the same project together?",
        answer: [
          "Not yet — real-time collaboration and shared workspaces are planned. In the meantime, exported .forge.json files are plain text and diff reasonably well in version control.",
          "The Roadmap page tracks where multiplayer editing sits relative to everything else in flight.",
        ],
      },
    ],
  },
  {
    title: "Troubleshooting",
    entries: [
      {
        id: "lost-work",
        question: "I cleared my workspace by accident. Can I get it back?",
        answer: [
          "Possibly. Dialogue Forge keeps the last few automatic snapshots of your local draft in browser storage, and undo history covers the current session.",
          "If neither recovers it, send us a message below with roughly when it happened and which browser you were using, and we'll tell you exactly where to look.",
        ],
      },
      {
        id: "validation",
        question: "What do the warning dots on my nodes mean?",
        answer: [
          "Validation runs continuously and flags things that will bite you later: a node with no label, an action that leads nowhere, a Trigger with no event name, or a condition pointing at a deleted variable.",
          "Warnings never block you from working or exporting — they are advisory. Errors mark structural problems worth fixing before you ship the file to your engine.",
        ],
      },
      {
        id: "response-time",
        question: "How quickly will I hear back?",
        answer: [
          "Dialogue Forge is a small project, so replies usually land within a couple of days. Bug reports that include the steps you took and, where possible, the exported .forge.json get resolved fastest.",
        ],
      },
    ],
  },
];
