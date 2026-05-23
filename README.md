# Dialogue Forge

A visual, node-based dialogue tree editor for games and interactive fiction. Build branching conversations as a graph, preview every path in-app, then export structured JSON your game engine can traverse at runtime.

## Features

- **Visual graph editor** — drag-and-drop nodes onto the canvas, connect them by dragging handles, and arrange instantly with one-click auto-layout (`Ctrl+L`)
- **Three node types** — Start (entry point), Character (speaker + dialogue + emotion + portrait), Action (Branch / Trigger / Jump / End)
- **Multiple entry points** — add as many Start nodes as you need; each becomes a selectable entry in the preview, auto-laid out as its own cluster
- **Expanded trigger system** — structured categories (Game, Variable, Audio, Animation, UI, Custom), a filtered event catalogue per category, free-form key-value params, and a timing mode (Immediate / Before Next / After Next)
- **Custom attributes** — attach typed fields to any node: text, number, boolean, dropdown, color, list, or object
- **Inline edge labels** — double-click any edge to add a player-choice label; Branch nodes surface these as selectable options at runtime
- **Jump nodes** — link to any node elsewhere in the graph; pick the target from a dropdown or click it on the canvas; no phantom edge drawn
- **Multi-select & subgraph copy-paste** — Shift-click or drag a selection box, then `Ctrl+C` / `Ctrl+V` to duplicate whole subgraphs with internal edges intact
- **Undo / redo** — full 50-step history via `Ctrl+Z` / `Ctrl+Y`
- **Live validation** — continuously checks for missing Start nodes, incoming edges on Start, open paths, unlabelled branches, orphan nodes, and trigger config gaps; results in the bottom bar with per-node dot indicators
- **In-app preview** — entry-selection screen when multiple Start nodes exist; renders trigger cards with category icon and execution-mode badge; Back button to switch entry
- **Templates** — seven starter projects including Simple Dialogue, Choice Branch, Combat Banter, Multi-Branch Story, Combat Encounter, Quest System, and Shop System; each tagged with feature badges
- **Import / Export** — save as `.forge.json`, reload at any time; confirmation guard prevents accidental overwrites; backward-compatible migration from pre-v1.1 trigger format
- **Search** — `Ctrl+F` searches node names, dialogue text, and action labels; clicking a result pans and zooms to the node
- **Settings panel** — keyboard shortcut reference and a guarded "Clear workspace" action
- **How-to-use page** — full in-app docs at `/how-to-use` with a sticky scroll-tracked TOC and runtime integration guide (TypeScript, Unity C#, Godot, Unreal)

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

To jump into a working example, click **Load demo project** on the empty canvas, or open the sidebar **Templates** section and pick a starter.

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
    ActionNode.tsx      # Action node (branch / trigger / jump / end) + timing badge
    StartNode.tsx       # Entry-point node (teal flag, source handle only)
    index.ts            # nodeTypes registry — all three node types
  edges/
    DialogueEdge.tsx    # Bezier edge with inline-editable choice label
  layout/
    EditorLayout.tsx    # Shell — mounts validation subscriber, all modals
    TopBar.tsx          # Toolbar: undo/redo, save, import, preview, search…
    Sidebar.tsx         # Node palette (all 3 types) and template launcher with tags
    InspectorPanel.tsx  # Right panel, renders NodeInspector
  inspector/
    NodeInspector.tsx   # Properties for Character / Action / Start nodes
    AttributeEditor.tsx # Schema-level attribute management (add/remove/rename)
    AttributeField.tsx  # Single attribute value editor
  modals/
    ConfirmModal.tsx    # Reusable "are you sure?" dialog
    SettingsModal.tsx   # Keyboard shortcut reference + clear workspace
  validation/
    ValidationBar.tsx   # Collapsible bottom bar with issue list
  preview/
    PreviewModal.tsx    # Entry selection screen + full dialogue simulation

store/
  useGraphStore.ts      # Nodes, edges, undo/redo, clipboard, layout, jump targets
  useEditorStore.ts     # UI state: panels, search, settings, preview, pick mode
  useValidationStore.ts # Validation issues + per-node severity lookup (O(1))

lib/
  exportGraph.ts        # Serialize graph → ForgeExport JSON + trigger download
  importGraph.ts        # Parse and validate imported JSON with Zod; migrates old triggers
  validate.ts           # Pure validation engine: Start, orphans, branches, triggers
  autoLayout.ts         # Cluster-aware BFS layout — one island per Start node
  templates.ts          # Seven built-in starter project graphs
  demoProject.ts        # "Visual Novel Example" — two-cluster demo graph

types/
  index.ts              # All types: ForgeNode, ActionNodeData, StartNodeData,
                        # TriggerCategory, TriggerExecutionMode, TRIGGER_EVENTS, …
```

## Keyboard Shortcuts

| Shortcut       | Action                                     |
| -------------- | ------------------------------------------ |
| `Ctrl Z`       | Undo                                       |
| `Ctrl Y`       | Redo                                       |
| `Ctrl D`       | Duplicate selected node                    |
| `Ctrl C`       | Copy selected nodes + edges between them   |
| `Ctrl V`       | Paste copied subgraph                      |
| `Ctrl F`       | Search nodes                               |
| `Ctrl L`       | Auto layout (cluster-aware)                |
| `Ctrl S`       | Save / export JSON                         |
| `Del`          | Delete selected node(s) or edge(s)         |
| `Esc`          | Deselect / close panels / cancel jump pick |
| `Space` + drag | Pan canvas                                 |
| `Shift`        | Multi-select (click or drag)               |

## Exported JSON Format

```jsonc
{
  "version": 1,
  "name": "My Dialogue",
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "nodes": [
    // Start node — marks a dialogue entry point
    {
      "id": "start-main",
      "type": "start",
      "position": { "x": 0, "y": 0 },
      "data": { "name": "Main Story" },
    },
    // Character node — a line of spoken dialogue
    {
      "id": "char-abc",
      "type": "character",
      "position": { "x": 0, "y": 160 },
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
    // Action node — branch: player makes a choice
    {
      "id": "act-branch",
      "type": "action",
      "position": { "x": 0, "y": 320 },
      "data": {
        "actionType": "branch",
        "label": "Player Choice",
        "attributeSchema": [],
        "attributes": {},
      },
    },
    // Action node — trigger: fires a structured game event
    {
      "id": "act-trigger",
      "type": "action",
      "position": { "x": -200, "y": 480 },
      "data": {
        "actionType": "trigger",
        "label": "Quest Started",
        "category": "game", // game | variable | audio | animation | ui | custom
        "event": "QuestStarted",
        "params": { "questId": "main_quest" },
        "executionMode": "afterNext", // immediate | beforeNext | afterNext
        "attributeSchema": [],
        "attributes": {},
      },
    },
    // Action node — jump: redirect flow to another node
    {
      "id": "act-jump",
      "type": "action",
      "position": { "x": -200, "y": 640 },
      "data": {
        "actionType": "jump",
        "label": "Back to Start",
        "jumpTarget": "char-abc",
        "attributeSchema": [],
        "attributes": {},
      },
    },
    // Action node — end: terminate this dialogue path
    {
      "id": "act-end",
      "type": "action",
      "position": { "x": 200, "y": 480 },
      "data": {
        "actionType": "end",
        "label": "End Conversation",
        "attributeSchema": [],
        "attributes": {},
      },
    },
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "start-main",
      "target": "char-abc",
      "type": "dialogue",
      "data": { "optionText": "", "conditions": {}, "metadata": {} },
    },
    {
      "id": "edge-2",
      "source": "char-abc",
      "target": "act-branch",
      "type": "dialogue",
      "data": { "optionText": "", "conditions": {}, "metadata": {} },
    },
    // Branch edges carry the player-facing choice label in optionText
    {
      "id": "edge-3",
      "source": "act-branch",
      "target": "act-trigger",
      "type": "dialogue",
      "data": {
        "optionText": "Accept the quest",
        "conditions": {},
        "metadata": {},
      },
    },
    {
      "id": "edge-4",
      "source": "act-branch",
      "target": "act-end",
      "type": "dialogue",
      "data": {
        "optionText": "Not right now",
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

type Node = (typeof graph.nodes)[number];
type Edge = (typeof graph.edges)[number];

// Build lookup structures once at load time
const nodeById = new Map<string, Node>(graph.nodes.map((n) => [n.id, n]));
const edgesFrom = new Map<string, Edge[]>();
for (const e of graph.edges) {
  if (!edgesFrom.has(e.source)) edgesFrom.set(e.source, []);
  edgesFrom.get(e.source)!.push(e);
}

// Choose an entry point — pick the Start node for the flow you want to run
const starts = graph.nodes.filter((n) => n.type === "start");
const entry = starts.find((n) => n.data.name === "Main Story") ?? starts[0];

// Follow the single outgoing edge from the Start node to reach the first real node
let currentId = edgesFrom.get(entry.id)?.[0]?.target ?? entry.id;

// Traverse
while (true) {
  const node = nodeById.get(currentId)!;
  const edges = edgesFrom.get(currentId) ?? [];

  if (node.type === "start") {
    // Should not appear mid-graph, but skip it safely
    currentId = edges[0]?.target ?? currentId;
  } else if (node.type === "character") {
    // Display the line of dialogue
    console.log(`${node.data.name}: ${node.data.dialogue}`);
    currentId = edges[0]?.target;
    if (!currentId) break;
  } else {
    const d = node.data;
    if (d.actionType === "branch") {
      // Present choices to the player
      const i = await promptPlayer(edges.map((e) => e.data.optionText));
      currentId = edges[i].target;
    } else if (d.actionType === "trigger") {
      // Fire the structured event — timing relative to the next node
      if (d.executionMode === "immediate") {
        fireEvent(d.category, d.event, d.params);
        currentId = edges[0]?.target;
      } else if (d.executionMode === "beforeNext") {
        fireEvent(d.category, d.event, d.params);
        currentId = edges[0]?.target;
      } else {
        // afterNext: fire after the following node has been presented
        const nextId = edges[0]?.target;
        currentId = nextId;
        queueMicrotask(() => fireEvent(d.category, d.event, d.params));
      }
    } else if (d.actionType === "jump") {
      // Jump targets are stored in node data, not as canvas edges
      currentId = d.jumpTarget ?? edges[0]?.target;
    } else if (d.actionType === "end") {
      break;
    }

    if (!currentId) break;
  }
}

function fireEvent(
  category: string,
  event: string | undefined,
  params: Record<string, string> = {},
) {
  // Dispatch to your game engine's event bus
  GameEvents.emit(event ?? category, params);
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

Closing and reopening the tab restores your last session. Use **Export JSON** (`Ctrl+S`) to save a portable copy outside the browser.
