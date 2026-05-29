import { CharacterNode } from "@/components/organisms/CharacterNode";
import { ActionNode } from "@/components/organisms/ActionNode";
import { StartNode } from "@/components/organisms/StartNode";

export const nodeTypes = {
  character: CharacterNode,
  action: ActionNode,
  start: StartNode,
} as const;

export { CharacterNode, ActionNode, StartNode };
