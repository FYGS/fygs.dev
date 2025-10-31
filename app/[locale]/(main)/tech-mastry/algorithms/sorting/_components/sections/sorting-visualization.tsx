"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types pour la visualisation
type SortingAlgorithm =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap";

interface SortingStep {
  array: number[];
  activeIndices: number[];
  comparisons: number;
  swaps: number;
  message: string;
  subArrays?: { start: number; end: number; color: string }[];
  pivotIndex?: number;
  sortedIndices?: number[];
}

export function SortingVisualization() {
  // État pour la configuration
  const [arraySize, setArraySize] = useState(15);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("bubble");
  const [array, setArray] = useState<number[]>([]);
  const [speed, setSpeed] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);

  // État pour la visualisation
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Référence pour le timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un tableau aléatoire
  const generateArray = useCallback(() => {
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);

    // Réinitialiser les étapes et l'index
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [arraySize]);

  // Générer les étapes pour le tri à bulles
  const generateBubbleSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const sortedIndices: number[] = [];

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri à bulles.",
      sortedIndices: [...sortedIndices],
    });

    // Simuler le tri à bulles
    for (let i = 0; i < arr.length; i++) {
      let swapped = false;

      for (let j = 0; j < arr.length - i - 1; j++) {
        // Comparaison
        comparisons++;
        steps.push({
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
          message: `Comparaison des éléments aux indices ${j} (${arr[j]}) et ${
            j + 1
          } (${arr[j + 1]}).`,
          sortedIndices: [...sortedIndices],
        });

        if (arr[j] > arr[j + 1]) {
          // Échange
          swaps++;
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;

          steps.push({
            array: [...arr],
            activeIndices: [j, j + 1],
            comparisons,
            swaps,
            message: `Échange des éléments aux indices ${j} (${arr[j]}) et ${
              j + 1
            } (${arr[j + 1]}).`,
            sortedIndices: [...sortedIndices],
          });
        }
      }

      // Marquer l'élément comme trié
      sortedIndices.push(arr.length - i - 1);

      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `L'élément à l'indice ${
          arr.length - i - 1
        } est maintenant à sa position finale.`,
        sortedIndices: [...sortedIndices],
      });

      // Si aucun échange n'a été fait dans cette passe, le tableau est trié
      if (!swapped) {
        // Marquer tous les éléments restants comme triés
        for (let k = 0; k < arr.length - i - 1; k++) {
          if (!sortedIndices.includes(k)) {
            sortedIndices.push(k);
          }
        }

        break;
      }
    }

    // Étape finale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    });

    return steps;
  }, [array]);

  // Générer les étapes pour le tri par sélection
  const generateSelectionSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const sortedIndices: number[] = [];

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri par sélection.",
      sortedIndices: [...sortedIndices],
    });

    // Simuler le tri par sélection
    for (let i = 0; i < arr.length - 1; i++) {
      let minIndex = i;

      // Trouver le minimum dans le reste du tableau
      steps.push({
        array: [...arr],
        activeIndices: [minIndex],
        comparisons,
        swaps,
        message: `Recherche du minimum à partir de l'indice ${i}.`,
        sortedIndices: [...sortedIndices],
      });

      for (let j = i + 1; j < arr.length; j++) {
        // Comparaison
        comparisons++;
        steps.push({
          array: [...arr],
          activeIndices: [minIndex, j],
          comparisons,
          swaps,
          message: `Comparaison des éléments aux indices ${minIndex} (${arr[minIndex]}) et ${j} (${arr[j]}).`,
          sortedIndices: [...sortedIndices],
        });

        if (arr[j] < arr[minIndex]) {
          minIndex = j;
          steps.push({
            array: [...arr],
            activeIndices: [minIndex],
            comparisons,
            swaps,
            message: `Nouveau minimum trouvé à l'indice ${minIndex} (${arr[minIndex]}).`,
            sortedIndices: [...sortedIndices],
          });
        }
      }

      // Échanger le minimum avec le premier élément non trié
      if (minIndex !== i) {
        swaps++;
        steps.push({
          array: [...arr],
          activeIndices: [i, minIndex],
          comparisons,
          swaps,
          message: `Échange des éléments aux indices ${i} (${arr[i]}) et ${minIndex} (${arr[minIndex]}).`,
          sortedIndices: [...sortedIndices],
        });

        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

        steps.push({
          array: [...arr],
          activeIndices: [i, minIndex],
          comparisons,
          swaps,
          message: `Après échange: éléments aux indices ${i} (${arr[i]}) et ${minIndex} (${arr[minIndex]}).`,
          sortedIndices: [...sortedIndices],
        });
      }

      // Marquer l'élément comme trié
      sortedIndices.push(i);
      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `L'élément à l'indice ${i} est maintenant à sa position finale.`,
        sortedIndices: [...sortedIndices],
      });
    }

    // Marquer le dernier élément comme trié
    sortedIndices.push(arr.length - 1);

    // Étape finale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    });

    return steps;
  }, [array]);

  // Générer les étapes pour le tri par insertion
  const generateInsertionSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const sortedIndices: number[] = [0]; // Le premier élément est déjà trié

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri par insertion. Le premier élément est déjà trié.",
      sortedIndices: [...sortedIndices],
    });

    // Simuler le tri par insertion
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;

      // Marquer l'élément à insérer
      steps.push({
        array: [...arr],
        activeIndices: [i],
        comparisons,
        swaps,
        message: `Sélection de l'élément à l'indice ${i} (${key}) pour insertion.`,
        sortedIndices: [...sortedIndices],
      });

      // Déplacer les éléments plus grands que key vers la droite
      while (j >= 0) {
        comparisons++;
        steps.push({
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
          message: `Comparaison de ${key} avec l'élément à l'indice ${j} (${arr[j]}).`,
          sortedIndices: [...sortedIndices],
        });

        if (arr[j] > key) {
          swaps++;
          arr[j + 1] = arr[j];

          steps.push({
            array: [...arr],
            activeIndices: [j, j + 1],
            comparisons,
            swaps,
            message: `Déplacement de l'élément ${arr[j]} vers la droite.`,
            sortedIndices: [...sortedIndices],
          });

          j--;
        } else {
          break;
        }
      }

      // Placer key à sa position correcte
      if (arr[j + 1] !== key) {
        arr[j + 1] = key;

        steps.push({
          array: [...arr],
          activeIndices: [j + 1],
          comparisons,
          swaps,
          message: `Insertion de ${key} à l'indice ${j + 1}.`,
          sortedIndices: [...sortedIndices],
        });
      }

      // Mettre à jour les indices triés
      sortedIndices.push(i);

      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Sous-tableau [0..${i}] maintenant trié.`,
        sortedIndices: [...sortedIndices],
      });
    }

    // Étape finale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} déplacements.`,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    });

    return steps;
  }, [array]);

  // Générer les étapes pour le tri fusion
  const generateMergeSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri fusion (Merge Sort).",
      sortedIndices: [],
    });

    // Fonction récursive pour le tri fusion
    const mergeSort = (
      start: number,
      end: number,
      depth: number = 0
    ): number[] => {
      // Si le sous-tableau ne contient qu'un seul élément, il est déjà trié
      if (start >= end) {
        return [start];
      }

      // Diviser le tableau en deux moitiés
      const mid = Math.floor((start + end) / 2);

      // Ajouter une étape pour montrer la division
      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Division du sous-tableau [${start}..${end}] en [${start}..${mid}] et [${
          mid + 1
        }..${end}].`,
        subArrays: [{ start, end, color: "blue" }],
      });

      // Trier récursivement les deux moitiés
      mergeSort(start, mid, depth + 1);
      mergeSort(mid + 1, end, depth + 1);

      // Fusionner les deux moitiés triées
      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Fusion des sous-tableaux [${start}..${mid}] et [${
          mid + 1
        }..${end}].`,
        subArrays: [
          { start, end: mid, color: "green" },
          { start: mid + 1, end, color: "purple" },
        ],
      });

      // Créer des tableaux temporaires pour la fusion
      const leftArr = arr.slice(start, mid + 1);
      const rightArr = arr.slice(mid + 1, end + 1);

      let i = 0,
        j = 0,
        k = start;
      const sortedIndices: number[] = [];

      // Fusionner les deux moitiés
      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;

        steps.push({
          array: [...arr],
          activeIndices: [start + i, mid + 1 + j],
          comparisons,
          swaps,
          message: `Comparaison de ${leftArr[i]} et ${rightArr[j]}.`,
          subArrays: [
            { start, end: mid, color: "green" },
            { start: mid + 1, end, color: "purple" },
          ],
        });

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          sortedIndices.push(k);
          i++;
        } else {
          arr[k] = rightArr[j];
          sortedIndices.push(k);
          j++;
          swaps++; // Compter comme un échange car l'ordre est modifié
        }

        steps.push({
          array: [...arr],
          activeIndices: [k],
          comparisons,
          swaps,
          message: `Placement de ${arr[k]} à l'indice ${k}.`,
          subArrays: [
            { start, end: mid, color: "green" },
            { start: mid + 1, end, color: "purple" },
          ],
        });

        k++;
      }

      // Copier les éléments restants de leftArr
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        sortedIndices.push(k);

        steps.push({
          array: [...arr],
          activeIndices: [k],
          comparisons,
          swaps,
          message: `Copie de l'élément restant ${leftArr[i]} de la moitié gauche à l'indice ${k}.`,
          subArrays: [
            { start, end: mid, color: "green" },
            { start: mid + 1, end, color: "purple" },
          ],
        });

        i++;
        k++;
      }

      // Copier les éléments restants de rightArr
      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        sortedIndices.push(k);

        steps.push({
          array: [...arr],
          activeIndices: [k],
          comparisons,
          swaps,
          message: `Copie de l'élément restant ${rightArr[j]} de la moitié droite à l'indice ${k}.`,
          subArrays: [
            { start, end: mid, color: "green" },
            { start: mid + 1, end, color: "purple" },
          ],
        });

        j++;
        k++;
      }

      // Ajouter une étape pour montrer le sous-tableau trié
      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Sous-tableau [${start}..${end}] maintenant trié.`,
        subArrays: [{ start, end, color: "blue" }],
      });

      // Retourner les indices du sous-tableau trié
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    // Lancer le tri fusion
    mergeSort(0, arr.length - 1);

    // Étape finale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    });

    return steps;
  }, [array]);

  // Générer les étapes pour le tri rapide
  const generateQuickSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri rapide (Quick Sort).",
      sortedIndices: [],
    });

    // Fonction récursive pour le tri rapide
    const quickSort = (low: number, high: number): void => {
      if (low < high) {
        // Ajouter une étape pour montrer le sous-tableau à trier
        steps.push({
          array: [...arr],
          activeIndices: [],
          comparisons,
          swaps,
          message: `Tri du sous-tableau [${low}..${high}].`,
          subArrays: [{ start: low, end: high, color: "blue" }],
        });

        // Choisir le pivot (dernier élément)
        const pivot = arr[high];

        steps.push({
          array: [...arr],
          activeIndices: [],
          comparisons,
          swaps,
          message: `Choix du pivot: ${pivot} (indice ${high}).`,
          subArrays: [{ start: low, end: high, color: "blue" }],
          pivotIndex: high,
        });

        // Partitionner le tableau
        let i = low - 1;

        for (let j = low; j < high; j++) {
          // Comparaison avec le pivot
          comparisons++;

          steps.push({
            array: [...arr],
            activeIndices: [j, high],
            comparisons,
            swaps,
            message: `Comparaison de ${arr[j]} avec le pivot ${pivot}.`,
            subArrays: [{ start: low, end: high, color: "blue" }],
            pivotIndex: high,
          });

          if (arr[j] <= pivot) {
            i++;

            // Échange si nécessaire
            if (i !== j) {
              swaps++;

              steps.push({
                array: [...arr],
                activeIndices: [i, j],
                comparisons,
                swaps,
                message: `Échange des éléments aux indices ${i} (${arr[i]}) et ${j} (${arr[j]}).`,
                subArrays: [{ start: low, end: high, color: "blue" }],
                pivotIndex: high,
              });

              [arr[i], arr[j]] = [arr[j], arr[i]];

              steps.push({
                array: [...arr],
                activeIndices: [i, j],
                comparisons,
                swaps,
                message: `Après échange: éléments aux indices ${i} (${arr[i]}) et ${j} (${arr[j]}).`,
                subArrays: [{ start: low, end: high, color: "blue" }],
                pivotIndex: high,
              });
            } else {
              steps.push({
                array: [...arr],
                activeIndices: [i],
                comparisons,
                swaps,
                message: `${arr[i]} est déjà à la bonne position.`,
                subArrays: [{ start: low, end: high, color: "blue" }],
                pivotIndex: high,
              });
            }
          }
        }

        // Placer le pivot à sa position finale
        const pivotPos = i + 1;

        if (pivotPos !== high) {
          swaps++;

          steps.push({
            array: [...arr],
            activeIndices: [pivotPos, high],
            comparisons,
            swaps,
            message: `Placement du pivot ${pivot} à sa position finale (indice ${pivotPos}).`,
            subArrays: [{ start: low, end: high, color: "blue" }],
            pivotIndex: high,
          });

          [arr[pivotPos], arr[high]] = [arr[high], arr[pivotPos]];

          steps.push({
            array: [...arr],
            activeIndices: [],
            comparisons,
            swaps,
            message: `Pivot ${pivot} placé à l'indice ${pivotPos}. Tous les éléments à gauche sont <= pivot, tous les éléments à droite sont > pivot.`,
            subArrays: [
              { start: low, end: pivotPos - 1, color: "green" },
              { start: pivotPos + 1, end: high, color: "purple" },
            ],
            pivotIndex: pivotPos,
          });
        }

        // Marquer le pivot comme trié
        const sortedIndices = steps[steps.length - 1].sortedIndices || [];
        sortedIndices.push(pivotPos);

        steps.push({
          array: [...arr],
          activeIndices: [],
          comparisons,
          swaps,
          message: `L'élément ${arr[pivotPos]} à l'indice ${pivotPos} est maintenant à sa position finale.`,
          sortedIndices: [...sortedIndices],
          pivotIndex: pivotPos,
        });

        // Trier récursivement les sous-tableaux
        quickSort(low, pivotPos - 1);
        quickSort(pivotPos + 1, high);
      } else if (low === high) {
        // Un seul élément est déjà trié
        const sortedIndices = steps[steps.length - 1].sortedIndices || [];
        if (!sortedIndices.includes(low)) {
          sortedIndices.push(low);

          steps.push({
            array: [...arr],
            activeIndices: [],
            comparisons,
            swaps,
            message: `L'élément unique ${arr[low]} à l'indice ${low} est déjà trié.`,
            sortedIndices: [...sortedIndices],
          });
        }
      }
    };

    // Lancer le tri rapide
    quickSort(0, arr.length - 1);

    // Étape finale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    });

    return steps;
  }, [array]);

  // Générer les étapes pour le tri par tas
  const generateHeapSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const sortedIndices: number[] = [];

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri par tas (Heap Sort).",
      sortedIndices: [...sortedIndices],
    });

    // Fonction pour réorganiser le tas
    const heapify = (n: number, i: number): void => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      // Comparer avec le fils gauche
      if (left < n) {
        comparisons++;

        steps.push({
          array: [...arr],
          activeIndices: [i, left],
          comparisons,
          swaps,
          message: `Comparaison du nœud ${arr[i]} avec son fils gauche ${arr[left]}.`,
          sortedIndices: [...sortedIndices],
        });

        if (arr[left] > arr[largest]) {
          largest = left;

          steps.push({
            array: [...arr],
            activeIndices: [largest],
            comparisons,
            swaps,
            message: `Le fils gauche ${arr[largest]} est plus grand que le nœud actuel.`,
            sortedIndices: [...sortedIndices],
          });
        }
      }

      // Comparer avec le fils droit
      if (right < n) {
        comparisons++;

        steps.push({
          array: [...arr],
          activeIndices: [largest, right],
          comparisons,
          swaps,
          message: `Comparaison du plus grand élément actuel ${arr[largest]} avec le fils droit ${arr[right]}.`,
          sortedIndices: [...sortedIndices],
        });

        if (arr[right] > arr[largest]) {
          largest = right;

          steps.push({
            array: [...arr],
            activeIndices: [largest],
            comparisons,
            swaps,
            message: `Le fils droit ${arr[largest]} est le plus grand.`,
            sortedIndices: [...sortedIndices],
          });
        }
      }

      // Si le plus grand n'est pas la racine, échanger et continuer à réorganiser
      if (largest !== i) {
        swaps++;

        steps.push({
          array: [...arr],
          activeIndices: [i, largest],
          comparisons,
          swaps,
          message: `Échange du nœud ${arr[i]} avec ${arr[largest]}.`,
          sortedIndices: [...sortedIndices],
        });

        [arr[i], arr[largest]] = [arr[largest], arr[i]];

        steps.push({
          array: [...arr],
          activeIndices: [i, largest],
          comparisons,
          swaps,
          message: `Après échange: nœuds ${arr[i]} et ${arr[largest]}.`,
          sortedIndices: [...sortedIndices],
        });

        // Récursivement réorganiser le sous-arbre affecté
        heapify(n, largest);
      }
    };

    // Construire un max-heap
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Construction du max-heap initial.",
      sortedIndices: [...sortedIndices],
    });

    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      steps.push({
        array: [...arr],
        activeIndices: [i],
        comparisons,
        swaps,
        message: `Réorganisation du sous-arbre avec racine à l'indice ${i}.`,
        sortedIndices: [...sortedIndices],
      });

      heapify(arr.length, i);
    }

    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Max-heap construit. Extraction des éléments un par un.",
      sortedIndices: [...sortedIndices],
    });

    // Extraire les éléments un par un
    for (let i = arr.length - 1; i > 0; i--) {
      swaps++;

      steps.push({
        array: [...arr],
        activeIndices: [0, i],
        comparisons,
        swaps,
        message: `Extraction du plus grand élément ${arr[0]} et placement à la fin.`,
        sortedIndices: [...sortedIndices],
      });

      // Déplacer la racine (plus grand élément) à la fin
      [arr[0], arr[i]] = [arr[i], arr[0]];

      // Marquer l'élément comme trié
      sortedIndices.push(i);

      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Élément ${arr[i]} placé à sa position finale.`,
        sortedIndices: [...sortedIndices],
      });

      // Réorganiser le tas réduit
      steps.push({
        array: [...arr],
        activeIndices: [0],
        comparisons,
        swaps,
        message: `Réorganisation du tas réduit.`,
        sortedIndices: [...sortedIndices],
      });

      heapify(i, 0);
    }

    // Marquer le dernier élément comme trié
    sortedIndices.push(0);

    // Étape finale
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    });

    return steps;
  }, [array]);

  // Générer les étapes en fonction de l'algorithme sélectionné
  const generateSteps = useCallback(() => {
    switch (algorithm) {
      case "bubble":
        return generateBubbleSortSteps();
      case "selection":
        return generateSelectionSortSteps();
      case "insertion":
        return generateInsertionSortSteps();
      case "merge":
        return generateMergeSortSteps();
      case "quick":
        return generateQuickSortSteps();
      case "heap":
        return generateHeapSortSteps();
      default:
        return generateBubbleSortSteps();
    }
  }, [
    algorithm,
    generateBubbleSortSteps,
    generateSelectionSortSteps,
    generateInsertionSortSteps,
    generateMergeSortSteps,
    generateQuickSortSteps,
    generateHeapSortSteps,
  ]);

  // Initialiser le tableau
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Générer les étapes lorsque l'algorithme ou le tableau change
  useEffect(() => {
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [algorithm, array, generateSteps]);

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex] || {
    array: array,
    activeIndices: [],
    comparisons: 0,
    swaps: 0,
    message: "Cliquez sur 'Démarrer' pour lancer la visualisation.",
    sortedIndices: [],
  };

  // Calculer la hauteur maximale pour la visualisation
  const maxValue = Math.max(
    ...(currentStep.array.length > 0 ? currentStep.array : [1])
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Visualisation Interactive
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection d'algorithme */}
          <Tabs
            value={algorithm}
            onValueChange={(value) => setAlgorithm(value as SortingAlgorithm)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              <TabsTrigger value="bubble">
                Bulles
                <Badge variant="outline" className="ml-1 hidden md:inline-flex">
                  O(n²)
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="selection">
                Sélection
                <Badge variant="outline" className="ml-1 hidden md:inline-flex">
                  O(n²)
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="insertion">
                Insertion
                <Badge variant="outline" className="ml-1 hidden md:inline-flex">
                  O(n²)
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="merge">
                Fusion
                <Badge variant="outline" className="ml-1 hidden md:inline-flex">
                  O(n log n)
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="quick">
                Rapide
                <Badge variant="outline" className="ml-1 hidden md:inline-flex">
                  O(n log n)
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="heap">
                Tas
                <Badge variant="outline" className="ml-1 hidden md:inline-flex">
                  O(n log n)
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Panneau de configuration */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-muted/50 p-4 rounded-lg space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="array-size" className="text-sm font-medium">
                      Taille du tableau: {arraySize}
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateArray}
                      className="h-8 gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="text-xs">Nouveau</span>
                    </Button>
                  </div>
                  <Slider
                    id="array-size"
                    value={[arraySize]}
                    min={5}
                    max={50}
                    step={1}
                    onValueChange={(value) => setArraySize(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="speed" className="text-sm font-medium">
                    Vitesse: {speed}x
                  </label>
                  <Slider
                    id="speed"
                    value={[speed]}
                    min={0.5}
                    max={3}
                    step={0.5}
                    onValueChange={(value) => setSpeed(value[0])}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zone de visualisation */}
          <div className="h-[400px] border rounded-lg p-4 bg-muted/30 relative">
            <div className="flex items-end justify-around h-[350px] gap-1">
              {currentStep.array.map((value, index) => {
                // Déterminer la couleur de la barre
                let bgColor = "bg-slate-300";
                let borderColor = "border-slate-400";
                let textColor = "text-slate-700";
                let glow = "";

                // Vérifier si l'indice fait partie d'un sous-tableau
                if (currentStep.subArrays) {
                  for (const subArray of currentStep.subArrays) {
                    if (index >= subArray.start && index <= subArray.end) {
                      switch (subArray.color) {
                        case "blue":
                          bgColor = "bg-blue-300";
                          borderColor = "border-blue-400";
                          break;
                        case "green":
                          bgColor = "bg-green-300";
                          borderColor = "border-green-400";
                          break;
                        case "purple":
                          bgColor = "bg-purple-300";
                          borderColor = "border-purple-400";
                          break;
                        case "orange":
                          bgColor = "bg-orange-300";
                          borderColor = "border-orange-400";
                          break;
                        case "red":
                          bgColor = "bg-red-300";
                          borderColor = "border-red-400";
                          break;
                      }
                    }
                  }
                }

                // Éléments actifs (en cours de comparaison ou d'échange)
                if (currentStep.activeIndices.includes(index)) {
                  if (currentStep.activeIndices.length === 2) {
                    // Si deux éléments sont actifs, les différencier
                    if (index === currentStep.activeIndices[0]) {
                      bgColor = "bg-blue-500";
                      borderColor = "border-blue-600";
                      textColor = "text-white font-medium";
                      glow = "shadow-md shadow-blue-300/50";
                    } else {
                      bgColor = "bg-purple-500";
                      borderColor = "border-purple-600";
                      textColor = "text-white font-medium";
                      glow = "shadow-md shadow-purple-300/50";
                    }
                  } else {
                    // Un seul élément actif
                    bgColor = "bg-primary";
                    borderColor = "border-primary-600";
                    textColor = "text-white font-medium";
                    glow = "shadow-md shadow-primary/50";
                  }
                }
                // Éléments triés
                else if (currentStep.sortedIndices?.includes(index)) {
                  bgColor = "bg-green-400";
                  borderColor = "border-green-500";
                  textColor = "text-green-900 font-medium";
                }

                // Pivot pour le tri rapide
                if (currentStep.pivotIndex === index) {
                  bgColor = "bg-amber-500";
                  borderColor = "border-amber-600";
                  textColor = "text-white font-bold";
                  glow = "shadow-md shadow-amber-300/50";
                }

                // Calculer la hauteur de la barre
                const height = (value / maxValue) * 100;

                return (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        duration: 0.5,
                      },
                    }}
                  >
                    <motion.div
                      className={`w-8 ${bgColor} ${glow} border ${borderColor} rounded-t`}
                      style={{ height: `${height}%` }}
                      title={`Valeur: ${value}${
                        currentStep.activeIndices.includes(index)
                          ? " (En cours de traitement)"
                          : ""
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      animate={{
                        backgroundColor: currentStep.activeIndices.includes(
                          index
                        )
                          ? "var(--primary)"
                          : currentStep.sortedIndices?.includes(index)
                          ? "var(--green-400)"
                          : "var(--slate-300)",
                        y: currentStep.activeIndices.includes(index) ? -5 : 0,
                        transition: { duration: 0.3 },
                      }}
                    ></motion.div>
                    <motion.span
                      className={`text-xs mt-1 ${textColor}`}
                      animate={{
                        scale: currentStep.activeIndices.includes(index)
                          ? 1.2
                          : 1,
                        fontWeight: currentStep.activeIndices.includes(index)
                          ? 700
                          : 400,
                        transition: { duration: 0.3 },
                      }}
                    >
                      {value}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Contrôles de lecture */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (currentStepIndex > 0) {
                      setCurrentStepIndex(currentStepIndex - 1);
                    }
                  }}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </motion.div>

              {isPlaying ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsPlaying(false);
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                    }}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsPlaying(true);

                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                      }

                      timerRef.current = setInterval(() => {
                        setCurrentStepIndex((prevIndex) => {
                          if (prevIndex < steps.length - 1) {
                            return prevIndex + 1;
                          } else {
                            setIsPlaying(false);
                            if (timerRef.current) {
                              clearInterval(timerRef.current);
                              timerRef.current = null;
                            }
                            return prevIndex;
                          }
                        });
                      }, 1000 / speed);
                    }}
                    disabled={currentStepIndex === steps.length - 1}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (currentStepIndex < steps.length - 1) {
                      setCurrentStepIndex(currentStepIndex + 1);
                    }
                  }}
                  disabled={currentStepIndex === steps.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <div className="text-sm text-muted-foreground">
              Étape {currentStepIndex + 1} / {steps.length}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 mb-4">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  ((currentStepIndex + 1) / Math.max(steps.length, 1)) * 100
                }%`,
              }}
            ></div>
          </div>

          {/* Informations sur l'étape actuelle */}
          <motion.div
            className="bg-muted p-4 rounded-lg"
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium">{currentStep.message}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline">
                Comparaisons: {currentStep.comparisons}
              </Badge>
              <Badge variant="outline">Échanges: {currentStep.swaps}</Badge>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
