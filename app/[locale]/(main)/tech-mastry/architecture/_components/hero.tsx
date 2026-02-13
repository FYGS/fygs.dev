import { BrainCircuit, Sparkles } from "lucide-react";

export function ArchitectureHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
        <BrainCircuit className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Architecture & Design Patterns
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les principes d&apos;architecture logicielle, les design patterns
          et les méthodes de conception qui font la différence en entretien.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span>Clean Architecture • SOLID • DDD • Design Patterns</span>
      </div>
    </section>
  );
}
