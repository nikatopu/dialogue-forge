"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, Zap, Flag, Sliders, FileText, Trash2, Copy, GitBranch,
  SkipForward, Square, Wrench, Crosshair, Swords, Music, Hash,
  Clapperboard, Monitor, Plus, X, SlidersHorizontal, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Separator } from "@/components/atoms/Separator";
import { Badge } from "@/components/atoms/Badge";
import { AttributeEditor } from "@/components/organisms/AttributeEditor";
import { useGraphStore } from "@/store/useGraphStore";
import { useVariableStore } from "@/store/useVariableStore";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "@/store/useEditorStore";
import cn from "classnames";
import type {
  ForgeNode, CharacterNodeData, ActionNodeData, ActionType, TriggerCategory,
  TriggerExecutionMode, StartNodeData, VariableOperation,
} from "@/types";
import { TRIGGER_EVENTS } from "@/types";
import style from "./NodeInspector.module.scss";

const ACTION_STRIP: Record<ActionType, { icon: LucideIcon; label: string; color: string; bg: string; border: string; glow: string }> = {
  trigger:     { icon: Zap,               label: "Trigger",      color: "oklch(0.72 0.18 155)", bg: "oklch(0.52 0.18 155 / 15%)", border: "oklch(0.52 0.18 155 / 25%)", glow: "oklch(0.52 0.18 155 / 5%)" },
  branch:      { icon: GitBranch,         label: "Branch",       color: "oklch(0.72 0.18 50)",  bg: "oklch(0.52 0.18 50 / 15%)",  border: "oklch(0.52 0.18 50 / 25%)",  glow: "oklch(0.52 0.18 50 / 5%)" },
  jump:        { icon: SkipForward,       label: "Jump",         color: "oklch(0.68 0.18 220)", bg: "oklch(0.52 0.18 220 / 15%)", border: "oklch(0.52 0.18 220 / 25%)", glow: "oklch(0.52 0.18 220 / 5%)" },
  end:         { icon: Square,            label: "End",          color: "oklch(0.72 0.22 355)", bg: "oklch(0.52 0.22 355 / 15%)", border: "oklch(0.52 0.22 355 / 25%)", glow: "oklch(0.52 0.22 355 / 5%)" },
  custom:      { icon: Wrench,            label: "Custom",       color: "oklch(0.65 0.19 290)", bg: "oklch(0.52 0.19 290 / 15%)", border: "oklch(0.52 0.19 290 / 25%)", glow: "oklch(0.52 0.19 290 / 5%)" },
  setVariable: { icon: SlidersHorizontal, label: "Set Variable", color: "oklch(0.72 0.19 310)", bg: "oklch(0.52 0.19 310 / 15%)", border: "oklch(0.52 0.19 310 / 25%)", glow: "oklch(0.52 0.19 310 / 5%)" },
};

