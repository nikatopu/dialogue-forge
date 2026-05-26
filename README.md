<div align="center">

<br />

```
██████╗ ██╗ █████╗ ██╗      ██████╗  ██████╗ ██╗   ██╗███████╗
██╔══██╗██║██╔══██╗██║     ██╔═══██╗██╔════╝ ██║   ██║██╔════╝
██║  ██║██║███████║██║     ██║   ██║██║  ███╗██║   ██║█████╗  
██║  ██║██║██╔══██║██║     ██║   ██║██║   ██║██║   ██║██╔══╝  
██████╔╝██║██║  ██║███████╗╚██████╔╝╚██████╔╝╚██████╔╝███████╗
╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝

        ███████╗ ██████╗ ██████╗  ██████╗ ███████╗            
        ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝            
        █████╗  ██║   ██║██████╔╝██║  ███╗█████╗              
        ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝              
        ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗            
        ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝            
```

**Build branching dialogue the way stories actually work: visually, node by node.**

<br />

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React Flow](https://img.shields.io/badge/React_Flow_v12-FF0072?style=flat-square)](https://reactflow.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Version](https://img.shields.io/github/v/release/nikatopu/dialogue-forge?style=flat-square&color=6366f1)](https://github.com/nikatopu/dialogue-forge/releases)
[![License](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](./LICENSE)

<br />

[**Live Demo**](https://dialogue-forge.nikatopu.dev) · [**Roadmap**](https://dialogue-forge.nikatopu.dev/roadmap) · [**How to Use**](https://dialogue-forge.nikatopu.dev/how-to-use) · [**Report a Bug**](https://github.com/nikatopu/dialogue-forge/issues)

<br />

</div>

<p align="center">
  <img src="./public/preview.jpg" alt="Dialogue Forge — Visual Dialogue Tree Editor" width="100%" style="border-radius: 12px" />
</p>

<br />

---

<br />

## What is Dialogue Forge?

Dialogue Forge is a **visual branching dialogue editor** built for game developers, narrative designers, and interactive fiction writers. Design complex conversation graphs with a drag-and-drop canvas, preview every branch without leaving the editor, and export structured JSON ready for Unity, Godot, Unreal, or any custom runtime.

No code required to design. No guesswork required to preview. No friction between idea and export.

<br />

---

<br />

## Feature Overview

<br />

### Node-Based Visual Editing

Conversations are graphs. Dialogue Forge treats them that way.

| Node          | Purpose                                                    |
| ------------- | ---------------------------------------------------------- |
| **Start**     | Entry points — one per story branch, quest, NPC, or scene  |
| **Character** | Speaker line with name, emotion, portrait, and metadata    |
| **Action**    | Branch choices, Jump links, Trigger events, or End markers |

Every connection is a potential story path. Every branch is a traversable flow.

<br />

### The Full Editor Toolkit

```
Drag & drop canvas      Auto layout (Ctrl+L)      Live validation
Search nodes (Ctrl+F)   Copy / paste subgraphs    Undo / redo history
Multi-select editing    Import / Export JSON       Context menus
```

<br />

### Multi-Entry Narratives

A single project can hold your entire game's dialogue. Each `START` node becomes its own independent flow:

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  START MainStory│   │  START Merchant │   │  START Tutorial │
│  ─────────────  │   │  ─────────────  │   │  ─────────────  │
│  Chapter 1...   │   │  Welcome to...  │   │  Press WASD...  │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
        ...                   ...                   ...
```

Each entry runs its own preview flow. All live inside one `.forge.json` file.

<br />

### Runtime Event System

Trigger nodes emit structured events your game engine can act on.

**Trigger categories:**

| Category  | Examples                                          |
| --------- | ------------------------------------------------- |
| Game      | `QuestStarted`, `FlagSet`, `AchievementUnlocked`  |
| Variables | `SetGold +50`, `PlayerLevel`, `RelationshipScore` |
| Audio     | `PlayMusic battle_theme`, `StopAmbience`          |
| Animation | `PlayAnim wave`, `SetExpression sad`              |
| UI        | `OpenInventory`, `ShowHUD`, `FadeIn`              |
| Custom    | Anything your runtime handles                     |

**Execution timing:** Immediate · Before Next Node · After Next Node

<br />

### In-Editor Preview

Test every branch without leaving Dialogue Forge.

- Select any entry point and walk through the entire flow
- Traverse all branch choices interactively
- Inspect trigger events and execution timing
- Follow Jump links across the graph
- Switch between branches mid-preview

Ship dialogue you've actually seen play out.

<br />

---

<br />

## Cloud Workspace

Work locally, sync globally — or stay local forever. Your choice.

```
Without an account          With an account (free)
────────────────────        ──────────────────────────────
✓ Full editor               ✓ Everything local, plus:
✓ Unlimited local files     ✓ Cloud autosave
✓ Import / Export           ✓ Up to 5 cloud projects
✓ All templates             ✓ Access from any device
✓ All themes                ✓ Local → cloud migration
                            ✓ Autosave status indicator
```

Sign in with **Google** or **GitHub**. Guests are never blocked.

<br />

---

<br />

## Production Templates

Start fast with templates built for real game scenarios.

| Template           | Description                                      |
| ------------------ | ------------------------------------------------ |
| NPC Conversation   | Greeting + multi-branch player responses         |
| Quest Giver        | Accept / decline with follow-up flows            |
| Merchant           | Shop greeting, haggle, and farewell paths        |
| Combat Encounter   | Pre-battle dialogue with outcome branches        |
| Companion Dialogue | Relationship tier system with emotional paths    |
| Tutorial Sequence  | Step-by-step guided onboarding flow              |
| Cutscene           | Cinematic narrative with timed triggers          |
| Multi-Entry RPG    | Full project starter with multiple story threads |

**Insert mode** — append a template into your existing graph without losing any work. IDs are remapped automatically.

**Replace mode** — load a template as a fresh workspace.

<br />

---

<br />

## Themes

Six dark variants. One accent color per theme, applied across every panel, node, badge, and graph element.

```
  ● Default    —  Indigo    #6366f1
  ● Ocean      —  Cyan      #06b6d4
  ● Forest     —  Green     #16a34a
  ● Midnight   —  Violet    #7c3aed
  ● Rose       —  Pink      #f43f5e
  ● Cyber      —  Lime      #84cc16
```

Preferences persist across sessions and sync to cloud accounts.

<br />

---

<br />

## Mobile & Tablet

Dialogue Forge is fully responsive and touch-first.

- Pinch to zoom the canvas
- Bottom sheets for node creation and inspection
- Floating action buttons
- Full preview on mobile
- Tablet layout with adaptive panels

Design dialogue on the train. Finish it at your desk.

<br />

---

<br />

## Tech Stack

```
Framework      Next.js 16         App Router, server + client components
Language       TypeScript 5       Strict, end-to-end typed
Styling        Tailwind CSS v4    CSS-first, no config file
Components     shadcn/ui          Radix primitives + custom design system
Graph Engine   React Flow v12     Nodes, edges, handles, minimap
State          Zustand            Persist middleware, per-slice stores
Animation      Framer Motion      Panel transitions, presence animations
Validation     Zod                Runtime schema validation
Icons          Lucide             Consistent icon set
Auth / DB      Supabase           Auth, Postgres, realtime, storage
```

<br />

---

<br />

## Getting Started

**1. Install and run**

```bash
git clone https://github.com/nikatopu/dialogue-forge.git
cd dialogue-forge
npm install
npm run dev
```

**2. Open the editor**

```
http://localhost:3000
```

**3. Pick a template or start blank**

Load one of the built-in templates from the toolbar to hit the ground running, or start with an empty canvas.

<br />

---

<br />

## Cloud Setup (Optional)

The editor works fully offline without any credentials. To enable cloud sync:

**1. Copy the environment template**

```bash
cp .env.local.example .env.local
```

**2. Add your Supabase credentials**

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**3. Run the database schema**

```
lib/supabase/schema.sql
```

**4. Enable OAuth providers in Supabase**

- Authentication → Providers → Google
- Authentication → Providers → GitHub

<br />

---

<br />

## Keyboard Shortcuts

| Shortcut       | Action           |
| -------------- | ---------------- |
| `Ctrl + Z`     | Undo             |
| `Ctrl + Y`     | Redo             |
| `Ctrl + D`     | Duplicate node   |
| `Ctrl + C`     | Copy node        |
| `Ctrl + V`     | Paste node       |
| `Ctrl + F`     | Search nodes     |
| `Ctrl + L`     | Auto layout      |
| `Ctrl + S`     | Export JSON      |
| `Del`          | Delete selected  |
| `Esc`          | Deselect / close |
| `Space + Drag` | Pan canvas       |
| `Shift`        | Multi-select     |

<br />

---

<br />

## Project Structure

```
dialogue-forge/
├── app/
│   ├── page.tsx              # Editor entry
│   ├── projects/             # Cloud project dashboard
│   ├── roadmap/              # Public roadmap
│   ├── how-to-use/           # Documentation
│   ├── auth/                 # Auth callback
│   ├── privacy/              # Privacy policy
│   └── terms/                # Terms of service
│
├── components/
│   ├── nodes/                # Character, Action, Start node UIs
│   ├── layout/               # TopBar, Sidebar, EditorLayout
│   ├── settings/             # SettingsPanel (fullscreen)
│   ├── auth/                 # SignInModal
│   ├── dashboard/            # ProjectCard, DashboardPage
│   ├── modals/               # ConfirmModal, TemplateActionModal
│   └── preview/              # In-editor preview player
│
├── store/
│   ├── useGraphStore.ts      # Nodes, edges, undo/redo
│   ├── useEditorStore.ts     # UI state, theme, project ID
│   └── useProjectStore.ts    # Cloud projects, auth user
│
└── lib/
    ├── supabase/             # Client, server, schema, types
    ├── templates.ts          # Built-in template definitions
    ├── exportGraph.ts        # Serialization + JSON download
    ├── roadmap.ts            # Roadmap data
    └── applyTheme.ts         # DOM theme application
```

<br />

---

<br />

## Local Storage

Dialogue Forge autosaves to the browser on every change.

```
dialogue-forge-graph    →  All nodes and edges
dialogue-forge-ui       →  Theme, sidebar state, project name
```

Closing and reopening the browser restores your last session exactly. Use `Ctrl + S` to export a portable `.forge.json` backup.

<br />

---

<br />

## Roadmap

Dialogue Forge is growing into a full **narrative workflow platform**.

```
v1.4  Gameplay State System    Variables, conditions, conditional branches
v1.5  Narrative Database       Character library, portraits, voice metadata
v1.6  Quest & Scene Systems    Quest graphs, timeline view, story chapters
v1.7  Collaboration            Shared projects, comments, review mode
v1.8  Runtime Ecosystem        Unity SDK, Godot plugin, React player
v1.9  Analytics & QA           Path analysis, validation reports, heatmaps
v2.0  AI Narrative Assistant   Dialogue generation, tone rewriting, localization
```

Full details at [dialogue-forge.nikatopu.dev/roadmap](https://dialogue-forge.nikatopu.dev/roadmap)

<br />

---

<br />

<div align="center">

Built with Next.js, TypeScript, React Flow, Supabase, and a lot of graph logic.

**If Dialogue Forge saves you time, a star on GitHub means a lot.**

[**Star on GitHub**](https://github.com/nikatopu/dialogue-forge) · [**Report an Issue**](https://github.com/nikatopu/dialogue-forge/issues) · [**nikatopu@gmail.com**](mailto:nikatopu@gmail.com)

<br />

</div>
