import { CACHE_CHECK_TIME, DB_QUERY_TIME } from "./constants";
import type { CacheItem, CacheState, Request } from "./types";

export const ITEM_KEYS = [
  "user:1",
  "user:2",
  "user:3",
  "user:4",
  "user:5",
  "product:1",
  "product:2",
  "product:3",
  "settings",
  "config",
  "stats",
  "dashboard",
  "profile",
  "cart",
  "order:1",
];

export const ITEM_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

export const initialCacheState: CacheState = {
  enabled: true,
  strategy: "lru",
  items: [],
  capacity: 5,
  hits: 0,
  misses: 0,
};

// Get a consistent color for a key
export function getColorForKey(key: string): string {
  const index = ITEM_KEYS.indexOf(key) % ITEM_COLORS.length;
  return ITEM_COLORS[index];
}

// Generate a unique ID
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Select a key based on popularity distribution
export function selectKey(popularitySkew: number): string {
  // Use the popularity skew to determine if we select a popular item
  const selectPopular = Math.random() * 100 < popularitySkew;

  if (selectPopular) {
    // Select from the most popular 20% of items
    const popularCount = Math.max(1, Math.floor(ITEM_KEYS.length * 0.2));
    const index = Math.floor(Math.random() * popularCount);
    return ITEM_KEYS[index];
  }
  // Select from any item
  const index = Math.floor(Math.random() * ITEM_KEYS.length);
  return ITEM_KEYS[index];
}

// Update cache item access time
export function accessCacheItem(cache: CacheState, key: string, now: number): CacheState {
  return {
    ...cache,
    items: cache.items.map((item) =>
      item.key === key
        ? { ...item, lastAccessed: now, accessCount: item.accessCount + 1 }
        : item
    ),
    hits: cache.hits + 1,
  };
}

// Add an item to the cache, evicting one according to the strategy when it is full
export function addCacheItem(cache: CacheState, key: string, now: number): CacheState {
  const newItem: CacheItem = {
    id: generateUniqueId(),
    key,
    value: `value-for-${key}`,
    lastAccessed: now,
    insertedAt: now,
    accessCount: 1,
    color: getColorForKey(key),
  };

  if (cache.items.length >= cache.capacity) {
    const itemsAfterEviction = [...cache.items];

    switch (cache.strategy) {
      case "lru":
        // Remove least recently used item
        itemsAfterEviction.sort((a, b) => a.lastAccessed - b.lastAccessed);
        itemsAfterEviction.shift();
        break;

      case "fifo":
        // Remove oldest inserted item
        itemsAfterEviction.sort((a, b) => a.insertedAt - b.insertedAt);
        itemsAfterEviction.shift();
        break;

      case "random": {
        // Remove a random item
        const randomIndex = Math.floor(Math.random() * itemsAfterEviction.length);
        itemsAfterEviction.splice(randomIndex, 1);
        break;
      }
    }

    return {
      ...cache,
      items: [...itemsAfterEviction, newItem],
      misses: cache.misses + 1,
    };
  }

  return {
    ...cache,
    items: [...cache.items, newItem],
    misses: cache.misses + 1,
  };
}

export type CacheOperation = { type: "hit" | "add"; key: string };

/**
 * Advances every request one frame. Pure: the cache operations the frame
 * implies (item access on a hit, insertion after a database query) are
 * returned, in request order, for the caller to apply once.
 */
export function stepRequests(
  requests: Request[],
  cache: CacheState,
  timestamp: number
): { requests: Request[]; updated: Request[]; operations: CacheOperation[]; changed: boolean } {
  const operations: CacheOperation[] = [];

  const updatedRequests = requests.map((request): Request => {
    switch (request.status) {
      case "pending":
        return { ...request, status: "cache-check", cacheCheckTime: timestamp };

      case "cache-check":
        // Check if enough time has passed for cache check
        if (timestamp - (request.cacheCheckTime || 0) > CACHE_CHECK_TIME) {
          // Check if the key is in cache
          const cacheHit =
            cache.enabled && cache.items.some((item) => item.key === request.key);

          if (cacheHit) {
            operations.push({ type: "hit", key: request.key });
            return { ...request, status: "cache-hit", completionTime: timestamp };
          }
          return { ...request, status: "cache-miss", dbQueryTime: timestamp };
        }
        return request;

      case "cache-miss":
        // Check if enough time has passed for DB query
        if (timestamp - (request.dbQueryTime || 0) > DB_QUERY_TIME) {
          // Add to cache if enabled
          if (cache.enabled) {
            operations.push({ type: "add", key: request.key });
          }
          return { ...request, status: "completed", completionTime: timestamp };
        }
        return request;

      default:
        return request;
    }
  });

  const isNew = (status: Request["status"]) =>
    updatedRequests.some(
      (r) =>
        r.status === status &&
        !requests.some((p) => p.id === r.id && p.status === status)
    );
  const changed = isNew("cache-hit") || isNew("cache-miss") || isNew("completed");

  // Clean up old completed requests
  const kept = updatedRequests.filter((r) => {
    if (r.status === "completed" || r.status === "cache-hit") {
      return timestamp - (r.completionTime || 0) < 2000; // Keep for 2 seconds
    }
    return true;
  });

  return { requests: kept, updated: updatedRequests, operations, changed };
}

/** Applies the cache operations a frame produced, in order. */
export function applyCacheOperations(
  cache: CacheState,
  operations: CacheOperation[],
  now: number
): CacheState {
  return operations.reduce(
    (state, op) =>
      op.type === "hit" ? accessCacheItem(state, op.key, now) : addCacheItem(state, op.key, now),
    cache
  );
}
