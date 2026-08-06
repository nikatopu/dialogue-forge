"use client";

import { useState } from "react";
import {
  Workflow, Save, Play, PanelLeft, PanelRight, Download, Undo2, Redo2,
  Check, AlertCircle, LayoutDashboard, Search, User, SlidersHorizontal,
} from "lucide-react";
import { Separator } from "@/components/atoms/Separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProjectStore } from "@/store/useProjectStore";
import { computeAutoLayout } from "@/lib/autoLayout";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import { SignInModal } from "@/components/organisms/SignInModal";
import { UserMenu, SignInButton } from "@/components/organisms/UserMenu";
import { ProfileSheet } from "@/components/organisms/ProfileSheet";
import { useVariableStore } from "@/store/useVariableStore";
import cn from "classnames";
import { useTopBarActions } from "./useTopBarActions";
import { ToolbarButton } from "./ToolbarButton";
import { ProjectNameField } from "./ProjectNameField";
import { MoreMenu } from "./MoreMenu";
import { AutosaveIndicator } from "./AutosaveIndicator";
import style from "./TopBar.module.scss";

export function TopBar() {
  const {
    sidebarOpen, toggleSidebar, inspectorOpen, toggleInspector,
    autosaveStatus, setPreviewOpen, setSearchOpen, setSettingsOpen,
    setVariablesPanelOpen, variablesPanelOpen,
  } = useEditorStore();
  const { undo, redo, past, future, nodes, edges, setNodePositions } = useGraphStore();
  const { user, isAuthLoading } = useProjectStore();
  const [signInOpen, setSignInOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const {
    fileInputRef, saveFlash, pendingImport, setPendingImport, confirmImport,
    confirmClear, setConfirmClear, handleExport, handleSave, handleImportFile,
  } = useTopBarActions();

  const SaveIcon = saveFlash === "saved" ? Check : saveFlash === "error" ? AlertCircle : Save;
  const saveFlashClass = cn(saveFlash === "saved" && style.saveFlashSaved, saveFlash === "error" && style.saveFlashError);

  return (
    <header className={style.header}>
      <input ref={fileInputRef} type="file" accept=".json,.forge.json" className={style.hiddenInput} aria-label="Import JSON file" onChange={handleImportFile} />

      <div className={style.brand}>
        <div className={style.brandInner}>
          <div className={style.logo}><Workflow size={14} className={style.logoIcon} /></div>
          <span className={style.brandName}>Dialogue Forge</span>
        </div>
        <Separator orientation="vertical" className={cn(style.vSep, style.desktopOnly)} />
        <ToolbarButton icon={PanelLeft} iconSize={16} tooltip={sidebarOpen ? "Hide sidebar" : "Show sidebar"} onClick={toggleSidebar} className={cn(style.desktopOnly, !sidebarOpen && style.muted)} />
      </div>

      <div className={style.center}><ProjectNameField /></div>

      <div className={style.actions}>
        <ToolbarButton icon={Undo2} tooltip="Undo (Ctrl+Z)" onClick={undo} disabled={past.length === 0} />
        <ToolbarButton icon={Redo2} tooltip="Redo (Ctrl+Y)" onClick={redo} disabled={future.length === 0} />
        <Separator orientation="vertical" className={cn(style.vSep, style.desktopOnly)} />
        <ToolbarButton icon={SaveIcon} tooltip={saveFlash === "saved" ? "Saved!" : "Save (Ctrl+S)"} onClick={handleSave} className={cn(style.desktopOnly, saveFlashClass)} />
        <Separator orientation="vertical" className={cn(style.vSep, style.desktopOnly)} />
        <ToolbarButton icon={Search} tooltip="Search nodes (Ctrl+F)" onClick={() => setSearchOpen(true)} className={style.desktopOnly} />
        <ToolbarButton icon={LayoutDashboard} tooltip="Auto layout (Ctrl+L)" onClick={() => setNodePositions(computeAutoLayout(nodes, edges))} disabled={nodes.length === 0} className={style.desktopOnly} />
        <Separator orientation="vertical" className={cn(style.vSepWide, style.desktopOnly)} />
        <ToolbarButton icon={SlidersHorizontal} tooltip="Variables" onClick={() => setVariablesPanelOpen(!variablesPanelOpen)} className={cn(style.desktopOnly, variablesPanelOpen && style.varBtnActive)} />

        <button type="button" className={style.previewBtn} onClick={() => setPreviewOpen(true)}>
          <Play size={12} className={style.previewIcon} />
          Preview
        </button>

        <Separator orientation="vertical" className={cn(style.vSep, style.desktopOnly)} />
        <ToolbarButton icon={PanelRight} iconSize={16} tooltip={inspectorOpen ? "Hide inspector" : "Show inspector"} onClick={toggleInspector} className={cn(style.desktopOnly, !inspectorOpen && style.muted)} />

        <MoreMenu
          onImport={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onSettings={() => setSettingsOpen(true)}
          onShortcuts={() => setSettingsOpen(true)}
          onClearWorkspace={() => setConfirmClear(true)}
          nodesCount={nodes.length}
        />

        <ToolbarButton icon={SaveIcon} tooltip="Save" onClick={handleSave} className={cn(style.mobileOnly, saveFlashClass)} />
        <ToolbarButton icon={Download} tooltip="Export JSON" onClick={handleExport} className={style.mobileOnly} />

        <AutosaveIndicator status={autosaveStatus} />

        <Separator orientation="vertical" className={cn(style.vSep, style.desktopOnly)} />

        {!isAuthLoading && (
          <>
            <div className={style.desktopOnly}>
              {user ? <UserMenu onSettings={() => setSettingsOpen(true)} /> : <SignInButton onClick={() => setSignInOpen(true)} />}
            </div>
            <button type="button" className={style.mobileAccountBtn} onClick={() => setProfileSheetOpen(true)} aria-label="Account">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className={style.mobileAvatar} /> : <User size={16} />}
            </button>
          </>
        )}
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <ProfileSheet open={profileSheetOpen} onClose={() => setProfileSheetOpen(false)} onSettings={() => setSettingsOpen(true)} onSignIn={() => setSignInOpen(true)} />
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
        onConfirm={() => { useGraphStore.getState().clearGraph(); useVariableStore.getState().clearVariables(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </header>
  );
}
