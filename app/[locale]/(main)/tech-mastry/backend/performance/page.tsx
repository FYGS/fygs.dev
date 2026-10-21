"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  CheckCircle2,
  Timer,
  Database,
  Server,
  Globe,
  Code2,
} from "lucide-react";
import { useState } from "react";

function CacheSimulator() {
  const [strategy, setStrategy] = useState<
    "cache-aside" | "write-through" | "write-behind" | "read-through"
  >("cache-aside");
  const [logs, setLogs] = useState<
    { action: string; source: string; time: number }[]
  >([]);
  const [simulating, setSimulating] = useState(false);

  const strategies = {
    "cache-aside": {
      name: "Cache-Aside (Lazy Loading)",
      desc: "App vérifie le cache d'abord. Cache miss → query DB → update cache.",
      steps: [
        { action: "GET user:123", source: "Cache", time: 1 },
        { action: "MISS — not in cache", source: "Cache", time: 1 },
        {
          action: "SELECT * FROM users WHERE id = 123",
          source: "Database",
          time: 45,
        },
        { action: "SET user:123 (TTL: 3600s)", source: "Cache", time: 2 },
        { action: "Return data to client", source: "App", time: 1 },
        {
          action: "--- Second request (cache hit) ---",
          source: "Info",
          time: 0,
        },
        { action: "GET user:123", source: "Cache", time: 1 },
        { action: "HIT — return cached data", source: "Cache", time: 1 },
      ],
    },
    "write-through": {
      name: "Write-Through",
      desc: "Écrit dans le cache ET la DB simultanément. Cohérence forte.",
      steps: [
        { action: "Write request: update user email", source: "App", time: 1 },
        {
          action: "UPDATE users SET email = ... WHERE id = 123",
          source: "Database",
          time: 35,
        },
        { action: "SET user:123 (updated data)", source: "Cache", time: 2 },
        { action: "Return success", source: "App", time: 1 },
        {
          action: "--- Read request (always cache hit) ---",
          source: "Info",
          time: 0,
        },
        { action: "GET user:123", source: "Cache", time: 1 },
        { action: "HIT — data always fresh", source: "Cache", time: 1 },
      ],
    },
    "write-behind": {
      name: "Write-Behind (Write-Back)",
      desc: "Écrit dans le cache, flush async vers la DB. Ultra rapide mais risque de perte.",
      steps: [
        { action: "Write request: update user email", source: "App", time: 1 },
        { action: "SET user:123 (immediate)", source: "Cache", time: 2 },
        { action: "Return success to client", source: "App", time: 1 },
        { action: "--- Async flush (background) ---", source: "Info", time: 0 },
        { action: "Batch write to DB (async)", source: "Database", time: 50 },
        { action: "Flush complete", source: "Database", time: 1 },
      ],
    },
    "read-through": {
      name: "Read-Through",
      desc: "Le cache charge lui-même depuis la DB. L'app ne parle qu'au cache.",
      steps: [
        { action: "GET user:123 (app → cache)", source: "Cache", time: 1 },
        { action: "MISS — cache auto-loads from DB", source: "Cache", time: 1 },
        {
          action: "SELECT * FROM users WHERE id = 123",
          source: "Database",
          time: 45,
        },
        { action: "Cache stores + returns data", source: "Cache", time: 2 },
        { action: "--- Second request ---", source: "Info", time: 0 },
        { action: "GET user:123", source: "Cache", time: 1 },
        { action: "HIT — return cached data", source: "Cache", time: 1 },
      ],
    },
  };
  const current = strategies[strategy];

  const simulate = () => {
    setLogs([]);
    setSimulating(true);
    current.steps.forEach((step, i) => {
      setTimeout(
        () => {
          setLogs((prev) => [...prev, step]);
          if (i === current.steps.length - 1) setSimulating(false);
        },
        (i + 1) * 400,
      );
    });
  };

  const sourceColor: Record<string, string> = {
    Cache: "text-cyan-400",
    Database: "text-orange-400",
    App: "text-green-400",
    Info: "text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Database className="w-6 h-6 text-cyan-400" /> Cache Simulator
      </h2>
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(strategies) as Array<keyof typeof strategies>).map(
          (key) => (
            <button
              key={key}
              onClick={() => {
                setStrategy(key);
                setLogs([]);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${strategy === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
            >
              {strategies[key].name.split(" (")[0]}
            </button>
          ),
        )}
      </div>
      <p className="text-sm text-muted-foreground">{current.desc}</p>
      <button
        onClick={simulate}
        disabled={simulating}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
      >
        {simulating ? "Simulating..." : "Run Simulation"}
      </button>
      <div className="space-y-1.5 min-h-[200px]">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/10 animate-fadeIn`}
          >
            <Badge
              variant="outline"
              className={`text-[10px] w-20 justify-center shrink-0 ${sourceColor[log.source]}`}
            >
              {log.source}
            </Badge>
            <span className="text-xs font-mono flex-1">{log.action}</span>
            {log.time > 0 && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {log.time}ms
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LatencyComparison() {
  const [showAll, setShowAll] = useState(false);
  const items = [
    { name: "L1 Cache ref", ns: 0.5, color: "bg-green-500" },
    { name: "L2 Cache ref", ns: 7, color: "bg-green-400" },
    { name: "RAM read", ns: 100, color: "bg-blue-500" },
    { name: "SSD read (4K)", ns: 150000, color: "bg-yellow-500" },
    { name: "HDD seek", ns: 10000000, color: "bg-orange-500" },
    { name: "Redis GET", ns: 500000, color: "bg-cyan-500" },
    { name: "Postgres query", ns: 5000000, color: "bg-purple-500" },
    { name: "SF → NYC round trip", ns: 40000000, color: "bg-red-500" },
    { name: "SF → London", ns: 81000000, color: "bg-red-400" },
  ];
  const maxLog = Math.log10(items[items.length - 1].ns);
  const displayed = showAll ? items : items.slice(0, 5);

  const formatNs = (ns: number) => {
    if (ns < 1000) return `${ns}ns`;
    if (ns < 1000000) return `${(ns / 1000).toFixed(0)}μs`;
    if (ns < 1000000000) return `${(ns / 1000000).toFixed(0)}ms`;
    return `${(ns / 1000000000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Timer className="w-6 h-6 text-yellow-400" /> Latency Numbers Every Dev
        Should Know
      </h2>
      <div className="space-y-3">
        {displayed.map((item) => {
          const width = (Math.log10(item.ns) / maxLog) * 100;
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{item.name}</span>
                <span className="font-mono text-muted-foreground">
                  {formatNs(item.ns)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${Math.max(width, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {!showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-primary hover:underline"
        >
          Voir tout ({items.length - 5} de plus)
        </button>
      )}
    </div>
  );
}

function OptimizationLayers() {
  const [activeLayer, setActiveLayer] = useState("database");
  const layers: Record<
    string,
    {
      name: string;
      icon: typeof Database;
      color: string;
      tips: { tip: string; impact: string }[];
    }
  > = {
    database: {
      name: "Database",
      icon: Database,
      color: "text-blue-400",
      tips: [
        {
          tip: "Index les colonnes WHERE / JOIN / ORDER BY",
          impact: "10-100x faster",
        },
        { tip: "Connection pooling (PgBouncer)", impact: "5-10x connections" },
        { tip: "Cursor-based pagination", impact: "Constant time" },
        { tip: "Read replicas pour les lectures", impact: "2x throughput" },
        {
          tip: "EXPLAIN ANALYZE pour chaque query lente",
          impact: "Debug tool",
        },
      ],
    },
    application: {
      name: "Application",
      icon: Code2,
      color: "text-green-400",
      tips: [
        {
          tip: "Response compression (Brotli > gzip)",
          impact: "60-80% smaller",
        },
        { tip: "HTTP/2 multiplexing", impact: "Parallel requests" },
        { tip: "Async processing (job queues)", impact: "Non-blocking" },
        { tip: "Batch operations vs N+1", impact: "N queries → 1" },
        { tip: "Streaming responses (SSE, chunks)", impact: "TTFB reduced" },
      ],
    },
    infrastructure: {
      name: "Infrastructure",
      icon: Server,
      color: "text-purple-400",
      tips: [
        { tip: "CDN pour les assets statiques", impact: "~5ms latency" },
        { tip: "Auto-scaling horizontal", impact: "Handle spikes" },
        {
          tip: "Load balancer (least-connections)",
          impact: "Even distribution",
        },
        { tip: "Edge computing (Cloudflare Workers)", impact: "Global ~20ms" },
        { tip: "Container orchestration (K8s)", impact: "Auto-healing" },
      ],
    },
    monitoring: {
      name: "Monitoring",
      icon: Globe,
      color: "text-orange-400",
      tips: [
        {
          tip: "APM (Application Performance Monitoring)",
          impact: "Visibility",
        },
        { tip: "Prometheus + Grafana dashboards", impact: "Real-time metrics" },
        { tip: "Distributed tracing (Jaeger/Zipkin)", impact: "Debug latency" },
        {
          tip: "Performance budgets (Lighthouse CI)",
          impact: "Regression guard",
        },
        { tip: "SLO/SLI alerting", impact: "Proactive fixes" },
      ],
    },
  };
  const current = layers[activeLayer];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Optimisations par Couche</h2>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(layers).map(([key, l]) => {
          const I = l.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeLayer === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
            >
              <I className="w-4 h-4" /> {l.name}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {current.tips.map((t) => (
          <div
            key={t.tip}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/10 transition-colors"
          >
            <CheckCircle2 className={`w-4 h-4 ${current.color} shrink-0`} />
            <span className="text-sm flex-1">{t.tip}</span>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {t.impact}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function RedisPatterns() {
  const [activePattern, setActivePattern] = useState(0);
  const patterns = [
    {
      name: "Cache-Aside",
      code: `async function getUser(id: string): Promise<User> {
  // 1. Check cache
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached); // Cache HIT

  // 2. Cache miss → query DB
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  // 3. Update cache with TTL (1 hour)
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));
  return user;
}`,
    },
    {
      name: "Invalidation",
      code: `// Invalidate on write
async function updateUser(id: string, data: UpdateData) {
  const user = await prisma.user.update({ where: { id }, data });
  await redis.del(\`user:\${id}\`);  // Invalidate cache
  return user;
}

// Pattern: Cache + Write-Through
async function updateWithWriteThrough(id: string, data: UpdateData) {
  const user = await prisma.user.update({ where: { id }, data });
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user)); // Re-cache
  return user;
}`,
    },
    {
      name: "Rate Limiting",
      code: `async function rateLimit(ip: string, limit = 100, window = 60) {
  const key = \`rate:\${ip}\`;
  const requests = await redis.incr(key);

  if (requests === 1) {
    await redis.expire(key, window); // Set TTL on first request
  }

  if (requests > limit) {
    const ttl = await redis.ttl(key);
    throw new TooManyRequestsError(\`Rate limit exceeded. Retry in \${ttl}s\`);
  }

  return { remaining: limit - requests, limit, reset: await redis.ttl(key) };
}`,
    },
    {
      name: "Session Store",
      code: `// Store session in Redis
async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session = { userId, createdAt: Date.now(), ip: req.ip };

  await redis.setex(
    \`session:\${sessionId}\`,
    86400, // 24 hours
    JSON.stringify(session)
  );

  return sessionId;
}

// Validate session
async function getSession(sessionId: string) {
  const data = await redis.get(\`session:\${sessionId}\`);
  if (!data) throw new UnauthorizedError("Invalid session");
  return JSON.parse(data);
}

// Logout — instant revocation
async function destroySession(sessionId: string) {
  await redis.del(\`session:\${sessionId}\`);
}`,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="w-6 h-6 text-red-400" /> Redis Patterns
      </h2>
      <div className="flex gap-2 flex-wrap">
        {patterns.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePattern(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activePattern === i ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20 max-h-[350px] overflow-y-auto" tabIndex={0}>
        <code>{patterns[activePattern].code}</code>
      </pre>
    </div>
  );
}

export default function BackendPerformancePage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Performance & Scaling
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simulateur de cache, latency numbers, optimisations par couche et
            Redis patterns &mdash; maîtrisez la performance backend.
          </p>
        </div>
      </section>

      <Card className="p-8 border-border/40">
        <CacheSimulator />
      </Card>
      <Card className="p-8 border-border/40">
        <LatencyComparison />
      </Card>
      <Card className="p-8 border-border/40">
        <OptimizationLayers />
      </Card>
      <Card className="p-8 border-border/40">
        <RedisPatterns />
      </Card>
    </div>
  );
}
