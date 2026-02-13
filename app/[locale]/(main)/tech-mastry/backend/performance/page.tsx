import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Performance Backend | TechMastry",
  description: "Caching, load balancing, message queues et profiling pour des backends performants",
};

const cachingStrategies = [
  { name: "Cache-Aside (Lazy Loading)", desc: "App vérifie le cache d'abord. Cache miss → query DB → update cache. Le plus courant.", pattern: "Read: Cache → Miss → DB → Write Cache\nTTL pour l'invalidation" },
  { name: "Write-Through", desc: "App écrit dans le cache ET la DB simultanément. Coherence forte mais writes plus lents.", pattern: "Write: Cache + DB simultanément\nLecture toujours depuis le cache" },
  { name: "Write-Behind (Write-Back)", desc: "App écrit dans le cache, qui flush async vers la DB. Ultra rapide mais risque de perte.", pattern: "Write: Cache (async → DB)\nRisque si crash avant flush" },
  { name: "Read-Through", desc: "Le cache charge lui-même depuis la DB en cas de miss. L'app ne parle qu'au cache.", pattern: "Read: Cache auto-load from DB\nApp ne connaît que le cache" },
];

const optimizations = [
  { area: "Database", tips: ["Indexation des colonnes WHERE/JOIN/ORDER BY", "Connection pooling (PgBouncer)", "Query pagination (cursor-based)", "Read replicas pour les lectures"] },
  { area: "Application", tips: ["Response compression (gzip/brotli)", "HTTP/2 multiplexing", "Connection keep-alive", "Async processing (queues)"] },
  { area: "Infrastructure", tips: ["CDN pour les assets statiques", "Auto-scaling horizontal", "Load balancer (round-robin/least-connections)", "Edge computing"] },
  { area: "Code", tips: ["Profiling (flamegraphs)", "Memory leak detection", "Batch operations vs N+1", "Lazy evaluation"] },
];

export default function BackendPerformancePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Performance & Scaling</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stratégies de mise en cache, optimisation des requêtes et scaling
            pour des applications backend ultra-performantes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Stratégies de Cache</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cachingStrategies.map((s) => (
            <Card key={s.name} className="p-6 space-y-3 border-border/40">
              <h3 className="font-semibold text-primary">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              <pre className="bg-muted/30 rounded p-2 text-xs text-muted-foreground">{s.pattern}</pre>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Optimisations par Couche</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {optimizations.map((o) => (
            <Card key={o.area} className="p-6 space-y-3 border-border/40">
              <h3 className="font-semibold text-lg">{o.area}</h3>
              <ul className="space-y-1.5">
                {o.tips.map((t) => (
                  <li key={t} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>{t}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Redis Patterns</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`// Cache-Aside pattern with Redis
async function getUser(id: string): Promise<User> {
  // 1. Check cache
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss → query DB
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  // 3. Update cache with TTL
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));

  return user;
}

// Invalidation on write
async function updateUser(id: string, data: UpdateData) {
  const user = await prisma.user.update({ where: { id }, data });
  await redis.del(\`user:\${id}\`); // Invalidate cache
  return user;
}`}</code>
        </pre>
      </section>
    </main>
  );
}
