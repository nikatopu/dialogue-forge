"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Network,
  User,
  Zap,
  GitBranch,
  SkipForward,
  Square,
  MousePointer,
  Keyboard,
  Download,
  Upload,
  FileJson,
  Play,
  Code2,
  Layers,
  Copy,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── TOC definition ────────────────────────────────────────── */

const TOC = [
  { id: "interface",   title: "The Interface" },
  { id: "node-types",  title: "Node Types" },
  { id: "building",    title: "Building a Graph" },
  { id: "selection",   title: "Selection & Multi-Select" },
  { id: "shortcuts",   title: "Keyboard Shortcuts" },
  { id: "saving",      title: "Saving & Loading" },
  { id: "json-format", title: "The Exported JSON" },
  { id: "runtime",     title: "Using the JSON in Your Game" },
] as const;

type SectionId = (typeof TOC)[number]["id"];

/* ─── Page root ─────────────────────────────────────────────── */

export function HowToUseContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<SectionId>(TOC[0].id);
  const [tocOpen, setTocOpen] = useState(false);

  const scrollToSection = useCallback((id: string) => {
    const container = containerRef.current;
    const el = document.getElementById(id);
    if (!container || !el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const target = container.scrollTop + (elRect.top - containerRect.top) - 80;
    container.scrollTo({ top: target, behavior: "smooth" });
    setActiveId(id as SectionId);
    setTocOpen(false);
  }, []);

  /* Scroll-position-based active section tracking */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function update() {
      const containerRect = container!.getBoundingClientRect();
      const triggerY = containerRect.top + container!.clientHeight * 0.28;

      let found: SectionId = TOC[0].id;
      for (const { id } of TOC) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= triggerY) found = id;
      }
      setActiveId(found);
    }

    container.addEventListener("scroll", update, { passive: true });
    update();
    return () => container.removeEventListener("scroll", update);
  }, []);

  /* scrollToSection is defined above via useCallback */

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto bg-background text-foreground scroll-smooth"
    >
      <div className="max-w-5xl mx-auto px-6 py-12 pb-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to editor
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Network className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dialogue Forge</h1>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            A visual editor for building branching dialogue trees for games and interactive
            fiction. Design conversations with a node graph, then export structured JSON your
            game engine can traverse at runtime.
          </p>
        </div>

        {/* Mobile collapsible TOC — hidden on lg+ */}
        <div className="lg:hidden mb-8 rounded-xl border border-border/50 bg-card/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                tocOpen && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {tocOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <nav className="px-3 pb-3 space-y-0.5">
                  {TOC.map(({ id, title }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className={cn(
                        "w-full text-left text-xs py-2 px-3 rounded-lg transition-all duration-150",
                        activeId === id
                          ? "text-primary font-medium bg-primary/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      {title}
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-12 items-start">

          {/* ── Sticky TOC sidebar (lg+) ── */}
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-3">
                On this page
              </p>
              <nav aria-label="Table of contents">
                <ul className="space-y-0.5">
                  {TOC.map(({ id, title }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(id)}
                        className={cn(
                          "w-full text-left text-xs py-1.5 px-3 rounded-lg transition-all duration-150",
                          "border-l-2",
                          activeId === id
                            ? "border-primary text-primary font-medium bg-primary/8"
                            : "border-transparent text-muted-foreground hover:text-foreground/80 hover:bg-muted/30"
                        )}
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-14">

            {/* 1. The Interface */}
            <section id="interface" aria-labelledby="heading-interface">
              <SectionHeading id="heading-interface" icon={Layers} title="The Interface" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Sidebar", desc: "Drag node types onto the canvas or click a template to load a starter project." },
                  { label: "Canvas", desc: "Your graph lives here. Pan with Space+drag, zoom with the scroll wheel." },
                  { label: "Inspector", desc: "Click any node to open its detail panel on the right — edit name, dialogue, emotion, and custom attributes." },
                  { label: "Validation bar", desc: "Runs continuously. Surfaces errors (disconnected nodes, empty dialogue) and warnings at the bottom of the screen." },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <p className="text-xs font-semibold text-foreground mb-1">{item.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Node Types */}
            <section id="node-types" aria-labelledby="heading-node-types">
              <SectionHeading id="heading-node-types" icon={User} title="Node Types" />
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Every node is either a <strong className="text-foreground">Character</strong> node or an{" "}
                <strong className="text-foreground">Action</strong> node.
              </p>
              <div className="space-y-3">
                <NodeCard
                  color="indigo"
                  icon={User}
                  title="Character node"
                  desc="Represents a speaker delivering a line of dialogue. Fill in the character name, dialogue text, and optional emotion. Add custom attributes (numbers, dropdowns, flags) to track game state — e.g. Courage: 7 or Faction: Rebel."
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1">
                  Action node types
                </p>
                <NodeCard
                  color="emerald"
                  icon={GitBranch}
                  title="Branch"
                  desc="Presents outgoing edges as labelled player choices. Each edge label (double-click to edit) becomes a selectable option in your game UI."
                />
                <NodeCard
                  color="emerald"
                  icon={Zap}
                  title="Trigger"
                  desc="Fires a game event and auto-advances. Use it to unlock quests, set flags, or award items. Attach a Flag Name attribute to name the event."
                />
                <NodeCard
                  color="emerald"
                  icon={SkipForward}
                  title="Jump"
                  desc="Redirects the flow to another part of the graph — useful for looping back or skipping ahead without drawing a long edge."
                />
                <NodeCard
                  color="emerald"
                  icon={Square}
                  title="End"
                  desc="Terminates the conversation. Connect the final node in every path to an End node so your runtime knows when to close the dialogue window."
                />
              </div>
            </section>

            {/* 3. Building a Graph */}
            <section id="building" aria-labelledby="heading-building">
              <SectionHeading id="heading-building" icon={MousePointer} title="Building a Graph" />
              <ol className="space-y-3 mt-4">
                {[
                  { n: "1", text: "Drag a Character or Action node from the sidebar onto the canvas, or click \"Add Node\" at the bottom of the sidebar." },
                  { n: "2", text: "Click a node to open its inspector. Edit name, dialogue, and any attributes." },
                  { n: "3", text: "Connect nodes by hovering over a node's right handle until the cursor changes, then drag to another node's left handle." },
                  { n: "4", text: "For Branch nodes, double-click each outgoing edge label to type the player choice text." },
                  { n: "5", text: "Every conversation path must end at an End action node. The validation bar will flag open paths." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    {step.text}
                  </li>
                ))}
              </ol>
            </section>

            {/* 4. Selection & Multi-Select */}
            <section id="selection" aria-labelledby="heading-selection">
              <SectionHeading id="heading-selection" icon={Copy} title="Selection & Multi-Select" />
              <div className="space-y-2.5 mt-4 text-sm text-muted-foreground">
                <p><Kbd>Click</Kbd> — select a single node and open it in the inspector.</p>
                <p><Kbd>Shift</Kbd> + <Kbd>Click</Kbd> — add a node or edge to the current selection.</p>
                <p><Kbd>Shift</Kbd> + drag on the canvas — draw a selection rectangle.</p>
                <p><Kbd>Ctrl</Kbd><Kbd>C</Kbd> — copy all selected nodes and the edges that connect them to each other.</p>
                <p><Kbd>Ctrl</Kbd><Kbd>V</Kbd> — paste the copied subgraph offset by 40 px. All internal edges are recreated with fresh IDs; connections to nodes outside the selection are not copied.</p>
                <p><Kbd>Del</Kbd> — delete all selected nodes and/or selected edges in one action.</p>
                <p>Click an edge to select it, then press <Kbd>Del</Kbd> to remove just that edge without touching its nodes.</p>
              </div>
            </section>

            {/* 5. Keyboard Shortcuts */}
            <section id="shortcuts" aria-labelledby="heading-shortcuts">
              <SectionHeading id="heading-shortcuts" icon={Keyboard} title="Keyboard Shortcuts" />
              <div className="mt-4 rounded-xl border border-border/50 overflow-hidden">
                {[
                  { keys: ["Ctrl", "Z"],        label: "Undo" },
                  { keys: ["Ctrl", "Y"],        label: "Redo" },
                  { keys: ["Ctrl", "D"],        label: "Duplicate selected node" },
                  { keys: ["Ctrl", "C"],        label: "Copy selected nodes (preserves edges)" },
                  { keys: ["Ctrl", "V"],        label: "Paste copied subgraph" },
                  { keys: ["Ctrl", "F"],        label: "Search nodes" },
                  { keys: ["Ctrl", "L"],        label: "Auto layout" },
                  { keys: ["Ctrl", "S"],        label: "Save / export JSON" },
                  { keys: ["Del"],              label: "Delete selected node(s) or edge(s)" },
                  { keys: ["Esc"],              label: "Deselect / close panels" },
                  { keys: ["Space", "+ drag"],  label: "Pan the canvas" },
                  { keys: ["Shift"],            label: "Multi-select (click or drag)" },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5",
                      i !== arr.length - 1 && "border-b border-border/30"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-1">
                      {row.keys.map((k) => (
                        <kbd
                          key={k}
                          className="font-mono bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-[10px] text-foreground/70"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Saving & Loading */}
            <section id="saving" aria-labelledby="heading-saving">
              <SectionHeading id="heading-saving" icon={Download} title="Saving & Loading" />
              <div className="space-y-3 mt-4">
                <InfoRow icon={Download} label="Save / Export">
                  Clicking <strong className="text-foreground">Save</strong> (or pressing{" "}
                  <Kbd>Ctrl</Kbd><Kbd>S</Kbd>) downloads a{" "}
                  <code className="text-[11px] bg-muted/60 px-1 rounded">.forge.json</code> file.
                  This is your project file — keep it somewhere safe.
                </InfoRow>
                <InfoRow icon={Upload} label="Import">
                  Click the <strong className="text-foreground">Import</strong> button and select a
                  previously saved <code className="text-[11px] bg-muted/60 px-1 rounded">.forge.json</code> (or
                  any compatible JSON). If the canvas has content you&apos;ll be asked to confirm
                  before replacing it.
                </InfoRow>
                <InfoRow icon={Play} label="Preview">
                  The <strong className="text-foreground">Preview</strong> button runs the dialogue in a
                  lightweight simulator so you can walk through every branch before exporting.
                </InfoRow>
              </div>
            </section>

            {/* 7. The Exported JSON */}
            <section id="json-format" aria-labelledby="heading-json-format">
              <SectionHeading id="heading-json-format" icon={FileJson} title="The Exported JSON" />
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                The export is a self-contained JSON object. Here&apos;s the top-level shape:
              </p>
              <CodeBlock>{`{
  "version": 1,
  "name": "My Dialogue",
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "nodes": [ ...node objects... ],
  "edges": [ ...edge objects... ]
}`}</CodeBlock>

              <p className="text-sm text-muted-foreground mt-6 mb-3">
                A <strong className="text-foreground">character node</strong>:
              </p>
              <CodeBlock>{`{
  "id": "char-abc123",
  "type": "character",
  "position": { "x": 0, "y": 0 },        // editor layout only — ignore at runtime
  "data": {
    "name": "Guard",
    "dialogue": "Halt! Who goes there?",
    "emotion": "angry",                   // free-form string
    "portrait": "",                       // URL or asset path
    "attributeSchema": [
      { "id": "attr-hp", "name": "HP", "type": "number", "defaultValue": 100 }
    ],
    "attributes": { "attr-hp": 100 }      // current values, keyed by schema id
  }
}`}</CodeBlock>

              <p className="text-sm text-muted-foreground mt-6 mb-3">
                An <strong className="text-foreground">action node</strong>:
              </p>
              <CodeBlock>{`{
  "id": "act-def456",
  "type": "action",
  "position": { "x": 240, "y": 0 },
  "data": {
    "actionType": "branch",   // "branch" | "trigger" | "jump" | "end"
    "label": "Player Choice",
    "attributeSchema": [],
    "attributes": {}
  }
}`}</CodeBlock>

              <p className="text-sm text-muted-foreground mt-6 mb-3">
                An <strong className="text-foreground">edge</strong>:
              </p>
              <CodeBlock>{`{
  "id": "edge-ghi789",
  "source": "act-def456",      // id of the node this edge exits
  "target": "char-jkl012",     // id of the node this edge enters
  "type": "dialogue",
  "data": {
    "optionText": "I'm a traveler.",   // player-facing choice label (branch edges)
    "conditions": {},                  // reserved for runtime conditions
    "metadata": {}                     // reserved for custom data
  }
}`}</CodeBlock>
            </section>

            {/* 8. Runtime integration */}
            <section id="runtime" aria-labelledby="heading-runtime">
              <SectionHeading id="heading-runtime" icon={Code2} title="Using the JSON in Your Game" />
              <p className="text-sm text-muted-foreground mt-2 mb-5">
                The graph is a directed acyclic graph (DAG). At runtime, load the JSON, find the
                entry node, and walk edges until you hit an <em>end</em> action. Below is a
                complete, copy-pasteable TypeScript runtime.
              </p>

              <Label>Step 1 — TypeScript types</Label>
              <CodeBlock>{`interface NodeData {
  name?: string;
  dialogue?: string;
  emotion?: string;
  portrait?: string;
  actionType?: "branch" | "trigger" | "jump" | "end";
  label?: string;
  attributes?: Record<string, unknown>;
}

interface DialogueNode {
  id: string;
  type: "character" | "action";
  data: NodeData;
}

interface DialogueEdge {
  id: string;
  source: string;
  target: string;
  data: { optionText: string; conditions: object; metadata: object };
}

interface DialogueGraph {
  version: number;
  name: string;
  nodes: DialogueNode[];
  edges: DialogueEdge[];
}`}</CodeBlock>

              <Label className="mt-6">Step 2 — Build lookup maps</Label>
              <CodeBlock>{`import graphJson from "./my-dialogue.forge.json";

const graph = graphJson as DialogueGraph;

// O(1) lookups by id
const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

// Outgoing edges grouped by source node
const edgesFrom = new Map<string, DialogueEdge[]>();
for (const edge of graph.edges) {
  if (!edgesFrom.has(edge.source)) edgesFrom.set(edge.source, []);
  edgesFrom.get(edge.source)!.push(edge);
}`}</CodeBlock>

              <Label className="mt-6">Step 3 — Find the entry node</Label>
              <CodeBlock>{`function findStartNode(graph: DialogueGraph): DialogueNode {
  const hasIncoming = new Set(graph.edges.map((e) => e.target));
  // Root nodes have no incoming edges
  return graph.nodes.find((n) => !hasIncoming.has(n.id)) ?? graph.nodes[0];
}`}</CodeBlock>

              <Label className="mt-6">Step 4 — Dialogue runner</Label>
              <CodeBlock>{`class DialogueRunner {
  private currentId: string;

  constructor(startNode: DialogueNode) {
    this.currentId = startNode.id;
  }

  get current(): DialogueNode        { return nodeById.get(this.currentId)!; }
  get choices(): DialogueEdge[]      { return edgesFrom.get(this.currentId) ?? []; }
  get isEnded(): boolean {
    const n = this.current;
    return n.type === "action" && n.data.actionType === "end";
  }

  /** Move to the next node. Pass a choiceIndex for branch nodes. */
  advance(choiceIndex = 0): boolean {
    if (this.isEnded) return false;
    const edge = this.choices[choiceIndex];
    if (!edge) return false;
    this.currentId = edge.target;
    return true;
  }
}

// ── Example traversal loop ─────────────────────────────────────
const runner = new DialogueRunner(findStartNode(graph));

while (!runner.isEnded) {
  const node = runner.current;

  if (node.type === "character") {
    console.log(\`\${node.data.name}: \${node.data.dialogue}\`);
    runner.advance();                    // auto-advance (single outgoing edge)

  } else if (node.data.actionType === "branch") {
    runner.choices.forEach((e, i) =>
      console.log(\`  [\${i}] \${e.data.optionText}\`)
    );
    const playerChoice = 0;             // ← replace with real player input
    runner.advance(playerChoice);

  } else if (node.data.actionType === "trigger") {
    fireGameEvent(node.data.label!);    // ← your event system here
    runner.advance();

  } else if (node.data.actionType === "jump") {
    runner.advance();                    // follows the single outgoing edge
  }
}`}</CodeBlock>

              <Label className="mt-6">Other engines</Label>
              <div className="rounded-xl border border-border/50 bg-card/40 p-4 text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Unity (C#)</strong> — use{" "}
                  <code className="text-[11px] bg-muted/60 px-1 rounded">Newtonsoft.Json</code> or{" "}
                  <code className="text-[11px] bg-muted/60 px-1 rounded">System.Text.Json</code> to
                  deserialize into equivalent C# classes. The traversal logic maps 1-to-1.
                </p>
                <p>
                  <strong className="text-foreground">Godot (GDScript)</strong> — use{" "}
                  <code className="text-[11px] bg-muted/60 px-1 rounded">JSON.parse_string()</code> and
                  store nodes/edges in Dictionary arrays. GDScript&apos;s dynamic typing makes
                  traversal straightforward.
                </p>
                <p>
                  <strong className="text-foreground">Unreal (C++/Blueprints)</strong> — deserialize
                  with{" "}
                  <code className="text-[11px] bg-muted/60 px-1 rounded">FJsonSerializer</code> into{" "}
                  <code className="text-[11px] bg-muted/60 px-1 rounded">TMap</code> structures.
                  Blueprint-callable functions can wrap the runner pattern.
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold text-primary mb-2">Tips</p>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>
                    The <code className="bg-muted/60 px-1 rounded">position</code> field on each node
                    is only for the editor canvas — safely ignore it at runtime.
                  </li>
                  <li>
                    <code className="bg-muted/60 px-1 rounded">conditions</code> and{" "}
                    <code className="bg-muted/60 px-1 rounded">metadata</code> on edges are reserved
                    for future runtime logic, e.g. only show a branch choice if the player has enough
                    gold.
                  </li>
                  <li>
                    Character <code className="bg-muted/60 px-1 rounded">attributes</code> mirror the{" "}
                    <code className="bg-muted/60 px-1 rounded">attributeSchema</code> — use the schema
                    to know each value&apos;s type before reading it.
                  </li>
                  <li>
                    Files are versioned (<code className="bg-muted/60 px-1 rounded">&quot;version&quot;: 1</code>) so
                    you can handle format migrations as the tool evolves.
                  </li>
                </ul>
              </div>
            </section>

          </div>{/* end main content */}
        </div>{/* end two-column */}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to the editor
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────── */

function SectionHeading({
  id,
  icon: Icon,
  title,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-primary/70 shrink-0" />
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
    </div>
  );
}

function NodeCard({
  color,
  icon: Icon,
  title,
  desc,
}: {
  color: "indigo" | "emerald";
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  const cls =
    color === "indigo"
      ? "bg-indigo-500/10 text-indigo-400"
      : "bg-emerald-500/10 text-emerald-400";
  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-card/40 p-4">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cls)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground mb-0.5">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-card/40 p-4">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-foreground mb-0.5">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-[10px] text-foreground/80 mx-0.5">
      {children}
    </kbd>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2", className)}>
      {children}
    </p>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-muted/30 border border-border/40 px-4 py-4 text-[11.5px] leading-relaxed text-foreground/80 font-mono overflow-x-auto whitespace-pre">
      {children}
    </pre>
  );
}
