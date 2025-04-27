"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

import { DPComparison } from "./dp-comparison";
import { DPPractice } from "./dp-practice";
import { DPRealWorld } from "./dp-real-world";
import { FibonacciVisualization } from "./visualizations/fibonacci-visualization";
import { KnapsackVisualization } from "./visualizations/knapsack-visualization";
import { LCSVisualization } from "./visualizations/lcs-visualization";

const dpProblems = [
  {
    name: "Fibonacci",
    difficulty: "Facile",
    description:
      "Calculer le n-ième nombre de Fibonacci en utilisant la programmation dynamique.",
    approach: [
      "Mémoïsation des résultats déjà calculés",
      "Évite les calculs redondants",
      "Réduit la complexité de O(2ⁿ) à O(n)",
    ],
    code: `function fibonacci(n: number, memo: Record<number, number> = {}): number {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];

  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}`,
    spaceComplexity: "O(n)",
    timeComplexity: "O(n)",
  },
  {
    name: "Sac à Dos (Knapsack)",
    difficulty: "Intermédiaire",
    description:
      "Maximiser la valeur des objets dans un sac avec une capacité limitée.",
    approach: [
      "Table 2D pour stocker les sous-problèmes",
      "Considère chaque objet avec sa valeur et son poids",
      "Construit la solution optimale de manière ascendante",
    ],
    code: `function knapsack(values: number[], weights: number[], capacity: number): number {
  const n = values.length;
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][capacity];
}`,
    spaceComplexity: "O(n×W)",
    timeComplexity: "O(n×W)",
  },
  {
    name: "Plus Longue Sous-séquence Commune",
    difficulty: "Intermédiaire",
    description:
      "Trouver la plus longue sous-séquence commune entre deux chaînes.",
    approach: [
      "Table 2D pour mémoriser les longueurs",
      "Compare les caractères un à un",
      "Utilise les résultats précédents pour construire la solution",
    ],
    code: `function lcs(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}`,
    spaceComplexity: "O(m×n)",
    timeComplexity: "O(m×n)",
  },
  {
    name: "Chemins dans une Grille",
    difficulty: "Intermédiaire",
    description:
      "Calculer le nombre de chemins possibles du coin supérieur gauche au coin inférieur droit.",
    approach: [
      "Table 2D pour mémoriser les chemins",
      "Chaque cellule somme les chemins venant du haut et de la gauche",
      "Gestion des obstacles si présents",
    ],
    code: `function gridPaths(grid: number[][]): number {
  const m = grid.length;
  const n = grid[0].length;
  const dp: number[][] = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0));

  // Initialisation première ligne et colonne
  dp[0][0] = grid[0][0] === 0 ? 1 : 0;
  for (let i = 1; i < m; i++) {
    dp[i][0] = grid[i][0] === 0 ? dp[i - 1][0] : 0;
  }
  for (let j = 1; j < n; j++) {
    dp[0][j] = grid[0][j] === 0 ? dp[0][j - 1] : 0;
  }

  // Remplir la table
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (grid[i][j] === 0) {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      }
    }
  }

  return dp[m - 1][n - 1];
}`,
    spaceComplexity: "O(m×n)",
    timeComplexity: "O(m×n)",
  },
];

const concepts = [
  {
    name: "Mémoïsation",
    description:
      "Stockage des résultats des sous-problèmes pour éviter les calculs redondants",
    examples: ["Fibonacci", "Coefficients binomiaux"],
    advantages: [
      "Évite les calculs répétés",
      "Approche descendante (top-down)",
      "Calcule uniquement les sous-problèmes nécessaires",
    ],
  },
  {
    name: "Tabulation",
    description:
      "Construction de la solution de manière ascendante en remplissant un tableau",
    examples: ["Sac à dos", "Plus court chemin"],
    advantages: [
      "Approche ascendante (bottom-up)",
      "Pas de récursion",
      "Meilleure utilisation du cache",
    ],
  },
];

