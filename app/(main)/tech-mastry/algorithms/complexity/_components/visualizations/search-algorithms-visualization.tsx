"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface SearchStep {
  type: "linear" | "binary";
  array: number[];
  target: number;
  currentIndex?: number;
  left?: number;
  right?: number;
  middle?: number;
  found?: boolean;
  comparisons: number;
  message: string;
}

export function SearchAlgorithmsVisualization() {
  const [arraySize, setArraySize] = useState(15);
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"linear" | "binary">("linear");
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un tableau trié de nombres aléatoires
  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 100)
    ).sort((a, b) => a - b);

    setArray(newArray);

    // Choisir une valeur cible (75% de chance d'être dans le tableau)
    if (Math.random() < 0.75 && newArray.length > 0) {
      setTarget(newArray[Math.floor(Math.random() * newArray.length)]);
    } else {
      // Valeur qui n'est pas dans le tableau
      let newTarget;
      do {
        newTarget = Math.floor(Math.random() * 100);
      } while (newArray.includes(newTarget));
      setTarget(newTarget);
    }
  }, [arraySize]);

  // Générer les étapes pour la recherche linéaire
  const generateLinearSearchSteps = useCallback(() => {
    const steps: SearchStep[] = [];

    // Étape initiale
    steps.push({
      type: "linear",
      array: [...array],
      target,
      comparisons: 0,
      message: `Recherche de la valeur ${target} dans le tableau.`,
    });

    // Simuler la recherche linéaire
    for (let i = 0; i < array.length; i++) {
      const found = array[i] === target;

      steps.push({
        type: "linear",
        array: [...array],
        target,
        currentIndex: i,
        comparisons: i + 1,
        found,
        message: found
          ? `Valeur ${target} trouvée à l'index ${i} après ${
              i + 1
            } comparaisons.`
          : `Comparaison avec l'élément à l'index ${i}: ${array[i]} ${
              found ? "=" : "≠"
            } ${target}`,
      });

      if (found) break;
    }

    // Si la valeur n'a pas été trouvée
    if (!steps[steps.length - 1].found) {
      steps.push({
        type: "linear",
        array: [...array],
        target,
        comparisons: array.length,
        message: `Valeur ${target} non trouvée après ${array.length} comparaisons.`,
      });
    }

    return steps;
  }, [array, target]);

  // Générer les étapes pour la recherche binaire
  const generateBinarySearchSteps = useCallback(() => {
    const steps: SearchStep[] = [];

    // Étape initiale
    steps.push({
      type: "binary",
      array: [...array],
      target,
      left: 0,
      right: array.length - 1,
      comparisons: 0,
      message: `Recherche de la valeur ${target} dans le tableau trié.`,
    });

    // Simuler la recherche binaire
    let left = 0;
    let right = array.length - 1;
    let comparisons = 0;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      comparisons++;

      const found = array[middle] === target;

      steps.push({
        type: "binary",
        array: [...array],
        target,
        left,
        right,
        middle,
        comparisons,
        found,
        message: found
          ? `Valeur ${target} trouvée à l'index ${middle} après ${comparisons} comparaisons.`
          : `Comparaison avec l'élément au milieu (index ${middle}): ${
              array[middle]
            } ${array[middle] < target ? "<" : ">"} ${target}`,
      });

      if (found) break;

      if (array[middle] < target) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }

    // Si la valeur n'a pas été trouvée
    if (!steps[steps.length - 1].found) {
      steps.push({
        type: "binary",
        array: [...array],
        target,
        left,
        right,
        comparisons,
        message: `Valeur ${target} non trouvée après ${comparisons} comparaisons.`,
      });
    }

    return steps;
  }, [array, target]);

  // Générer les étapes en fonction de l'onglet actif
  const generateSteps = useCallback(() => {
    return activeTab === "linear"
      ? generateLinearSearchSteps()
      : generateBinarySearchSteps();
  }, [activeTab, generateLinearSearchSteps, generateBinarySearchSteps]);

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

  // Mettre à jour les étapes lorsque le tableau, la cible ou l'onglet actif change
  useEffect(() => {
    handleReset();
  }, [array, target, activeTab, handleReset]);

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
    target: 0,
    comparisons: 0,
    message: "",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisation des Algorithmes de Recherche</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "linear" | "binary")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linear">
              Recherche Linéaire
              <Badge variant="outline" className="ml-2">
                O(n)
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="binary">
              Recherche Binaire
              <Badge variant="outline" className="ml-2">
                O(log n)
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linear" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              La recherche linéaire parcourt séquentiellement chaque élément du
              tableau jusqu&apos;à trouver la valeur cible. Sa complexité est
              O(n) car dans le pire des cas, elle doit examiner tous les
              éléments.
            </p>
          </TabsContent>

          <TabsContent value="binary" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              La recherche binaire divise répétitivement le tableau en deux
              moitiés et ne conserve que la moitié où la valeur cible pourrait
              se trouver. Sa complexité est O(log n), mais elle nécessite un
              tableau trié.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="array-size">Taille du tableau</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="array-size"
                    value={[arraySize]}
                    min={5}
                    max={30}
                    step={1}
                    onValueChange={(value) => setArraySize(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{arraySize}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={generateArray}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </div>

            <div>
              <Label htmlFor="target-value">Valeur cible</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="target-value"
                  type="number"
                  min={0}
                  max={99}
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                />
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Rechercher
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contrôles</Label>
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
                  {currentStep.found && (
                    <Badge variant="default" className="bg-green-500">
                      Trouvé!
                    </Badge>
                  )}
                  {currentStepIndex === steps.length - 1 &&
                    !currentStep.found && (
                      <Badge variant="default" className="bg-red-500">
                        Non trouvé
                      </Badge>
                    )}
                </div>

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
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 min-h-[300px] flex flex-col">
              <div className="flex flex-wrap gap-2 mb-4">
                {currentStep.array.map((value, index) => {
                  let bgColor = "bg-muted";
                  let textColor = "text-foreground";
                  let border = "border-border";

                  if (currentStep.type === "linear") {
                    if (index === currentStep.currentIndex) {
                      bgColor = "bg-primary/20";
                      border = "border-primary";
                    } else if (index < (currentStep.currentIndex || 0)) {
                      bgColor = "bg-muted/50";
                    }

                    if (
                      currentStep.found &&
                      index === currentStep.currentIndex
                    ) {
                      bgColor = "bg-green-500/20";
                      border = "border-green-500";
                    }
                  } else if (currentStep.type === "binary") {
                    if (index === currentStep.middle) {
                      bgColor = "bg-primary/20";
                      border = "border-primary";
                    } else if (
                      currentStep.left !== undefined &&
                      currentStep.right !== undefined &&
                      index >= currentStep.left &&
                      index <= currentStep.right
                    ) {
                      bgColor = "bg-muted/50";
                    } else {
                      textColor = "text-muted-foreground";
                    }

                    if (currentStep.found && index === currentStep.middle) {
                      bgColor = "bg-green-500/20";
                      border = "border-green-500";
                    }
                  }

                  return (
                    <div
                      key={index}
                      className={`w-10 h-10 flex items-center justify-center rounded border ${bgColor} ${textColor} ${border}`}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto">
                {currentStep.type === "binary" && (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 border rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                          Gauche
                        </div>
                        <div>
                          {currentStep.left !== undefined
                            ? currentStep.left
                            : "-"}
                        </div>
                      </div>
                      <div className="p-2 border rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                          Milieu
                        </div>
                        <div>
                          {currentStep.middle !== undefined
                            ? currentStep.middle
                            : "-"}
                        </div>
                      </div>
                      <div className="p-2 border rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                          Droite
                        </div>
                        <div>
                          {currentStep.right !== undefined
                            ? currentStep.right
                            : "-"}
                        </div>
                      </div>
                    </div>

                    {currentStep.middle !== undefined && (
                      <div className="p-2 border rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                          Comparaison
                        </div>
                        <div className="font-mono">
                          {currentStep.array[currentStep.middle]}
                          {currentStep.found
                            ? " = "
                            : currentStep.array[currentStep.middle] <
                              currentStep.target
                            ? " < "
                            : " > "}
                          {currentStep.target}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Complexité</h3>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2 text-sm pr-4">
                  <p>
                    <span className="font-medium">Temporelle:</span>{" "}
                    {currentStep.type === "linear"
                      ? "O(n) - Dans le pire des cas, tous les éléments sont examinés."
                      : "O(log n) - À chaque étape, la taille du problème est divisée par 2."}
                  </p>
                  <p>
                    <span className="font-medium">Spatiale:</span>{" "}
                    {currentStep.type === "linear"
                      ? "O(1) - Utilise une quantité constante de mémoire."
                      : "O(1) - Utilise une quantité constante de mémoire."}
                  </p>
                  <p>
                    <span className="font-medium">Avantages:</span>{" "}
                    {currentStep.type === "linear"
                      ? "Simple, fonctionne sur des tableaux non triés."
                      : "Très efficace pour les grands tableaux triés."}
                  </p>
                  <p>
                    <span className="font-medium">Inconvénients:</span>{" "}
                    {currentStep.type === "linear"
                      ? "Inefficace pour les grands tableaux."
                      : "Nécessite un tableau trié."}
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
