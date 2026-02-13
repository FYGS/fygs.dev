"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const steps = [
  {
    step: 1,
    title: "Recherche de Marché",
    description: "Avant toute négociation, connaissez votre valeur sur le marché.",
    details: [
      "Consultez Glassdoor, Levels.fyi, Blind pour les salaires réels",
      "Filtrez par ville, expérience, taille d'entreprise et secteur",
      "Identifiez la fourchette basse, médiane et haute de votre poste",
      "Prenez en compte le package total : salaire + bonus + equity + avantages",
    ],
    tip: "Ne donnez jamais votre salaire actuel en premier. Demandez toujours la fourchette du poste.",
  },
  {
    step: 2,
    title: "Définir votre Cible",
    description: "Déterminez vos chiffres avant d'entrer en négociation.",
    details: [
      "Minimum acceptable : en dessous de ce chiffre, vous refusez",
      "Cible réaliste : ce que vous visez raisonnablement",
      "Aspiration haute : votre meilleur scénario, ambitieux mais justifiable",
      "Toujours demander 10-20% au-dessus de votre cible réaliste",
    ],
    tip: "Votre première demande ancre la négociation. Visez haut mais justifiable.",
  },
  {
    step: 3,
    title: "Construire votre Argumentaire",
    description: "Préparez des arguments factuels et quantifiables.",
    details: [
      "Listez vos réalisations avec des métriques (revenus générés, performance améliorée)",
      "Démontrez votre impact unique : projets menés, équipes guidées",
      "Présentez vos compétences rares ou en forte demande",
      "Référencez les données de marché que vous avez collectées",
    ],
    tip: "Utilisez le format : 'J\'ai [action] qui a résulté en [métrique quantifiable].'",
  },
  {
    step: 4,
    title: "La Négociation",
    description: "Le moment de la discussion. Restez professionnel et factuel.",
    details: [
      "Laissez l'employeur faire la première offre si possible",
      "Silence après l'offre — ne réagissez pas immédiatement",
      "Demandez du temps pour réfléchir (24-48h minimum)",
      "Négociez le package complet, pas seulement le salaire de base",
    ],
    tip: "La phrase magique : 'Je suis très enthousiaste pour ce poste. Basé sur mes recherches et mon expérience, je visais plutôt [X]. Est-ce quelque chose que nous pouvons explorer ?'",
  },
  {
    step: 5,
    title: "Contre-offre & Clôture",
    description: "Gérez les contre-offres et finalisez l'accord.",
    details: [
      "Si l'offre est inférieure : négociez les autres composantes (bonus, equity, remote, formation)",
      "Si vous avez plusieurs offres : mentionnez-le professionnellement",
      "Obtenez tout par écrit avant d'accepter",
      "Ne brûlez jamais les ponts — le monde tech est petit",
    ],
    tip: "Même si vous n'obtenez pas le salaire cible, négociez une revue salariale à 6 mois avec des objectifs clairs.",
  },
];

export function NegotiationGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Framework de Négociation en 5 Étapes</h2>

      {/* Step indicators */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(i)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeStep === i
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              activeStep === i ? "bg-white/20" : "bg-muted"
            )}>
              {s.step}
            </span>
            {s.title}
          </button>
        ))}
      </div>

      <Card className="p-8 space-y-6 border-border/40">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-500 mb-2">
            Étape {step.step}
          </Badge>
          <h3 className="text-2xl font-bold">{step.title}</h3>
          <p className="text-muted-foreground mt-1">{step.description}</p>
        </div>

        <ul className="space-y-3">
          {step.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{detail}</span>
            </li>
          ))}
        </ul>

        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Conseil Pro</p>
              <p className="text-sm text-muted-foreground mt-1">{step.tip}</p>
            </div>
          </div>
        </Card>
      </Card>
    </section>
  );
}
