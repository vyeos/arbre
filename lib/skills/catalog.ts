import type { SkillDefinition } from "./types";

export const skillCatalog: SkillDefinition[] = [
  {
    id: "focus-flow",
    name: "Focus Flow",
    description: "Stabilize drain by quieting the core runes.",
    branch: "Stability",
    maxTier: 3,
    costs: [1, 2, 3],
    effects: [
      {
        type: "health_drain_multiplier",
        value: -0.1,
        mode: "add",
        perTier: true,
      },
    ],
    isPassive: true,
  },
  {
    id: "glyph-buffer",
    name: "Glyph Buffer",
    description: "Gain a buffer that softens the first hit after a crash.",
    branch: "Stability",
    maxTier: 2,
    costs: [2, 3],
    prerequisites: [{ id: "focus-flow", tier: 1 }],
    effects: [
      {
        type: "stability_buffer",
        value: 5,
        mode: "add",
        perTier: true,
      },
    ],
    isPassive: true,
  },
  {
    id: "log-sense",
    name: "Log Sense",
    description: "Reveal clearer log hints after every run.",
    branch: "Insight",
    maxTier: 3,
    costs: [1, 2, 3],
    effects: [
      {
        type: "log_intel",
        value: 1,
        mode: "add",
        perTier: true,
      },
    ],
    isPassive: true,
  },
  {
    id: "reward-surge",
    name: "Reward Surge",
    description: "Amplify reward gains from clean clears.",
    branch: "Rewards",
    maxTier: 2,
    costs: [3, 4],
    prerequisites: [{ id: "log-sense", tier: 2 }],
    effects: [
      {
        type: "reward_multiplier",
        value: 0.15,
        mode: "add",
        perTier: true,
      },
    ],
    isPassive: true,
  },
];

export const skillCatalogById = new Map(skillCatalog.map((skill) => [skill.id, skill]));
