"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Workflow,
  Save,
  Download,
  Play,
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
  Cloud,
  CloudOff,
  Loader2,
  User,
  MoreHorizontal,
  Map,
  BookOpen,
  Keyboard,
  Settings,
  Trash2,
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
import { useProjectStore } from "@/store/useProjectStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { parseGraphJson, readFileAsText } from "@/lib/importGraph";
import { computeAutoLayout } from "@/lib/autoLayout";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SignInModal } from "@/components/auth/SignInModal";
import { UserMenu, SignInButton } from "@/components/auth/UserMenu";
import { ProfileSheet } from "@/components/auth/ProfileSheet";
import { cn } from "@/lib/utils";
import type { AutosaveStatus } from "@/types";

export function TopBar() {
  const {
    sidebarOpen, toggleSidebar,
    inspectorOpen, toggleInspector,
    projectName, setProjectName,
    autosaveStatus,
    setPreviewOpen,
    setSearchOpen,
    setSettingsOpen,
  } = useEditorStore();
  const { undo, redo, past, future, nodes, edges, loadGraph, setNodePositions } = useGraphStore();
  const { user, isAuthLoading } = useProjectStore();
  const isMobile = useIsMobile();
  const [signInOpen, setSignInOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);
  const [saveFlash, setSaveFlash] = useState<"idle" | "saved" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<{
    nodes: Parameters<typeof loadGraph>[0];
    edges: Parameters<typeof loadGraph>[1];
    name?: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

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
    <header className="h-12 flex items-center gap-1 px-3 shrink-0 border-b border-border bg-card/80 backdrop-blur-sm z-50 relative">
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

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40 hidden md:block" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className={cn("hidden md:flex cursor-pointer", !sidebarOpen && "text-muted-foreground")}
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
              "group flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer",
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
              className="disabled:opacity-30 cursor-pointer"
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
              className="disabled:opacity-30 cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40 hidden md:block" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              className={cn(
                "hidden md:flex cursor-pointer",
                saveFlash === "saved" && "text-emerald-400",
                saveFlash === "error" && "text-destructive",
              )}
            >
              <SaveIcon className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {saveFlash === "saved" ? "Saved!" : "Save (Ctrl+S)"}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40 hidden md:block" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex cursor-pointer"
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
              className="hidden md:flex disabled:opacity-30 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Auto layout (Ctrl+L)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1 opacity-40 hidden md:block" />

        {/* Preview */}
        <Button
          size="sm"
          className="gap-1.5 h-7 px-3 text-xs font-medium hidden md:flex cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        >
          <Play className="w-3 h-3 fill-current" />
          Preview
        </Button>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40 hidden md:block" />

        {/* Inspector toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleInspector}
              className={cn("hidden md:flex cursor-pointer", !inspectorOpen && "text-muted-foreground")}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {inspectorOpen ? "Hide inspector" : "Show inspector"}
          </TooltipContent>
        </Tooltip>

        {/* More dropdown (desktop) */}
        <MoreMenu
          onImport={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onSettings={() => setSettingsOpen(true)}
          onShortcuts={() => setSettingsOpen(true)}
          onClearWorkspace={() => setConfirmClear(true)}
          nodesCount={nodes.length}
        />

        {/* Mobile: save + export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              className={cn(
                "flex md:hidden cursor-pointer",
                saveFlash === "saved" && "text-emerald-400",
                saveFlash === "error" && "text-destructive",
              )}
            >
              <SaveIcon className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Save</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleExport}
              className="flex md:hidden cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Export JSON</TooltipContent>
        </Tooltip>

        {/* Autosave status */}
        <AutosaveIndicator status={autosaveStatus} />

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40 hidden md:block" />

        {/* Auth */}
        {!isAuthLoading && (
          <>
            <div className="hidden md:flex items-center">
              {user ? (
                <UserMenu onSettings={() => setSettingsOpen(true)} />
              ) : (
                <SignInButton onClick={() => setSignInOpen(true)} />
              )}
            </div>

            <button
              type="button"
              className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setProfileSheetOpen(true)}
              aria-label="Account"
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <ProfileSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        onSettings={() => setSettingsOpen(true)}
        onSignIn={() => setSignInOpen(true)}
      />

      <ConfirmModal
        open={pendingImport !== null}
        title="Replace current project?"
        message="Importing this file will replace your existing nodes and edges. Make sure you've exported anything you want to keep."
        confirmLabel="Import & replace"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmModal
        open={confirmClear}
        title="Clear workspace?"
        message="This will permanently delete all nodes, edges, and undo history. This cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={() => {
          useGraphStore.getState().clearGraph();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </header>
  );
}

/* ─── More dropdown ──────────────────────────────────────── */

function MoreMenu({
  onImport,
  onExport,
  onSettings,
  onShortcuts,
  onClearWorkspace,
  nodesCount,
}: {
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
  onShortcuts: () => void;
  onClearWorkspace: () => void;
  nodesCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative hidden md:block">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen((v) => !v)}
            className={cn("cursor-pointer", open && "bg-muted/60 text-foreground")}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="bottom">More options</TooltipContent>}
      </Tooltip>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-100 py-1">
          <MenuItem icon={Upload} label="Import JSON" onClick={() => { onImport(); setOpen(false); }} />
          <MenuItem icon={Download} label="Export JSON" onClick={() => { onExport(); setOpen(false); }} />
          <MenuDivider />
          <MenuItem icon={Map} label="Roadmap" href="/roadmap" onClick={() => setOpen(false)} />
          <MenuItem icon={BookOpen} label="How to use" href="/how-to-use" onClick={() => setOpen(false)} />
          <MenuDivider />
          <MenuItem icon={Settings} label="Settings" onClick={() => { onSettings(); setOpen(false); }} />
          <MenuItem icon={Keyboard} label="Shortcuts" onClick={() => { onShortcuts(); setOpen(false); }} />
          <MenuDivider />
          <MenuItem
            icon={Trash2}
            label="Clear workspace"
            onClick={() => { onClearWorkspace(); setOpen(false); }}
            destructive
            disabled={nodesCount === 0}
          />
        </div>
      )}
    </div>
  );
}

function MenuDivider() {
  return <div className="h-px bg-border/50 my-1" />;
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  destructive,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const cls = cn(
    "w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left cursor-pointer",
    destructive
      ? "text-destructive/70 hover:text-destructive hover:bg-destructive/5 disabled:opacity-40"
      : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onClick={onClick}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </button>
  );
}

/* ─── Autosave indicator ─────────────────────────────────── */

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "hidden md:flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md transition-all",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-emerald-400",
        status === "error" && "text-destructive",
        status === "offline" && "text-amber-400"
      )}
    >
      {status === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "saved" && <Cloud className="w-3 h-3" />}
      {status === "error" && <AlertCircle className="w-3 h-3" />}
      {status === "offline" && <CloudOff className="w-3 h-3" />}
      <span>
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved"}
        {status === "error" && "Save failed"}
        {status === "offline" && "Offline"}
      </span>
    </div>
  );
}
