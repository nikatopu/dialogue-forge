"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Zap, Flag, ChevronRight, ChevronLeft, RotateCcw, AlertTriangle,
  Music, Swords, Hash, Clapperboard, Monitor, Wrench, Play,
  SlidersHorizontal, ArrowRight, Lock,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { useGraphStore } from "@/store/useGraphStore";
import { useVariableStore } from "@/store/useVariableStore";
import {
  buildInitialState,
  evaluateConditionGroup,
  applyVariableAction,
} from "@/lib/simulateVariables";
import type { StateChange, VarState } from "@/lib/simulateVariables";
import cn from "classnames";
import type {
  ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData, DialogueEdge,
  TriggerCategory, TriggerExecutionMode, ProjectVariable,
} from "@/types";
import style from "./PreviewModal.module.scss";

interface PreviewModalProps { open: boolean; onClose: () => void; }
interface PreviewHistory { nodeId: string; choiceText?: string; }

const CATEGORY_CONFIG: Record<TriggerCategory, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  game:      { icon: Swords,       color: "oklch(0.72 0.18 155)", bg: "oklch(0.52 0.18 155 / 10%)", border: "oklch(0.52 0.18 155 / 25%)" },
  variable:  { icon: Hash,         color: "oklch(0.65 0.19 290)", bg: "oklch(0.52 0.19 290 / 10%)", border: "oklch(0.52 0.19 290 / 25%)" },
  audio:     { icon: Music,        color: "oklch(0.68 0.18 220)", bg: "oklch(0.52 0.18 220 / 10%)", border: "oklch(0.52 0.18 220 / 25%)" },
  animation: { icon: Clapperboard, color: "oklch(0.72 0.18 50)",  bg: "oklch(0.52 0.18 50 / 10%)",  border: "oklch(0.52 0.18 50 / 25%)" },
  ui:        { icon: Monitor,      color: "oklch(0.65 0.19 260)", bg: "oklch(0.52 0.255 262 / 10%)", border: "oklch(0.52 0.255 262 / 25%)" },
  custom:    { icon: Wrench,       color: "var(--muted-foreground)", bg: "color-mix(in oklch, var(--muted) 30%, transparent)", border: "color-mix(in oklch, var(--border) 50%, transparent)" },
};

const EXECUTION_LABELS: Record<TriggerExecutionMode, string> = {
  immediate: "Immediate", beforeNext: "Before Next", afterNext: "After Next",
};

function findStartNodes(nodes: ForgeNode[]): ForgeNode[] { return nodes.filter((n) => n.type === "start"); }
function findFallbackRoot(nodes: ForgeNode[], edges: DialogueEdge[]): ForgeNode | null {
  if (nodes.length === 0) return null;
  const hasIncoming = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasIncoming.has(n.id));
  return roots[0] ?? nodes[0];
}

