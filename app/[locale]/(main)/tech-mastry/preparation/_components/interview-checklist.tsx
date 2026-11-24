"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const checklistItems = [
  { category: "Technique", items: [
    "Maîtrise des structures de données (arrays, trees, graphs, hash maps, heaps)",
    "Algorithmes de tri et recherche",
    "Programmation dynamique (patterns classiques : knapsack, LIS, grille, sous-chaînes)",
    "System Design : au moins 5 designs pratiqués",
    "Connaissances du framework/stack de l'entreprise cible",
    "SQL : JOINs, GROUP BY, window functions",
  ]},
  { category: "Behavioral", items: [
    "5 histoires STAR préparées et pratiquées",
    "Réponse à 'Tell me about yourself' (2 min)",
    "3-5 questions pertinentes à poser",
    "Préparé pour les questions de leadership et conflit",
    "Connaissez les valeurs de l'entreprise",
  ]},
  { category: "Logistique", items: [
    "CV à jour et adapté au poste",
    "Connexion internet testée",
    "Caméra et micro fonctionnels",
    "Environnement calme et bien éclairé",
    "Tenue professionnelle préparée",
    "Carnet et stylo à portée de main",
    "Eau et snack disponibles",
  ]},
  { category: "Mental", items: [
    "Bon sommeil la veille (7-8h)",
    "Exercice de respiration pratiqué",
    "Visualisation positive faite",
    "Rappel : c'est une conversation, pas un examen",
    "Plan de debriefing post-entretien préparé",
  ]},
];

export function InterviewChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalItems = checklistItems.reduce((sum, cat) => sum + cat.items.length, 0);
  const progress = Math.round((checked.size / totalItems) * 100);

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Checklist Pré-Entretien</h2>
        <div className="flex items-center justify-center gap-3">
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: progress + "%" }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checklistItems.map((cat) => (
          <Card key={cat.category} className="p-6 border-border/40">
            <h3 className="font-semibold text-lg mb-4">{cat.category}</h3>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border mt-0.5 transition-colors",
                    checked.has(item)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}>
                    {checked.has(item) && <span className="text-xs">✓</span>}
                  </div>
                  <span className={cn(
                    "text-sm transition-colors",
                    checked.has(item) ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
