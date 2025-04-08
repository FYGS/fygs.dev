import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, BookOpen, Brain, Clock, Code2, Laptop2, MessageSquare, Target } from "lucide-react";

const preparationSteps = [
  {
    title: "Fondamentaux Techniques",
    icon: Code2,
    items: [
      "Maîtrisez les structures de données fondamentales",
      "Comprenez la complexité algorithmique",
      "Pratiquez la résolution de problèmes",
      "Révisez les concepts de programmation orientée objet",
    ],
  },
  {
    title: "Préparation Pratique",
    icon: Laptop2,
    items: [
      "Codez régulièrement sur des plateformes comme LeetCode",
      "Participez à des mock interviews",
      "Chronométrez vos sessions de résolution de problèmes",
      "Écrivez du code propre et maintenable",
    ],
  },
  {
    title: "Communication",
    icon: MessageSquare,
    items: [
      "Expliquez clairement votre raisonnement",
      "Posez des questions pertinentes",
      "Verbalisez votre approche de résolution",
      "Soyez à l'écoute des retours",
    ],
  },
];

const timelineItems = [
  {
    title: "3-4 mois avant",
    tasks: [
      "Commencez à réviser les fondamentaux",
      "Établissez un planning d'étude",
      "Identifiez vos points faibles",
    ],
  },
  {
    title: "2-3 mois avant",
    tasks: [
      "Pratiquez intensivement les algorithmes",
      "Commencez les mock interviews",
      "Approfondissez les concepts système",
    ],
  },
  {
    title: "1 mois avant",
    tasks: [
      "Concentrez-vous sur vos points faibles",
      "Augmentez la fréquence des mock interviews",
      "Révisez les questions courantes",
    ],
  },
  {
    title: "1 semaine avant",
    tasks: [
      "Révision légère des concepts clés",
      "Repos mental adéquat",
      "Préparation logistique",
    ],
  },
];

const commonMistakes = [
  {
    mistake: "Ne pas penser à voix haute",
    solution:
      "Expliquez votre raisonnement tout au long du processus de résolution",
  },
  {
    mistake: "Se précipiter sur le code",
    solution:
      "Prenez le temps de comprendre le problème et de planifier votre approche",
  },
  {
    mistake: "Ignorer les cas limites",
    solution:
      "Identifiez et gérez systématiquement les cas particuliers et les erreurs",
  },
  {
    mistake: "Code non optimisé",
    solution:
      "Réfléchissez à la complexité et proposez des optimisations possibles",
  },
];

export function PreparationGuide() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Guide de Préparation</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {preparationSteps.map((step) => (
            <Card key={step.title} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <step.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <ul className="space-y-2">
                  {step.items.map((item, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Timeline de Préparation</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {timelineItems.map((item, index) => (
            <Card key={item.title} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{item.title}</h3>
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <ul className="space-y-2">
                  {item.tasks.map((task, taskIndex) => (
                    <li
                      key={taskIndex}
                      className="text-muted-foreground text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Erreurs Courantes à Éviter</h2>
        <div className="grid gap-6">
          {commonMistakes.map((item) => (
            <Card key={item.mistake} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-500">{item.mistake}</h3>
                    <p className="text-muted-foreground mt-2">{item.solution}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Conseils de Dernière Minute</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">État d&apos;Esprit</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Restez calme et concentré
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Considérez chaque erreur comme une opportunité d&apos;apprentissage
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Gardez une attitude positive
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Objectifs</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Montrer votre processus de réflexion
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Démontrer vos compétences techniques
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Communiquer efficacement
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <Card className="p-6 bg-muted">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">Ressources Recommandées</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground">
                  • LeetCode - Pour la pratique des algorithmes
                </li>
                <li className="text-muted-foreground">
                  • System Design Primer - Pour la conception système
                </li>
                <li className="text-muted-foreground">
                  • Cracking the Coding Interview - Pour la méthodologie
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
