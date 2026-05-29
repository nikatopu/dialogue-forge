"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Trash2, Keyboard, Info, User, Cloud, Download, LogOut,
  GitBranch, Globe, Loader2, Upload,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Separator } from "@/components/atoms/Separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProjectStore } from "@/store/useProjectStore";
import { projectService, FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { SignInModal } from "@/components/organisms/SignInModal";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import cn from "classnames";
import type { Json } from "@/lib/supabase/types";
import style from "./SettingsModal.module.scss";

const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], label: "Undo" }, { keys: ["Ctrl", "Y"], label: "Redo" },
  { keys: ["Ctrl", "D"], label: "Duplicate node" }, { keys: ["Ctrl", "C"], label: "Copy node" },
  { keys: ["Ctrl", "V"], label: "Paste node" }, { keys: ["Ctrl", "F"], label: "Search nodes" },
  { keys: ["Ctrl", "L"], label: "Auto layout" }, { keys: ["Ctrl", "S"], label: "Save / export" },
  { keys: ["Del"], label: "Delete selected node" }, { keys: ["Escape"], label: "Deselect / close" },
  { keys: ["Space"], label: "Pan canvas" }, { keys: ["Shift"], label: "Multi-select" },
];

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, currentProjectId } = useEditorStore();
  const { clearGraph, nodes } = useGraphStore();
  const { user, signOut, cloudProjectCount, canCreateCloudProject, loadProjects } = useProjectStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const isLocalDraft = !currentProjectId && nodes.length > 0;

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && !confirmClear) setSettingsOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, confirmClear, setSettingsOpen]);

  function handleExportLocal() {
    const { nodes: n, edges: e } = useGraphStore.getState();
    const { projectName } = useEditorStore.getState();
    downloadJson(serializeGraph(n, e, projectName));
  }

  async function handleSaveDraftToCloud() {
    if (!user || !canCreateCloudProject()) return;
    setSavingDraft(true);
    try {
      const { nodes: n, edges: e } = useGraphStore.getState();
      const { projectName } = useEditorStore.getState();
      const serialized = serializeGraph(n, e, projectName);
      const project = await projectService.create({ name: projectName, graph: { nodes: serialized.nodes, edges: serialized.edges } as unknown as Json, mode: "cloud" });
      useEditorStore.getState().setCurrentProjectId(project.id);
      await loadProjects();
    } finally { setSavingDraft(false); }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className={style.overlay} onClick={() => setSettingsOpen(false)}
          >
            <div className={style.backdrop} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={style.panel} onClick={(e) => e.stopPropagation()}
            >
              <div className={style.header}>
                <h2 className={style.title}>Settings</h2>
                <button type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)} className={style.closeBtn}><X size={16} /></button>
              </div>
              <div className={style.body}>
                <section>
                  <div className={style.sectionLabel}><Keyboard size={14} />Keyboard Shortcuts</div>
                  <div className={style.shortcutsTable}>
                    {SHORTCUTS.map((s) => (
                      <div key={s.label} className={style.shortcutRow}>
                        <span className={style.shortcutLabel}>{s.label}</span>
                        <div className={style.shortcutKeys}>{s.keys.map((k) => <kbd key={k} className={style.kbd}>{k}</kbd>)}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <Separator style={{ opacity: 0.4 }} />
                <section>
                  <div className={style.sectionLabel}><Info size={14} />About</div>
                  <p className={style.aboutText}>Dialogue Forge is a visual branching dialogue editor for games and interactive fiction. Your work is auto-saved to the browser.</p>
                </section>
                <Separator style={{ opacity: 0.4 }} />
                <section>
                  <div className={style.sectionLabel}><User size={14} />Account</div>
                  {user ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                      <div className={style.profileCard}>
                        <div className={style.profileRow}>
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className={style.profileAvatar} /> : <div className={style.profileInitials}>{(user.fullName || user.email || "?")[0].toUpperCase()}</div>}
                          <div className={style.profileMeta}>
                            {user.fullName && <p className={style.profileName}>{user.fullName}</p>}
                            {user.email && <p className={style.profileEmail}>{user.email}</p>}
                            {user.provider && <p style={{ fontSize: "0.625rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.25rem", textTransform: "capitalize" }}>{user.provider === "github" ? <GitBranch size={10} /> : <Globe size={10} />}{user.provider}</p>}
                          </div>
                        </div>
                      </div>
                      <div className={style.usageCard}>
                        <div className={style.usageRow}><div className={style.usageLeft}><Cloud size={12} /><span>Cloud projects</span></div><span className={style.usageCount}>{cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}</span></div>
                        <div className={style.usageBar}><div className={cn(cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT ? style.usageFillLimit : style.usageFillOk, style.usageFill)} style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }} /></div>
                      </div>
                      {isLocalDraft && canCreateCloudProject() && <button type="button" onClick={handleSaveDraftToCloud} disabled={savingDraft} className={style.actionBtn}>{savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{savingDraft ? "Saving to cloud…" : "Save local draft to cloud"}</button>}
                      {nodes.length > 0 && <button type="button" onClick={handleExportLocal} className={style.actionBtn}><Download size={14} />Export local data</button>}
                      <button type="button" onClick={() => { signOut(); setSettingsOpen(false); }} className={cn(style.actionBtn, style.actionBtnDanger)}><LogOut size={14} />Sign out</button>
                    </div>
                  ) : (
                    <div className={style.guestCard}>
                      <p className={style.guestDesc}>Sign in to save projects to the cloud and access them from any device.</p>
                      <Button size="sm" style={{ width: "100%", height: "1.75rem", fontSize: "0.75rem" }} onClick={() => setSignInOpen(true)}>Sign in</Button>
                    </div>
                  )}
                </section>
                <Separator style={{ opacity: 0.4 }} />
                <section>
                  <div className={style.sectionLabel}><Trash2 size={14} style={{ color: "color-mix(in oklch, var(--destructive) 70%, transparent)" }} /><span style={{ color: "color-mix(in oklch, var(--destructive) 70%, transparent)" }}>Danger Zone</span></div>
                  <div className={style.dangerCard}>
                    <div className={style.dangerRow}>
                      <div><p className={style.dangerTitle}>Clear workspace</p><p className={style.dangerDesc}>Delete all nodes, edges, and undo history. This cannot be undone.</p></div>
                      <Button size="sm" variant="destructive" style={{ flexShrink: 0, height: "1.75rem", padding: "0 0.75rem", fontSize: "0.75rem" }} disabled={nodes.length === 0} onClick={() => setConfirmClear(true)}>Clear all</Button>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal open={confirmClear} title="Clear workspace?" message="This will permanently delete all nodes, edges, and undo history. This action cannot be undone." confirmLabel="Delete everything" onConfirm={() => { clearGraph(); setConfirmClear(false); setSettingsOpen(false); }} onCancel={() => setConfirmClear(false)} />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>,
    document.body,
  );
}
