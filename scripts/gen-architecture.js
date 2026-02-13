// P1.1 — Architecture Section Generator
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

console.log("\n=== P1.1 ARCHITECTURE ===");

// ─── Architecture Hub Page ───
w(
  "architecture/_components/hero.tsx",
  `
import { BrainCircuit, Sparkles } from "lucide-react";

export function ArchitectureHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
        <BrainCircuit className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Architecture & Design Patterns
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les principes d&apos;architecture logicielle, les design patterns
          et les méthodes de conception qui font la différence en entretien.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span>Clean Architecture • SOLID • DDD • Design Patterns</span>
      </div>
    </section>
  );
}
`,
);

w(
  "architecture/_components/architecture-topics.tsx",
  `
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

interface Topic {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
}

const topics: Topic[] = [
  {
    title: "Clean Architecture",
    description:
      "Architecture en couches avec séparation claire des responsabilités et règle de dépendance.",
    category: "Avancé",
    topics: ["Couches", "Dépendances", "Use Cases", "Ports & Adapters"],
    href: "/tech-mastry/architecture/clean-architecture",
  },
  {
    title: "Design Patterns",
    description:
      "Catalogue complet des patterns de conception : Creational, Structural et Behavioral.",
    category: "Intermédiaire",
    topics: ["Singleton", "Factory", "Observer", "Strategy", "Decorator"],
    href: "/tech-mastry/architecture/design-patterns",
  },
  {
    title: "Principes SOLID",
    description:
      "Les 5 principes fondamentaux de la programmation orientée objet pour un code maintenable.",
    category: "Fondamental",
    topics: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    href: "/tech-mastry/architecture/solid",
  },
  {
    title: "Domain-Driven Design",
    description:
      "Conception pilotée par le domaine métier : Bounded Contexts, Aggregates et modélisation.",
    category: "Expert",
    topics: ["Bounded Context", "Aggregate", "Entity", "Value Object"],
    href: "/tech-mastry/architecture/ddd",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500",
  "Intermédiaire": "bg-yellow-500/10 text-yellow-500",
  "Avancé": "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function ArchitectureTopics() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 space-y-4 group border-border/40 hover:border-indigo-500/30">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold group-hover:text-indigo-500 transition-colors">
                  {topic.title}
                </h2>
                <Badge
                  variant="secondary"
                  className={categoryColors[topic.category]}
                >
                  {topic.category}
                </Badge>
              </div>
              <p className="text-muted-foreground">{topic.description}</p>
              <div className="flex flex-wrap gap-2">
                {topic.topics.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
`,
);

w(
  "architecture/page.tsx",
  `
import { Metadata } from "next";
import { ArchitectureHero } from "./_components/hero";
import { ArchitectureTopics } from "./_components/architecture-topics";

export const metadata: Metadata = {
  title: "Architecture & Design Patterns | TechMastry",
  description:
    "Clean Architecture, SOLID, DDD et patterns de conception modernes pour les entretiens techniques",
};

export default function ArchitecturePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ArchitectureHero />
      <ArchitectureTopics />
    </main>
  );
}
`,
);

