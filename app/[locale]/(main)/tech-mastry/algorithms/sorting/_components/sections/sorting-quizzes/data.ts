import type { Quiz } from "./types";

// Données des quiz
export const quizzes: Quiz[] = [
  {
    id: "basics",
    title: "Notions de base",
    description:
      "Testez vos connaissances sur les concepts fondamentaux des algorithmes de tri",
    questions: [
      {
        id: "q1",
        question:
          "Quelle est la complexité temporelle moyenne du tri à bulles ?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
        correctAnswer: 2,
        explanation:
          "Le tri à bulles a une complexité temporelle moyenne de O(n²) car il utilise deux boucles imbriquées pour comparer et échanger les éléments adjacents.",
        difficulty: "easy",
      },
      {
        id: "q2",
        question: "Parmi ces algorithmes de tri, lequel est toujours stable ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri par sélection (Selection Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par tas (Heap Sort)",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri fusion (Merge Sort) est toujours stable car il préserve l'ordre relatif des éléments égaux. Les autres algorithmes mentionnés ne sont pas stables par défaut.",
        difficulty: "medium",
      },
      {
        id: "q3",
        question:
          "Quel algorithme de tri a la meilleure performance pour un tableau déjà presque trié ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri par insertion (Insertion Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par tas (Heap Sort)",
        ],
        correctAnswer: 1,
        explanation:
          "Le tri par insertion a une complexité de O(n) pour un tableau déjà presque trié, ce qui le rend très efficace dans ce cas particulier.",
        difficulty: "medium",
      },
      {
        id: "q4",
        question:
          "Quelle est la complexité spatiale du tri fusion (Merge Sort) ?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 2,
        explanation:
          "Le tri fusion nécessite un espace supplémentaire de O(n) pour stocker les sous-tableaux temporaires lors de la fusion.",
        difficulty: "medium",
      },
      {
        id: "q5",
        question:
          "Quel algorithme de tri est généralement le plus rapide en pratique pour de grands tableaux aléatoires ?",
        options: [
          "Tri à bulles (Bubble Sort)",
          "Tri par insertion (Insertion Sort)",
          "Tri rapide (Quick Sort)",
          "Tri par sélection (Selection Sort)",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri rapide (Quick Sort) est généralement le plus rapide en pratique pour de grands tableaux aléatoires en raison de sa complexité moyenne de O(n log n) et de sa bonne localité de référence.",
        difficulty: "easy",
      },
    ],
  },
  {
    id: "implementation",
    title: "Implémentation",
    description: "Questions sur l'implémentation des algorithmes de tri",
    questions: [
      {
        id: "q1",
        question:
          "Quelle ligne de code est incorrecte dans cette implémentation du tri à bulles ?",
        options: [
          "for (let i = 0; i < arr.length - 1; i++)",
          "for (let j = 0; j < arr.length - i - 1; j++)",
          "if (arr[j] < arr[j + 1])",
          "[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]",
        ],
        correctAnswer: 2,
        explanation:
          "La condition devrait être `if (arr[j] > arr[j + 1])` pour échanger les éléments si l'élément actuel est plus grand que le suivant. Avec la condition `arr[j] < arr[j + 1]`, le tri serait en ordre décroissant.",
        difficulty: "medium",
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] < arr[j + 1]) { // Cette ligne est incorrecte
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      },
      {
        id: "q2",
        question:
          "Quelle est la valeur du pivot dans l'implémentation standard du tri rapide (Quick Sort) ?",
        options: [
          "Le premier élément du tableau",
          "Le dernier élément du tableau",
          "L'élément du milieu du tableau",
          "La médiane de trois éléments (premier, milieu, dernier)",
        ],
        correctAnswer: 1,
        explanation:
          "Dans l'implémentation standard du tri rapide, le dernier élément du tableau est souvent choisi comme pivot. Cependant, d'autres stratégies de sélection du pivot existent pour améliorer les performances dans certains cas.",
        difficulty: "medium",
        code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partitionner le tableau et obtenir l'indice du pivot
    const pivotIndex = partition(arr, low, high);

    // Trier récursivement les sous-tableaux
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  // Le pivot est le dernier élément
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      },
      {
        id: "q3",
        question:
          "Quelle est l'optimisation la plus courante pour améliorer le tri par insertion ?",
        options: [
          "Utiliser un tri binaire pour trouver la position d'insertion",
          "Utiliser une liste chaînée au lieu d'un tableau",
          "Combiner avec le tri fusion pour les grands sous-tableaux",
          "Utiliser un tas binaire pour stocker les éléments",
        ],
        correctAnswer: 0,
        explanation:
          "L'utilisation d'une recherche binaire pour trouver la position d'insertion (Binary Insertion Sort) est une optimisation courante qui réduit le nombre de comparaisons de O(n) à O(log n) pour chaque élément, bien que le nombre de déplacements reste le même.",
        difficulty: "hard",
      },
      {
        id: "q4",
        question:
          "Quelle est la principale différence d'implémentation entre le tri fusion récursif et itératif ?",
        options: [
          "Le tri fusion itératif utilise une pile explicite",
          "Le tri fusion récursif ne peut pas trier de grands tableaux",
          "Le tri fusion itératif fusionne les sous-tableaux de bas en haut",
          "Le tri fusion récursif est toujours plus rapide",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri fusion itératif fusionne les sous-tableaux de bas en haut, en commençant par des sous-tableaux de taille 1, puis 2, 4, etc., tandis que le tri fusion récursif divise d'abord le tableau en deux moitiés et fusionne de haut en bas.",
        difficulty: "hard",
      },
      {
        id: "q5",
        question:
          "Quelle technique est utilisée dans Timsort, l'algorithme de tri utilisé par défaut dans Python et, pour les objets, dans Java ?",
        options: [
          "Combinaison de tri rapide et tri par tas",
          "Combinaison de tri fusion et tri par insertion",
          "Combinaison de tri à bulles et tri par sélection",
          "Utilisation exclusive du tri par comptage",
        ],
        correctAnswer: 1,
        explanation:
          "Timsort est un algorithme de tri hybride qui combine le tri fusion et le tri par insertion. Il utilise le tri par insertion pour les petits sous-tableaux et le tri fusion pour fusionner ces sous-tableaux triés.",
        difficulty: "hard",
      },
    ],
  },
  {
    id: "complexity",
    title: "Complexité et performance",
    description:
      "Questions avancées sur la complexité et la performance des algorithmes de tri",
    questions: [
      {
        id: "q1",
        question:
          "Lequel de ces algorithmes garantit O(n log n) dans le pire des cas tout en étant stable ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par tas (Heap Sort)",
          "Tri par insertion (Insertion Sort)",
        ],
        correctAnswer: 1,
        explanation:
          "Le tri fusion et le tri par tas ont tous deux une complexité temporelle de O(n log n) dans le pire des cas, mais seul le tri fusion est stable (le tri par tas ne l'est pas). Le tri fusion a en outre une meilleure localité de référence, au prix de O(n) mémoire supplémentaire.",
        difficulty: "medium",
      },
      {
        id: "q2",
        question:
          "Pourquoi le tri rapide (Quick Sort) peut-il avoir une complexité de O(n²) dans le pire des cas ?",
        options: [
          "Parce qu'il utilise une approche diviser pour régner",
          "Parce que le pivot choisi peut conduire à des partitions déséquilibrées",
          "Parce qu'il nécessite un espace supplémentaire de O(n)",
          "Parce qu'il n'est pas stable",
        ],
        correctAnswer: 1,
        explanation:
          "Le tri rapide peut dégénérer en O(n²) si le pivot choisi conduit systématiquement à des partitions très déséquilibrées, comme lorsque le tableau est déjà trié et que le pivot est toujours l'élément le plus petit ou le plus grand.",
        difficulty: "medium",
      },
      {
        id: "q3",
        question:
          "Quelle est la complexité spatiale du tri par tas (Heap Sort) ?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 0,
        explanation:
          "Le tri par tas a une complexité spatiale de O(1) car il trie le tableau en place sans nécessiter d'espace supplémentaire proportionnel à la taille de l'entrée.",
        difficulty: "easy",
      },
      {
        id: "q4",
        question:
          "Quel algorithme de tri est le plus efficace pour trier un petit nombre d'éléments (moins de 10) ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par insertion (Insertion Sort)",
          "Tri par tas (Heap Sort)",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri par insertion est généralement le plus efficace pour trier un petit nombre d'éléments en raison de sa simplicité, de sa faible constante et de son bon comportement sur de petits tableaux.",
        difficulty: "easy",
      },
      {
        id: "q5",
        question:
          "Quelle est la limite inférieure théorique de la complexité temporelle pour un algorithme de tri basé sur les comparaisons ?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
        correctAnswer: 1,
        explanation:
          "La limite inférieure théorique pour tout algorithme de tri basé sur les comparaisons est O(n log n). Cette limite peut être démontrée en utilisant un arbre de décision pour représenter toutes les comparaisons possibles.",
        difficulty: "hard",
      },
    ],
  },
];
