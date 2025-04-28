"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Pause, Play, RefreshCw, Settings, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
interface CacheItem {
  id: string;
  key: string;
  value: string;
  lastAccessed: number;
  insertedAt: number;
  accessCount: number;
  color: string;
}

interface Request {
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

interface CacheState {
  enabled: boolean;
  strategy: "lru" | "fifo" | "random";
  items: CacheItem[];
  capacity: number;
  hits: number;
  misses: number;
}

interface SimulationStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  dbQueries: number;
  averageTimeWithCache: number;
  averageTimeWithoutCache: number;
  timesSaved: number;
}

// Constants
const DB_QUERY_TIME = 1000; // ms
const CACHE_CHECK_TIME = 50; // ms
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
    <Card className="border border-indigo-500/20 bg-background/60 backdrop-blur-sm shadow-lg shadow-indigo-500/5 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-500/20">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500">
            <Zap className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
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
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Visualisation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
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
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md shadow-purple-500/20"
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
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-md shadow-blue-500/20"
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
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
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
            <div className="relative w-full h-[400px] border border-indigo-500/20 rounded-xl bg-gradient-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-sm overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {/* Client */}
                <g transform="translate(100, 200)">
                  <defs>
                    <linearGradient
                      id="clientGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                    <filter
                      id="clientGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <rect
                    x="-60"
                    y="-30"
                    width="120"
                    height="60"
                    rx="10"
                    fill="url(#clientGradient)"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                    filter="url(#clientGlow)"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fontWeight="500"
                    fill="#6366f1"
                  >
                    Client
                  </text>
                </g>

                {/* Cache */}
                <g transform="translate(300, 100)">
                  <defs>
                    <linearGradient
                      id="cacheGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={cache.enabled ? "#6366f1" : "#64748b"}
                        stopOpacity="0.1"
                      />
                      <stop
                        offset="100%"
                        stopColor={cache.enabled ? "#8b5cf6" : "#94a3b8"}
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                    <filter
                      id="cacheGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <rect
                    x="-80"
                    y="-60"
                    width="160"
                    height="120"
                    rx="12"
                    fill="url(#cacheGradient)"
                    stroke={cache.enabled ? "#6366f1" : "#64748b"}
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    strokeDasharray={cache.enabled ? "none" : "5,5"}
                    filter={cache.enabled ? "url(#cacheGlow)" : "none"}
                  />
                  <text
                    x="0"
                    y="-40"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="600"
                    fill={cache.enabled ? "#6366f1" : "#64748b"}
                  >
                    Cache ({cache.strategy.toUpperCase()})
                  </text>

                  {/* Cache Items */}
                  <g transform="translate(0, 0)">
                    {cache.items.map((item, index) => {
                      const itemsPerRow = 3;
                      const row = Math.floor(index / itemsPerRow);
                      const col = index % itemsPerRow;
                      const x = (col - 1) * 50;
                      const y = row * 30;

                      return (
                        <g key={item.id} transform={`translate(${x}, ${y})`}>
                          <rect
                            x="-20"
                            y="-10"
                            width="40"
                            height="20"
                            rx="5"
                            fill={item.color}
                            opacity="0.8"
                            stroke="white"
                            strokeWidth="0.5"
                            strokeOpacity="0.3"
                          >
                            <animate
                              attributeName="opacity"
                              values="0.8;1;0.8"
                              dur="3s"
                              repeatCount="indefinite"
                              begin={`${index * 0.5}s`}
                            />
                          </rect>
                          <text
                            x="0"
                            y="4"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="white"
                          >
                            {item.key.length > 6
                              ? `${item.key.substring(0, 6)}...`
                              : item.key}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>

                {/* Database */}
                <g transform="translate(500, 200)">
                  <defs>
                    <linearGradient
                      id="dbGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.1" />
                      <stop
                        offset="100%"
                        stopColor="#0d9488"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                    <filter
                      id="dbGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <rect
                    x="-60"
                    y="-40"
                    width="120"
                    height="80"
                    rx="12"
                    fill="url(#dbGradient)"
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    filter="url(#dbGlow)"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fontWeight="600"
                    fill="#14b8a6"
                  >
                    Database
                  </text>
                  <circle cx="-40" cy="-20" r="3" fill="#14b8a6" opacity="0.6">
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="-30" cy="-20" r="3" fill="#14b8a6" opacity="0.6">
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="4s"
                      repeatCount="indefinite"
                      begin="0.5s"
                    />
                  </circle>
                  <circle cx="-20" cy="-20" r="3" fill="#14b8a6" opacity="0.6">
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="4s"
                      repeatCount="indefinite"
                      begin="1s"
                    />
                  </circle>
                </g>

                {/* Paths */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6366f1"
                      opacity="0.5"
                    />
                  </marker>
                  <marker
                    id="arrowhead-disabled"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#64748b"
                      opacity="0.5"
                    />
                  </marker>
                </defs>
                <path
                  d="M 160,200 L 220,100"
                  stroke={cache.enabled ? "#6366f1" : "#64748b"}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  strokeDasharray={cache.enabled ? "none" : "5,5"}
                  fill="none"
                  markerEnd={
                    cache.enabled
                      ? "url(#arrowhead)"
                      : "url(#arrowhead-disabled)"
                  }
                >
                  {cache.enabled && (
                    <animate
                      attributeName="stroke-opacity"
                      values="0.5;0.8;0.5"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
                <path
                  d="M 160,200 L 440,200"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                >
                  <animate
                    attributeName="stroke-opacity"
                    values="0.5;0.8;0.5"
                    dur="3s"
                    repeatCount="indefinite"
                    begin="0.5s"
                  />
                </path>
                <path
                  d="M 380,100 L 440,200"
                  stroke={cache.enabled ? "#6366f1" : "#64748b"}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  strokeDasharray={cache.enabled ? "none" : "5,5"}
                  fill="none"
                  markerEnd={
                    cache.enabled
                      ? "url(#arrowhead)"
                      : "url(#arrowhead-disabled)"
                  }
                >
                  {cache.enabled && (
                    <animate
                      attributeName="stroke-opacity"
                      values="0.5;0.8;0.5"
                      dur="3s"
                      repeatCount="indefinite"
                      begin="1s"
                    />
                  )}
                </path>

                {/* Requests */}
                {requests.map((request) => {
                  let x = 100;
                  let y = 200;

                  // Calculate position based on status
                  if (request.status === "cache-check") {
                    const progress = Math.min(
                      (Date.now() - request.startTime) / CACHE_CHECK_TIME,
                      1
                    );
                    x = 100 + (300 - 100) * progress;
                    y = 200 + (100 - 200) * progress;
                  } else if (request.status === "cache-hit") {
                    const timeInStatus =
                      Date.now() - (request.completionTime || 0);
                    const returnProgress = Math.min(timeInStatus / 500, 1);
                    x = 300 - (300 - 100) * returnProgress;
                    y = 100 - (100 - 200) * returnProgress;
                  } else if (request.status === "cache-miss") {
                    const progress = Math.min(
                      (Date.now() - (request.dbQueryTime || 0)) / DB_QUERY_TIME,
                      1
                    );
                    x = 300 + (500 - 300) * progress;
                    y = 100 + (200 - 100) * progress;
                  } else if (request.status === "completed") {
                    const timeInStatus =
                      Date.now() - (request.completionTime || 0);
                    const returnProgress = Math.min(timeInStatus / 500, 1);
                    x = 500 - (500 - 100) * returnProgress;
                    y = 200;
                  }

                  return (
                    <g key={request.id} transform={`translate(${x}, ${y})`}>
                      <defs>
                        <filter
                          id={`glow-${request.id}`}
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite
                            in="SourceGraphic"
                            in2="blur"
                            operator="over"
                          />
                        </filter>
                      </defs>
                      <circle
                        r="8"
                        fill={request.color}
                        opacity="0.2"
                        filter={`url(#glow-${request.id})`}
                      >
                        <animate
                          attributeName="r"
                          values="8;10;8"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        r="6"
                        fill={request.color}
                        opacity={
                          request.status === "completed" ||
                          request.status === "cache-hit"
                            ? 0.6
                            : 0.9
                        }
                        stroke="white"
                        strokeWidth="1"
                        strokeOpacity="0.3"
                      >
                        <animate
                          attributeName="opacity"
                          values={
                            request.status === "completed" ||
                            request.status === "cache-hit"
                              ? "0.6;0.8;0.6"
                              : "0.9;1;0.9"
                          }
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x="0"
                        y="-12"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="500"
                        fill={
                          request.status === "cache-hit"
                            ? "#10b981"
                            : request.status === "cache-miss"
                            ? "#f59e0b"
                            : "#3b82f6"
                        }
                        stroke="white"
                        strokeWidth="0.3"
                        strokeOpacity="0.5"
                        paintOrder="stroke"
                      >
                        {request.key.length > 6
                          ? `${request.key.substring(0, 6)}...`
                          : request.key}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform="translate(700, 350)">
                  <defs>
                    <linearGradient
                      id="legendGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#f1f5f9"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                  </defs>
                  <text
                    x="0"
                    y="-65"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                    fill="#6366f1"
                  >
                    Légende
                  </text>
                  <rect
                    x="-45"
                    y="-55"
                    width="90"
                    height="70"
                    rx="8"
                    fill="url(#legendGradient)"
                    stroke="#6366f1"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />

                  <circle
                    cx="-30"
                    cy="-35"
                    r="5"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                  />
                  <text
                    x="-18"
                    y="-32"
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="start"
                    fill="#3b82f6"
                  >
                    Requête
                  </text>

                  <circle
                    cx="-30"
                    cy="-15"
                    r="5"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                  />
                  <text
                    x="-18"
                    y="-12"
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="start"
                    fill="#10b981"
                  >
                    Cache Hit
                  </text>

                  <circle
                    cx="-30"
                    cy="5"
                    r="5"
                    fill="#f59e0b"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                  />
                  <text
                    x="-18"
                    y="8"
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="start"
                    fill="#f59e0b"
                  >
                    Cache Miss
                  </text>
                </g>
              </svg>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={() => setIsRunning(!isRunning)}
                  className={
                    isRunning
                      ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-none shadow-md shadow-red-500/20"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
                  }
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={resetSimulation}
                  className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border border-indigo-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
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
                    >
                      <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7.5" />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                      <path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6v0Z" />
                      <path d="M18 18v3" />
                      <path d="M18 15v.01" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requêtes Totales
                  </p>
                </div>
                <p className="font-medium text-xl text-indigo-500">
                  {stats.totalRequests}
                </p>
              </Card>
              <Card className="p-4 border border-emerald-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-500">
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
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">Cache Hits</p>
                </div>
                <p className="font-medium text-xl text-emerald-500">
                  {stats.cacheHits}
                </p>
              </Card>
              <Card className="p-4 border border-amber-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-amber-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/10 text-amber-500">
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
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">Cache Misses</p>
                </div>
                <p className="font-medium text-xl text-amber-500">
                  {stats.cacheMisses}
                </p>
              </Card>
              <Card className="p-4 border border-blue-500/20 bg-background/60 backdrop-blur-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-500">
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
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temps Économisé
                  </p>
                </div>
                <p className="font-medium text-xl text-blue-500">
                  {stats.timesSaved}%
                </p>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="p-6 rounded-xl border border-indigo-500/20 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
              <h3 className="text-lg font-semibold flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
                  <BarChart className="h-5 w-5" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                  Statistiques Détaillées
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
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
                      className="text-blue-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-sm text-blue-500 font-medium">
                      Temps de réponse avec cache
                    </p>
                  </div>
                  <p className="font-semibold text-xl text-blue-600">
                    {stats.averageTimeWithCache}{" "}
                    <span className="text-sm font-normal text-blue-500/70">
                      ms
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
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
                      className="text-purple-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <p className="text-sm text-purple-500 font-medium">
                      Temps de réponse sans cache
                    </p>
                  </div>
                  <p className="font-semibold text-xl text-purple-600">
                    {stats.averageTimeWithoutCache}{" "}
                    <span className="text-sm font-normal text-purple-500/70">
                      ms
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
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
                      className="text-emerald-500"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <p className="text-sm text-emerald-500 font-medium">
                      Taux de hit
                    </p>
                  </div>
                  <p className="font-semibold text-xl text-emerald-600">
                    {stats.totalRequests > 0
                      ? Math.round(
                          (stats.cacheHits / stats.totalRequests) * 100
                        )
                      : 0}
                    <span className="text-sm font-normal text-emerald-500/70">
                      %
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
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
                      className="text-amber-500"
                    >
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <p className="text-sm text-amber-500 font-medium">
                      Requêtes à la base de données
                    </p>
                  </div>
                  <p className="font-semibold text-xl text-amber-600">
                    {stats.dbQueries}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Taux de Requêtes (par seconde)
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {requestRate}
                  </span>
                </div>
                <Slider
                  value={[requestRate]}
                  min={0.5}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setRequestRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Taille du Cache</label>
                  <span className="text-sm text-muted-foreground">
                    {cacheSize} éléments
                  </span>
                </div>
                <Slider
                  value={[cacheSize]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setCacheSize(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Distribution des Requêtes (% de popularité)
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {popularitySkew}%
                  </span>
                </div>
                <Slider
                  value={[popularitySkew]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setPopularitySkew(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Contrôle la probabilité qu&apos;une requête demande un élément
                  populaire (potentiellement en cache)
                </p>
              </div>
            </div>

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
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
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
