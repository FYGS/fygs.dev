import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ctor = vi.hoisted(() => vi.fn());

vi.mock("ioredis", () => ({
  default: class {
    constructor(url: string) {
      ctor(url);
    }
    on() {
      return this;
    }
  },
}));

const saved = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  ctor.mockReset();
  delete process.env.REDIS_URL;
  delete process.env.blog_stats_KV_REST_API_URL;
});

afterEach(() => {
  process.env = { ...saved };
});

describe("RedisClient URL selection", () => {
  it("prefers REDIS_URL", async () => {
    process.env.REDIS_URL = "redis://primary:6379/0";
    process.env.blog_stats_KV_REST_API_URL = "redis://legacy:6379";
    const { RedisClient } = await import("@/lib/redis");
    RedisClient.getInstance();
    expect(ctor).toHaveBeenCalledWith("redis://primary:6379/0");
  });

  it("accepts the legacy variable only when it is a redis:// URL", async () => {
    process.env.blog_stats_KV_REST_API_URL = "rediss://legacy:6379";
    const { RedisClient } = await import("@/lib/redis");
    RedisClient.getInstance();
    expect(ctor).toHaveBeenCalledWith("rediss://legacy:6379");
  });

  it("ignores an https REST endpoint instead of trying to connect to it", async () => {
    process.env.blog_stats_KV_REST_API_URL = "https://kv.example.com";
    const { RedisClient } = await import("@/lib/redis");
    expect(() => RedisClient.getInstance()).toThrow(/REDIS_URL/);
    expect(ctor).not.toHaveBeenCalled();
  });
});
