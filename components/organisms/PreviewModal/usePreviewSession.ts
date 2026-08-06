import { useState, useCallback, useEffect } from "react";
import { useGraphStore } from "@/store/useGraphStore";
import { useVariableStore } from "@/store/useVariableStore";
import {
  buildInitialState,
  evaluateConditionGroup,
  applyVariableAction,
} from "@/lib/simulateVariables";
import type { StateChange, VarState } from "@/lib/simulateVariables";
import type { ActionNodeData, DialogueEdge } from "@/types";
import {
  findStartNodes, findFallbackRoot, formatConditionGroup,
  type Phase, type PreviewHistory,
} from "./previewHelpers";

export function usePreviewSession(open: boolean, onClose: () => void) {
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
    setVarState(buildInitialState(variables));
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
    setVarState(buildInitialState(variables));
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

  return {
    nodes, variables, startNodes, phase,
    currentNode, allOutgoing, lockedEdgeIds, lockedEdgeReasons,
    history, ended, varState, stateChanges,
    statePanelOpen, setStatePanelOpen,
    handleChoice, handleSelectEntry, handleStartPreview, handleRestart, handleBack,
  };
}
