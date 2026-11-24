"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface AnalysisStep {
  title: string;
  description: string;
  code?: string;
  explanation: string;
  complexity?: string;
}

interface AnalysisExample {
  title: string;
  description: string;
  steps: AnalysisStep[];
}

const examples: AnalysisExample[] = [
  {
    title: "Recherche Linéaire",
    description:
      "Analyse de la complexité d'un algorithme de recherche linéaire",
    steps: [
      {
        title: "Identifier la structure de l'algorithme",
        description: "Examinez le code pour comprendre sa structure générale",
        code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
        explanation:
          "Cet algorithme parcourt séquentiellement un tableau pour trouver une valeur cible. Il s'arrête dès qu'il trouve la valeur ou après avoir parcouru tout le tableau.",
      },
      {
        title: "Identifier les opérations principales",
        description: "Déterminez quelles opérations sont les plus coûteuses",
        code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    // Comparaison - opération principale
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
        explanation:
          "L'opération principale est la comparaison entre chaque élément du tableau et la valeur cible. Cette comparaison est effectuée à chaque itération de la boucle.",
      },
      {
        title: "Analyser le nombre d'opérations",
        description:
          "Calculez combien de fois l'opération principale est exécutée",
        explanation:
          "Dans le pire des cas (la valeur n'est pas dans le tableau ou est à la dernière position), l'algorithme effectue n comparaisons, où n est la taille du tableau.",
        complexity: "O(n)",
      },
      {
        title: "Considérer les cas particuliers",
        description: "Analysez les cas meilleur, moyen et pire",
        explanation:
          "Meilleur cas: O(1) - La valeur est à la première position\nCas moyen: O(n/2) ≈ O(n) - La valeur est au milieu ou répartie aléatoirement\nPire cas: O(n) - La valeur est à la dernière position ou absente",
        complexity: "O(n)",
      },
      {
        title: "Analyser la complexité spatiale",
        description: "Évaluez la quantité de mémoire supplémentaire utilisée",
        explanation:
          "L'algorithme n'utilise qu'une quantité constante de mémoire supplémentaire (la variable i et quelques variables temporaires), quelle que soit la taille du tableau.",
        complexity: "O(1) en espace",
      },
    ],
  },
  {
    title: "Tri à Bulles",
    description: "Analyse de la complexité d'un algorithme de tri à bulles",
    steps: [
      {
        title: "Identifier la structure de l'algorithme",
        description: "Examinez le code pour comprendre sa structure générale",
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Échange
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
        explanation:
          "Cet algorithme utilise deux boucles imbriquées pour comparer et échanger des éléments adjacents, faisant ainsi 'remonter' les plus grands éléments vers la fin du tableau.",
      },
      {
        title: "Identifier les opérations principales",
        description: "Déterminez quelles opérations sont les plus coûteuses",
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparaison - opération principale
      if (arr[j] > arr[j + 1]) {
        // Échange - opération principale
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
        explanation:
          "Les opérations principales sont les comparaisons et les échanges. Chaque itération de la boucle interne effectue une comparaison, et potentiellement un échange.",
      },
      {
        title: "Analyser le nombre d'opérations",
        description:
          "Calculez combien de fois les opérations principales sont exécutées",
        explanation:
          "La boucle externe s'exécute n fois. Pour chaque itération i, la boucle interne s'exécute (n-i-1) fois. Cela donne un total de (n-1) + (n-2) + ... + 1 + 0 = n(n-1)/2 ≈ n²/2 comparaisons, soit O(n²).",
        complexity: "O(n²)",
      },
      {
        title: "Considérer les cas particuliers",
        description: "Analysez les cas meilleur, moyen et pire",
        explanation:
          "Meilleur cas: O(n) - Le tableau est déjà trié (avec optimisation)\nCas moyen: O(n²) - Le tableau est partiellement trié ou aléatoire\nPire cas: O(n²) - Le tableau est trié en ordre inverse",
        complexity: "O(n²)",
      },
      {
        title: "Analyser la complexité spatiale",
        description: "Évaluez la quantité de mémoire supplémentaire utilisée",
        explanation:
          "L'algorithme n'utilise qu'une quantité constante de mémoire supplémentaire pour les variables temporaires, quelle que soit la taille du tableau.",
        complexity: "O(1) en espace",
      },
    ],
  },
  {
    title: "Recherche Binaire",
    description:
      "Analyse de la complexité d'un algorithme de recherche binaire",
    steps: [
      {
        title: "Identifier la structure de l'algorithme",
        description: "Examinez le code pour comprendre sa structure générale",
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
        explanation:
          "Cet algorithme recherche une valeur dans un tableau trié en divisant répétitivement l'espace de recherche en deux moitiés.",
      },
      {
        title: "Identifier les opérations principales",
        description: "Déterminez quelles opérations sont les plus coûteuses",
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Comparaison - opération principale
    if (arr[mid] === target) {
      return mid;
    }

    // Comparaison - opération principale
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
        explanation:
          "Les opérations principales sont les comparaisons entre l'élément du milieu et la valeur cible. À chaque itération, l'algorithme effectue une ou deux comparaisons.",
      },
      {
        title: "Analyser le nombre d'opérations",
        description:
          "Calculez combien de fois les opérations principales sont exécutées",
        explanation:
          "À chaque itération, la taille de l'espace de recherche est divisée par 2. Pour un tableau de taille n, le nombre maximal d'itérations est log₂(n). Chaque itération effectue un nombre constant d'opérations.",
        complexity: "O(log n)",
      },
      {
        title: "Considérer les cas particuliers",
        description: "Analysez les cas meilleur, moyen et pire",
        explanation:
          "Meilleur cas: O(1) - La valeur est exactement au milieu du tableau\nCas moyen: O(log n) - La valeur est à une position quelconque\nPire cas: O(log n) - La valeur n'est pas dans le tableau ou est à une position qui maximise le nombre d'itérations",
        complexity: "O(log n)",
      },
      {
        title: "Analyser la complexité spatiale",
        description: "Évaluez la quantité de mémoire supplémentaire utilisée",
        explanation:
          "L'algorithme n'utilise qu'une quantité constante de mémoire supplémentaire pour les variables (left, right, mid), quelle que soit la taille du tableau.",
        complexity: "O(1) en espace",
      },
    ],
  },
];

export function ComplexityAnalysisGuide() {
  const [activeTab, setActiveTab] = useState("linear-search");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Obtenir l'exemple actif
  const getActiveExample = () => {
    switch (activeTab) {
      case "linear-search":
        return examples[0];
      case "bubble-sort":
        return examples[1];
      case "binary-search":
        return examples[2];
      default:
        return examples[0];
    }
  };

  const activeExample = getActiveExample();
  const currentStep = activeExample.steps[currentStepIndex];
  const isLastStep = currentStepIndex === activeExample.steps.length - 1;

  // Passer à l'étape suivante
  const handleNextStep = () => {
    if (currentStepIndex < activeExample.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Revenir à l'étape précédente
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Réinitialiser l'étape lors du changement d'onglet
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentStepIndex(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse de Complexité Guidée</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="linear-search">Recherche Linéaire</TabsTrigger>
            <TabsTrigger value="bubble-sort">Tri à Bulles</TabsTrigger>
            <TabsTrigger value="binary-search">Recherche Binaire</TabsTrigger>
          </TabsList>

          <TabsContent value="linear-search" className="space-y-6 pt-4">
            <p className="text-muted-foreground">
              {examples[0].description}. Suivez les étapes pour comprendre
              comment analyser sa complexité.
            </p>
          </TabsContent>

          <TabsContent value="bubble-sort" className="space-y-6 pt-4">
            <p className="text-muted-foreground">
              {examples[1].description}. Suivez les étapes pour comprendre
              comment analyser sa complexité.
            </p>
          </TabsContent>

          <TabsContent value="binary-search" className="space-y-6 pt-4">
            <p className="text-muted-foreground">
              {examples[2].description}. Suivez les étapes pour comprendre
              comment analyser sa complexité.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Étape {currentStepIndex + 1}: {currentStep.title}
            </h3>
            {currentStep.complexity && (
              <Badge variant="outline" className="font-mono">
                {currentStep.complexity}
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground">{currentStep.description}</p>

          {currentStep.code && (
            <ScrollArea className="h-[200px] bg-muted rounded-lg">
              <pre className="p-4 text-sm">
                <code>{currentStep.code}</code>
              </pre>
            </ScrollArea>
          )}

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Explication:</h4>
            <p className="text-sm whitespace-pre-line">
              {currentStep.explanation}
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              Étape précédente
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={isLastStep}
              className={isLastStep ? "opacity-0" : ""}
            >
              Étape suivante
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mt-6">
          <h3 className="text-sm font-medium mb-2">
            Conseils pour l&apos;analyse de complexité
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Identifiez toujours les opérations dominantes dans
              l&apos;algorithme.
            </li>
            <li>
              • Comptez le nombre de fois que ces opérations sont exécutées en
              fonction de la taille de l&apos;entrée.
            </li>
            <li>
              • Concentrez-vous sur le comportement asymptotique (pour de
              grandes entrées).
            </li>
            <li>
              • N&apos;oubliez pas d&apos;analyser à la fois la complexité
              temporelle et spatiale.
            </li>
            <li>
              • Considérez les cas meilleur, moyen et pire pour une analyse
              complète.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
