"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Palette,
  Keyboard,
  User,
  Info,
  Cloud,
  Download,
  LogOut,
  GitBranch,
  Globe,
  Loader2,
  Upload,
  Trash2,
  Check,
  Map,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProjectStore } from "@/store/useProjectStore";
import { projectService, FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { SignInModal } from "@/components/auth/SignInModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { cn } from "@/lib/utils";
import { applyTheme } from "@/lib/applyTheme";
import type { Json } from "@/lib/supabase/types";
import type { Theme } from "@/types";

/* ─── Shortcuts data ─────────────────────────────────────── */

const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], label: "Undo" },
  { keys: ["Ctrl", "Y"], label: "Redo" },
  { keys: ["Ctrl", "D"], label: "Duplicate node" },
  { keys: ["Ctrl", "C"], label: "Copy node" },
  { keys: ["Ctrl", "V"], label: "Paste node" },
  { keys: ["Ctrl", "F"], label: "Search nodes" },
  { keys: ["Ctrl", "L"], label: "Auto layout" },
  { keys: ["Ctrl", "S"], label: "Save / export" },
  { keys: ["Del"], label: "Delete selected node" },
  { keys: ["Escape"], label: "Deselect / close" },
  { keys: ["Space"], label: "Pan canvas" },
  { keys: ["Shift"], label: "Multi-select" },
];

/* ─── Theme picker data ──────────────────────────────────── */

const THEMES: { value: Theme; label: string; swatchClass: string; description: string }[] = [
  { value: "default", label: "Default", swatchClass: "bg-indigo-500", description: "Indigo" },
  { value: "ocean", label: "Ocean", swatchClass: "bg-cyan-500", description: "Cyan" },
  { value: "forest", label: "Forest", swatchClass: "bg-green-600", description: "Green" },
  { value: "midnight", label: "Midnight", swatchClass: "bg-violet-600", description: "Violet" },
  { value: "rose", label: "Rose", swatchClass: "bg-rose-500", description: "Rose" },
  { value: "cyber", label: "Cyber", swatchClass: "bg-lime-500", description: "Lime" },
];

/* ─── Nav sections ───────────────────────────────────────── */

type Section = "general" | "appearance" | "shortcuts" | "account" | "about";

const NAV_ITEMS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "account", label: "Account", icon: User },
  { id: "about", label: "About", icon: Info },
];

/* ─── Section: General ───────────────────────────────────── */

