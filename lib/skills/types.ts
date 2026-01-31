export const skillEffectTypes = [
  "health_drain_multiplier",
  "stability_buffer",
  "log_intel",
  "reward_multiplier",
] as const;

export type SkillEffectType = (typeof skillEffectTypes)[number];

export type SkillEffect = {
  type: SkillEffectType;
  value: number;
  mode: "add" | "multiply";
  perTier?: boolean;
};

export type SkillPrerequisite = {
  id: string;
  tier: number;
};

export type SkillDefinition = {
  id: string;
  name: string;
  description: string;
  branch: string;
  maxTier: number;
  costs: number[];
  prerequisites?: SkillPrerequisite[];
  effects: SkillEffect[];
  isPassive: boolean;
};

export type SkillUnlockState = {
  id: string;
  tier: number;
};

export type SkillEffectsSummary = Record<SkillEffectType, number>;
