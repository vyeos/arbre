import type { SkillDefinition, SkillEffectsSummary, SkillUnlockState } from "./types";
import { skillCatalogById } from "./catalog";

const emptyEffects: SkillEffectsSummary = {
  health_drain_multiplier: 0,
  stability_buffer: 0,
  log_intel: 0,
  reward_multiplier: 0,
};

export const getSkillCost = (skill: SkillDefinition, tier: number) => {
  const clampedTier = Math.max(1, Math.min(skill.maxTier, tier));
  return skill.costs[clampedTier - 1] ?? skill.costs[skill.costs.length - 1] ?? 0;
};

export const getSkillDefinition = (skillId: string) => skillCatalogById.get(skillId) ?? null;

export const canUnlockSkill = ({
  skill,
  owned,
  skillPoints,
}: {
  skill: SkillDefinition;
  owned: SkillUnlockState[];
  skillPoints: number;
}): { ok: false; reason: string } | { ok: true; cost: number; nextTier: number } => {
  const ownedMap = new Map(owned.map((unlock) => [unlock.id, unlock.tier]));
  const currentTier = ownedMap.get(skill.id) ?? 0;
  const nextTier = currentTier + 1;

  if (nextTier > skill.maxTier) {
    return { ok: false, reason: "Skill already mastered." };
  }

  const cost = getSkillCost(skill, nextTier);
  if (skillPoints < cost) {
    return { ok: false, reason: "Not enough Skill Points." };
  }

  if (skill.prerequisites?.length) {
    const unmet = skill.prerequisites.find((requirement) => {
      const ownedTier = ownedMap.get(requirement.id) ?? 0;
      return ownedTier < requirement.tier;
    });

    if (unmet) {
      return { ok: false, reason: "Prerequisite skill not met." };
    }
  }

  return { ok: true, cost, nextTier };
};

export const applySkillEffects = (owned: SkillUnlockState[]): SkillEffectsSummary => {
  return owned.reduce(
    (summary, unlock) => {
      const skill = skillCatalogById.get(unlock.id);
      if (!skill) return summary;

      skill.effects.forEach((effect) => {
        const multiplier = effect.perTier ? unlock.tier : 1;
        const value = effect.value * multiplier;
        if (effect.mode === "multiply") {
          summary[effect.type] =
            summary[effect.type] === 0 ? 1 + value : summary[effect.type] * (1 + value);
        } else {
          summary[effect.type] += value;
        }
      });

      return summary;
    },
    { ...emptyEffects },
  );
};
