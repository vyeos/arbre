import { randomUUID } from "crypto";
import { db } from "../db";
import { challenges, skills, relics } from "../db/schema";
import { loadChallengeDefinitions } from "../lib/challenges/loader";
import { skillCatalog } from "../lib/skills/catalog";
import { relicCatalog } from "../lib/armory/catalog";

async function main() {
  const challengeDefinitions = await loadChallengeDefinitions();

  await db
    .insert(challenges)
    .values(
      challengeDefinitions.map((challenge) => ({
        id: randomUUID(),
        slug: challenge.slug,
        title: challenge.title,
        description: challenge.description ?? null,
        language: challenge.language,
        bugTier: challenge.bugTier,
        starterCode: challenge.starterCode,
        constraints: challenge.constraints,
        rewards: challenge.rewards,
        serverHealthDrainRate: challenge.serverHealthDrainRate,
        codexLink: challenge.codexLink ?? null,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(skills)
    .values(
      skillCatalog.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.branch,
        maxTier: skill.maxTier,
        effects: { effects: skill.effects },
        isPassive: skill.isPassive,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(relics)
    .values(
      relicCatalog.map((relic) => ({
        id: relic.id,
        name: relic.name,
        description: relic.description,
        slot: relic.slot,
        rarity: relic.rarity,
        priceGold: relic.priceGold,
        unlockCondition: relic.unlockCondition ?? null,
        requiresSkillId: relic.requiresSkillId ?? null,
        isLimited: relic.isLimited ?? false,
        isAvailable: true,
      })),
    )
    .onConflictDoNothing();
}

main()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
