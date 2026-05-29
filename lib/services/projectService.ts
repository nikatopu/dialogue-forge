"use client";

import { createClient } from "@/lib/supabase/client";
import type { CloudProject } from "@/types";
import type { Json, ProjectInsert, ProjectUpdate } from "@/lib/supabase/types";
import { migrateProject, CURRENT_VERSION } from "@/lib/migrations";

/* ─── Helpers ─────────────────────────────────────────────── */

function toCloudProject(row: {
  id: string;
  user_id: string;
  name: string;
  graph: unknown;
  preview_image: string | null;
  mode: string;
  is_template: boolean;
  theme?: string | null;
  created_at: string;
  updated_at: string;
}): CloudProject {
  const graph = (row.graph as { nodes?: unknown[]; edges?: unknown[] }) ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    graph: {
      nodes: (graph.nodes ?? []) as CloudProject["graph"]["nodes"],
      edges: (graph.edges ?? []) as CloudProject["graph"]["edges"],
    },
    previewImage: row.preview_image,
    mode: row.mode as CloudProject["mode"],
    isTemplate: row.is_template,
    theme: row.theme ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Run the migration pipeline on a raw graph from the database.
 * Returns the migrated graph and whether it was modified (needs re-saving).
 */
function migrateGraph(
  projectId: string,
  raw: unknown,
): { nodes: CloudProject["graph"]["nodes"]; edges: CloudProject["graph"]["edges"]; version: string; wasModified: boolean } {
  const { graph, report } = migrateProject(raw, projectId);
  return {
    nodes: graph.nodes as CloudProject["graph"]["nodes"],
    edges: graph.edges as CloudProject["graph"]["edges"],
    version: graph.version,
    wasModified: report.wasModified,
  };
}

/* ─── Plan limits ─────────────────────────────────────────── */

export const FREE_PLAN_CLOUD_LIMIT = 5;

/* ─── CRUD ────────────────────────────────────────────────── */

export const projectService = {
  /** List all projects for the current user, newest first */
  async list(): Promise<CloudProject[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toCloudProject);
  },

  /** Get a single project by ID — runs migration pipeline before returning */
  async get(id: string): Promise<CloudProject | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;

    const project = toCloudProject(data);
    const { nodes, edges, version, wasModified } = migrateGraph(id, data.graph);

    project.graph = { version, nodes, edges };

    // Silently persist the repaired/migrated graph back to the cloud
    if (wasModified) {
      try {
        const supabaseInner = createClient();
        await supabaseInner
          .from("projects")
          .update({ graph: project.graph as unknown as Json })
          .eq("id", id);
      } catch {
        // Non-fatal — editor still gets the migrated data
      }
    }

    return project;
  },

  /** Create a new project */
  async create(
    payload: Omit<ProjectInsert, "user_id">,
  ): Promise<CloudProject> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Stamp version on new projects
    const graph = payload.graph as Record<string, unknown> | undefined;
    const stampedGraph = graph
      ? { version: CURRENT_VERSION, ...graph }
      : { version: CURRENT_VERSION, nodes: [], edges: [] };

    const { data, error } = await supabase
      .from("projects")
      .insert({ ...payload, graph: stampedGraph as unknown as Json, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return toCloudProject(data);
  },

  /** Update an existing project */
  async update(id: string, patch: ProjectUpdate): Promise<CloudProject> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCloudProject(data);
  },

  /** Save graph data (used by autosave) — always includes version */
  async saveGraph(
    id: string,
    graph: CloudProject["graph"],
    name: string,
  ): Promise<void> {
    const supabase = createClient();
    const versionedGraph = { version: CURRENT_VERSION, ...graph };
    const { error } = await supabase
      .from("projects")
      .update({ graph: versionedGraph as unknown as Json, name })
      .eq("id", id);

    if (error) throw error;
  },

  /** Delete a project */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /** Duplicate a project */
  async duplicate(id: string): Promise<CloudProject> {
    const original = await projectService.get(id);
    if (!original) throw new Error("Project not found");

    return projectService.create({
      name: `${original.name} (copy)`,
      graph: original.graph as unknown as ProjectInsert["graph"],
      mode: "cloud",
    });
  },

  /** Count cloud projects for the current user (for plan limits) */
  async countCloud(): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("mode", "cloud");

    if (error) return 0;
    return count ?? 0;
  },
};
