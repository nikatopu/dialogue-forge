import type { SerialNode, SerialEdge, ProjectVariable } from "@/types";

export const DEMO_PROJECT_NAME = "Visual Novel Example";

export const DEMO_VARIABLES: ProjectVariable[] = [
  {
    id: "var-demo-courage",
    name: "playerCourage",
    type: "number",
    defaultValue: 5,
    description: "The hero's courage stat — gates brave dialogue options",
  },
  {
    id: "var-demo-quest",
    name: "questActive",
    type: "boolean",
    defaultValue: false,
    description: "Whether the Shard of Dawn quest has been accepted",
  },
  {
    id: "var-demo-faction",
    name: "playerFaction",
    type: "string",
    defaultValue: "Neutral",
    description: "The hero's current faction alignment",
  },
];

export const DEMO_NODES: SerialNode[] = [
  /* ── Main Story entry ── */
  {
    id: "start-main",
    type: "start",
    position: { x: -460, y: -80 },
    data: { name: "Main Story" },
  },
  {
    id: "char-hero",
    type: "character",
    position: { x: -460, y: 80 },
    data: {
      name: "Hero",
      dialogue: "I've been wandering these ruins for hours. There must be something worth finding here.",
      emotion: "neutral",
      portrait: "",
      attributeSchema: [
        { id: "attr-courage", name: "Courage", type: "number", defaultValue: 7 },
        { id: "attr-faction", name: "Faction", type: "dropdown", options: ["Rebel", "Neutral", "Empire"], defaultValue: "Neutral" },
      ],
      attributes: { "attr-courage": 7, "attr-faction": "Neutral" },
    },
  },
  {
    id: "char-elder",
    type: "character",
    position: { x: -460, y: 240 },
    data: {
      name: "Elder Voss",
      dialogue: "Ah, a wanderer. You seek the Shard of Dawn, no doubt. Few who enter leave unchanged.",
      emotion: "surprised",
      portrait: "",
      attributeSchema: [
        { id: "attr-trust", name: "Trust Level", type: "number", defaultValue: 3 },
      ],
      attributes: { "attr-trust": 3 },
    },
  },
  {
    id: "act-branch-1",
    type: "action",
    position: { x: -460, y: 400 },
    data: {
      actionType: "branch",
      label: "Player Choice",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "char-accept",
    type: "character",
    position: { x: -660, y: 560 },
    data: {
      name: "Hero",
      dialogue: "Tell me everything you know, Elder. I'm ready for whatever waits ahead.",
      emotion: "happy",
      portrait: "",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "char-refuse",
    type: "character",
    position: { x: -260, y: 560 },
    data: {
      name: "Hero",
      dialogue: "I work alone, old man. But I'll keep your warning in mind.",
      emotion: "angry",
      portrait: "",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-trigger-1",
    type: "action",
    position: { x: -660, y: 720 },
    data: {
      actionType: "trigger",
      label: "Unlock Quest",
      category: "game",
      event: "QuestStarted",
      params: { questId: "shard_of_dawn" },
      executionMode: "afterNext",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "char-elder-2",
    type: "character",
    position: { x: -260, y: 720 },
    data: {
      name: "Elder Voss",
      dialogue: "As you wish, wanderer. But the ruins have a way of humbling the proud.",
      emotion: "sad",
      portrait: "",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-set-quest",
    type: "action",
    position: { x: -660, y: 800 },
    data: {
      actionType: "setVariable",
      label: "Set Quest Active",
      variableAction: { variableId: "var-demo-quest", operation: "set", value: true },
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-jump-1",
    type: "action",
    position: { x: -660, y: 960 },
    data: {
      actionType: "jump",
      label: "Loop: Back to Start",
      jumpTarget: "char-hero",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-end-1",
    type: "action",
    position: { x: -260, y: 960 },
    data: {
      actionType: "end",
      label: "End Conversation",
      attributeSchema: [],
      attributes: {},
    },
  },

  /* ── Combat entry ── */
  {
    id: "start-combat",
    type: "start",
    position: { x: 240, y: -80 },
    data: { name: "Combat" },
  },
  {
    id: "act-battle-music",
    type: "action",
    position: { x: 240, y: 80 },
    data: {
      actionType: "trigger",
      label: "Play Battle Music",
      category: "audio",
      event: "PlayMusic",
      params: { track: "battle_theme", volume: "0.8" },
      executionMode: "immediate",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "char-guard",
    type: "character",
    position: { x: 240, y: 240 },
    data: {
      name: "Guard",
      dialogue: "Halt! This area is off-limits. Turn back now.",
      emotion: "angry",
      portrait: "",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-combat-branch",
    type: "action",
    position: { x: 240, y: 400 },
    data: {
      actionType: "branch",
      label: "Player Decision",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "char-fight",
    type: "character",
    position: { x: 80, y: 560 },
    data: {
      name: "Hero",
      dialogue: "I won't back down. Draw your weapon!",
      emotion: "angry",
      portrait: "",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "char-surrender",
    type: "character",
    position: { x: 400, y: 560 },
    data: {
      name: "Hero",
      dialogue: "You're right. I'll find another way.",
      emotion: "neutral",
      portrait: "",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-attack-anim",
    type: "action",
    position: { x: 80, y: 720 },
    data: {
      actionType: "trigger",
      label: "Attack Animation",
      category: "animation",
      event: "Attack",
      params: {},
      executionMode: "beforeNext",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-combat-end",
    type: "action",
    position: { x: 80, y: 880 },
    data: {
      actionType: "end",
      label: "End — Battle",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-retreat-end",
    type: "action",
    position: { x: 400, y: 720 },
    data: {
      actionType: "end",
      label: "End — Retreated",
      attributeSchema: [],
      attributes: {},
    },
  },
];

export const DEMO_EDGES: SerialEdge[] = [
  /* Main Story */
  { id: "e-start-hero", source: "start-main", target: "char-hero", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-hero-elder", source: "char-hero", target: "char-elder", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-elder-branch", source: "char-elder", target: "act-branch-1", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-branch-accept", source: "act-branch-1", target: "char-accept", type: "dialogue", data: { optionText: "I'm ready. Tell me more.", conditions: {}, conditionGroup: { logic: "AND", conditions: [{ variableId: "var-demo-courage", operator: ">=", value: 5 }] }, metadata: {} } },
  { id: "e-branch-refuse", source: "act-branch-1", target: "char-refuse", type: "dialogue", data: { optionText: "I don't need your guidance.", conditions: {}, metadata: {} } },
  { id: "e-accept-trigger", source: "char-accept", target: "act-trigger-1", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-refuse-elder2", source: "char-refuse", target: "char-elder-2", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-trigger-setvar", source: "act-trigger-1", target: "act-set-quest", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-setvar-jump", source: "act-set-quest", target: "act-jump-1", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-elder2-end", source: "char-elder-2", target: "act-end-1", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },

  /* Combat */
  { id: "e-start-combat", source: "start-combat", target: "act-battle-music", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-music-guard", source: "act-battle-music", target: "char-guard", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-guard-branch", source: "char-guard", target: "act-combat-branch", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-branch-fight", source: "act-combat-branch", target: "char-fight", type: "dialogue", data: { optionText: "Fight!", conditions: {}, metadata: {} } },
  { id: "e-branch-surrender", source: "act-combat-branch", target: "char-surrender", type: "dialogue", data: { optionText: "Back down", conditions: {}, metadata: {} } },
  { id: "e-fight-anim", source: "char-fight", target: "act-attack-anim", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-anim-end", source: "act-attack-anim", target: "act-combat-end", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
  { id: "e-surrender-end", source: "char-surrender", target: "act-retreat-end", type: "dialogue", data: { optionText: "", conditions: {}, metadata: {} } },
];
