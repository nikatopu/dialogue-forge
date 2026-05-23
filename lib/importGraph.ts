import { z } from "zod";
import type { SerialNode, SerialEdge } from "@/types";

/* ── Zod schemas for import (lenient — allow empty strings) ── */

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const attributeDefinitionImportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "boolean", "dropdown", "color", "list", "object"]),
  options: z.array(z.string()).optional(),
  defaultValue: z.unknown().optional(),
});

const characterDataImportSchema = z.object({
  name: z.string().catch(""),
  dialogue: z.string().catch(""),
  emotion: z.string().optional(),
  portrait: z.string().optional(),
  attributeSchema: z.array(attributeDefinitionImportSchema).catch([]),
  attributes: z.record(z.string(), z.unknown()).catch({}),
}).passthrough();

const actionDataImportSchema = z.object({
  actionType: z.enum(["trigger", "branch", "jump", "end", "custom"]).catch("trigger"),
  label: z.string().catch(""),
  jumpTarget: z.string().optional(),
  /* Trigger fields — optional for backward compat */
  category: z.enum(["game", "variable", "audio", "animation", "ui", "custom"]).optional(),
  event: z.string().optional(),
  params: z.record(z.string(), z.string()).optional(),
  executionMode: z.enum(["immediate", "beforeNext", "afterNext"]).optional(),
  attributeSchema: z.array(attributeDefinitionImportSchema).catch([]),
  attributes: z.record(z.string(), z.unknown()).catch({}),
}).passthrough()
  /* Migration: old triggers (no category) get category="custom", event=label */
  .transform((d) => {
    if (d.actionType === "trigger" && !d.category) {
      return {
        ...d,
        category: "custom" as const,
        event: d.event ?? d.label ?? "",
        executionMode: d.executionMode ?? ("immediate" as const),
      };
    }
    return d;
  });

const startDataImportSchema = z.object({
  name: z.string().catch(""),
}).passthrough();

const serialNodeSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("character"),
    position: positionSchema,
    data: characterDataImportSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("action"),
    position: positionSchema,
    data: actionDataImportSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("start"),
    position: positionSchema,
    data: startDataImportSchema,
  }),
]);

const serialEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.object({
    optionText: z.string().catch(""),
    conditions: z.record(z.string(), z.unknown()).catch({}),
    metadata: z.record(z.string(), z.unknown()).catch({}),
  }).catch({ optionText: "", conditions: {}, metadata: {} }),
});

const graphImportSchema = z.object({
  version: z.literal(1),
  name: z.string().optional(),
  nodes: z.array(serialNodeSchema),
  edges: z.array(serialEdgeSchema),
});

export interface ImportResult {
  ok: true;
  nodes: SerialNode[];
  edges: SerialEdge[];
  name?: string;
}

export interface ImportError {
  ok: false;
  error: string;
}

export function parseGraphJson(raw: string): ImportResult | ImportError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }

  const result = graphImportSchema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: `Invalid file format: ${first?.message ?? "unknown error"} at ${first?.path.join(".")}`,
    };
  }

  return {
    ok: true,
    nodes: result.data.nodes as SerialNode[],
    edges: result.data.edges as SerialEdge[],
    name: result.data.name,
  };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
