"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Blocks, ArrowRight, Lightbulb, Layers } from "lucide-react";

interface Pattern {
  name: string;
  category: string;
  problem: string;
  code: string;
  usage: string;
  when: string[];
}

const patterns: Pattern[] = [
  {
    name: "Builder Pattern",
    category: "Creational",
    problem: "Construire des objets complexes étape par étape avec validation de type à chaque étape.",
    code: `class RequestBuilder<
  HasURL extends boolean = false,
  HasMethod extends boolean = false,
> {
  private config: Record<string, unknown> = {};

  url(url: string): RequestBuilder<true, HasMethod> {
    this.config.url = url;
    return this as any;
  }

  method(m: "GET" | "POST" | "PUT" | "DELETE"): RequestBuilder<HasURL, true> {
    this.config.method = m;
    return this as any;
  }

  header(key: string, value: string): this {
    const headers = (this.config.headers as Record<string, string>) ?? {};
    headers[key] = value;
    this.config.headers = headers;
    return this;
  }

  // Ne peut être appelé que si url ET method sont définis
  send(
    this: RequestBuilder<true, true>,
  ): Promise<Response> {
    return fetch(this.config.url as string, this.config as any);
  }
}

// ✅ OK
new RequestBuilder().url("/api").method("GET").send();

// ❌ Erreur de type - method manquant
// new RequestBuilder().url("/api").send();`,
    usage: `const response = await new RequestBuilder()
  .url("https://api.example.com/users")
  .method("POST")
  .header("Authorization", "Bearer token")
  .header("Content-Type", "application/json")
  .send();`,
    when: [
      "Construction d'objets avec beaucoup de paramètres optionnels",
      "Validation compile-time de l'ordre de construction",
      "API fluente avec auto-complétion",
    ],
  },
  {
    name: "Strategy Pattern",
    category: "Behavioral",
    problem: "Définir une famille d'algorithmes interchangeables avec une interface commune typée.",
    code: `// Interface de stratégie avec generics
interface SortStrategy<T> {
  sort(items: T[]): T[];
  readonly name: string;
  readonly complexity: { best: string; worst: string; space: string };
}

// Implémentations concrètes
const quickSort: SortStrategy<number> = {
  name: "QuickSort",
  complexity: { best: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  sort(items) {
    if (items.length <= 1) return items;
    const pivot = items[0];
    const left = items.slice(1).filter(x => x < pivot);
    const right = items.slice(1).filter(x => x >= pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  },
};

const mergeSort: SortStrategy<number> = {
  name: "MergeSort",
  complexity: { best: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  sort(items) {
    if (items.length <= 1) return items;
    const mid = Math.floor(items.length / 2);
    const left = this.sort(items.slice(0, mid));
    const right = this.sort(items.slice(mid));
    return merge(left, right);
  },
};

// Context qui utilise la stratégie
class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  execute(items: T[]): T[] {
    console.log(\`Using \${this.strategy.name}\`);
    return this.strategy.sort([...items]);
  }
}`,
    usage: `const sorter = new Sorter(quickSort);
sorter.execute([3, 1, 4, 1, 5]); // Using QuickSort

sorter.setStrategy(mergeSort);
sorter.execute([3, 1, 4, 1, 5]); // Using MergeSort`,
    when: [
      "Algorithmes interchangeables à runtime",
      "Éliminer les grandes chaînes if/else ou switch",
      "Étendre les comportements sans modifier le contexte",
    ],
  },
  {
    name: "State Machine",
    category: "Behavioral",
    problem: "Modéliser des transitions d'état valides avec le système de types.",
    code: `// Définir les états et transitions
type OrderState = "draft" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

type Transitions = {
  draft: "pending" | "cancelled";
  pending: "confirmed" | "cancelled";
  confirmed: "shipped" | "cancelled";
  shipped: "delivered";
  delivered: never;
  cancelled: never;
};

class Order<S extends OrderState = "draft"> {
  constructor(
    readonly state: S,
    readonly data: Record<string, unknown> = {},
  ) {}

  transition<Next extends Transitions[S]>(
    nextState: Next,
    update?: Record<string, unknown>,
  ): Order<Next> {
    return new Order(nextState, { ...this.data, ...update });
  }
}

// ✅ Transitions valides
const order = new Order("draft")
  .transition("pending")
  .transition("confirmed", { confirmedAt: Date.now() })
  .transition("shipped", { trackingId: "ABC123" })
  .transition("delivered");

// ❌ Erreur de type - transition invalide
// new Order("draft").transition("shipped");
// new Order("delivered").transition("pending");`,
    usage: `// Le type encode les transitions légales
function processOrder(order: Order<"confirmed">) {
  // On sait que l'ordre est confirmé
  return order.transition("shipped", {
    trackingId: generateTrackingId(),
    shippedAt: new Date(),
  });
  // Retourne Order<"shipped">
}`,
    when: [
      "Workflows avec des transitions strictes",
      "Garantir la validité des états à la compilation",
      "Processus métier avec règles de transition",
    ],
  },
  {
    name: "Repository Pattern",
    category: "Structural",
    problem: "Abstraire l'accès aux données avec des types forts et des opérations CRUD typées.",
    code: `// Base entity
interface Entity { id: string; createdAt: Date; updatedAt: Date }

// Repository générique
interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findMany(filter: Partial<Omit<T, keyof Entity>>): Promise<T[]>;
  create(data: Omit<T, keyof Entity>): Promise<T>;
  update(id: string, data: Partial<Omit<T, keyof Entity>>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Entity concrète
interface User extends Entity {
  email: string;
  name: string;
  role: "admin" | "user";
}

// Implémentation
class PrismaUserRepository implements Repository<User> {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findMany(filter: Partial<Omit<User, keyof Entity>>) {
    return prisma.user.findMany({ where: filter });
  }

  async create(data: Omit<User, keyof Entity>) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Partial<Omit<User, keyof Entity>>) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } });
    return true;
  }
}`,
    usage: `// Injection de dépendance
class UserService {
  constructor(private repo: Repository<User>) {}

  async getUsersByRole(role: "admin" | "user") {
    return this.repo.findMany({ role }); // Typé !
  }
}

// Test facile avec mock
const mockRepo: Repository<User> = {
  findById: async () => null,
  findMany: async () => [],
  create: async (data) => ({ ...data, id: "1", createdAt: new Date(), updatedAt: new Date() }),
  update: async (id, data) => ({ /* ... */ } as User),
  delete: async () => true,
};`,
    when: [
      "Découpler la logique métier de l'accès aux données",
      "Faciliter les tests unitaires avec des mocks typés",
      "Supporter plusieurs sources de données (Prisma, API, in-memory)",
    ],
  },
];

