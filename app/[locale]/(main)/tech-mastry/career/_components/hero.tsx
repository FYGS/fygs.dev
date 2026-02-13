import { DollarSign, Sparkles } from "lucide-react";

export function CareerHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
        <DollarSign className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Négociation & Carrière</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stratégies de négociation salariale, progression de carrière et conseils
          pour réussir vos entretiens et propulser votre parcours professionnel.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span>Négociation • Progression • Entretiens</span>
      </div>
    </section>
  );
}
