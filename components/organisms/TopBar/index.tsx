"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Workflow, Save, Download, Play, PanelLeft, PanelRight, Pencil,
  Upload, Undo2, Redo2, Check, AlertCircle, LayoutDashboard, Search,
  Cloud, CloudOff, Loader2, User, MoreHorizontal, Map, BookOpen,
  Keyboard, Settings, Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Separator } from "@/components/atoms/Separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/Tooltip";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { parseGraphJson, readFileAsText } from "@/lib/importGraph";
import { computeAutoLayout } from "@/lib/autoLayout";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import { SignInModal } from "@/components/organisms/SignInModal";
import { UserMenu, SignInButton } from "@/components/organisms/UserMenu";
import { ProfileSheet } from "@/components/organisms/ProfileSheet";
import cn from "classnames";
import type { AutosaveStatus } from "@/types";
import style from "./TopBar.module.scss";

export function TopBar() {
  const {
    sidebarOpen, toggleSidebar,
    inspectorOpen, toggleInspector,
    projectName, setProjectName,
    autosaveStatus,
    setPreviewOpen, setSearchOpen, setSettingsOpen,
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
    downloadJson(serializeGraph(nodes, edges, projectName));
  }, [nodes, edges, projectName]);

  const handleSave = useCallback(() => {
    try {
      downloadJson(serializeGraph(nodes, edges, projectName));
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
        if (!result.ok) { alert(`Import failed: ${result.error}`); return; }
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
    [loadGraph, setProjectName, nodes.length],
  );

  function confirmImport() {
    if (!pendingImport) return;
    loadGraph(pendingImport.nodes, pendingImport.edges);
    if (pendingImport.name) setProjectName(pendingImport.name);
    setPendingImport(null);
  }

  const SaveIcon = saveFlash === "saved" ? Check : saveFlash === "error" ? AlertCircle : Save;

  return (
    <header className={style.header}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.forge.json"
        className={style.hiddenInput}
        aria-label="Import JSON file"
        onChange={handleImportFile}
      />

      <div className={style.brand}>
        <div className={style.brandInner}>
          <div className={style.logo}>
            <Workflow size={14} style={{ color: "var(--primary-foreground)" }} />
          </div>
          <span className={style.brandName}>Dialogue Forge</span>
        </div>

        <Separator orientation="vertical" style={{ height: "1rem", margin: "0 0.125rem", opacity: 0.4 }} className={style.desktopOnly} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon-sm"
              onClick={toggleSidebar}
              className={cn(style.desktopOnly, !sidebarOpen && style.muted)}
            >
              <PanelLeft size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{sidebarOpen ? "Hide sidebar" : "Show sidebar"}</TooltipContent>
        </Tooltip>
      </div>

      <div className={style.center}>
        {editingName ? (
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") { setNameValue(projectName); setEditingName(false); }
            }}
            autoFocus
            aria-label="Project name"
            className={style.nameEdit}
          />
        ) : (
          <button
            type="button"
            onClick={() => { setNameValue(projectName); setEditingName(true); }}
            className={style.nameBtn}
          >
            <span className={style.nameBtnText}>{projectName}</span>
            <Pencil size={12} className={style.pencilIcon} />
          </button>
        )}
      </div>

      <div className={style.actions}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={undo} disabled={past.length === 0} style={{ opacity: past.length === 0 ? 0.3 : 1 }}>
              <Undo2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={redo} disabled={future.length === 0} style={{ opacity: future.length === 0 ? 0.3 : 1 }}>
              <Redo2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" style={{ height: "1rem", margin: "0 0.125rem", opacity: 0.4 }} className={style.desktopOnly} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon-sm"
              onClick={handleSave}
              className={cn(style.desktopOnly, saveFlash === "saved" && style.saveFlashSaved, saveFlash === "error" && style.saveFlashError)}
            >
              <SaveIcon size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{saveFlash === "saved" ? "Saved!" : "Save (Ctrl+S)"}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" style={{ height: "1rem", margin: "0 0.125rem", opacity: 0.4 }} className={style.desktopOnly} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => setSearchOpen(true)} className={style.desktopOnly}>
              <Search size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Search nodes (Ctrl+F)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon-sm"
              onClick={() => setNodePositions(computeAutoLayout(nodes, edges))}
              disabled={nodes.length === 0}
              className={style.desktopOnly}
              style={{ opacity: nodes.length === 0 ? 0.3 : 1 }}
            >
              <LayoutDashboard size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Auto layout (Ctrl+L)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" style={{ height: "1rem", margin: "0 0.25rem", opacity: 0.4 }} className={style.desktopOnly} />

        <button type="button" className={style.previewBtn} onClick={() => setPreviewOpen(true)}>
          <Play size={12} style={{ fill: "currentColor" }} />
          Preview
        </button>

        <Separator orientation="vertical" style={{ height: "1rem", margin: "0 0.125rem", opacity: 0.4 }} className={style.desktopOnly} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon-sm"
              onClick={toggleInspector}
              className={cn(style.desktopOnly, !inspectorOpen && style.muted)}
            >
              <PanelRight size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{inspectorOpen ? "Hide inspector" : "Show inspector"}</TooltipContent>
        </Tooltip>

        <MoreMenu
          onImport={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onSettings={() => setSettingsOpen(true)}
          onShortcuts={() => setSettingsOpen(true)}
          onClearWorkspace={() => setConfirmClear(true)}
          nodesCount={nodes.length}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon-sm"
              onClick={handleSave}
              className={cn(style.mobileOnly, saveFlash === "saved" && style.saveFlashSaved, saveFlash === "error" && style.saveFlashError)}
            >
              <SaveIcon size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Save</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={handleExport} className={style.mobileOnly}>
              <Download size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Export JSON</TooltipContent>
        </Tooltip>

        <AutosaveIndicator status={autosaveStatus} />

        <Separator orientation="vertical" style={{ height: "1rem", margin: "0 0.125rem", opacity: 0.4 }} className={style.desktopOnly} />

        {!isAuthLoading && (
          <>
            <div className={style.desktopOnly}>
              {user
                ? <UserMenu onSettings={() => setSettingsOpen(true)} />
                : <SignInButton onClick={() => setSignInOpen(true)} />
              }
            </div>

            <button
              type="button"
              className={style.mobileAccountBtn}
              onClick={() => setProfileSheetOpen(true)}
              aria-label="Account"
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className={style.mobileAvatar} />
                : <User size={16} />
              }
            </button>
          </>
        )}
      </div>

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
        onConfirm={() => { useGraphStore.getState().clearGraph(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </header>
  );
}

function MoreMenu({
  onImport, onExport, onSettings, onShortcuts, onClearWorkspace, nodesCount,
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
    <div ref={ref} className={style.moreWrapper}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen((v) => !v)}>
            <MoreHorizontal size={16} />
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="bottom">More options</TooltipContent>}
      </Tooltip>

      {open && (
        <div className={style.dropdown}>
          <MenuItemEl icon={Upload} label="Import JSON" onClick={() => { onImport(); setOpen(false); }} />
          <MenuItemEl icon={Download} label="Export JSON" onClick={() => { onExport(); setOpen(false); }} />
          <div className={style.menuDivider} />
          <MenuItemEl icon={Map} label="Roadmap" href="/roadmap" onClick={() => setOpen(false)} />
          <MenuItemEl icon={BookOpen} label="How to use" href="/how-to-use" onClick={() => setOpen(false)} />
          <div className={style.menuDivider} />
          <MenuItemEl icon={Settings} label="Settings" onClick={() => { onSettings(); setOpen(false); }} />
          <MenuItemEl icon={Keyboard} label="Shortcuts" onClick={() => { onShortcuts(); setOpen(false); }} />
          <div className={style.menuDivider} />
          <MenuItemEl
            icon={Trash2} label="Clear workspace"
            onClick={() => { onClearWorkspace(); setOpen(false); }}
            destructive disabled={nodesCount === 0}
          />
        </div>
      )}
    </div>
  );
}

function MenuItemEl({
  icon: Icon, label, href, onClick, destructive, disabled,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  href?: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const cls = cn(style.menuItem, destructive && style.menuItemDestructive);

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        <Icon size={14} />
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;

  const cls = cn(
    style.autosaveIndicator,
    status === "saving" && style.autosaveSaving,
    status === "saved" && style.autosaveSaved,
    status === "error" && style.autosaveError,
    status === "offline" && style.autosaveOffline,
  );

  return (
    <div className={cls}>
      {status === "saving" && <Loader2 size={12} className="animate-spin" />}
      {status === "saved" && <Cloud size={12} />}
      {status === "error" && <AlertCircle size={12} />}
      {status === "offline" && <CloudOff size={12} />}
      <span>
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved"}
        {status === "error" && "Save failed"}
        {status === "offline" && "Offline"}
      </span>
    </div>
  );
}
