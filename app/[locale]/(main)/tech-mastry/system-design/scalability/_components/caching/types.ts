// Types
export interface CacheItem {
  id: string;
  key: string;
  value: string;
  lastAccessed: number;
  insertedAt: number;
  accessCount: number;
  color: string;
}

export interface Request {
  id: number;
  key: string;
  status:
    | "pending"
    | "cache-check"
    | "cache-hit"
    | "cache-miss"
    | "db-query"
    | "completed";
  position: { x: number; y: number };
  startTime: number;
  cacheCheckTime?: number;
  dbQueryTime?: number;
  completionTime?: number;
  color: string;
}

export interface CacheState {
  enabled: boolean;
  strategy: "lru" | "fifo" | "random";
  items: CacheItem[];
  capacity: number;
  hits: number;
  misses: number;
}

export interface SimulationStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  dbQueries: number;
  averageTimeWithCache: number;
  averageTimeWithoutCache: number;
  timesSaved: number;
}
