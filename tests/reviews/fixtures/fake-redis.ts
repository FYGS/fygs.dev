/**
 * In-memory stand-in for the RedisClient used by the review caches, so cache
 * behaviour can be exercised without a Redis server. Supports what
 * ReviewCacheService needs: JSON get/set, key patterns and MULTI/DEL/EXEC.
 */
export class FakeRedis {
  readonly store = new Map<string, string>();

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = this.store.get(key);
    return raw === undefined ? null : (JSON.parse(raw) as T);
  }

  async setJSON<T>(key: string, value: T, _ttl?: number): Promise<"OK"> {
    this.store.set(key, JSON.stringify(value));
    return "OK";
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  /** Glob-style `*` patterns only (what the review caches use). */
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      "^" +
        pattern
          .split("*")
          .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
          .join(".*") +
        "$"
    );
    return [...this.store.keys()].filter((key) => regex.test(key));
  }

  multi() {
    const deletions: string[] = [];
    const pipeline = {
      del: (key: string) => {
        deletions.push(key);
        return pipeline;
      },
      exec: async () => {
        for (const key of deletions) this.store.delete(key);
        return deletions.map(() => [null, 1]);
      },
    };
    return pipeline;
  }

  clear() {
    this.store.clear();
  }
}
