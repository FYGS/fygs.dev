"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart3, Play, RefreshCw, Clock, Info } from "lucide-react";

// Types pour les algorithmes
interface Algorithm {
  name: string;
  color: string;
  fn: (arr: number[]) => number[];
  executionTime?: number;
}

// Implémentations des algorithmes de tri
const bubbleSort = (arr: number[]): number[] => {
  const result = [...arr];
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return result;
};

const selectionSort = (arr: number[]): number[] => {
  const result = [...arr];
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      if (result[j] < result[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [result[i], result[minIdx]] = [result[minIdx], result[i]];
    }
  }

  return result;
};

const insertionSort = (arr: number[]): number[] => {
  const result = [...arr];
  const n = result.length;

  for (let i = 1; i < n; i++) {
    const key = result[i];
    let j = i - 1;

    while (j >= 0 && result[j] > key) {
      result[j + 1] = result[j];
      j--;
    }

    result[j + 1] = key;
  }

  return result;
};

const mergeSort = (arr: number[]): number[] => {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
};

const merge = (left: number[], right: number[]): number[] => {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];
};

const quickSort = (arr: number[]): number[] => {
  const result = [...arr];

  const partition = (arr: number[], low: number, high: number): number => {
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
  };

  const sort = (arr: number[], low: number, high: number): void => {
    if (low < high) {
      const pi = partition(arr, low, high);
      sort(arr, low, pi - 1);
      sort(arr, pi + 1, high);
    }
  };

  sort(result, 0, result.length - 1);
  return result;
};

