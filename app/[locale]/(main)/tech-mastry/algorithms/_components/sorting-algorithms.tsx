import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sortingAlgorithms = [
  {
    name: "Bubble Sort",
    complexity: {
      time: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
      },
      space: "O(1)",
    },
    characteristics: [
      "Algorithme de tri par comparaison",
      "Compare et échange les éléments adjacents",
      "Stable (préserve l'ordre relatif des éléments égaux)",
      "In-place (pas de mémoire supplémentaire)",
    ],
    advantages: [
      "Simple à implémenter",
      "Stable",
      "Peu de mémoire supplémentaire",
      "Bon pour les petits ensembles",
    ],
    disadvantages: [
      "Très inefficace pour les grands ensembles",
      "Complexité quadratique",
      "Nombre élevé d'échanges",
    ],
    code: `function bubbleSort(arr: number[]): number[] {
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
  },
  {
    name: "Quick Sort",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)",
      },
      space: "O(log n) moyen · O(n) pire cas",
    },
    characteristics: [
      "Algorithme de tri par division",
      "Utilise un pivot pour partitionner",
      "Non-stable",
      "In-place",
    ],
    advantages: [
      "Très efficace en moyenne",
      "Bon comportement en cache",
      "Peu de mémoire supplémentaire",
      "Parallélisable",
    ],
    disadvantages: [
      "Instable",
      "Mauvais cas O(n²)",
      "Sensible au choix du pivot",
    ],
    code: `function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
  // On récurse sur la plus PETITE partition et on boucle sur la plus grande :
  // la profondeur de pile reste en O(log n), même dans le pire cas
  while (low < high) {
    const pivot = partition(arr, low, high);
    if (pivot - low < high - pivot) {
      quickSort(arr, low, pivot - 1);
      low = pivot + 1;
    } else {
      quickSort(arr, pivot + 1, high);
      high = pivot - 1;
    }
  }
  return arr;
}

function partition(arr: number[], low: number, high: number): number {
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
    name: "Merge Sort",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
      },
      space: "O(n)",
    },
    characteristics: [
      "Algorithme de tri par fusion",
      "Diviser pour régner",
      "Stable",
      "Non in-place",
    ],
    advantages: [
      "Complexité garantie O(n log n)",
      "Stable",
      "Parallélisable",
      "Bon pour les listes chaînées",
    ],
    disadvantages: [
      "Utilise de la mémoire supplémentaire",
      "Plus lent que QuickSort sur les tableaux",
      "Moins cache-friendly",
    ],
    code: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
  },
  {
    name: "Heap Sort",
    complexity: {
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
      },
      space: "O(1)",
    },
    characteristics: [
      "Utilise une structure de tas binaire",
      "In-place",
      "Non-stable",
      "Basé sur la sélection",
    ],
    advantages: [
      "Complexité garantie O(n log n)",
      "In-place",
      "Pas de récursion",
      "Bon pour les grands ensembles",
    ],
    disadvantages: [
      "Plus lent que QuickSort en pratique",
      "Non-stable",
      "Cache-unfriendly",
    ],
    code: `function heapSort(arr: number[]): number[] {
  const n = arr.length;
  
  // Construire le max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // Extraire les éléments un par un
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr: number[], n: number, i: number): void {
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
  },
];

export function SortingAlgorithms() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Algorithmes de Tri</h2>
        <p className="text-muted-foreground">
          Les algorithmes de tri sont fondamentaux en informatique et illustrent
          différentes approches de résolution de problèmes.
        </p>

        <div className="grid gap-8">
          {sortingAlgorithms.map((algo) => (
            <Card key={algo.name} className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{algo.name}</h3>
                  <Badge variant="outline">Algorithme de Tri</Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Complexité</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cas</TableHead>
                        <TableHead>Temps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Meilleur</TableCell>
                        <TableCell>{algo.complexity.time.best}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Moyen</TableCell>
                        <TableCell>{algo.complexity.time.average}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pire</TableCell>
                        <TableCell>{algo.complexity.time.worst}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Espace</TableCell>
                        <TableCell>{algo.complexity.space}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Caractéristiques</h4>
                  <ul className="space-y-1">
                    {algo.characteristics.map((char, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Avantages</h4>
                    <ul className="space-y-1">
                      {algo.advantages.map((adv, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {adv}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Inconvénients</h4>
                    <ul className="space-y-1">
                      {algo.disadvantages.map((dis, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {dis}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Implémentation</h4>
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto" tabIndex={0}>
                    <code className="text-sm">{algo.code}</code>
                  </pre>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Conseils de Choix</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              • Utilisez QuickSort pour les tableaux en mémoire de taille
              moyenne à grande
            </p>
            <p className="text-muted-foreground">
              • Préférez MergeSort pour les listes chaînées ou quand la
              stabilité est importante
            </p>
            <p className="text-muted-foreground">
              • Optez pour HeapSort quand vous avez besoin d&apos;une complexité
              garantie O(n log n)
            </p>
            <p className="text-muted-foreground">
              • Choisissez BubbleSort uniquement pour de très petits ensembles
              ou à des fins pédagogiques
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
