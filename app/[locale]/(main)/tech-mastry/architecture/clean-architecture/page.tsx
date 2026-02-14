import { Metadata } from "next";
import { LayersDiagram } from "./_components/layers-diagram";
import { CodeExamples } from "./_components/code-examples";
import { Card } from "@/components/ui/card";
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
              description:
                "Les règles métier peuvent être testées sans UI, base de données ou serveur web.",
              color: "text-green-500",
            },
            {
              title: "Indépendance",
              description:
                "Le système ne dépend pas d'un framework, d'une base de données ou d'une UI spécifique.",
              color: "text-blue-500",
            },
            {
              title: "Maintenabilité",
              description:
                "Les changements dans une couche externe n'affectent pas les couches internes.",
              color: "text-purple-500",
            },
          ].map((item) => (
            <Card key={item.title} className="p-6 space-y-2 border-border/40">
              <h3 className={"text-lg font-semibold " + item.color}>
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <CodeExamples />

      <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              Continuez avec les principes SOLID
            </h3>
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
