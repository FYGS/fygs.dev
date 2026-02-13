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
                    ? `${layer.ring} ring-4 ${layer.bgLight} border-current ${layer.textColor}`
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
