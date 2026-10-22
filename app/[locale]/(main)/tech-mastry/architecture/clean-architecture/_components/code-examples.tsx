"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const examples = [
  {
    id: "monolith",
    label: "❌ Monolithe Couplé",
    description: "Tout est mélangé : logique métier, accès base de données et présentation.",
    code: `// ❌ Route Express avec tout mélangé
app.post("/orders", async (req, res) => {
  // Validation directe
  if (!req.body.items?.length) {
    return res.status(400).json({ error: "No items" });
  }

  // Accès DB direct dans le controller
  const { rows: [user] } = await db.query(
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
});`,
  },
  {
    id: "clean",
    label: "✅ Clean Architecture",
    description: "Chaque couche a une responsabilité claire. Le code est testable et maintenable.",
    code: `// ✅ Entity — Règle métier pure (montants en centimes)
class Order {
  constructor(
    readonly userId: string,
    readonly items: OrderItem[],
    private readonly isPremium: boolean
  ) {}

  get total(): number {
    const gross = this.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity, 0
    );
    // -10 % pour les clients premium
    return this.isPremium ? Math.round(gross * 0.9) : gross;
  }
}

// ✅ Use Case — Orchestre les entités via des ports (interfaces)
class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private userRepo: IUserRepository,
    private notifier: INotificationService
  ) {}

  async execute(input: CreateOrderInput): Promise<SavedOrder> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const order = new Order(user.id, input.items, user.isPremium);
    const saved = await this.orderRepo.save(order);

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
}`,
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
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm" tabIndex={0}>
          <code>{active.code}</code>
        </pre>
      </Card>
    </section>
  );
}
