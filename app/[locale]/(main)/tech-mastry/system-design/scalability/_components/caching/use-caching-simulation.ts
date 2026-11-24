import { useCallback, useEffect, useRef, useState } from "react";
import type { CacheState, Request, SimulationStats } from "./types";
import {
  applyCacheOperations,
  getColorForKey,
  initialCacheState,
  selectKey,
  stepRequests,
} from "./simulation";

export const initialStats: SimulationStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  dbQueries: 0,
  averageTimeWithCache: 0,
  averageTimeWithoutCache: 0,
  timesSaved: 0,
};

interface UseCachingSimulationParams {
  isRunning: boolean;
  requestRate: number;
  popularitySkew: number;
  cacheSize: number;
}

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, time) => sum + time, 0) / values.length : 0;

/**
 * Drives the caching simulation. The animation loop reads and writes the cache
 * and the request list through refs and commits plain values, so that no state
 * updater has side effects or draws random numbers: updaters run twice in
 * StrictMode, and each frame must be applied exactly once.
 */
export function useCachingSimulation({
  isRunning,
  requestRate,
  popularitySkew,
  cacheSize,
}: UseCachingSimulationParams) {
  const [cacheState, setCacheState] = useState<CacheState>({
    ...initialCacheState,
    capacity: cacheSize,
  });
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<SimulationStats>(initialStats);
  // Time of the last animation frame: the canvas interpolates request positions from it
  const [now, setNow] = useState(() => Date.now());

  const cacheRef = useRef(cacheState);
  const requestsRef = useRef<Request[]>([]);
  const capacityRef = useRef(cacheSize);
  const requestIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastRequestTimeRef = useRef(0);
  const responseTimes = useRef<{ withCache: number[]; withoutCache: number[] }>({
    withCache: [],
    withoutCache: [],
  });

  // Update cache capacity when cacheSize changes
  useEffect(() => {
    capacityRef.current = cacheSize;
  }, [cacheSize]);

  const commitCache = useCallback((next: CacheState) => {
    cacheRef.current = next;
    setCacheState(next);
  }, []);

  const commitRequests = useCallback((next: Request[]) => {
    requestsRef.current = next;
    setRequests(next);
  }, []);

  // Update statistics
  const updateStats = useCallback((updatedRequests: Request[], cache: CacheState) => {
    // Calculate response times
    updatedRequests.forEach((request) => {
      if (request.completionTime && request.startTime) {
        const responseTime = request.completionTime - request.startTime;

        if (request.status === "cache-hit") {
          responseTimes.current.withCache.push(responseTime);
        } else if (request.status === "completed") {
          responseTimes.current.withoutCache.push(responseTime);
        }
      }
    });

    // Calculate averages
    const avgWithCache = average(responseTimes.current.withCache);
    const avgWithoutCache = average(responseTimes.current.withoutCache);

    // Calculate time saved
    const timesSaved =
      avgWithoutCache > 0 && avgWithCache > 0
        ? Math.round(((avgWithoutCache - avgWithCache) / avgWithoutCache) * 100)
        : 0;

    setStats((prev) => ({
      ...prev,
      cacheHits: cache.hits,
      cacheMisses: cache.misses,
      dbQueries: cache.misses,
      averageTimeWithCache: Math.round(avgWithCache),
      averageTimeWithoutCache: Math.round(avgWithoutCache),
      timesSaved,
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Generate a new request
    const generateRequest = () => {
      // Select a key based on popularity distribution
      const key = selectKey(popularitySkew);

      // Create a new request
      const newRequest: Request = {
        id: requestIdRef.current++,
        key,
        status: "pending",
        position: { x: 100, y: 200 },
        startTime: Date.now(),
        color: getColorForKey(key),
      };

      commitRequests([...requestsRef.current, newRequest]);
      setStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    };

    // Process existing requests
    const processRequests = (timestamp: number) => {
      const cache = { ...cacheRef.current, capacity: capacityRef.current };
      const { requests: nextRequests, updated, operations, changed } = stepRequests(
        requestsRef.current,
        cache,
        timestamp
      );

      const nextCache =
        operations.length > 0 ? applyCacheOperations(cache, operations, Date.now()) : cache;
      if (operations.length > 0) {
        commitCache(nextCache);
      }
      if (changed) {
        updateStats(updated, nextCache);
      }
      commitRequests(nextRequests);
    };

    const animate = (timestamp: number) => {
      // Generate new requests based on rate
      if (timestamp - lastRequestTimeRef.current > 1000 / requestRate) {
        generateRequest();
        lastRequestTimeRef.current = timestamp;
      }

      // Process requests
      processRequests(timestamp);
      setNow(Date.now());

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, requestRate, popularitySkew, commitCache, commitRequests, updateStats]);

  // Reset the simulation (the caller stops the loop)
  const resetSimulation = useCallback(() => {
    commitRequests([]);
    commitCache({
      ...initialCacheState,
      capacity: capacityRef.current,
      strategy: cacheRef.current.strategy,
      enabled: cacheRef.current.enabled,
    });
    setStats(initialStats);
    requestIdRef.current = 1;
    lastRequestTimeRef.current = 0;
    responseTimes.current = { withCache: [], withoutCache: [] };
  }, [commitCache, commitRequests]);

  // Toggle cache enabled/disabled
  const toggleCache = useCallback(() => {
    commitCache({ ...cacheRef.current, enabled: !cacheRef.current.enabled });
  }, [commitCache]);

  // Change cache strategy
  const changeStrategy = useCallback(
    (strategy: CacheState["strategy"]) => {
      commitCache({ ...cacheRef.current, strategy });
    },
    [commitCache]
  );

  return {
    cache: { ...cacheState, capacity: cacheSize },
    requests,
    stats,
    now,
    resetSimulation,
    toggleCache,
    changeStrategy,
  };
}
