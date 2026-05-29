"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Zap, Flag, ChevronRight, ChevronLeft, RotateCcw, AlertTriangle,
  Music, Swords, Hash, Clapperboard, Monitor, Wrench,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { useGraphStore } from "@/store/useGraphStore";
import cn from "classnames";
import type {
  ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData, DialogueEdge,
  TriggerCategory, TriggerExecutionMode,
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

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const { nodes, edges } = useGraphStore();
  const startNodes = findStartNodes(nodes);
  const [selectedStartId, setSelectedStartId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<PreviewHistory[]>([]);
  const [ended, setEnded] = useState(false);
  const [phase, setPhase] = useState<"entry" | "playing">(startNodes.length === 1 ? "playing" : "entry");

  useEffect(() => {
    if (!open) return;
    const starts = findStartNodes(nodes);
    if (starts.length === 1) { setSelectedStartId(starts[0].id); setCurrentId(starts[0].id); setPhase("playing"); }
    else if (starts.length > 1) { setSelectedStartId(null); setCurrentId(null); setPhase("entry"); }
    else { const root = findFallbackRoot(nodes, edges); setSelectedStartId(root?.id ?? null); setCurrentId(root?.id ?? null); setPhase("playing"); }
    setHistory([]); setEnded(false);
  }, [open, nodes, edges]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const currentNode = currentId ? nodes.find((n) => n.id === currentId) ?? null : null;
  const outgoingEdges = edges.filter((e) => e.source === currentId);

  const handleChoice = useCallback((edge: DialogueEdge) => {
    const target = nodes.find((n) => n.id === edge.target);
    if (!target) return;
    setHistory((h) => [...h, { nodeId: currentId!, choiceText: edge.data?.optionText || undefined }]);
    setCurrentId(target.id);
    if (target.type === "action" && (target.data as ActionNodeData).actionType === "end") setEnded(true);
  }, [currentId, nodes]);

  const handleSelectEntry = useCallback((startId: string) => {
    setSelectedStartId(startId); setCurrentId(startId); setHistory([]); setEnded(false); setPhase("playing");
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentId(selectedStartId ?? findFallbackRoot(nodes, edges)?.id ?? null);
    setHistory([]); setEnded(false);
  }, [selectedStartId, nodes, edges]);

  const handleBack = useCallback(() => {
    if (findStartNodes(nodes).length > 1) { setPhase("entry"); setCurrentId(null); setHistory([]); setEnded(false); }
  }, [nodes]);

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
                <span className={style.headerTitle}>{phase === "entry" ? "Choose Entry Point" : "Preview"}</span>
                {phase === "playing" && history.length > 0 && <Badge variant="secondary" style={{ fontSize: "0.625rem", height: "1rem", padding: "0 0.375rem" }}>step {history.length + 1}</Badge>}
              </div>
              <div className={style.headerRight}>
                {phase === "playing" && findStartNodes(nodes).length > 1 && <Button variant="ghost" size="icon-sm" onClick={handleBack} style={{ width: "1.75rem", height: "1.75rem", color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }} title="Back"><ChevronLeft size={14} /></Button>}
                {phase === "playing" && <Button variant="ghost" size="icon-sm" onClick={handleRestart} style={{ width: "1.75rem", height: "1.75rem", color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }} title="Restart"><RotateCcw size={14} /></Button>}
                <Button variant="ghost" size="icon-sm" onClick={onClose} style={{ width: "1.75rem", height: "1.75rem", color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)" }}><X size={14} /></Button>
              </div>
            </div>
            <ScrollArea style={{ flex: 1 }}>
              <div className={style.bodyPad}>
                {nodes.length === 0 ? <EmptyGraph />
                  : phase === "entry" ? <EntrySelection startNodes={findStartNodes(nodes)} onSelect={handleSelectEntry} />
                  : !currentNode ? <NoStartNode />
                  : ended ? <EndedState onRestart={handleRestart} onClose={onClose} />
                  : currentNode.type === "start" ? <StartStep data={currentNode.data as StartNodeData} choices={outgoingEdges} onChoice={handleChoice} />
                  : currentNode.type === "character" ? <CharacterStep node={currentNode} data={currentNode.data as CharacterNodeData} choices={outgoingEdges} onChoice={handleChoice} />
                  : <ActionStep data={currentNode.data as ActionNodeData} choices={outgoingEdges} onChoice={handleChoice} />
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

function StartStep({ data, choices, onChoice }: { data: StartNodeData; choices: DialogueEdge[]; onChoice: (e: DialogueEdge) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.startStep}>
        <Flag size={16} style={{ color: "oklch(0.68 0.15 180)", flexShrink: 0 }} />
        <div><p className={style.startStepLabel}>Entry Point</p><p className={style.startStepName}>{data.name || "Unnamed"}</p></div>
      </div>
      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function CharacterStep({ data, choices, onChoice }: { node: ForgeNode; data: CharacterNodeData; choices: DialogueEdge[]; onChoice: (e: DialogueEdge) => void }) {
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
      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function ActionStep({ data, choices, onChoice }: { data: ActionNodeData; choices: DialogueEdge[]; onChoice: (e: DialogueEdge) => void }) {
  if (data.actionType === "trigger") return <TriggerStep data={data} choices={choices} onChoice={onChoice} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={style.actionStep}>
        <Zap size={16} style={{ color: "oklch(0.72 0.18 155)", flexShrink: 0 }} />
        <div><p className={style.actionLabel}>{data.actionType}</p><p className={style.actionName}>{data.label || "Action"}</p></div>
      </div>
      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function TriggerStep({ data, choices, onChoice }: { data: ActionNodeData; choices: DialogueEdge[]; onChoice: (e: DialogueEdge) => void }) {
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
      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function ChoiceList({ choices, onChoice }: { choices: DialogueEdge[]; onChoice: (e: DialogueEdge) => void }) {
  if (choices.length === 0) return <p className={style.branchEnd}>— End of branch —</p>;
  return (
    <div className={style.choiceList}>
      {choices.map((edge, i) => (
        <motion.button key={edge.id} type="button" onClick={() => onChoice(edge)} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className={style.choiceBtn}>
          <span className={style.choiceNum}>{i + 1}</span>
          <span className={style.choiceText}>
            {edge.data?.optionText || <span className={style.choiceEmpty}>Continue</span>}
          </span>
          <ChevronRight size={14} style={{ color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)", flexShrink: 0 }} />
        </motion.button>
      ))}
    </div>
  );
}

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
