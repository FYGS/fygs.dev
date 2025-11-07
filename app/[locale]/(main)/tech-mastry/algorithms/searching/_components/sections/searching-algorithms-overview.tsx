"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Code2,
  Copy,
  Database,
  Search,
} from "lucide-react";
import { useState } from "react";

// Types pour les algorithmes de recherche
type TimeComplexity = {
  best: string;
  average: string;
  worst: string;
};

type Complexity = {
  time: TimeComplexity;
  space: string;
};

type SearchAlgorithm = {
  id: string;
  name: string;
  description: string;
  complexity: Complexity;
  code: string;
  useCases: string[];
  pros: string[];
  cons: string[];
  visualization?: string;
  dataStructures?: string[];
};

// Données des algorithmes de recherche
const searchAlgorithms: SearchAlgorithm[] = [
  {
    id: "linear",
    name: "Recherche Linéaire",
    description:
      "Parcourt séquentiellement le tableau jusqu'à trouver l'élément recherché.",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)",
      },
      space: "O(1)",
    },
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    useCases: [
      "Petits tableaux",
      "Tableaux non triés",
      "Recherche unique",
      "Données non structurées",
    ],
    pros: [
      "Simple à implémenter",
      "Fonctionne sur données non triées",
      "Peu de mémoire",
      "Aucun prétraitement nécessaire",
    ],
    cons: [
      "Inefficace pour les grands tableaux",
      "Temps linéaire",
      "Performance dégradée avec la taille des données",
    ],
    dataStructures: ["Tableaux", "Listes chaînées", "Ensembles non triés"],
  },
  {
    id: "binary",
    name: "Recherche Binaire",
    description:
      "Divise répétitivement l'espace de recherche en deux pour trouver l'élément.",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)",
      },
      space: "O(1)",
    },
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    useCases: [
      "Grands tableaux triés",
      "Recherches fréquentes",
      "Optimisation de performance",
      "Dictionnaires",
    ],
    pros: [
      "Très efficace (O(log n))",
      "Excellent pour grands tableaux",
      "Peu de mémoire",
      "Prévisible",
    ],
    cons: [
      "Nécessite un tableau trié",
      "Plus complexe à implémenter",
      "Nécessite un accès aléatoire",
    ],
    dataStructures: ["Tableaux triés", "Arbres binaires de recherche"],
  },
  {
    id: "interpolation",
    name: "Recherche par Interpolation",
    description:
      "Utilise une formule d'interpolation pour estimer la position de l'élément.",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log log n)",
        worst: "O(n)",
      },
      space: "O(1)",
    },
    code: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      return arr[low] === target ? low : -1;
    }

    const pos = low + Math.floor(
      ((high - low) * (target - arr[low])) /
      (arr[high] - arr[low])
    );

    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
    useCases: [
      "Données uniformément distribuées",
      "Grands tableaux triés",
      "Optimisation avancée",
      "Dictionnaires numériques",
    ],
    pros: [
      "Plus rapide que binaire pour données uniformes",
      "Excellent pour grands tableaux",
      "Adaptatif",
    ],
    cons: [
      "Performance variable selon distribution",
      "Plus complexe",
      "Nécessite tableau trié",
      "Instable pour distributions irrégulières",
    ],
    dataStructures: ["Tableaux triés avec distribution uniforme"],
  },
  {
    id: "hash",
    name: "Recherche par Hachage",
    description:
      "Utilise une table de hachage pour accéder directement aux éléments.",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(1)",
        worst: "O(n)",
      },
      space: "O(n)",
    },
    code: `function hashSearch(arr, target) {
  const hashMap = new Map();
  // Construction de la table de hachage
  for (let i = 0; i < arr.length; i++) {
    hashMap.set(arr[i], i);
  }
  return hashMap.has(target) ? hashMap.get(target) : -1;
}`,
    useCases: [
      "Recherches très fréquentes",
      "Grands ensembles de données",
      "Priorité à la vitesse",
      "Caches",
    ],
    pros: [
      "Accès O(1) en moyenne",
      "Très rapide pour recherches multiples",
      "Flexible pour différents types de clés",
    ],
    cons: [
      "Utilise beaucoup de mémoire",
      "Coût initial de construction",
      "Collisions possibles",
      "Fonction de hachage critique",
    ],
    dataStructures: ["Tables de hachage", "Dictionnaires", "Ensembles"],
  },
  {
    id: "bst",
    name: "Recherche dans un Arbre Binaire",
    description:
      "Utilise un arbre binaire de recherche pour trouver des éléments efficacement.",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(n)",
      },
      space: "O(n)",
    },
    code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function searchBST(root, target) {
  if (!root) return null;
  if (root.value === target) return root;

  if (target < root.value) {
    return searchBST(root.left, target);
  } else {
    return searchBST(root.right, target);
  }
}`,
    useCases: [
      "Données dynamiques",
      "Opérations d'insertion/suppression fréquentes",
      "Recherches par plage",
      "Bases de données",
    ],
    pros: [
      "Efficace pour recherches et modifications",
      "Maintient l'ordre",
      "Adapté aux recherches par plage",
      "Structure flexible",
    ],
    cons: [
      "Plus complexe à implémenter",
      "Peut dégénérer en liste",
      "Nécessite équilibrage",
      "Overhead de mémoire",
    ],
    dataStructures: [
      "Arbres binaires de recherche",
      "Arbres AVL",
      "Arbres rouge-noir",
    ],
  },
  {
    id: "jump",
    name: "Recherche par Saut (Jump Search)",
    description:
      "Saute par blocs puis effectue une recherche linéaire dans le bloc pertinent.",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(√n)",
        worst: "O(√n)",
      },
      space: "O(1)",
    },
    code: `function jumpSearch(arr, target) {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));

  // Trouver le bloc
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }

  // Recherche linéaire dans le bloc
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }

  if (arr[prev] === target) return prev;
  return -1;
}`,
    useCases: [
      "Tableaux triés de taille moyenne",
      "Compromis entre linéaire et binaire",
      "Systèmes avec accès séquentiel coûteux",
    ],
    pros: [
      "Plus rapide que linéaire",
      "Plus simple que binaire",
      "Bon pour accès séquentiel",
      "Peu de mémoire",
    ],
    cons: [
      "Moins efficace que binaire",
      "Nécessite tableau trié",
      "Sensible à la taille du bloc",
    ],
    dataStructures: ["Tableaux triés"],
  },
];

export function SearchingAlgorithmsOverview() {
  const [activeAlgo, setActiveAlgo] = useState<string>("linear");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fonction pour copier le code
  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Trouver l'algorithme actif
  const currentAlgo =
    searchAlgorithms.find((algo) => algo.id === activeAlgo) ||
    searchAlgorithms[0];

  // Animation pour les transitions
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          Vue d&apos;ensemble des Algorithmes
        </h2>
        <p className="text-muted-foreground">
          Explorez les différents algorithmes de recherche, leurs
          caractéristiques, complexités et cas d&apos;utilisation.
        </p>
      </div>

      {/* Navigation des algorithmes */}
      <Tabs value={activeAlgo} onValueChange={setActiveAlgo} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 w-full">
          {searchAlgorithms.map((algo) => (
            <TabsTrigger key={algo.id} value={algo.id}>
              {algo.name.split(" ")[1] || algo.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenu détaillé de l'algorithme */}
        <motion.div
          key={activeAlgo}
          initial="hidden"
          animate="visible"
          variants={contentVariants}
          className="mt-6"
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Search className="w-6 h-6 text-primary" />
                    {currentAlgo.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    {currentAlgo.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentAlgo.complexity.time.average}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {currentAlgo.complexity.space}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Complexité */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Complexité Temporelle
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-950/30 p-4 rounded-lg border border-green-900">
                      <div className="text-xs text-muted-foreground mb-1">
                        Meilleur cas
                      </div>
                      <div className="text-xl font-mono font-semibold text-green-400">
                        {currentAlgo.complexity.time.best}
                      </div>
                    </div>
                    <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-900">
                      <div className="text-xs text-muted-foreground mb-1">
                        Cas moyen
                      </div>
                      <div className="text-xl font-mono font-semibold text-blue-400">
                        {currentAlgo.complexity.time.average}
                      </div>
                    </div>
                    <div className="bg-amber-950/30 p-4 rounded-lg border border-amber-900">
                      <div className="text-xs text-muted-foreground mb-1">
                        Pire cas
                      </div>
                      <div className="text-xl font-mono font-semibold text-amber-400">
                        {currentAlgo.complexity.time.worst}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Complexité Spatiale
                  </h3>
                  <div className="bg-purple-950/30 p-4 rounded-lg border border-purple-900">
                    <div className="text-xs text-muted-foreground mb-1">
                      Mémoire auxiliaire
                    </div>
                    <div className="text-xl font-mono font-semibold text-purple-400">
                      {currentAlgo.complexity.space}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {currentAlgo.complexity.space === "O(1)"
                        ? "Utilise une quantité constante de mémoire supplémentaire"
                        : "Utilise une quantité variable de mémoire selon la taille des données"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Implémentation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Implémentation
                </h3>
                <div className="relative">
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(currentAlgo.code, currentAlgo.id)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === currentAlgo.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{currentAlgo.code}</code>
                  </pre>
                </div>
              </div>

              {/* Cas d'utilisation et structures de données */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Cas d&apos;utilisation
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentAlgo.useCases.map((useCase, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Structures de données
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentAlgo.dataStructures?.map((ds, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1 bg-muted/50"
                      >
                        {ds}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avantages et inconvénients */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Avantages
                  </h3>
                  <ul className="space-y-2">
                    {currentAlgo.pros.map((pro, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Inconvénients
                  </h3>
                  <ul className="space-y-2">
                    {currentAlgo.cons.map((con, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation entre algorithmes */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    const currentIndex = searchAlgorithms.findIndex(
                      (algo) => algo.id === activeAlgo
                    );
                    const prevIndex =
                      (currentIndex - 1 + searchAlgorithms.length) %
                      searchAlgorithms.length;
                    setActiveAlgo(searchAlgorithms[prevIndex].id);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Précédent
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    const currentIndex = searchAlgorithms.findIndex(
                      (algo) => algo.id === activeAlgo
                    );
                    const nextIndex =
                      (currentIndex + 1) % searchAlgorithms.length;
                    setActiveAlgo(searchAlgorithms[nextIndex].id);
                  }}
                  className="flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Tabs>
    </div>
  );
}
