import { randomUUID } from "crypto";
import { db } from "../db";
import { challenges, skills, relics } from "../db/schema";
import { loadChallengeDefinitions } from "../lib/challenges/loader";
import { skillCatalog } from "../lib/skills/catalog";
import { relicCatalog } from "../lib/armory/catalog";
import { invalidateCoreCaches } from "../lib/cache/invalidate";

async function main() {
  console.log("🌱 Starting database seed...");

  //  ==== 1. CHALLENGES (Quests / Encounters) ====
  const challengeDefinitions = await loadChallengeDefinitions();
  console.log(`📚 Seeding ${challengeDefinitions.length} challenges...`);

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

  // ==== 2. SKILLS (Skill Tree) ====
  console.log(`🛠  Seeding ${skillCatalog.length} skills...`);

  await db
    .insert(skills)
    .values(
      skillCatalog.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.branch,
        maxTier: skill.maxTier,
        costGold: skill.costs[0] ?? 10,
        effects: { effects: skill.effects },
        isPassive: skill.isPassive,
      })),
    )
    .onConflictDoNothing();

  // ==== 3. RELICS (Cosmetics) ====
  console.log(`✨ Seeding ${relicCatalog.length} relics...`);

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

  await invalidateCoreCaches();

  const totalRows = challengeDefinitions.length + skillCatalog.length + relicCatalog.length;
  console.log(`✅ Seed complete: ${totalRows} rows inserted`);
  console.log(`   - ${challengeDefinitions.length} challenges`);
  console.log(`   - ${skillCatalog.length} skills`);
  console.log(`   - ${relicCatalog.length} relics`);
}

main()
  .then(() => {
    console.log("🎉 Database seeding successful");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed", error);
    process.exit(1);
  });
