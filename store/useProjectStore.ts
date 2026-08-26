"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { projectService, FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { analyticsService } from "@/lib/analytics/analyticsService";
import { track } from "@/lib/analytics";
import type { CloudProject, AuthUser } from "@/types";

interface ProjectStore {
  /* Auth */
  user: AuthUser | null;
  isAuthLoading: boolean;

  /* Projects */
  projects: CloudProject[];
  isProjectsLoading: boolean;
  projectsError: string | null;

  /* Actions — auth */
  initAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;

  /* Actions — projects */
  loadProjects: () => Promise<void>;
  createProject: (name?: string) => Promise<CloudProject>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<CloudProject>;
  renameProject: (id: string, name: string) => Promise<void>;

  /* Plan */
  canCreateCloudProject: () => boolean;
  cloudProjectCount: number;
}

/*
 * `createClient()` returns a browser-wide singleton (see @supabase/ssr), so
 * every call to `initAuth()` — e.g. every time <EditorLayout> mounts, which
 * happens on every project open — would otherwise register a *new*
 * `onAuthStateChange` listener on the same underlying client, forever. Each
 * leaked listener re-fires on every subsequent auth event (including the
 * hourly token refresh), so after opening N projects in one session, a
 * single token refresh would trigger N duplicate `loadProjects()` calls —
 * each a full project-list query. Guard so the listener is registered once
 * per page load, no matter how many times `initAuth()` is called.
 */
let authListenerRegistered = false;

/**
 * Builds the OAuth redirectTo, carrying the page the user signed in from
 * as `next` so /auth/callback can send them back there instead of always
 * dropping them on the landing page.
 */
function buildAuthCallbackUrl(): string {
  const next = window.location.pathname + window.location.search;
  const params = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return `${window.location.origin}/auth/callback${params}`;
}

function mapUser(supabaseUser: {
  id: string;
  email?: string | null;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
  app_metadata?: { provider?: string };
} | null): AuthUser | null {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
    fullName:
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      null,
    provider: supabaseUser.app_metadata?.provider ?? null,
  };
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  user: null,
  isAuthLoading: true,
  projects: [],
  isProjectsLoading: false,
  projectsError: null,
  cloudProjectCount: 0,

  /* ── Auth ──────────────────────────────────────────────── */

  async initAuth() {
    const supabase = createClient();

    // Get current session
    const { data: { user } } = await supabase.auth.getUser();
    const mapped = mapUser(user);
    set({ user: mapped, isAuthLoading: false });
    analyticsService.setUser(mapped?.id ?? null);

    if (mapped) {
      get().loadProjects();
    }

    // Subscribe to auth state changes — exactly once per page load (see
    // `authListenerRegistered` above). initAuth() itself may run again on
    // every <EditorLayout> mount; only the listener registration is guarded.
    if (authListenerRegistered) return;
    authListenerRegistered = true;

    supabase.auth.onAuthStateChange((_event, session) => {
      const u = mapUser(session?.user ?? null);
      const prevUserId = get().user?.id ?? null;

      set({ user: u });
      analyticsService.setUser(u?.id ?? null);

      // Supabase fires this on routine token refresh (roughly hourly, and
      // on tab refocus) even when nothing about the signed-in user changed.
      // Only reload projects on an actual sign-in or account switch —
      // otherwise every refresh would re-run a full project-list query.
      if (u && u.id !== prevUserId) {
        get().loadProjects();
      } else if (!u && prevUserId) {
        set({ projects: [], cloudProjectCount: 0 });
      }
    });
  },

  async signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: buildAuthCallbackUrl() },
    });
  },

  async signInWithGitHub() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: buildAuthCallbackUrl() },
    });
  },

  async signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, projects: [], cloudProjectCount: 0 });
    analyticsService.track("sign_out");
  },

  /* ── Projects ──────────────────────────────────────────── */

  async loadProjects() {
    set({ isProjectsLoading: true, projectsError: null });
    try {
      const projects = await projectService.list();
      const cloudCount = projects.filter((p) => p.mode === "cloud").length;
      set({ projects, cloudProjectCount: cloudCount, isProjectsLoading: false });
    } catch (err) {
      set({
        projectsError: err instanceof Error ? err.message : "Failed to load projects",
        isProjectsLoading: false,
      });
    }
  },

  async createProject(name = "Untitled Project") {
    const project = await projectService.create({ name, mode: "cloud" });
    set((s) => ({
      projects: [project, ...s.projects],
      cloudProjectCount: s.cloudProjectCount + 1,
    }));
    analyticsService.track("project_created", { mode: "cloud" });
    track("project_created", { source: "cloud" });
    return project;
  },

  async deleteProject(id) {
    await projectService.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      cloudProjectCount: Math.max(0, s.cloudProjectCount - 1),
    }));
    analyticsService.track("project_deleted");
  },

  async duplicateProject(id) {
    const copy = await projectService.duplicate(id);
    set((s) => ({
      projects: [copy, ...s.projects],
      cloudProjectCount: s.cloudProjectCount + 1,
    }));
    analyticsService.track("project_duplicated");
    return copy;
  },

  async renameProject(id, name) {
    await projectService.update(id, { name });
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  },

  /* ── Plan limits ───────────────────────────────────────── */

  canCreateCloudProject() {
    return get().cloudProjectCount < FREE_PLAN_CLOUD_LIMIT;
  },
}));
