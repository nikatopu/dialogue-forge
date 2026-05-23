import { CharacterNode } from "./CharacterNode";
import { ActionNode } from "./ActionNode";
import { StartNode } from "./StartNode";

export const nodeTypes = {
  character: CharacterNode,
  action: ActionNode,
  start: StartNode,
} as const;

export { CharacterNode, ActionNode, StartNode };
