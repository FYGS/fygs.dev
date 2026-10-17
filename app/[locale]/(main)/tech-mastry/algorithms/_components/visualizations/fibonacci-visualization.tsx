"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import { DPVisualizationBase } from "./dp-visualization-base";

interface FibonacciStep {
  n: number;
  result?: number;
  callStack: number[];
  memo: Record<number, number>;
  fromCache?: boolean;
  table?: number[];
}

// Générer les étapes pour la mémoïsation
function generateMemoizationSteps(n: number): FibonacciStep[] {
  const steps: FibonacciStep[] = [];
  const memo: Record<number, number> = {};

  function fibWithSteps(n: number, callStack: number[] = []): number {
    // Ajouter l'appel à la pile
    const currentCallStack = [...callStack, n];

    // Vérifier si le résultat est déjà dans le mémo
    if (memo[n] !== undefined) {
      steps.push({
        n,
        result: memo[n],
        callStack: currentCallStack,
        memo: { ...memo },
        fromCache: true,
      });
      return memo[n];
    }

    // Cas de base
    if (n <= 1) {
      const result = n;
      memo[n] = result;
      steps.push({
        n,
        result,
        callStack: currentCallStack,
        memo: { ...memo },
      });
      return result;
    }

    // Ajouter une étape avant les appels récursifs
    steps.push({
      n,
      callStack: currentCallStack,
      memo: { ...memo },
    });

    // Appels récursifs
    const result1 = fibWithSteps(n - 1, currentCallStack);
    const result2 = fibWithSteps(n - 2, currentCallStack);

    // Calculer et mémoriser le résultat
    const result = result1 + result2;
    memo[n] = result;

    // Ajouter une étape avec le résultat
    steps.push({
      n,
      result,
      callStack: currentCallStack,
      memo: { ...memo },
    });

    return result;
  }

  fibWithSteps(n);
  return steps;
}

// Générer les étapes pour la tabulation
function generateTabulationSteps(n: number): FibonacciStep[] {
  const steps: FibonacciStep[] = [];
  const table = new Array(n + 1).fill(0);

  // Cas de base
  table[0] = 0;
  steps.push({
    n: 0,
    result: 0,
    callStack: [],
    memo: {},
    table: [...table],
  });

  if (n >= 1) {
    table[1] = 1;
    steps.push({
      n: 1,
      result: 1,
      callStack: [],
      memo: {},
      table: [...table],
    });
  }

  // Remplir la table
  for (let i = 2; i <= n; i++) {
    table[i] = table[i - 1] + table[i - 2];
    steps.push({
      n: i,
      result: table[i],
      callStack: [],
      memo: {},
      table: [...table],
    });
  }

  return steps;
}

// Générer les étapes en fonction de l'onglet actif
function generateSteps(n: number, activeTab: string): FibonacciStep[] {
  return activeTab === "memoization"
    ? generateMemoizationSteps(n)
    : generateTabulationSteps(n);
}

