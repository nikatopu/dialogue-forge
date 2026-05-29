"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Settings, Palette, Keyboard, User, Info, Cloud,
  Download, LogOut, GitBranch, Globe, Loader2, Upload,
  Trash2, Check, Map, BookOpen, ExternalLink,
} from "lucide-react";
import Link from "next/link";
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
import { applyTheme } from "@/lib/applyTheme";
import type { Json } from "@/lib/supabase/types";
import type { Theme } from "@/types";
import style from "./SettingsPanel.module.scss";

const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], label: "Undo" }, { keys: ["Ctrl", "Y"], label: "Redo" },
  { keys: ["Ctrl", "D"], label: "Duplicate node" }, { keys: ["Ctrl", "C"], label: "Copy node" },
  { keys: ["Ctrl", "V"], label: "Paste node" }, { keys: ["Ctrl", "F"], label: "Search nodes" },
  { keys: ["Ctrl", "L"], label: "Auto layout" }, { keys: ["Ctrl", "S"], label: "Save / export" },
  { keys: ["Del"], label: "Delete selected node" }, { keys: ["Escape"], label: "Deselect / close" },
  { keys: ["Space"], label: "Pan canvas" }, { keys: ["Shift"], label: "Multi-select" },
];

const THEMES: { value: Theme; label: string; swatchClass: string; description: string }[] = [
  { value: "default",  label: "Default",  swatchClass: "bg-indigo-500", description: "Indigo" },
  { value: "ocean",    label: "Ocean",    swatchClass: "bg-cyan-500",   description: "Cyan" },
  { value: "forest",   label: "Forest",   swatchClass: "bg-green-600",  description: "Green" },
  { value: "midnight", label: "Midnight", swatchClass: "bg-violet-600", description: "Violet" },
  { value: "rose",     label: "Rose",     swatchClass: "bg-rose-500",   description: "Rose" },
  { value: "cyber",    label: "Cyber",    swatchClass: "bg-lime-500",   description: "Lime" },
];

const THEME_SWATCH_COLORS: Record<Theme, string> = {
  default:  "oklch(0.52 0.255 262)",
  ocean:    "oklch(0.68 0.18 220)",
  forest:   "oklch(0.72 0.16 155)",
  midnight: "oklch(0.68 0.22 295)",
  rose:     "oklch(0.72 0.22 355)",
  cyber:    "oklch(0.8 0.24 125)",
};

type Section = "general" | "appearance" | "shortcuts" | "account" | "about";
const NAV_ITEMS: { id: Section; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "general",    label: "General",    icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "shortcuts",  label: "Shortcuts",  icon: Keyboard },
  { id: "account",    label: "Account",    icon: User },
  { id: "about",      label: "About",      icon: Info },
];

