"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const timelines = [
  {
    id: "1month",
    label: "1 Mois",
    weeks: [
      {
        week: "Semaine 1",
        focus: "Fondamentaux",
        tasks: [
          "Réviser les structures de données (arrays, linked lists, trees, hash maps)",
          "Pratiquer 2-3 problèmes Easy par jour sur LeetCode",
          "Lire les chapitres 1-5 de Cracking the Coding Interview",
          "Configurer votre environnement de pratique",
        ],
      },
      {
        week: "Semaine 2",
        focus: "Algorithmes",
        tasks: [
          "Tri, recherche, BFS/DFS, programmation dynamique",
          "Pratiquer 2 Medium par jour",
          "Commencer System Design : lire le chapitre 1 d'Alex Xu",
          "Préparer 3 projets STAR pour le behavioral",
        ],
      },
      {
        week: "Semaine 3",
        focus: "System Design & Behavioral",
        tasks: [
          "1 System Design par jour (URL shortener, chat, parking lot)",
          "1 Medium/Hard algorithme par jour",
          "Pratiquer les questions behavioral avec un ami",
          "Rechercher les entreprises cibles",
        ],
      },
      {
        week: "Semaine 4",
        focus: "Polish & Mock",
        tasks: [
          "2-3 mock interviews complètes",
          "Révisez vos points faibles",
          "Préparer les questions à poser aux intervieweurs",
          "Préparer la logistique (connexion, caméra, environnement calme)",
        ],
      },
    ],
  },
  {
    id: "3months",
    label: "3 Mois",
    weeks: [
      {
        week: "Mois 1",
        focus: "Fondations solides",
        tasks: [
          "2 problèmes Easy + 1 Medium par jour",
          "Maîtriser toutes les structures de données",
          "Lire CTCI en entier + System Design Interview vol.1",
          "Commencer un projet portfolio impressionnant",
        ],
      },
      {
        week: "Mois 2",
        focus: "Niveau intermédiaire",
        tasks: [
          "2 Medium + 1 Hard par semaine",
          "1 System Design complet par semaine",
          "Pratiquer behavioral avec enregistrement vidéo",
          "Contribuer à un projet open source",
        ],
      },
      {
        week: "Mois 3",
        focus: "Polish & Interviews",
        tasks: [
          "Focus sur les patterns récurrents (sliding window, two pointers, etc.)",
          "Mock interviews hebdomadaires (plateforme de pair-à-pair comme Pramp, ou un ami)",
          "Affiner CV et profil LinkedIn",
          "Commencer les candidatures et les entretiens",
        ],
      },
    ],
  },
];

export function PreparationTimeline() {
  const [activeTimeline, setActiveTimeline] = useState("1month");
  const timeline = timelines.find((t) => t.id === activeTimeline) || timelines[0];

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-center">Planning de Préparation</h2>
      <div className="flex justify-center gap-2">
        {timelines.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTimeline(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTimeline === t.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {timeline.weeks.map((w, i) => (
          <Card key={w.week} className="p-6 border-border/40">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{w.week}</h3>
                <Badge variant="outline" className="text-xs">{w.focus}</Badge>
              </div>
            </div>
            <ul className="space-y-1.5 ml-11">
              {w.tasks.map((task) => (
                <li key={task} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">○</span>{task}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