const heapSort = (arr: number[]): number[] => {
  const result = [...arr];
  const n = result.length;

  const heapify = (arr: number[], n: number, i: number): void => {
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
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(result, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [result[0], result[i]] = [result[i], result[0]];
    heapify(result, i, 0);
  }

  return result;
};

// Liste des algorithmes
const algorithms: Algorithm[] = [
  { name: "Tri à Bulles", color: "blue", fn: bubbleSort },
  { name: "Tri par Sélection", color: "green", fn: selectionSort },
  { name: "Tri par Insertion", color: "amber", fn: insertionSort },
  { name: "Tri Fusion", color: "purple", fn: mergeSort },
  { name: "Tri Rapide", color: "red", fn: quickSort },
  { name: "Tri par Tas", color: "orange", fn: heapSort },
];

export function RealtimePerformance() {
  const [arraySize, setArraySize] = useState<number>(1000);
  const [array, setArray] = useState<number[]>([]);
  const [results, setResults] = useState<Algorithm[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Générer un tableau aléatoire
  const generateArray = useCallback(() => {
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 1000) + 1
    );
    setArray(newArray);
    setResults([]);
  }, [arraySize]);

  // Initialiser le tableau
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Exécuter les algorithmes de tri
  const runBenchmark = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setResults([]);

    // Exécuter les algorithmes un par un avec un délai pour ne pas bloquer l'interface
    const runAlgorithm = (index: number) => {
      if (index >= algorithms.length) {
        setIsRunning(false);
        return;
      }

      const algorithm = { ...algorithms[index] };
      const startTime = performance.now();

      // Exécuter l'algorithme
      algorithm.fn([...array]);

      const endTime = performance.now();
      algorithm.executionTime = endTime - startTime;

      setResults((prev) => [...prev, algorithm]);

      // Exécuter le prochain algorithme
      setTimeout(() => runAlgorithm(index + 1), 100);
    };

    runAlgorithm(0);
  }, [array, isRunning]);

  // Trier les résultats par temps d'exécution
  const sortedResults = [...results].sort((a, b) => {
    return (a.executionTime || 0) - (b.executionTime || 0);
  });

  // Calculer le temps d'exécution maximal pour l'échelle
  const maxExecutionTime = Math.max(
    ...results.map((result) => result.executionTime || 0),
    0.1
  );

  // Calculer la largeur des barres en fonction du temps d'exécution
  const getBarWidth = (executionTime: number) => {
    return (executionTime / maxExecutionTime) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Comparaison de Performance en Temps Réel
            </CardTitle>
            <CardDescription>
              Comparez les performances des algorithmes de tri sur des données
              aléatoires
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="gap-2"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Info</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Panneau d'information */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-950/30 p-4 rounded-lg border border-blue-800"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-blue-300">
                  À propos de cette comparaison
                </h3>
                <p className="text-sm text-blue-400">
                  Cette comparaison mesure le temps d&apos;exécution réel de
                  chaque algorithme de tri sur un tableau aléatoire. Les
                  résultats peuvent varier en fonction de la taille du tableau,
                  de la distribution des données et des performances de votre
                  appareil. Pour des résultats plus précis, exécutez le
                  benchmark plusieurs fois.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="array-size" className="text-sm font-medium">
                Taille du tableau: {arraySize.toLocaleString()}
              </label>
              <Slider
                id="array-size"
                value={[arraySize]}
                min={100}
                max={10000}
                step={100}
                onValueChange={(value) => setArraySize(value[0])}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={generateArray}
                className="gap-2"
                disabled={isRunning}
              >
                <RefreshCw className="w-4 h-4" />
                Nouveau tableau
              </Button>
              <Button
                variant="default"
                onClick={runBenchmark}
                className="gap-2"
                disabled={isRunning}
              >
                <Play className="w-4 h-4" />
                Exécuter le benchmark
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Configuration</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                • Taille du tableau: {arraySize.toLocaleString()} éléments
              </li>
              <li>• Valeurs: nombres aléatoires entre 1 et 1000</li>
              <li>• Mesure: temps d&apos;exécution en millisecondes</li>
              <li>• Environnement: navigateur web (JavaScript)</li>
            </ul>
          </div>
        </div>

        {/* Résultats */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Résultats</h3>

          {isRunning ? (
            <div className="bg-muted/30 p-6 rounded-lg flex items-center justify-center h-[300px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                  Exécution des algorithmes en cours...
                </p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {sortedResults.map((result, index) => (
                <div key={result.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`bg-${result.color}-900/30 text-${result.color}-400`}
                      >
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <span className="text-sm">
                      {result.executionTime?.toFixed(2)} ms
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`bg-${result.color}-500 h-2.5 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getBarWidth(result.executionTime || 0)}%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </div>
              ))}

              {/* Résumé */}
              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <h4 className="text-sm font-medium mb-2">Analyse</h4>
                <p className="text-sm text-muted-foreground">
                  {sortedResults.length > 0 && (
                    <>
                      <strong>{sortedResults[0].name}</strong> est le plus
                      rapide,
                      {sortedResults.length > 1 && (
                        <>
                          {" "}
                          environ{" "}
                          {(
                            sortedResults[sortedResults.length - 1]
                              .executionTime! / sortedResults[0].executionTime!
                          ).toFixed(1)}
                          x plus rapide que{" "}
                          <strong>
                            {sortedResults[sortedResults.length - 1].name}
                          </strong>
                        </>
                      )}
                      .
                      {sortedResults.length > 2 && (
                        <>
                          {" "}
                          Les algorithmes en O(n log n) comme{" "}
                          {sortedResults
                            .slice(0, 3)
                            .some(
                              (r) =>
                                r.name.includes("Fusion") ||
                                r.name.includes("Rapide") ||
                                r.name.includes("Tas")
                            )
                            ? "Tri Fusion, Tri Rapide et Tri par Tas"
                            : "certains algorithmes"}{" "}
                          sont généralement plus performants pour les grands
                          tableaux.
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 p-6 rounded-lg flex items-center justify-center h-[300px]">
              <div className="text-center space-y-2">
                <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground">
                  Cliquez sur &quot;Exécuter le benchmark&quot; pour comparer
                  les performances
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
