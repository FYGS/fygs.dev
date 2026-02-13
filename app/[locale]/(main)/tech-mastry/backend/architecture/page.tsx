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
    code: `// Controller
class UserController {
  async getUser(req: Request, res: Response) {
    const user = await UserModel.findById(req.params.id);
    res.json(UserView.render(user));
  }
}`,
    color: "border-blue-500/30",
  },
  {
    name: "Repository Pattern",
    desc: "Abstraction de la couche d'accès aux données. Découple la logique métier du stockage.",
    pros: ["Testable (mock repos)", "Interchangeable (SQL→NoSQL)", "Clean interfaces"],
    cons: ["Boilerplate", "Can leak abstractions"],
    code: `interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

class PrismaUserRepository implements UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
  // ...
}`,
    color: "border-green-500/30",
  },
  {
    name: "CQRS",
    desc: "Command Query Responsibility Segregation. Sépare les lectures des écritures pour optimiser chaque chemin.",
    pros: ["Performance optimisée", "Scalabilité indépendante", "Modèles read/write spécifiques"],
    cons: ["Complexité accrue", "Eventual consistency", "Plus de code"],
    code: `// Command (écriture)
class CreateOrderCommand {
  constructor(
    public userId: string,
    public items: OrderItem[]
  ) {}
}

// Query (lecture) — modèle optimisé
class OrderReadModel {
  async getOrderSummary(orderId: string) {
    return db.query(\`
      SELECT o.*, u.name, COUNT(i.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN items i ON i.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id, u.name
    \`, [orderId]);
  }
}`,
    color: "border-purple-500/30",
  },
  {
    name: "Event Sourcing",
    desc: "Au lieu de stocker l'état actuel, stockez tous les événements qui ont mené à cet état. Rejouer pour reconstruire.",
    pros: ["Audit trail complet", "Time travel debugging", "Replay & projection"],
    cons: ["Complexité", "Storage important", "Schema evolution"],
    code: `// Store events, not state
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
}`,
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
