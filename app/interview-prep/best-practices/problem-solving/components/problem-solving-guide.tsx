import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "1. Comprendre le Problème",
    description: "Première étape cruciale pour une résolution efficace.",
    actions: [
      {
        type: "do",
        text: "Reformulez le problème avec vos propres mots",
      },
      {
        type: "do",
        text: "Identifiez les entrées et sorties attendues",
      },
      {
        type: "do",
        text: "Demandez des clarifications sur les contraintes",
      },
      {
        type: "dont",
        text: "Ne commencez pas à coder immédiatement",
      },
    ],
    example: {
      problem: "Implémentez une fonction de recherche",
      good: "Pouvez-vous préciser le type de données à rechercher et la taille maximale ?",
      bad: "Commencer directement à implémenter une recherche binaire",
    },
  },
  {
    title: "2. Planifier l'Approche",
    description: "Élaborez une stratégie avant de commencer à coder.",
    actions: [
      {
        type: "do",
        text: "Dessinez des diagrammes ou écrivez des pseudo-codes",
      },
      {
        type: "do",
        text: "Considérez plusieurs approches possibles",
      },
      {
        type: "do",
        text: "Discutez des compromis de chaque solution",
      },
      {
        type: "dont",
        text: "Ne vous précipitez pas sur la première solution",
      },
    ],
    example: {
      problem: "Trouver des doublons dans un tableau",
      good: "Comparons l'approche avec Set vs Tri vs Comptage",
      bad: "Implémenter directement une solution O(n²)",
    },
  },
  {
    title: "3. Gérer les Edge Cases",
    description: "Anticipez et gérez les cas particuliers.",
    actions: [
      {
        type: "do",
        text: "Identifiez les cas limites possibles",
      },
      {
        type: "do",
        text: "Testez avec des entrées invalides",
      },
      {
        type: "do",
        text: "Gérez les cas d'erreur gracieusement",
      },
      {
        type: "dont",
        text: "Ne supposez pas des entrées parfaites",
      },
    ],
    example: {
      problem: "Parser une chaîne en nombre",
      good: "Que faire avec null, vide, ou caractères non numériques ?",
      bad: "Supposer que l'entrée sera toujours un nombre valide",
    },
  },
  {
    title: "4. Optimiser la Solution",
    description: "Améliorez la performance et la qualité du code.",
    actions: [
      {
        type: "do",
        text: "Analysez la complexité temps/espace",
      },
      {
        type: "do",
        text: "Identifiez les goulots d'étranglement",
      },
      {
        type: "do",
        text: "Proposez des optimisations réalistes",
      },
      {
        type: "dont",
        text: "Ne sur-optimisez pas prématurément",
      },
    ],
    example: {
      problem: "Optimiser une requête de base de données",
      good: "Analysons si un index peut améliorer la performance",
      bad: "Ajouter des indices sur toutes les colonnes",
    },
  },
];

const methodologies = [
  {
    name: "STAR Method",
    description: "Structurez vos réponses de manière claire et concise.",
    steps: [
      {
        title: "Situation",
        description: "Décrivez le contexte du problème",
      },
      {
        title: "Task",
        description: "Expliquez l'objectif à atteindre",
      },
      {
        title: "Action",
        description: "Détaillez votre approche et vos actions",
      },
      {
        title: "Result",
        description: "Présentez les résultats obtenus",
      },
    ],
  },
  {
    name: "Divide & Conquer",
    description: "Décomposez les problèmes complexes en sous-problèmes gérables.",
    steps: [
      {
        title: "Divide",
        description: "Divisez le problème en parties plus petites",
      },
      {
        title: "Conquer",
        description: "Résolvez chaque sous-problème individuellement",
      },
      {
        title: "Combine",
        description: "Assemblez les solutions en une solution globale",
      },
    ],
  },
];

export function ProblemSolvingGuide() {
  return (
    <div className="space-y-12">
      {/* Steps Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Étapes de Résolution</h2>
        {steps.map((step) => (
          <Card key={step.title} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Actions :</h4>
              <div className="grid gap-3">
                {step.actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {action.type === "do" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <p className="text-muted-foreground">{action.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Exemple :</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Problème</Badge>
                  <p className="text-muted-foreground">{step.example.problem}</p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <Badge className="bg-green-500/10 text-green-500 mb-1">Bon exemple</Badge>
                      <p className="text-muted-foreground">{step.example.good}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <Badge className="bg-red-500/10 text-red-500 mb-1">À éviter</Badge>
                      <p className="text-muted-foreground">{step.example.bad}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Methodologies Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Méthodologies</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {methodologies.map((method) => (
            <Card key={method.name} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {method.name}
                </h3>
                <p className="text-muted-foreground">
                  {method.description}
                </p>
              </div>

              <div className="space-y-4">
                {method.steps.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <Card className="p-6 bg-muted">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Conseils Pro</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>
                • La clé d'une bonne résolution de problème est la communication constante. 
                Expliquez votre pensée à chaque étape.
              </p>
              <p>
                • N'hésitez pas à demander des clarifications. C'est souvent une partie 
                attendue du processus.
              </p>
              <p>
                • Si vous êtes bloqué, revenez aux bases. Parfois, la solution la plus 
                simple est la meilleure.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
