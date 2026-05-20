import type { SerialNode, SerialEdge } from "@/types";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  nodes: SerialNode[];
  edges: SerialEdge[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  /* ── Simple Dialogue ─────────────────────────────────────── */
  {
    id: "simple-dialogue",
    name: "Simple Dialogue",
    description: "Two characters talking",
    tags: ["basic", "linear"],
    nodes: [
      {
        id: "sd-hero",
        type: "character",
        position: { x: 0, y: 0 },
        data: {
          name: "Hero",
          dialogue: "Excuse me — do you know the way to the market district?",
          emotion: "neutral",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "sd-guard",
        type: "character",
        position: { x: 0, y: 160 },
        data: {
          name: "Guard",
          dialogue: "Straight ahead, past the fountain. Can't miss it.",
          emotion: "neutral",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "sd-end",
        type: "action",
        position: { x: 0, y: 320 },
        data: {
          actionType: "end",
          label: "End Conversation",
          attributeSchema: [],
          attributes: {},
        },
      },
    ] as SerialNode[],
    edges: [
      {
        id: "sd-e1",
        source: "sd-hero",
        target: "sd-guard",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "sd-e2",
        source: "sd-guard",
        target: "sd-end",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
    ] as SerialEdge[],
  },

  /* ── Choice Branch ───────────────────────────────────────── */
  {
    id: "choice-branch",
    name: "Choice Branch",
    description: "Player chooses a response",
    tags: ["branch", "choice"],
    nodes: [
      {
        id: "cb-npc",
        type: "character",
        position: { x: 0, y: 0 },
        data: {
          name: "Merchant",
          dialogue: "I have a rare map that leads to ancient ruins. Interested?",
          emotion: "happy",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-branch",
        type: "action",
        position: { x: 0, y: 160 },
        data: {
          actionType: "branch",
          label: "Player Response",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-yes",
        type: "character",
        position: { x: -200, y: 320 },
        data: {
          name: "Player",
          dialogue: "Absolutely. How much are you asking?",
          emotion: "happy",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-no",
        type: "character",
        position: { x: 200, y: 320 },
        data: {
          name: "Player",
          dialogue: "Not today. I have more pressing matters.",
          emotion: "neutral",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-npc-yes",
        type: "character",
        position: { x: -200, y: 480 },
        data: {
          name: "Merchant",
          dialogue: "Only fifty gold — a steal for what waits inside those ruins!",
          emotion: "happy",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-npc-no",
        type: "character",
        position: { x: 200, y: 480 },
        data: {
          name: "Merchant",
          dialogue: "A shame. Come back when you change your mind.",
          emotion: "sad",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-end-a",
        type: "action",
        position: { x: -200, y: 640 },
        data: {
          actionType: "end",
          label: "End — accepted offer",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cb-end-b",
        type: "action",
        position: { x: 200, y: 640 },
        data: {
          actionType: "end",
          label: "End — declined offer",
          attributeSchema: [],
          attributes: {},
        },
      },
    ] as SerialNode[],
    edges: [
      {
        id: "cb-e1",
        source: "cb-npc",
        target: "cb-branch",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cb-e2",
        source: "cb-branch",
        target: "cb-yes",
        type: "dialogue",
        data: { optionText: "I'm interested.", conditions: {}, metadata: {} },
      },
      {
        id: "cb-e3",
        source: "cb-branch",
        target: "cb-no",
        type: "dialogue",
        data: { optionText: "Not right now.", conditions: {}, metadata: {} },
      },
      {
        id: "cb-e4",
        source: "cb-yes",
        target: "cb-npc-yes",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cb-e5",
        source: "cb-no",
        target: "cb-npc-no",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cb-e6",
        source: "cb-npc-yes",
        target: "cb-end-a",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cb-e7",
        source: "cb-npc-no",
        target: "cb-end-b",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
    ] as SerialEdge[],
  },

  /* ── Combat Banter ───────────────────────────────────────── */
  {
    id: "combat-banter",
    name: "Combat Banter",
    description: "Fight with dialogue tree",
    tags: ["combat", "branch", "triggers"],
    nodes: [
      {
        id: "cm-enemy",
        type: "character",
        position: { x: 0, y: 0 },
        data: {
          name: "Warlord Kael",
          dialogue: "You dare challenge me alone? How refreshingly foolish.",
          emotion: "angry",
          portrait: "",
          attributeSchema: [
            { id: "cm-attr-hp", name: "HP", type: "number", defaultValue: 100 },
          ],
          attributes: { "cm-attr-hp": 100 },
        },
      },
      {
        id: "cm-hero",
        type: "character",
        position: { x: 0, y: 160 },
        data: {
          name: "Hero",
          dialogue: "I've faced worse. Let's end this quickly.",
          emotion: "neutral",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-branch",
        type: "action",
        position: { x: 0, y: 320 },
        data: {
          actionType: "branch",
          label: "Tactical Choice",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-fight",
        type: "character",
        position: { x: -240, y: 480 },
        data: {
          name: "Hero",
          dialogue: "No more words. Draw your weapon!",
          emotion: "angry",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-flee",
        type: "character",
        position: { x: 0, y: 480 },
        data: {
          name: "Hero",
          dialogue: "I need a better position. Fall back!",
          emotion: "neutral",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-talk",
        type: "character",
        position: { x: 240, y: 480 },
        data: {
          name: "Hero",
          dialogue: "Wait — there's no reason we have to do this.",
          emotion: "happy",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-trigger-fight",
        type: "action",
        position: { x: -240, y: 640 },
        data: {
          actionType: "trigger",
          label: "Start Combat",
          attributeSchema: [
            { id: "cm-flag-fight", name: "Flag", type: "text", defaultValue: "combat_started" },
          ],
          attributes: { "cm-flag-fight": "combat_started" },
        },
      },
      {
        id: "cm-trigger-flee",
        type: "action",
        position: { x: 0, y: 640 },
        data: {
          actionType: "trigger",
          label: "Retreat",
          attributeSchema: [
            { id: "cm-flag-flee", name: "Flag", type: "text", defaultValue: "player_retreated" },
          ],
          attributes: { "cm-flag-flee": "player_retreated" },
        },
      },
      {
        id: "cm-enemy-talk",
        type: "character",
        position: { x: 240, y: 640 },
        data: {
          name: "Warlord Kael",
          dialogue: "...Interesting. Very well. I will hear you out.",
          emotion: "surprised",
          portrait: "",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-end-a",
        type: "action",
        position: { x: -240, y: 800 },
        data: {
          actionType: "end",
          label: "End — battle begins",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-end-b",
        type: "action",
        position: { x: 0, y: 800 },
        data: {
          actionType: "end",
          label: "End — player retreats",
          attributeSchema: [],
          attributes: {},
        },
      },
      {
        id: "cm-end-c",
        type: "action",
        position: { x: 240, y: 800 },
        data: {
          actionType: "end",
          label: "End — negotiation begins",
          attributeSchema: [],
          attributes: {},
        },
      },
    ] as SerialNode[],
    edges: [
      {
        id: "cm-e1",
        source: "cm-enemy",
        target: "cm-hero",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e2",
        source: "cm-hero",
        target: "cm-branch",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e3",
        source: "cm-branch",
        target: "cm-fight",
        type: "dialogue",
        data: { optionText: "Attack!", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e4",
        source: "cm-branch",
        target: "cm-flee",
        type: "dialogue",
        data: { optionText: "Retreat", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e5",
        source: "cm-branch",
        target: "cm-talk",
        type: "dialogue",
        data: { optionText: "Negotiate", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e6",
        source: "cm-fight",
        target: "cm-trigger-fight",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e7",
        source: "cm-flee",
        target: "cm-trigger-flee",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e8",
        source: "cm-talk",
        target: "cm-enemy-talk",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e9",
        source: "cm-trigger-fight",
        target: "cm-end-a",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e10",
        source: "cm-trigger-flee",
        target: "cm-end-b",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
      {
        id: "cm-e11",
        source: "cm-enemy-talk",
        target: "cm-end-c",
        type: "dialogue",
        data: { optionText: "", conditions: {}, metadata: {} },
      },
    ] as SerialEdge[],
  },
];
