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
    code: `class User {
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
}`,
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
    code: `class Email {
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
}`,
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
    code: `class Order {
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
}`,
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
    code: `interface DomainEvent {
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
}`,
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
    code: `// Défini dans le domaine
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
}`,
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
          <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm" tabIndex={0}>
            <code>{concept.code}</code>
          </pre>
        )}
      </Card>
    </section>
  );
}