// ─── Clean Architecture Sub-page ───
w(
  "architecture/clean-architecture/_components/layers-diagram.tsx",
  `
"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const layers = [
  {
    id: "entities",
    name: "Entities",
    subtitle: "Règles métier de l'entreprise",
    description:
      "Les entités représentent les objets métier fondamentaux. Elles encapsulent les règles métier les plus générales et les plus critiques. Elles sont les moins susceptibles de changer quand quelque chose d'externe change.",
    examples: ["User", "Order", "Product", "Invoice"],
    color: "bg-amber-500",
    ring: "ring-amber-500/30",
    textColor: "text-amber-500",
    bgLight: "bg-amber-500/10",
    radius: "w-40 h-40",
  },
  {
    id: "usecases",
    name: "Use Cases",
    subtitle: "Règles métier de l'application",
    description:
      "Les cas d'utilisation contiennent les règles métier spécifiques à l'application. Ils orchestrent le flux de données depuis et vers les entités, et dirigent ces entités pour utiliser leurs règles métier.",
    examples: ["CreateOrder", "AuthenticateUser", "ProcessPayment"],
    color: "bg-orange-500",
    ring: "ring-orange-500/30",
    textColor: "text-orange-500",
    bgLight: "bg-orange-500/10",
    radius: "w-56 h-56",
  },
  {
    id: "adapters",
    name: "Interface Adapters",
    subtitle: "Convertisseurs de format de données",
    description:
      "Cette couche contient les adaptateurs qui convertissent les données du format le plus pratique pour les use cases et entités vers le format le plus pratique pour les agents externes (DB, Web, etc.).",
    examples: ["Controllers", "Presenters", "Gateways", "Repositories"],
    color: "bg-sky-500",
    ring: "ring-sky-500/30",
    textColor: "text-sky-500",
    bgLight: "bg-sky-500/10",
    radius: "w-72 h-72",
  },
  {
    id: "frameworks",
    name: "Frameworks & Drivers",
    subtitle: "Détails d'implémentation",
    description:
      "La couche la plus externe contient les frameworks et outils (base de données, UI, etc.). C'est là que vont tous les détails. Le Web, la base de données — ce sont des détails.",
    examples: ["Express/Next.js", "PostgreSQL/Prisma", "React UI", "REST API"],
    color: "bg-slate-500",
    ring: "ring-slate-500/30",
    textColor: "text-slate-500",
    bgLight: "bg-slate-500/10",
    radius: "w-[22rem] h-[22rem]",
  },
];

export function LayersDiagram() {
  const [activeLayer, setActiveLayer] = useState<string>("entities");
  const active = layers.find((l) => l.id === activeLayer) || layers[0];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Les 4 Couches</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Interactive Circles */}
        <div className="flex items-center justify-center py-8">
          <div className="relative flex items-center justify-center">
            {[...layers].reverse().map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={cn(
                  "absolute rounded-full border-2 border-dashed transition-all duration-500 cursor-pointer flex items-center justify-center",
                  layer.radius,
                  activeLayer === layer.id
                    ? \`\${layer.ring} ring-4 \${layer.bgLight} border-current \${layer.textColor}\`
                    : "border-border/40 hover:border-border bg-background/50"
                )}
              >
                {layer.id === activeLayer && (
                  <span className={cn("text-sm font-bold", layer.textColor)}>
                    {layer.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <Card className="p-6 space-y-4 border-border/40">
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", active.color)} />
            <div>
              <h3 className={cn("text-xl font-bold", active.textColor)}>
                {active.name}
              </h3>
              <p className="text-sm text-muted-foreground">{active.subtitle}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {active.description}
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Exemples :</p>
            <div className="flex flex-wrap gap-2">
              {active.examples.map((ex) => (
                <code
                  key={ex}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-mono",
                    active.bgLight,
                    active.textColor
                  )}
                >
                  {ex}
                </code>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Dependency Rule */}
      <Card className="p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-indigo-500">
              La Règle de Dépendance
            </h3>
            <p className="text-muted-foreground">
              Les dépendances du code source ne doivent pointer que vers
              l&apos;intérieur. Rien dans un cercle intérieur ne peut connaître
              quoi que ce soit dans un cercle extérieur. Les données
              traversent les frontières sous forme de structures simples.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
`,
);

