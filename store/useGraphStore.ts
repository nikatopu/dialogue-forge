"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type {
  ForgeNode,
  DialogueEdge,
  ForgeNodeType,
  CharacterNodeData,
  ActionNodeData,
  StartNodeData,
  AttributeDefinition,
  AttributeType,
  SerialNode,
  SerialEdge,
} from "@/types";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultCharacterData(): CharacterNodeData {
  return {
    name: "",
    dialogue: "",
    emotion: "",
    attributeSchema: [],
    attributes: {},
  };
}

function defaultActionData(): ActionNodeData {
  return {
    actionType: "trigger",
    label: "New Action",
    attributeSchema: [],
    attributes: {},
  };
}

function defaultStartData(): StartNodeData {
  return { name: "Entry Point" };
}

interface GraphSnapshot {
  nodes: ForgeNode[];
  edges: DialogueEdge[];
}

/** Push current graph onto the past stack and clear redo */
function snap(
  nodes: ForgeNode[],
  edges: DialogueEdge[],
  past: GraphSnapshot[],
): Pick<GraphStore, "past" | "future"> {
  return {
    past: [...past.slice(-49), { nodes, edges }],
    future: [],
  };
}

interface GraphStore {
  nodes: ForgeNode[];
  edges: DialogueEdge[];

  /* Undo/redo */
  past: GraphSnapshot[];
  future: GraphSnapshot[];
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;

  /* Clipboard — stores a subgraph (nodes + edges between them) */
  clipboard: { nodes: ForgeNode[]; edges: DialogueEdge[] } | null;
  copySelected: (nodeIds: string[]) => void;
  pasteSelected: (offset?: { x: number; y: number }) => string[];

  /* Bulk delete */
  removeNodes: (nodeIds: string[], edgeIds?: string[]) => void;

  /* React Flow change handlers */
  onNodesChange: (changes: NodeChange<ForgeNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  /* Node CRUD */
  addNode: (type: ForgeNodeType, position: { x: number; y: number }) => string;
  updateNodeData: (
    id: string,
    patch: Partial<CharacterNodeData | ActionNodeData>,
  ) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;

  /* Attribute schema management */
  addAttribute: (
    nodeId: string,
    def: Omit<AttributeDefinition, "id">,
  ) => string;
  removeAttribute: (nodeId: string, attrId: string) => void;
  renameAttribute: (nodeId: string, attrId: string, name: string) => void;
  changeAttributeType: (
    nodeId: string,
    attrId: string,
    type: AttributeType,
    options?: string[],
  ) => void;
  setAttributeOptions: (
    nodeId: string,
    attrId: string,
    options: string[],
  ) => void;

  /* Attribute value management */
  setAttributeValue: (nodeId: string, attrId: string, value: unknown) => void;

  /* Edge CRUD */
  updateEdgeLabel: (id: string, optionText: string) => void;
  removeEdge: (id: string) => void;
  setJumpTarget: (sourceId: string, targetId: string | null) => void;

  /* Layout */
  setNodePositions: (
    positions: Record<string, { x: number; y: number }>,
  ) => void;

  /* Bulk operations */
  loadGraph: (nodes: SerialNode[], edges: SerialEdge[]) => void;
  clearGraph: () => void;
}

function patchNode(
  nodes: ForgeNode[],
  id: string,
  patchFn: (
    data: CharacterNodeData | ActionNodeData,
  ) => CharacterNodeData | ActionNodeData,
): ForgeNode[] {
  return nodes.map((n) =>
    n.id === id
      ? ({
          ...n,
          data: patchFn(n.data as CharacterNodeData | ActionNodeData),
        } as ForgeNode)
      : n,
  );
}

export const useGraphStore = create<GraphStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      past: [],
      future: [],
      clipboard: null,

      /* ── Undo / redo ── */

      saveSnapshot: () => set((s) => snap(s.nodes, s.edges, s.past)),

      undo: () =>
        set((s) => {
          if (s.past.length === 0) return s;
          const prev = s.past[s.past.length - 1];
          return {
            past: s.past.slice(0, -1),
            future: [
              { nodes: s.nodes, edges: s.edges },
              ...s.future.slice(0, 49),
            ],
            nodes: prev.nodes,
            edges: prev.edges,
          };
        }),

