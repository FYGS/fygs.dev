"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const exercises = [
  {
    title: "Code Review : Identifier les problèmes",
    difficulty: "medium",
    category: "Code Quality",
    description:
      "Trouvez les problèmes dans ce code et proposez des corrections.",
    badCode: `// ❌ Code à revoir
async function getData(id) {
  let data = null;
  try {
    const response = await fetch("/api/users/" + id);
    data = await response.json();
    if (data.error) {
      console.log("Error: " + data.error);
      return null;
    }
    // Process data
    let result = {};
    result.name = data.firstName + " " + data.lastName;
    result.email = data.email;
    result.age = new Date().getFullYear() - new Date(data.birthday).getFullYear();
    result.isAdmin = data.role == "admin";
    localStorage.setItem("lastUser", JSON.stringify(result));
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}`,
    goodCode: `// ✅ Code corrigé
interface User {
  name: string;
  email: string;
  age: number;
  isAdmin: boolean;
}

class UserServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'UserServiceError';
  }
}

async function getUser(userId: string): Promise<User> {
  const response = await fetch(\`/api/users/\${encodeURIComponent(userId)}\`);
  
  if (!response.ok) {
    throw new UserServiceError(
      \`Failed to fetch user: \${response.statusText}\`,
      response.status
    );
  }

  const data = await response.json();
  
  return {
    name: \`\${data.firstName} \${data.lastName}\`,
    email: data.email,
    age: calculateAge(new Date(data.birthday)),
    isAdmin: data.role === "admin", // === strict
  };
}

function calculateAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}`,
    issues: [
      "== au lieu de ===",
      "Pas de typage TypeScript",
      "Calcul d'âge incorrect (ne considère pas le mois/jour)",
      "Pas d'encodage de l'ID dans l'URL (caractères spéciaux : /, ?, # peuvent altérer l'URL)",
      "localStorage dans une fonction de service (couplage)",
      "console.log au lieu de gestion d'erreur propre",
      "Concaténation de strings au lieu de template literals",
    ],
  },
  {
    title: "Refactoring : Single Responsibility",
    difficulty: "hard",
    category: "SOLID",
    description: "Refactorez cette classe qui viole le principe SRP.",
    badCode: `// ❌ Violation du SRP
class OrderService {
  async createOrder(items, userId) {
    // Validation
    if (!items || items.length === 0) throw new Error("No items");
    for (const item of items) {
      if (item.quantity <= 0) throw new Error("Invalid quantity");
      if (item.price < 0) throw new Error("Invalid price");
    }
    
    // Calcul du total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
      if (item.discount) total -= item.discount;
    }
    const tax = total * 0.2;
    total += tax;
    
    // Sauvegarde en DB
    const order = await db.orders.create({
      userId, items, total, tax, status: "pending"
    });
    
    // Envoi d'email
    const user = await db.users.findById(userId);
    await sendEmail(user.email, "Commande confirmée", 
      \`Votre commande #\${order.id} de \${total}€...\`);
    
    // Logging
    console.log(\`Order \${order.id} created for user \${userId}\`);
    await db.logs.create({ action: "order_created", orderId: order.id });
    
    return order;
  }
}`,
    goodCode: `// ✅ Respect du SRP
class OrderValidator {
  validate(items: OrderItem[]): void {
    if (!items?.length) throw new ValidationError("No items");
    items.forEach(item => {
      if (item.quantity <= 0) throw new ValidationError("Invalid quantity");
      if (item.price < 0) throw new ValidationError("Invalid price");
    });
  }
}

class PriceCalculator {
  calculate(items: OrderItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity) - (item.discount || 0), 0
    );
    const tax = subtotal * 0.2;
    return { subtotal, tax, total: subtotal + tax };
  }
}

class OrderNotifier {
  async notify(user: User, order: Order): Promise<void> {
    await this.emailService.send(user.email, "Commande confirmée", ...);
  }
}

class OrderService {
  constructor(
    private validator: OrderValidator,
    private calculator: PriceCalculator,
    private notifier: OrderNotifier,
    private repository: OrderRepository,
    private userRepo: UserRepository,
  ) {}
  
  async create(items: OrderItem[], userId: string): Promise<Order> {
    this.validator.validate(items);
    const pricing = this.calculator.calculate(items);
    const order = await this.repository.save({ userId, items, ...pricing });
    await this.notifier.notify(await this.userRepo.find(userId), order);
    return order;
  }
}`,
    issues: [
      "La classe fait la validation, le calcul, la persistence, l'email et le logging",
      "Impossible de tester le calcul sans la DB",
      "Changer le format d'email nécessite de modifier OrderService",
      "Pas d'injection de dépendances",
      "Violation du OCP : ajouter un canal de notification = modifier la classe",
    ],
  },
];

export function BestPracticesExercises() {
  const [activeExercise, setActiveExercise] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-8">
      {/* Exercise Selector */}
      <div className="flex flex-wrap gap-2">
        {exercises.map((ex, i) => (
          <button
            key={ex.title}
            onClick={() => {
              setActiveExercise(i);
              setShowSolution(false);
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeExercise === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80",
            )}
          >
            {ex.title}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {exercises[activeExercise].title}
            </h2>
            <Badge variant="outline">
              {exercises[activeExercise].category}
            </Badge>
            <Badge
              className={
                exercises[activeExercise].difficulty === "hard"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-yellow-500/10 text-yellow-500"
              }
            >
              {exercises[activeExercise].difficulty === "hard"
                ? "Difficile"
                : "Moyen"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {exercises[activeExercise].description}
          </p>
        </div>

        {/* Bad Code */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Code à améliorer
          </h3>
          <pre className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
            <code>{exercises[activeExercise].badCode}</code>
          </pre>
        </div>

        {/* Issues to Find */}
        <div>
          <h4 className="font-semibold mb-2">
            Problèmes à identifier ({exercises[activeExercise].issues.length})
          </h4>
          <ul className="space-y-1">
            {exercises[activeExercise].issues.map((issue, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>

        {/* Solution Toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          {showSolution ? "Masquer la solution" : "Voir la solution"}
        </button>

        {showSolution && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Solution
            </h3>
            <pre className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
              <code>{exercises[activeExercise].goodCode}</code>
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}
