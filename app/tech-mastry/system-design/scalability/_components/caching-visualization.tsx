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
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Visualisation du Caching
        </CardTitle>
        <CardDescription>
          Découvrez comment le caching améliore les performances en réduisant
          les accès à la base de données.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={cache.strategy === "lru" ? "default" : "outline"}
                size="sm"
                onClick={() => changeStrategy("lru")}
              >
                LRU (Least Recently Used)
              </Button>
              <Button
                variant={cache.strategy === "fifo" ? "default" : "outline"}
                size="sm"
                onClick={() => changeStrategy("fifo")}
              >
                FIFO (First In First Out)
              </Button>
              <Button
                variant={cache.strategy === "random" ? "default" : "outline"}
                size="sm"
                onClick={() => changeStrategy("random")}
              >
                Random Replacement
              </Button>

              <div className="ml-auto">
                <Button
                  variant={cache.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleCache}
                >
                  {cache.enabled ? "Désactiver" : "Activer"} le Cache
                </Button>
              </div>
            </div>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {/* Client */}
                <g transform="translate(100, 200)">
                  <rect
                    x="-60"
                    y="-30"
                    width="120"
                    height="60"
                    rx="5"
                    fill="currentColor"
                    className="text-slate-200 dark:text-slate-800 stroke-slate-400"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    Client
                  </text>
                </g>

                {/* Cache */}
                <g transform="translate(300, 100)">
                  <rect
                    x="-80"
                    y="-60"
                    width="160"
                    height="120"
                    rx="5"
                    fill={
                      cache.enabled
                        ? "rgba(99, 102, 241, 0.1)"
                        : "rgba(100, 116, 139, 0.1)"
                    }
                    stroke={cache.enabled ? "#6366f1" : "#64748b"}
                    strokeWidth="2"
                    strokeDasharray={cache.enabled ? "none" : "5,5"}
                  />
                  <text
                    x="0"
                    y="-40"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
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
                            rx="3"
                            fill={item.color}
                            opacity="0.7"
                          />
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
                  <rect
                    x="-60"
                    y="-40"
                    width="120"
                    height="80"
                    rx="5"
                    fill="rgba(20, 184, 166, 0.1)"
                    stroke="#14b8a6"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#14b8a6"
                  >
                    Database
                  </text>
                </g>

                {/* Paths */}
                <path
                  d="M 160,200 L 220,100"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />
                <path
                  d="M 160,200 L 440,200"
                  stroke="#64748b"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 380,100 L 440,200"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />

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
                      <circle
                        r="6"
                        fill={request.color}
                        opacity={
                          request.status === "completed" ||
                          request.status === "cache-hit"
                            ? 0.5
                            : 1
                        }
                      />
                      <text
                        x="0"
                        y="-10"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#1e293b"
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
                  <text
                    x="0"
                    y="-60"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#1e293b"
                  >
                    Légende
                  </text>
                  <rect
                    x="-40"
                    y="-50"
                    width="80"
                    height="60"
                    rx="3"
                    fill="#f8fafc"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />

                  <circle cx="-30" cy="-30" r="4" fill="#3b82f6" />
                  <text
                    x="-20"
                    y="-27"
                    fontSize="8"
                    textAnchor="start"
                    fill="#1e293b"
                  >
                    Requête
                  </text>

                  <circle cx="-30" cy="-15" r="4" fill="#10b981" />
                  <text
                    x="-20"
                    y="-12"
                    fontSize="8"
                    textAnchor="start"
                    fill="#1e293b"
                  >
                    Cache Hit
                  </text>

                  <circle cx="-30" cy="0" r="4" fill="#f59e0b" />
                  <text
                    x="-20"
                    y="3"
                    fontSize="8"
                    textAnchor="start"
                    fill="#1e293b"
                  >
                    Cache Miss
                  </text>
                </g>
              </svg>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={() => setIsRunning(!isRunning)}
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

                <Button variant="outline" onClick={resetSimulation}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Requêtes Totales
                </p>
                <p className="font-medium">{stats.totalRequests}</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Cache Hits</p>
                <p className="font-medium text-green-500">{stats.cacheHits}</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Cache Misses
                </p>
                <p className="font-medium text-yellow-500">
                  {stats.cacheMisses}
                </p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Temps Économisé
                </p>
                <p className="font-medium">{stats.timesSaved}%</p>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-primary" />
                Statistiques Détaillées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Temps de réponse avec cache
                  </p>
                  <p className="font-medium">{stats.averageTimeWithCache} ms</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Temps de réponse sans cache
                  </p>
                  <p className="font-medium">
                    {stats.averageTimeWithoutCache} ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Taux de hit
                  </p>
                  <p className="font-medium">
                    {stats.totalRequests > 0
                      ? Math.round(
                          (stats.cacheHits / stats.totalRequests) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Requêtes à la base de données
                  </p>
                  <p className="font-medium">{stats.dbQueries}</p>
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
              <Button onClick={() => setActiveTab("visualization")}>
                Retour à la Visualisation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