type Phase = "entry" | "setup" | "playing";

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const { nodes, edges } = useGraphStore();
  const variables = useVariableStore((s) => s.variables);
  const startNodes = findStartNodes(nodes);

  const [selectedStartId, setSelectedStartId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<PreviewHistory[]>([]);
  const [ended, setEnded] = useState(false);
  const [phase, setPhase] = useState<Phase>("entry");
  const [varState, setVarState] = useState<VarState>({});
  const [stateChanges, setStateChanges] = useState<StateChange[]>([]);
  const [statePanelOpen, setStatePanelOpen] = useState(false);

  // Reset everything when modal opens
  useEffect(() => {
    if (!open) return;
    const starts = findStartNodes(nodes);
    const initialState = buildInitialState(variables);
    setVarState(initialState);
    setStateChanges([]);
    setHistory([]);
    setEnded(false);

    if (starts.length === 0) {
      const root = findFallbackRoot(nodes, edges);
      setSelectedStartId(root?.id ?? null);
      setCurrentId(root?.id ?? null);
      setPhase("playing");
    } else if (starts.length === 1) {
      setSelectedStartId(starts[0].id);
      setCurrentId(starts[0].id);
      setPhase(variables.length > 0 ? "setup" : "playing");
    } else {
      setSelectedStartId(null);
      setCurrentId(null);
      setPhase("entry");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const currentNode = currentId ? nodes.find((n) => n.id === currentId) ?? null : null;

  const allOutgoing = edges.filter((e) => e.source === currentId);
  const lockedEdgeIds = new Set<string>();
  const lockedEdgeReasons = new Map<string, string>();
  for (const e of allOutgoing) {
    if (e.data?.conditionGroup && !evaluateConditionGroup(e.data.conditionGroup, varState)) {
      lockedEdgeIds.add(e.id);
      lockedEdgeReasons.set(e.id, formatConditionGroup(e.data.conditionGroup, variables));
    }
  }

  const handleChoice = useCallback((edge: DialogueEdge) => {
    const target = nodes.find((n) => n.id === edge.target);
    if (!target) return;
    setHistory((h) => [...h, { nodeId: currentId!, choiceText: edge.data?.optionText || undefined }]);

    // If target is a setVariable node, apply and auto-advance
    if (target.type === "action" && (target.data as ActionNodeData).actionType === "setVariable") {
      const d = target.data as ActionNodeData;
      if (d.variableAction?.variableId) {
        setVarState((prev) => {
          const next = applyVariableAction(d.variableAction!, prev);
          const varDef = variables.find((v) => v.id === d.variableAction!.variableId);
          if (varDef && next[varDef.id] !== prev[varDef.id]) {
            setStateChanges((sc) => [
              ...sc.slice(-19),
              { variableId: varDef.id, name: varDef.name, from: prev[varDef.id], to: next[varDef.id] },
            ]);
          }
          return next;
        });
      }
    }

    setCurrentId(target.id);
    if (target.type === "action" && (target.data as ActionNodeData).actionType === "end") setEnded(true);
  }, [currentId, nodes, variables]);

  const handleSelectEntry = useCallback((startId: string) => {
    setSelectedStartId(startId);
    if (variables.length > 0) {
      setPhase("setup");
    } else {
      setCurrentId(startId);
      setHistory([]);
      setEnded(false);
      setPhase("playing");
    }
  }, [variables.length]);

  const handleStartPreview = useCallback((initialValues: VarState) => {
    setVarState(initialValues);
    setCurrentId(selectedStartId ?? findFallbackRoot(nodes, edges)?.id ?? null);
    setHistory([]);
    setEnded(false);
    setStateChanges([]);
    setPhase("playing");
  }, [selectedStartId, nodes, edges]);

  const handleRestart = useCallback(() => {
    const initialState = buildInitialState(variables);
    setVarState(initialState);
    setCurrentId(selectedStartId ?? findFallbackRoot(nodes, edges)?.id ?? null);
    setHistory([]);
    setEnded(false);
    setStateChanges([]);
  }, [selectedStartId, nodes, edges, variables]);

  const handleBack = useCallback(() => {
    if (findStartNodes(nodes).length > 1) {
      setPhase("entry");
      setCurrentId(null);
      setHistory([]);
      setEnded(false);
    } else if (phase === "playing" && variables.length > 0) {
      setPhase("setup");
    }
  }, [nodes, phase, variables.length]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={style.overlay}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={style.backdrop} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={style.panel}
          >
            <div className={style.header}>
              <div className={style.headerLeft}>
                <div className={style.headerIconBox}><ChevronRight size={12} style={{ color: "var(--primary)" }} /></div>
                <span className={style.headerTitle}>
                  {phase === "entry" ? "Choose Entry Point" : phase === "setup" ? "Set Initial Values" : "Preview"}
                </span>
                {phase === "playing" && history.length > 0 && (
                  <Badge variant="secondary" style={{ fontSize: "0.625rem", height: "1rem", padding: "0 0.375rem" }}>
                    step {history.length + 1}
                  </Badge>
                )}
              </div>
              <div className={style.headerRight}>
                {phase === "playing" && (findStartNodes(nodes).length > 1 || variables.length > 0) && (
                  <Button variant="ghost" size="icon-sm" onClick={handleBack} style={{ width: "1.75rem", height: "1.75rem", color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }} title="Back">
                    <ChevronLeft size={14} />
                  </Button>
                )}
                {phase === "playing" && (
                  <>
                    <Button variant="ghost" size="icon-sm" onClick={handleRestart} style={{ width: "1.75rem", height: "1.75rem", color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }} title="Restart">
                      <RotateCcw size={14} />
                    </Button>
                    {variables.length > 0 && (
                      <Button
                        variant="ghost" size="icon-sm"
                        onClick={() => setStatePanelOpen((v) => !v)}
                        style={{ width: "1.75rem", height: "1.75rem", color: statePanelOpen ? "var(--primary)" : "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }}
                        title="Variable state"
                      >
                        <SlidersHorizontal size={14} />
                      </Button>
                    )}
                  </>
                )}
                <Button variant="ghost" size="icon-sm" onClick={onClose} style={{ width: "1.75rem", height: "1.75rem", color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }}><X size={14} /></Button>
              </div>
            </div>

            {/* Variable state panel */}
            <AnimatePresence>
              {phase === "playing" && statePanelOpen && variables.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: "hidden" }}
                >
                  <StatePanel variables={variables} varState={varState} changes={stateChanges} />
                </motion.div>
              )}
            </AnimatePresence>

            <ScrollArea style={{ flex: 1 }}>
              <div className={style.bodyPad}>
                {nodes.length === 0 ? <EmptyGraph />
                  : phase === "entry" ? (
                    <EntrySelection startNodes={startNodes} onSelect={handleSelectEntry} />
                  ) : phase === "setup" ? (
                    <SetupPhase
                      variables={variables}
                      onStart={handleStartPreview}
                      onSkip={() => handleStartPreview(buildInitialState(variables))}
                    />
                  ) : !currentNode ? <NoStartNode />
                  : ended ? <EndedState onRestart={handleRestart} onClose={onClose} />
                  : currentNode.type === "start" ? (
                    <StartStep data={currentNode.data as StartNodeData} choices={allOutgoing} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={handleChoice} />
                  ) : currentNode.type === "character" ? (
                    <CharacterStep node={currentNode} data={currentNode.data as CharacterNodeData} choices={allOutgoing} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={handleChoice} />
                  ) : (
                    <ActionStep data={currentNode.data as ActionNodeData} choices={allOutgoing} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={handleChoice} varState={varState} variables={variables} />
                  )
                }
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─── Setup phase ─── */

function SetupPhase({ variables, onStart, onSkip }: {
  variables: ProjectVariable[];
  onStart: (state: VarState) => void;
  onSkip: () => void;
}) {
  const [values, setValues] = useState<VarState>(() => buildInitialState(variables));

  function setValue(id: string, raw: string, type: ProjectVariable["type"]) {
    let coerced: number | boolean | string;
    if (type === "number") coerced = isNaN(Number(raw)) ? 0 : Number(raw);
    else if (type === "boolean") coerced = raw === "true";
    else coerced = raw;
    setValues((v) => ({ ...v, [id]: coerced }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.setupHint}>
        <SlidersHorizontal size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
        <p>Set the starting values for your variables. These simulate the game state when the dialogue begins.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {variables.map((v) => (
          <div key={v.id} className={style.setupRow}>
            <div className={style.setupRowLeft}>
              <p className={style.setupVarName}>{v.name}</p>
              <span className={style.setupVarType}>{v.type}</span>
            </div>
            {v.type === "boolean" ? (
              <select
                value={String(values[v.id] ?? v.defaultValue)}
                onChange={(e) => setValue(v.id, e.target.value, v.type)}
                className={style.setupSelect}
                aria-label={`Initial value for ${v.name}`}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                value={String(values[v.id] ?? v.defaultValue)}
                onChange={(e) => setValue(v.id, e.target.value, v.type)}
                className={style.setupInput}
                placeholder={String(v.defaultValue)}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
        <Button variant="outline" size="sm" onClick={onSkip} style={{ flex: 1 }}>
          Use Defaults
        </Button>
        <Button size="sm" onClick={() => onStart(values)} style={{ flex: 1, gap: "0.25rem" }}>
          <Play size={12} style={{ fill: "currentColor" }} />
          Start Preview
        </Button>
      </div>
    </div>
  );
}

/* ─── State panel ─── */

function StatePanel({ variables, varState, changes }: {
  variables: ProjectVariable[];
  varState: VarState;
  changes: StateChange[];
}) {
  const recentIds = new Set(changes.slice(-5).map((c) => c.variableId));
  return (
    <div className={style.statePanel}>
      <Separator style={{ opacity: 0.4 }} />
      <div className={style.statePanelInner}>
        <p className={style.statePanelTitle}>
          <SlidersHorizontal size={11} />
          Variable State
        </p>
        <div className={style.stateGrid}>
          {variables.map((v) => {
            const val = varState[v.id];
            const changed = recentIds.has(v.id);
            return (
              <div key={v.id} className={cn(style.stateItem, changed && style.stateItemChanged)}>
                <span className={style.stateVarName}>{v.name}</span>
                <code className={cn(style.stateVal, changed && style.stateValChanged)}>{String(val)}</code>
              </div>
            );
          })}
        </div>
        {changes.length > 0 && (
          <div className={style.changeLog}>
            {changes.slice(-3).reverse().map((c, i) => (
              <div key={i} className={style.changeItem}>
                <ArrowRight size={9} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span className={style.changeName}>{c.name}</span>
                <span className={style.changeFrom}>{String(c.from)}</span>
                <span className={style.changeArrow}>→</span>
                <span className={style.changeTo}>{String(c.to)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Entry selection ─── */

function EntrySelection({ startNodes, onSelect }: { startNodes: ForgeNode[]; onSelect: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p className={style.entryHint}>Choose a starting branch to preview:</p>
      {startNodes.map((n, i) => (
        <motion.button key={n.id} type="button" onClick={() => onSelect(n.id)} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={style.entryBtn}>
          <div className={style.entryBtnIcon}><Flag size={16} style={{ color: "oklch(0.68 0.15 180)" }} /></div>
          <div className={style.entryBtnMeta}>
            <p className={style.entryBtnName}>{(n.data as StartNodeData).name || "Unnamed"}</p>
            <p className={style.entryBtnSub}>Start node</p>
          </div>
          <ChevronRight size={16} style={{ color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)", flexShrink: 0 }} />
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Node steps ─── */

type ChoiceListProps = { choices: DialogueEdge[]; lockedEdgeIds: Set<string>; lockedEdgeReasons: Map<string, string>; onChoice: (e: DialogueEdge) => void };

function StartStep({ data, choices, lockedEdgeIds, lockedEdgeReasons, onChoice }: { data: StartNodeData } & ChoiceListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.startStep}>
        <Flag size={16} style={{ color: "oklch(0.68 0.15 180)", flexShrink: 0 }} />
        <div><p className={style.startStepLabel}>Entry Point</p><p className={style.startStepName}>{data.name || "Unnamed"}</p></div>
      </div>
      <ChoiceList choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} />
    </div>
  );
}

function CharacterStep({ data, choices, lockedEdgeIds, lockedEdgeReasons, onChoice }: { node: ForgeNode; data: CharacterNodeData } & ChoiceListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.characterHeader}>
        <div className={style.characterAvatar}>
          {data.portrait ? <img src={data.portrait} alt={data.name} className={style.characterAvatarImg} /> : <User size={18} style={{ color: "oklch(0.65 0.19 260)" }} />}
        </div>
        <div>
          <p className={style.characterName}>{data.name || <span style={{ fontStyle: "italic", color: "var(--muted-foreground)" }}>Unnamed</span>}</p>
          {data.emotion && <span className={style.characterEmotion}>{data.emotion}</span>}
        </div>
      </div>
      <div className={style.dialogueBubble}>
        {data.dialogue ? <p className={style.dialogueText}>{data.dialogue}</p> : <p className={style.dialogueEmpty}>No dialogue set.</p>}
      </div>
      <ChoiceList choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} />
    </div>
  );
}

function ActionStep({ data, choices, lockedEdgeIds, lockedEdgeReasons, onChoice, varState, variables }: {
  data: ActionNodeData;
  varState: VarState;
  variables: ProjectVariable[];
} & ChoiceListProps) {
  if (data.actionType === "trigger") return <TriggerStep data={data} choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} />;
  if (data.actionType === "setVariable") return <SetVariableStep data={data} choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} varState={varState} variables={variables} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.actionStep}>
        <Zap size={16} style={{ color: "oklch(0.72 0.18 155)", flexShrink: 0 }} />
        <div><p className={style.actionLabel}>{data.actionType}</p><p className={style.actionName}>{data.label || "Action"}</p></div>
      </div>
      <ChoiceList choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} />
    </div>
  );
}

function SetVariableStep({ data, choices, lockedEdgeIds, lockedEdgeReasons, onChoice, varState, variables }: {
  data: ActionNodeData;
  varState: VarState;
  variables: ProjectVariable[];
} & ChoiceListProps) {
  const va = data.variableAction;
  const varDef = va ? variables.find((v) => v.id === va.variableId) : null;
  const currentVal = va && varDef ? varState[va.variableId] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.setVarCard}>
        <SlidersHorizontal size={15} style={{ color: "oklch(0.72 0.19 310)", flexShrink: 0 }} />
        <div>
          <p className={style.setVarLabel}>Set Variable</p>
          <p className={style.setVarName}>{data.label || "Set Variable"}</p>
          {varDef && va && (
            <p className={style.setVarExpr}>
              <code>{varDef.name} {formatOpSymbol(va.operation)} {va.operation === "toggle" ? "!current" : String(va.value ?? "")}</code>
              {currentVal !== null && <span className={style.setVarCurrent}> (currently: {String(currentVal)})</span>}
            </p>
          )}
        </div>
      </div>
      <ChoiceList choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} />
    </div>
  );
}

function TriggerStep({ data, choices, lockedEdgeIds, lockedEdgeReasons, onChoice }: { data: ActionNodeData } & ChoiceListProps) {
  const category = data.category ?? "custom";
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.custom;
  const Icon = cfg.icon;
  const params = data.params ?? {};
  const hasParams = Object.keys(params).length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.triggerCard} style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
        <div className={style.triggerHeader}>
          <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
          <div className={style.triggerMeta}>
            <div className={style.triggerLabels}>
              <p className={style.triggerTypeLabel}>TRIGGER</p>
              <Badge variant="outline" style={{ fontSize: "0.5625rem", height: "1rem", padding: "0 0.375rem", color: cfg.color, borderColor: cfg.border }}>{category}</Badge>
            </div>
            <p className={style.triggerName}>{data.event || data.label || "Trigger"}</p>
          </div>
          <span className={style.execLabel} style={{ color: cfg.color }}>{EXECUTION_LABELS[data.executionMode ?? "immediate"]}</span>
        </div>
        {hasParams && (
          <div className={style.triggerParams}>
            {Object.entries(params).map(([k, v]) => (
              <span key={k} className={style.paramChip}>{k}=<span className={style.paramValue}>{v}</span></span>
            ))}
          </div>
        )}
      </div>
      <ChoiceList choices={choices} lockedEdgeIds={lockedEdgeIds} lockedEdgeReasons={lockedEdgeReasons} onChoice={onChoice} />
    </div>
  );
}

/* ─── Choice list ─── */

function ChoiceList({ choices, lockedEdgeIds, lockedEdgeReasons, onChoice }: ChoiceListProps) {
  if (choices.length === 0) return <p className={style.branchEnd}>— End of branch —</p>;
  return (
    <div className={style.choiceList}>
      {choices.map((edge, i) => {
        const locked = lockedEdgeIds.has(edge.id);
        const reason = locked ? lockedEdgeReasons.get(edge.id) : undefined;
        return (
          <motion.button
            key={edge.id}
            type="button"
            onClick={locked ? undefined : () => onChoice(edge)}
            disabled={locked}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(style.choiceBtn, locked && style.choiceBtnLocked)}
          >
            <span className={style.choiceNum}>{i + 1}</span>
            <span className={style.choiceText}>
              {edge.data?.optionText || <span className={style.choiceEmpty}>Continue</span>}
              {reason && <span className={style.choiceLockReason}>Requires: {reason}</span>}
            </span>
            {locked
              ? <Lock size={12} className={style.choiceLockIcon} />
              : <ChevronRight size={14} className={style.choiceChevron} />
            }
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── End / empty states ─── */

function EndedState({ onRestart, onClose }: { onRestart: () => void; onClose: () => void }) {
  return (
    <div className={style.endState}>
      <div className={style.endIcon}><ChevronRight size={24} style={{ color: "oklch(0.72 0.18 155)" }} /></div>
      <div><p className={style.endTitle}>Dialogue ended</p><p className={style.endSub}>The conversation reached an end node.</p></div>
      <div className={style.endActions}>
        <Button variant="outline" size="sm" onClick={onRestart} style={{ gap: "0.375rem" }}><RotateCcw size={12} />Restart</Button>
        <Button size="sm" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function EmptyGraph() {
  return <div className={style.noNodes}><AlertTriangle size={32} style={{ color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)" }} /><span>Add some nodes to the canvas to preview.</span></div>;
}

function NoStartNode() {
  return <div className={style.noStart}><AlertTriangle size={32} style={{ color: "oklch(0.72 0.18 85 / 60%)" }} /><span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Could not find a starting node.</span></div>;
}

function formatConditionGroup(group: import("@/types").ConditionGroup, variables: ProjectVariable[]): string {
  const parts = group.conditions.map((c) => {
    if ("logic" in c) return `(${formatConditionGroup(c, variables)})`;
    const v = variables.find((v) => v.id === c.variableId);
    const name = v?.name ?? c.variableId;
    const opMap: Record<string, string> = { "==": "=", "!=": "≠", ">": ">", ">=": "≥", "<": "<", "<=": "≤", contains: "contains", startsWith: "starts with", endsWith: "ends with" };
    return `${name} ${opMap[c.operator] ?? c.operator} ${String(c.value)}`;
  });
  return parts.join(group.logic === "AND" ? " and " : " or ");
}

function formatOpSymbol(op: string): string {
  switch (op) {
    case "set":      return "=";
    case "add":      return "+=";
    case "subtract": return "-=";
    case "multiply": return "*=";
    case "divide":   return "/=";
    case "toggle":   return "=";
    default:         return op;
  }
}
