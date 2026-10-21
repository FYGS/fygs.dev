"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Blocks, Code2, Zap, Eye, Lightbulb, ArrowRight } from "lucide-react";

/* ─── Interactive Pattern Selector ─── */
type PatternCategory = "Création" | "Structurel" | "Comportemental";

interface Pattern {
  name: string;
  category: PatternCategory;
  intent: string;
  problem: string;
  solution: string;
  realWorld: string;
  code: string;
  relatedPatterns: string[];
}

const patterns: Pattern[] = [
  {
    name: "Singleton",
    category: "Création",
    intent: "Garantir qu'une classe n'a qu'une seule instance globalement accessible.",
    problem: "Accès partagé à une ressource unique (config, DB pool, logger).",
    solution: "Instance privée + méthode statique getInstance().",
    realWorld: "Prisma Client, Connection Pool, Configuration globale.",
    code: `class Database {
  private static instance: Database;
  private constructor() { /* connexion */ }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  query(sql: string) { /* ... */ }
}

// Usage
const db = Database.getInstance();`,
    relatedPatterns: ["Factory Method", "Abstract Factory"],
  },
  {
    name: "Factory Method",
    category: "Création",
    intent: "Déléguer la création d'objets aux sous-classes.",
    problem: "Le code client ne doit pas dépendre des classes concrètes.",
    solution: "Interface commune + méthode de création dans les sous-classes.",
    realWorld: "React.createElement, Document.createElement, loggers.",
    code: `interface Notification {
  send(message: string): void;
}

class EmailNotification implements Notification {
  send(msg: string) { console.log(\`Email: \${msg}\`); }
}

class SMSNotification implements Notification {
  send(msg: string) { console.log(\`SMS: \${msg}\`); }
}

class PushNotification implements Notification {
  send(msg: string) { console.log(\`Push: \${msg}\`); }
}

function createNotification(type: "email" | "sms" | "push"): Notification {
  const map = { email: EmailNotification, sms: SMSNotification, push: PushNotification };
  return new map[type]();
}`,
    relatedPatterns: ["Abstract Factory", "Builder"],
  },
  {
    name: "Builder",
    category: "Création",
    intent: "Construire des objets complexes étape par étape.",
    problem: "Constructeur avec trop de paramètres optionnels.",
    solution: "Chaînage de méthodes (fluent API). Séparation construction / représentation.",
    realWorld: "QueryBuilder, FormBuilder, Zod schemas.",
    code: `class QueryBuilder {
  private query: string[] = [];
  private params: Record<string, unknown> = {};

  select(fields: string) { this.query.push(\`SELECT \${fields}\`); return this; }
  from(table: string) { this.query.push(\`FROM \${table}\`); return this; }
  where(condition: string, value: unknown) {
    this.query.push(\`WHERE \${condition}\`);
    this.params[condition] = value;
    return this;
  }
  orderBy(field: string, dir: "ASC" | "DESC" = "ASC") {
    this.query.push(\`ORDER BY \${field} \${dir}\`);
    return this;
  }
  build() { return { sql: this.query.join(" "), params: this.params }; }
}

const q = new QueryBuilder()
  .select("*").from("users").where("age > ?", 18)
  .orderBy("name").build();`,
    relatedPatterns: ["Factory Method", "Prototype"],
  },
  {
    name: "Observer",
    category: "Comportemental",
    intent: "Notifier automatiquement les dépendants lors d'un changement d'état.",
    problem: "Plusieurs objets doivent réagir quand un objet change.",
    solution: "Subscribe/unsubscribe + notify. Publication d'événements.",
    realWorld: "addEventListener, React useState, RxJS, EventEmitter, Zustand.",
    code: `type Listener<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }
}

// Type-safe usage
const bus = new EventEmitter<{ userLogin: { id: string }; error: Error }>();
const unsub = bus.on("userLogin", (data) => console.log(data.id));
bus.emit("userLogin", { id: "123" });
unsub(); // cleanup`,
    relatedPatterns: ["Mediator", "Strategy"],
  },
  {
    name: "Strategy",
    category: "Comportemental",
    intent: "Définir une famille d'algorithmes interchangeables.",
    problem: "Multiples variantes d'un algorithme avec switch/case complexe.",
    solution: "Interface commune + injection de la stratégie concrète.",
    realWorld: "Passport.js strategies, sorting algorithms, payment processors.",
    code: `interface PaymentStrategy {
  pay(amount: number): Promise<{ success: boolean; txId: string }>;
}

class StripePayment implements PaymentStrategy {
  async pay(amount: number) {
    // Stripe API call
    return { success: true, txId: "stripe_" + Date.now() };
  }
}

class PayPalPayment implements PaymentStrategy {
  async pay(amount: number) {
    // PayPal API call
    return { success: true, txId: "paypal_" + Date.now() };
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy) { this.strategy = strategy; }

  async processPayment(amount: number) {
    return this.strategy.pay(amount);
  }
}`,
    relatedPatterns: ["Observer", "Template Method"],
  },
  {
    name: "Adapter",
    category: "Structurel",
    intent: "Convertir l'interface d'une classe en une interface attendue par le client.",
    problem: "Deux interfaces incompatibles doivent travailler ensemble.",
    solution: "Wrapper qui traduit les appels d'une interface vers l'autre.",
    realWorld: "API adapters, legacy code integration, ORMs.",
    code: `// Legacy API returns XML-like object
interface LegacyUser { GetName(): string; GetEmail(): string; }

// Modern API expects
interface User { name: string; email: string; }

// Adapter
class UserAdapter implements User {
  constructor(private legacy: LegacyUser) {}
  get name() { return this.legacy.GetName(); }
  get email() { return this.legacy.GetEmail(); }
}

// Usage — client uses modern interface
function displayUser(user: User) {
  console.log(\`\${user.name} (\${user.email})\`);
}
displayUser(new UserAdapter(legacyUserService.getUser()));`,
    relatedPatterns: ["Decorator", "Proxy", "Facade"],
  },
  {
    name: "Decorator",
    category: "Structurel",
    intent: "Ajouter dynamiquement des responsabilités à un objet sans héritage.",
    problem: "Extension de fonctionnalité sans modifier la classe de base.",
    solution: "Wrapper qui implémente la même interface et délègue + enrichit.",
    realWorld: "Express middleware, Next.js HOC, TypeScript decorators, logging.",
    code: `interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
}

class TimestampLogger implements Logger {
  constructor(private wrapped: Logger) {}
  log(message: string) {
    this.wrapped.log(\`[\${new Date().toISOString()}] \${message}\`);
  }
}

class PrefixLogger implements Logger {
  constructor(private wrapped: Logger, private prefix: string) {}
  log(message: string) {
    this.wrapped.log(\`[\${this.prefix}] \${message}\`);
  }
}

// Composition dynamique
const logger = new PrefixLogger(
  new TimestampLogger(new ConsoleLogger()),
  "APP"
);
logger.log("Hello"); // [APP] [2024-...] Hello`,
    relatedPatterns: ["Adapter", "Proxy", "Strategy"],
  },
  {
    name: "Proxy",
    category: "Structurel",
    intent: "Fournir un substitut contrôlant l'accès à un objet.",
    problem: "Contrôle d'accès, caching, lazy loading, logging.",
    solution: "Objet intermédiaire avec la même interface qui intercepte les appels.",
    realWorld: "ES6 Proxy, API rate limiting, caching layer, virtual DOM.",
    code: `interface DataService {
  fetchData(id: string): Promise<unknown>;
}

class RealDataService implements DataService {
  async fetchData(id: string) {
    console.log("Fetching from DB...");
    return { id, data: "..." };
  }
}

class CachedDataService implements DataService {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  constructor(private real: DataService, private ttl = 60_000) {}

  async fetchData(id: string) {
    const cached = this.cache.get(id);
    if (cached && Date.now() < cached.expiry) {
      console.log("Cache hit!");
      return cached.data;
    }
    const data = await this.real.fetchData(id);
    this.cache.set(id, { data, expiry: Date.now() + this.ttl });
    return data;
  }
}`,
    relatedPatterns: ["Decorator", "Adapter"],
  },
];

