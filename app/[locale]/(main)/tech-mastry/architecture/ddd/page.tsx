import { DDDConcepts } from "./_components/ddd-concepts";
import { Card } from "@/components/ui/card";
import { Boxes } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/architecture/ddd");

export default function DDDPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
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
    </div>
  );
}