      redo: () =>
        set((s) => {
          if (s.future.length === 0) return s;
          const next = s.future[0];
          return {
            past: [...s.past.slice(-49), { nodes: s.nodes, edges: s.edges }],
            future: s.future.slice(1),
            nodes: next.nodes,
            edges: next.edges,
          };
        }),

      /* ── Clipboard ── */

      copySelected: (nodeIds) => {
        const { nodes, edges } = get();
        const nodeSet = new Set(nodeIds);
        const selectedNodes = nodes.filter((n) => nodeSet.has(n.id));
        const selectedEdges = edges.filter(
          (e) => nodeSet.has(e.source) && nodeSet.has(e.target),
        );
        if (selectedNodes.length > 0) {
          set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
        }
      },

      pasteSelected: (offset = { x: 40, y: 40 }) => {
        const { clipboard } = get();
        if (!clipboard || clipboard.nodes.length === 0) return [];

        const idMap = new Map<string, string>();
        const newNodes: ForgeNode[] = clipboard.nodes.map((n) => {
          const newId = uid(n.type as string);
          idMap.set(n.id, newId);
          return {
            ...n,
            id: newId,
            position: {
              x: n.position.x + offset.x,
              y: n.position.y + offset.y,
            },
            selected: true,
          };
        });

        const newEdges: DialogueEdge[] = clipboard.edges
          .filter((e) => idMap.has(e.source) && idMap.has(e.target))
          .map((e) => ({
            ...e,
            id: uid("edge"),
            source: idMap.get(e.source)!,
            target: idMap.get(e.target)!,
            selected: true,
          }));

        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: [
            ...s.nodes.map((n) => ({ ...n, selected: false })),
            ...newNodes,
          ],
          edges: [
            ...s.edges.map((e) => ({ ...e, selected: false })),
            ...newEdges,
          ],
        }));

        return newNodes.map((n) => n.id);
      },

      removeNodes: (nodeIds, edgeIds = []) => {
        const nodeSet = new Set(nodeIds);
        const edgeSet = new Set(edgeIds);
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: s.nodes.filter((n) => !nodeSet.has(n.id)),
          edges: s.edges.filter(
            (e) =>
              !edgeSet.has(e.id) &&
              !nodeSet.has(e.source) &&
              !nodeSet.has(e.target),
          ),
        }));
      },

      /* ── React Flow handlers ── */

      onNodesChange: (changes) =>
        set((s) => ({
          nodes: applyNodeChanges(changes, s.nodes) as ForgeNode[],
        })),

      onEdgesChange: (changes) =>
        set((s) => ({
          edges: applyEdgeChanges(changes, s.edges) as DialogueEdge[],
        })),

      onConnect: (connection) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          edges: rfAddEdge(
            {
              ...connection,
              type: "dialogue",
              animated: false,
              data: { optionText: "", conditions: {}, metadata: {} },
            },
            s.edges,
          ) as DialogueEdge[],
        })),

      /* ── Node CRUD ── */

      addNode: (type, position) => {
        const id = uid(type);
        const node: ForgeNode =
          type === "character"
            ? { id, type: "character", position, data: defaultCharacterData() }
            : type === "start"
            ? { id, type: "start", position, data: defaultStartData() }
            : { id, type: "action", position, data: defaultActionData() };
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: [...s.nodes, node],
        }));
        return id;
      },

      updateNodeData: (id, patch) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: patchNode(s.nodes, id, (data) => ({ ...data, ...patch })),
        })),

      removeNode: (id) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: s.nodes.filter((n) => n.id !== id),
          edges: s.edges.filter((e) => e.source !== id && e.target !== id),
        })),

      duplicateNode: (id) => {
        const src = get().nodes.find((n) => n.id === id);
        if (!src) return;
        const newId = uid(src.type as string);
        const clone: ForgeNode = {
          ...src,
          id: newId,
          position: { x: src.position.x + 32, y: src.position.y + 32 },
          selected: false,
        };
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: [...s.nodes, clone],
        }));
      },

      /* ── Attribute schema ── */

      addAttribute: (nodeId, def) => {
        const attrId = uid("attr");
        const full: AttributeDefinition = { ...def, id: attrId };
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: patchNode(s.nodes, nodeId, (data) => ({
            ...data,
            attributeSchema: [...(data.attributeSchema ?? []), full],
            attributes: {
              ...data.attributes,
              [attrId]: def.defaultValue ?? getDefaultForType(def.type),
            },
          })),
        }));
        return attrId;
      },

      removeAttribute: (nodeId, attrId) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: patchNode(s.nodes, nodeId, (data) => {
            const { [attrId]: _, ...rest } = data.attributes;
            return {
              ...data,
              attributeSchema: (data.attributeSchema ?? []).filter(
                (a) => a.id !== attrId,
              ),
              attributes: rest,
            };
          }),
        })),

      renameAttribute: (nodeId, attrId, name) =>
        set((s) => ({
          nodes: patchNode(s.nodes, nodeId, (data) => ({
            ...data,
            attributeSchema: (data.attributeSchema ?? []).map((a) =>
              a.id === attrId ? { ...a, name } : a,
            ),
          })),
        })),

      changeAttributeType: (nodeId, attrId, type, options) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: patchNode(s.nodes, nodeId, (data) => ({
            ...data,
            attributeSchema: (data.attributeSchema ?? []).map((a) =>
              a.id === attrId
                ? { ...a, type, options: options ?? a.options }
                : a,
            ),
            attributes: {
              ...data.attributes,
              [attrId]: getDefaultForType(type),
            },
          })),
        })),

      setAttributeOptions: (nodeId, attrId, options) =>
        set((s) => ({
          nodes: patchNode(s.nodes, nodeId, (data) => ({
            ...data,
            attributeSchema: (data.attributeSchema ?? []).map((a) =>
              a.id === attrId ? { ...a, options } : a,
            ),
          })),
        })),

      setAttributeValue: (nodeId, attrId, value) =>
        set((s) => ({
          nodes: patchNode(s.nodes, nodeId, (data) => ({
            ...data,
            attributes: { ...data.attributes, [attrId]: value },
          })),
        })),

      /* ── Edges ── */

      updateEdgeLabel: (id, optionText) =>
        set((s) => ({
          edges: s.edges.map((e) =>
            e.id === id
              ? ({ ...e, data: { ...e.data, optionText } } as DialogueEdge)
              : e,
          ),
        })),

      removeEdge: (id) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          edges: s.edges.filter((e) => e.id !== id),
        })),

      setJumpTarget: (sourceId, targetId) =>
        set((s) => {
          const withoutOld = s.edges.filter((e) => e.source !== sourceId);
          const newEdges =
            targetId === null
              ? withoutOld
              : ([
                  ...withoutOld,
                  {
                    id: uid("edge"),
                    source: sourceId,
                    target: targetId,
                    type: "dialogue",
                    animated: false,
                    data: { optionText: "", conditions: {}, metadata: {} },
                  } satisfies DialogueEdge,
                ] as DialogueEdge[]);
          return { ...snap(s.nodes, s.edges, s.past), edges: newEdges };
        }),

      /* ── Layout ── */

      setNodePositions: (positions) =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: s.nodes.map((n) =>
            positions[n.id] ? { ...n, position: positions[n.id] } : n,
          ),
        })),

      /* ── Bulk ── */

      loadGraph: (nodes, edges) =>
        set({
          nodes: nodes.map((n) =>
            n.type === "character"
              ? ({ ...n, data: n.data as CharacterNodeData } as ForgeNode)
              : n.type === "start"
              ? ({ ...n, data: n.data as StartNodeData } as ForgeNode)
              : ({ ...n, data: n.data as ActionNodeData } as ForgeNode),
          ),
          edges: edges.map((e) => ({ ...e }) as DialogueEdge),
          past: [],
          future: [],
        }),

      clearGraph: () =>
        set((s) => ({
          ...snap(s.nodes, s.edges, s.past),
          nodes: [],
          edges: [],
        })),
    }),
    {
      name: "dialogue-forge-graph",
      partialize: (s) => ({
        nodes: s.nodes.map(({ id, type, position, data }) => ({
          id,
          type,
          position,
          data,
        })),
        edges: s.edges.map(({ id, source, target, type, data }) => ({
          id,
          source,
          target,
          type,
          data,
        })),
      }),
    },
  ),
);

function getDefaultForType(type: AttributeType): unknown {
  switch (type) {
    case "text":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "dropdown":
      return "";
    case "color":
      return "#6366f1";
    case "list":
      return [];
    case "object":
      return {};
  }
}

export type { AttributeType };