w(
  "architecture/clean-architecture/_components/code-examples.tsx",
  `
"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const examples = [
  {
    id: "monolith",
    label: "❌ Monolithe Couplé",
    description: "Tout est mélangé : logique métier, accès base de données et présentation.",
    code: \`// ❌ Route Express avec tout mélangé
app.post("/orders", async (req, res) => {
  // Validation directe
  if (!req.body.items?.length) {
    return res.status(400).json({ error: "No items" });
  }

  // Accès DB direct dans le controller
  const user = await db.query(
    "SELECT * FROM users WHERE id = $1",
    [req.body.userId]
  );

  // Logique métier dans le controller
  const total = req.body.items.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );
  const discount = user.isPremium ? total * 0.1 : 0;

  // Insertion directe
  const order = await db.query(
    "INSERT INTO orders ...",
    [user.id, total - discount]
  );

  // Envoi email direct
  await sendgrid.send({
    to: user.email,
    subject: "Order confirmed",
  });

  res.json(order);
});\`,
  },
  {
    id: "clean",
    label: "✅ Clean Architecture",
    description: "Chaque couche a une responsabilité claire. Le code est testable et maintenable.",
    code: \`// ✅ Entity — Règle métier pure
class Order {
  calculateTotal(items: OrderItem[]): number {
    return items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
  }

  applyDiscount(total: number, isPremium: boolean) {
    return isPremium ? total * 0.9 : total;
  }
}

// ✅ Use Case — Orchestre les entités
class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private userRepo: IUserRepository,
    private notifier: INotificationService
  ) {}

  async execute(input: CreateOrderInput) {
    const user = await this.userRepo.findById(input.userId);
    const order = new Order();
    const total = order.calculateTotal(input.items);
    const finalTotal = order.applyDiscount(total, user.isPremium);

    const saved = await this.orderRepo.save({
      userId: user.id, total: finalTotal, items: input.items
    });

    await this.notifier.orderConfirmed(user, saved);
    return saved;
  }
}

// ✅ Adapter — Convertit HTTP → Use Case
class OrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  async handle(req: Request) {
    const input = CreateOrderSchema.parse(req.body);
    const order = await this.createOrder.execute(input);
    return Response.json(order, { status: 201 });
  }
}\`,
  },
];

export function CodeExamples() {
  const [activeTab, setActiveTab] = useState("monolith");
  const active = examples.find((e) => e.id === activeTab) || examples[0];

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Avant / Après</h2>

      <div className="flex gap-2">
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveTab(ex.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === ex.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-4 border-border/40">
        <p className="text-muted-foreground">{active.description}</p>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{active.code}</code>
        </pre>
      </Card>
    </section>
  );
}
`,
);

w(
  "architecture/clean-architecture/page.tsx",
  `
import { Metadata } from "next";
import { LayersDiagram } from "./_components/layers-diagram";
import { CodeExamples } from "./_components/code-examples";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Clean Architecture | TechMastry",
  description:
    "Comprendre et appliquer les principes de Clean Architecture pour créer des systèmes maintenables",
};

export default function CleanArchitecturePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Clean Architecture
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proposée par Robert C. Martin (Uncle Bob), la Clean Architecture
            organise le code en couches concentriques avec une règle de
            dépendance stricte pointant vers l&apos;intérieur.
          </p>
        </div>
      </section>

      <LayersDiagram />

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Avantages Clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Testabilité",
              description: "Les règles métier peuvent être testées sans UI, base de données ou serveur web.",
              color: "text-green-500",
            },
            {
              title: "Indépendance",
              description: "Le système ne dépend pas d'un framework, d'une base de données ou d'une UI spécifique.",
              color: "text-blue-500",
            },
            {
              title: "Maintenabilité",
              description: "Les changements dans une couche externe n'affectent pas les couches internes.",
              color: "text-purple-500",
            },
          ].map((item) => (
            <Card key={item.title} className="p-6 space-y-2 border-border/40">
              <h3 className={"text-lg font-semibold " + item.color}>{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <CodeExamples />

      <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Continuez avec les principes SOLID</h3>
            <p className="text-sm text-muted-foreground">
              Les principes SOLID sont le fondement de la Clean Architecture.
            </p>
          </div>
          <Link
            href="/tech-mastry/architecture/solid"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            SOLID <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </main>
  );
}
`,
);

