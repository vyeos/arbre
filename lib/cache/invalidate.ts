import { cacheKeys } from "./keys";
import { ensureConnected, getRedisClient } from "./redis";

export const invalidateCache = async (keys: string[]) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await ensureConnected(client);
    await client.del(...keys);
    return true;
  } catch {
    return false;
  }
};

export const invalidateCoreCaches = async () =>
  invalidateCache([
    cacheKeys.challenges,
    cacheKeys.skills,
    cacheKeys.skillCatalog,
    cacheKeys.relicCatalog,
  ]);
