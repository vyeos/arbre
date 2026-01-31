import { randomUUID } from "crypto";
import { db } from "../db";
import { challenges, skills } from "../db/schema";
import { loadChallengeDefinitions } from "../lib/challenges/loader";

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
        docsLink: challenge.docsLink ?? null,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(skills)
    .values([
      {
        id: randomUUID(),
        name: "Extra Edit",
        description: "One extra keystroke beyond limit.",
        category: "general",
        maxTier: 1,
        effects: { editBonus: 1 },
        isPassive: true,
      },
      {
        id: randomUUID(),
        name: "Efficient Fixer",
        description: "+20% Bytes on clean runs (scales per tier).",
        category: "general",
        maxTier: 10,
        effects: { bytesMultiplierPerTier: 0.2 },
        isPassive: true,
      },
    ])
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
