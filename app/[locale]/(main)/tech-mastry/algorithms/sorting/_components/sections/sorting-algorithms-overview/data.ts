// Données des algorithmes de tri
export const sortingAlgorithms = [
  {
    id: "bubble",
    name: "Tri à Bulles",
    nameEn: "Bubble Sort",
    complexity: {
      time: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
      },
      space: "O(1)",
    },
    stable: true,
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    // Si aucun échange n'a été fait dans cette passe, le tableau est trié
    if (!swapped) break;
  }
  return arr;
}`,
    description:
      "Compare et échange les éléments adjacents jusqu'à ce que le tableau soit trié. À chaque passe, le plus grand élément non trié remonte à sa position finale.",
    pros: [
      "Simple à implémenter",
      "Stable",
      "Peu de mémoire supplémentaire",
      "Détecte si le tableau est déjà trié",
    ],
    cons: [
      "Inefficace pour les grands tableaux",
      "Complexité quadratique",
      "Nombreux échanges inutiles",
    ],
    animation: "bubbles-rising",
    color: "blue",
  },
  {
    id: "selection",
    name: "Tri par Sélection",
    nameEn: "Selection Sort",
    complexity: {
      time: {
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)",
      },
      space: "O(1)",
    },
    stable: false,
    code: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
    description:
      "Trouve le plus petit élément et le place au début, puis répète pour le reste du tableau. À chaque étape, une partie du tableau est triée.",
    pros: [
      "Simple à comprendre",
      "Peu d'échanges (O(n))",
      "Performance constante",
      "Bon pour les petits tableaux",
    ],
    cons: [
      "Toujours O(n²) même si le tableau est trié",
      "Instable",
      "Inefficace pour les grands tableaux",
    ],
    animation: "select-and-place",
    color: "green",
  },
  {
    id: "insertion",
    name: "Tri par Insertion",
    nameEn: "Insertion Sort",
    complexity: {
      time: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
      },
      space: "O(1)",
    },
    stable: true,
    code: `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    description:
      "Construit le tableau trié en insérant chaque élément à sa place. Similaire à la façon dont on trie des cartes à jouer dans sa main.",
    pros: [
      "Efficace pour les petits tableaux",
      "Stable",
      "Adaptatif (O(n) si presque trié)",
      "In-place",
      "Bon pour les tableaux partiellement triés",
    ],
    cons: [
      "Inefficace pour les grands tableaux",
      "Complexité quadratique moyenne",
      "Nombreux déplacements d'éléments",
    ],
    animation: "card-insertion",
    color: "amber",
  },
  {
    id: "merge",
    name: "Tri Fusion",
    nameEn: "Merge Sort",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
      },
      space: "O(n)",
    },
    stable: true,
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  let result = [], i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
    description:
      "Divise le tableau en deux, trie récursivement, puis fusionne les parties triées. Utilise le principe 'diviser pour régner'.",
    pros: [
      "Performance garantie O(n log n)",
      "Stable",
      "Parallélisable",
      "Efficace pour les grands tableaux",
      "Bon pour les listes chaînées",
    ],
    cons: [
      "Utilise O(n) mémoire supplémentaire",
      "Plus complexe à implémenter",
      "Moins efficace que QuickSort pour les tableaux en mémoire",
    ],
    animation: "divide-and-merge",
    color: "purple",
  },
  {
    id: "quick",
    name: "Tri Rapide",
    nameEn: "Quick Sort",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)",
      },
      space: "O(log n) moyen · O(n) pire cas",
    },
    stable: false,
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  // On récurse sur la plus PETITE partition et on boucle sur la plus grande :
  // la profondeur de pile reste en O(log n), même dans le pire cas
  while (low < high) {
    const pi = partition(arr, low, high);
    if (pi - low < high - pi) {
      quickSort(arr, low, pi - 1);
      low = pi + 1;
    } else {
      quickSort(arr, pi + 1, high);
      high = pi - 1;
    }
  }
  return arr;
}

function partition(arr, low, high) {
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
    description:
      "Choisit un pivot, partitionne les éléments autour, puis trie récursivement. L'un des algorithmes de tri les plus utilisés en pratique. Espace auxiliaire = pile de récursion : O(log n) en moyenne, O(n) au pire cas avec une récursion naïve sur les deux parties ; en récursant d'abord sur la plus petite partition (comme ci-dessous), la pile reste en O(log n).",
    pros: [
      "Très rapide en pratique",
      "Peu de mémoire supplémentaire",
      "Cache-friendly",
      "Bon pour les grands tableaux",
      "Implémenté dans de nombreuses bibliothèques standard",
    ],
    cons: [
      "Instable",
      "Pire cas O(n²)",
      "Sensible au choix du pivot",
      "Moins efficace sur des tableaux presque triés",
    ],
    animation: "pivot-partition",
    color: "red",
  },
  {
    id: "heap",
    name: "Tri par Tas",
    nameEn: "Heap Sort",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
      },
      space: "O(1)",
    },
    stable: false,
    code: `function heapSort(arr) {
  const n = arr.length;
  
  // Construire un max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // Extraire les éléments un par un
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; // Échanger
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
    description:
      "Utilise une structure de données de tas (heap) pour trier les éléments. Combine les avantages de l'efficacité du tri fusion avec l'économie d'espace du tri rapide.",
    pros: [
      "Performance garantie O(n log n)",
      "In-place",
      "Pas de pire cas comme QuickSort",
      "Efficace pour trouver les k plus grands/petits éléments",
    ],
    cons: [
      "Instable",
      "Plus lent que QuickSort en pratique",
      "Complexe à implémenter",
      "Mauvaise localité de référence",
    ],
    animation: "heap-extraction",
    color: "orange",
  },
];
