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
    // Migrate old trigger action nodes: add event + executionMode.
    // (This step also used to seed a `category`; that field was retired in
    // v1.5.0, so it is no longer written here.)
    from: "1.1.0",
    to: "1.2.0",
    up(graph): VersionedGraph {
      return {
        ...graph,
        version: "1.2.0",
        nodes: graph.nodes.map((node): SerialNode => {
          if (node.type === "action") {
            const d = node.data as Record<string, unknown>;
            if (d.actionType === "trigger" && !d.executionMode) {
              return {
                ...node,
                data: {
                  ...d,
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
  {
    // v1.4.1: add description field to variables, normalize edge conditions to null
    from: "1.4.0",
    to: "1.4.1",
    up(graph): VersionedGraph {
      // Ensure all variables have description field (new optional field)
      const variables = (
        (graph.variables ?? []) as unknown as Record<string, unknown>[]
      ).map((v) => ({
        ...v,
        description: v.description ?? "",
      })) as unknown as VersionedGraph["variables"];

      // Ensure edges have conditions: null (not undefined)
      const edges = (
        (graph.edges ?? []) as unknown as Record<string, unknown>[]
      ).map((e) => ({
        ...e,
        data: {
          ...((e.data as Record<string, unknown>) ?? {}),
          conditions: ((e.data as Record<string, unknown>) ?? {}).conditions ?? null,
        },
      })) as unknown as VersionedGraph["edges"];

      return { ...graph, version: "1.4.1", variables, edges };
    },
  },
  {
    // v1.4.2: triggers lose their category. A trigger now has one job — emit a
    // single named event — so `category` / `triggerCategory` are dropped and any
    // trigger without an event name inherits its label as the event name.
    from: "1.4.1",
    to: "1.4.2",
    up(graph): VersionedGraph {
      return {
        ...graph,
        version: "1.4.2",
        nodes: graph.nodes.map((node): SerialNode => {
          if (node.type !== "action") return node;

          const d = node.data as Record<string, unknown>;
          if (d.actionType !== "trigger") return node;

          // `triggerCategory` is a legacy alias that shipped in some templates.
          const rest: Record<string, unknown> = { ...d };
          delete rest.category;
          delete rest.triggerCategory;

          const event =
            typeof d.event === "string" && d.event.trim() !== ""
              ? d.event
              : typeof d.label === "string"
                ? d.label
                : "";

          return {
            ...node,
            data: {
              ...rest,
              event,
              params:
                d.params && typeof d.params === "object"
                  ? (d.params as Record<string, string>)
                  : {},
              executionMode:
                typeof d.executionMode === "string" ? d.executionMode : "immediate",
            },
          } as SerialNode;
        }),
      };
    },
  },
];
