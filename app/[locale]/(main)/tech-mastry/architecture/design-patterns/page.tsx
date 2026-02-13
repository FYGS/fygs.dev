import { Metadata } from "next";
import { PatternsCatalog } from "./_components/patterns-catalog";
import { Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Design Patterns | TechMastry",
  description:
    "Catalogue interactif des design patterns : Creational, Structural et Behavioral avec exemples TypeScript",
};

export default function DesignPatternsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Workflow className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Design Patterns</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solutions éprouvées aux problèmes récurrents de conception logicielle.
            Chaque pattern inclut le code TypeScript et des cas d&apos;usage concrets.
          </p>
        </div>
      </section>

      <PatternsCatalog />
    </main>
  );
}
