import { Lightbulb } from "lucide-react";

export function BestPracticesHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
        <Lightbulb className="w-8 h-8" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Best Practices
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conseils et stratégies pour exceller dans vos entretiens techniques.
        </p>
      </div>
    </section>
  );
}
