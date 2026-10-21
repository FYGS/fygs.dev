"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TestTubes,
  Triangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Code2,
  Layers,
  Gauge,
} from "lucide-react";
import { useState } from "react";

function TestPyramid() {
  const [activeLayer, setActiveLayer] = useState<
    "unit" | "integration" | "e2e"
  >("unit");
  const layers = {
    unit: {
      label: "Tests Unitaires",
      count: "~70%",
      speed: "< 10ms",
      cost: "Tres bas",
      color: "from-green-500/20 to-green-500/5 border-green-500/30",
      desc: "Testent une fonction/module isole. Rapides, nombreux, fiables.",
      example: `describe("calculateTotal", () => {
  test("with valid items", () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(35);
  });

  test("with empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });

  test("with discount", () => {
    const items = [{ price: 100, quantity: 1 }];
    expect(calculateTotal(items, 0.1)).toBe(90);
  });
});`,
    },
    integration: {
      label: "Tests d'Integration",
      count: "~20%",
      speed: "100ms - 2s",
      cost: "Moyen",
      color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
      desc: "Testent l'interaction entre modules (API + DB, services entre eux).",
      example: `describe("POST /api/orders", () => {
  test("creates order with valid data", async () => {
    const user = await createTestUser();
    const product = await createTestProduct({ stock: 10 });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", \`Bearer \${user.token}\`)
      .send({ productId: product.id, quantity: 2 });

    expect(response.status).toBe(201);
    expect(response.body.order.total).toBe(product.price * 2);

    // Verifie que le stock a diminue
    const updated = await db.product.findUnique({ where: { id: product.id } });
    expect(updated.stock).toBe(8);
  });
});`,
    },
    e2e: {
      label: "Tests E2E",
      count: "~10%",
      speed: "5s - 30s",
      cost: "Eleve",
      color: "from-red-500/20 to-red-500/5 border-red-500/30",
      desc: "Simulent un utilisateur reel dans un vrai navigateur.",
      example: `test("complete checkout flow", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill("[name=email]", "user@test.com");
  await page.fill("[name=password]", "password123");
  await page.click("button[type=submit]");

  // Browse & add to cart
  await page.goto("/products");
  await page.click('[data-testid="product-1"]');
  await page.click("text=Ajouter au panier");

  // Checkout
  await page.click("text=Commander");
  await page.fill("[name=card]", "4242424242424242");
  await page.click("text=Payer");

  await expect(page.locator("text=Commande confirmee")).toBeVisible();
});`,
    },
  };
  const current = layers[activeLayer];
  const sizes = { unit: "h-28", integration: "h-20", e2e: "h-12" };
  const widths = { unit: "w-full", integration: "w-3/4", e2e: "w-1/2" };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Triangle className="w-5 h-5 text-green-400" /> Pyramide des Tests
      </h3>
      <div className="flex flex-col items-center gap-1 py-6">
        {(["e2e", "integration", "unit"] as const).map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`${widths[layer]} ${sizes[layer]} rounded-lg border bg-gradient-to-b ${layers[layer].color} flex items-center justify-center transition-all ${activeLayer === layer ? "ring-2 ring-primary scale-105" : "hover:scale-[1.02]"}`}
          >
            <div className="text-center">
              <p className="font-bold text-sm">{layers[layer].label}</p>
              <p className="text-xs text-muted-foreground">
                {layers[layer].count}
              </p>
            </div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-xs text-muted-foreground">Proportion</p>
          <p className="font-bold text-lg">{current.count}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-xs text-muted-foreground">Vitesse</p>
          <p className="font-bold text-lg">{current.speed}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-xs text-muted-foreground">Cout</p>
          <p className="font-bold text-lg">{current.cost}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{current.desc}</p>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
        <code>{current.example}</code>
      </pre>
    </div>
  );
}

