"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Box,
  GitBranch,
  Database,
  Code2,
} from "lucide-react";
import { useState } from "react";

function PatternExplorer() {
  const [selected, setSelected] = useState(0);
  const patterns = [
    {
      name: "MVC",
      fullName: "Model-View-Controller",
      icon: Box,
      color: "text-blue-400",
      gradient: "from-blue-500/10 to-blue-500/5 border-blue-500/30",
      desc: "Séparation claire entre données (Model), interface (View) et logique (Controller). Le pattern le plus répandu.",
      layers: ["Controller", "Service", "Model", "View"],
      pros: [
        "Simple à comprendre",
        "Séparation des préoccupations",
        "Testable",
      ],
      cons: ["Controllers obèses", "Couplage View-Model", "Difficile à scaler"],
      code: `// Controller — reçoit la requête, délègue au service
class UserController {
  constructor(private userService: UserService) {}

  async getUser(req: Request, res: Response) {
    const user = await this.userService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(UserView.render(user));
  }

  async createUser(req: Request, res: Response) {
    const validated = createUserSchema.parse(req.body);
    const user = await this.userService.create(validated);
    return res.status(201).json(UserView.render(user));
  }
}

// Model — accès aux données
const UserModel = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: CreateUserDTO) => prisma.user.create({ data }),
};

// View — formatage de la réponse
const UserView = {
  render: (user: User) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    // Exclut passwordHash, metadata internes
  }),
};`,
    },
    {
      name: "Clean Architecture",
      fullName: "Hexagonal / Ports & Adapters",
      icon: Layers,
      color: "text-green-400",
      gradient: "from-green-500/10 to-green-500/5 border-green-500/30",
      desc: "Les dépendances pointent vers le centre (domain). Le domain ne connaît pas l'infrastructure.",
      layers: [
        "Domain (Entities)",
        "Use Cases",
        "Interface Adapters",
        "Infrastructure",
      ],
      pros: ["Domain isolé", "Testable sans DB", "Interchangeable (SQL→NoSQL)"],
      cons: ["Beaucoup de boilerplate", "Over-engineering pour petits projets"],
      code: `// Domain — entité pure, aucune dépendance
class Order {
  constructor(
    public id: string,
    public items: OrderItem[],
    public status: OrderStatus
  ) {}

  get total() { return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0); }
  canCancel() { return this.status === "pending"; }
}

// Use Case — logique métier
class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,  // Port (interface)
    private paymentGateway: PaymentGateway  // Port
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const order = new Order(crypto.randomUUID(), input.items, "pending");
    await this.paymentGateway.charge(order.total);
    await this.orderRepo.save(order);
    return order;
  }
}

// Port (interface) — le domain définit le contrat
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

// Adapter (infrastructure) — implémente le port
class PrismaOrderRepository implements OrderRepository {
  async save(order: Order) { await prisma.order.create({ data: order }); }
  async findById(id: string) { return prisma.order.findUnique({ where: { id } }); }
}`,
    },
    {
      name: "CQRS",
      fullName: "Command Query Responsibility Segregation",
      icon: GitBranch,
      color: "text-purple-400",
      gradient: "from-purple-500/10 to-purple-500/5 border-purple-500/30",
      desc: "Sépare les lectures (Query) des écritures (Command) pour optimiser chaque chemin indépendamment.",
      layers: [
        "Commands (Write)",
        "Queries (Read)",
        "Command Handlers",
        "Query Handlers",
      ],
      pros: [
        "Performance optimisée par chemin",
        "Scalabilité indépendante",
        "Modèles read/write spécifiques",
      ],
      cons: ["Complexité accrue", "Eventual consistency", "Plus de code"],
      code: `// Command — intention d'écriture
class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly items: { productId: string; quantity: number }[]
  ) {}
}

// Command Handler — traite l'écriture
class CreateOrderHandler {
  async handle(command: CreateOrderCommand) {
    const order = await this.orderRepo.create({
      userId: command.userId,
      items: command.items,
      status: "pending",
    });
    // Publie un event pour mettre à jour le read model
    await this.eventBus.publish("OrderCreated", { orderId: order.id });
    return order;
  }
}

// Query — lecture optimisée (peut être une vue dénormalisée)
class GetOrderSummaryQuery {
  constructor(public readonly orderId: string) {}
}

// Query Handler — modèle de lecture optimisé
class GetOrderSummaryHandler {
  async handle(query: GetOrderSummaryQuery) {
    // Lit depuis une vue dénormalisée (rapide)
    return this.readDb.query(\`
      SELECT o.id, o.status, u.name as userName,
             COUNT(i.id) as itemCount, SUM(i.price) as total
      FROM order_summaries o
      JOIN users u ON o.user_id = u.id
      JOIN order_items i ON i.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id, u.name
    \`, [query.orderId]);
  }
}`,
    },
    {
      name: "Event Sourcing",
      fullName: "Event Store + Projections",
      icon: Database,
      color: "text-orange-400",
      gradient: "from-orange-500/10 to-orange-500/5 border-orange-500/30",
      desc: "Au lieu de stocker l'état actuel, on stocke tous les événements. L'état est recalculé en rejouant les events.",
      layers: ["Events", "Event Store", "Projections", "Aggregates"],
      pros: [
        "Audit trail complet",
        "Time travel debugging",
        "Replay & rebuild",
      ],
      cons: [
        "Complexité technique",
        "Storage important",
        "Schema evolution difficile",
      ],
      code: `// Les événements sont la source de vérité
interface DomainEvent {
  type: string;
  aggregateId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// Event Store — append-only log
const eventStore: DomainEvent[] = [
  { type: "OrderCreated", aggregateId: "order-1", timestamp: new Date("2024-01-01"), data: { userId: "u1" } },
  { type: "ItemAdded", aggregateId: "order-1", timestamp: new Date("2024-01-01"), data: { product: "Widget", price: 29.99 } },
  { type: "ItemAdded", aggregateId: "order-1", timestamp: new Date("2024-01-01"), data: { product: "Gadget", price: 49.99 } },
  { type: "OrderConfirmed", aggregateId: "order-1", timestamp: new Date("2024-01-02"), data: {} },
];

// Rebuild state by replaying events
function rebuildOrder(events: DomainEvent[]): Order {
  return events.reduce((order, event) => {
    switch (event.type) {
      case "OrderCreated":
        return { id: event.aggregateId, items: [], status: "draft", total: 0 };
      case "ItemAdded":
        return {
          ...order,
          items: [...order.items, event.data],
          total: order.total + (event.data.price as number),
        };
      case "OrderConfirmed":
        return { ...order, status: "confirmed" };
      default: return order;
    }
  }, {} as Order);
}

// Time travel — voir l'état à n'importe quel moment
function getStateAt(events: DomainEvent[], date: Date) {
  return rebuildOrder(events.filter(e => e.timestamp <= date));
}`,
    },
  ];
  const current = patterns[selected];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Patterns d&apos;Architecture</h2>
      <div className="flex gap-2 flex-wrap">
        {patterns.map((p, i) => {
          const I = p.icon;
          return (
            <button
              key={p.name}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${selected === i ? `bg-gradient-to-r ${p.gradient} ${p.color}` : "border-border/40 text-muted-foreground"}`}
            >
              <I className="w-4 h-4" /> {p.name}
            </button>
          );
        })}
      </div>

      <Card
        className={`p-6 space-y-5 border-2 ${current.gradient.split(" ").pop()}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${current.color}`} />
          <div>
            <h3 className="text-xl font-bold">{current.name}</h3>
            <p className="text-xs text-muted-foreground">{current.fullName}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{current.desc}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {current.layers.map((layer, i) => (
            <div key={layer} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {layer}
              </Badge>
              {i < current.layers.length - 1 && (
                <ArrowRight className={`w-3 h-3 ${current.color}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-green-400">Avantages</p>
            {current.pros.map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-red-400">Inconvénients</p>
            {current.cons.map((c) => (
              <div key={c} className="flex items-center gap-1.5 text-xs">
                <ArrowRight className="w-3 h-3 text-red-400 shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20 max-h-[400px] overflow-y-auto">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}

function LayerDiagram() {
  const [activeLayer, setActiveLayer] = useState(0);
  const layers = [
    {
      name: "Presentation",
      desc: "Controllers, Routes, Middleware. Reçoit les requêtes HTTP et retourne les réponses.",
      color: "bg-blue-500/20 border-blue-500/40 text-blue-400",
      responsibility:
        "Validation input, Auth middleware, Rate limiting, Response formatting",
    },
    {
      name: "Application",
      desc: "Use Cases, Services. Orchestre la logique métier et coordonne les interactions.",
      color: "bg-green-500/20 border-green-500/40 text-green-400",
      responsibility:
        "Business rules, Transactions, Event publishing, Error handling",
    },
    {
      name: "Domain",
      desc: "Entities, Value Objects, Domain Events. Le coeur de la logique métier.",
      color: "bg-purple-500/20 border-purple-500/40 text-purple-400",
      responsibility:
        "Business invariants, Domain events, Entity lifecycle, Validation rules",
    },
    {
      name: "Infrastructure",
      desc: "Repositories, External APIs, Database, Cache. Détails techniques.",
      color: "bg-orange-500/20 border-orange-500/40 text-orange-400",
      responsibility:
        "Database access, External APIs, File system, Email sending, Caching",
    },
  ];
  const current = layers[activeLayer];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Code2 className="w-6 h-6 text-cyan-400" /> Architecture en Couches
      </h2>
      <div className="flex flex-col gap-2">
        {layers.map((layer, i) => (
          <button
            key={layer.name}
            onClick={() => setActiveLayer(i)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${activeLayer === i ? layer.color : "border-border/20 hover:border-border/50"}`}
            style={{ width: `${100 - i * 8}%`, marginLeft: `${i * 4}%` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{layer.name}</span>
              {activeLayer === i && (
                <Badge variant="outline" className="text-[10px]">
                  Active
                </Badge>
              )}
            </div>
            {activeLayer === i && (
              <p className="text-xs text-muted-foreground mt-1">{layer.desc}</p>
            )}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Responsabilités de {current.name}:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {current.responsibility.split(", ").map((r) => (
            <Badge key={r} variant="outline" className="text-xs">
              {r}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BackendArchitecturePage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Architecture Backend
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explorez MVC, Clean Architecture, CQRS et Event Sourcing avec des
            exemples de code détaillés et des diagrammes interactifs.
          </p>
        </div>
      </section>

      <Card className="p-8 border-border/40">
        <PatternExplorer />
      </Card>
      <Card className="p-8 border-border/40">
        <LayerDiagram />
      </Card>
    </div>
  );
}
