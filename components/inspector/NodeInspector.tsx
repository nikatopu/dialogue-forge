"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Zap,
  Flag,
  Sliders,
  FileText,
  Trash2,
  Copy,
  GitBranch,
  SkipForward,
  Square,
  Wrench,
  Crosshair,
  Swords,
  Music,
  Hash,
  Clapperboard,
  Monitor,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AttributeEditor } from "./AttributeEditor";
import { useGraphStore } from "@/store/useGraphStore";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";
import type {
  ForgeNode,
  CharacterNodeData,
  ActionNodeData,
  ActionType,
  TriggerCategory,
  TriggerExecutionMode,
  StartNodeData,
} from "@/types";
import { TRIGGER_EVENTS } from "@/types";

const ACTION_STRIP: Record<
  ActionType,
  {
    icon: LucideIcon;
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
  }
> = {
  trigger: {
    icon: Zap,
    label: "Trigger",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/25",
    glow: "from-emerald-500/5",
  },
  branch: {
    icon: GitBranch,
    label: "Branch",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/25",
    glow: "from-orange-500/5",
  },
  jump: {
    icon: SkipForward,
    label: "Jump",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/25",
    glow: "from-sky-500/5",
  },
  end: {
    icon: Square,
    label: "End",
    color: "text-rose-400",
    bg: "bg-rose-500/15",
    border: "border-rose-500/25",
    glow: "from-rose-500/5",
  },
  custom: {
    icon: Wrench,
    label: "Custom",
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    border: "border-violet-500/25",
    glow: "from-violet-500/5",
  },
};

