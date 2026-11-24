"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const levels = [
  {
    title: "Junior",
    years: "0-2 ans",
    color: "bg-green-500",
    textColor: "text-green-500",
    bgLight: "bg-green-500/10",
    scope: "Tâches individuelles",
    skills: [
      "Maîtrise d'un langage et d'un framework",
      "Écriture de code propre avec guidance",
      "Compréhension des bases de données",
      "Tests unitaires basiques",
      "Communication dans l'équipe",
    ],
    expectations: [
      "Livrer des features avec aide du mentor",
      "Poser des questions pertinentes",
      "Apprendre et progresser rapidement",
      "Suivre les conventions de l'équipe",
    ],
  },
  {
    title: "Mid-Level",
    years: "2-5 ans",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgLight: "bg-blue-500/10",
    scope: "Features complètes",
    skills: [
      "Maîtrise de plusieurs technologies",
      "Design de composants et modules",
      "Code reviews constructives",
      "Debugging complexe",
      "Documentation technique",
    ],
    expectations: [
      "Livrer des features de manière autonome",
      "Identifier et résoudre les problèmes techniques",
      "Mentorer les juniors",
      "Contribuer aux décisions techniques",
    ],
  },
  {
    title: "Senior",
    years: "5-8 ans",
    color: "bg-purple-500",
    textColor: "text-purple-500",
    bgLight: "bg-purple-500/10",
    scope: "Système / Équipe",
    skills: [
      "Architecture de systèmes complexes",
      "Leadership technique sans autorité formelle",
      "Optimisation de performance",
      "Prise de décisions techniques stratégiques",
      "Communication cross-fonctionnelle",
    ],
    expectations: [
      "Définir l'architecture des nouveaux systèmes",
      "Multiplier la productivité de l'équipe",
      "Anticiper les problèmes techniques",
      "Influencer la roadmap technique",
    ],
  },
  {
    title: "Staff",
    years: "8-12 ans",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    bgLight: "bg-orange-500/10",
    scope: "Multi-équipes / Org",
    skills: [
      "Vision technique long terme",
      "Alignement technique avec le business",
      "Résolution de problèmes ambigus",
      "Gestion de la dette technique",
      "Influence organisationnelle",
    ],
    expectations: [
      "Définir la direction technique de l'organisation",
      "Résoudre les problèmes techniques les plus complexes",
      "Construire des ponts entre les équipes",
      "Établir les standards et les pratiques",
    ],
  },
  {
    title: "Principal",
    years: "12+ ans",
    color: "bg-red-500",
    textColor: "text-red-500",
    bgLight: "bg-red-500/10",
    scope: "Entreprise / Industrie",
    skills: [
      "Impact à l'échelle de l'entreprise",
      "Innovation et R&D",
      "Recrutement et attraction de talents",
      "Conférences et publications",
      "Vision technique sur 3-5 ans",
    ],
    expectations: [
      "Définir la stratégie technique de l'entreprise",
      "Créer de nouveaux domaines et opportunités",
      "Représenter l'entreprise dans l'industrie",
      "Former les futurs leaders techniques",
    ],
  },
];

export function CareerLadder() {
  const [activeLevel, setActiveLevel] = useState(0);
  const level = levels[activeLevel];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Échelle de Carrière</h2>

      {/* Visual Ladder */}
      <div className="flex items-end gap-2 justify-center h-48">
        {levels.map((l, i) => (
          <button
            key={l.title}
            onClick={() => setActiveLevel(i)}
            className={cn(
              "rounded-t-lg transition-all duration-300 w-16 md:w-24 flex items-end justify-center pb-2",
              activeLevel === i ? l.color + " text-white shadow-lg" : "bg-muted/50 hover:bg-muted",
            )}
            style={{ height: `${40 + i * 25}%` }}
          >
            <span className="text-xs font-bold writing-mode-vertical md:writing-mode-horizontal">
              N{i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Level Details */}
      <Card className="p-8 space-y-6 border-border/40">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className={cn("text-2xl font-bold", level.textColor)}>
              {level.title}
            </h3>
            <p className="text-muted-foreground">
              {level.years} d&apos;expérience (repère indicatif : les grilles varient
              selon les entreprises et le niveau dépend de l&apos;impact, pas de
              l&apos;ancienneté)
            </p>
          </div>
          <Badge className={level.bgLight + " " + level.textColor}>
            Scope : {level.scope}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Compétences attendues</h4>
            <ul className="space-y-2">
              {level.skills.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", level.color)} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Ce qu&apos;on attend de vous</h4>
            <ul className="space-y-2">
              {level.expectations.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">→</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
