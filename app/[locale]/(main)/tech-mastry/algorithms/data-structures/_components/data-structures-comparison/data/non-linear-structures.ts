import type { DataStructureInfo, DataStructureType } from "../types";

// Données des structures de données non linéaires
export const nonLinearStructures: Pick<
  Record<DataStructureType, DataStructureInfo>,
  "hashTable" | "binaryTree" | "heap" | "graph"
> = {
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
