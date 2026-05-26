"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { projectService, FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { analyticsService } from "@/lib/analytics/analyticsService";
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

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      const u = mapUser(session?.user ?? null);
      set({ user: u });
      analyticsService.setUser(u?.id ?? null);
      if (u) {
        get().loadProjects();
      } else {
        set({ projects: [], cloudProjectCount: 0 });
      }
    });
  },

  async signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  },

  async signInWithGitHub() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
