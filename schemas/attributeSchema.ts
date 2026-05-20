import { z } from "zod";

export const attributeTypeSchema = z.enum([
  "text",
  "number",
  "boolean",
  "dropdown",
  "color",
  "list",
  "object",
]);

export const attributeDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Attribute name is required"),
  type: attributeTypeSchema,
  options: z.array(z.string()).optional(),
  defaultValue: z.unknown().optional(),
});

export const characterNodeDataSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  portrait: z.string().url().optional().or(z.literal("")),
  dialogue: z.string(),
  emotion: z.string().optional(),
  attributeSchema: z.array(attributeDefinitionSchema),
  attributes: z.record(z.string(), z.unknown()),
});

export const actionNodeDataSchema = z.object({
  actionType: z.enum(["trigger", "branch", "jump", "end", "custom"]),
  label: z.string().min(1, "Action label is required"),
  attributeSchema: z.array(attributeDefinitionSchema),
  attributes: z.record(z.string(), z.unknown()),
});

export const dialogueEdgeDataSchema = z.object({
  optionText: z.string(),
  conditions: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()),
});

export type AttributeDefinitionInput = z.infer<typeof attributeDefinitionSchema>;
