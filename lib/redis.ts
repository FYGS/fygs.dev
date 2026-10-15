import Redis, { ChainableCommander } from "ioredis";

// Add proper typing for global
declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

// Improve interface with proper types
interface IRedisClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode?: string,
    duration?: number,
  ): Promise<"OK" | null>;
  setex(key: string, seconds: number, value: string): Promise<"OK">;
  setnx(key: string, value: string): Promise<number>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  pipeline(): ChainableCommander;
  sadd(key: string, ...members: string[]): Promise<number>;
  srem(key: string, ...members: string[]): Promise<number>;
  sismember(key: string, member: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  multi(): ChainableCommander;
  eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown>;
  setNxEx(key: string, value: string, seconds: number): Promise<boolean>;
}

export class RedisClient implements IRedisClient {
  private static instance?: RedisClient;
  private readonly client: Redis;

  private constructor() {
    const redisUrl =
      process.env.REDIS_URL || process.env.blog_stats_KV_REST_API_URL;

    if (!redisUrl) {
      throw new Error(
        "Missing required Redis environment variables (REDIS_URL)",
      );
    }

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Never let an unreachable Redis hold a request open
      commandTimeout: 1500,
      connectTimeout: 3000,
    });

    // Error handling
    this.client.on("error", (err: Error) => {
      console.error("Redis connection error:", err);
    });

    this.client.on("connect", () => {
      console.log("Redis connected successfully");
    });

    // Preserve instance in development
    if (process.env.NODE_ENV === "development") {
      global.redis = this.client;
    }
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    mode?: string,
    duration?: number,
  ): Promise<"OK" | null> {
    if (mode === "EX" && duration) {
      return this.client.set(key, value, "EX", duration);
    }
    return this.client.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<"OK"> {
    return this.client.setex(key, seconds, value);
  }

  async setnx(key: string, value: string): Promise<number> {
    return this.client.setnx(key, value);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  pipeline(): ChainableCommander {
    return this.client.pipeline();
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.client.sismember(key, member);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  multi(): ChainableCommander {
    return this.client.multi();
  }

  /** Run a Lua script atomically on the server. */
  async eval(
    script: string,
    numKeys: number,
    ...args: (string | number)[]
  ): Promise<unknown> {
    return this.client.eval(script, numKeys, ...args);
  }

  /** SET key value EX seconds NX in one command: true when the key was created. */
  async setNxEx(key: string, value: string, seconds: number): Promise<boolean> {
    const result = await this.client.set(key, value, "EX", seconds, "NX");
    return result === "OK";
  }

  // Add utility methods for JSON handling
  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJSON<T>(key: string, value: T, ttl?: number): Promise<"OK" | null> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      return this.set(key, serialized, "EX", ttl);
    }
    return this.set(key, serialized);
  }

  // Add dispose method for cleanup
  public static dispose(): void {
    if (RedisClient.instance) {
      RedisClient.instance.client.disconnect();
      delete global.redis;
      delete RedisClient.instance;
    }
  }
}

// Create a lazy proxy — Redis only instantiates when first accessed at runtime,
// not at module import time. This prevents build-time crashes when REDIS_URL is absent.
let _instance: RedisClient | undefined;

function getRedisInstance(): RedisClient {
  if (!_instance) {
    _instance = RedisClient.getInstance();
  }
  return _instance;
}

const redis = new Proxy({} as RedisClient, {
  get(_target, prop: string | symbol) {
    const instance = getRedisInstance();
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export default redis;
