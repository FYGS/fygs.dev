import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Code2, Lightbulb, AlertCircle } from "lucide-react";

const sortingAlgorithms = [
  {
    name: "Tri à Bulles (Bubble Sort)",
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
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    description:
      "Compare et échange les éléments adjacents jusqu'à ce que le tableau soit trié.",
    pros: ["Simple à implémenter", "Stable", "Peu de mémoire supplémentaire"],
    cons: ["Inefficace pour les grands tableaux", "Complexité quadratique"],
  },
  {
    name: "Tri par Sélection (Selection Sort)",
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
      "Trouve le plus petit élément et le place au début, répète pour le reste du tableau.",
    pros: ["Simple à comprendre", "Peu d'échanges", "Performance constante"],
    cons: ["Toujours O(n²)", "Instable", "Inefficace pour les grands tableaux"],
  },
  {
    name: "Tri par Insertion (Insertion Sort)",
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
      "Construit le tableau trié en insérant chaque élément à sa place.",
    pros: ["Efficace pour les petits tableaux", "Stable", "Adaptatif"],
    cons: [
      "Inefficace pour les grands tableaux",
      "Complexité quadratique moyenne",
    ],
  },
  {
    name: "Tri Fusion (Merge Sort)",
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
      "Divise le tableau en deux, trie récursivement, puis fusionne les parties triées.",
    pros: ["Performance garantie O(n log n)", "Stable", "Parallélisable"],
    cons: [
      "Utilise O(n) mémoire supplémentaire",
      "Plus complexe à implémenter",
    ],
  },
  {
    name: "Tri Rapide (Quick Sort)",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)",
      },
      space: "O(log n)",
    },
    stable: false,
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
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
      "Choisit un pivot, partitionne les éléments autour, puis trie récursivement.",
    pros: [
      "Très rapide en pratique",
      "Peu de mémoire supplémentaire",
      "Cache-friendly",
    ],
    cons: ["Instable", "Pire cas O(n²)", "Sensible au choix du pivot"],
  },
];

const optimizationTips = [
  {
    title: "Choix de l'Algorithme",
    tips: [
      "Petits tableaux (n < 50) : Tri par insertion",
      "Mémoire limitée : Tri rapide",
      "Stabilité requise : Tri fusion",
      "Presque trié : Tri par insertion",
    ],
  },
  {
    title: "Optimisations Pratiques",
    tips: [
      "Utiliser un tri hybride (ex: Timsort)",
      "Paralléliser pour les grands tableaux",
      "Considérer les types de données",
      "Éviter les copies inutiles",
    ],
  },
];

const commonQuestions = [
  {
    question: "Qu'est-ce qu'un tri stable ?",
    answer:
      "Un tri stable préserve l'ordre relatif des éléments égaux. Important pour trier sur plusieurs critères.",
  },
  {
    question: "Pourquoi utiliser un tri O(n²) ?",
    answer:
      "Les tris simples comme l'insertion sont plus efficaces sur de petits tableaux et ont moins de surcharge.",
  },
  {
    question: "In-place vs Extra Space ?",
    answer:
      "Les tris in-place (O(1) espace) sont préférables avec une mémoire limitée, mais peuvent être plus lents.",
  },
];

export function SortingGuide() {
  return (
    <div className="space-y-12">
      {/* Introduction */}
      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-foreground">
          <ArrowUpDown className="w-10 h-10 text-primary" />
          Algorithmes de Tri
        </h1>
        <p className="text-lg text-muted-foreground">
          Les algorithmes de tri sont fondamentaux en programmation. Comprendre
          leurs caractéristiques, forces et faiblesses est essentiel pour
          choisir l&apos;algorithme le plus adapté à chaque situation.
        </p>
      </div>

      {/* Algorithmes */}
      <div className="space-y-8">
        {sortingAlgorithms.map((algo) => (
          <Card key={algo.name} className="p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {algo.name}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {algo.description}
                  </p>
                </div>
                <Badge variant={algo.stable ? "default" : "destructive"}>
                  {algo.stable ? "Stable" : "Instable"}
                </Badge>
              </div>

              {/* Complexité */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Complexité Temporelle</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Meilleur cas:
                      </span>
                      <code className="font-mono">
                        {algo.complexity.time.best}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cas moyen:</span>
                      <code className="font-mono">
                        {algo.complexity.time.average}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pire cas:</span>
                      <code className="font-mono">
                        {algo.complexity.time.worst}
                      </code>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complexité Spatiale</h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Mémoire auxiliaire:
                    </span>
                    <code className="font-mono">{algo.complexity.space}</code>
                  </div>
                </div>
              </div>

              {/* Implémentation */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Implémentation
                </h3>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
                  <code>{algo.code}</code>
                </pre>
              </div>

              {/* Pros & Cons */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Badge className="bg-green-500/10 text-green-500 mb-2">
                    Avantages
                  </Badge>
                  <ul className="space-y-1">
                    {algo.pros.map((pro, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground text-sm flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge className="bg-red-500/10 text-red-500 mb-2">
                    Inconvénients
                  </Badge>
                  <ul className="space-y-1">
                    {algo.cons.map((con, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground text-sm flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conseils d'Optimisation */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Conseils d&apos;Optimisation
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {optimizationTips.map((section) => (
            <Card key={section.title} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Questions Fréquentes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Questions Fréquentes
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {commonQuestions.map((qa) => (
            <Card key={qa.question} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{qa.question}</h3>
                <p className="text-muted-foreground text-sm">{qa.answer}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
