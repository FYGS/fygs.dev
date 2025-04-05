import { Redis, RedisConfigNodejs } from "@upstash/redis";

// Add proper typing for global
declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

// Improve interface with proper types
interface IRedisClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  incr(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  pipeline(): ReturnType<Redis["pipeline"]>;
}

export class RedisClient implements IRedisClient {
  private static instance?: RedisClient;
  private readonly client: Redis;

  private constructor() {
    const config: RedisConfigNodejs = {
      url: process.env.blog_stats_KV_REST_API_URL,
      token: process.env.blog_stats_KV_REST_API_TOKEN,
    };

    if (!config.url || !config.token) {
      throw new Error("Missing required Upstash Redis environment variables");
    }

    this.client = new Redis(config);

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

  async get<T>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.client.set(key, value);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  pipeline(): ReturnType<Redis["pipeline"]> {
    return this.client.pipeline();
  }

  // Add dispose method for cleanup
  public static dispose(): void {
    if (RedisClient.instance) {
      delete global.redis;
      delete RedisClient.instance;
    }
  }
}

// Create and freeze instance
const redis = RedisClient.getInstance();
Object.freeze(redis);

export default redis;
