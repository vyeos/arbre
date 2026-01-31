export type ModifierDefinition = {
  id: string;
  name: string;
  description: string;
  rewardMultiplier: number;
};

export const modifierCatalog: ModifierDefinition[] = [
  {
    id: "fog",
    name: "Fog of Code",
    description: "Reduce visibility to test memory and focus.",
    rewardMultiplier: 0.2,
  },
  {
    id: "limited-edits",
    name: "Limited Edits",
    description: "Cap your fixes to a strict edit budget.",
    rewardMultiplier: 0.25,
  },
  {
    id: "one-liner",
    name: "One-Liner Pact",
    description: "Patch the Quest with a single line.",
    rewardMultiplier: 0.3,
  },
];
