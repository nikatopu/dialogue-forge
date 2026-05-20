import type { SerialNode, SerialEdge } from "@/types";

export const DEMO_PROJECT_NAME = "Visual Novel Example";

export const DEMO_NODES: SerialNode[] = [
  {
    id: "char-hero",
    type: "character",
    position: { x: -460, y: 0 },
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
    position: { x: -230, y: -20 },
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
    position: { x: 40, y: -20 },
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
    position: { x: -140, y: 180 },
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
    position: { x: 180, y: 180 },
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
    position: { x: -140, y: 360 },
    data: {
      actionType: "trigger",
      label: "Unlock Quest: Shard of Dawn",
      attributeSchema: [
        { id: "attr-flag", name: "Flag Name", type: "text", defaultValue: "quest_shard_unlocked" },
      ],
      attributes: { "attr-flag": "quest_shard_unlocked" },
    },
  },
  {
    id: "char-elder-2",
    type: "character",
    position: { x: 180, y: 360 },
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
    id: "act-jump-1",
    type: "action",
    position: { x: -140, y: 540 },
    data: {
      actionType: "jump",
      label: "Loop: Back to Start",
      attributeSchema: [],
      attributes: {},
    },
  },
  {
    id: "act-end-1",
    type: "action",
    position: { x: 180, y: 540 },
    data: {
      actionType: "end",
      label: "End Conversation",
      attributeSchema: [],
      attributes: {},
    },
  },
];

export const DEMO_EDGES: SerialEdge[] = [
  {
    id: "e-hero-elder",
    source: "char-hero",
    target: "char-elder",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
  {
    id: "e-elder-branch",
    source: "char-elder",
    target: "act-branch-1",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
  {
    id: "e-branch-accept",
    source: "act-branch-1",
    target: "char-accept",
    type: "dialogue",
    data: { optionText: "I'm ready. Tell me more.", conditions: {}, metadata: {} },
  },
  {
    id: "e-branch-refuse",
    source: "act-branch-1",
    target: "char-refuse",
    type: "dialogue",
    data: { optionText: "I don't need your guidance.", conditions: {}, metadata: {} },
  },
  {
    id: "e-accept-trigger",
    source: "char-accept",
    target: "act-trigger-1",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
  {
    id: "e-refuse-elder2",
    source: "char-refuse",
    target: "char-elder-2",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
  {
    id: "e-trigger-jump",
    source: "act-trigger-1",
    target: "act-jump-1",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
  {
    id: "e-elder2-end",
    source: "char-elder-2",
    target: "act-end-1",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
  {
    id: "e-jump-hero",
    source: "act-jump-1",
    target: "char-hero",
    type: "dialogue",
    data: { optionText: "", conditions: {}, metadata: {} },
  },
];
