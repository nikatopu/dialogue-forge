import { defaultValueForType } from "@/store/useVariableStore";
import { parseVariableReferences } from "@/lib/interpolation/parseVariableReferences";
import type {
  ProjectVariable,
  VariableType,
  CharacterNodeData,
  ForgeNode,
} from "@/types";

export interface EditingState {
  id: string | null; // null = creating new
  name: string;
  type: VariableType;
  defaultValue: string;
  description: string;
  /** For list type: the parsed array being edited */
  listItems: string[];
  /** For list type: the current "add item" input value */
  listInput: string;
  /** For object type: the parsed entries being edited */
  objectEntries: Array<{ key: string; value: string }>;
  /** For object type: show raw JSON textarea */
  objectJsonMode: boolean;
  /** For object type: raw JSON textarea text */
  objectJsonText: string;
}

export type VariableDefaultValue =
  | number
  | boolean
  | string
  | string[]
  | Record<string, unknown>;

export function blankEdit(): EditingState {
  return {
    id: null,
    name: "",
    type: "number",
    defaultValue: "0",
    description: "",
    listItems: [],
    listInput: "",
    objectEntries: [],
    objectJsonMode: false,
    objectJsonText: "{}",
  };
}

export function editFromVariable(v: ProjectVariable): EditingState {
  let listItems: string[] = [];
  let objectEntries: Array<{ key: string; value: string }> = [];
  let objectJsonText = "{}";
  let defaultValue = String(v.defaultValue);

  if (v.type === "list") {
    if (Array.isArray(v.defaultValue)) {
      listItems = v.defaultValue as string[];
    }
    defaultValue = "";
  } else if (v.type === "object") {
    const obj =
      v.defaultValue &&
      typeof v.defaultValue === "object" &&
      !Array.isArray(v.defaultValue)
        ? (v.defaultValue as Record<string, unknown>)
        : {};
    objectEntries = Object.entries(obj).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    objectJsonText = JSON.stringify(obj, null, 2);
    defaultValue = "";
  }

  return {
    id: v.id,
    name: v.name,
    type: v.type,
    defaultValue,
    description: v.description ?? "",
    listItems,
    listInput: "",
    objectEntries,
    objectJsonMode: false,
    objectJsonText,
  };
}

/** Reset the value-related fields when the type changes. */
export function editWithType(
  editing: EditingState,
  type: VariableType,
): EditingState {
  return {
    ...editing,
    type,
    defaultValue: String(defaultValueForType(type)),
    listItems: [],
    listInput: "",
    objectEntries: [],
    objectJsonMode: false,
    objectJsonText: "{}",
  };
}

/** Coerce the editing form's string-based fields into a concrete default value. */
export function coerceDefaultValue(
  editing: EditingState,
): VariableDefaultValue {
  if (editing.type === "number") {
    return isNaN(Number(editing.defaultValue))
      ? 0
      : Number(editing.defaultValue);
  }
  if (editing.type === "float") {
    return isNaN(parseFloat(editing.defaultValue))
      ? 0.0
      : parseFloat(editing.defaultValue);
  }
  if (editing.type === "boolean") {
    return editing.defaultValue === "true";
  }
  if (editing.type === "list") {
    return editing.listItems;
  }
  if (editing.type === "object") {
    if (editing.objectJsonMode) {
      try {
        return JSON.parse(editing.objectJsonText) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    const obj: Record<string, string> = {};
    for (const { key, value } of editing.objectEntries) {
      if (key.trim()) obj[key.trim()] = value;
    }
    return obj;
  }
  return editing.defaultValue;
}

export function computeDialogueCount(
  variableName: string,
  nodes: ForgeNode[],
): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type !== "character") continue;
    const data = node.data as CharacterNodeData;
    const dialogue = data.dialogue ?? "";
    const refs = parseVariableReferences(dialogue);
    for (const ref of refs) {
      if (ref.path[0] === variableName) count++;
    }
  }
  return count;
}
