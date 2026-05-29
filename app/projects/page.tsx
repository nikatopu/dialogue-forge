"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow, Plus, Search, Upload, Cloud, HardDrive, Clock,
  ArrowLeft, FolderOpen, SortAsc, SortDesc, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { ProjectCard } from "@/components/organisms/ProjectCard";
import { CloudMigrationModal } from "@/components/organisms/CloudMigrationModal";
import { FirstLoginSheet, markMigrationDismissed, isMigrationDismissed } from "@/components/organisms/FirstLoginSheet";
import { SignInModal } from "@/components/organisms/SignInModal";
import { useProjectStore } from "@/store/useProjectStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { toast } from "@/lib/toast";
import cn from "classnames";
import type { CloudProject } from "@/types";
import style from "./ProjectsPage.module.scss";

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

  const prevUserRef = useRef(user);
  useEffect(() => {
    const wasGuest = prevUserRef.current === null;
    const isNow = user !== null;
    prevUserRef.current = user;
    if (wasGuest && isNow && nodes.length > 0 && !isMigrationDismissed()) {
      setFirstLoginOpen(true);
    }
  }, [user, nodes.length]);

  useEffect(() => { if (user) loadProjects(); }, [user, loadProjects]);

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
      const cmp = sort === "name" ? a.name.localeCompare(b.name) : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortAsc ? -cmp : cmp;
    });
    return list;
  }, [allItems, filter, search, sort, sortAsc]);

  async function handleCreate() {
    if (!user) { setSignInOpen(true); return; }
    if (!canCreateCloudProject()) { toast.error(`Cloud project limit reached (${cloudProjectCount}/${FREE_PLAN_CLOUD_LIMIT}).`); return; }
    try {
      const project = await createProject();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!navigator.onLine) toast.error("You're offline. Connect and try again.");
      else if (msg.toLowerCase().includes("auth")) toast.error("Session expired. Please sign in again.");
      else toast.error("Failed to create project. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    try { await deleteProject(id); toast.success("Project deleted."); }
    catch { toast.error("Failed to delete project."); }
  }

  async function handleDuplicate(id: string) {
    if (!canCreateCloudProject()) { toast.error(`Cloud limit reached (${cloudProjectCount}/${FREE_PLAN_CLOUD_LIMIT}). Delete a project first.`); return; }
    try { await duplicateProject(id); toast.success("Project duplicated."); }
    catch { toast.error("Failed to duplicate project."); }
  }

  async function handleRename(id: string, name: string) {
    try { await renameProject(id, name); }
    catch { toast.error("Failed to rename project."); }
  }

  function handleOpenLocal() { setCurrentProjectId(null); router.push("/"); }

  const FILTERS: { id: SidebarFilter; label: string; icon: React.ElementType }[] = [
    { id: "all",    label: "All Projects", icon: FolderOpen },
    { id: "recent", label: "Recent",       icon: Clock },
    { id: "local",  label: "Local",        icon: HardDrive },
    { id: "cloud",  label: "Cloud",        icon: Cloud },
  ];

  const counts: Record<SidebarFilter, number> = useMemo(() => ({
    all:    allItems.length,
    recent: allItems.filter((p) => Date.now() - new Date(p.updatedAt).getTime() < 86400000 * 7).length,
    local:  allItems.filter((p) => p.mode === "local").length,
    cloud:  allItems.filter((p) => p.mode === "cloud").length,
  }), [allItems]);

  return (
    <div className={style.layout}>
      <aside className={style.sidebar}>
        <Link href="/" className={style.sidebarBrand}>
          <div className={style.sidebarLogo}><Workflow size={14} style={{ color: "var(--primary-foreground)" }} /></div>
          <span className={style.sidebarBrandName}>Dialogue Forge</span>
        </Link>

        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(style.filterBtn, filter === id && style.filterBtnActive)}
          >
            <span className={style.filterBtnInner}>
              <Icon size={14} style={{ flexShrink: 0 }} />
              {label}
            </span>
            {counts[id] > 0 && <span className={style.filterCount}>{counts[id]}</span>}
          </button>
        ))}

        {user && (
          <div className={style.usageBox}>
            <div className={style.usageRow}>
              <span className={style.usageLabel}>Cloud projects</span>
              <span className={cn(style.usageCount, cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && style.usageCountLimit)}>
                {cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}
              </span>
            </div>
            <div className={style.usageBar}>
              <div
                className={cn(style.usageFill, cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && style.usageFillLimit)}
                style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </aside>

      <div className={style.main}>
        <header className={style.topBar}>
          <Link href="/" className={style.backLink}>
            <ArrowLeft size={14} />Editor
          </Link>
          <div className={style.topBarDivider} />
          <h1 className={style.pageTitle}>Projects</h1>
          <div style={{ flex: 1 }} />

          <div className={style.searchWrap}>
            <Search size={14} className={style.searchIcon} />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={style.searchInput}
            />
            <AnimatePresence>
              {search && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearch("")} className={style.searchClear}>
                  <X size={12} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button type="button" onClick={() => setSortAsc((a) => !a)} className={style.sortBtn}>
            {sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />}
            <span className={style.sortLabel}>{sort === "updated" ? "Updated" : "Name"}</span>
          </button>

          <Button size="sm" className={style.newBtn} onClick={handleCreate} disabled={isAuthLoading}>
            <Plus size={14} />
            <span className={style.newBtnLabel}>New Project</span>
          </Button>
        </header>

        <div className={style.content}>
          {isProjectsLoading ? (
            <div className={style.loading}><Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} /></div>
          ) : !user ? (
            <GuestEmptyState onSignIn={() => setSignInOpen(true)} onContinueLocal={handleOpenLocal} />
          ) : displayed.length === 0 ? (
            <EmptyState filter={filter} search={search} onCreate={handleCreate} />
          ) : (
            <div className={style.grid}>
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

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <CloudMigrationModal open={migrationOpen} onClose={() => setMigrationOpen(false)} onSuccess={() => setMigrationOpen(false)} />
      <FirstLoginSheet
        open={firstLoginOpen}
        nodeCount={nodes.length}
        onImport={() => { setFirstLoginOpen(false); markMigrationDismissed(); setMigrationOpen(true); }}
        onChoose={() => { setFirstLoginOpen(false); markMigrationDismissed(); setMigrationOpen(true); }}
        onDismiss={() => { setFirstLoginOpen(false); markMigrationDismissed(); }}
      />
    </div>
  );
}

function GuestEmptyState({ onSignIn, onContinueLocal }: { onSignIn: () => void; onContinueLocal: () => void }) {
  return (
    <div className={style.emptyState}>
      <div className={style.emptyIcon}><Cloud size={28} style={{ color: "color-mix(in oklch, var(--primary) 60%, transparent)" }} /></div>
      <div>
        <p className={style.emptyTitle}>Sign in to manage cloud projects</p>
        <p className={style.emptyDesc}>Save your work to the cloud, access it from any device, and keep a history of your projects.</p>
      </div>
      <div className={style.emptyActions}>
        <Button onClick={onSignIn} size="sm">Sign in</Button>
        <Button variant="outline" size="sm" onClick={onContinueLocal}>Continue locally</Button>
      </div>
    </div>
  );
}

function EmptyState({ filter, search, onCreate }: { filter: SidebarFilter; search: string; onCreate: () => void }) {
  const message = search ? `No projects match "${search}"`
    : filter === "cloud" ? "No cloud projects yet"
    : filter === "recent" ? "No recent projects"
    : "No projects yet";
  return (
    <div className={style.emptyState}>
      <FolderOpen size={40} style={{ color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)" }} />
      <div>
        <p className={style.emptyTitle}>{message}</p>
        {!search && <p className={style.emptyDesc}>Create a new project to get started.</p>}
      </div>
      {!search && (
        <Button size="sm" onClick={onCreate} style={{ gap: "0.375rem" }}>
          <Plus size={14} />New Project
        </Button>
      )}
    </div>
  );
}

function LocalDraftCard({ project, onOpen, onMoveToCloud, index, isSignedIn, canUpload }: {
  project: CloudProject; onOpen: () => void; onMoveToCloud: () => void; index: number;
  isSignedIn: boolean; canUpload: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={style.draftCard}
    >
      <div className={style.draftPreview} onClick={onOpen}>
        <div className={style.draftGrid} style={{ backgroundImage: "radial-gradient(oklch(1 0 0 / 15%) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className={style.draftBadge}>
          <HardDrive size={10} />Local
        </div>
        <div className={style.draftDraftBadge}>Draft</div>
      </div>
      <div className={style.draftBody}>
        <p className={style.draftName} onClick={onOpen}>{project.name}</p>
        <p className={style.draftMeta}>{project.graph.nodes.length} nodes · local only</p>
      </div>
      {isSignedIn && (
        <div className={style.draftAction}>
          <button
            type="button"
            onClick={onMoveToCloud}
            disabled={!canUpload}
            className={cn(style.moveToCloudBtn, !canUpload && style.moveToCloudBtnDisabled)}
          >
            <Upload size={12} />Move to Cloud
          </button>
        </div>
      )}
    </motion.div>
  );
}
