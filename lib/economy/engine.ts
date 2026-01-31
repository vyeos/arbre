import type { RewardContext, RewardResult } from "./types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const baseRewards: Record<string, RewardResult> = {
  syntax: { bytes: 40, focus: 4, commits: 1, gold: 6 },
  runtime: { bytes: 70, focus: 6, commits: 2, gold: 10 },
  logic: { bytes: 90, focus: 8, commits: 3, gold: 14 },
  default: { bytes: 55, focus: 5, commits: 1, gold: 8 },
};

export const calculateRewards = ({
  bugTier,
  performance,
  modifiers,
}: RewardContext): RewardResult => {
  const base = baseRewards[bugTier] ?? baseRewards.default;
  const performanceFactor = 0.8 + 0.4 * clamp(performance, 0, 1);
  const comboFactor = 1 + 0.05 * (modifiers?.combo ?? 0);
  const criticalFactor = modifiers?.critical ? 1.1 : 1;
  const flawlessFactor = modifiers?.flawless ? 1.15 : 1;
  const total = performanceFactor * comboFactor * criticalFactor * flawlessFactor;

  return {
    bytes: Math.max(0, Math.round(base.bytes * total)),
    focus: Math.max(0, Math.round(base.focus * total)),
    commits: Math.max(0, Math.round(base.commits * total)),
    gold: Math.max(0, Math.round(base.gold * total)),
  };
};
