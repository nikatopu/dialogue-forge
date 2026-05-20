"use client";

import { useState, useRef, useCallback } from "react";
import {
  Workflow,
  Save,
  Download,
  Play,
  Settings,
  PanelLeft,
  PanelRight,
  Pencil,
  Upload,
  Undo2,
  Redo2,
  Check,
  AlertCircle,
  LayoutDashboard,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { parseGraphJson, readFileAsText } from "@/lib/importGraph";
import { computeAutoLayout } from "@/lib/autoLayout";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { cn } from "@/lib/utils";

export function TopBar() {
  const {
    sidebarOpen, toggleSidebar,
    inspectorOpen, toggleInspector,
    projectName, setProjectName,
    setPreviewOpen,
    setSearchOpen,
    setSettingsOpen,
  } = useEditorStore();
  const { undo, redo, past, future, nodes, edges, loadGraph, setNodePositions } = useGraphStore();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);
  const [saveFlash, setSaveFlash] = useState<"idle" | "saved" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<{ nodes: Parameters<typeof loadGraph>[0]; edges: Parameters<typeof loadGraph>[1]; name?: string } | null>(null);

  function commitName() {
    const trimmed = nameValue.trim();
    setProjectName(trimmed || "Untitled Project");
    setEditingName(false);
  }

  const handleExport = useCallback(() => {
    const payload = serializeGraph(nodes, edges, projectName);
    downloadJson(payload);
  }, [nodes, edges, projectName]);

  const handleSave = useCallback(() => {
    try {
      const payload = serializeGraph(nodes, edges, projectName);
      downloadJson(payload);
      setSaveFlash("saved");
    } catch {
      setSaveFlash("error");
    } finally {
      setTimeout(() => setSaveFlash("idle"), 2000);
    }
  }, [nodes, edges, projectName]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      try {
        const text = await readFileAsText(file);
        const result = parseGraphJson(text);
        if (!result.ok) {
          alert(`Import failed: ${result.error}`);
          return;
        }
        if (nodes.length > 0) {
          setPendingImport({ nodes: result.nodes, edges: result.edges, name: result.name });
        } else {
          loadGraph(result.nodes, result.edges);
          if (result.name) setProjectName(result.name);
        }
      } catch {
        alert("Failed to read the file.");
      }
    },
    [loadGraph, setProjectName, nodes.length]
  );

  function confirmImport() {
    if (!pendingImport) return;
    loadGraph(pendingImport.nodes, pendingImport.edges);
    if (pendingImport.name) setProjectName(pendingImport.name);
    setPendingImport(null);
  }

  const SaveIcon = saveFlash === "saved" ? Check : saveFlash === "error" ? AlertCircle : Save;

  return (
    <header className="h-12 flex items-center gap-1 px-3 shrink-0 border-b border-border bg-card/80 backdrop-blur-sm z-50">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.forge.json"
        className="hidden"
        aria-label="Import JSON file"
        onChange={handleImportFile}
      />

      {/* ── Brand + sidebar toggle ── */}
      <div className="flex items-center gap-1.5 mr-1">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Workflow className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight select-none hidden sm:block">
            Dialogue Forge
          </span>
        </div>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className={cn(!sidebarOpen && "text-muted-foreground")}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* ── Project name (center) ── */}
      <div className="flex-1 flex justify-center min-w-0">
        {editingName ? (
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") {
                setNameValue(projectName);
                setEditingName(false);
              }
            }}
            autoFocus
            aria-label="Project name"
            className={cn(
              "bg-muted/60 border border-border rounded-md px-2.5 py-1",
              "text-sm font-medium text-center text-foreground",
              "outline-none focus:ring-2 focus:ring-ring/50",
              "w-48 transition-all"
            )}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameValue(projectName);
              setEditingName(true);
            }}
            className={cn(
              "group flex items-center gap-1.5 px-2.5 py-1 rounded-md",
              "text-sm font-medium text-foreground",
              "hover:bg-muted/50 transition-colors max-w-xs truncate"
            )}
          >
            <span className="truncate">{projectName}</span>
            <Pencil className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={undo}
              disabled={past.length === 0}
              className="disabled:opacity-30"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={redo}
              disabled={future.length === 0}
              className="disabled:opacity-30"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              className={cn(
                saveFlash === "saved" && "text-emerald-400",
                saveFlash === "error" && "text-destructive"
              )}
            >
              <SaveIcon className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {saveFlash === "saved" ? "Saved!" : "Save (Ctrl+S)"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Import JSON</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleExport}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Export JSON</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Search nodes (Ctrl+F)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setNodePositions(computeAutoLayout(nodes, edges))}
              disabled={nodes.length === 0}
              className="disabled:opacity-30"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Auto layout (Ctrl+L)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1 opacity-40" />

        <Button
          size="sm"
          className="gap-1.5 h-7 px-3 text-xs font-medium"
          onClick={() => setPreviewOpen(true)}
        >
          <Play className="w-3 h-3 fill-current" />
          Preview
        </Button>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href="/how-to-use" target="_blank" rel="noopener noreferrer" aria-label="How to use">
                <BookOpen className="w-3.5 h-3.5" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">How to use</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleInspector}
              className={cn(!inspectorOpen && "text-muted-foreground")}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {inspectorOpen ? "Hide inspector" : "Show inspector"}
          </TooltipContent>
        </Tooltip>
      </div>
      <ConfirmModal
        open={pendingImport !== null}
        title="Replace current project?"
        message="Importing this file will replace your existing nodes and edges. Make sure you've exported anything you want to keep."
        confirmLabel="Import & replace"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </header>
  );
}
