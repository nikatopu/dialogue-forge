import { CharacterNode } from "./CharacterNode";
import { ActionNode } from "./ActionNode";

export const nodeTypes = {
  character: CharacterNode,
  action: ActionNode,
} as const;

export { CharacterNode, ActionNode };
