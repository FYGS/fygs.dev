"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface OptimizationStep {
  title: string;
  description: string;
  code: string;
  explanation: string;
  complexity: string;
  pros?: string[];
  cons?: string[];
}

interface OptimizationExample {
  title: string;
  description: string;
  problem: string;
  steps: OptimizationStep[];
}

const examples: OptimizationExample[] = [
  {
    title: "Recherche de Doublons",
    description:
      "Optimisation progressive d'un algorithme de recherche de doublons dans un tableau",
    problem:
      "Étant donné un tableau d'entiers, déterminez s'il contient des éléments en double.",
    steps: [
      {
        title: "Solution Naïve",
        description:
          "Utilisation de deux boucles imbriquées pour comparer chaque paire d'éléments",
        code: `function containsDuplicate(nums) {
  const n = nums.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nums[i] === nums[j]) {
        return true;
      }
    }
  }

  return false;
}`,
        explanation:
          "Cette solution compare chaque élément avec tous les autres éléments du tableau. Pour chaque élément à l'indice i, nous vérifions s'il est égal à un élément à l'indice j (où j > i).",
        complexity: "O(n²) en temps, O(1) en espace",
        pros: [
          "Simple à comprendre et à implémenter",
          "N'utilise pas de mémoire supplémentaire",
        ],
        cons: [
          "Très inefficace pour les grands tableaux",
          "Effectue beaucoup de comparaisons redondantes",
        ],
      },
      {
        title: "Optimisation avec Tri",
        description:
          "Trier le tableau d'abord, puis rechercher des éléments adjacents identiques",
        code: `function containsDuplicate(nums) {
  // Trier le tableau
  nums.sort((a, b) => a - b);

  // Vérifier les éléments adjacents
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) {
      return true;
    }
  }

  return false;
}`,
        explanation:
          "Cette solution trie d'abord le tableau, ce qui place les éléments identiques côte à côte. Ensuite, nous parcourons le tableau une seule fois pour vérifier si des éléments adjacents sont identiques.",
        complexity: "O(n log n) en temps, O(1) en espace*",
        pros: [
          "Plus efficace que la solution naïve pour les grands tableaux",
          "Parcourt le tableau une seule fois après le tri",
        ],
        cons: [
          "Dépend de l'efficacité de l'algorithme de tri",
          "Modifie le tableau d'origine",
          "*Certains algorithmes de tri peuvent utiliser O(n) d'espace supplémentaire",
        ],
      },
      {
        title: "Optimisation avec HashSet",
        description: "Utiliser un ensemble pour suivre les éléments déjà vus",
        code: `function containsDuplicate(nums) {
  const seen = new Set();

  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }

  return false;
}`,
        explanation:
          "Cette solution utilise un ensemble (Set) pour garder une trace des éléments déjà vus. Pour chaque élément, nous vérifions s'il est déjà dans l'ensemble. Si oui, nous avons trouvé un doublon. Sinon, nous l'ajoutons à l'ensemble.",
        complexity: "O(n) en temps (en moyenne), O(n) en espace",
        pros: [
          "Optimal en termes de complexité temporelle",
          "Ne modifie pas le tableau d'origine",
          "S'arrête dès qu'un doublon est trouvé",
        ],
        cons: [
          "Utilise de la mémoire supplémentaire proportionnelle à la taille du tableau",
        ],
      },
    ],
  },
  {
    title: "Calcul de Fibonacci",
    description:
      "Optimisation progressive d'un algorithme de calcul du n-ième nombre de Fibonacci",
    problem:
      "Calculez le n-ième nombre de la suite de Fibonacci, où F(0) = 0, F(1) = 1, et F(n) = F(n-1) + F(n-2) pour n > 1.",
    steps: [
      {
        title: "Solution Récursive Naïve",
        description: "Implémentation directe de la définition récursive",
        code: `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        explanation:
          "Cette solution implémente directement la définition récursive de la suite de Fibonacci. Pour chaque n > 1, elle calcule F(n-1) et F(n-2) récursivement, puis les additionne.",
        complexity: "O(2ⁿ) en temps, O(n) en espace",
        pros: [
          "Simple et intuitive",
          "Suit directement la définition mathématique",
        ],
        cons: [
          "Extrêmement inefficace pour les grandes valeurs de n",
          "Recalcule les mêmes valeurs de nombreuses fois",
        ],
      },
      {
        title: "Optimisation avec Mémoïsation",
        description:
          "Utiliser un cache pour stocker les résultats déjà calculés",
        code: `function fibonacci(n, memo = {}) {
  if (n <= 1) {
    return n;
  }

  if (memo[n] !== undefined) {
    return memo[n];
  }

  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}`,
        explanation:
          "Cette solution utilise la mémoïsation pour éviter de recalculer les mêmes valeurs. Nous stockons chaque résultat calculé dans un objet memo, et nous vérifions d'abord si un résultat est déjà dans le cache avant de le calculer.",
        complexity: "O(n) en temps, O(n) en espace",
        pros: [
          "Beaucoup plus efficace que la solution naïve",
          "Conserve l'approche récursive",
          "Évite les calculs redondants",
        ],
        cons: [
          "Utilise de la mémoire supplémentaire",
          "Peut encore causer un dépassement de pile pour les très grandes valeurs de n",
        ],
      },
      {
        title: "Optimisation Itérative",
        description: "Utiliser une approche ascendante avec une boucle",
        code: `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }

  let a = 0;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }

  return b;
}`,
        explanation:
          "Cette solution utilise une approche itérative (bottom-up) pour calculer les nombres de Fibonacci. Nous commençons par les cas de base (F(0) = 0, F(1) = 1) et nous construisons progressivement les valeurs suivantes en utilisant seulement deux variables pour stocker les deux derniers nombres calculés.",
        complexity: "O(n) en temps, O(1) en espace",
        pros: [
          "Optimal en termes de complexité temporelle et spatiale",
          "Évite les problèmes de dépassement de pile",
          "Simple à comprendre",
        ],
        cons: [
          "Doit calculer tous les nombres jusqu'à n (ne peut pas calculer directement F(n))",
        ],
      },
    ],
  },
  {
    title: "Somme de Sous-tableau Maximum",
    description:
      "Optimisation progressive d'un algorithme pour trouver la somme maximale d'un sous-tableau contigu",
    problem:
      "Étant donné un tableau d'entiers, trouvez la somme maximale d'un sous-tableau contigu (contenant au moins un élément).",
    steps: [
      {
        title: "Solution par Force Brute",
        description: "Calculer la somme de tous les sous-tableaux possibles",
        code: `function maxSubArray(nums) {
  const n = nums.length;
  let maxSum = nums[0];

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let k = i; k <= j; k++) {
        sum += nums[k];
      }
      maxSum = Math.max(maxSum, sum);
    }
  }

  return maxSum;
}`,
        explanation:
          "Cette solution calcule la somme de tous les sous-tableaux possibles en utilisant trois boucles imbriquées. Pour chaque paire d'indices (i, j), nous calculons la somme des éléments de i à j, puis nous mettons à jour la somme maximale si nécessaire.",
        complexity: "O(n³) en temps, O(1) en espace",
        pros: [
          "Simple à comprendre",
          "Garantit de trouver la solution optimale",
        ],
        cons: [
          "Extrêmement inefficace pour les grands tableaux",
          "Effectue beaucoup de calculs redondants",
        ],
      },
      {
        title: "Optimisation des Sommes Cumulées",
        description: "Éliminer une boucle en cumulant la somme au fil de l'itération",
        code: `function maxSubArray(nums) {
  const n = nums.length;
  let maxSum = nums[0];

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = i; j < n; j++) {
      sum += nums[j];
      maxSum = Math.max(maxSum, sum);
    }
  }

  return maxSum;
}`,
        explanation:
          "Cette solution élimine une boucle en calculant la somme de manière incrémentale. Pour chaque indice de début i, nous calculons la somme des sous-tableaux se terminant à chaque indice j ≥ i en ajoutant simplement l'élément à l'indice j à la somme précédente.",
        complexity: "O(n²) en temps, O(1) en espace",
        pros: [
          "Plus efficace que la solution par force brute",
          "Évite les calculs redondants de sommes",
        ],
        cons: ["Toujours inefficace pour les très grands tableaux"],
      },
      {
        title: "Algorithme de Kadane",
        description:
          "Utiliser une approche de programmation dynamique à espace constant",
        code: `function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];

  for (let i = 1; i < nums.length; i++) {
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }

  return maxSoFar;
}`,
        explanation:
          "Cette solution utilise l'algorithme de Kadane, une approche de programmation dynamique. Pour chaque position, nous calculons la somme maximale d'un sous-tableau se terminant à cette position (maxEndingHere). Cette somme est soit l'élément actuel seul, soit l'élément actuel plus la somme maximale se terminant à la position précédente.",
        complexity: "O(n) en temps, O(1) en espace",
        pros: [
          "Optimal en termes de complexité temporelle et spatiale",
          "Parcourt le tableau une seule fois",
          "Très efficace même pour les grands tableaux",
        ],
        cons: ["Peut être moins intuitif à comprendre au premier abord"],
      },
    ],
  },
];

export function ProgressiveOptimization() {
  const [activeTab, setActiveTab] = useState("duplicates");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Obtenir l'exemple actif
  const getActiveExample = () => {
    switch (activeTab) {
      case "duplicates":
        return examples[0];
      case "fibonacci":
        return examples[1];
      case "max-subarray":
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
        <CardTitle>Optimisation Progressive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="duplicates">Recherche de Doublons</TabsTrigger>
            <TabsTrigger value="fibonacci">Fibonacci</TabsTrigger>
            <TabsTrigger value="max-subarray">
              Somme Max de Sous-tableau
            </TabsTrigger>
          </TabsList>

          <TabsContent value="duplicates" className="space-y-6 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Problème:</h3>
              <p className="text-muted-foreground">{examples[0].problem}</p>
            </div>
          </TabsContent>

          <TabsContent value="fibonacci" className="space-y-6 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Problème:</h3>
              <p className="text-muted-foreground">{examples[1].problem}</p>
            </div>
          </TabsContent>

          <TabsContent value="max-subarray" className="space-y-6 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Problème:</h3>
              <p className="text-muted-foreground">{examples[2].problem}</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Optimisation {currentStepIndex + 1}: {currentStep.title}
            </h3>
            <Badge variant="outline" className="font-mono">
              {currentStep.complexity}
            </Badge>
          </div>

          <p className="text-muted-foreground">{currentStep.description}</p>

          <ScrollArea className="h-[200px] bg-muted rounded-lg">
            <pre className="p-4 text-sm">
              <code>{currentStep.code}</code>
            </pre>
          </ScrollArea>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Explication:</h4>
            <p className="text-sm">{currentStep.explanation}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600">Avantages:</h4>
              <ul className="space-y-1">
                {currentStep.pros?.map((pro, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-green-500">✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">
                Inconvénients:
              </h4>
              <ul className="space-y-1">
                {currentStep.cons?.map((con, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-red-500">✗</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              Solution précédente
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={isLastStep}
              className={isLastStep ? "opacity-0" : ""}
            >
              Solution suivante
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mt-6">
          <h3 className="text-sm font-medium mb-2">
            Principes d&apos;Optimisation
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Commencez par une solution qui fonctionne, même si elle
              n&apos;est pas optimale.
            </li>
            <li>
              • Identifiez les goulots d&apos;étranglement et les calculs
              redondants.
            </li>
            <li>
              • Utilisez des structures de données appropriées pour améliorer
              l&apos;efficacité.
            </li>
            <li>• Considérez les compromis entre temps et espace.</li>
            <li>
              • Testez et mesurez les performances pour valider les
              optimisations.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
