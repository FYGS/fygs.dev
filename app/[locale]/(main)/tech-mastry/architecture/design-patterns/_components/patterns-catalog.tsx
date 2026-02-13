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
    code: `class Database {
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
const db = Database.getInstance();`,
  },
  {
    name: "Factory Method",
    category: "Creational",
    intent: "Définir une interface de création d'objets, mais laisser les sous-classes décider.",
    useCases: ["Création conditionnelle", "Plugins", "UI Themes"],
    code: `interface Notification {
  send(message: string): void;
}

class EmailNotification implements Notification {
  send(message: string) { console.log(\`Email: \${message}\`); }
}

class SMSNotification implements Notification {
  send(message: string) { console.log(\`SMS: \${message}\`); }
}

class NotificationFactory {
  static create(type: "email" | "sms"): Notification {
    switch (type) {
      case "email": return new EmailNotification();
      case "sms":   return new SMSNotification();
    }
  }
}`,
  },
  {
    name: "Observer",
    category: "Behavioral",
    intent: "Définir une dépendance un-à-plusieurs pour que les observateurs soient notifiés automatiquement.",
    useCases: ["Event systems", "UI Updates", "Pub/Sub", "State management"],
    code: `type Listener<T> = (data: T) => void;

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
bus.on("userLogin", ({ userId }) => console.log(userId));`,
  },
  {
    name: "Strategy",
    category: "Behavioral",
    intent: "Définir une famille d'algorithmes interchangeables encapsulés indépendamment.",
    useCases: ["Algorithmes de tri", "Validation", "Pricing", "Authentication"],
    code: `interface PricingStrategy {
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
}`,
  },
  {
    name: "Decorator",
    category: "Structural",
    intent: "Attacher dynamiquement des responsabilités supplémentaires à un objet.",
    useCases: ["Logging", "Caching", "Auth middleware", "Compression"],
    code: `interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
}

class TimestampDecorator implements Logger {
  constructor(private wrapped: Logger) {}
  log(message: string) {
    this.wrapped.log(\`[\${new Date().toISOString()}] \${message}\`);
  }
}

class PrefixDecorator implements Logger {
  constructor(private wrapped: Logger, private prefix: string) {}
  log(message: string) {
    this.wrapped.log(\`[\${this.prefix}] \${message}\`);
  }
}

// Composition
const logger = new PrefixDecorator(
  new TimestampDecorator(new ConsoleLogger()),
  "APP"
);`,
  },
  {
    name: "Adapter",
    category: "Structural",
    intent: "Convertir l'interface d'une classe en une autre interface attendue par le client.",
    useCases: ["Legacy integration", "Third-party libs", "API versioning"],
    code: `// Interface attendue par notre app
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
}`,
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