export function DynamicProgrammingGuide() {
  const [activeTab, setActiveTab] = useState("introduction");

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Programmation Dynamique</h1>
        <p className="text-xl text-muted-foreground">
          Une technique puissante pour résoudre des problèmes complexes en les
          décomposant en sous-problèmes plus simples.
        </p>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="visualizations">Visualisations</TabsTrigger>
          <TabsTrigger value="comparison">
            Mémoïsation vs Tabulation
          </TabsTrigger>
          <TabsTrigger value="problems">Problèmes Classiques</TabsTrigger>
          <TabsTrigger value="real-world">Applications Réelles</TabsTrigger>
          <TabsTrigger value="practice">Exercices Pratiques</TabsTrigger>
        </TabsList>

        <TabsContent value="introduction" className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">
              Qu&apos;est-ce que la Programmation Dynamique ?
            </h2>
            <p className="text-muted-foreground">
              La programmation dynamique est une technique d&apos;optimisation
              qui résout des problèmes complexes en les décomposant en
              sous-problèmes plus simples. Elle est particulièrement utile
              lorsque les sous-problèmes se chevauchent, c&apos;est-à-dire
              lorsque la solution d&apos;un sous-problème est utilisée plusieurs
              fois dans la résolution du problème global.
            </p>

            <div className="grid gap-6">
              <Card className="p-6 border-primary/20">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Caractéristiques principales
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Sous-problèmes qui se chevauchent
                        </span>{" "}
                        : Les mêmes sous-problèmes sont résolus plusieurs fois.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Sous-structure optimale
                        </span>{" "}
                        : La solution optimale du problème contient les
                        solutions optimales des sous-problèmes.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Mémorisation des résultats
                        </span>{" "}
                        : Les résultats des sous-problèmes sont stockés pour
                        éviter les recalculs.
                      </span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">
              Approches de la Programmation Dynamique
            </h2>
            <div className="grid gap-6">
              {concepts.map((concept) => (
                <Card key={concept.name} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{concept.name}</h3>
                      <Badge variant="secondary">Concept</Badge>
                    </div>

                    <p className="text-muted-foreground">
                      {concept.description}
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-medium">Exemples courants :</h4>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {concept.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Avantages :</h4>
                      <ul className="space-y-1">
                        {concept.advantages.map((advantage, index) => (
                          <li key={index} className="text-muted-foreground">
                            • {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Conseils d&apos;Optimisation</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  • Identifiez les sous-problèmes qui se chevauchent
                </p>
                <p className="text-muted-foreground">
                  • Choisissez entre mémoïsation et tabulation selon le contexte
                </p>
                <p className="text-muted-foreground">
                  • Optimisez l&apos;espace en réutilisant la mémoire quand
                  possible
                </p>
                <p className="text-muted-foreground">
                  • Commencez par écrire la solution récursive avant
                  d&apos;optimiser
                </p>
              </div>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Visualisations Interactives</h2>
            <p className="text-muted-foreground">
              Explorez ces visualisations interactives pour mieux comprendre
              comment fonctionnent les algorithmes de programmation dynamique.
              Vous pouvez contrôler l&apos;exécution pas à pas et observer
              comment les sous-problèmes sont résolus.
            </p>

            <div className="space-y-8">
              <FibonacciVisualization />
              <KnapsackVisualization />
              <LCSVisualization />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Comparaison des Approches</h2>
            <p className="text-muted-foreground">
              La programmation dynamique peut être implémentée de deux façons
              principales : la mémoïsation (top-down) et la tabulation
              (bottom-up). Chaque approche a ses avantages et ses inconvénients.
            </p>

            <DPComparison />
          </section>
        </TabsContent>

        <TabsContent value="problems" className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Problèmes Classiques</h2>
            <p className="text-muted-foreground">
              Voici quelques problèmes classiques qui sont souvent résolus à
              l&apos;aide de la programmation dynamique. Ces problèmes
              illustrent les principes fondamentaux et les techniques de cette
              approche.
            </p>

            <div className="grid gap-8">
              {dpProblems.map((problem) => (
                <Card key={problem.name} className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{problem.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          problem.difficulty === "Facile"
                            ? "bg-green-500/10 text-green-500"
                            : problem.difficulty === "Intermédiaire"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      >
                        {problem.difficulty}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground">
                      {problem.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="font-medium">Approche :</h4>
                      <ul className="space-y-1">
                        {problem.approach.map((step, index) => (
                          <li key={index} className="text-muted-foreground">
                            • {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Complexités :</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Complexité</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Temps</TableCell>
                            <TableCell>{problem.timeComplexity}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Espace</TableCell>
                            <TableCell>{problem.spaceComplexity}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Implémentation :</h4>
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                        <code className="text-sm">{problem.code}</code>
                      </pre>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="real-world" className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Applications Réelles</h2>
            <p className="text-muted-foreground">
              La programmation dynamique n&apos;est pas seulement un concept
              théorique, elle est largement utilisée dans de nombreux domaines
              pour résoudre des problèmes réels. Découvrez comment cette
              technique est appliquée dans l&apos;industrie.
            </p>

            <DPRealWorld />
          </section>
        </TabsContent>

        <TabsContent value="practice" className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Exercices Pratiques</h2>
            <p className="text-muted-foreground">
              Mettez en pratique vos connaissances en programmation dynamique
              avec ces exercices. Ils sont classés par niveau de difficulté pour
              vous permettre de progresser à votre rythme.
            </p>

            <DPPractice />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
