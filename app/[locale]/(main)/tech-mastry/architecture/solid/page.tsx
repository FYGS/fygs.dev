import { Metadata } from "next";
import { SolidExplorer } from "./_components/solid-explorer";
import { Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Principes SOLID | TechMastry",
  description:
    "Les 5 principes SOLID expliqués avec des exemples avant/après en TypeScript",
};

export default function SolidPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Target className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Principes SOLID
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les 5 principes fondamentaux de la programmation orientée objet
            pour écrire du code maintenable, extensible et testable.
          </p>
        </div>
      </section>

      <SolidExplorer />
    </main>
  );
}
