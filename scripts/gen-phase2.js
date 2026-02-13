// Phase 2 — Improve weak sections
const fs = require("fs");
const path = require("path");
const BASE = path.join(
  __dirname,
  "..",
  "app",
  "[locale]",
  "(main)",
  "tech-mastry",
);

function w(rel, content) {
  const fp = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content.trimStart(), "utf8");
  console.log(`  Created: ${rel}`);
}

// =============================================================
//  P2.1 — BACKEND REFONTE (missing sub-pages: architecture, performance, devops)
// =============================================================
console.log("\n=== P2.1 BACKEND REFONTE ===");

w(
  "backend/architecture/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Architecture Backend | TechMastry",
  description: "Patterns d'architecture backend : MVC, Clean Architecture, CQRS, Event Sourcing et Repository",
};

const patterns = [
  {
    name: "MVC (Model-View-Controller)",
    desc: "Séparation claire entre données (Model), interface (View) et logique (Controller). Le pattern le plus répandu.",
    pros: ["Simple à comprendre", "Séparation des préoccupations", "Testable"],
    cons: ["Controllers obèses", "Couplage View-Model", "Difficile à scaler"],
    code: \`// Controller
class UserController {
  async getUser(req: Request, res: Response) {
    const user = await UserModel.findById(req.params.id);
    res.json(UserView.render(user));
  }
}\`,
    color: "border-blue-500/30",
  },
  {
    name: "Repository Pattern",
    desc: "Abstraction de la couche d'accès aux données. Découple la logique métier du stockage.",
    pros: ["Testable (mock repos)", "Interchangeable (SQL→NoSQL)", "Clean interfaces"],
    cons: ["Boilerplate", "Can leak abstractions"],
    code: \`interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

class PrismaUserRepository implements UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
  // ...
}\`,
    color: "border-green-500/30",
  },
  {
    name: "CQRS",
    desc: "Command Query Responsibility Segregation. Sépare les lectures des écritures pour optimiser chaque chemin.",
    pros: ["Performance optimisée", "Scalabilité indépendante", "Modèles read/write spécifiques"],
    cons: ["Complexité accrue", "Eventual consistency", "Plus de code"],
    code: \`// Command (écriture)
class CreateOrderCommand {
  constructor(
    public userId: string,
    public items: OrderItem[]
  ) {}
}

// Query (lecture) — modèle optimisé
class OrderReadModel {
  async getOrderSummary(orderId: string) {
    return db.query(\\\`
      SELECT o.*, u.name, COUNT(i.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN items i ON i.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id, u.name
    \\\`, [orderId]);
  }
}\`,
    color: "border-purple-500/30",
  },
  {
    name: "Event Sourcing",
    desc: "Au lieu de stocker l'état actuel, stockez tous les événements qui ont mené à cet état. Rejouer pour reconstruire.",
    pros: ["Audit trail complet", "Time travel debugging", "Replay & projection"],
    cons: ["Complexité", "Storage important", "Schema evolution"],
    code: \`// Store events, not state
const events = [
  { type: "OrderCreated", data: { id: "1", userId: "u1" } },
  { type: "ItemAdded", data: { orderId: "1", product: "Widget" } },
  { type: "ItemAdded", data: { orderId: "1", product: "Gadget" } },
  { type: "OrderConfirmed", data: { orderId: "1" } },
];

// Rebuild state by replaying events
function rebuildOrder(events: Event[]): Order {
  return events.reduce((order, event) => {
    switch (event.type) {
      case "OrderCreated": return { ...event.data, items: [], status: "draft" };
      case "ItemAdded": return { ...order, items: [...order.items, event.data.product] };
      case "OrderConfirmed": return { ...order, status: "confirmed" };
    }
  }, {} as Order);
}\`,
    color: "border-orange-500/30",
  },
];

export default function BackendArchitecturePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Architecture Backend</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Patterns d&apos;architecture pour structurer vos applications backend :
            MVC, Repository, CQRS et Event Sourcing.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {patterns.map((p) => (
          <Card key={p.name} className={"p-8 space-y-4 border-2 " + p.color}>
            <h2 className="text-2xl font-bold">{p.name}</h2>
            <p className="text-muted-foreground">{p.desc}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                {p.pros.map((pro) => (
                  <p key={pro} className="text-sm text-muted-foreground">✅ {pro}</p>
                ))}
              </div>
              <div>
                {p.cons.map((con) => (
                  <p key={con} className="text-sm text-muted-foreground">⚠️ {con}</p>
                ))}
              </div>
            </div>
            <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{p.code}</code>
            </pre>
          </Card>
        ))}
      </div>
    </main>
  );
}
`,
);

w(
  "backend/performance/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Performance Backend | TechMastry",
  description: "Caching, load balancing, message queues et profiling pour des backends performants",
};

const cachingStrategies = [
  { name: "Cache-Aside (Lazy Loading)", desc: "App vérifie le cache d'abord. Cache miss → query DB → update cache. Le plus courant.", pattern: "Read: Cache → Miss → DB → Write Cache\\nTTL pour l'invalidation" },
  { name: "Write-Through", desc: "App écrit dans le cache ET la DB simultanément. Coherence forte mais writes plus lents.", pattern: "Write: Cache + DB simultanément\\nLecture toujours depuis le cache" },
  { name: "Write-Behind (Write-Back)", desc: "App écrit dans le cache, qui flush async vers la DB. Ultra rapide mais risque de perte.", pattern: "Write: Cache (async → DB)\\nRisque si crash avant flush" },
  { name: "Read-Through", desc: "Le cache charge lui-même depuis la DB en cas de miss. L'app ne parle qu'au cache.", pattern: "Read: Cache auto-load from DB\\nApp ne connaît que le cache" },
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
          <code>{\`// Cache-Aside pattern with Redis
async function getUser(id: string): Promise<User> {
  // 1. Check cache
  const cached = await redis.get(\\\`user:\\\${id}\\\`);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss → query DB
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  // 3. Update cache with TTL
  await redis.setex(\\\`user:\\\${id}\\\`, 3600, JSON.stringify(user));

  return user;
}

// Invalidation on write
async function updateUser(id: string, data: UpdateData) {
  const user = await prisma.user.update({ where: { id }, data });
  await redis.del(\\\`user:\\\${id}\\\`); // Invalidate cache
  return user;
}\`}</code>
        </pre>
      </section>
    </main>
  );
}
`,
);

w(
  "backend/devops/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DevOps & Infrastructure | TechMastry",
  description: "Docker, CI/CD, monitoring et infrastructure cloud pour le backend",
};

const devopsTopics = [
  {
    title: "Conteneurisation",
    desc: "Docker pour l'isolation et la reproductibilité des environnements.",
    link: "/tech-mastry/security-devops/docker-kubernetes",
    tags: ["Docker", "Multi-stage", "Docker Compose"],
  },
  {
    title: "CI/CD",
    desc: "Pipelines d'intégration et de déploiement continus.",
    link: "/tech-mastry/security-devops/cicd",
    tags: ["GitHub Actions", "Tests", "Deploy"],
  },
  {
    title: "Monitoring",
    desc: "Observabilité et fiabilité des systèmes en production.",
    link: "/tech-mastry/system-design/monitoring",
    tags: ["Logs", "Metrics", "Traces", "SLO"],
  },
  {
    title: "Cloud Native",
    desc: "Architecture 12-Factor et principes cloud native.",
    link: "/tech-mastry/security-devops/cloud-native",
    tags: ["12-Factor", "Serverless", "IaC"],
  },
];

const infraChecklist = [
  "Environnements séparés : dev / staging / production",
  "Infrastructure as Code (Terraform, Pulumi, CDK)",
  "Secrets management (Vault, AWS Secrets Manager)",
  "Logging centralisé (ELK, Loki)",
  "Alerting configuré (PagerDuty, OpsGenie)",
  "Backup automatisé et testé",
  "Disaster Recovery Plan documenté",
  "Auto-scaling configuré avec métriques",
  "Health checks et readiness probes",
  "SSL/TLS automatisé (Let's Encrypt, cert-manager)",
];

export default function BackendDevopsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Terminal className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">DevOps & Infrastructure</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les pratiques DevOps essentielles pour déployer et opérer
            vos applications backend en production.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Sujets Clés</h2>
        <p className="text-muted-foreground">Ces sujets sont couverts en détail dans les sections dédiées :</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devopsTopics.map((t) => (
            <Link key={t.title} href={t.link}>
              <Card className="p-6 space-y-3 h-full border-border/40 hover:border-primary/30 hover:shadow-lg transition-all group">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Checklist Production-Ready</h2>
        <Card className="p-6 border-border/40">
          <div className="space-y-3">
            {infraChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary/30 mt-0.5">
                  <span className="text-primary text-xs">\u2713</span>
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
`,
);

console.log("P2.1 Backend refonte: DONE (3 new sub-pages)");

// =============================================================
//  P2.2 — DATA STRUCTURES EXPANSION (hash maps, graphs, heaps, stacks, queues)
// =============================================================
console.log("\n=== P2.2 DATA STRUCTURES EXPANSION ===");

w(
  "data-structures/hash-maps/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";

export const metadata: Metadata = {
  title: "Hash Maps | Structures de Données",
  description: "Tables de hachage, collisions, load factor et implémentation des hash maps",
};

const operations = [
  { op: "get(key)", avg: "O(1)", worst: "O(n)", desc: "Recherche par clé" },
  { op: "set(key, val)", avg: "O(1)", worst: "O(n)", desc: "Insertion / mise à jour" },
  { op: "delete(key)", avg: "O(1)", worst: "O(n)", desc: "Suppression" },
  { op: "has(key)", avg: "O(1)", worst: "O(n)", desc: "Vérification d'existence" },
];

const collisionStrategies = [
  {
    name: "Chaînage (Chaining)",
    desc: "Chaque bucket contient une liste chaînée. Nouvelle entrée ajoutée en tête de liste en cas de collision.",
    pros: ["Simple à implémenter", "Supporte un load factor > 1", "Suppression facile"],
    cons: ["Cache-unfriendly (pointeurs)", "Mémoire supplémentaire pour les listes"],
  },
  {
    name: "Adressage Ouvert (Open Addressing)",
    desc: "En cas de collision, probe le prochain slot libre. Types : Linear probing, Quadratic probing, Double hashing.",
    pros: ["Cache-friendly", "Pas de pointeurs supplémentaires", "Bon pour les petites tables"],
    cons: ["Clustering", "Load factor doit rester < 0.7", "Suppression complexe (tombstones)"],
  },
];

export default function HashMapsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Hash className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Hash Maps</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tables de hachage : la structure de données la plus utilisée.
            Accès en O(1) moyen, gestion des collisions et optimisations.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Complexité des Opérations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">Moyenne</th>
                <th className="text-left py-3 px-4 font-semibold">Pire cas</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.op} className="border-b border-border/40">
                  <td className="py-3 px-4 font-mono text-primary">{o.op}</td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">{o.avg}</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-red-500/10 text-red-500">{o.worst}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{o.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Gestion des Collisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collisionStrategies.map((s) => (
            <Card key={s.name} className="p-6 space-y-3 border-border/40">
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  {s.pros.map((p) => <p key={p} className="text-xs text-muted-foreground">✅ {p}</p>)}
                </div>
                <div>
                  {s.cons.map((c) => <p key={c} className="text-xs text-muted-foreground">⚠️ {c}</p>)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Implémentation TypeScript</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{\`class HashMap<K, V> {
  private buckets: Array<Array<[K, V]>>;
  private size: number = 0;
  private capacity: number;

  constructor(capacity = 16) {
    this.capacity = capacity;
    this.buckets = new Array(capacity).fill(null).map(() => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.capacity;
    }
    return hash;
  }

  set(key: K, value: V): void {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.findIndex(([k]) => k === key);
    if (existing !== -1) {
      bucket[existing] = [key, value]; // Update
    } else {
      bucket.push([key, value]); // Insert
      this.size++;
      if (this.size / this.capacity > 0.75) this.resize();
    }
  }

  get(key: K): V | undefined {
    const idx = this.hash(key);
    const pair = this.buckets[idx].find(([k]) => k === key);
    return pair?.[1];
  }
}\`}</code>
        </pre>
      </section>
    </main>
  );
}
`,
);

w(
  "data-structures/graphs/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitFork } from "lucide-react";

export const metadata: Metadata = {
  title: "Graphes | Structures de Données",
  description: "Graphes dirigés et non-dirigés, BFS, DFS, Dijkstra et algorithmes de graphes",
};

const graphTypes = [
  { type: "Non-dirigé", desc: "Arêtes bidirectionnelles. Amitié sur Facebook.", color: "text-blue-500" },
  { type: "Dirigé (Digraph)", desc: "Arêtes unidirectionnelles. Following sur Twitter.", color: "text-green-500" },
  { type: "Pondéré", desc: "Arêtes avec poids/coût. Routes avec distances.", color: "text-purple-500" },
  { type: "Cyclique vs Acyclique", desc: "DAG (Directed Acyclic Graph) : builds, dépendances, topological sort.", color: "text-orange-500" },
];

const algorithms = [
  { name: "BFS (Breadth-First)", complexity: "O(V+E)", use: "Plus court chemin (non-pondéré), level-order traversal" },
  { name: "DFS (Depth-First)", complexity: "O(V+E)", use: "Détection de cycles, topological sort, composantes connexes" },
  { name: "Dijkstra", complexity: "O((V+E) log V)", use: "Plus court chemin (pondéré, positif)" },
  { name: "Bellman-Ford", complexity: "O(V×E)", use: "Plus court chemin (pondéré, négatif autorisé)" },
  { name: "Topological Sort", complexity: "O(V+E)", use: "Ordonnancement de tâches, résolution de dépendances" },
  { name: "Union-Find", complexity: "O(α(n)) \u2248 O(1)", use: "Composantes connexes, détection de cycles" },
];

export default function GraphsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <GitFork className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Graphes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La structure de données la plus flexible. Modélise les réseaux,
            les relations et les dépendances complexes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Types de Graphes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {graphTypes.map((g) => (
            <Card key={g.type} className="p-5 border-border/40">
              <h3 className={"font-semibold " + g.color}>{g.type}</h3>
              <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Algorithmes Essentiels</h2>
        <div className="space-y-3">
          {algorithms.map((a) => (
            <Card key={a.name} className="p-5 border-border/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold">{a.name}</h3>
                <Badge className="bg-primary/10 text-primary">{a.complexity}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{a.use}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Représentations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-blue-500/30">
            <h3 className="font-semibold text-blue-500">Liste d&apos;Adjacence</h3>
            <p className="text-sm text-muted-foreground">Espace : O(V+E). Idéal pour les graphes sparse.</p>
            <pre className="bg-muted/30 rounded p-3 text-xs">
              <code>{\`const graph = new Map<number, number[]>();
graph.set(0, [1, 2]);
graph.set(1, [2]);
graph.set(2, [0, 3]);
graph.set(3, [3]);\`}</code>
            </pre>
          </Card>
          <Card className="p-6 space-y-3 border-green-500/30">
            <h3 className="font-semibold text-green-500">Matrice d&apos;Adjacence</h3>
            <p className="text-sm text-muted-foreground">Espace : O(V\u00b2). Idéal pour les graphes dense.</p>
            <pre className="bg-muted/30 rounded p-3 text-xs">
              <code>{\`const matrix = [
  [0, 1, 1, 0],  // 0 → 1, 2
  [0, 0, 1, 0],  // 1 → 2
  [1, 0, 0, 1],  // 2 → 0, 3
  [0, 0, 0, 1],  // 3 → 3
];\`}</code>
            </pre>
          </Card>
        </div>
      </section>
    </main>
  );
}
`,
);

w(
  "data-structures/heaps/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Heaps (Tas) | Structures de Données",
  description: "Min-heap, max-heap, priority queue et implémentation des tas binaires",
};

const operations = [
  { op: "insert", complexity: "O(log n)", desc: "Insérer un élément et bubble up" },
  { op: "extractMin/Max", complexity: "O(log n)", desc: "Retirer le min/max et heapify" },
  { op: "peek", complexity: "O(1)", desc: "Voir le min/max sans le retirer" },
  { op: "buildHeap", complexity: "O(n)", desc: "Construire un heap depuis un tableau" },
  { op: "heapSort", complexity: "O(n log n)", desc: "Tri par tas (in-place, pas stable)" },
];

const useCases = [
  "Priority Queue : planification de tâches par priorité",
  "Dijkstra : extraire le nœud avec la plus petite distance",
  "Top-K éléments : maintenir les K plus grands/petits en O(n log k)",
  "Median stream : 2 heaps (max-heap + min-heap) pour la médiane en O(log n)",
  "Merge K sorted lists : min-heap avec 1 élément de chaque liste",
  "Huffman coding : construction de l'arbre de compression",
];

export default function HeapsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-500/10 text-violet-500">
          <ArrowUpDown className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Heaps (Tas)</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Arbre binaire complet avec propriété de tas. Parfait pour les
            priority queues et les algorithmes de sélection.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Opérations</h2>
        <div className="space-y-3">
          {operations.map((o) => (
            <Card key={o.op} className="p-4 border-border/40 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <code className="text-primary font-mono text-sm">{o.op}</code>
                <span className="text-sm text-muted-foreground">{o.desc}</span>
              </div>
              <Badge className="bg-primary/10 text-primary">{o.complexity}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Propriétés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-green-500/30">
            <h3 className="font-semibold text-green-500">Min-Heap</h3>
            <p className="text-sm text-muted-foreground">Parent \u2264 enfants. La racine est le minimum.</p>
            <p className="text-sm text-muted-foreground">Stocké en tableau : parent(i) = floor((i-1)/2), left(i) = 2i+1, right(i) = 2i+2</p>
          </Card>
          <Card className="p-6 space-y-3 border-blue-500/30">
            <h3 className="font-semibold text-blue-500">Max-Heap</h3>
            <p className="text-sm text-muted-foreground">Parent \u2265 enfants. La racine est le maximum.</p>
            <p className="text-sm text-muted-foreground">Même formules d&apos;index. Inverser la comparaison.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Cas d&apos;Usage</h2>
        <Card className="p-6 border-border/40">
          <ul className="space-y-2">
            {useCases.map((uc) => (
              <li key={uc} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">\u2192</span>{uc}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Implémentation Min-Heap</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{\`class MinHeap {
  private heap: number[] = [];

  insert(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return min;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private heapifyDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}\`}</code>
        </pre>
      </section>
    </main>
  );
}
`,
);

w(
  "data-structures/stacks-queues/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Piles & Files | Structures de Données",
  description: "Stack (LIFO), Queue (FIFO), Deque et leurs applications en algorithmique",
};

const stackOps = [
  { op: "push", complexity: "O(1)", desc: "Ajouter au sommet" },
  { op: "pop", complexity: "O(1)", desc: "Retirer du sommet" },
  { op: "peek", complexity: "O(1)", desc: "Voir le sommet sans retirer" },
  { op: "isEmpty", complexity: "O(1)", desc: "Vérifier si vide" },
];

const queueOps = [
  { op: "enqueue", complexity: "O(1)", desc: "Ajouter à la fin" },
  { op: "dequeue", complexity: "O(1)", desc: "Retirer du début" },
  { op: "front", complexity: "O(1)", desc: "Voir le premier élément" },
  { op: "isEmpty", complexity: "O(1)", desc: "Vérifier si vide" },
];

const stackUses = [
  "Call stack : gestion des appels de fonctions",
  "Undo/Redo : historique des actions",
  "Parenthèses balancées : validation d'expressions",
  "DFS (Depth-First Search) : parcours de graphe",
  "Évaluation d'expressions postfixées (RPN)",
  "Backtracking : exploration puis retour",
];

const queueUses = [
  "BFS (Breadth-First Search) : parcours de graphe",
  "Task scheduling : planification de tâches",
  "Message queues (Kafka, RabbitMQ)",
  "Rate limiting : fenêtre glissante",
  "Print queue : ordre d'impression",
  "Cache eviction (FIFO policy)",
];

export default function StacksQueuesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-500">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Piles & Files</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stack (LIFO) et Queue (FIFO) : les structures linéaires fondamentales.
            Simples mais omniprésentes en algorithmique.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stack */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-blue-500">Stack (LIFO)</h2>
          <p className="text-muted-foreground">Last In, First Out. Comme une pile d&apos;assiettes.</p>

          <div className="space-y-2">
            {stackOps.map((o) => (
              <Card key={o.op} className="p-3 border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono text-sm">{o.op}</code>
                  <span className="text-xs text-muted-foreground">{o.desc}</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 text-xs">{o.complexity}</Badge>
              </Card>
            ))}
          </div>

          <Card className="p-4 border-blue-500/20">
            <h3 className="font-semibold text-sm mb-2">Applications</h3>
            <ul className="space-y-1">
              {stackUses.map((u) => (
                <li key={u} className="text-xs text-muted-foreground">\u2192 {u}</li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Queue */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-green-500">Queue (FIFO)</h2>
          <p className="text-muted-foreground">First In, First Out. Comme une file d&apos;attente.</p>

          <div className="space-y-2">
            {queueOps.map((o) => (
              <Card key={o.op} className="p-3 border-green-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono text-sm">{o.op}</code>
                  <span className="text-xs text-muted-foreground">{o.desc}</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 text-xs">{o.complexity}</Badge>
              </Card>
            ))}
          </div>

          <Card className="p-4 border-green-500/20">
            <h3 className="font-semibold text-sm mb-2">Applications</h3>
            <ul className="space-y-1">
              {queueUses.map((u) => (
                <li key={u} className="text-xs text-muted-foreground">\u2192 {u}</li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Variantes Avancées</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-border/40">
            <h3 className="font-semibold text-purple-500">Deque</h3>
            <p className="text-sm text-muted-foreground mt-1">Double-ended queue. Insertion/suppression aux deux extrémités en O(1). Sliding window maximum.</p>
          </Card>
          <Card className="p-5 border-border/40">
            <h3 className="font-semibold text-orange-500">Priority Queue</h3>
            <p className="text-sm text-muted-foreground mt-1">Queue avec priorité. Implémentée via un Heap. Extraction du min/max en O(log n).</p>
          </Card>
          <Card className="p-5 border-border/40">
            <h3 className="font-semibold text-red-500">Circular Queue</h3>
            <p className="text-sm text-muted-foreground mt-1">Queue circulaire avec taille fixe. Buffer circulaire. Réutilise les espaces libérés.</p>
          </Card>
        </div>
      </section>
    </main>
  );
}
`,
);

console.log("P2.2 Data Structures expansion: DONE (4 new sub-pages)");

// =============================================================
//  P2.6 — PREPARATION ENHANCEMENT (timeline, checklists)
// =============================================================
console.log("\n=== P2.6 PREPARATION ENHANCEMENT ===");

// Read existing preparation-guide and enhance the page with additional sections
w(
  "preparation/_components/preparation-timeline.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const timelines = [
  {
    id: "1month",
    label: "1 Mois",
    weeks: [
      {
        week: "Semaine 1",
        focus: "Fondamentaux",
        tasks: [
          "Réviser les structures de données (arrays, linked lists, trees, hash maps)",
          "Pratiquer 2-3 problèmes Easy par jour sur LeetCode",
          "Lire les chapitres 1-5 de Cracking the Coding Interview",
          "Configurer votre environnement de pratique",
        ],
      },
      {
        week: "Semaine 2",
        focus: "Algorithmes",
        tasks: [
          "Tri, recherche, BFS/DFS, programmation dynamique",
          "Pratiquer 2 Medium par jour",
          "Commencer System Design : lire le chapitre 1 d'Alex Xu",
          "Préparer 3 projets STAR pour le behavioral",
        ],
      },
      {
        week: "Semaine 3",
        focus: "System Design & Behavioral",
        tasks: [
          "1 System Design par jour (URL shortener, chat, parking lot)",
          "1 Medium/Hard algorithme par jour",
          "Pratiquer les questions behavioral avec un ami",
          "Rechercher les entreprises cibles",
        ],
      },
      {
        week: "Semaine 4",
        focus: "Polish & Mock",
        tasks: [
          "2-3 mock interviews complètes",
          "Révisez vos points faibles",
          "Préparer les questions à poser aux intervieweurs",
          "Préparer la logistique (connexion, caméra, environnement calme)",
        ],
      },
    ],
  },
  {
    id: "3months",
    label: "3 Mois",
    weeks: [
      {
        week: "Mois 1",
        focus: "Fondations solides",
        tasks: [
          "2 problèmes Easy + 1 Medium par jour",
          "Maîtriser toutes les structures de données",
          "Lire CTCI en entier + System Design Interview vol.1",
          "Commencer un projet portfolio impressionnant",
        ],
      },
      {
        week: "Mois 2",
        focus: "Niveau intermédiaire",
        tasks: [
          "2 Medium + 1 Hard par semaine",
          "1 System Design complet par semaine",
          "Pratiquer behavioral avec enregistrement vidéo",
          "Contribuer à un projet open source",
        ],
      },
      {
        week: "Mois 3",
        focus: "Polish & Interviews",
        tasks: [
          "Focus sur les patterns récurrents (sliding window, two pointers, etc.)",
          "Mock interviews hebdomadaires avec Pramp ou un ami",
          "Affiner CV et profil LinkedIn",
          "Commencer les candidatures et les entretiens",
        ],
      },
    ],
  },
];

export function PreparationTimeline() {
  const [activeTimeline, setActiveTimeline] = useState("1month");
  const timeline = timelines.find((t) => t.id === activeTimeline) || timelines[0];

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-center">Planning de Préparation</h2>
      <div className="flex justify-center gap-2">
        {timelines.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTimeline(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTimeline === t.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {timeline.weeks.map((w, i) => (
          <Card key={w.week} className="p-6 border-border/40">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{w.week}</h3>
                <Badge variant="outline" className="text-xs">{w.focus}</Badge>
              </div>
            </div>
            <ul className="space-y-1.5 ml-11">
              {w.tasks.map((task) => (
                <li key={task} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">\u25CB</span>{task}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
`,
);

w(
  "preparation/_components/interview-checklist.tsx",
  `
"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const checklistItems = [
  { category: "Technique", items: [
    "Maîtrise des structures de données (arrays, trees, graphs, hash maps, heaps)",
    "Algorithmes de tri et recherche",
    "Programmation dynamique (top 10 patterns)",
    "System Design : au moins 5 designs pratiqués",
    "Connaissances du framework/stack de l'entreprise cible",
    "SQL : JOINs, GROUP BY, window functions",
  ]},
  { category: "Behavioral", items: [
    "5 histoires STAR préparées et pratiquées",
    "Réponse à 'Tell me about yourself' (2 min)",
    "3-5 questions pertinentes à poser",
    "Préparé pour les questions de leadership et conflit",
    "Connaissez les valeurs de l'entreprise",
  ]},
  { category: "Logistique", items: [
    "CV à jour et adapté au poste",
    "Connexion internet testée",
    "Caméra et micro fonctionnels",
    "Environnement calme et bien éclairé",
    "Tenue professionnelle préparée",
    "Carnet et stylo à portée de main",
    "Eau et snack disponibles",
  ]},
  { category: "Mental", items: [
    "Bon sommeil la veille (7-8h)",
    "Exercice de respiration pratiqué",
    "Visualisation positive faite",
    "Rappel : c'est une conversation, pas un examen",
    "Plan de debriefing post-entretien préparé",
  ]},
];

export function InterviewChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalItems = checklistItems.reduce((sum, cat) => sum + cat.items.length, 0);
  const progress = Math.round((checked.size / totalItems) * 100);

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Checklist Pré-Entretien</h2>
        <div className="flex items-center justify-center gap-3">
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: progress + "%" }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checklistItems.map((cat) => (
          <Card key={cat.category} className="p-6 border-border/40">
            <h3 className="font-semibold text-lg mb-4">{cat.category}</h3>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border mt-0.5 transition-colors",
                    checked.has(item)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}>
                    {checked.has(item) && <span className="text-xs">\u2713</span>}
                  </div>
                  <span className={cn(
                    "text-sm transition-colors",
                    checked.has(item) ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
`,
);

console.log("P2.6 Preparation enhancement: DONE");

// =============================================================
//  UPDATE DATA STRUCTURES NAV
// =============================================================
console.log("\n=== Updating data-structures topics nav ===");

// Update data-structures/page.tsx topics list if needed - read first

console.log("\\n\u2705 ALL PHASE 2 CONTENT CREATED");
