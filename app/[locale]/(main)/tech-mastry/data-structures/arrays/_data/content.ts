/* ─── Complexity Table ─── */
export const operations = [
  {
    op: "Accès (arr[i])",
    time: "O(1)",
    space: "—",
    note: "Calcul direct d&apos;adresse mémoire",
  },
  { op: "Recherche", time: "O(n)", space: "O(1)", note: "Parcours linéaire" },
  {
    op: "Recherche binaire",
    time: "O(log n)",
    space: "O(1)",
    note: "Tableau trié requis",
  },
  {
    op: "push / pop",
    time: "O(1)*",
    space: "O(1)",
    note: "Amorti — réallocation possible",
  },
  {
    op: "unshift / shift",
    time: "O(n)",
    space: "O(1)",
    note: "Décalage de tous les éléments",
  },
  { op: "splice", time: "O(n)", space: "O(1)", note: "Décalage partiel" },
  {
    op: "sort()",
    time: "O(n log n)",
    space: "O(log n)",
    note: "TimSort en V8",
  },
  {
    op: "map / filter / reduce",
    time: "O(n)",
    space: "O(n)",
    note: "Crée un nouveau tableau",
  },
];

/* ─── Techniques */
export const techniques = [
  {
    name: "Two Pointers",
    desc: "Deux pointeurs se déplaçant dans le tableau (vers le centre, même direction). Idéal pour les tableaux triés.",
    examples: [
      "Two Sum (trié)",
      "Remove Duplicates",
      "Container with Most Water",
      "3Sum",
    ],
    complexity: "O(n)",
  },
  {
    name: "Sliding Window",
    desc: "Fenêtre de taille fixe ou variable glissant sur le tableau. Optimise les sous-tableaux contigus.",
    examples: [
      "Max Sum Subarray (k)",
      "Longest Substring Without Repeat",
      "Minimum Window Substring",
    ],
    complexity: "O(n)",
  },
  {
    name: "Prefix Sum",
    desc: "Pré-calcul des sommes cumulées pour répondre aux requêtes de somme de plage en O(1).",
    examples: [
      "Subarray Sum Equals K",
      "Range Sum Query",
      "Product of Array Except Self",
    ],
    complexity: "O(n) pré-calcul + O(1) requête",
  },
  {
    name: "Kadane's Algorithm",
    desc: "Trouve la sous-séquence contiguë de somme maximale en un seul passage.",
    examples: [
      "Maximum Subarray",
      "Max Circular Subarray",
      "Max Product Subarray",
    ],
    complexity: "O(n)",
  },
  {
    name: "Binary Search",
    desc: "Division récursive de l'espace de recherche. Nécessite un tableau trié ou une propriété monotone.",
    examples: [
      "Search Rotated Array",
      "Find Peak Element",
      "Median of Two Sorted Arrays",
    ],
    complexity: "O(log n)",
  },
];

export const stringTechniques = [
  {
    name: "Anagrammes",
    desc: "Comptage de fréquences (HashMap) pour comparer.",
    complexity: "O(n)",
  },
  {
    name: "Palindromes",
    desc: "Two pointers du centre ou des extrémités.",
    complexity: "O(n)",
  },
  {
    name: "Pattern matching",
    desc: "KMP, Rabin-Karp, ou Z-algorithm pour la recherche de motifs.",
    complexity: "O(n+m)",
  },
  {
    name: "String builder",
    desc: "Concaténation efficace via tableau + join au lieu de +=.",
    complexity: "O(n)",
  },
];
