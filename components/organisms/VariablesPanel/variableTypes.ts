import type { ElementType } from "react";
import { Hash, ToggleLeft, Type, List, Braces } from "lucide-react";
import type { VariableType } from "@/types";

export const TYPE_CONFIG: Record<
  VariableType,
  { icon: ElementType; label: string; color: string }
> = {
  number: { icon: Hash, label: "Number", color: "oklch(0.72 0.18 220)" },
  float: { icon: Hash, label: "Float", color: "oklch(0.72 0.18 240)" },
  boolean: {
    icon: ToggleLeft,
    label: "Boolean",
    color: "oklch(0.72 0.18 155)",
  },
  string: { icon: Type, label: "String", color: "oklch(0.72 0.18 50)" },
  list: { icon: List, label: "List", color: "oklch(0.72 0.18 290)" },
  object: { icon: Braces, label: "Object", color: "oklch(0.72 0.18 30)" },
};

export const VARIABLE_TYPES: VariableType[] = [
  "number",
  "float",
  "boolean",
  "string",
  "list",
  "object",
];
