import type { Migration, VersionedGraph } from "@/types/migrations";
import type { SerialNode } from "@/types";

/**
 * Migration chain. Each entry transforms a graph from one version to the next.
 * Migrations are additive and idempotent — fields already present are kept as-is.
 */
export const migrations: Migration[] = [
  {
    // Add attributeSchema + attributes to character and action nodes
    from: "1.0.0",
    to: "1.1.0",
    up(graph): VersionedGraph {
      return {
        ...graph,
        version: "1.1.0",
        nodes: graph.nodes.map((node): SerialNode => {
          if (node.type === "character" || node.type === "action") {
            const d = node.data as Record<string, unknown>;
            return {
              ...node,
              data: {
                ...d,
                attributeSchema: Array.isArray(d.attributeSchema)
                  ? d.attributeSchema
                  : [],
                attributes:
                  d.attributes && typeof d.attributes === "object"
                    ? d.attributes
                    : {},
              },
            } as SerialNode;
          }
          return node;
        }),
      };
    },
  },
  {
    // Migrate old trigger action nodes: add category, event, executionMode
    from: "1.1.0",
    to: "1.2.0",
    up(graph): VersionedGraph {
      return {
        ...graph,
        version: "1.2.0",
        nodes: graph.nodes.map((node): SerialNode => {
          if (node.type === "action") {
            const d = node.data as Record<string, unknown>;
            if (d.actionType === "trigger" && !d.category) {
              return {
                ...node,
                data: {
                  ...d,
                  category: "custom",
                  event:
                    typeof d.event === "string"
                      ? d.event
                      : typeof d.label === "string"
                        ? d.label
                        : "",
                  executionMode: "immediate",
                },
              } as SerialNode;
            }
          }
          return node;
        }),
      };
    },
  },
  {
    // Ensure all edges have the full data structure
    from: "1.2.0",
    to: "1.3.0",
    up(graph): VersionedGraph {
      return {
        ...graph,
        version: "1.3.0",
        edges: graph.edges.map((edge) => {
          const d = (edge.data ?? {}) as Record<string, unknown>;
          return {
            ...edge,
            data: {
              optionText: typeof d.optionText === "string" ? d.optionText : "",
              conditions:
                d.conditions && typeof d.conditions === "object"
                  ? (d.conditions as Record<string, unknown>)
                  : {},
              metadata:
                d.metadata && typeof d.metadata === "object"
                  ? (d.metadata as Record<string, unknown>)
                  : {},
            },
          };
        }),
      };
    },
  },
  {
    // No-op patch: bridge 1.3.0 → 1.3.2 (bug-fix releases, no schema change)
    from: "1.3.0",
    to: "1.3.2",
    up(graph): VersionedGraph {
      return { ...graph, version: "1.3.2" };
    },
  },
  {
    // v1.4.0: add conditionGroup field to edges (null = no conditions)
    from: "1.3.2",
    to: "1.4.0",
    up(graph): VersionedGraph {
      const g = graph as unknown as Record<string, unknown>;
      return {
        ...graph,
        version: "1.4.0",
        variables: Array.isArray(g.variables)
          ? (g.variables as VersionedGraph["variables"])
          : [],
        edges: graph.edges.map((edge) => {
          const d = (edge.data ?? {}) as Record<string, unknown>;
          return {
            ...edge,
            data: {
              optionText: typeof d.optionText === "string" ? d.optionText : "",
              conditions:
                d.conditions && typeof d.conditions === "object"
                  ? (d.conditions as Record<string, unknown>)
                  : {},
              conditionGroup: d.conditionGroup != null
                ? (d.conditionGroup as import("@/types").ConditionGroup)
                : null,
              metadata:
                d.metadata && typeof d.metadata === "object"
                  ? (d.metadata as Record<string, unknown>)
                  : {},
            },
          };
        }),
      };
    },
  },
];
