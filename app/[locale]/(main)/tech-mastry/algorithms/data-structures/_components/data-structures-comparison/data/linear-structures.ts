import type { DataStructureInfo, DataStructureType } from "../types";

// Données des structures de données linéaires
export const linearStructures: Pick<
  Record<DataStructureType, DataStructureInfo>,
  "array" | "linkedList" | "stack" | "queue"
> = {
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
};
