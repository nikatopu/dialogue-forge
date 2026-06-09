import type { SerialNode, SerialEdge, ProjectVariable } from "@/types";

export type ProjectVersion = string;

export const CURRENT_VERSION: ProjectVersion = "1.4.0";

export interface VersionedGraph {
  version: ProjectVersion;
  nodes: SerialNode[];
  edges: SerialEdge[];
  variables?: ProjectVariable[];
  metadata?: Record<string, unknown>;
}

export interface Migration {
  from: ProjectVersion;
  to: ProjectVersion;
  up: (graph: VersionedGraph) => VersionedGraph;
}

export interface MigrationReport {
  originalVersion: ProjectVersion;
  finalVersion: ProjectVersion;
  appliedMigrations: string[];
  repairs: string[];
  removedNodes: number;
  removedEdges: number;
  wasModified: boolean;
}
