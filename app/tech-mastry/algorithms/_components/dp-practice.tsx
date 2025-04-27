"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import { useState } from "react";

interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: "Facile" | "Intermédiaire" | "Difficile";
  description: string;
  hints: string[];
  solution: string;
  testCases: {
    input: string;
    output: string;
  }[];
}

const practiceQuestions: Record<string, PracticeQuestion[]> = {
  basic: [
    {
      id: "fibonacci",
      title: "Nombre de Fibonacci",
      difficulty: "Facile",
      description:
        "Écrivez une fonction qui calcule le n-ième nombre de Fibonacci en utilisant la programmation dynamique. La suite de Fibonacci est définie comme suit : F(0) = 0, F(1) = 1, et F(n) = F(n-1) + F(n-2) pour n > 1.",
      hints: [
        "Pensez à utiliser la mémoïsation pour éviter les calculs redondants.",
        "Vous pouvez également résoudre ce problème de manière itérative en utilisant la tabulation.",
        "Pour optimiser l'espace, vous n'avez besoin que des deux dernières valeurs calculées.",
      ],
      solution: `// Solution avec mémoïsation (top-down)
function fibonacci(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];

  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

// Solution avec tabulation (bottom-up)
function fibonacciDP(n) {
  if (n <= 1) return n;

  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// Solution optimisée en espace
function fibonacciOptimized(n) {
  if (n <= 1) return n;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}`,
      testCases: [
        { input: "5", output: "5" },
        { input: "10", output: "55" },
        { input: "20", output: "6765" },
      ],
    },
    {
      id: "climbing-stairs",
      title: "Escalier à Grimper",
      difficulty: "Facile",
      description:
        "Vous montez un escalier. Il faut n marches pour atteindre le sommet. À chaque fois, vous pouvez monter 1 ou 2 marches. De combien de façons distinctes pouvez-vous atteindre le sommet ?",
      hints: [
        "Pensez à la relation de récurrence entre le nombre de façons d'atteindre la marche n et les marches précédentes.",
        "Pour atteindre la marche n, vous pouvez soit venir de la marche n-1 (en montant 1 marche), soit de la marche n-2 (en montant 2 marches).",
        "Cela ressemble beaucoup à la suite de Fibonacci.",
      ],
      solution: `function climbStairs(n) {
  if (n <= 2) return n;

  // Initialiser un tableau pour stocker le nombre de façons
  // d'atteindre chaque marche
  const dp = new Array(n + 1);
  dp[1] = 1; // 1 façon d'atteindre la marche 1
  dp[2] = 2; // 2 façons d'atteindre la marche 2 (1+1 ou 2)

  // Calculer le nombre de façons pour chaque marche
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// Solution optimisée en espace
function climbStairsOptimized(n) {
  if (n <= 2) return n;

  let prev = 1; // Façons d'atteindre la marche 1
  let curr = 2; // Façons d'atteindre la marche 2

  for (let i = 3; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}`,
      testCases: [
        { input: "2", output: "2" },
        { input: "3", output: "3" },
        { input: "5", output: "8" },
      ],
    },
  ],
  intermediate: [
    {
      id: "coin-change",
      title: "Problème du Rendu de Monnaie",
      difficulty: "Intermédiaire",
      description:
        "Vous disposez de différentes pièces de monnaie et d'un montant total. Écrivez une fonction pour calculer le nombre minimum de pièces dont vous avez besoin pour atteindre ce montant. Si ce n'est pas possible, retournez -1.",
      hints: [
        "Utilisez un tableau dp où dp[i] représente le nombre minimum de pièces nécessaires pour atteindre le montant i.",
        "Initialisez dp[0] = 0 car il faut 0 pièce pour atteindre un montant de 0.",
        "Pour chaque montant i et chaque pièce, mettez à jour dp[i] = min(dp[i], dp[i - valeur_pièce] + 1) si i - valeur_pièce >= 0.",
      ],
      solution: `function coinChange(coins, amount) {
  // Initialiser un tableau dp avec une valeur "infinie"
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 0 pièce pour atteindre un montant de 0

  // Pour chaque montant, essayer toutes les pièces disponibles
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  // Si dp[amount] est toujours Infinity, c'est impossible
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      testCases: [
        { input: "coins = [1, 2, 5], amount = 11", output: "3" },
        { input: "coins = [2], amount = 3", output: "-1" },
        { input: "coins = [1], amount = 0", output: "0" },
      ],
    },
    {
      id: "longest-increasing-subsequence",
      title: "Plus Longue Sous-séquence Croissante",
      difficulty: "Intermédiaire",
      description:
        "Étant donné un tableau d'entiers, trouvez la longueur de la plus longue sous-séquence strictement croissante.",
      hints: [
        "Utilisez un tableau dp où dp[i] représente la longueur de la plus longue sous-séquence croissante se terminant à l'indice i.",
        "Initialisez tous les éléments de dp à 1, car une sous-séquence de longueur 1 est toujours possible.",
        "Pour chaque élément, comparez-le avec tous les éléments précédents et mettez à jour dp[i] si nécessaire.",
      ],
      solution: `function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;

  // dp[i] représente la longueur de la plus longue sous-séquence
  // croissante se terminant à l'indice i
  const dp = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  // Trouver la valeur maximale dans dp
  return Math.max(...dp);
}

// Solution optimisée en O(n log n) utilisant la recherche binaire
function lengthOfLISOptimized(nums) {
  if (nums.length === 0) return 0;

  // tails[i] représente le plus petit élément terminal possible
  // d'une sous-séquence croissante de longueur i+1
  const tails = [];

  for (const num of nums) {
    // Recherche binaire pour trouver la position d'insertion
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // Si nous sommes à la fin, ajouter un nouvel élément
    if (left === tails.length) {
      tails.push(num);
    } else {
      // Sinon, remplacer l'élément à la position trouvée
      tails[left] = num;
    }
  }

  return tails.length;
}`,
      testCases: [
        { input: "[10, 9, 2, 5, 3, 7, 101, 18]", output: "4" },
        { input: "[0, 1, 0, 3, 2, 3]", output: "4" },
        { input: "[7, 7, 7, 7, 7, 7, 7]", output: "1" },
      ],
    },
  ],
  advanced: [
    {
      id: "edit-distance",
      title: "Distance d'Édition",
      difficulty: "Difficile",
      description:
        "Étant donné deux chaînes word1 et word2, retournez le nombre minimum d'opérations requises pour convertir word1 en word2. Vous pouvez effectuer les opérations suivantes : insérer un caractère, supprimer un caractère, remplacer un caractère.",
      hints: [
        "Utilisez une matrice dp où dp[i][j] représente la distance d'édition entre les i premiers caractères de word1 et les j premiers caractères de word2.",
        "Cas de base : dp[i][0] = i (suppression de i caractères) et dp[0][j] = j (insertion de j caractères).",
        "Si word1[i-1] == word2[j-1], alors dp[i][j] = dp[i-1][j-1].",
        "Sinon, dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) (suppression, insertion, remplacement).",
      ],
      solution: `function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;

  // Créer une matrice dp de taille (m+1) x (n+1)
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  // Initialiser les cas de base
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i; // Supprimer i caractères de word1
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j; // Insérer j caractères dans word1
  }

  // Remplir la matrice dp
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        // Les caractères sont identiques, pas d'opération nécessaire
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // Prendre le minimum des trois opérations possibles
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Suppression
          dp[i][j - 1],     // Insertion
          dp[i - 1][j - 1]  // Remplacement
        );
      }
    }
  }

  return dp[m][n];
}`,
      testCases: [
        { input: 'word1 = "horse", word2 = "ros"', output: "3" },
        { input: 'word1 = "intention", word2 = "execution"', output: "5" },
        { input: 'word1 = "sunday", word2 = "saturday"', output: "3" },
      ],
    },
    {
      id: "burst-balloons",
      title: "Éclater des Ballons",
      difficulty: "Difficile",
      description:
        "Vous avez n ballons, indexés de 0 à n-1. Chaque ballon est associé à un nombre nums[i]. Vous êtes invité à éclater tous les ballons. Si vous éclatez le ballon i, vous obtiendrez nums[i-1] * nums[i] * nums[i+1] points. Après l'éclatement, les ballons i-1 et i+1 deviennent adjacents. Trouvez le maximum de points que vous pouvez obtenir en éclatant les ballons intelligemment.",
      hints: [
        "Pensez à ce problème à l'envers : au lieu de décider quel ballon éclater en premier, décidez quel ballon éclater en dernier.",
        "Utilisez une matrice dp où dp[i][j] représente le maximum de points que vous pouvez obtenir en éclatant tous les ballons entre i et j inclus.",
        "Pour chaque intervalle [i, j], essayez tous les ballons k entre i et j comme dernier ballon à éclater, et prenez le maximum.",
      ],
      solution: `function maxCoins(nums) {
  // Ajouter 1 au début et à la fin pour gérer les cas limites
  const n = nums.length;
  const newNums = [1, ...nums, 1];

  // Créer une matrice dp de taille (n+2) x (n+2)
  const dp = Array(n + 2).fill().map(() => Array(n + 2).fill(0));

  // Longueur de l'intervalle
  for (let len = 1; len <= n; len++) {
    // Début de l'intervalle
    for (let i = 1; i <= n - len + 1; i++) {
      // Fin de l'intervalle
      const j = i + len - 1;

      // Essayer tous les ballons k entre i et j comme dernier ballon à éclater
      for (let k = i; k <= j; k++) {
        dp[i][j] = Math.max(
          dp[i][j],
          dp[i][k - 1] + newNums[i - 1] * newNums[k] * newNums[j + 1] + dp[k + 1][j]
        );
      }
    }
  }

  return dp[1][n];
}`,
      testCases: [
        { input: "[3, 1, 5, 8]", output: "167" },
        { input: "[1, 5]", output: "10" },
        { input: "[7]", output: "7" },
      ],
    },
  ],
};

export function DPPractice() {
  const [activeTab, setActiveTab] = useState("basic");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>(
    {}
  );

  const toggleSolution = (questionId: string) => {
    setShowSolutions({
      ...showSolutions,
      [questionId]: !showSolutions[questionId],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercices Pratiques de Programmation Dynamique</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Niveau Débutant</TabsTrigger>
            <TabsTrigger value="intermediate">Niveau Intermédiaire</TabsTrigger>
            <TabsTrigger value="advanced">Niveau Avancé</TabsTrigger>
          </TabsList>

          {Object.entries(practiceQuestions).map(([level, questions]) => (
            <TabsContent key={level} value={level} className="space-y-4 pt-4">
              <div className="space-y-4">
                {questions.map((question) => (
                  <Accordion
                    key={question.id}
                    type="single"
                    collapsible
                    value={
                      expandedQuestion === question.id ? question.id : undefined
                    }
                    onValueChange={(value) => setExpandedQuestion(value)}
                  >
                    <AccordionItem
                      value={question.id}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span>{question.title}</span>
                            <Badge
                              className={
                                question.difficulty === "Facile"
                                  ? "bg-green-500/10 text-green-500"
                                  : question.difficulty === "Intermédiaire"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-red-500/10 text-red-500"
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">
                              Description
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {question.description}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-1">
                              Exemples
                            </h4>
                            <div className="space-y-2">
                              {question.testCases.map((testCase, index) => (
                                <div
                                  key={index}
                                  className="text-sm bg-muted p-2 rounded-md"
                                >
                                  <div>
                                    <span className="font-medium">Entrée:</span>{" "}
                                    {testCase.input}
                                  </div>
                                  <div>
                                    <span className="font-medium">Sortie:</span>{" "}
                                    {testCase.output}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-1">
                              Indices
                            </h4>
                            <div className="space-y-1">
                              {question.hints.map((hint, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{hint}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSolution(question.id)}
                            >
                              {showSolutions[question.id]
                                ? "Masquer la solution"
                                : "Afficher la solution"}
                            </Button>

                            {showSolutions[question.id] && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-1">
                                  Solution
                                </h4>
                                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                                  {question.solution}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">
                  Conseils pour résoudre les problèmes de programmation
                  dynamique
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Identifiez d&apos;abord la structure de sous-problèmes qui
                      se chevauchent.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Définissez clairement l&apos;état et la signification de
                      votre tableau DP.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Établissez la relation de récurrence entre les états.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Identifiez les cas de base et initialisez correctement
                      votre tableau.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Déterminez l&apos;ordre de calcul des sous-problèmes.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Après avoir résolu le problème, réfléchissez à
                      l&apos;optimisation de l&apos;espace si nécessaire.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Évitez de passer directement à la programmation dynamique
                      sans comprendre la structure du problème.
                    </span>
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