const categories: PatternCategory[] = ["Création", "Structurel", "Comportemental"];
const categoryColors: Record<PatternCategory, string> = {
  "Création": "text-blue-500 bg-blue-500/10 border-blue-500/30",
  "Structurel": "text-green-500 bg-green-500/10 border-green-500/30",
  "Comportemental": "text-purple-500 bg-purple-500/10 border-purple-500/30",
};

export default function DesignPatternsPage() {
  const [selectedCategory, setSelectedCategory] = useState<PatternCategory | "Tous">("Tous");
  const [selectedPattern, setSelectedPattern] = useState<Pattern>(patterns[0]);

  const filtered = selectedCategory === "Tous" ? patterns : patterns.filter((p) => p.category === selectedCategory);

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Blocks className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Design Patterns
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Les modèles de conception Gang of Four adaptés au TypeScript moderne.
          Solutions éprouvées aux problèmes récurrents de conception logicielle.
        </p>
      </section>

      {/* Category Filter */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button onClick={() => setSelectedCategory("Tous")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${selectedCategory === "Tous" ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}>
          Tous ({patterns.length})
        </button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${selectedCategory === cat ? categoryColors[cat] : "border-border/40 text-muted-foreground"}`}>
            {cat} ({patterns.filter((p) => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map((pattern) => (
          <button key={pattern.name} onClick={() => setSelectedPattern(pattern)}
            className={`text-left p-4 rounded-xl border transition-all hover:shadow-md ${selectedPattern.name === pattern.name ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/40 hover:border-primary/30"}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">{pattern.name}</h3>
              <Badge variant="outline" className={`text-[10px] ${categoryColors[pattern.category]}`}>{pattern.category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{pattern.intent}</p>
          </button>
        ))}
      </div>

      {/* Selected Pattern Detail */}
      <Card className="p-8 border-primary/20 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-bold">{selectedPattern.name}</h2>
          <Badge className={categoryColors[selectedPattern.category]}>{selectedPattern.category}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Intent
              </h3>
              <p className="text-sm text-muted-foreground">{selectedPattern.intent}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-red-500" /> Problème
              </h3>
              <p className="text-sm text-muted-foreground">{selectedPattern.problem}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-1">
                <ArrowRight className="w-4 h-4 text-green-500" /> Solution
              </h3>
              <p className="text-sm text-muted-foreground">{selectedPattern.solution}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-500" /> Real World
              </h3>
              <p className="text-sm text-muted-foreground">{selectedPattern.realWorld}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Related Patterns</h3>
              <div className="flex gap-1.5 flex-wrap">
                {selectedPattern.relatedPatterns.map((rp) => (
                  <Badge key={rp} variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/10"
                    onClick={() => { const found = patterns.find((p) => p.name === rp); if (found) setSelectedPattern(found); }}>
                    {rp}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-primary" /> Implémentation TypeScript
            </h3>
            <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-xs max-h-[500px] overflow-y-auto" tabIndex={0}>
              <code>{selectedPattern.code}</code>
            </pre>
          </div>
        </div>
      </Card>

      {/* Summary Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Résumé Comparatif</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Pattern</th>
                <th className="text-left py-3 px-4 font-semibold">Catégorie</th>
                <th className="text-left py-3 px-4 font-semibold">Quand l&apos;utiliser</th>
                <th className="text-left py-3 px-4 font-semibold">Exemple</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.name} className="border-b border-border/20 cursor-pointer hover:bg-muted/20"
                  onClick={() => setSelectedPattern(p)}>
                  <td className="py-2.5 px-4 font-semibold text-primary text-xs">{p.name}</td>
                  <td className="py-2.5 px-4"><Badge variant="outline" className={`text-[10px] ${categoryColors[p.category]}`}>{p.category}</Badge></td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">{p.problem}</td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">{p.realWorld}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}