"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  Plus,
  Search,
  Upload,
  Cloud,
  HardDrive,
  Clock,
  ArrowLeft,
  FolderOpen,
  SortAsc,
  SortDesc,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CloudMigrationModal } from "@/components/dashboard/CloudMigrationModal";
import { FirstLoginSheet, markMigrationDismissed, isMigrationDismissed } from "@/components/dashboard/FirstLoginSheet";
import { SignInModal } from "@/components/auth/SignInModal";
import { useProjectStore } from "@/store/useProjectStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { CloudProject } from "@/types";

type SidebarFilter = "all" | "recent" | "cloud" | "local";
type SortMode = "updated" | "name";

export default function ProjectsPage() {
  const router = useRouter();
  const {
    user, isAuthLoading,
    projects, isProjectsLoading,
    loadProjects, createProject, deleteProject, duplicateProject, renameProject,
    canCreateCloudProject, cloudProjectCount,
  } = useProjectStore();
  const { setCurrentProjectId } = useEditorStore();
  const { nodes, edges } = useGraphStore();

  const [filter, setFilter] = useState<SidebarFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("updated");
  const [sortAsc, setSortAsc] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [firstLoginOpen, setFirstLoginOpen] = useState(false);

  // Detect first sign-in with existing local content
  const prevUserRef = useRef(user);
  useEffect(() => {
    const wasGuest = prevUserRef.current === null;
    const isNow = user !== null;
    prevUserRef.current = user;

    if (wasGuest && isNow && nodes.length > 0 && !isMigrationDismissed()) {
      setFirstLoginOpen(true);
    }
  }, [user, nodes.length]);

  useEffect(() => {
    if (user) loadProjects();
  }, [user, loadProjects]);

  // Synthetic local draft entry
  const localDraft: CloudProject | null = useMemo(() => {
    if (nodes.length === 0) return null;
    const { projectName } = useEditorStore.getState();
    return {
      id: "__local__",
      userId: "",
      name: projectName,
      graph: {
        nodes: nodes as unknown as import("@/types").SerialNode[],
        edges: edges as unknown as import("@/types").SerialEdge[],
      },
      previewImage: null,
      mode: "local",
      isTemplate: false,
      theme: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [nodes, edges]);

  const allItems: CloudProject[] = useMemo(() => {
    const list: CloudProject[] = [];
    if (localDraft) list.push(localDraft);
    list.push(...projects);
    return list;
  }, [projects, localDraft]);

  const displayed = useMemo(() => {
    let list = allItems;
    if (filter === "cloud") list = list.filter((p) => p.mode === "cloud");
    if (filter === "local") list = list.filter((p) => p.mode === "local");
    if (filter === "recent") {
      const cutoff = Date.now() - 86400000 * 7;
      list = list.filter((p) => new Date(p.updatedAt).getTime() > cutoff);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const cmp =
        sort === "name"
          ? a.name.localeCompare(b.name)
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortAsc ? -cmp : cmp;
    });
    return list;
  }, [allItems, filter, search, sort, sortAsc]);

  async function handleCreate() {
    if (!user) { setSignInOpen(true); return; }
    if (!canCreateCloudProject()) {
      toast.error(`Cloud project limit reached (${cloudProjectCount}/${FREE_PLAN_CLOUD_LIMIT}).`);
      return;
    }
    try {
      const project = await createProject();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!navigator.onLine) {
        toast.error("You're offline. Connect and try again.");
      } else if (msg.toLowerCase().includes("auth")) {
        toast.error("Session expired. Please sign in again.");
      } else {
        toast.error("Failed to create project. Please try again.");
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project.");
    }
  }

  async function handleDuplicate(id: string) {
    if (!canCreateCloudProject()) {
      toast.error(`Cloud limit reached (${cloudProjectCount}/${FREE_PLAN_CLOUD_LIMIT}). Delete a project first.`);
      return;
    }
    try {
      await duplicateProject(id);
      toast.success("Project duplicated.");
    } catch {
      toast.error("Failed to duplicate project.");
    }
  }

  async function handleRename(id: string, name: string) {
    try {
      await renameProject(id, name);
    } catch {
      toast.error("Failed to rename project.");
    }
  }

  function handleOpenLocal() {
    setCurrentProjectId(null);
    router.push("/");
  }

  function handleFirstLoginImport() {
    setFirstLoginOpen(false);
    markMigrationDismissed();
    setMigrationOpen(true);
  }

  function handleFirstLoginChoose() {
    setFirstLoginOpen(false);
    markMigrationDismissed();
    setMigrationOpen(true);
  }

  function handleFirstLoginDismiss() {
    setFirstLoginOpen(false);
    markMigrationDismissed();
  }

  const FILTERS: { id: SidebarFilter; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All Projects", icon: FolderOpen },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "local", label: "Local", icon: HardDrive },
    { id: "cloud", label: "Cloud", icon: Cloud },
  ];

  const counts: Record<SidebarFilter, number> = useMemo(() => ({
    all: allItems.length,
    recent: allItems.filter((p) => Date.now() - new Date(p.updatedAt).getTime() < 86400000 * 7).length,
    local: allItems.filter((p) => p.mode === "local").length,
    cloud: allItems.filter((p) => p.mode === "cloud").length,
  }), [allItems]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-border bg-card/60 p-3 gap-1">
        <Link href="/" className="flex items-center gap-2 px-2 py-2 mb-2 cursor-pointer">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Workflow className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Dialogue Forge</span>
        </Link>

        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer",
              filter === id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </span>
            {counts[id] > 0 && (
              <span className="text-[9px] tabular-nums font-medium opacity-60">{counts[id]}</span>
            )}
          </button>
        ))}

        {/* Plan usage */}
        {user && (
          <div className="mt-auto px-3 py-2.5 rounded-xl bg-muted/20 border border-border/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Cloud projects</span>
              <span className={cn(
                "text-[10px] font-medium tabular-nums",
                cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT ? "text-destructive/80" : "",
              )}>
                {cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted/50">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT ? "bg-destructive/70" : "bg-primary/60",
                )}
                style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-5 border-b border-border/60 shrink-0">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Editor
          </Link>
          <div className="hidden md:block w-px h-4 bg-border/60" />
          <h1 className="text-sm font-semibold">Projects</h1>
          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-7 w-48 text-xs bg-background/40"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort */}
          <button
            type="button"
            onClick={() => setSortAsc((a) => !a)}
            className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            {sortAsc ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
            <span className="hidden sm:block">{sort === "updated" ? "Updated" : "Name"}</span>
          </button>

          {/* New project */}
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs cursor-pointer"
            onClick={handleCreate}
            disabled={isAuthLoading}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:block">New Project</span>
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isProjectsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : !user ? (
            <GuestEmptyState onSignIn={() => setSignInOpen(true)} onContinueLocal={handleOpenLocal} />
          ) : displayed.length === 0 ? (
            <EmptyState filter={filter} search={search} onCreate={handleCreate} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((project, i) =>
                project.id === "__local__" ? (
                  <LocalDraftCard
                    key="local"
                    project={project}
                    onOpen={handleOpenLocal}
                    onMoveToCloud={() => setMigrationOpen(true)}
                    index={i}
                    isSignedIn={!!user}
                    canUpload={canCreateCloudProject()}
                  />
                ) : (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={i}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onRename={handleRename}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals / sheets ── */}
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />

      <CloudMigrationModal
        open={migrationOpen}
        onClose={() => setMigrationOpen(false)}
        onSuccess={() => setMigrationOpen(false)}
      />

      <FirstLoginSheet
        open={firstLoginOpen}
        nodeCount={nodes.length}
        onImport={handleFirstLoginImport}
        onChoose={handleFirstLoginChoose}
        onDismiss={handleFirstLoginDismiss}
      />
    </div>
  );
}

/* ─── Empty states ─────────────────────────────────────────── */

function GuestEmptyState({
  onSignIn,
  onContinueLocal,
}: {
  onSignIn: () => void;
  onContinueLocal: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-5 py-16">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Cloud className="w-7 h-7 text-primary/60" />
      </div>
      <div>
        <p className="text-sm font-semibold mb-1.5">Sign in to manage cloud projects</p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Save your work to the cloud, access it from any device, and keep a history of your projects.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSignIn} size="sm" className="cursor-pointer">Sign in</Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={onContinueLocal}>
          Continue locally
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  filter,
  search,
  onCreate,
}: {
  filter: SidebarFilter;
  search: string;
  onCreate: () => void;
}) {
  const message = search
    ? `No projects match "${search}"`
    : filter === "cloud" ? "No cloud projects yet"
    : filter === "recent" ? "No recent projects"
    : "No projects yet";

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-4 py-16">
      <FolderOpen className="w-10 h-10 text-muted-foreground/30" />
      <div>
        <p className="text-sm font-semibold">{message}</p>
        {!search && (
          <p className="text-xs text-muted-foreground mt-1">Create a new project to get started.</p>
        )}
      </div>
      {!search && (
        <Button size="sm" onClick={onCreate} className="gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          New Project
        </Button>
      )}
    </div>
  );
}

