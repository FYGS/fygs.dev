import type { SearchAlgorithm } from "./types";

// Données des algorithmes de recherche
export const searchAlgorithms: SearchAlgorithm[] = [
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
