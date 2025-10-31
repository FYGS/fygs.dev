"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SortingStep {
  type: "bubble" | "merge" | "quick";
  array: number[];
  activeIndices: number[];
  comparisons: number;
  swaps: number;
  message: string;
  subArrays?: { start: number; end: number; color: string }[];
  pivotIndex?: number;
}

export function SortingAlgorithmsVisualization() {
  const [arraySize, setArraySize] = useState(15);
  const [array, setArray] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"bubble" | "merge" | "quick">(
    "bubble"
  );
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un tableau aléatoire
  const generateArray = useCallback(() => {
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
  }, [arraySize]);

  // Générer les étapes pour le tri à bulles
  const generateBubbleSortSteps = useCallback(() => {
    const steps: SortingStep[] = [];
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    // Étape initiale
    steps.push({
      type: "bubble",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri à bulles.",
    });

    // Simuler le tri à bulles
    for (let i = 0; i < arr.length; i++) {
      let swapped = false;

      for (let j = 0; j < arr.length - i - 1; j++) {
        // Comparaison
        comparisons++;
        steps.push({
          type: "bubble",
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
          message: `Comparaison des éléments aux indices ${j} (${arr[j]}) et ${
            j + 1
          } (${arr[j + 1]}).`,
        });

        if (arr[j] > arr[j + 1]) {
          // Échange
          swaps++;
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;

          steps.push({
            type: "bubble",
            array: [...arr],
            activeIndices: [j, j + 1],
            comparisons,
            swaps,
            message: `Échange des éléments aux indices ${j} (${arr[j]}) et ${
              j + 1
            } (${arr[j + 1]}).`,
          });
        }
      }

      // Si aucun échange n'a été fait dans cette passe, le tableau est trié
      if (!swapped) {
        break;
      }
    }

    // Étape finale
    steps.push({
      type: "bubble",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
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
      type: "merge",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri fusion.",
    });

    // Fonction pour fusionner deux sous-tableaux triés
    const merge = (arr: number[], left: number, mid: number, right: number) => {
      const leftSize = mid - left + 1;
      const rightSize = right - mid;

      // Créer des tableaux temporaires
      const leftArray = arr.slice(left, mid + 1);
      const rightArray = arr.slice(mid + 1, right + 1);

      // Ajouter une étape pour montrer la division
      steps.push({
        type: "merge",
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Division: sous-tableaux [${left}...${mid}] et [${
          mid + 1
        }...${right}].`,
        subArrays: [
          { start: left, end: mid, color: "bg-blue-500/20" },
          { start: mid + 1, end: right, color: "bg-green-500/20" },
        ],
      });

      // Fusionner les tableaux temporaires
      let i = 0,
        j = 0,
        k = left;

      while (i < leftSize && j < rightSize) {
        comparisons++;

        if (leftArray[i] <= rightArray[j]) {
          arr[k] = leftArray[i];
          i++;
        } else {
          arr[k] = rightArray[j];
          j++;
          swaps++;
        }

        steps.push({
          type: "merge",
          array: [...arr],
          activeIndices: [k],
          comparisons,
          swaps,
          message: `Fusion: placement de l'élément à l'indice ${k}.`,
          subArrays: [
            { start: left, end: mid, color: "bg-blue-500/20" },
            { start: mid + 1, end: right, color: "bg-green-500/20" },
          ],
        });

        k++;
      }

      // Copier les éléments restants de leftArray, s'il y en a
      while (i < leftSize) {
        arr[k] = leftArray[i];
        i++;
        k++;

        steps.push({
          type: "merge",
          array: [...arr],
          activeIndices: [k - 1],
          comparisons,
          swaps,
          message: `Fusion: copie des éléments restants du sous-tableau gauche.`,
          subArrays: [
            { start: left, end: mid, color: "bg-blue-500/20" },
            { start: mid + 1, end: right, color: "bg-green-500/20" },
          ],
        });
      }

      // Copier les éléments restants de rightArray, s'il y en a
      while (j < rightSize) {
        arr[k] = rightArray[j];
        j++;
        k++;

        steps.push({
          type: "merge",
          array: [...arr],
          activeIndices: [k - 1],
          comparisons,
          swaps,
          message: `Fusion: copie des éléments restants du sous-tableau droit.`,
          subArrays: [
            { start: left, end: mid, color: "bg-blue-500/20" },
            { start: mid + 1, end: right, color: "bg-green-500/20" },
          ],
        });
      }
    };

    // Fonction principale du tri fusion
    const mergeSort = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        // Trier la première moitié
        mergeSort(arr, left, mid);

        // Trier la deuxième moitié
        mergeSort(arr, mid + 1, right);

        // Fusionner les deux moitiés triées
        merge(arr, left, mid, right);
      }
    };

    // Exécuter le tri fusion
    mergeSort(arr, 0, arr.length - 1);

    // Étape finale
    steps.push({
      type: "merge",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
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
      type: "quick",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: "Début du tri rapide.",
    });

    // Fonction de partition
    const partition = (arr: number[], low: number, high: number) => {
      // Choisir le pivot (dernier élément)
      const pivot = arr[high];

      steps.push({
        type: "quick",
        array: [...arr],
        activeIndices: [high],
        comparisons,
        swaps,
        message: `Choix du pivot: ${pivot} (indice ${high}).`,
        pivotIndex: high,
        subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
      });

      // Index du plus petit élément
      let i = low - 1;

      for (let j = low; j < high; j++) {
        // Comparer l'élément courant avec le pivot
        comparisons++;

        steps.push({
          type: "quick",
          array: [...arr],
          activeIndices: [j, high],
          comparisons,
          swaps,
          message: `Comparaison de l'élément ${arr[j]} (indice ${j}) avec le pivot ${pivot}.`,
          pivotIndex: high,
          subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
        });

        // Si l'élément courant est plus petit que le pivot
        if (arr[j] < pivot) {
          i++;

          // Échanger arr[i] et arr[j]
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;

          steps.push({
            type: "quick",
            array: [...arr],
            activeIndices: [i, j],
            comparisons,
            swaps,
            message: `Échange des éléments aux indices ${i} (${arr[i]}) et ${j} (${arr[j]}).`,
            pivotIndex: high,
            subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
          });
        }
      }

      // Échanger arr[i+1] et arr[high] (placer le pivot à sa position finale)
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;

      steps.push({
        type: "quick",
        array: [...arr],
        activeIndices: [i + 1, high],
        comparisons,
        swaps,
        message: `Placement du pivot à sa position finale (indice ${i + 1}).`,
        pivotIndex: i + 1,
        subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
      });

      return i + 1;
    };

    // Fonction principale du tri rapide
    const quickSort = (arr: number[], low: number, high: number) => {
      if (low < high) {
        // Obtenir l'indice de partition
        const pi = partition(arr, low, high);

        // Trier les éléments avant et après la partition
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    };

    // Exécuter le tri rapide
    quickSort(arr, 0, arr.length - 1);

    // Étape finale
    steps.push({
      type: "quick",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
    });

    return steps;
  }, [array]);

  // Générer les étapes en fonction de l'onglet actif
  const generateSteps = useCallback(() => {
    switch (activeTab) {
      case "bubble":
        return generateBubbleSortSteps();
      case "merge":
        return generateMergeSortSteps();
      case "quick":
        return generateQuickSortSteps();
      default:
        return [];
    }
  }, [
    activeTab,
    generateBubbleSortSteps,
    generateMergeSortSteps,
    generateQuickSortSteps,
  ]);

  // Réinitialiser la visualisation
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [generateSteps]);

  // Passer à l'étape suivante
  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Revenir à l'étape précédente
  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Démarrer la lecture automatique
  const handlePlay = () => {
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
  };

  // Mettre en pause la lecture automatique
  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Initialiser le tableau et les étapes au chargement
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Mettre à jour les étapes lorsque le tableau ou l'onglet actif change
  useEffect(() => {
    handleReset();
  }, [array, activeTab, handleReset]);

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex] || {
    type: activeTab,
    array: [],
    activeIndices: [],
    comparisons: 0,
    swaps: 0,
    message: "",
  };

  // Calculer la hauteur maximale pour la visualisation
  const maxValue = Math.max(
    ...(currentStep.array.length > 0 ? currentStep.array : [1])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisation des Algorithmes de Tri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "bubble" | "merge" | "quick")
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bubble">
              Tri à Bulles
              <Badge variant="outline" className="ml-2">
                O(n²)
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="merge">
              Tri Fusion
              <Badge variant="outline" className="ml-2">
                O(n log n)
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quick">
              Tri Rapide
              <Badge variant="outline" className="ml-2">
                O(n log n)
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bubble" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              Le tri à bulles compare répétitivement les éléments adjacents et
              les échange s&apos;ils sont dans le mauvais ordre. Sa complexité
              est O(n²) dans le pire des cas, ce qui le rend inefficace pour les
              grands tableaux.
            </p>
          </TabsContent>

          <TabsContent value="merge" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              Le tri fusion divise le tableau en deux moitiés, trie chaque
              moitié, puis fusionne les résultats. Sa complexité est O(n log n)
              dans tous les cas, ce qui le rend efficace même pour les grands
              tableaux.
            </p>
          </TabsContent>

          <TabsContent value="quick" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              Le tri rapide choisit un élément pivot et partitionne le tableau
              autour de ce pivot. Sa complexité moyenne est O(n log n), mais
              peut atteindre O(n²) dans le pire des cas.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="array-size" className="text-sm font-medium">
                  Taille du tableau: {arraySize}
                </label>
                <Slider
                  id="array-size"
                  value={[arraySize]}
                  min={5}
                  max={30}
                  step={1}
                  onValueChange={(value) => setArraySize(value[0])}
                />
              </div>
              <Button variant="outline" size="sm" onClick={generateArray}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contrôles</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleStepBackward}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {isPlaying ? (
                  <Button variant="outline" size="icon" onClick={handlePause}>
                    <Pause className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlay}
                    disabled={currentStepIndex === steps.length - 1}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleStepForward}
                  disabled={currentStepIndex === steps.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <div className="flex-1">
                  <Slider
                    value={[speed]}
                    min={0.5}
                    max={3}
                    step={0.5}
                    onValueChange={(value) => setSpeed(value[0])}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12">
                  {speed}x
                </span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <ScrollArea className="h-[80px]">
                <p className="text-sm font-medium">{currentStep.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline">
                    Comparaisons: {currentStep.comparisons}
                  </Badge>
                  <Badge variant="outline">Échanges: {currentStep.swaps}</Badge>
                </div>
              </ScrollArea>

              {/* Indicateur de progression */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Étape {currentStepIndex + 1}</span>
                  <span>Total: {steps.length} étapes</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${
                        ((currentStepIndex + 1) / steps.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Complexité</h3>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2 text-sm pr-4">
                  <p>
                    <span className="font-medium">Temporelle (pire cas):</span>{" "}
                    {activeTab === "bubble"
                      ? "O(n²) - Chaque élément doit être comparé avec tous les autres."
                      : activeTab === "merge"
                      ? "O(n log n) - Division et fusion récursives."
                      : "O(n²) - Quand le pivot est toujours le plus petit ou le plus grand élément."}
                  </p>
                  <p>
                    <span className="font-medium">Temporelle (moyenne):</span>{" "}
                    {activeTab === "bubble"
                      ? "O(n²) - Même dans le cas moyen."
                      : activeTab === "merge"
                      ? "O(n log n) - Stable dans tous les cas."
                      : "O(n log n) - Quand les pivots divisent le tableau de manière équilibrée."}
                  </p>
                  <p>
                    <span className="font-medium">Spatiale:</span>{" "}
                    {activeTab === "bubble"
                      ? "O(1) - Utilise une quantité constante de mémoire."
                      : activeTab === "merge"
                      ? "O(n) - Nécessite de l'espace supplémentaire pour les tableaux temporaires."
                      : "O(log n) - Pour la pile d'appels récursifs."}
                  </p>
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4">
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="flex items-end justify-around h-[350px] gap-2">
                {currentStep.array.map((value, index) => {
                  // Déterminer la couleur de la barre avec une palette plus riche
                  let bgColor = "bg-slate-300";
                  let borderColor = "border-slate-400";
                  let textColor = "text-slate-700";
                  let glow = "";

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
                  // Élément pivot (pour le tri rapide)
                  else if (currentStep.pivotIndex === index) {
                    bgColor = "bg-yellow-500";
                    borderColor = "border-yellow-600";
                    textColor = "text-white font-medium";
                    glow = "shadow-md shadow-yellow-300/50";
                  }
                  // Éléments dans un sous-tableau (pour le tri fusion)
                  else if (
                    currentStep.subArrays?.some(
                      (subArray) =>
                        index >= subArray.start && index <= subArray.end
                    )
                  ) {
                    const subArray = currentStep.subArrays.find(
                      (subArray) =>
                        index >= subArray.start && index <= subArray.end
                    );

                    if (subArray?.color === "bg-blue-500/20") {
                      bgColor = "bg-blue-400";
                      borderColor = "border-blue-500";
                      textColor = "text-blue-900";
                    } else if (subArray?.color === "bg-green-500/20") {
                      bgColor = "bg-green-400";
                      borderColor = "border-green-500";
                      textColor = "text-green-900";
                    } else if (subArray?.color === "bg-purple-500/20") {
                      bgColor = "bg-purple-400";
                      borderColor = "border-purple-500";
                      textColor = "text-purple-900";
                    } else {
                      bgColor = subArray?.color || bgColor;
                    }
                  }
                  // Éléments triés (pour le tri à bulles)
                  else if (
                    activeTab === "bubble" &&
                    index >= array.length - currentStepIndex / 2
                  ) {
                    bgColor = "bg-green-400";
                    borderColor = "border-green-500";
                    textColor = "text-green-900";
                  }

                  // Calculer la hauteur de la barre
                  const height = (value / maxValue) * 100;

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-8 ${bgColor} ${glow} border ${borderColor} rounded-t transition-all duration-500 ease-in-out transform hover:scale-110`}
                        style={{ height: `${height}%` }}
                        title={`Valeur: ${value}${
                          currentStep.activeIndices.includes(index)
                            ? " (En cours de traitement)"
                            : currentStep.pivotIndex === index
                            ? " (Pivot)"
                            : ""
                        }`}
                      ></div>
                      <span className={`text-xs mt-1 ${textColor}`}>
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Caractéristiques</h3>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2 text-sm pr-4">
                  <p>
                    <span className="font-medium">Stabilité:</span>{" "}
                    {activeTab === "bubble"
                      ? "Stable - Préserve l'ordre relatif des éléments égaux."
                      : activeTab === "merge"
                      ? "Stable - Préserve l'ordre relatif des éléments égaux."
                      : "Non stable - Peut modifier l'ordre relatif des éléments égaux."}
                  </p>
                  <p>
                    <span className="font-medium">In-place:</span>{" "}
                    {activeTab === "bubble"
                      ? "Oui - Ne nécessite pas de mémoire supplémentaire."
                      : activeTab === "merge"
                      ? "Non - Nécessite O(n) d'espace supplémentaire."
                      : "Oui (version classique) - Nécessite O(log n) pour la pile d'appels."}
                  </p>
                  <p>
                    <span className="font-medium">Adaptatif:</span>{" "}
                    {activeTab === "bubble"
                      ? "Oui - Peut terminer plus tôt si le tableau est presque trié."
                      : activeTab === "merge"
                      ? "Non - Effectue toujours le même nombre d'opérations."
                      : "Non - Mais peut être optimisé pour être adaptatif."}
                  </p>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
