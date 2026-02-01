import Redis from "ioredis";

let redisClient: Redis | null = null;
let connectPromise: Promise<void> | null = null;

const warnDev = (message: string, error?: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    if (error) {
      console.warn(message, error);
    } else {
      console.warn(message);
    }
  }
};

export const getRedisClient = () => {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) {
    warnDev("Redis disabled: REDIS_URL is not set.");
    return null;
  }
  try {
    redisClient = new Redis(url, {
      lazyConnect: true,
      tls: url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
    });

    // Handle connection errors
    redisClient.on("error", (error) => {
      warnDev("Redis error event:", error);
    });

    return redisClient;
  } catch (error) {
    warnDev("Redis disabled: failed to initialize Redis client.", error);
    return null;
  }
};

export const ensureConnected = async (client: Redis) => {
  if (client.status === "ready") return;

  // If already connecting or reconnecting, wait for existing promise
  if (client.status === "connecting" || client.status === "reconnecting") {
    if (connectPromise) {
      await connectPromise;
      return;
    }
  }

  if (!connectPromise) {
    connectPromise = client.connect().catch((error) => {
      connectPromise = null;
      warnDev("Redis connection failed. Cache operations will be skipped.", error);
      throw error;
    });
  }
  await connectPromise;
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    await ensureConnected(client);
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
    await ensureConnected(client);
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return true;
  } catch {
    return false;
  }
};
