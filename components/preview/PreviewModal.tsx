"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Zap,
  Flag,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  Music,
  Swords,
  Hash,
  Clapperboard,
  Monitor,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGraphStore } from "@/store/useGraphStore";
import { cn } from "@/lib/utils";
import type {
  ForgeNode,
  CharacterNodeData,
  ActionNodeData,
  StartNodeData,
  DialogueEdge,
  TriggerCategory,
  TriggerExecutionMode,
} from "@/types";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
}

interface PreviewHistory {
  nodeId: string;
  choiceText?: string;
}

/* ─── Category icons / colours ───────────────────────────── */

const CATEGORY_CONFIG: Record<
  TriggerCategory,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  game:      { icon: Swords,      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  variable:  { icon: Hash,        color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/25" },
  audio:     { icon: Music,       color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/25" },
  animation: { icon: Clapperboard,color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/25" },
  ui:        { icon: Monitor,     color: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/25" },
  custom:    { icon: Wrench,      color: "text-muted-foreground", bg: "bg-muted/30",   border: "border-border/50" },
};

const EXECUTION_LABELS: Record<TriggerExecutionMode, string> = {
  immediate:  "Immediate",
  beforeNext: "Before Next",
  afterNext:  "After Next",
};

/* ─── Root finding ────────────────────────────────────────── */

function findStartNodes(nodes: ForgeNode[]): ForgeNode[] {
  return nodes.filter((n) => n.type === "start");
}

function findFallbackRoot(nodes: ForgeNode[], edges: DialogueEdge[]): ForgeNode | null {
  if (nodes.length === 0) return null;
  const hasIncoming = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasIncoming.has(n.id));
  return roots[0] ?? nodes[0];
}

/* ─── Main modal ──────────────────────────────────────────── */

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const { nodes, edges } = useGraphStore();

  const startNodes = findStartNodes(nodes);
  const [selectedStartId, setSelectedStartId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<PreviewHistory[]>([]);
  const [ended, setEnded] = useState(false);
  const [phase, setPhase] = useState<"entry" | "playing">(
    startNodes.length === 1 ? "playing" : "entry"
  );

  /* Reset when opened */
  useEffect(() => {
    if (!open) return;
    const starts = findStartNodes(nodes);
    if (starts.length === 1) {
      setSelectedStartId(starts[0].id);
      setCurrentId(starts[0].id);
      setPhase("playing");
    } else if (starts.length > 1) {
      setSelectedStartId(null);
      setCurrentId(null);
      setPhase("entry");
    } else {
      /* No Start nodes — fall back to root detection */
      const root = findFallbackRoot(nodes, edges);
      setSelectedStartId(root?.id ?? null);
      setCurrentId(root?.id ?? null);
      setPhase("playing");
    }
    setHistory([]);
    setEnded(false);
  }, [open, nodes, edges]);

  /* Keyboard: Escape closes */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const currentNode = currentId ? nodes.find((n) => n.id === currentId) ?? null : null;
  const outgoingEdges = edges.filter((e) => e.source === currentId);

  const handleChoice = useCallback(
    (edge: DialogueEdge) => {
      const target = nodes.find((n) => n.id === edge.target);
      if (!target) return;

      setHistory((h) => [
        ...h,
        { nodeId: currentId!, choiceText: edge.data?.optionText || undefined },
      ]);
      setCurrentId(target.id);

      if (target.type === "action") {
        const d = target.data as ActionNodeData;
        if (d.actionType === "end") setEnded(true);
      }
    },
    [currentId, nodes]
  );

  const handleSelectEntry = useCallback(
    (startId: string) => {
      setSelectedStartId(startId);
      setCurrentId(startId);
      setHistory([]);
      setEnded(false);
      setPhase("playing");
    },
    []
  );

  const handleRestart = useCallback(() => {
    if (selectedStartId) {
      setCurrentId(selectedStartId);
    } else {
      const root = findFallbackRoot(nodes, edges);
      setCurrentId(root?.id ?? null);
    }
    setHistory([]);
    setEnded(false);
  }, [selectedStartId, nodes, edges]);

  const handleBack = useCallback(() => {
    const starts = findStartNodes(nodes);
    if (starts.length > 1) {
      setPhase("entry");
      setCurrentId(null);
      setHistory([]);
      setEnded(false);
    }
  }, [nodes]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "relative z-10 w-full md:max-w-lg",
              "rounded-t-2xl md:rounded-2xl border border-border/60",
              "bg-card shadow-2xl flex flex-col",
              "h-[92dvh] md:h-auto md:max-h-[80vh]",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-semibold">
                  {phase === "entry" ? "Choose Entry Point" : "Preview"}
                </span>
                {phase === "playing" && history.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    step {history.length + 1}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {phase === "playing" && findStartNodes(nodes).length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleBack}
                    className="w-7 h-7 text-muted-foreground/60 hover:text-foreground"
                    title="Back to entry selection"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                )}
                {phase === "playing" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRestart}
                    className="w-7 h-7 text-muted-foreground/60 hover:text-foreground"
                    title="Restart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="w-7 h-7 text-muted-foreground/60 hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-4">
                {nodes.length === 0 ? (
                  <EmptyGraph />
                ) : phase === "entry" ? (
                  <EntrySelection
                    startNodes={findStartNodes(nodes)}
                    onSelect={handleSelectEntry}
                  />
                ) : !currentNode ? (
                  <NoStartNode />
                ) : ended ? (
                  <EndedState onRestart={handleRestart} onClose={onClose} />
                ) : currentNode.type === "start" ? (
                  /* Auto-advance through Start node */
                  <StartStep
                    data={currentNode.data as StartNodeData}
                    choices={outgoingEdges}
                    onChoice={handleChoice}
                  />
                ) : currentNode.type === "character" ? (
                  <CharacterStep
                    node={currentNode}
                    data={currentNode.data as CharacterNodeData}
                    choices={outgoingEdges}
                    onChoice={handleChoice}
                  />
                ) : (
                  <ActionStep
                    data={currentNode.data as ActionNodeData}
                    choices={outgoingEdges}
                    onChoice={handleChoice}
                  />
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─── Entry selection screen ──────────────────────────────── */

function EntrySelection({
  startNodes,
  onSelect,
}: {
  startNodes: ForgeNode[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center">
        Choose a starting branch to preview:
      </p>
      {startNodes.map((n, i) => (
        <motion.button
          key={n.id}
          type="button"
          onClick={() => onSelect(n.id)}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left",
            "border border-teal-500/30 bg-teal-500/5",
            "hover:bg-teal-500/10 hover:border-teal-500/50",
            "transition-colors group"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Flag className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground/90">
              {(n.data as StartNodeData).name || "Unnamed"}
            </p>
            <p className="text-[10px] text-muted-foreground">Start node</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-teal-400 transition-colors" />
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Step renderers ──────────────────────────────────────── */

function StartStep({
  data,
  choices,
  onChoice,
}: {
  data: StartNodeData;
  choices: DialogueEdge[];
  onChoice: (e: DialogueEdge) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 py-2 px-3 bg-teal-500/8 border border-teal-500/20 rounded-xl">
        <Flag className="w-4 h-4 text-teal-400 shrink-0" />
        <div>
          <p className="text-[10px] font-semibold text-teal-400/80 uppercase tracking-wider">
            Entry Point
          </p>
          <p className="text-sm font-medium text-foreground/80">
            {data.name || "Unnamed"}
          </p>
        </div>
      </div>
      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function CharacterStep({
  data,
  choices,
  onChoice,
}: {
  node: ForgeNode;
  data: CharacterNodeData;
  choices: DialogueEdge[];
  onChoice: (e: DialogueEdge) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 overflow-hidden">
          {data.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.portrait} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4.5 h-4.5 text-indigo-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {data.name || <span className="italic text-muted-foreground">Unnamed</span>}
          </p>
          {data.emotion && (
            <span className="text-[10px] text-muted-foreground capitalize">{data.emotion}</span>
          )}
        </div>
      </div>

      <div className="bg-muted/30 border border-border/40 rounded-xl px-4 py-3">
        {data.dialogue ? (
          <p className="text-sm leading-relaxed text-foreground/90">{data.dialogue}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground/50">No dialogue set.</p>
        )}
      </div>

      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function ActionStep({
  data,
  choices,
  onChoice,
}: {
  data: ActionNodeData;
  choices: DialogueEdge[];
  onChoice: (e: DialogueEdge) => void;
}) {
  if (data.actionType === "trigger") {
    return <TriggerStep data={data} choices={choices} onChoice={onChoice} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 py-2 px-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
        <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
            {data.actionType}
          </p>
          <p className="text-sm font-medium text-foreground/80">{data.label || "Action"}</p>
        </div>
      </div>
      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function TriggerStep({
  data,
  choices,
  onChoice,
}: {
  data: ActionNodeData;
  choices: DialogueEdge[];
  onChoice: (e: DialogueEdge) => void;
}) {
  const category = data.category ?? "custom";
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.custom;
  const Icon = cfg.icon;
  const execMode = data.executionMode ?? "immediate";
  const params = data.params ?? {};
  const hasParams = Object.keys(params).length > 0;

  return (
    <div className="space-y-4">
      <div className={cn("rounded-xl border px-4 py-3 space-y-2", cfg.bg, cfg.border)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4 shrink-0", cfg.color)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                TRIGGER
              </p>
              <Badge
                variant="outline"
                className={cn("text-[9px] h-4 px-1.5 border", cfg.color, cfg.border)}
              >
                {category}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-foreground/90">
              {data.event || data.label || "Trigger"}
            </p>
          </div>
          <span className={cn("text-[10px] font-medium shrink-0", cfg.color)}>
            {EXECUTION_LABELS[execMode]}
          </span>
        </div>

        {hasParams && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {Object.entries(params).map(([k, v]) => (
              <span
                key={k}
                className="text-[10px] font-mono bg-background/40 border border-border/40 rounded px-1.5 py-0.5 text-foreground/70"
              >
                {k}=<span className="text-foreground/50">{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <ChoiceList choices={choices} onChoice={onChoice} />
    </div>
  );
}

function ChoiceList({
  choices,
  onChoice,
}: {
  choices: DialogueEdge[];
  onChoice: (e: DialogueEdge) => void;
}) {
  if (choices.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 italic text-center py-2">
        — End of branch —
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {choices.map((edge, i) => (
        <motion.button
          key={edge.id}
          type="button"
          onClick={() => onChoice(edge)}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left",
            "border border-border/50 bg-muted/20 hover:bg-muted/50",
            "text-sm text-foreground/80 hover:text-foreground",
            "transition-colors group",
            "min-h-[44px]", // touch target minimum
          )}
        >
          <span className="text-[10px] font-mono text-muted-foreground/40 w-4 shrink-0">
            {i + 1}
          </span>
          <span className="flex-1">
            {edge.data?.optionText || (
              <span className="italic text-muted-foreground/50">Continue</span>
            )}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors shrink-0" />
        </motion.button>
      ))}
    </div>
  );
}

/* ─── State screens ───────────────────────────────────────── */

function EndedState({ onRestart, onClose }: { onRestart: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <ChevronRight className="w-6 h-6 text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-semibold mb-1">Dialogue ended</p>
        <p className="text-xs text-muted-foreground">The conversation reached an end node.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRestart} className="gap-1.5">
          <RotateCcw className="w-3 h-3" />
          Restart
        </Button>
        <Button size="sm" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function EmptyGraph() {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-3">
      <AlertTriangle className="w-8 h-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">Add some nodes to the canvas to preview.</p>
    </div>
  );
}

function NoStartNode() {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-3">
      <AlertTriangle className="w-8 h-8 text-amber-400/60" />
      <p className="text-sm text-muted-foreground">Could not find a starting node.</p>
    </div>
  );
}
