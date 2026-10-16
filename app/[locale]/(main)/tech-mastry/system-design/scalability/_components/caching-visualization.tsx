"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CachingSettings } from "./caching/caching-settings";
import { CachingDetailedStats } from "./caching/caching-detailed-stats";
import { CachingStats } from "./caching/caching-stats";
import { CachingControls } from "./caching/caching-controls";
import { CachingCanvas } from "./caching/caching-canvas";
import type { CacheItem, Request, CacheState, SimulationStats } from "./caching/types";
import { CACHE_CHECK_TIME, DB_QUERY_TIME } from "./caching/constants";

// Constants
const ITEM_KEYS = [
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
const ITEM_COLORS = [
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

// Initial state
const initialCacheState: CacheState = {
  enabled: true,
  strategy: "lru",
  items: [],
  capacity: 5,
  hits: 0,
  misses: 0,
};

const initialStats: SimulationStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  dbQueries: 0,
  averageTimeWithCache: 0,
  averageTimeWithoutCache: 0,
  timesSaved: 0,
};

export function CachingVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");
  const [isRunning, setIsRunning] = useState(false);
  const [requestRate, setRequestRate] = useState(2);
  const [popularitySkew, setPopularitySkew] = useState(70);
  const [cacheSize, setCacheSize] = useState(5);

  const [cache, setCache] = useState<CacheState>({
    ...initialCacheState,
    capacity: cacheSize,
  });

  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<SimulationStats>(initialStats);

  const requestIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastRequestTimeRef = useRef(0);
  const responseTimes = useRef<{ withCache: number[]; withoutCache: number[] }>(
    { withCache: [], withoutCache: [] }
  );

  // Generate a unique ID
  const generateUniqueId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }, []);

  // Get a consistent color for a key
  const getColorForKey = useCallback((key: string): string => {
    const index = ITEM_KEYS.indexOf(key) % ITEM_COLORS.length;
    return ITEM_COLORS[index];
  }, []);

  // Update cache item access time
  const updateCacheItemAccess = useCallback((key: string) => {
    setCache((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.key === key) {
          return {
            ...item,
            lastAccessed: Date.now(),
            accessCount: item.accessCount + 1,
          };
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems,
        hits: prev.hits + 1,
      };
    });
  }, []);

  // Add an item to the cache
  const addToCache = useCallback(
    (key: string) => {
      setCache((prev) => {
        // Create new cache item
        const newItem: CacheItem = {
          id: generateUniqueId(),
          key,
          value: `value-for-${key}`,
          lastAccessed: Date.now(),
          insertedAt: Date.now(),
          accessCount: 1,
          color: getColorForKey(key),
        };

        // Check if cache is full
        if (prev.items.length >= prev.capacity) {
          // Need to evict an item based on strategy
          const itemsAfterEviction = [...prev.items];

          switch (prev.strategy) {
            case "lru":
              // Remove least recently used item
              itemsAfterEviction.sort(
                (a, b) => a.lastAccessed - b.lastAccessed
              );
              itemsAfterEviction.shift(); // Remove first item (oldest)
              break;

            case "fifo":
              // Remove oldest inserted item
              itemsAfterEviction.sort((a, b) => a.insertedAt - b.insertedAt);
              itemsAfterEviction.shift(); // Remove first item (oldest)
              break;

            case "random":
              // Remove a random item
              const randomIndex = Math.floor(
                Math.random() * itemsAfterEviction.length
              );
              itemsAfterEviction.splice(randomIndex, 1);
              break;
          }

          return {
            ...prev,
            items: [...itemsAfterEviction, newItem],
            misses: prev.misses + 1,
          };
        }

        // Cache has space
        return {
          ...prev,
          items: [...prev.items, newItem],
          misses: prev.misses + 1,
        };
      });
    },
    [generateUniqueId, getColorForKey]
  );

  // Update statistics
  const updateStats = useCallback(
    (updatedRequests: Request[]) => {
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
      const avgWithCache =
        responseTimes.current.withCache.length > 0
          ? responseTimes.current.withCache.reduce(
              (sum, time) => sum + time,
              0
            ) / responseTimes.current.withCache.length
          : 0;

      const avgWithoutCache =
        responseTimes.current.withoutCache.length > 0
          ? responseTimes.current.withoutCache.reduce(
              (sum, time) => sum + time,
              0
            ) / responseTimes.current.withoutCache.length
          : 0;

      // Calculate time saved
      const timesSaved =
        avgWithoutCache > 0 && avgWithCache > 0
          ? Math.round(
              ((avgWithoutCache - avgWithCache) / avgWithoutCache) * 100
            )
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
    },
    // Nous utilisons les valeurs actuelles de cache.hits et cache.misses, pas les références
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Update cache capacity when cacheSize changes
  useEffect(() => {
    setCache((prev) => ({
      ...prev,
      capacity: cacheSize,
    }));
  }, [cacheSize]);

  // Animation loop
  useEffect(() => {
    // Select a key based on popularity distribution
    const selectKey = (): string => {
      // Use the popularity skew to determine if we select a popular item
      const selectPopular = Math.random() * 100 < popularitySkew;

      if (selectPopular) {
        // Select from the most popular 20% of items
        const popularCount = Math.max(1, Math.floor(ITEM_KEYS.length * 0.2));
        const index = Math.floor(Math.random() * popularCount);
        return ITEM_KEYS[index];
      } else {
        // Select from any item
        const index = Math.floor(Math.random() * ITEM_KEYS.length);
        return ITEM_KEYS[index];
      }
    };

    // Generate a new request
    const generateRequest = () => {
      // Select a key based on popularity distribution
      const key = selectKey();

      // Create a new request
      const newRequest: Request = {
        id: requestIdRef.current++,
        key,
        status: "pending",
        position: { x: 100, y: 200 },
        startTime: Date.now(),
        color: getColorForKey(key),
      };

      setRequests((prev) => [...prev, newRequest]);
      setStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    };

    // Process existing requests
    const processRequests = (timestamp: number) => {
      setRequests((prev) => {
        const updatedRequests = prev.map((request) => {
          // Handle each request based on its current status
          switch (request.status) {
            case "pending":
              return {
                ...request,
                status: "cache-check" as const,
                cacheCheckTime: timestamp,
              };

            case "cache-check":
              // Check if enough time has passed for cache check
              if (
                timestamp - (request.cacheCheckTime || 0) >
                CACHE_CHECK_TIME
              ) {
                // Check if the key is in cache
                const cacheHit =
                  cache.enabled &&
                  cache.items.some((item) => item.key === request.key);

                if (cacheHit) {
                  // Update cache item access time
                  updateCacheItemAccess(request.key);

                  return {
                    ...request,
                    status: "cache-hit" as const,
                    completionTime: timestamp,
                  };
                } else {
                  return {
                    ...request,
                    status: "cache-miss" as const,
                    dbQueryTime: timestamp,
                  };
                }
              }
              return request;

            case "cache-miss":
              // Check if enough time has passed for DB query
              if (timestamp - (request.dbQueryTime || 0) > DB_QUERY_TIME) {
                // Add to cache if enabled
                if (cache.enabled) {
                  addToCache(request.key);
                }

                return {
                  ...request,
                  status: "completed" as const,
                  completionTime: timestamp,
                };
              }
              return request;

            default:
              return request;
          }
        });

        // Update stats
        const newCacheHits = updatedRequests.filter(
          (r) =>
            r.status === "cache-hit" &&
            !prev.some((p) => p.id === r.id && p.status === "cache-hit")
        ).length;
        const newCacheMisses = updatedRequests.filter(
          (r) =>
            r.status === "cache-miss" &&
            !prev.some((p) => p.id === r.id && p.status === "cache-miss")
        ).length;
        const newCompletions = updatedRequests.filter(
          (r) =>
            r.status === "completed" &&
            !prev.some((p) => p.id === r.id && p.status === "completed")
        ).length;

        if (newCacheHits > 0 || newCacheMisses > 0 || newCompletions > 0) {
          updateStats(updatedRequests);
        }

        // Clean up old completed requests
        return updatedRequests.filter((r) => {
          if (r.status === "completed" || r.status === "cache-hit") {
            return timestamp - (r.completionTime || 0) < 2000; // Keep for 2 seconds
          }
          return true;
        });
      });
    };

    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      // Generate new requests based on rate
      if (timestamp - lastRequestTimeRef.current > 1000 / requestRate) {
        generateRequest();
        lastRequestTimeRef.current = timestamp;
      }

      // Process requests
      processRequests(timestamp);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isRunning,
    requestRate,
    cache.enabled,
    cache.strategy,
    cache.items,
    popularitySkew,
    getColorForKey,
    updateCacheItemAccess,
    addToCache,
    updateStats,
  ]);

  // Reset the simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setRequests([]);
    setCache({
      ...initialCacheState,
      capacity: cacheSize,
      strategy: cache.strategy,
      enabled: cache.enabled,
    });
    setStats(initialStats);
    requestIdRef.current = 1;
    lastRequestTimeRef.current = 0;
    responseTimes.current = { withCache: [], withoutCache: [] };
  };

  // Toggle cache enabled/disabled
  const toggleCache = () => {
    setCache((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  // Change cache strategy
  const changeStrategy = (strategy: "lru" | "fifo" | "random") => {
    setCache((prev) => ({
      ...prev,
      strategy,
    }));
  };

  return (
    <Card className="border border-indigo-500/20 bg-background/60 backdrop-blur-xs shadow-lg shadow-indigo-500/5 rounded-xl overflow-hidden">
      <CardHeader className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-500/20">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500">
            <Zap className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
            Visualisation du Caching
          </span>
        </CardTitle>
        <CardDescription className="text-muted-foreground/90">
          Découvrez comment le caching améliore les performances en réduisant
          les accès à la base de données.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6 p-1 bg-background/80 border border-indigo-500/20 rounded-lg">
            <TabsTrigger
              value="visualization"
              className="data-[state=active]:bg-transparent data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Visualisation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={cache.strategy === "lru" ? "default" : "outline"}
                size="sm"
                onClick={() => changeStrategy("lru")}
                className={
                  cache.strategy === "lru"
                    ? "bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
                    : "border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all duration-300"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M12 7v5l4 2" />
                </svg>
                LRU (Least Recently Used)
              </Button>
              <Button
                variant={cache.strategy === "fifo" ? "default" : "outline"}
                size="sm"
                onClick={() => changeStrategy("fifo")}
                className={
                  cache.strategy === "fifo"
                    ? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md shadow-purple-500/20"
                    : "border-purple-500/30 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-300"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                FIFO (First In First Out)
              </Button>
              <Button
                variant={cache.strategy === "random" ? "default" : "outline"}
                size="sm"
                onClick={() => changeStrategy("random")}
                className={
                  cache.strategy === "random"
                    ? "bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-md shadow-blue-500/20"
                    : "border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-300"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M16 21.9V16a2 2 0 0 0-2-2H6a2 2 0 0 1-2-2V5.1" />
                  <path d="M16 16.9V10a2 2 0 0 0-2-2H9.1" />
                  <path d="M3 3h.1" />
                  <path d="M7 3h.1" />
                  <path d="M11 3h.1" />
                  <path d="M15 3h.1" />
                  <path d="M19 3h.1" />
                  <path d="M19 7h.1" />
                  <path d="M19 11h.1" />
                  <path d="M19 15h.1" />
                  <path d="M19 19h.1" />
                  <path d="M15 19h.1" />
                  <path d="M11 19h.1" />
                  <path d="M7 19h.1" />
                  <path d="M3 19h.1" />
                  <path d="M3 15h.1" />
                  <path d="M3 11h.1" />
                  <path d="M3 7h.1" />
                </svg>
                Random Replacement
              </Button>

              <div className="ml-auto">
                <Button
                  variant={cache.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleCache}
                  className={
                    cache.enabled
                      ? "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
                      : "border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-300"
                  }
                >
                  {cache.enabled ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>{" "}
                      Cache Activé
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>{" "}
                      Cache Désactivé
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Visualization Canvas */}
            <CachingCanvas cache={cache} requests={requests} />

            {/* Controls */}
            <CachingControls isRunning={isRunning} resetSimulation={resetSimulation} setIsRunning={setIsRunning} />

            {/* Stats */}
            <CachingStats stats={stats} />

            {/* Detailed Stats */}
            <CachingDetailedStats stats={stats} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CachingSettings cacheSize={cacheSize} popularitySkew={popularitySkew} requestRate={requestRate} setCacheSize={setCacheSize} setPopularitySkew={setPopularitySkew} setRequestRate={setRequestRate} />

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                Paramètres de Simulation
              </h3>
              <p className="text-sm text-muted-foreground">
                Ajustez les paramètres ci-dessus pour voir comment différentes
                configurations de cache affectent les performances. Augmentez la
                taille du cache pour stocker plus d&apos;éléments, ou modifiez
                la stratégie de remplacement pour voir l&apos;impact sur le taux
                de hit.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab("visualization")}
                className="bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Retour à la Visualisation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
