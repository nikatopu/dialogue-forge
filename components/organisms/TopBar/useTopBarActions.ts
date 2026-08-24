import { useState, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useVariableStore } from "@/store/useVariableStore";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { parseGraphJson, readFileAsText } from "@/lib/importGraph";
import { track } from "@/lib/analytics";
import {
  getLastEngine,
  setEnginePreference,
  shouldShowEnginePopup,
  type ExportEngine,
} from "@/lib/enginePreference";
import type { ProjectVariable } from "@/types";

type PendingImport = {
  nodes: Parameters<ReturnType<typeof useGraphStore.getState>["loadGraph"]>[0];
  edges: Parameters<ReturnType<typeof useGraphStore.getState>["loadGraph"]>[1];
  variables?: ProjectVariable[];
  name?: string;
} | null;

/** Which toolbar action the engine picker is currently gating. */
type PendingEngineAction = "export" | "save" | null;

export function useTopBarActions() {
  const { projectName, setProjectName } = useEditorStore();
  const { nodes, edges, loadGraph } = useGraphStore();
  const { variables, setVariables } = useVariableStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveFlash, setSaveFlash] = useState<"idle" | "saved" | "error">("idle");
  const [pendingImport, setPendingImport] = useState<PendingImport>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const [enginePickerOpen, setEnginePickerOpen] = useState(false);
  const [initialEngine, setInitialEngine] = useState<ExportEngine>("unity");
  const [pendingEngineAction, setPendingEngineAction] = useState<PendingEngineAction>(null);

  const doExport = useCallback((engine: ExportEngine) => {
    downloadJson(serializeGraph(nodes, edges, projectName, variables));
    track("export_clicked", { engine, trigger: "menu", node_count: nodes.length });
  }, [nodes, edges, projectName, variables]);

  const doSave = useCallback((engine: ExportEngine) => {
    try {
      downloadJson(serializeGraph(nodes, edges, projectName, variables));
      setSaveFlash("saved");
      track("export_clicked", { engine, trigger: "toolbar_save", node_count: nodes.length });
    } catch {
      setSaveFlash("error");
    } finally {
      setTimeout(() => setSaveFlash("idle"), 2000);
    }
  }, [nodes, edges, projectName, variables]);

  const openEnginePicker = useCallback((action: Exclude<PendingEngineAction, null>) => {
    setInitialEngine(getLastEngine() ?? "unity");
    setPendingEngineAction(action);
    setEnginePickerOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    if (shouldShowEnginePopup()) { openEnginePicker("export"); return; }
    doExport(getLastEngine() ?? "other");
  }, [doExport, openEnginePicker]);

  const handleSave = useCallback(() => {
    if (shouldShowEnginePopup()) { openEnginePicker("save"); return; }
    doSave(getLastEngine() ?? "other");
  }, [doSave, openEnginePicker]);

  const confirmEnginePicker = useCallback((engine: ExportEngine, dontShowAgain: boolean) => {
    setEnginePreference(engine, dontShowAgain);
    setEnginePickerOpen(false);
    if (pendingEngineAction === "export") doExport(engine);
    else if (pendingEngineAction === "save") doSave(engine);
    setPendingEngineAction(null);
  }, [pendingEngineAction, doExport, doSave]);

  const cancelEnginePicker = useCallback(() => {
    setEnginePickerOpen(false);
    setPendingEngineAction(null);
  }, []);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      try {
        const text = await readFileAsText(file);
        const result = parseGraphJson(text);
        if (!result.ok) { alert(`Import failed: ${result.error}`); return; }
        if (nodes.length > 0) {
          setPendingImport({ nodes: result.nodes, edges: result.edges, variables: result.variables, name: result.name });
        } else {
          loadGraph(result.nodes, result.edges);
          setVariables(result.variables);
          if (result.name) setProjectName(result.name);
          track("project_created", { source: "import" });
        }
      } catch {
        alert("Failed to read the file.");
      }
    },
    [loadGraph, setProjectName, setVariables, nodes.length],
  );

  const confirmImport = useCallback(() => {
    if (!pendingImport) return;
    loadGraph(pendingImport.nodes, pendingImport.edges);
    if (pendingImport.variables) setVariables(pendingImport.variables);
    if (pendingImport.name) setProjectName(pendingImport.name);
    setPendingImport(null);
    track("project_created", { source: "import" });
  }, [pendingImport, loadGraph, setVariables, setProjectName]);

  return {
    fileInputRef, saveFlash,
    pendingImport, setPendingImport, confirmImport,
    confirmClear, setConfirmClear,
    handleExport, handleSave, handleImportFile,
    enginePickerOpen, initialEngine, confirmEnginePicker, cancelEnginePicker,
  };
}
