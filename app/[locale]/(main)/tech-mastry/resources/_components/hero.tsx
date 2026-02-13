import { BookOpen, Sparkles } from "lucide-react";

export function ResourcesHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-rose-500/10 text-rose-500">
        <BookOpen className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Ressources & Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Une sélection curatée des meilleurs livres, cours et outils pour
          accélérer votre progression et exceller en entretien technique.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-rose-500" />
        <span>Ressources vérifiées et recommandées par des experts</span>
      </div>
    </section>
  );
}
