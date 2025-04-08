import { Brain } from "lucide-react";

export function AlgorithmsHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
        <Brain className="w-8 h-8" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Algorithmes & Structures de Données
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les concepts fondamentaux et pratiquez avec des exercices ciblés pour exceller dans vos entretiens techniques.
        </p>
      </div>
    </section>
  );
}
