"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { useState } from "react";

// Types de structures de données
type DataStructureType =
  | "array"
  | "linkedList"
  | "stack"
  | "queue"
  | "hashTable"
  | "binaryTree"
  | "heap"
  | "graph";

// Types d'opérations
type OperationType =
  | "access"
  | "search"
  | "insertion"
  | "deletion"
  | "traversal"
  | "sorting"
  | "memory"
  | "implementation";

// Interface pour les caractéristiques d'une structure de données
interface DataStructureInfo {
  name: string;
  description: string;
  operations: Record<
    OperationType,
    {
      complexity: string;
      rating: "good" | "medium" | "bad";
      note?: string;
    }
  >;
  useCases: string[];
  advantages: string[];
  disadvantages: string[];
}

// Données des structures de données
const dataStructures: Record<DataStructureType, DataStructureInfo> = {
  array: {
    name: "Tableau (Array)",
    description:
      "Collection d'éléments stockés dans des emplacements contigus en mémoire, accessibles par index.",
    operations: {
      access: {
        complexity: "O(1)",
        rating: "good",
        note: "Accès direct par index",
      },
      search: {
        complexity: "O(n)",
        rating: "medium",
        note: "Recherche linéaire (O(log n) si trié avec recherche binaire)",
      },
      insertion: {
        complexity: "O(n)",
        rating: "bad",
        note: "Nécessite de décaler les éléments (O(1) à la fin si dynamique)",
      },
      deletion: {
        complexity: "O(n)",
        rating: "bad",
        note: "Nécessite de décaler les éléments",
      },
      traversal: {
        complexity: "O(n)",
        rating: "good",
        note: "Parcours séquentiel efficace",
      },
      sorting: {
        complexity: "O(n log n)",
        rating: "medium",
        note: "Plusieurs algorithmes efficaces disponibles",
      },
      memory: {
        complexity: "O(n)",
        rating: "good",
        note: "Faible surcharge, stockage contigu",
      },
      implementation: {
        complexity: "Facile",
        rating: "good",
        note: "Natif dans la plupart des langages",
      },
    },
    useCases: [
      "Stockage de données de taille fixe",
      "Accès rapide par index",
      "Implémentation de matrices et vecteurs",
      "Algorithmes de tri et recherche",
    ],
    advantages: [
      "Accès rapide en O(1) par index",
      "Efficace en mémoire (stockage contigu)",
      "Bonne localité de cache",
      "Simple à utiliser et implémenter",
    ],
    disadvantages: [
      "Taille fixe pour les tableaux statiques",
      "Insertions et suppressions coûteuses en O(n)",
      "Gaspillage de mémoire si surdimensionné",
      "Réallocation coûteuse pour les tableaux dynamiques",
    ],
  },
  linkedList: {
    name: "Liste Chaînée (Linked List)",
    description:
      "Collection d'éléments où chaque élément (nœud) contient une référence au suivant.",
    operations: {
      access: {
        complexity: "O(n)",
        rating: "bad",
        note: "Nécessite de parcourir la liste depuis le début",
      },
      search: {
        complexity: "O(n)",
        rating: "medium",
        note: "Recherche linéaire",
      },
      insertion: {
        complexity: "O(1)",
        rating: "good",
        note: "En tête ou après un nœud connu (O(n) si position quelconque)",
      },
      deletion: {
        complexity: "O(1)",
        rating: "good",
        note: "Pour un nœud connu (O(n) si recherche nécessaire)",
      },
      traversal: {
        complexity: "O(n)",
        rating: "medium",
        note: "Parcours séquentiel",
      },
      sorting: {
        complexity: "O(n log n)",
        rating: "bad",
        note: "Plus complexe que pour les tableaux",
      },
      memory: {
        complexity: "O(n)",
        rating: "medium",
        note: "Surcharge pour les pointeurs",
      },
      implementation: {
        complexity: "Modérée",
        rating: "medium",
        note: "Nécessite une gestion manuelle des pointeurs",
      },
    },
    useCases: [
      "Insertions et suppressions fréquentes",
      "Implémentation de piles et files",
      "Listes de taille dynamique",
      "Allocation de mémoire",
    ],
    advantages: [
      "Insertions et suppressions efficaces en O(1)",
      "Taille dynamique sans réallocation",
      "Utilisation efficace de la mémoire disponible",
      "Facilite l'implémentation de structures comme les piles et files",
    ],
    disadvantages: [
      "Accès lent en O(n) aux éléments",
      "Consommation de mémoire supplémentaire pour les pointeurs",
      "Mauvaise localité de cache",
      "Pas d'accès direct aux éléments",
    ],
  },
  stack: {
    name: "Pile (Stack)",
    description:
      "Structure LIFO (Last-In-First-Out) où les éléments sont ajoutés et retirés du même côté.",
    operations: {
      access: {
        complexity: "O(n)",
        rating: "bad",
        note: "Accès uniquement au sommet en O(1)",
      },
      search: {
        complexity: "O(n)",
        rating: "bad",
        note: "Nécessite de dépiler temporairement",
      },
      insertion: {
        complexity: "O(1)",
        rating: "good",
        note: "Ajout au sommet (push)",
      },
      deletion: {
        complexity: "O(1)",
        rating: "good",
        note: "Retrait du sommet (pop)",
      },
      traversal: {
        complexity: "O(n)",
        rating: "medium",
        note: "Nécessite de dépiler temporairement",
      },
      sorting: {
        complexity: "N/A",
        rating: "bad",
        note: "Non applicable directement",
      },
      memory: {
        complexity: "O(n)",
        rating: "medium",
        note: "Dépend de l'implémentation (tableau ou liste)",
      },
      implementation: {
        complexity: "Facile",
        rating: "good",
        note: "Simple à implémenter avec un tableau ou une liste",
      },
    },
    useCases: [
      "Gestion des appels de fonctions",
      "Évaluation d'expressions",
      "Algorithmes de backtracking",
      "Gestion d'historique (undo/redo)",
    ],
    advantages: [
      "Opérations push/pop très rapides en O(1)",
      "Implémentation simple",
      "Utile pour les algorithmes récursifs",
      "Gestion naturelle des dépendances LIFO",
    ],
    disadvantages: [
      "Accès limité (uniquement au sommet)",
      "Recherche inefficace",
      "Taille limitée si implémentée avec un tableau",
      "Pas adapté pour l'accès aléatoire",
    ],
  },
  queue: {
    name: "File (Queue)",
    description:
      "Structure FIFO (First-In-First-Out) où les éléments sont ajoutés à la fin et retirés du début.",
    operations: {
      access: {
        complexity: "O(n)",
        rating: "bad",
        note: "Accès uniquement aux extrémités en O(1)",
      },
      search: {
        complexity: "O(n)",
        rating: "bad",
        note: "Nécessite de défiler temporairement",
      },
      insertion: {
        complexity: "O(1)",
        rating: "good",
        note: "Ajout à la fin (enqueue)",
      },
      deletion: {
        complexity: "O(1)",
        rating: "good",
        note: "Retrait du début (dequeue)",
      },
      traversal: {
        complexity: "O(n)",
        rating: "medium",
        note: "Nécessite de défiler temporairement",
      },
      sorting: {
        complexity: "N/A",
        rating: "bad",
        note: "Non applicable directement",
      },
      memory: {
        complexity: "O(n)",
        rating: "medium",
        note: "Dépend de l'implémentation (tableau circulaire ou liste)",
      },
      implementation: {
        complexity: "Modérée",
        rating: "medium",
        note: "Plus complexe avec un tableau (circulaire)",
      },
    },
    useCases: [
      "Gestion de tâches (scheduling)",
      "Tampons de données",
      "Algorithmes de parcours en largeur (BFS)",
      "Gestion de ressources partagées",
    ],
    advantages: [
      "Opérations enqueue/dequeue rapides en O(1)",
      "Ordre de traitement prévisible (FIFO)",
      "Idéal pour les problèmes de producteur-consommateur",
      "Utile pour les algorithmes de niveau par niveau",
    ],
    disadvantages: [
      "Accès limité (uniquement aux extrémités)",
      "Recherche inefficace",
      "Implémentation avec tableau nécessite une gestion circulaire",
      "Pas adapté pour l'accès aléatoire",
    ],
  },
  hashTable: {
    name: "Table de Hachage (Hash Table)",
    description:
      "Structure qui stocke des paires clé-valeur, utilisant une fonction de hachage pour déterminer l'emplacement.",
    operations: {
      access: {
        complexity: "N/A",
        rating: "medium",
        note: "Accès par clé, pas par position",
      },
      search: {
        complexity: "O(1)*",
        rating: "good",
        note: "En moyenne, O(n) dans le pire cas avec collisions",
      },
      insertion: {
        complexity: "O(1)*",
        rating: "good",
        note: "En moyenne, O(n) dans le pire cas avec collisions",
      },
      deletion: {
        complexity: "O(1)*",
        rating: "good",
        note: "En moyenne, O(n) dans le pire cas avec collisions",
      },
      traversal: {
        complexity: "O(n)",
        rating: "medium",
        note: "Parcours de toutes les entrées",
      },
      sorting: {
        complexity: "N/A",
        rating: "bad",
        note: "Non applicable directement (pas d'ordre naturel)",
      },
      memory: {
        complexity: "O(n)",
        rating: "medium",
        note: "Surcharge pour la table et gestion des collisions",
      },
      implementation: {
        complexity: "Complexe",
        rating: "medium",
        note: "Nécessite une bonne fonction de hachage et gestion des collisions",
      },
    },
    useCases: [
      "Recherche rapide par clé",
      "Implémentation de dictionnaires et ensembles",
      "Caches de données",
      "Détection de doublons",
    ],
    advantages: [
      "Recherche, insertion et suppression très rapides en O(1) en moyenne",
      "Flexibilité des types de clés",
      "Efficace pour les grands ensembles de données",
      "Implémentation de dictionnaires et ensembles",
    ],
    disadvantages: [
      "Performance dégradée avec mauvaise fonction de hachage",
      "Collisions nécessitant une gestion supplémentaire",
      "Pas d'ordre naturel des éléments",
      "Consommation de mémoire potentiellement élevée",
    ],
  },
  binaryTree: {
    name: "Arbre Binaire (Binary Tree)",
    description:
      "Structure hiérarchique où chaque nœud a au plus deux enfants (gauche et droit).",
    operations: {
      access: {
        complexity: "O(log n)*",
        rating: "medium",
        note: "Pour un arbre équilibré, O(n) dans le pire cas",
      },
      search: {
        complexity: "O(log n)*",
        rating: "good",
        note: "Pour un arbre de recherche équilibré, O(n) dans le pire cas",
      },
      insertion: {
        complexity: "O(log n)*",
        rating: "good",
        note: "Pour un arbre équilibré, O(n) dans le pire cas",
      },
      deletion: {
        complexity: "O(log n)*",
        rating: "medium",
        note: "Pour un arbre équilibré, O(n) dans le pire cas",
      },
      traversal: {
        complexity: "O(n)",
        rating: "good",
        note: "Plusieurs méthodes: inorder, preorder, postorder, level-order",
      },
      sorting: {
        complexity: "O(n log n)",
        rating: "good",
        note: "Parcours inorder d'un BST donne un ordre trié",
      },
      memory: {
        complexity: "O(n)",
        rating: "medium",
        note: "Surcharge pour les pointeurs des nœuds",
      },
      implementation: {
        complexity: "Complexe",
        rating: "medium",
        note: "Plus complexe pour les arbres auto-équilibrés",
      },
    },
    useCases: [
      "Recherche efficace dans des données ordonnées",
      "Représentation hiérarchique de données",
      "Implémentation de tas (heaps)",
      "Algorithmes de compression (Huffman)",
    ],
    advantages: [
      "Recherche, insertion et suppression efficaces en O(log n) si équilibré",
      "Représentation naturelle de hiérarchies",
      "Parcours ordonné facile",
      "Bonne performance pour les données triées",
    ],
    disadvantages: [
      "Peut devenir déséquilibré, dégradant les performances",
      "Complexité d'implémentation, surtout pour l'équilibrage",
      "Consommation de mémoire pour les pointeurs",
      "Moins efficace que les tableaux pour l'accès séquentiel",
    ],
  },
  heap: {
    name: "Tas (Heap)",
    description:
      "Arbre binaire complet où chaque nœud respecte la propriété de tas (min-heap ou max-heap).",
    operations: {
      access: {
        complexity: "O(1)",
        rating: "good",
        note: "Accès au min/max uniquement",
      },
      search: {
        complexity: "O(n)",
        rating: "bad",
        note: "Pas optimisé pour la recherche",
      },
      insertion: {
        complexity: "O(log n)",
        rating: "good",
        note: "Ajout puis remontée (heapify-up)",
      },
      deletion: {
        complexity: "O(log n)",
        rating: "good",
        note: "Suppression du min/max puis réorganisation",
      },
      traversal: {
        complexity: "O(n)",
        rating: "medium",
        note: "Pas d'ordre de parcours naturel",
      },
      sorting: { complexity: "O(n log n)", rating: "good", note: "Heapsort" },
      memory: {
        complexity: "O(n)",
        rating: "good",
        note: "Implémentation efficace avec un tableau",
      },
      implementation: {
        complexity: "Modérée",
        rating: "medium",
        note: "Nécessite de maintenir la propriété de tas",
      },
    },
    useCases: [
      "Files de priorité",
      "Algorithme de tri (heapsort)",
      "Algorithmes de graphes (Dijkstra, Prim)",
      "Sélection du k-ième plus petit/grand élément",
    ],
    advantages: [
      "Accès rapide au min/max en O(1)",
      "Insertion et suppression efficaces en O(log n)",
      "Implémentation efficace avec un tableau",
      "Utile pour les problèmes de priorité",
    ],
    disadvantages: [
      "Recherche inefficace",
      "Pas adapté pour l'accès ordonné à tous les éléments",
      "Moins flexible que les arbres binaires de recherche",
      "Opérations plus complexes que les structures simples",
    ],
  },
  graph: {
    name: "Graphe (Graph)",
    description:
      "Collection de nœuds (sommets) et d'arêtes reliant ces nœuds, représentant des relations entre objets.",
    operations: {
      access: {
        complexity: "O(1) ou O(n)",
        rating: "medium",
        note: "Dépend de l'implémentation (matrice ou liste d'adjacence)",
      },
      search: {
        complexity: "O(V+E) ou O(V²)",
        rating: "medium",
        note: "BFS/DFS, dépend de l'implémentation",
      },
      insertion: {
        complexity: "O(1) ou O(V)",
        rating: "medium",
        note: "Dépend de l'implémentation",
      },
      deletion: {
        complexity: "O(E) ou O(V)",
        rating: "medium",
        note: "Dépend de l'implémentation",
      },
      traversal: {
        complexity: "O(V+E) ou O(V²)",
        rating: "medium",
        note: "BFS/DFS, dépend de l'implémentation",
      },
      sorting: {
        complexity: "O(V+E)",
        rating: "medium",
        note: "Tri topologique pour les DAG",
      },
      memory: {
        complexity: "O(V+E) ou O(V²)",
        rating: "medium",
        note: "Dépend de l'implémentation",
      },
      implementation: {
        complexity: "Très complexe",
        rating: "bad",
        note: "Nombreuses variantes et algorithmes",
      },
    },
    useCases: [
      "Réseaux sociaux et systèmes de recommandation",
      "Cartographie et navigation (GPS)",
      "Planification et ordonnancement",
      "Analyse de dépendances",
    ],
    advantages: [
      "Représentation naturelle des relations entre objets",
      "Flexibilité (orienté/non-orienté, pondéré/non-pondéré)",
      "Nombreux algorithmes puissants (plus court chemin, flux, etc.)",
      "Modélisation de problèmes complexes",
    ],
    disadvantages: [
      "Complexité d'implémentation et d'utilisation",
      "Consommation de mémoire potentiellement élevée",
      "Algorithmes souvent complexes et coûteux",
      "Difficile à visualiser pour les grands graphes",
    ],
  },
};

