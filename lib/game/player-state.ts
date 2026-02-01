import crypto from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const ensurePlayerState = async (userId: string) => {
  await db
    .insert(schema.userProgress)
    .values({
      id: crypto.randomUUID(),
      userId,
      level: 0,
      xp: 0,
      skillPoints: 0,
    })
    .onConflictDoNothing({ target: [schema.userProgress.userId] });

  await db
    .insert(schema.currencies)
    .values({
      id: crypto.randomUUID(),
      userId,
      bytes: 0,
      focus: 0,
      commits: 0,
      gold: 0,
    })
    .onConflictDoNothing({ target: [schema.currencies.userId] });
};

export const getCharacterVessel = async (userId: string) => {
  const [vessel] = await db
    .select()
    .from(schema.characterVessels)
    .where(eq(schema.characterVessels.userId, userId))
    .limit(1);
  return vessel ?? null;
};
