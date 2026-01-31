import Redis from "ioredis";

let redisClient: Redis | null = null;

const getRedisClient = () => {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  redisClient = new Redis(url, { lazyConnect: true });
  return redisClient;
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    if (client.status === "wait") {
      await client.connect();
    }
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const setCache = async (key: string, value: unknown, ttlSeconds = 120) => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    if (client.status === "wait") {
      await client.connect();
    }
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return true;
  } catch {
    return false;
  }
};