// Composant de comparaison des structures de données
export function DataStructuresComparison() {
  const [selectedStructures, setSelectedStructures] = useState<
    DataStructureType[]
  >(["array", "linkedList"]);
  const [comparisonType, setComparisonType] = useState<
    "operations" | "useCases" | "prosCons"
  >("operations");

  // Ajouter ou supprimer une structure de la sélection
  const toggleStructure = (type: DataStructureType) => {
    if (selectedStructures.includes(type)) {
      if (selectedStructures.length > 1) {
        setSelectedStructures(selectedStructures.filter((s) => s !== type));
      }
    } else {
      setSelectedStructures([...selectedStructures, type]);
    }
  };

  // Rendu de l'indicateur de performance
  const renderRating = (rating: "good" | "medium" | "bad") => {
    switch (rating) {
      case "good":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "medium":
        return <HelpCircle className="h-5 w-5 text-amber-500" />;
      case "bad":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des Structures de Données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection des structures */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Sélectionner les structures à comparer:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dataStructures).map(([type, info]) => (
              <Badge
                key={type}
                variant={
                  selectedStructures.includes(type as DataStructureType)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleStructure(type as DataStructureType)}
              >
                {info.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Type de comparaison */}
        <Tabs
          value={comparisonType}
          onValueChange={(value) =>
            setComparisonType(value as "operations" | "useCases" | "prosCons")
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operations">Opérations</TabsTrigger>
            <TabsTrigger value="useCases">Cas d&apos;utilisation</TabsTrigger>
            <TabsTrigger value="prosCons">Avantages/Inconvénients</TabsTrigger>
          </TabsList>

          {/* Comparaison des opérations */}
          <TabsContent value="operations" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Opération</TableHead>
                  {selectedStructures.map((type) => (
                    <TableHead key={type}>
                      {dataStructures[type].name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  Object.keys(
                    dataStructures.array.operations
                  ) as OperationType[]
                ).map((op) => (
                  <TableRow key={op}>
                    <TableCell className="font-medium capitalize">
                      {op}
                    </TableCell>
                    {selectedStructures.map((type) => (
                      <TableCell key={`${type}-${op}`}>
                        <div className="flex items-center gap-2">
                          {renderRating(
                            dataStructures[type].operations[op].rating
                          )}
                          <span>
                            {dataStructures[type].operations[op].complexity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dataStructures[type].operations[op].note}
                        </p>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Comparaison des cas d'utilisation */}
          <TabsContent value="useCases" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStructures.map((type) => (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="bg-muted py-3">
                    <CardTitle className="text-lg">
                      {dataStructures[type].name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {dataStructures[type].description}
                    </p>
                    <h4 className="text-sm font-medium mb-2">
                      Cas d&apos;utilisation:
                    </h4>
                    <ul className="space-y-1">
                      {dataStructures[type].useCases.map((useCase, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Comparaison des avantages/inconvénients */}
          <TabsContent value="prosCons" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStructures.map((type) => (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="bg-muted py-3">
                    <CardTitle className="text-lg">
                      {dataStructures[type].name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-green-600">
                          Avantages:
                        </h4>
                        <ul className="space-y-1">
                          {dataStructures[type].advantages.map((adv, index) => (
                            <li
                              key={index}
                              className="text-sm flex items-start gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-red-600">
                          Inconvénients:
                        </h4>
                        <ul className="space-y-1">
                          {dataStructures[type].disadvantages.map(
                            (disadv, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-start gap-2"
                              >
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>{disadv}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
