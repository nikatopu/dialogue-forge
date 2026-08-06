import type { ElementType } from "react";
import { Hash, ToggleLeft, Type, List, Braces } from "lucide-react";
import type { VariableType } from "@/types";

export const TYPE_CONFIG: Record<
  VariableType,
  { icon: ElementType; label: string; color: string }
> = {
  number: { icon: Hash, label: "Number", color: "var(--accent-blue)" },
  float: { icon: Hash, label: "Float", color: "var(--accent-blue)" },
  boolean: {
    icon: ToggleLeft,
    label: "Boolean",
    color: "var(--accent-green)",
  },
  string: { icon: Type, label: "String", color: "var(--accent-orange)" },
  list: { icon: List, label: "List", color: "var(--accent-violet)" },
  object: { icon: Braces, label: "Object", color: "var(--accent-orange)" },
};

export const VARIABLE_TYPES: VariableType[] = [
  "number",
  "float",
  "boolean",
  "string",
  "list",
  "object",
];