// ─── Design Patterns Sub-page ───
w(
  "architecture/design-patterns/_components/patterns-catalog.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

type PatternCategory = "Creational" | "Structural" | "Behavioral";

interface Pattern {
  name: string;
  category: PatternCategory;
  intent: string;
  useCases: string[];
  code: string;
}

const patterns: Pattern[] = [
  {
    name: "Singleton",
    category: "Creational",
    intent: "Garantir qu'une classe n'a qu'une seule instance et fournir un point d'accès global.",
    useCases: ["Configuration", "Logger", "Connection Pool", "Cache"],
    code: \`class Database {
  private static instance: Database;
  private constructor() { /* init connection */ }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  query(sql: string) { /* ... */ }
}

// Usage
const db = Database.getInstance();\`,
  },
  {
    name: "Factory Method",
    category: "Creational",
    intent: "Définir une interface de création d'objets, mais laisser les sous-classes décider.",
    useCases: ["Création conditionnelle", "Plugins", "UI Themes"],
    code: \`interface Notification {
  send(message: string): void;
}

class EmailNotification implements Notification {
  send(message: string) { console.log(\\\`Email: \\\${message}\\\`); }
}

class SMSNotification implements Notification {
  send(message: string) { console.log(\\\`SMS: \\\${message}\\\`); }
}

class NotificationFactory {
  static create(type: "email" | "sms"): Notification {
    switch (type) {
      case "email": return new EmailNotification();
      case "sms":   return new SMSNotification();
    }
  }
}\`,
  },
  {
    name: "Observer",
    category: "Behavioral",
    intent: "Définir une dépendance un-à-plusieurs pour que les observateurs soient notifiés automatiquement.",
    useCases: ["Event systems", "UI Updates", "Pub/Sub", "State management"],
    code: \`type Listener<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>) {
    if (!this.listeners.has(event as string))
      this.listeners.set(event as string, new Set());
    this.listeners.get(event as string)!.add(fn);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    this.listeners.get(event as string)?.forEach(fn => fn(data));
  }
}

// Usage
type AppEvents = { userLogin: { userId: string }; orderPlaced: { orderId: string } };
const bus = new EventEmitter<AppEvents>();
bus.on("userLogin", ({ userId }) => console.log(userId));\`,
  },
  {
    name: "Strategy",
    category: "Behavioral",
    intent: "Définir une famille d'algorithmes interchangeables encapsulés indépendamment.",
    useCases: ["Algorithmes de tri", "Validation", "Pricing", "Authentication"],
    code: \`interface PricingStrategy {
  calculate(basePrice: number): number;
}

class RegularPricing implements PricingStrategy {
  calculate(basePrice: number) { return basePrice; }
}

class PremiumPricing implements PricingStrategy {
  calculate(basePrice: number) { return basePrice * 0.8; } // 20% off
}

class BlackFridayPricing implements PricingStrategy {
  calculate(basePrice: number) { return basePrice * 0.5; } // 50% off
}

class PriceCalculator {
  constructor(private strategy: PricingStrategy) {}
  setStrategy(strategy: PricingStrategy) { this.strategy = strategy; }
  getPrice(basePrice: number) { return this.strategy.calculate(basePrice); }
}\`,
  },
  {
    name: "Decorator",
    category: "Structural",
    intent: "Attacher dynamiquement des responsabilités supplémentaires à un objet.",
    useCases: ["Logging", "Caching", "Auth middleware", "Compression"],
    code: \`interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
}

class TimestampDecorator implements Logger {
  constructor(private wrapped: Logger) {}
  log(message: string) {
    this.wrapped.log(\\\`[\\\${new Date().toISOString()}] \\\${message}\\\`);
  }
}

class PrefixDecorator implements Logger {
  constructor(private wrapped: Logger, private prefix: string) {}
  log(message: string) {
    this.wrapped.log(\\\`[\\\${this.prefix}] \\\${message}\\\`);
  }
}

// Composition
const logger = new PrefixDecorator(
  new TimestampDecorator(new ConsoleLogger()),
  "APP"
);\`,
  },
  {
    name: "Adapter",
    category: "Structural",
    intent: "Convertir l'interface d'une classe en une autre interface attendue par le client.",
    useCases: ["Legacy integration", "Third-party libs", "API versioning"],
    code: \`// Interface attendue par notre app
interface PaymentProcessor {
  charge(amount: number, currency: string): Promise<{ id: string }>;
}

// Librairie tierce avec une interface différente
class StripeSDK {
  createCharge(params: {
    amount_cents: number;
    currency: string;
  }) { /* ... */ }
}

// Adapter
class StripeAdapter implements PaymentProcessor {
  constructor(private stripe: StripeSDK) {}

  async charge(amount: number, currency: string) {
    const result = await this.stripe.createCharge({
      amount_cents: amount * 100,
      currency,
    });
    return { id: result.id };
  }
}\`,
  },
];

const categoryColors: Record<PatternCategory, string> = {
  Creational: "bg-green-500/10 text-green-500 border-green-500/20",
  Structural: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Behavioral: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const categoryFilter: PatternCategory[] = ["Creational", "Structural", "Behavioral"];

export function PatternsCatalog() {
  const [filterCat, setFilterCat] = useState<PatternCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filterCat === "all"
      ? patterns
      : patterns.filter((p) => p.category === filterCat);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold">Catalogue des Patterns</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterCat("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              filterCat === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            Tous
          </button>
          {categoryFilter.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                filterCat === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((pattern) => (
          <Card
            key={pattern.name}
            className="border-border/40 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <button
              onClick={() =>
                setExpanded(expanded === pattern.name ? null : pattern.name)
              }
              className="w-full p-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{pattern.name}</h3>
                  <Badge className={categoryColors[pattern.category]}>
                    {pattern.category}
                  </Badge>
                </div>
                <svg
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200",
                    expanded === pattern.name && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pattern.intent}
              </p>
            </button>

            {expanded === pattern.name && (
              <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-2">
                  {pattern.useCases.map((uc) => (
                    <Badge key={uc} variant="outline" className="text-xs">
                      {uc}
                    </Badge>
                  ))}
                </div>
                <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
                  <code>{pattern.code}</code>
                </pre>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
`,
);

w(
  "architecture/design-patterns/page.tsx",
  `
import { Metadata } from "next";
import { PatternsCatalog } from "./_components/patterns-catalog";
import { Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Design Patterns | TechMastry",
  description:
    "Catalogue interactif des design patterns : Creational, Structural et Behavioral avec exemples TypeScript",
};

export default function DesignPatternsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Workflow className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Design Patterns</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solutions éprouvées aux problèmes récurrents de conception logicielle.
            Chaque pattern inclut le code TypeScript et des cas d&apos;usage concrets.
          </p>
        </div>
      </section>

      <PatternsCatalog />
    </main>
  );
}
`,
);

// ─── SOLID Sub-page ───
w(
  "architecture/solid/_components/solid-explorer.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Principle {
  letter: string;
  name: string;
  fullName: string;
  description: string;
  violation: { label: string; code: string };
  correct: { label: string; code: string };
  color: string;
}

const principles: Principle[] = [
  {
    letter: "S",
    name: "Single Responsibility",
    fullName: "Principe de responsabilité unique",
    description: "Une classe ne devrait avoir qu'une seule raison de changer. Chaque module ou classe doit être responsable d'une seule partie de la fonctionnalité.",
    violation: {
      label: "❌ Violation",
      code: \`class UserService {
  createUser(data: UserDTO) { /* create user */ }
  sendWelcomeEmail(user: User) { /* send email */ }
  generateReport(user: User) { /* generate PDF */ }
  logActivity(user: User) { /* log to file */ }
  // Cette classe fait trop de choses !
}\`,
    },
    correct: {
      label: "✅ Correct",
      code: \`class UserService {
  createUser(data: UserDTO) { /* create user only */ }
}

class EmailService {
  sendWelcomeEmail(user: User) { /* emails only */ }
}

class ReportService {
  generateReport(user: User) { /* reporting only */ }
}

class ActivityLogger {
  logActivity(user: User) { /* logging only */ }
}\`,
    },
    color: "text-blue-500",
  },
  {
    letter: "O",
    name: "Open/Closed",
    fullName: "Principe ouvert/fermé",
    description: "Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification. Utilisez l'abstraction pour ajouter du comportement sans modifier le code existant.",
    violation: {
      label: "❌ Violation",
      code: \`class AreaCalculator {
  calculate(shape: any) {
    if (shape.type === "circle")
      return Math.PI * shape.radius ** 2;
    if (shape.type === "rectangle")
      return shape.width * shape.height;
    // Ajouter un nouveau type = modifier cette classe
    if (shape.type === "triangle")
      return 0.5 * shape.base * shape.height;
  }
}\`,
    },
    correct: {
      label: "✅ Correct",
      code: \`interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area() { return this.width * this.height; }
}

// Ajouter un nouveau type = créer une nouvelle classe
class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  area() { return 0.5 * this.base * this.height; }
}

// Le calculateur ne change JAMAIS
function totalArea(shapes: Shape[]) {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}\`,
    },
    color: "text-green-500",
  },
  {
    letter: "L",
    name: "Liskov Substitution",
    fullName: "Principe de substitution de Liskov",
    description: "Les objets d'une sous-classe doivent pouvoir remplacer ceux de la classe parente sans altérer le programme. Si S est un sous-type de T, alors les objets T peuvent être remplacés par des objets S.",
    violation: {
      label: "❌ Violation",
      code: \`class Bird {
  fly() { return "Flying!"; }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Penguins can't fly!");
    // Viole LSP : on ne peut pas remplacer
    // Bird par Penguin partout
  }
}\`,
    },
    correct: {
      label: "✅ Correct",
      code: \`interface Bird {
  move(): string;
}

interface FlyingBird extends Bird {
  fly(): string;
}

class Eagle implements FlyingBird {
  move() { return "Moving"; }
  fly() { return "Flying high!"; }
}

class Penguin implements Bird {
  move() { return "Swimming!"; }
  // Pas de méthode fly() — correct !\`,
    },
    color: "text-yellow-500",
  },
  {
    letter: "I",
    name: "Interface Segregation",
    fullName: "Principe de ségrégation des interfaces",
    description: "Les clients ne devraient pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas. Préférez plusieurs petites interfaces spécifiques.",
    violation: {
      label: "❌ Violation",
      code: \`interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeReport(): void;
}

// Un robot doit implémenter eat() et sleep() ?
class Robot implements Worker {
  work() { /* ok */ }
  eat() { throw new Error("Robots don't eat"); }
  sleep() { throw new Error("Robots don't sleep"); }
  attendMeeting() { /* ok */ }
  writeReport() { /* ok */ }
}\`,
    },
    correct: {
      label: "✅ Correct",
      code: \`interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
  sleep(): void;
}

interface Reportable {
  attendMeeting(): void;
  writeReport(): void;
}

class Human implements Workable, Feedable, Reportable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
  attendMeeting() { /* ... */ }
  writeReport() { /* ... */ }
}

class Robot implements Workable, Reportable {
  work() { /* ... */ }
  attendMeeting() { /* ... */ }
  writeReport() { /* ... */ }
  // Pas besoin de eat/sleep !
}\`,
    },
    color: "text-orange-500",
  },
  {
    letter: "D",
    name: "Dependency Inversion",
    fullName: "Principe d'inversion des dépendances",
    description: "Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions. Les abstractions ne doivent pas dépendre des détails.",
    violation: {
      label: "❌ Violation",
      code: \`class MySQLDatabase {
  save(data: any) { /* MySQL specific */ }
}

class UserRepository {
  // Dépend directement de MySQL !
  private db = new MySQLDatabase();

  saveUser(user: User) {
    this.db.save(user);
  }
  // Impossible de changer de BDD sans modifier ce code
}\`,
    },
    correct: {
      label: "✅ Correct",
      code: \`// Abstraction
interface Database {
  save(data: any): Promise<void>;
}

// Implémentation concrète
class MySQLDatabase implements Database {
  async save(data: any) { /* MySQL */ }
}

class MongoDatabase implements Database {
  async save(data: any) { /* MongoDB */ }
}

// Dépend de l'abstraction
class UserRepository {
  constructor(private db: Database) {}

  async saveUser(user: User) {
    await this.db.save(user);
  }
}

// Injection — facile de changer !
const repo = new UserRepository(new MongoDatabase());\`,
    },
    color: "text-red-500",
  },
];

export function SolidExplorer() {
  const [activePrinciple, setActivePrinciple] = useState(0);
  const principle = principles[activePrinciple];

  return (
    <section className="space-y-8">
      {/* Letter selector */}
      <div className="flex justify-center gap-2">
        {principles.map((p, i) => (
          <button
            key={p.letter}
            onClick={() => setActivePrinciple(i)}
            className={cn(
              "w-14 h-14 rounded-xl text-2xl font-black transition-all duration-300",
              activePrinciple === i
                ? \`bg-primary text-primary-foreground shadow-lg scale-110\`
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
            )}
          >
            {p.letter}
          </button>
        ))}
      </div>

      {/* Principle Detail */}
      <Card className="p-8 space-y-6 border-border/40">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={cn("text-3xl font-black", principle.color)}>
              {principle.letter}
            </span>
            <div>
              <h2 className="text-2xl font-bold">{principle.name}</h2>
              <p className="text-sm text-muted-foreground">{principle.fullName}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4">
            {principle.description}
          </p>
        </div>

        {/* Side by side code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge variant="destructive" className="text-xs">
              {principle.violation.label}
            </Badge>
            <pre className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{principle.violation.code}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <Badge className="bg-green-500/10 text-green-500 text-xs">
              {principle.correct.label}
            </Badge>
            <pre className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{principle.correct.code}</code>
            </pre>
          </div>
        </div>
      </Card>
    </section>
  );
}
`,
);

w(
  "architecture/solid/page.tsx",
  `
import { Metadata } from "next";
import { SolidExplorer } from "./_components/solid-explorer";
import { Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Principes SOLID | TechMastry",
  description:
    "Les 5 principes SOLID expliqués avec des exemples avant/après en TypeScript",
};

export default function SolidPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Target className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Principes SOLID
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les 5 principes fondamentaux de la programmation orientée objet
            pour écrire du code maintenable, extensible et testable.
          </p>
        </div>
      </section>

      <SolidExplorer />
    </main>
  );
}
`,
);

// ─── DDD Sub-page ───
w(
  "architecture/ddd/_components/ddd-concepts.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Concept {
  name: string;
  type: "tactical" | "strategic";
  description: string;
  characteristics: string[];
  code?: string;
  color: string;
}

const concepts: Concept[] = [
  {
    name: "Bounded Context",
    type: "strategic",
    description: "Limite explicite à l'intérieur de laquelle un modèle de domaine particulier s'applique. Chaque contexte a son propre langage ubiquitaire.",
    characteristics: [
      "Frontière linguistique",
      "Modèle autonome",
      "Communication via interfaces",
      "Équipe dédiée",
    ],
    color: "text-purple-500",
  },
  {
    name: "Entity",
    type: "tactical",
    description: "Objet défini par son identité (ID) plutôt que par ses attributs. Deux entités avec les mêmes attributs mais des IDs différents sont différentes.",
    characteristics: [
      "Identité unique",
      "Cycle de vie",
      "Mutable",
      "Traçable",
    ],
    code: \`class User {
  constructor(
    public readonly id: UserId,
    private name: string,
    private email: Email
  ) {}

  changeName(newName: string) {
    if (!newName.trim()) throw new Error("Name required");
    this.name = newName;
  }

  // Deux Users sont égaux si même ID
  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}\`,
    color: "text-blue-500",
  },
  {
    name: "Value Object",
    type: "tactical",
    description: "Objet défini par ses attributs, sans identité propre. Immutable. Deux Value Objects avec les mêmes attributs sont identiques.",
    characteristics: [
      "Sans identité",
      "Immutable",
      "Auto-validant",
      "Remplaçable",
    ],
    code: \`class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!email.includes("@"))
      throw new Error("Invalid email");
    this.value = email.toLowerCase();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string { return this.value; }
}

class Money {
  constructor(
    readonly amount: number,
    readonly currency: string
  ) {}

  add(other: Money): Money {
    if (this.currency !== other.currency)
      throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }
}\`,
    color: "text-green-500",
  },
  {
    name: "Aggregate",
    type: "tactical",
    description: "Grappe d'objets (entités + value objects) traitée comme une unité pour les modifications. L'Aggregate Root est le seul point d'entrée.",
    characteristics: [
      "Racine d'agrégat",
      "Frontière transactionnelle",
      "Invariants protégés",
      "Référence par ID",
    ],
    code: \`class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = "draft";

  constructor(public readonly id: OrderId) {}

  // L'Aggregate Root protège les invariants
  addItem(product: ProductId, qty: number, price: Money) {
    if (this.status !== "draft")
      throw new Error("Cannot modify confirmed order");
    if (qty <= 0)
      throw new Error("Quantity must be positive");

    this.items.push(new OrderItem(product, qty, price));
  }

  confirm() {
    if (this.items.length === 0)
      throw new Error("Cannot confirm empty order");
    this.status = "confirmed";
  }

  get total(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Money(0, "EUR")
    );
  }
}\`,
    color: "text-orange-500",
  },
  {
    name: "Domain Event",
    type: "tactical",
    description: "Quelque chose d'important qui s'est produit dans le domaine. Permet le découplage entre agrégats et contextes.",
    characteristics: [
      "Passé composé",
      "Immutable",
      "Timestamped",
      "Découplage",
    ],
    code: \`interface DomainEvent {
  occurredOn: Date;
  eventType: string;
}

class OrderConfirmed implements DomainEvent {
  readonly occurredOn = new Date();
  readonly eventType = "OrderConfirmed";

  constructor(
    readonly orderId: string,
    readonly total: number,
    readonly customerId: string
  ) {}
}

// L'agrégat émet des events
class Order {
  private events: DomainEvent[] = [];

  confirm() {
    this.status = "confirmed";
    this.events.push(
      new OrderConfirmed(this.id, this.total, this.customerId)
    );
  }

  pullEvents(): DomainEvent[] {
    const events = [...this.events];
    this.events = [];
    return events;
  }
}\`,
    color: "text-red-500",
  },
  {
    name: "Repository",
    type: "tactical",
    description: "Interface pour persister et récupérer des Aggregates. Abstraction de la couche de données, orientée domaine.",
    characteristics: [
      "Interface dans le domaine",
      "Implémentation en infra",
      "Par Aggregate Root",
      "Collection-like",
    ],
    code: \`// Défini dans le domaine
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByCustomer(customerId: string): Promise<Order[]>;
}

// Implémenté dans l'infrastructure
class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: OrderId): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id: id.value },
      include: { items: true },
    });
    return data ? OrderMapper.toDomain(data) : null;
  }

  async save(order: Order): Promise<void> {
    const data = OrderMapper.toPersistence(order);
    await this.prisma.order.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}\`,
    color: "text-cyan-500",
  },
];

export function DDDConcepts() {
  const [activeConcept, setActiveConcept] = useState<string>("Bounded Context");
  const concept = concepts.find((c) => c.name === activeConcept) || concepts[0];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Concepts Clés du DDD</h2>

      <div className="flex flex-wrap gap-2">
        {concepts.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveConcept(c.name)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeConcept === c.name
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Card className="p-8 space-y-6 border-border/40">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-2xl font-bold", concept.color)}>
            {concept.name}
          </h3>
          <Badge
            className={
              concept.type === "strategic"
                ? "bg-purple-500/10 text-purple-500"
                : "bg-blue-500/10 text-blue-500"
            }
          >
            {concept.type === "strategic" ? "Stratégique" : "Tactique"}
          </Badge>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {concept.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {concept.characteristics.map((c) => (
            <Badge key={c} variant="outline" className="text-xs">
              {c}
            </Badge>
          ))}
        </div>

        {concept.code && (
          <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{concept.code}</code>
          </pre>
        )}
      </Card>
    </section>
  );
}
`,
);

w(
  "architecture/ddd/page.tsx",
  `
import { Metadata } from "next";
import { DDDConcepts } from "./_components/ddd-concepts";
import { Card } from "@/components/ui/card";
import { Boxes } from "lucide-react";

export const metadata: Metadata = {
  title: "Domain-Driven Design | TechMastry",
  description:
    "Bounded Contexts, Aggregates, Entities, Value Objects et patterns stratégiques du DDD",
};

export default function DDDPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <Boxes className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Domain-Driven Design
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Approche de conception logicielle centrée sur le domaine métier.
            Modélisez la complexité avec des Bounded Contexts, Aggregates et
            un langage ubiquitaire partagé.
          </p>
        </div>
      </section>

      <DDDConcepts />

      {/* Context Map */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Context Map — E-Commerce</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              context: "Catalog",
              models: ["Product", "Category", "Price"],
              color: "border-blue-500/30 bg-blue-500/5",
              textColor: "text-blue-500",
            },
            {
              context: "Order",
              models: ["Order", "OrderItem", "OrderStatus"],
              color: "border-orange-500/30 bg-orange-500/5",
              textColor: "text-orange-500",
            },
            {
              context: "Payment",
              models: ["Payment", "Invoice", "Refund"],
              color: "border-green-500/30 bg-green-500/5",
              textColor: "text-green-500",
            },
          ].map((ctx) => (
            <Card
              key={ctx.context}
              className={"p-6 space-y-3 border-2 " + ctx.color}
            >
              <h3 className={"text-lg font-bold " + ctx.textColor}>
                {ctx.context} Context
              </h3>
              <div className="space-y-1">
                {ctx.models.map((m) => (
                  <div
                    key={m}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {m}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Chaque Bounded Context a son propre modèle de &quot;Product&quot; —
          dans Catalog c&apos;est un produit avec description et catégorie,
          dans Order c&apos;est un line item avec quantité et prix.
        </p>
      </section>
    </main>
  );
}
`,
);

console.log("P1.1 Architecture: DONE");