function GeneralSection({ onClose }: { onClose: () => void }) {
  const { nodes, clearGraph } = useGraphStore();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader title="General" />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </h3>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Clear workspace</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Delete all nodes, edges, and undo history. This cannot be undone.
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="shrink-0 h-8 px-3 text-xs cursor-pointer"
              disabled={nodes.length === 0}
              onClick={() => setConfirmClear(true)}
            >
              Clear all
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear workspace?"
        message="This will permanently delete all nodes, edges, and undo history. This action cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={() => {
          clearGraph();
          setConfirmClear(false);
          onClose();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

/* ─── Section: Appearance ────────────────────────────────── */

function AppearanceSection() {
  const { theme, setTheme } = useEditorStore();

  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Color Theme
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All themes are dark variants. The accent color changes throughout the editor.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setTheme(t.value); applyTheme(t.value); }}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                theme === t.value
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-card hover:border-border hover:bg-muted/20"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-card",
                  t.swatchClass,
                  theme === t.value ? "ring-primary" : "ring-transparent"
                )}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.description}</p>
              </div>
              {theme === t.value && (
                <Check className="w-3 h-3 text-primary absolute top-2 right-2 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Section: Shortcuts ─────────────────────────────────── */

function ShortcutsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Shortcuts" />
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {SHORTCUTS.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center justify-between px-4 py-2.5",
              i !== SHORTCUTS.length - 1 && "border-b border-border/30"
            )}
          >
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="font-mono bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-[10px] text-foreground/70"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section: Account ───────────────────────────────────── */

function AccountSection() {
  const { settingsOpen } = useEditorStore();
  const { user, signOut, cloudProjectCount, canCreateCloudProject, loadProjects } =
    useProjectStore();
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
      const project = await projectService.create({
        name: projectName,
        graph: { nodes: serialized.nodes, edges: serialized.edges } as unknown as Json,
        mode: "cloud",
      });
      setCurrentProjectId(project.id);
      await loadProjects();
    } finally {
      setSavingDraft(false);
    }
  }

  // Reset state when panel closes
  useEffect(() => {
    if (!settingsOpen) setSavingDraft(false);
  }, [settingsOpen]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Account" />

      {user ? (
        <div className="space-y-3">
          {/* Profile card */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full shrink-0 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {(user.fullName || user.email || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {user.fullName && (
                  <p className="text-sm font-medium truncate">{user.fullName}</p>
                )}
                {user.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
                {user.provider && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {user.provider === "github" ? (
                      <GitBranch className="w-2.5 h-2.5 text-muted-foreground" />
                    ) : (
                      <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                    )}
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {user.provider}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cloud usage */}
          <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Cloud projects</span>
              </div>
              <span className="text-xs font-medium tabular-nums">
                {cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  cloudProjectCount === 0 && "w-0",
                  cloudProjectCount === 1 && "w-1/5",
                  cloudProjectCount === 2 && "w-2/5",
                  cloudProjectCount === 3 && "w-3/5",
                  cloudProjectCount === 4 && "w-4/5",
                  cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && "w-full",
                  cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT
                    ? "bg-destructive/70"
                    : "bg-primary/60"
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {isLocalDraft && canCreateCloudProject() && (
              <button
                type="button"
                onClick={handleSaveDraftToCloud}
                disabled={savingDraft}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors text-left disabled:opacity-50 cursor-pointer"
              >
                {savingDraft ? (
                  <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                )}
                {savingDraft ? "Saving to cloud…" : "Save local draft to cloud"}
              </button>
            )}

            {nodes.length > 0 && (
              <button
                type="button"
                onClick={handleExportLocal}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors text-left cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                Export local data
              </button>
            )}

            <Separator className="opacity-30 my-1" />

            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">No account</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to save projects to the cloud and access them from any device.
              Your local work is always available.
            </p>
          </div>
          <Button
            size="sm"
            className="w-full h-8 text-xs cursor-pointer"
            onClick={() => setSignInOpen(true)}
          >
            Sign in
          </Button>
        </div>
      )}

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}

/* ─── Section: About ─────────────────────────────────────── */

function AboutSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="About" />

      <div className="space-y-3">
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2">
          <p className="text-sm font-medium">Dialogue Forge</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A visual branching dialogue editor for games and interactive fiction.
            Build node-based conversation graphs and export structured JSON for any engine.
          </p>
          <p className="text-[10px] text-muted-foreground/60">Version 1.3</p>
        </div>

        <div className="space-y-1">
          <a
            href="/roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Map className="w-3.5 h-3.5 shrink-0" />
              Roadmap
            </div>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
          <a
            href="/how-to-use"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              How to use
            </div>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
          <Separator className="opacity-30 my-1" />
          <Link
            href="/privacy"
            target="_blank"
            className="flex items-center px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            target="_blank"
            className="flex items-center px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared header ──────────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pb-3 border-b border-border/40">
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────── */

export function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useEditorStore();
  const [section, setSection] = useState<Section>("general");

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSettingsOpen(false);
    }
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
          className="fixed inset-0 z-200 flex bg-background"
        >
          {/* ── Sidebar nav ── */}
          <motion.aside
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="w-52 shrink-0 border-r border-border/50 flex flex-col py-4 gap-1 bg-card/60"
          >
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                <Settings className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">Settings</span>
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "mx-2 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer",
                    section === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </motion.aside>

          {/* ── Content ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-border/50 shrink-0">
              <span className="text-sm text-muted-foreground">
                Settings / {NAV_ITEMS.find((n) => n.id === section)?.label}
              </span>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section content */}
            <div className="flex-1 overflow-y-auto">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="max-w-xl mx-auto px-6 py-8"
              >
                {section === "general" && (
                  <GeneralSection onClose={() => setSettingsOpen(false)} />
                )}
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
    document.body
  );
}