export function FibonacciVisualization() {
  const [n] = useState(5);
  const [activeTab, setActiveTab] = useState("memoization");
  const [steps, setSteps] = useState<FibonacciStep[]>(() => generateSteps(n, "memoization"));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Réinitialiser la visualisation pour un onglet donné
  const resetFor = (tab: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setSteps(generateSteps(n, tab));
    setCurrentStepIndex(0);
  };

  // Réinitialiser la visualisation
  const handleReset = () => resetFor(activeTab);

  // Changer d'onglet réinitialise la visualisation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetFor(tab);
  };

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

  // Mettre à jour la vitesse de lecture
  const handleSpeedChange = (value: number) => {
    setSpeed(value);

    if (isPlaying) {
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
      }, 1000 / value);
    }
  };

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
    n: 0,
    callStack: [],
    memo: {},
    table: [],
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="memoization">Mémoïsation (Top-Down)</TabsTrigger>
        <TabsTrigger value="tabulation">Tabulation (Bottom-Up)</TabsTrigger>
      </TabsList>

      <TabsContent value="memoization" className="mt-0">
        <DPVisualizationBase
          title="Visualisation de Fibonacci avec Mémoïsation"
          description="Calcul du n-ième nombre de Fibonacci en utilisant la mémoïsation (approche top-down)."
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onPlay={handlePlay}
          onPause={handlePause}
          isPlaying={isPlaying}
          currentStep={currentStepIndex}
          totalSteps={steps.length - 1}
          speed={speed}
          onSpeedChange={handleSpeedChange}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Arbre de récursion</h4>
                <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg p-4 min-h-[200px] overflow-auto hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                  <RecursionTree
                    n={n}
                    callStack={currentStep.callStack}
                    memo={currentStep.memo}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Pile d&apos;appels</h4>
                <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg p-4 min-h-[100px] flex flex-col-reverse hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                  {currentStep.callStack.map((call, index) => (
                    <div
                      key={index}
                      className={`py-1 px-3 rounded mb-1 text-sm transition-all duration-300 ${
                        index === currentStep.callStack.length - 1
                          ? "bg-linear-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-xs transform translate-x-1"
                          : "bg-background/60 border border-border hover:border-indigo-500/20 hover:bg-indigo-500/5"
                      }`}
                    >
                      fib({call})
                      {index === currentStep.callStack.length - 1 &&
                        currentStep.result !== undefined && (
                          <span className="ml-2">→ {currentStep.result}</span>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Table de mémoïsation
                </h4>
                <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg p-4 min-h-[200px] hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentStep.memo).map(([key, value]) => (
                      <div
                        key={key}
                        className={`flex justify-between items-center p-2 rounded border transition-all duration-300 ${
                          parseInt(key) === currentStep.n &&
                          !currentStep.fromCache
                            ? "border-indigo-500/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 shadow-xs"
                            : currentStep.fromCache &&
                              parseInt(key) === currentStep.n
                            ? "border-emerald-500/50 bg-linear-to-r from-emerald-500/10 to-teal-500/10 shadow-xs"
                            : "border-border hover:border-indigo-500/30 hover:bg-indigo-500/5"
                        }`}
                      >
                        <span>fib({key})</span>
                        <Badge
                          variant="outline"
                          className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300"
                        >
                          {value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {Object.keys(currentStep.memo).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      La table de mémoïsation est vide
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Explication</h4>
                <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg p-4 min-h-[100px] hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                  {currentStep.result !== undefined ? (
                    currentStep.fromCache ? (
                      <p>
                        La valeur de fib({currentStep.n}) = {currentStep.result}{" "}
                        a été récupérée depuis la table de mémoïsation, évitant
                        ainsi un calcul redondant.
                      </p>
                    ) : currentStep.n <= 1 ? (
                      <p>
                        Cas de base : fib({currentStep.n}) ={" "}
                        {currentStep.result}
                      </p>
                    ) : (
                      <p>
                        Calcul de fib({currentStep.n}) = fib({currentStep.n - 1}
                        ) + fib({currentStep.n - 2}) ={" "}
                        {currentStep.memo[currentStep.n - 1]} +{" "}
                        {currentStep.memo[currentStep.n - 2]} ={" "}
                        {currentStep.result}
                      </p>
                    )
                  ) : (
                    <p>
                      Appel de la fonction fib({currentStep.n})
                      {currentStep.n > 1 && (
                        <>
                          {" "}
                          qui va calculer fib({currentStep.n - 1}) + fib(
                          {currentStep.n - 2})
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DPVisualizationBase>
      </TabsContent>

      <TabsContent value="tabulation" className="mt-0">
        <DPVisualizationBase
          title="Visualisation de Fibonacci avec Tabulation"
          description="Calcul du n-ième nombre de Fibonacci en utilisant la tabulation (approche bottom-up)."
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onPlay={handlePlay}
          onPause={handlePause}
          isPlaying={isPlaying}
          currentStep={currentStepIndex}
          totalSteps={steps.length - 1}
          speed={speed}
          onSpeedChange={handleSpeedChange}
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Table de tabulation</h4>
              <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                <ScrollArea className="h-[200px]">
                  <div
                    className="p-4 overflow-x-auto"
                    style={{ minWidth: "100%", width: "max-content" }}
                  >
                    <div className="flex">
                      {currentStep.table?.map((value, index) => (
                        <div
                          key={index}
                          className={`flex flex-col items-center min-w-[60px] transition-all duration-300 ${
                            index === currentStep.n
                              ? "text-indigo-500 font-medium transform scale-105"
                              : index < currentStep.n
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            fib({index})
                          </div>
                          <div
                            className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-all duration-300 ${
                              index === currentStep.n
                                ? "border-indigo-500/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 shadow-xs transform scale-110"
                                : index < currentStep.n
                                ? "border-indigo-500/20 bg-linear-to-r from-indigo-500/5 to-purple-500/5"
                                : "border-dashed border-border/50 hover:border-indigo-500/20"
                            }`}
                          >
                            {index <= currentStep.n ? value : "?"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Explication</h4>
              <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg p-4 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                {currentStep.n <= 1 ? (
                  <p>
                    Initialisation : fib({currentStep.n}) = {currentStep.result}
                  </p>
                ) : (
                  <p>
                    Calcul de fib({currentStep.n}) = fib({currentStep.n - 1}) +
                    fib({currentStep.n - 2}) ={" "}
                    {currentStep.table?.[currentStep.n - 1]} +{" "}
                    {currentStep.table?.[currentStep.n - 2]} ={" "}
                    {currentStep.result}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                Comparaison avec la mémoïsation
              </h4>
              <div className="bg-background/60 backdrop-blur-xs border border-indigo-500/20 rounded-lg p-4 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                <p>
                  La tabulation (bottom-up) calcule les valeurs de Fibonacci de
                  manière itérative, en commençant par les cas de base (0 et 1)
                  et en construisant progressivement la solution. Contrairement
                  à la mémoïsation (top-down), elle n&apos;utilise pas de
                  récursion et évite donc les problèmes de dépassement de pile
                  pour les grandes valeurs de n.
                </p>
              </div>
            </div>
          </div>
        </DPVisualizationBase>
      </TabsContent>
    </Tabs>
  );
}

// Composant pour afficher l'arbre de récursion
function RecursionTree({
  n,
  callStack,
  memo,
}: {
  n: number;
  callStack: number[];
  memo: Record<number, number>;
}) {
  // Fonction récursive pour générer l'arbre
  const renderNode = (
    value: number,
    depth: number = 0,
    maxDepth: number = 3
  ) => {
    if (depth >= maxDepth) {
      return (
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all duration-300 transform ${
              callStack.includes(value)
                ? "bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-md shadow-indigo-500/10 scale-110"
                : memo[value] !== undefined
                ? "bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
                : "bg-background/80 border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5"
            }`}
          >
            {value}
          </div>
          {depth === maxDepth && value > 1 && (
            <div className="text-xs text-muted-foreground mt-1">...</div>
          )}
        </div>
      );
    }

    if (value <= 1) {
      return (
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all duration-300 transform ${
              callStack.includes(value)
                ? "bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-md shadow-indigo-500/10 scale-110"
                : memo[value] !== undefined
                ? "bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
                : "bg-background/80 border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5"
            }`}
          >
            {value}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all duration-300 transform ${
            callStack.includes(value)
              ? "bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-md shadow-indigo-500/10 scale-110"
              : memo[value] !== undefined
              ? "bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
              : "bg-background/80 border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5"
          }`}
        >
          {value}
          {memo[value] !== undefined && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-linear-to-br from-emerald-500 to-teal-500 rounded-full text-[10px] text-white flex items-center justify-center shadow-xs animate-pulse">
              ✓
            </span>
          )}
        </div>
        <div className="h-4 w-px bg-linear-to-b from-indigo-500/30 to-purple-500/30"></div>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-6 border-t border-l border-indigo-500/30 h-6 rounded-tl-md transition-colors duration-300"></div>
            {renderNode(value - 1, depth + 1, maxDepth)}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 border-t border-r border-purple-500/30 h-6 rounded-tr-md transition-colors duration-300"></div>
            {renderNode(value - 2, depth + 1, maxDepth)}
          </div>
        </div>
      </div>
    );
  };

  return <div className="flex justify-center py-4">{renderNode(n)}</div>;
}
