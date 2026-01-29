import { randomUUID } from "crypto";
import { db } from "../db";
import { challenges, skills } from "../db/schema";

async function main() {
  await db
    .insert(challenges)
    .values([
      {
        id: randomUUID(),
        slug: "warmup-null-check",
        title: "Null Check Warmup",
        description: "Fix a null access that crashes at runtime.",
        language: "ts",
        bugTier: "runtime",
        starterCode:
          "export function getName(user: { name?: string }) {\n  return user.name.toUpperCase();\n}\n",
        constraints: { maxEdits: 8 },
        rewards: { bytes: 50, focus: 5, commits: 1 },
        serverHealthDrainRate: 1,
      },
    ])
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
