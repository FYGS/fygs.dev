"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Briefcase, Code, Cpu, Database, Lightbulb } from "lucide-react";
import { useState } from "react";
import { ApplicationCard } from "./dp-real-world/application-card";
import { CaseStudy } from "./dp-real-world/case-study";
import { InterviewQuestion } from "./dp-real-world/interview-question";

export function DPRealWorld() {
  const [activeTab, setActiveTab] = useState("applications");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Applications Réelles de la Programmation Dynamique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="case-studies">Études de Cas</TabsTrigger>
            <TabsTrigger value="interview">
              Questions d&apos;Entretien
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApplicationCard
                title="Bioinformatique"
                icon={<Cpu className="h-5 w-5" />}
                description="La programmation dynamique est largement utilisée en bioinformatique pour l'alignement de séquences, la prédiction de structures protéiques et l'analyse génomique."
                examples={[
                  {
                    name: "Alignement de séquences",
                    description:
                      "Algorithmes comme Smith-Waterman et Needleman-Wunsch pour aligner des séquences d'ADN ou de protéines.",
                  },
                  {
                    name: "Prédiction de structures secondaires d'ARN",
                    description:
                      "Algorithme de Nussinov pour prédire les structures secondaires d'ARN en maximisant les paires de bases.",
                  },
                ]}
              />

              <ApplicationCard
                title="Finance"
                icon={<BarChart className="h-5 w-5" />}
                description="Dans le domaine financier, la programmation dynamique aide à optimiser les décisions d'investissement, la gestion de portefeuille et la tarification d'options."
                examples={[
                  {
                    name: "Tarification d'options",
                    description:
                      "Modèles binomiaux pour évaluer les options financières en décomposant le problème en périodes discrètes.",
                  },
                  {
                    name: "Allocation d'actifs",
                    description:
                      "Optimisation de portefeuilles d'investissement en fonction du risque et du rendement attendu.",
                  },
                ]}
              />

              <ApplicationCard
                title="Informatique"
                icon={<Code className="h-5 w-5" />}
                description="De nombreux problèmes informatiques fondamentaux sont résolus efficacement grâce à la programmation dynamique."
                examples={[
                  {
                    name: "Compression de données",
                    description:
                      "Le découpage optimal (optimal parsing) de certains compresseurs de type Lempel-Ziv, comme LZMA, s'appuie sur la programmation dynamique. Attention : le codage de Huffman est un algorithme glouton, pas de la programmation dynamique.",
                  },
                  {
                    name: "Routage de réseaux",
                    description:
                      "Algorithmes comme Bellman-Ford pour trouver les chemins les plus courts dans un réseau.",
                  },
                  {
                    name: "Reconnaissance de la parole",
                    description:
                      "Modèles de Markov cachés et algorithme de Viterbi pour la reconnaissance vocale.",
                  },
                ]}
              />

              <ApplicationCard
                title="Bases de données"
                icon={<Database className="h-5 w-5" />}
                description="La programmation dynamique est utilisée pour optimiser les requêtes et la gestion des données dans les systèmes de bases de données."
                examples={[
                  {
                    name: "Optimisation de requêtes",
                    description:
                      "Détermination de l'ordre optimal des jointures dans les requêtes SQL complexes.",
                  },
                  {
                    name: "Partitionnement de données",
                    description:
                      "Optimisation du partitionnement des données pour améliorer les performances des requêtes.",
                  },
                ]}
              />

              <ApplicationCard
                title="Logistique et Transport"
                icon={<Briefcase className="h-5 w-5" />}
                description="La programmation dynamique aide à résoudre des problèmes d'optimisation complexes dans la logistique et la planification des transports."
                examples={[
                  {
                    name: "Problème du voyageur de commerce",
                    description:
                      "Trouver le chemin le plus court pour visiter plusieurs villes et revenir au point de départ (algorithme de Held-Karp en O(n² · 2ⁿ), exact mais exponentiel).",
                  },
                  {
                    name: "Planification de routes",
                    description:
                      "Optimisation des itinéraires de livraison et de la gestion de flotte.",
                  },
                  {
                    name: "Gestion des stocks",
                    description:
                      "Détermination des niveaux optimaux de stock pour minimiser les coûts tout en évitant les ruptures.",
                  },
                ]}
              />

              <ApplicationCard
                title="Intelligence Artificielle"
                icon={<Lightbulb className="h-5 w-5" />}
                description="La programmation dynamique est un outil fondamental en IA, notamment dans l'apprentissage par renforcement et la planification."
                examples={[
                  {
                    name: "Apprentissage par renforcement",
                    description:
                      "Value Iteration et Policy Iteration sont de la programmation dynamique sur un modèle connu ; Q-learning en est une variante sans modèle, apprise par échantillonnage.",
                  },
                  {
                    name: "Planification de trajectoires",
                    description:
                      "Détermination de chemins optimaux pour les robots et les véhicules autonomes.",
                  },
                  {
                    name: "Traitement du langage naturel",
                    description:
                      "Analyse syntaxique et désambiguïsation dans le traitement du langage naturel.",
                  },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="case-studies" className="space-y-6 pt-4">
            <div className="space-y-6">
              <CaseStudy
                title="Scénario illustratif : Recommandations d'un service de streaming"
                industry="Streaming Vidéo"
                problem="Comment recommander efficacement des films et séries à des millions d'utilisateurs avec des préférences différentes."
                solution="Scénario pédagogique, non une description du système réel d'une entreprise (les systèmes de recommandation en production reposent surtout sur le machine learning, par exemple la factorisation de matrices). La programmation dynamique peut y servir pour des sous-tâches, comme l'optimisation de l'ordre d'affichage sous contraintes, en mémorisant les résultats de sous-problèmes répétés."
                results="Gain attendu : moins de calculs redondants dans les sous-tâches d'optimisation."
                dpConcepts={[
                  "Mémoïsation pour stocker les calculs intermédiaires",
                  "Optimisation de fonctions de similarité",
                  "Décomposition en sous-problèmes indépendants",
                ]}
              />

              <CaseStudy
                title="Scénario illustratif : Planification de production industrielle"
                industry="Automobile"
                problem="Optimiser la chaîne de production pour minimiser les coûts tout en respectant les contraintes de temps et de ressources."
                solution="Scénario pédagogique, non un cas documenté d'un constructeur précis. Les problèmes de dimensionnement de lots et de planification multi-étapes se formulent souvent en programmation dynamique : on décompose le processus en étapes et on optimise chaque étape en fonction des décisions précédentes."
                results="Gains potentiels : coûts de production réduits, meilleure utilisation des ressources (l'ampleur dépend entièrement du contexte)."
                dpConcepts={[
                  "Tabulation pour construire un plan de production optimal",
                  "Optimisation sous contraintes",
                  "Prise en compte des dépendances temporelles",
                ]}
              />

              <CaseStudy
                title="Routage à vecteur de distance (Bellman-Ford)"
                industry="Réseaux"
                problem="Déterminer les chemins optimaux pour le routage de paquets dans des réseaux complexes."
                solution="Les protocoles de routage à vecteur de distance (comme RIP) reposent sur le principe de Bellman-Ford : chaque routeur met à jour ses distances à partir de celles de ses voisins, ce qui revient à calculer les chemins optimaux en au plus k arêtes. D'autres protocoles (OSPF, IS-IS) utilisent plutôt Dijkstra."
                results="Calcul décentralisé des plus courts chemins et adaptation aux changements de topologie, avec une convergence parfois lente."
                dpConcepts={[
                  "Algorithme de Bellman-Ford",
                  "Calcul incrémental des chemins optimaux",
                  "Adaptation aux changements de topologie réseau",
                ]}
              />

              <CaseStudy
                title="Scénario illustratif : Allocation d'actifs multi-périodes"
                industry="Finance"
                problem="Construire des portefeuilles d'investissement optimaux qui maximisent le rendement pour un niveau de risque donné."
                solution="Scénario pédagogique, non la description du système d'une société précise. En théorie, l'allocation multi-périodes se formule comme un problème de contrôle stochastique résolu par programmation dynamique (équation de Bellman), qui décompose le problème par horizon temporel ; en pratique, la dimension de l'état oblige souvent à recourir à des approximations."
                results="Permet de raisonner sur le compromis risque-rendement à chaque période ; les résultats dépendent fortement du modèle de marché choisi."
                dpConcepts={[
                  "Optimisation stochastique",
                  "Programmation dynamique multi-périodes",
                  "Gestion des compromis risque-rendement",
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="interview" className="space-y-6 pt-4">
            <div className="space-y-6">
              <InterviewQuestion
                title="Sous-séquence Croissante la Plus Longue"
                difficulty="Intermédiaire"
                companies={["Google", "Amazon", "Microsoft"]}
                description="Étant donné un tableau d'entiers, trouvez la longueur de la plus longue sous-séquence strictement croissante."
                example="Input: [10, 9, 2, 5, 3, 7, 101, 18]\nOutput: 4\nExplication: La plus longue sous-séquence croissante est [2, 3, 7, 101]."
                approach="Utilisez la programmation dynamique en définissant dp[i] comme la longueur de la plus longue sous-séquence croissante se terminant à l'indice i. Pour chaque élément, comparez-le avec tous les éléments précédents pour mettre à jour dp[i]."
                code={`function lengthOfLIS(nums) {
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
}`}
                timeComplexity="O(n²)"
                spaceComplexity="O(n)"
                followUp="Pouvez-vous résoudre ce problème en O(n log n) ?"
              />

              <InterviewQuestion
                title="Nombre Minimum de Pièces de Monnaie"
                difficulty="Intermédiaire"
                companies={["Airbnb", "Facebook", "Apple"]}
                description="Étant donné un tableau de valeurs de pièces et un montant cible, trouvez le nombre minimum de pièces nécessaires pour atteindre ce montant."
                example="Input: coins = [1, 2, 5], amount = 11\nOutput: 3\nExplication: 11 = 5 + 5 + 1"
                approach="Utilisez la programmation dynamique en définissant dp[i] comme le nombre minimum de pièces nécessaires pour atteindre le montant i. Pour chaque montant, essayez toutes les pièces disponibles et prenez le minimum."
                code={`function coinChange(coins, amount) {
  // dp[i] représente le nombre minimum de pièces pour atteindre le montant i
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`}
                timeComplexity="O(amount * nombre de pièces)"
                spaceComplexity="O(amount)"
                followUp="Comment modifieriez-vous l'algorithme pour trouver toutes les combinaisons possibles de pièces ?"
              />

              <InterviewQuestion
                title="Chemin à Somme Maximale dans une Grille"
                difficulty="Intermédiaire"
                companies={["Amazon", "Microsoft", "ByteDance"]}
                description="Étant donné une grille m x n remplie de nombres non négatifs, trouvez un chemin du coin supérieur gauche au coin inférieur droit (déplacements vers la droite ou vers le bas uniquement) qui maximise la somme des nombres le long du chemin."
                example="Input: [\n  [1, 3, 1],\n  [1, 5, 1],\n  [4, 2, 1]\n]\nOutput: 12\nExplication: Le chemin 1→3→5→2→1 a la somme maximale."
                approach="Utilisez la programmation dynamique en définissant dp[i][j] comme la somme maximale pour atteindre la cellule (i,j). Pour chaque cellule, prenez le maximum entre venir d'en haut ou de gauche."
                code={`function maxPathSum(grid) {
  const m = grid.length;
  const n = grid[0].length;

  // dp[i][j] représente la somme maximale pour atteindre la cellule (i,j)
  const dp = Array(m).fill().map(() => Array(n).fill(0));

  // Initialiser la première cellule
  dp[0][0] = grid[0][0];

  // Initialiser la première colonne
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i-1][0] + grid[i][0];
  }

  // Initialiser la première ligne
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j-1] + grid[0][j];
  }

  // Remplir le reste de la table dp
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]) + grid[i][j];
    }
  }

  return dp[m-1][n-1];
}`}
                timeComplexity="O(m * n)"
                spaceComplexity="O(m * n)"
                followUp="Comment modifieriez-vous l'algorithme si vous pouviez vous déplacer dans les quatre directions (haut, bas, gauche, droite) ?"
              />

              <InterviewQuestion
                title="Partition Égale d'un Ensemble"
                difficulty="Intermédiaire"
                companies={["Facebook", "Google", "Uber"]}
                description="Déterminez si un tableau d'entiers peut être divisé en deux sous-ensembles tels que la somme des éléments dans les deux sous-ensembles soit égale."
                example="Input: [1, 5, 11, 5]\nOutput: true\nExplication: Le tableau peut être divisé en [1, 5, 5] et [11]."
                approach="Utilisez la programmation dynamique en définissant dp[i][j] comme un booléen indiquant s'il est possible d'obtenir une somme j en utilisant les i premiers éléments."
                code={`function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);

  // Si la somme est impaire, impossible de diviser en deux parts égales
  if (sum % 2 !== 0) return false;

  const target = sum / 2;
  const n = nums.length;

  // dp[i][j] indique s'il est possible d'obtenir une somme j
  // en utilisant les i premiers éléments
  const dp = Array(n + 1).fill().map(() => Array(target + 1).fill(false));

  // Base case: il est toujours possible d'obtenir une somme de 0
  for (let i = 0; i <= n; i++) {
    dp[i][0] = true;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= target; j++) {
      if (j < nums[i - 1]) {
        // Si l'élément actuel est plus grand que la somme cible,
        // on ne peut pas l'inclure
        dp[i][j] = dp[i - 1][j];
      } else {
        // On peut soit inclure l'élément actuel, soit l'exclure
        dp[i][j] = dp[i - 1][j] || dp[i - 1][j - nums[i - 1]];
      }
    }
  }

  return dp[n][target];
}`}
                timeComplexity="O(n * sum)"
                spaceComplexity="O(n * sum)"
                followUp="Comment optimiseriez-vous l'utilisation de la mémoire dans cet algorithme ?"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
