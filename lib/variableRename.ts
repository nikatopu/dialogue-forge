import { parseVariableReferences } from "@/lib/interpolation/parseVariableReferences";
import type { SerialNode, SerialEdge, CharacterNodeData } from "@/types";

export interface RenameResult {
  nodes: SerialNode[];
  edges: SerialEdge[];
  dialogueUpdated: number;  // count of character nodes updated
}

export function renameVariableInGraph(
  nodes: SerialNode[],
  edges: SerialEdge[],
  oldName: string,
  newName: string,
): RenameResult {
  let dialogueUpdated = 0;

  const updatedNodes = nodes.map((node): SerialNode => {
    if (node.type !== "character") return node;
    const data = node.data as CharacterNodeData;
    const dialogue = data.dialogue ?? "";
    const newDialogue = renameTokensInText(dialogue, oldName, newName);
    if (newDialogue === dialogue) return node;
    dialogueUpdated++;
    return { ...node, data: { ...data, dialogue: newDialogue } };
  });

  return { nodes: updatedNodes, edges, dialogueUpdated };
}

function renameTokensInText(text: string, oldName: string, newName: string): string {
  const tokens = parseVariableReferences(text);
  if (tokens.length === 0) return text;

  let result = text;
  // Process in reverse order to preserve string indices
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.path[0] !== oldName) continue;
    const newPath = [newName, ...token.path.slice(1)].join(".");
    const newToken = `{${newPath}}`;
    result = result.slice(0, token.start) + newToken + result.slice(token.end);
  }
  return result;
}
