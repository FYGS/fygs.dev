// Données de performance pour les différents algorithmes
export const performanceData = [
  {
    name: "Recherche Linéaire",
    complexity: "O(n)",
    color: "#ef4444", // red-500
    values: [
      { size: 10, time: 0.1 },
      { size: 100, time: 1 },
      { size: 1000, time: 10 },
      { size: 10000, time: 100 },
      { size: 100000, time: 1000 },
    ],
  },
  {
    name: "Recherche Binaire",
    complexity: "O(log n)",
    color: "#3b82f6", // blue-500
    values: [
      { size: 10, time: 0.033 },
      { size: 100, time: 0.067 },
      { size: 1000, time: 0.1 },
      { size: 10000, time: 0.133 },
      { size: 100000, time: 0.167 },
    ],
  },
  {
    name: "Recherche par Saut",
    complexity: "O(√n)",
    color: "#10b981", // emerald-500
    values: [
      { size: 10, time: 0.032 },
      { size: 100, time: 0.1 },
      { size: 1000, time: 0.32 },
      { size: 10000, time: 1 },
      { size: 100000, time: 3.2 },
    ],
  },
  {
    name: "Recherche par Interpolation",
    complexity: "O(log log n)",
    color: "#8b5cf6", // violet-500
    values: [
      { size: 10, time: 0.03 },
      { size: 100, time: 0.05 },
      { size: 1000, time: 0.07 },
      { size: 10000, time: 0.09 },
      { size: 100000, time: 0.11 },
    ],
  },
  {
    name: "Recherche par Hachage",
    complexity: "O(1)",
    color: "#f59e0b", // amber-500
    values: [
      { size: 10, time: 0.01 },
      { size: 100, time: 0.01 },
      { size: 1000, time: 0.01 },
      { size: 10000, time: 0.01 },
      { size: 100000, time: 0.01 },
    ],
  },
  {
    name: "Recherche Exponentielle",
    complexity: "O(log i)",
    color: "#ec4899", // pink-500
    values: [
      { size: 10, time: 0.035 },
      { size: 100, time: 0.07 },
      { size: 1000, time: 0.105 },
      { size: 10000, time: 0.14 },
      { size: 100000, time: 0.175 },
    ],
  },
  {
    name: "Recherche Ternaire",
    complexity: "O(log₃ n)",
    color: "#06b6d4", // cyan-500
    values: [
      { size: 10, time: 0.03 },
      { size: 100, time: 0.06 },
      { size: 1000, time: 0.09 },
      { size: 10000, time: 0.12 },
      { size: 100000, time: 0.15 },
    ],
  },
];

// Données de mémoire pour les différents algorithmes
export const memoryData = [
  {
    name: "Recherche Linéaire",
    complexity: "O(1)",
    color: "#ef4444", // red-500
    value: 1,
  },
  {
    name: "Recherche Binaire",
    complexity: "O(1)",
    color: "#3b82f6", // blue-500
    value: 1,
  },
  {
    name: "Recherche par Saut",
    complexity: "O(1)",
    color: "#10b981", // emerald-500
    value: 1,
  },
  {
    name: "Recherche par Interpolation",
    complexity: "O(1)",
    color: "#8b5cf6", // violet-500
    value: 1,
  },
  {
    name: "Recherche par Hachage",
    complexity: "O(n)",
    color: "#f59e0b", // amber-500
    value: 10,
  },
  {
    name: "Recherche Exponentielle",
    complexity: "O(1)",
    color: "#ec4899", // pink-500
    value: 1,
  },
  {
    name: "Recherche Ternaire",
    complexity: "O(1)",
    color: "#06b6d4", // cyan-500
    value: 1,
  },
];

// Données d'utilisation pour les différents algorithmes
export const usageData = [
  {
    name: "Recherche Linéaire",
    color: "#ef4444", // red-500
    scenarios: [
      { name: "Données non triées", value: 10 },
      { name: "Petits ensembles", value: 8 },
      { name: "Simplicité", value: 10 },
      { name: "Performance", value: 2 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche Binaire",
    color: "#3b82f6", // blue-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 5 },
      { name: "Simplicité", value: 7 },
      { name: "Performance", value: 8 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche par Saut",
    color: "#10b981", // emerald-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 3 },
      { name: "Simplicité", value: 6 },
      { name: "Performance", value: 7 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche par Interpolation",
    color: "#8b5cf6", // violet-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 2 },
      { name: "Simplicité", value: 4 },
      { name: "Performance", value: 9 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche par Hachage",
    color: "#f59e0b", // amber-500
    scenarios: [
      { name: "Données non triées", value: 10 },
      { name: "Petits ensembles", value: 5 },
      { name: "Simplicité", value: 5 },
      { name: "Performance", value: 10 },
      { name: "Mémoire", value: 3 },
    ],
  },
  {
    name: "Recherche Exponentielle",
    color: "#ec4899", // pink-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 6 },
      { name: "Simplicité", value: 5 },
      { name: "Performance", value: 8 },
      { name: "Mémoire", value: 10 },
    ],
  },
  {
    name: "Recherche Ternaire",
    color: "#06b6d4", // cyan-500
    scenarios: [
      { name: "Données non triées", value: 0 },
      { name: "Petits ensembles", value: 4 },
      { name: "Simplicité", value: 5 },
      { name: "Performance", value: 8 },
      { name: "Mémoire", value: 10 },
    ],
  },
];
