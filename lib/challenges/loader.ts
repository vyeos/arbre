import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { challengeListSchema, challengeSchema } from "./schema";

const CHALLENGE_DIR = path.join(process.cwd(), "data", "challenges");

export async function loadChallengeDefinitions() {
  const entries = await readdir(CHALLENGE_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(CHALLENGE_DIR, entry.name));

  const definitions = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return challengeListSchema.parse(parsed);
      }
      return [challengeSchema.parse(parsed)];
    }),
  );

  return definitions.flat();
}
