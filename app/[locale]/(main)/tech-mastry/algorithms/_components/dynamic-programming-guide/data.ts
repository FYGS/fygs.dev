export const dpProblems = [
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
      "Maximiser la valeur des objets dans un sac avec une capacité limitée (version 0/1 : chaque objet est pris entièrement ou pas du tout). Complexité pseudo-polynomiale : elle dépend de la valeur numérique de W.",
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

export const concepts = [
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