function TddCycle() {
  const [phase, setPhase] = useState(0);
  const phases = [
    {
      name: "RED",
      desc: "Ecrire un test qui echoue",
      color: "text-red-500 border-red-500 bg-red-500/10",
      code: `// Step 1: Ecrire le test d'abord
test("should validate email format", () => {
  expect(validateEmail("user@example.com")).toBe(true);
  expect(validateEmail("invalid")).toBe(false);
  expect(validateEmail("")).toBe(false);
});

// RESULTAT: FAIL - validateEmail is not defined`,
    },
    {
      name: "GREEN",
      desc: "Ecrire le minimum de code pour passer",
      color: "text-green-500 border-green-500 bg-green-500/10",
      code: `// Step 2: Implementation minimale
function validateEmail(email: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

// RESULTAT: PASS - Tous les tests passent`,
    },
    {
      name: "REFACTOR",
      desc: "Ameliorer sans changer le comportement",
      color: "text-blue-500 border-blue-500 bg-blue-500/10",
      code: `// Step 3: Refactoriser
const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

// RESULTAT: PASS - Tests toujours verts`,
    },
  ];
  const current = phases[phase];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-blue-400" /> Cycle TDD (Test-Driven
        Development)
      </h3>
      <div className="flex items-center justify-center gap-4 py-4">
        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => setPhase(i)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${phase === i ? p.color + " scale-110" : "border-border/30 text-muted-foreground hover:scale-105"}`}
          >
            <span className="text-2xl font-black">{p.name}</span>
            <span className="text-[10px] text-center max-w-[100px]">
              {p.desc}
            </span>
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {phases.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${phase === i ? "bg-primary scale-150" : "bg-muted-foreground/30"}`}
          />
        ))}
      </div>
      <pre
        className={`rounded-lg p-4 text-xs font-mono overflow-x-auto border ${current.color}`}
      >
        <code>{current.code}</code>
      </pre>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setPhase((phase + 2) % 3)}
          className="px-4 py-2 rounded-lg bg-muted text-sm"
        >
          Precedent
        </button>
        <button
          onClick={() => setPhase((phase + 1) % 3)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function CoverageDemo() {
  const metrics = [
    { name: "Statements", value: 87, target: 80 },
    { name: "Branches", value: 72, target: 80 },
    { name: "Functions", value: 94, target: 90 },
    { name: "Lines", value: 89, target: 80 },
  ];
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Gauge className="w-5 h-5 text-cyan-400" /> Code Coverage
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => {
          const passing = m.value >= m.target;
          return (
            <div
              key={m.name}
              className="space-y-2 p-4 rounded-lg bg-muted/20 border border-border/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.name}</span>
                <span
                  className={`text-sm font-bold ${passing ? "text-green-500" : "text-red-400"}`}
                >
                  {m.value}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${passing ? "bg-green-500" : "bg-red-400"}`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Target: {m.target}%{" "}
                {passing ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500 inline" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400 inline" />
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestTypes() {
  const types = [
    {
      name: "Unit",
      framework: "Vitest / Jest",
      speed: "Rapide",
      isolation: "Totale",
      icon: Code2,
      color: "text-green-400",
    },
    {
      name: "Integration",
      framework: "Supertest / MSW",
      speed: "Moyen",
      isolation: "Partielle",
      icon: Layers,
      color: "text-yellow-400",
    },
    {
      name: "E2E",
      framework: "Playwright / Cypress",
      speed: "Lent",
      isolation: "Aucune",
      icon: Gauge,
      color: "text-red-400",
    },
    {
      name: "Snapshot",
      framework: "Vitest / Jest",
      speed: "Rapide",
      isolation: "Totale",
      icon: Code2,
      color: "text-purple-400",
    },
    {
      name: "Performance",
      framework: "k6 / Artillery",
      speed: "Variable",
      isolation: "Aucune",
      icon: Gauge,
      color: "text-cyan-400",
    },
  ];
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Types de Tests</h3>
      <div className="grid gap-3">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.name}
              className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
            >
              <Icon className={`w-5 h-5 ${t.color} shrink-0`} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.framework}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {t.speed}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {t.isolation}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TestingPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <TestTubes className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Testing Strategy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pyramide des tests, TDD, coverage, frameworks &mdash; maitrisez
            l&apos;art du testing logiciel.
          </p>
        </div>
      </section>
      <Card className="p-8 border-border/40">
        <TestPyramid />
      </Card>
      <Card className="p-8 border-border/40">
        <TddCycle />
      </Card>
      <Card className="p-8 border-border/40">
        <CoverageDemo />
      </Card>
      <Card className="p-8 border-border/40">
        <TestTypes />
      </Card>
    </div>
  );
}
