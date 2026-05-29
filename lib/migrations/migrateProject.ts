import { CURRENT_VERSION } from "@/types/migrations";
import type { VersionedGraph, MigrationReport } from "@/types/migrations";
import { migrations } from "./registry";
import { repairGraph } from "./repair";
import { validateGraph } from "./validate";

const BACKUP_PREFIX = "df-backup";
const MAX_BACKUPS = 3;

/** Detect the version from a raw graph object */
function detectVersion(raw: Record<string, unknown>): string {
  const v = raw.version;
  if (typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v)) return v;
  // Legacy numeric version (old .forge.json exports used version: 1)
  if (typeof v === "number") return "1.0.0";
  return "1.0.0";
}

/** Normalize any raw graph-like input into a VersionedGraph */
function normalizeRaw(raw: unknown): VersionedGraph {
  if (!raw || typeof raw !== "object") {
    return { version: "1.0.0", nodes: [], edges: [], metadata: {} };
  }
  const g = raw as Record<string, unknown>;
  return {
    version: detectVersion(g),
    nodes: Array.isArray(g.nodes) ? (g.nodes as VersionedGraph["nodes"]) : [],
    edges: Array.isArray(g.edges) ? (g.edges as VersionedGraph["edges"]) : [],
    metadata:
      g.metadata && typeof g.metadata === "object"
        ? (g.metadata as Record<string, unknown>)
        : {},
  };
}

/** Build the ordered list of migrations needed to reach CURRENT_VERSION */
function buildChain(fromVersion: string) {
  const chain = [];
  let current = fromVersion;
  while (current !== CURRENT_VERSION) {
    const step = migrations.find((m) => m.from === current);
    if (!step) break;
    chain.push(step);
    current = step.to;
  }
  return chain;
}

function saveBackup(projectId: string | undefined, graph: VersionedGraph): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${BACKUP_PREFIX}-${projectId ?? "local"}`;
    const existing: unknown[] = JSON.parse(
      localStorage.getItem(key) ?? "[]",
    );
    existing.unshift({
      savedAt: new Date().toISOString(),
      version: graph.version,
      graph,
    });
    localStorage.setItem(
      key,
      JSON.stringify(existing.slice(0, MAX_BACKUPS)),
    );
  } catch {
    // Backup failure is non-fatal
  }
}

/**
 * Main migration pipeline. Always returns a usable graph.
 *
 * Flow: normalize → backup (if needed) → migrate → repair → validate → report
 */
export function migrateProject(
  raw: unknown,
  projectId?: string,
): { graph: VersionedGraph; report: MigrationReport } {
  const graph = normalizeRaw(raw);
  const originalVersion = graph.version;

  const report: MigrationReport = {
    originalVersion,
    finalVersion: originalVersion,
    appliedMigrations: [],
    repairs: [],
    removedNodes: 0,
    removedEdges: 0,
    wasModified: false,
  };

  if (originalVersion !== CURRENT_VERSION) {
    saveBackup(projectId, graph);
  }

  // Run migrations sequentially
  let current: VersionedGraph = graph;
  const chain = buildChain(originalVersion);

  for (const migration of chain) {
    try {
      current = migration.up(current);
      report.appliedMigrations.push(`${migration.from} → ${migration.to}`);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Migrations] Step ${migration.from} → ${migration.to} failed:`,
          err,
        );
      }
      // Keep current state and attempt to continue
    }
  }

  // Repair structural issues
  current = repairGraph(current, report);
  current = { ...current, version: CURRENT_VERSION };

  // Validate post-repair (dev logging only)
  if (process.env.NODE_ENV === "development") {
    const { warnings } = validateGraph(current);
    if (warnings.length > 0) {
      console.warn("[Migrations] Post-repair warnings:", warnings);
    }
  }

  report.finalVersion = CURRENT_VERSION;
  report.wasModified =
    originalVersion !== CURRENT_VERSION ||
    report.repairs.length > 0 ||
    report.removedNodes > 0 ||
    report.removedEdges > 0;

  if (process.env.NODE_ENV === "development" && report.wasModified) {
    console.group("[Dialogue Forge] Migration");
    console.log(`${report.originalVersion} → ${report.finalVersion}`);
    if (report.appliedMigrations.length > 0)
      console.log("Applied:", report.appliedMigrations.join(", "));
    if (report.repairs.length > 0)
      console.log("Repairs:", report.repairs);
    if (report.removedNodes > 0)
      console.log(`Removed ${report.removedNodes} invalid node(s)`);
    if (report.removedEdges > 0)
      console.log(`Removed ${report.removedEdges} invalid edge(s)`);
    console.groupEnd();
  }

  return { graph: current, report };
}