const TABS = [
  { id: "properties", label: "Properties", icon: FileText },
  { id: "attributes", label: "Attributes", icon: Sliders },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface NodeInspectorProps {
  node: ForgeNode;
}

export function NodeInspector({ node }: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("properties");
  const { updateNodeData, removeNode, duplicateNode } = useGraphStore();
  const { setSelectedNodeId, setMobileInspectorOpen } = useEditorStore();

  const isStart = node.type === "start";
  const isCharacter = node.type === "character";
  const isAction = node.type === "action";

  const data = node.data as CharacterNodeData | ActionNodeData | StartNodeData;
  const schema = (data as CharacterNodeData).attributeSchema ?? [];
  const values = (data as CharacterNodeData).attributes ?? {};
  const attrCount = schema.length;

  const actionCfg = isAction
    ? (ACTION_STRIP[(data as ActionNodeData).actionType] ?? ACTION_STRIP.custom)
    : null;

  const stripGlow = isStart
    ? "from-teal-500/5"
    : isCharacter
      ? "from-indigo-500/5"
      : actionCfg!.glow;

  const stripIconBg = isStart
    ? "bg-teal-500/15 border-teal-500/25"
    : isCharacter
      ? "bg-indigo-500/15 border-indigo-500/25"
      : cn(actionCfg!.bg, actionCfg!.border);

  const stripLabel = isStart
    ? (data as StartNodeData).name || "Entry Point"
    : isCharacter
      ? (data as CharacterNodeData).name || "Unnamed"
      : (data as ActionNodeData).label || "Action";

  const stripType = isStart
    ? "Start node"
    : isCharacter
      ? "Character node"
      : `${actionCfg!.label} node`;

  function handleDelete() {
    removeNode(node.id);
    setSelectedNodeId(null);
    setMobileInspectorOpen(false);
  }

  function handleDuplicate() {
    duplicateNode(node.id);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Node identity strip */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3 border-b border-border/50",
          "bg-linear-to-r to-transparent",
          stripGlow,
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
            stripIconBg,
          )}
        >
          {isStart ? (
            <Flag className="w-3.5 h-3.5 text-teal-400" />
          ) : isCharacter ? (
            <User className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            (() => {
              const Icon = actionCfg!.icon;
              return <Icon className={cn("w-3.5 h-3.5", actionCfg!.color)} />;
            })()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{stripLabel}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{stripType}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="w-6 h-6 text-muted-foreground/50 hover:text-foreground"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="w-6 h-6 text-muted-foreground/50 hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium",
                "border-b-2 transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
              {tab.id === "attributes" && attrCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[9px] h-3.5 px-1 min-w-4 justify-center"
                >
                  {attrCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "properties" && (
          <div className="p-4 space-y-4">
            {isStart ? (
              <StartNodeProperties
                data={data as StartNodeData}
                onUpdate={(patch) => updateNodeData(node.id, patch)}
              />
            ) : isCharacter ? (
              <CharacterProperties
                nodeId={node.id}
                data={data as CharacterNodeData}
                onUpdate={(patch) => updateNodeData(node.id, patch)}
              />
            ) : (
              <ActionProperties
                nodeId={node.id}
                data={data as ActionNodeData}
                onUpdate={(patch) => updateNodeData(node.id, patch)}
              />
            )}

            <Separator className="opacity-40" />

            <div className="space-y-1.5">
              <SectionLabel>Node ID</SectionLabel>
              <p className="text-[10px] font-mono text-muted-foreground bg-muted/30 rounded px-2 py-1 break-all">
                {node.id}
              </p>
            </div>

            <div className="space-y-1">
              <SectionLabel>Position</SectionLabel>
              <div className="flex gap-2">
                <Chip label="X" value={Math.round(node.position.x)} />
                <Chip label="Y" value={Math.round(node.position.y)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "attributes" && (
          <div className="p-4">
            {isStart ? (
              <p className="text-[10px] text-muted-foreground/45 italic">
                Start nodes do not have attributes.
              </p>
            ) : (
              <AttributeEditor nodeId={node.id} schema={schema} values={values} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Property forms ──────────────────────────────────── */

interface StartNodePropertiesProps {
  data: StartNodeData;
  onUpdate: (patch: Partial<StartNodeData>) => void;
}

function StartNodeProperties({ data, onUpdate }: StartNodePropertiesProps) {
  return (
    <div className="space-y-3.5">
      <InspectorField label="Entry Name">
        <InlineInput
          value={data.name}
          placeholder="e.g. Main Story, Combat"
          onCommit={(v) => onUpdate({ name: v })}
        />
      </InspectorField>
      <p className="text-[10px] text-muted-foreground/45 leading-relaxed">
        Start nodes are entry points for your dialogue graph. Connect outgoing
        edges to begin the flow. Each Start node appears as a choice in the
        preview.
      </p>
    </div>
  );
}

interface CharacterPropertiesProps {
  nodeId: string;
  data: CharacterNodeData;
  onUpdate: (patch: Partial<CharacterNodeData>) => void;
}

function CharacterProperties({
  nodeId,
  data,
  onUpdate,
}: CharacterPropertiesProps) {
  const characterNames = useGraphStore(
    useShallow(
      (s) =>
        s.nodes
          .filter((n) => n.type === "character" && n.id !== nodeId)
          .map((n) => (n.data as CharacterNodeData).name)
          .filter(Boolean)
          .filter((name, i, arr) => arr.indexOf(name) === i), // unique names only
    ),
  );

  return (
    <div className="space-y-3.5">
      <InspectorField label="Name">
        <InlineInput
          value={data.name}
          placeholder="Character name"
          suggestions={characterNames}
          onCommit={(v) => onUpdate({ name: v })}
        />
      </InspectorField>

      <InspectorField label="Dialogue">
        <InlineTextarea
          value={data.dialogue}
          placeholder="What does this character say?"
          onCommit={(v) => onUpdate({ dialogue: v })}
          rows={4}
        />
      </InspectorField>

      <InspectorField label="Emotion">
        <InlineInput
          value={data.emotion ?? ""}
          placeholder="e.g. Happy, Sad, Angry"
          onCommit={(v) => onUpdate({ emotion: v })}
        />
      </InspectorField>

      <InspectorField label="Portrait URL">
        <InlineInput
          value={data.portrait ?? ""}
          placeholder="https://…"
          onCommit={(v) => onUpdate({ portrait: v })}
        />
      </InspectorField>
    </div>
  );
}

const ACTION_TYPES: ActionType[] = [
  "trigger",
  "branch",
  "jump",
  "end",
  "custom",
];

interface ActionPropertiesProps {
  nodeId: string;
  data: ActionNodeData;
  onUpdate: (patch: Partial<ActionNodeData>) => void;
}

function ActionProperties({ nodeId, data, onUpdate }: ActionPropertiesProps) {
  return (
    <div className="space-y-3.5">
      <InspectorField label="Label">
        <InlineInput
          value={data.label}
          placeholder="Action label"
          onCommit={(v) => onUpdate({ label: v })}
        />
      </InspectorField>

      <InspectorField label="Action Type">
        <select
          value={data.actionType}
          onChange={(e) =>
            onUpdate({ actionType: e.target.value as ActionType })
          }
          aria-label="Action type"
          className={cn(
            "h-7 w-full rounded-md border border-border/60 bg-background/40 px-2",
            "text-xs text-foreground appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring/50",
          )}
        >
          {ACTION_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </InspectorField>

      {data.actionType === "trigger" && (
        <TriggerSection data={data} onUpdate={onUpdate} />
      )}
      {data.actionType === "branch" && <BranchOptionsSection nodeId={nodeId} />}
      {data.actionType === "jump" && <JumpTargetSection nodeId={nodeId} />}
    </div>
  );
}

/* ─── Trigger panel ───────────────────────────────────────── */

const CATEGORY_ICONS: Record<TriggerCategory, LucideIcon> = {
  game: Swords,
  variable: Hash,
  audio: Music,
  animation: Clapperboard,
  ui: Monitor,
  custom: Wrench,
};

const CATEGORY_COLORS: Record<TriggerCategory, string> = {
  game: "text-emerald-400",
  variable: "text-violet-400",
  audio: "text-sky-400",
  animation: "text-orange-400",
  ui: "text-indigo-400",
  custom: "text-zinc-400",
};

const EXECUTION_DESCRIPTIONS: Record<TriggerExecutionMode, string> = {
  immediate: "Fires at the moment this node is reached",
  beforeNext: "Fires before the next dialogue line plays",
  afterNext: "Fires after the next dialogue line plays",
};

const ALL_CATEGORIES: TriggerCategory[] = [
  "game",
  "variable",
  "audio",
  "animation",
  "ui",
  "custom",
];

function TriggerSection({
  data,
  onUpdate,
}: {
  data: ActionNodeData;
  onUpdate: (patch: Partial<ActionNodeData>) => void;
}) {
  const category = data.category ?? "custom";
  const CategoryIcon = CATEGORY_ICONS[category];
  const events = TRIGGER_EVENTS[category];

  function handleCategoryChange(cat: TriggerCategory) {
    onUpdate({ category: cat, event: "", params: {} });
  }

  return (
    <div className="space-y-3.5">
      <Separator className="opacity-30" />

      {/* Category */}
      <InspectorField label="Category">
        <div className="flex flex-wrap gap-1">
          {ALL_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors",
                  isSelected
                    ? cn(
                        CATEGORY_COLORS[cat],
                        "bg-muted border-current/30",
                      )
                    : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground",
                )}
              >
                <CatIcon className="w-3 h-3" />
                {cat}
              </button>
            );
          })}
        </div>
        <div className={cn("flex items-center gap-1.5 mt-1.5 text-[10px]", CATEGORY_COLORS[category])}>
          <CategoryIcon className="w-3 h-3" />
          <span className="capitalize font-medium">{category}</span>
        </div>
      </InspectorField>

      {/* Event */}
      <InspectorField label="Event">
        {category === "custom" ? (
          <InlineInput
            value={data.event ?? ""}
            placeholder="Custom event name"
            onCommit={(v) => onUpdate({ event: v })}
          />
        ) : (
          <select
            value={data.event ?? ""}
            onChange={(e) => onUpdate({ event: e.target.value })}
            aria-label="Trigger event"
            className={cn(
              "h-7 w-full rounded-md border border-border/60 bg-background/40 px-2",
              "text-xs text-foreground appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-ring/50",
            )}
          >
            <option value="">— select event —</option>
            {events.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        )}
      </InspectorField>

      {/* Execution Mode */}
      <InspectorField label="Execution Mode">
        <select
          value={data.executionMode ?? "immediate"}
          onChange={(e) =>
            onUpdate({ executionMode: e.target.value as TriggerExecutionMode })
          }
          aria-label="Execution mode"
          className={cn(
            "h-7 w-full rounded-md border border-border/60 bg-background/40 px-2",
            "text-xs text-foreground appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring/50",
          )}
        >
          <option value="immediate">Immediate</option>
          <option value="beforeNext">Before Next</option>
          <option value="afterNext">After Next</option>
        </select>
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed mt-1">
          {EXECUTION_DESCRIPTIONS[data.executionMode ?? "immediate"]}
        </p>
      </InspectorField>

      {/* Params */}
      <ParamsEditor
        params={data.params ?? {}}
        onUpdate={(params) => onUpdate({ params })}
      />
    </div>
  );
}

function ParamsEditor({
  params,
  onUpdate,
}: {
  params: Record<string, string>;
  onUpdate: (params: Record<string, string>) => void;
}) {
  const entries = Object.entries(params);

  function addParam() {
    onUpdate({ ...params, "": "" });
  }

  function updateKey(oldKey: string, newKey: string) {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      next[k === oldKey ? newKey : k] = v;
    }
    onUpdate(next);
  }

  function updateValue(key: string, value: string) {
    onUpdate({ ...params, [key]: value });
  }

  function removeParam(key: string) {
    const next = { ...params };
    delete next[key];
    onUpdate(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionLabel>Parameters</SectionLabel>
        <button
          type="button"
          onClick={addParam}
          className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-[10px] text-muted-foreground/40 italic">
          No parameters. Click Add to pass data to the event.
        </p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(([key, value], i) => (
            <div key={i} className="flex gap-1.5 items-center group">
              <Input
                value={key}
                placeholder="key"
                onChange={(e) => updateKey(key, e.target.value)}
                className="h-6 text-[10px] font-mono bg-background/40 border-border/60 w-1/3 shrink-0"
              />
              <span className="text-muted-foreground/40 text-[10px]">=</span>
              <Input
                value={value}
                placeholder="value"
                onChange={(e) => updateValue(key, e.target.value)}
                className="h-6 text-[10px] font-mono bg-background/40 border-border/60 flex-1"
              />
              <button
                type="button"
                onClick={() => removeParam(key)}
                title="Remove parameter"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Branch options panel ────────────────────────────────── */

function BranchOptionsSection({ nodeId }: { nodeId: string }) {
  const edges = useGraphStore(
    useShallow((s) => s.edges.filter((e) => e.source === nodeId)),
  );
  const nodes = useGraphStore(useShallow((s) => s.nodes));
  const { updateEdgeLabel, removeEdge } = useGraphStore();

  function targetName(targetId: string): string {
    const n = nodes.find((x) => x.id === targetId);
    if (!n) return "Unknown";
    return n.type === "character"
      ? (n.data as CharacterNodeData).name || "Unnamed"
      : (n.data as ActionNodeData).label || "Action";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <GitBranch className="w-3 h-3 text-orange-400" />
        <SectionLabel>Branch Options</SectionLabel>
      </div>

      {edges.length === 0 ? (
        <p className="text-[10px] text-muted-foreground/45 italic leading-relaxed">
          Draw edges from this node to add branch options. Each edge becomes one
          player choice.
        </p>
      ) : (
        <div className="space-y-2">
          {edges.map((edge, i) => (
            <div key={edge.id} className="group space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50">
                  Option {i + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] text-muted-foreground/40 truncate max-w-25"
                    title={targetName(edge.target)}
                  >
                    → {targetName(edge.target)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEdge(edge.id)}
                    title="Remove this branch option"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <InlineInput
                value={edge.data?.optionText ?? ""}
                placeholder={`Choice ${i + 1} text…`}
                onCommit={(v) => updateEdgeLabel(edge.id, v)}
              />
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground/35 leading-relaxed pt-0.5">
            Double-click an edge on the canvas to edit inline.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Jump target panel ───────────────────────────────── */

function JumpTargetSection({ nodeId }: { nodeId: string }) {
  const outEdge = useGraphStore(
    useShallow((s) => s.edges.find((e) => e.source === nodeId) ?? null),
  );
  const nodes = useGraphStore(useShallow((s) => s.nodes));
  const { setJumpTarget } = useGraphStore();
  const { pickingJumpFor, setPickingJumpFor } = useEditorStore();

  const isPicking = pickingJumpFor === nodeId;

  function nodeName(n: ForgeNode): string {
    return n.type === "character"
      ? (n.data as CharacterNodeData).name || "Unnamed"
      : (n.data as ActionNodeData).label || "Action";
  }

  const candidates = nodes.filter((n) => n.id !== nodeId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SkipForward className="w-3 h-3 text-sky-400" />
          <SectionLabel>Jump To</SectionLabel>
        </div>
        <button
          type="button"
          onClick={() => setPickingJumpFor(isPicking ? null : nodeId)}
          title={
            isPicking ? "Cancel picking" : "Click a node on the canvas to pick"
          }
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors",
            isPicking
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "bg-muted/50 text-foreground/80 border-border/50 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/30",
          )}
        >
          <Crosshair className="w-2.5 h-2.5" />
          {isPicking ? "Cancel" : "Pick"}
        </button>
      </div>

      <select
        value={outEdge?.target ?? ""}
        onChange={(e) => setJumpTarget(nodeId, e.target.value || null)}
        aria-label="Jump target node"
        className={cn(
          "h-7 w-full rounded-md border border-border/60 bg-background/40 px-2",
          "text-xs text-foreground appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-ring/50",
        )}
      >
        <option value="">— none —</option>
        {candidates.map((n) => (
          <option key={n.id} value={n.id}>
            {nodeName(n)}
          </option>
        ))}
      </select>

      {!outEdge && !isPicking && (
        <p className="text-[10px] text-muted-foreground/45 italic leading-relaxed">
          Pick a target node or draw an edge on the canvas.
        </p>
      )}
    </div>
  );
}

/* ─── Reusable primitives ─────────────────────────────── */

function InspectorField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {children}
    </p>
  );
}

function InlineInput({
  value,
  placeholder,
  suggestions,
  onCommit,
}: {
  value: string;
  placeholder?: string;
  suggestions?: string[];
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const dirty = useRef(false);
  const listId = useRef(`dl-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!dirty.current) setLocal(value);
  }, [value]);

  return (
    <>
      <Input
        value={local}
        list={suggestions && suggestions.length > 0 ? listId : undefined}
        onChange={(e) => {
          dirty.current = true;
          setLocal(e.target.value);
        }}
        onBlur={() => {
          onCommit(local);
          dirty.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCommit(local);
            dirty.current = false;
          }
        }}
        placeholder={placeholder}
        className="h-7 text-xs bg-background/40 border-border/60"
      />
      {suggestions && suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </>
  );
}

function InlineTextarea({
  value,
  placeholder,
  onCommit,
  rows = 3,
}: {
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);

  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      rows={rows}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5",
        "text-xs text-foreground resize-none leading-relaxed",
        "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
      )}
    />
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/30 rounded px-2 py-1">
      <span className="text-[10px] font-mono text-muted-foreground">
        {label}
      </span>
      <span className="text-[11px] font-mono text-foreground/70 tabular-nums">
        {value}
      </span>
    </div>
  );
}
