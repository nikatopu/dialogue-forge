import type { SerialNode, SerialEdge } from "@/types";

export type ProjectVersion = string;

export const CURRENT_VERSION: ProjectVersion = "1.3.2";

export interface VersionedGraph {
  version: ProjectVersion;
  nodes: SerialNode[];
  edges: SerialEdge[];
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