/* ─── Local draft card ─────────────────────────────────────── */

function LocalDraftCard({
  project,
  onOpen,
  onMoveToCloud,
  index,
  isSignedIn,
  canUpload,
}: {
  project: CloudProject;
  onOpen: () => void;
  onMoveToCloud: () => void;
  index: number;
  isSignedIn: boolean;
  canUpload: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-xl border border-border/60 bg-card/70 hover:border-border hover:bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Preview */}
      <div
        className="h-28 bg-gradient-to-br from-muted/30 to-muted/10 border-b border-border/40 relative overflow-hidden cursor-pointer"
        onClick={onOpen}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0 / 15%) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md border bg-muted/40 border-border/50 text-muted-foreground">
            <HardDrive className="w-2.5 h-2.5" />
            Local
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400">
            Draft
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <p className="text-sm font-medium truncate cursor-pointer" onClick={onOpen}>
          {project.name}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {project.graph.nodes.length} nodes · local only
        </p>
      </div>

      {/* Move to cloud — only when signed in */}
      {isSignedIn && (
        <div className="px-3.5 pb-3">
          <button
            type="button"
            onClick={onMoveToCloud}
            disabled={!canUpload}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 h-7 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer",
              canUpload
                ? "border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                : "border-border/30 text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            <Upload className="w-3 h-3" />
            Move to Cloud
          </button>
        </div>
      )}
    </motion.div>
  );
}