const TABS = [
  { id: "properties", label: "Properties", icon: FileText },
  { id: "attributes", label: "Attributes",  icon: Sliders },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function NodeInspector({ node }: { node: ForgeNode }) {
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
  const actionCfg = isAction ? (ACTION_STRIP[(data as ActionNodeData).actionType] ?? ACTION_STRIP.custom) : null;

  const stripGlow = isStart ? "oklch(0.5 0.15 180 / 5%)" : isCharacter ? "oklch(0.52 0.255 262 / 5%)" : actionCfg!.glow;
  const stripIconBg = isStart ? "oklch(0.5 0.15 180 / 15%)" : isCharacter ? "oklch(0.52 0.255 262 / 15%)" : actionCfg!.bg;
  const stripIconBorder = isStart ? "oklch(0.5 0.15 180 / 25%)" : isCharacter ? "oklch(0.52 0.255 262 / 25%)" : actionCfg!.border;
  const stripLabel = isStart ? (data as StartNodeData).name || "Entry Point" : isCharacter ? (data as CharacterNodeData).name || "Unnamed" : (data as ActionNodeData).label || "Action";
  const stripType = isStart ? "Start node" : isCharacter ? "Character node" : `${actionCfg!.label} node`;
  const stripIconColor = isStart ? "oklch(0.68 0.15 180)" : isCharacter ? "oklch(0.65 0.19 260)" : actionCfg!.color;

  function handleDelete() { removeNode(node.id); setSelectedNodeId(null); setMobileInspectorOpen(false); }
  function handleDuplicate() { duplicateNode(node.id); }

  return (
    <div className={style.container}>
      <div className={style.strip} style={{ background: `linear-gradient(to right, ${stripGlow}, transparent)` }}>
        <div className={style.stripIcon} style={{ backgroundColor: stripIconBg, borderColor: stripIconBorder }}>
          {isStart ? <Flag size={14} style={{ color: stripIconColor }} />
            : isCharacter ? <User size={14} style={{ color: stripIconColor }} />
            : (() => { const Icon = actionCfg!.icon; return <Icon size={14} style={{ color: stripIconColor }} />; })()
          }
        </div>
        <div className={style.stripMeta}>
          <p className={style.stripName}>{stripLabel}</p>
          <p className={style.stripType}>{stripType}</p>
        </div>
        <div className={style.stripActions}>
          <Button variant="ghost" size="icon-sm" style={{ width: "1.5rem", height: "1.5rem", color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)" }} onClick={handleDuplicate} title="Duplicate">
            <Copy size={12} />
          </Button>
          <Button variant="ghost" size="icon-sm" style={{ width: "1.5rem", height: "1.5rem", color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)" }} onClick={handleDelete} title="Delete">
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      <div className={style.tabs}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(style.tab, isActive && style.tabActive)}
            >
              <Icon size={12} />
              {tab.label}
              {tab.id === "attributes" && attrCount > 0 && (
                <Badge variant="secondary" style={{ fontSize: "0.5625rem", height: "0.875rem", padding: "0 0.25rem", minWidth: "1rem" }}>
                  {attrCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className={style.body}>
        {activeTab === "properties" && (
          <div className={style.bodyPad}>
            {isStart
              ? <StartNodeProperties data={data as StartNodeData} onUpdate={(p) => updateNodeData(node.id, p)} />
              : isCharacter
              ? <CharacterProperties nodeId={node.id} data={data as CharacterNodeData} onUpdate={(p) => updateNodeData(node.id, p)} />
              : <ActionProperties nodeId={node.id} data={data as ActionNodeData} onUpdate={(p) => updateNodeData(node.id, p)} />
            }
            <Separator style={{ opacity: 0.4 }} />
            <div className={style.field}>
              <p className={style.fieldLabel}>Node ID</p>
              <p className={style.metaBox}>{node.id}</p>
            </div>
            <div className={style.field}>
              <p className={style.fieldLabel}>Position</p>
              <div className={style.positionRow}>
                <div className={style.chip}>
                  <span className={style.chipLabel}>X</span>
                  <span className={style.chipValue}>{Math.round(node.position.x)}</span>
                </div>
                <div className={style.chip}>
                  <span className={style.chipLabel}>Y</span>
                  <span className={style.chipValue}>{Math.round(node.position.y)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "attributes" && (
          <div className={style.bodyPad}>
            {isStart
              ? <p className={style.emptyNote}>Start nodes do not have attributes.</p>
              : <AttributeEditor nodeId={node.id} schema={schema} values={values} />
            }
          </div>
        )}
      </div>
    </div>
  );
}

function StartNodeProperties({ data, onUpdate }: { data: StartNodeData; onUpdate: (p: Partial<StartNodeData>) => void }) {
  return (
    <div className={style.field}>
      <p className={style.fieldLabel}>Entry Name</p>
      <InlineInput value={data.name} placeholder="e.g. Main Story, Combat" onCommit={(v) => onUpdate({ name: v })} />
      <p className={style.emptyNote} style={{ marginTop: "0.5rem" }}>
        Start nodes are entry points for your dialogue graph. Connect outgoing edges to begin the flow.
      </p>
    </div>
  );
}

function CharacterProperties({ nodeId, data, onUpdate }: { nodeId: string; data: CharacterNodeData; onUpdate: (p: Partial<CharacterNodeData>) => void }) {
  const characterNames = useGraphStore(
    useShallow((s) => s.nodes.filter((n) => n.type === "character" && n.id !== nodeId).map((n) => (n.data as CharacterNodeData).name).filter(Boolean).filter((name, i, arr) => arr.indexOf(name) === i)),
  );
  return (
    <>
      <div className={style.field}><p className={style.fieldLabel}>Name</p><InlineInput value={data.name} placeholder="Character name" suggestions={characterNames} onCommit={(v) => onUpdate({ name: v })} /></div>
      <div className={style.field}><p className={style.fieldLabel}>Dialogue</p><InlineTextarea value={data.dialogue} placeholder="What does this character say?" onCommit={(v) => onUpdate({ dialogue: v })} rows={4} /></div>
      <div className={style.field}><p className={style.fieldLabel}>Emotion</p><InlineInput value={data.emotion ?? ""} placeholder="e.g. Happy, Sad, Angry" onCommit={(v) => onUpdate({ emotion: v })} /></div>
      <div className={style.field}><p className={style.fieldLabel}>Portrait URL</p><InlineInput value={data.portrait ?? ""} placeholder="https://…" onCommit={(v) => onUpdate({ portrait: v })} /></div>
    </>
  );
}

const ACTION_TYPES: ActionType[] = ["trigger", "branch", "jump", "end", "custom", "setVariable"];

function ActionProperties({ nodeId, data, onUpdate }: { nodeId: string; data: ActionNodeData; onUpdate: (p: Partial<ActionNodeData>) => void }) {
  return (
    <>
      <div className={style.field}><p className={style.fieldLabel}>Label</p><InlineInput value={data.label} placeholder="Action label" onCommit={(v) => onUpdate({ label: v })} /></div>
      <div className={style.field}>
        <p className={style.fieldLabel}>Action Type</p>
        <select value={data.actionType} onChange={(e) => onUpdate({ actionType: e.target.value as ActionType })} aria-label="Action type" className={style.select}>
          {ACTION_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      {data.actionType === "trigger" && <TriggerSection data={data} onUpdate={onUpdate} />}
      {data.actionType === "branch" && <BranchOptionsSection nodeId={nodeId} />}
      {data.actionType === "jump" && <JumpTargetSection nodeId={nodeId} />}
      {data.actionType === "setVariable" && <VariableActionSection data={data} onUpdate={onUpdate} />}
    </>
  );
}

const CATEGORY_ICONS: Record<TriggerCategory, LucideIcon> = { game: Swords, variable: Hash, audio: Music, animation: Clapperboard, ui: Monitor, custom: Wrench };
const CATEGORY_COLORS: Record<TriggerCategory, string> = { game: "oklch(0.72 0.18 155)", variable: "oklch(0.65 0.19 290)", audio: "oklch(0.68 0.18 220)", animation: "oklch(0.72 0.18 50)", ui: "oklch(0.65 0.19 260)", custom: "oklch(0.6 0.01 265)" };
const EXECUTION_DESCRIPTIONS: Record<TriggerExecutionMode, string> = { immediate: "Fires at the moment this node is reached", beforeNext: "Fires before the next dialogue line plays", afterNext: "Fires after the next dialogue line plays" };
const ALL_CATEGORIES: TriggerCategory[] = ["game", "variable", "audio", "animation", "ui", "custom"];

function TriggerSection({ data, onUpdate }: { data: ActionNodeData; onUpdate: (p: Partial<ActionNodeData>) => void }) {
  const category = data.category ?? "custom";
  const CategoryIcon = CATEGORY_ICONS[category];
  const events = TRIGGER_EVENTS[category];
  return (
    <>
      <Separator style={{ opacity: 0.3 }} />
      <div className={style.field}>
        <p className={style.fieldLabel}>Category</p>
        <div className={style.categoryGrid}>
          {ALL_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat];
            const isSelected = category === cat;
            return (
              <button key={cat} type="button" onClick={() => onUpdate({ category: cat, event: "", params: {} })}
                className={cn(style.categoryBtn, isSelected && style.categoryBtnActive)}
                style={isSelected ? { color: CATEGORY_COLORS[cat], borderColor: `color-mix(in oklch, ${CATEGORY_COLORS[cat]} 30%, transparent)` } : {}}
              >
                <CatIcon size={12} />{cat}
              </button>
            );
          })}
        </div>
        <div className={style.categoryInfo} style={{ color: CATEGORY_COLORS[category] }}>
          <CategoryIcon size={12} /><span>{category}</span>
        </div>
      </div>
      <div className={style.field}>
        <p className={style.fieldLabel}>Event</p>
        {category === "custom"
          ? <InlineInput value={data.event ?? ""} placeholder="Custom event name" onCommit={(v) => onUpdate({ event: v })} />
          : <select value={data.event ?? ""} onChange={(e) => onUpdate({ event: e.target.value })} aria-label="Trigger event" className={style.select}>
              <option value="">— select event —</option>
              {events.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
        }
      </div>
      <div className={style.field}>
        <p className={style.fieldLabel}>Execution Mode</p>
        <select value={data.executionMode ?? "immediate"} onChange={(e) => onUpdate({ executionMode: e.target.value as TriggerExecutionMode })} aria-label="Execution mode" className={style.select}>
          <option value="immediate">Immediate</option>
          <option value="beforeNext">Before Next</option>
          <option value="afterNext">After Next</option>
        </select>
        <p className={style.executionNote}>{EXECUTION_DESCRIPTIONS[data.executionMode ?? "immediate"]}</p>
      </div>
      <ParamsEditor params={data.params ?? {}} onUpdate={(params) => onUpdate({ params })} />
    </>
  );
}

function ParamsEditor({ params, onUpdate }: { params: Record<string, string>; onUpdate: (p: Record<string, string>) => void }) {
  const entries = Object.entries(params);
  function addParam() { onUpdate({ ...params, "": "" }); }
  function updateKey(oldKey: string, newKey: string) {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) next[k === oldKey ? newKey : k] = v;
    onUpdate(next);
  }
  function updateValue(key: string, value: string) { onUpdate({ ...params, [key]: value }); }
  function removeParam(key: string) { const next = { ...params }; delete next[key]; onUpdate(next); }

  return (
    <div className={style.field}>
      <div className={style.sectionHeader}>
        <p className={style.fieldLabel}>Parameters</p>
        <button type="button" onClick={addParam} className={style.addParamBtn}><Plus size={12} />Add</button>
      </div>
      {entries.length === 0
        ? <p className={style.emptyNote}>No parameters. Click Add to pass data to the event.</p>
        : entries.map(([key, value], i) => (
          <div key={i} className={style.paramRow}>
            <input value={key} placeholder="key" onChange={(e) => updateKey(key, e.target.value)} className={style.inlineInput} style={{ width: "33%", flexShrink: 0, fontFamily: "monospace", fontSize: "0.625rem" }} />
            <span className={style.paramSep}>=</span>
            <input value={value} placeholder="value" onChange={(e) => updateValue(key, e.target.value)} className={style.inlineInput} style={{ flex: 1, fontFamily: "monospace", fontSize: "0.625rem" }} />
            <button type="button" onClick={() => removeParam(key)} title="Remove parameter" className={style.paramRemove}><X size={12} /></button>
          </div>
        ))
      }
    </div>
  );
}

function BranchOptionsSection({ nodeId }: { nodeId: string }) {
  const edges = useGraphStore(useShallow((s) => s.edges.filter((e) => e.source === nodeId)));
  const nodes = useGraphStore(useShallow((s) => s.nodes));
  const { updateEdgeLabel, removeEdge } = useGraphStore();

  function targetName(targetId: string): string {
    const n = nodes.find((x) => x.id === targetId);
    if (!n) return "Unknown";
    return n.type === "character" ? (n.data as CharacterNodeData).name || "Unnamed" : (n.data as ActionNodeData).label || "Action";
  }

  return (
    <div className={style.field}>
      <div className={style.sectionHeaderLeft}>
        <GitBranch size={12} style={{ color: "oklch(0.72 0.18 50)" }} />
        <p className={style.fieldLabel}>Branch Options</p>
      </div>
      {edges.length === 0
        ? <p className={style.emptyNote}>Draw edges from this node to add branch options.</p>
        : edges.map((edge, i) => (
          <div key={edge.id} className={style.branchEdge}>
            <div className={style.branchEdgeHeader}>
              <span className={style.branchNum}>Option {i + 1}</span>
              <div className={style.branchTarget}>
                <span className={style.branchTargetName} title={targetName(edge.target)}>→ {targetName(edge.target)}</span>
                <button type="button" onClick={() => removeEdge(edge.id)} title="Remove this branch option" className={style.removeEdgeBtn}><X size={12} /></button>
              </div>
            </div>
            <InlineInput value={edge.data?.optionText ?? ""} placeholder={`Choice ${i + 1} text…`} onCommit={(v) => updateEdgeLabel(edge.id, v)} />
          </div>
        ))
      }
    </div>
  );
}

function JumpTargetSection({ nodeId }: { nodeId: string }) {
  const outEdge = useGraphStore(useShallow((s) => s.edges.find((e) => e.source === nodeId) ?? null));
  const nodes = useGraphStore(useShallow((s) => s.nodes));
  const { setJumpTarget } = useGraphStore();
  const { pickingJumpFor, setPickingJumpFor } = useEditorStore();
  const isPicking = pickingJumpFor === nodeId;

  function nodeName(n: ForgeNode): string {
    return n.type === "character" ? (n.data as CharacterNodeData).name || "Unnamed" : (n.data as ActionNodeData).label || "Action";
  }

  const candidates = nodes.filter((n) => n.id !== nodeId);

  return (
    <div className={style.field}>
      <div className={style.sectionHeader}>
        <div className={style.sectionHeaderLeft}>
          <SkipForward size={12} style={{ color: "oklch(0.68 0.18 220)" }} />
          <p className={style.fieldLabel}>Jump To</p>
        </div>
        <button type="button" onClick={() => setPickingJumpFor(isPicking ? null : nodeId)} title={isPicking ? "Cancel picking" : "Click a node on the canvas to pick"} className={cn(style.pickBtn, isPicking && style.pickBtnActive)}>
          <Crosshair size={10} />
          {isPicking ? "Cancel" : "Pick"}
        </button>
      </div>
      <select value={outEdge?.target ?? ""} onChange={(e) => setJumpTarget(nodeId, e.target.value || null)} aria-label="Jump target node" className={style.select}>
        <option value="">— none —</option>
        {candidates.map((n) => <option key={n.id} value={n.id}>{nodeName(n)}</option>)}
      </select>
      {!outEdge && !isPicking && <p className={style.emptyNote}>Pick a target node or draw an edge on the canvas.</p>}
    </div>
  );
}

function InlineInput({ value, placeholder, suggestions, onCommit }: { value: string; placeholder?: string; suggestions?: string[]; onCommit: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const dirty = useRef(false);
  const listId = useRef(`dl-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => { if (!dirty.current) setLocal(value); }, [value]);

  return (
    <>
      <input
        value={local}
        list={suggestions && suggestions.length > 0 ? listId : undefined}
        onChange={(e) => { dirty.current = true; setLocal(e.target.value); }}
        onBlur={() => { onCommit(local); dirty.current = false; }}
        onKeyDown={(e) => { if (e.key === "Enter") { onCommit(local); dirty.current = false; } }}
        placeholder={placeholder}
        className={style.inlineInput}
      />
      {suggestions && suggestions.length > 0 && (
        <datalist id={listId}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
      )}
    </>
  );
}

function InlineTextarea({ value, placeholder, onCommit, rows = 3 }: { value: string; placeholder?: string; onCommit: (v: string) => void; rows?: number }) {
  const [local, setLocal] = useState(value);
  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      rows={rows}
      placeholder={placeholder}
      className={style.inlineTextarea}
    />
  );
}

const OPERATIONS: { value: VariableOperation; label: string }[] = [
  { value: "set",      label: "Set  (=)" },
  { value: "add",      label: "Add  (+=" },
  { value: "subtract", label: "Subtract (-=" },
  { value: "multiply", label: "Multiply (*=" },
  { value: "divide",   label: "Divide (/=" },
  { value: "toggle",   label: "Toggle" },
];

function VariableActionSection({ data, onUpdate }: { data: ActionNodeData; onUpdate: (p: Partial<ActionNodeData>) => void }) {
  const variables = useVariableStore((s) => s.variables);
  const va = data.variableAction;

  function setField(patch: Partial<NonNullable<ActionNodeData["variableAction"]>>) {
    onUpdate({
      variableAction: {
        variableId: va?.variableId ?? "",
        operation: va?.operation ?? "set",
        value: va?.value,
        ...patch,
      },
    });
  }

  const selectedVar = variables.find((v) => v.id === va?.variableId);
  const isToggle = va?.operation === "toggle";

  return (
    <>
      <Separator style={{ opacity: 0.3 }} />
      <div className={style.field}>
        <div className={style.sectionHeaderLeft}>
          <SlidersHorizontal size={12} style={{ color: "oklch(0.72 0.19 310)" }} />
          <p className={style.fieldLabel}>Variable Action</p>
        </div>
        {variables.length === 0 ? (
          <p className={style.emptyNote}>No variables defined. Open the Variables panel to create some.</p>
        ) : (
          <>
            <div className={style.field}>
              <p className={style.fieldLabel}>Variable</p>
              <select
                value={va?.variableId ?? ""}
                onChange={(e) => setField({ variableId: e.target.value })}
                className={style.select}
                aria-label="Variable to modify"
              >
                <option value="">— select variable —</option>
                {variables.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </div>
            <div className={style.field}>
              <p className={style.fieldLabel}>Operation</p>
              <select
                value={va?.operation ?? "set"}
                onChange={(e) => setField({ operation: e.target.value as VariableOperation })}
                className={style.select}
                aria-label="Operation"
              >
                {OPERATIONS.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            {!isToggle && (
              <div className={style.field}>
                <p className={style.fieldLabel}>Value</p>
                {selectedVar?.type === "boolean" ? (
                  <select
                    value={String(va?.value ?? "true")}
                    onChange={(e) => setField({ value: e.target.value === "true" })}
                    className={style.select}
                    aria-label="Boolean value"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <InlineInput
                    value={String(va?.value ?? "")}
                    placeholder={selectedVar?.type === "number" ? "0" : "value"}
                    onCommit={(v) => {
                      const coerced = selectedVar?.type === "number" ? (isNaN(Number(v)) ? v : Number(v)) : v;
                      setField({ value: coerced as string | number });
                    }}
                  />
                )}
              </div>
            )}
            {va?.variableId && va?.operation && (
              <div className={style.varPreview}>
                <span className={style.varPreviewText}>
                  {selectedVar?.name ?? "?"} {formatOpPreview(va.operation, va.value)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function formatOpPreview(op: VariableOperation, value?: string | number | boolean): string {
  switch (op) {
    case "set":      return `= ${value ?? "…"}`;
    case "add":      return `+= ${value ?? "…"}`;
    case "subtract": return `-= ${value ?? "…"}`;
    case "multiply": return `*= ${value ?? "…"}`;
    case "divide":   return `/= ${value ?? "…"}`;
    case "toggle":   return "= !current";
    default:         return String(op);
  }
}