const categoryColors: Record<string, string> = {
  Creational: "text-blue-500 border-blue-500/20 bg-blue-500/10",
  Behavioral: "text-green-500 border-green-500/20 bg-green-500/10",
  Structural: "text-purple-500 border-purple-500/20 bg-purple-500/10",
};

export default function DesignPatternsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Blocks className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-indigo-500">Design Patterns</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Design Patterns TypeScript
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Les patterns classiques réinventés avec le système de types TypeScript.
          Type-safe par design.
        </p>
      </section>

      <div className="space-y-6">
        {patterns.map((p, idx) => (
          <Card
            key={p.name}
            className={`p-6 space-y-4 border-border/40 cursor-pointer transition-all ${openIdx === idx ? "ring-2 ring-indigo-500/20" : ""}`}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold">{p.name}</h3>
                <Badge variant="outline" className={categoryColors[p.category]}>{p.category}</Badge>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform ${openIdx === idx ? "rotate-90" : ""}`} />
            </div>

            <p className="text-sm text-muted-foreground">{p.problem}</p>

            {openIdx === idx && (
              <div className="space-y-4 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
                <Tabs defaultValue="impl" className="w-full">
                  <TabsList className="bg-muted/30">
                    <TabsTrigger value="impl">Implémentation</TabsTrigger>
                    <TabsTrigger value="usage">Utilisation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="impl">
                    <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {p.code}
                    </pre>
                  </TabsContent>
                  <TabsContent value="usage">
                    <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {p.usage}
                    </pre>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Quand utiliser
                  </h4>
                  <ul className="space-y-1">
                    {p.when.map(w => (
                      <li key={w} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}