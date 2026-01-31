import { cacheKeys } from "./keys";
import Redis from "ioredis";

const getRedisClient = () => {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new Redis(url);
};

export const invalidateCache = async (keys: string[]) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.del(...keys);
    await client.quit();
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
