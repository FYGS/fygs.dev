"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sections = [
  {
    id: "star",
    title: "Méthode STAR",
    content: [
      {
        label: "S — Situation",
        desc: "Décrivez le contexte et les circonstances. Soyez précis mais concis.",
        example:
          "Dans mon rôle de tech lead chez X, nous avions un système monolithique servant 10M d'utilisateurs avec des temps de réponse dégradés.",
      },
      {
        label: "T — Task",
        desc: "Expliquez votre responsabilité spécifique dans cette situation.",
        example:
          "J'étais responsable de concevoir et mener la migration vers une architecture microservices.",
      },
      {
        label: "A — Action",
        desc: "Détaillez les actions concrètes que VOUS avez prises (pas l'équipe).",
        example:
          "J'ai défini l'architecture cible, identifié les bounded contexts, mis en place le strangler fig pattern et formé l'équipe de 8 développeurs.",
      },
      {
        label: "R — Result",
        desc: "Quantifiez les résultats obtenus. Utilisez des métriques.",
        example:
          "Résultat : temps de réponse réduit de 70%, disponibilité passée de 99.5% à 99.99%, et déploiements de 1/mois à 10/jour.",
      },
    ],
  },
  {
    id: "technical",
    title: "Présentation Technique",
    content: [
      {
        label: "Structure en 5 min",
        desc: "Contexte (30s) → Problème (30s) → Solution (2min) → Résultats (1min) → Apprentissages (1min)",
        example: "",
      },
      {
        label: "Montrez votre raisonnement",
        desc: "Les intervieweurs veulent voir COMMENT vous pensez, pas juste le résultat final.",
        example:
          "Expliquez les alternatives considérées et pourquoi vous avez choisi cette approche.",
      },
      {
        label: "Anticipez les questions",
        desc: "Préparez des réponses pour : 'Que feriez-vous différemment ?' et 'Comment ça scale ?'",
        example: "",
      },
      {
        label: "Diagrammes",
        desc: "Dessinez des schémas d'architecture. Un bon diagramme vaut mille mots.",
        example:
          "Préparez 2-3 diagrammes de vos projets les plus significatifs.",
      },
    ],
  },
  {
    id: "checklist",
    title: "Checklist Pré-Entretien",
    content: [
      {
        label: "Recherche entreprise",
        desc: "Produit, tech stack, culture, actualités récentes, concurrents.",
        example: "",
      },
      {
        label: "Préparez 5 projets STAR",
        desc: "Leadership, conflit, échec, innovation, collaboration.",
        example: "",
      },
      {
        label: "Questions à poser",
        desc: "Préparez 3-5 questions pertinentes sur l'équipe, la stack et la culture.",
        example:
          "Ex: 'Comment gérez-vous la dette technique ?' ou 'À quoi ressemble une journée type ?'",
      },
      {
        label: "Logistique",
        desc: "Testez votre connexion, caméra, micro. Préparez un environnement calme.",
        example: "",
      },
      {
        label: "Mindset",
        desc: "C'est une conversation, pas un interrogatoire. Vous évaluez aussi l'entreprise.",
        example: "",
      },
    ],
  },
];

export function InterviewGuide() {
  const [activeSection, setActiveSection] = useState("star");
  const section = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <section className="space-y-8">
      <div className="flex gap-2 flex-wrap">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSection === s.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted",
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {section.content.map((item) => (
          <Card key={item.label} className="p-6 space-y-3 border-border/40">
            <h3 className="text-lg font-semibold">{item.label}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
            {item.example && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm italic text-muted-foreground">
                  {item.example}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