export function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useEditorStore();
  const [section, setSection] = useState<Section>("general");

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setSettingsOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, setSettingsOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={style.overlay}
        >
          <motion.aside
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={style.nav}
          >
            <div className={style.navLogo}>
              <div className={style.navLogoIcon}><Settings size={12} style={{ color: "var(--primary-foreground)" }} /></div>
              <span className={style.navLogoText}>Settings</span>
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" onClick={() => setSection(item.id)} className={cn(style.navItem, section === item.id && style.navItemActive)}>
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </motion.aside>

          <div className={style.content}>
            <div className={style.topBar}>
              <span className={style.breadcrumb}>Settings / {NAV_ITEMS.find((n) => n.id === section)?.label}</span>
              <button type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)} className={style.closeBtn}><X size={16} /></button>
            </div>
            <div className={style.sectionScroll}>
              <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className={style.sectionPad}>
                {section === "general" && <GeneralSection onClose={() => setSettingsOpen(false)} />}
                {section === "appearance" && <AppearanceSection />}
                {section === "shortcuts" && <ShortcutsSection />}
                {section === "account" && <AccountSection />}
                {section === "about" && <AboutSection />}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function GeneralSection({ onClose }: { onClose: () => void }) {
  const { nodes, clearGraph } = useGraphStore();
  const [confirmClear, setConfirmClear] = useState(false);
  return (
    <div>
      <div className={style.sectionHeader}><h2 className={style.sectionTitle}>General</h2></div>
      <h3 className={style.subsectionTitle}>Workspace</h3>
      <div className={style.dangerCard}>
        <div className={style.dangerRow}>
          <div className={style.dangerText}>
            <p className={style.dangerTitle}>Clear workspace</p>
            <p className={style.dangerDesc}>Delete all nodes, edges, and undo history. This cannot be undone.</p>
          </div>
          <Button size="sm" variant="destructive" style={{ flexShrink: 0, height: "2rem", padding: "0 0.75rem", fontSize: "0.75rem" }} disabled={nodes.length === 0} onClick={() => setConfirmClear(true)}>Clear all</Button>
        </div>
      </div>
      <ConfirmModal open={confirmClear} title="Clear workspace?" message="This will permanently delete all nodes, edges, and undo history. This action cannot be undone." confirmLabel="Delete everything" onConfirm={() => { clearGraph(); setConfirmClear(false); onClose(); }} onCancel={() => setConfirmClear(false)} />
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useEditorStore();
  return (
    <div>
      <div className={style.sectionHeader}><h2 className={style.sectionTitle}>Appearance</h2></div>
      <h3 className={style.subsectionTitle}>Color Theme</h3>
      <p className={style.subsectionDesc}>All themes are dark variants. The accent color changes throughout the editor.</p>
      <div className={style.themeGrid}>
        {THEMES.map((t) => (
          <button key={t.value} type="button" onClick={() => { setTheme(t.value); applyTheme(t.value); }} className={cn(style.themeBtn, theme === t.value && style.themeBtnActive)}>
            <span className={cn(style.themeSwatch, theme === t.value && style.themeSwatchActive)} style={{ backgroundColor: THEME_SWATCH_COLORS[t.value] }} />
            <div>
              <p className={style.themeName}>{t.label}</p>
              <p className={style.themeDesc}>{t.description}</p>
            </div>
            {theme === t.value && <Check size={12} className={style.themeCheck} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShortcutsSection() {
  return (
    <div>
      <div className={style.sectionHeader}><h2 className={style.sectionTitle}>Shortcuts</h2></div>
      <div className={style.shortcutsTable}>
        {SHORTCUTS.map((s, i) => (
          <div key={s.label} className={style.shortcutRow}>
            <span className={style.shortcutLabel}>{s.label}</span>
            <div className={style.shortcutKeys}>{s.keys.map((k) => <kbd key={k} className={style.kbd}>{k}</kbd>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountSection() {
  const { settingsOpen } = useEditorStore();
  const { user, signOut, cloudProjectCount, canCreateCloudProject, loadProjects } = useProjectStore();
  const { nodes } = useGraphStore();
  const { currentProjectId, setCurrentProjectId } = useEditorStore();
  const [signInOpen, setSignInOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const isLocalDraft = !currentProjectId && nodes.length > 0;

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
      setCurrentProjectId(project.id);
      await loadProjects();
    } finally { setSavingDraft(false); }
  }

  useEffect(() => { if (!settingsOpen) setSavingDraft(false); }, [settingsOpen]);

  return (
    <div>
      <div className={style.sectionHeader}><h2 className={style.sectionTitle}>Account</h2></div>
      {user ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className={style.profileCard}>
            <div className={style.profileRow}>
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="" className={style.profileAvatar} />
                : <div className={style.profileInitials}>{(user.fullName || user.email || "?")[0].toUpperCase()}</div>
              }
              <div className={style.profileMeta}>
                {user.fullName && <p className={style.profileName}>{user.fullName}</p>}
                {user.email && <p className={style.profileEmail}>{user.email}</p>}
                {user.provider && (
                  <p className={style.profileProvider}>
                    {user.provider === "github" ? <GitBranch size={10} /> : <Globe size={10} />}
                    {user.provider}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={style.usageCard}>
            <div className={style.usageHeader}>
              <div className={style.usageLeft}><Cloud size={12} /><span>Cloud projects</span></div>
              <span className={style.usageCount}>{cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}</span>
            </div>
            <div className={style.usageBar}>
              <div className={cn(style.usageFill, cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && style.usageFillLimit)} style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }} />
            </div>
          </div>
          <div className={style.actionList}>
            {isLocalDraft && canCreateCloudProject() && (
              <button type="button" onClick={handleSaveDraftToCloud} disabled={savingDraft} className={style.actionBtn}>
                {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {savingDraft ? "Saving to cloud…" : "Save local draft to cloud"}
              </button>
            )}
            {nodes.length > 0 && (
              <button type="button" onClick={handleExportLocal} className={style.actionBtn}><Download size={14} />Export local data</button>
            )}
            <Separator style={{ opacity: 0.3, margin: "0.25rem 0" }} />
            <button type="button" onClick={signOut} className={cn(style.actionBtn, style.actionBtnDanger)}><LogOut size={14} />Sign out</button>
          </div>
        </div>
      ) : (
        <div className={style.guestCard}>
          <div className={style.guestIconBox}><User size={18} style={{ color: "var(--primary)" }} /></div>
          <div>
            <p className={style.guestTitle}>No account</p>
            <p className={style.guestDesc}>Sign in to save projects to the cloud and access them from any device.</p>
          </div>
          <Button size="sm" style={{ width: "100%", height: "2rem", fontSize: "0.75rem" }} onClick={() => setSignInOpen(true)}>Sign in</Button>
        </div>
      )}
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}

function AboutSection() {
  return (
    <div>
      <div className={style.sectionHeader}><h2 className={style.sectionTitle}>About</h2></div>
      <div className={style.aboutCard}>
        <p className={style.aboutTitle}>Dialogue Forge</p>
        <p className={style.aboutDesc}>A visual branching dialogue editor for games and interactive fiction. Build node-based conversation graphs and export structured JSON for any engine.</p>
        <p className={style.aboutVersion}>Version 1.3</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <a href="/roadmap" target="_blank" rel="noopener noreferrer" className={style.linkItem}><div className={style.linkLeft}><Map size={14} />Roadmap</div><ExternalLink size={12} style={{ opacity: 0.5 }} /></a>
        <a href="/how-to-use" target="_blank" rel="noopener noreferrer" className={style.linkItem}><div className={style.linkLeft}><BookOpen size={14} />How to use</div><ExternalLink size={12} style={{ opacity: 0.5 }} /></a>
        <Separator style={{ opacity: 0.3, margin: "0.25rem 0" }} />
        <Link href="/privacy" target="_blank" className={style.linkItem}>Privacy Policy</Link>
        <Link href="/terms" target="_blank" className={style.linkItem}>Terms of Service</Link>
      </div>
    </div>
  );
}
