# Dialogue Forge

A visual, node-based dialogue tree editor for games and interactive fiction. Build branching conversations as a graph, preview every path in-app, then export structured JSON your game engine can traverse at runtime.


## Features

- **Visual graph editor** — drag-and-drop nodes onto the canvas, connect them by dragging handles, and arrange instantly with one-click auto-layout
- **Two node types** — Character nodes (speaker, dialogue, emotion, portrait) and Action nodes (Branch, Trigger, Jump, End)
- **Custom attributes** — attach typed fields to any node: text, number, boolean, dropdown, color, list, or object
- **Inline edge labels** — double-click any edge to add a player-choice label; Branch nodes surface these as selectable options at runtime
- **Multi-select & subgraph copy-paste** — Shift-click or drag a selection box, then Ctrl+C / Ctrl+V to duplicate whole subgraphs with internal edges intact
- **Undo / redo** — full 50-step history via Ctrl+Z / Ctrl+Y
- **Live validation** — continuously checks for orphan nodes, missing dialogue, open paths, and unlabelled branch edges; results shown in the bottom bar with per-node indicators
- **In-app preview** — walk every branch of your dialogue before exporting
- **Templates** — three built-in starter projects (Simple Dialogue, Choice Branch, Combat Banter) with an unsaved-data confirmation guard
- **Import / Export** — save as `.forge.json`, reload it any time; confirmation guard prevents accidental overwrites
- **Search** — Ctrl+F fuzzy-searches node names and dialogue text; clicking a result pans and zooms to the node
- **Settings panel** — keyboard shortcut reference and a guarded "Clear workspace" action
- **How-to-use page** — full in-app documentation at `/how-to-use` with a sticky scroll-tracked table of contents and a complete runtime integration guide (TypeScript, Unity C#, Godot, Unreal)


## Tech Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| Framework          | Next.js 16 (App Router) |
| Language           | TypeScript 5 (strict)   |
| Styling            | Tailwind CSS v4         |
| Components         | shadcn/ui (Radix UI)    |
| Graph engine       | `@xyflow/react` v12     |
| State              | Zustand with `persist`  |
| Animation          | Framer Motion           |
| Validation schemas | Zod v4                  |
| Icons              | Lucide React            |


## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The editor loads immediately with an empty canvas.

To jump into a working example, click **Load demo project** on the empty canvas or open the sidebar **Templates** section and pick a starter.

## Project Structure

```
app/
  page.tsx              # Editor entry point
  layout.tsx            # Root layout — fonts, providers, global SEO metadata
  icon.svg              # Brand favicon (auto-detected by Next.js App Router)
  how-to-use/
    page.tsx            # Server component — exports SEO metadata
    content.tsx         # Client component — full docs page with scroll-tracked TOC

components/
  graph/
    GraphCanvas.tsx     # ReactFlow canvas, keyboard shortcuts, drag-and-drop
    ContextMenu.tsx     # Right-click node menu
    SearchOverlay.tsx   # Ctrl+F search panel (inside ReactFlowProvider)
  nodes/
    CharacterNode.tsx   # Speaker node with live validation indicator
    ActionNode.tsx      # Action node (branch / trigger / jump / end)
  edges/
    DialogueEdge.tsx    # Bezier edge with inline-editable choice label
  layout/
    EditorLayout.tsx    # Shell — mounts validation subscriber, all modals
    TopBar.tsx          # Toolbar: undo/redo, save, import, preview, search…
    Sidebar.tsx         # Node palette and template launcher
    InspectorPanel.tsx  # Right panel, renders NodeInspector
  inspector/
    NodeInspector.tsx   # Edit name / dialogue / emotion + attribute values
    AttributeEditor.tsx # Schema-level attribute management (add/remove/rename)
    AttributeField.tsx  # Single attribute value editor
  modals/
    ConfirmModal.tsx    # Reusable "are you sure?" dialog
    SettingsModal.tsx   # Keyboard shortcut reference + clear workspace
  validation/
    ValidationBar.tsx   # Collapsible bottom bar with issue list
  preview/
    PreviewModal.tsx    # Simulate dialogue traversal in-app

store/
  useGraphStore.ts      # Nodes, edges, undo/redo stacks, clipboard, layout
  useEditorStore.ts     # UI state: panels, search, settings, preview open
  useValidationStore.ts # Validation issues + per-node severity lookup (O(1))

lib/
  exportGraph.ts        # Serialize graph → ForgeExport JSON + trigger download
  importGraph.ts        # Parse and validate imported JSON with Zod
  validate.ts           # Pure validation engine: orphans, cycles, open paths
  autoLayout.ts         # BFS hierarchical layout (no external dependency)
  templates.ts          # Built-in starter project graph data
  demoProject.ts        # "Visual Novel Example" demo graph

schemas/
  attributeSchema.ts    # Zod schemas for attribute type definitions

types/
  index.ts              # ForgeNode, DialogueEdge, SerialNode/Edge, and more
```


## Keyboard Shortcuts

| Shortcut       | Action                                   |
| -------------- | ---------------------------------------- |
| `Ctrl Z`       | Undo                                     |
| `Ctrl Y`       | Redo                                     |
| `Ctrl D`       | Duplicate selected node                  |
| `Ctrl C`       | Copy selected nodes + edges between them |
| `Ctrl V`       | Paste copied subgraph                    |
| `Ctrl F`       | Search nodes                             |
| `Ctrl L`       | Auto layout                              |
| `Ctrl S`       | Save / export JSON                       |
| `Del`          | Delete selected node(s) or edge(s)       |
| `Esc`          | Deselect / close panels                  |
| `Space` + drag | Pan canvas                               |
| `Shift`        | Multi-select (click or drag)             |


## Exported JSON Format

```jsonc
{
  "version": 1,
  "name": "My Dialogue",
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "nodes": [
    {
      "id": "char-abc",
      "type": "character",
      "position": { "x": 0, "y": 0 }, // editor only — ignore at runtime
      "data": {
        "name": "Guard",
        "dialogue": "Halt! Who goes there?",
        "emotion": "angry",
        "portrait": "",
        "attributeSchema": [
          {
            "id": "attr-1",
            "name": "HP",
            "type": "number",
            "defaultValue": 100,
          },
        ],
        "attributes": { "attr-1": 100 },
      },
    },
    {
      "id": "act-def",
      "type": "action",
      "position": { "x": 240, "y": 0 },
      "data": {
        "actionType": "branch", // "branch" | "trigger" | "jump" | "end"
        "label": "Player Choice",
        "attributeSchema": [],
        "attributes": {},
      },
    },
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "char-abc",
      "target": "act-def",
      "type": "dialogue",
      "data": {
        "optionText": "", // player-facing label on branch edges
        "conditions": {},
        "metadata": {},
      },
    },
  ],
}
```

See [the in-app docs](/how-to-use) for a full TypeScript `DialogueRunner` class, O(1) lookup maps, and engine-specific notes for Unity, Godot, and Unreal.


## Runtime Quick-Start

```typescript
import graph from "./dialogue.forge.json";

// Build lookup structures once
const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
const edgesFrom = new Map<string, (typeof graph.edges)[number][]>();
for (const e of graph.edges) {
  if (!edgesFrom.has(e.source)) edgesFrom.set(e.source, []);
  edgesFrom.get(e.source)!.push(e);
}

// Find the root node (no incoming edges)
const targets = new Set(graph.edges.map((e) => e.target));
let currentId =
  graph.nodes.find((n) => !targets.has(n.id))?.id ?? graph.nodes[0].id;

// Traverse
while (true) {
  const node = nodeById.get(currentId)!;
  const edges = edgesFrom.get(currentId) ?? [];

  if (node.type === "character") {
    console.log(`${node.data.name}: ${node.data.dialogue}`);
    currentId = edges[0]?.target ?? currentId;
    if (!edges[0]) break;
  } else if (node.data.actionType === "branch") {
    const i = promptPlayer(edges.map((e) => e.data.optionText)); // your UI
    currentId = edges[i].target;
  } else if (node.data.actionType === "trigger") {
    fireGameEvent(node.data.label!); // your event system
    currentId = edges[0]?.target ?? currentId;
  } else if (node.data.actionType === "end") {
    break;
  } else {
    // jump
    currentId = edges[0]?.target ?? currentId;
  }
}
```


## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start development server on port 3000 |
| `npm run build` | Production build                      |
| `npm run start` | Serve the production build            |
| `npm run lint`  | Run ESLint                            |


## Browser Storage

The editor auto-saves to `localStorage` under two keys:

| Key                    | Contents                                                |
| ---------------------- | ------------------------------------------------------- |
| `dialogue-forge-graph` | Nodes and edges (selection and undo state are stripped) |
| `dialogue-forge-ui`    | Sidebar/inspector visibility, project name, theme       |

Closing and reopening the tab restores your last session. Use **Export JSON** (or Ctrl+S) to save a portable copy outside the browser.
