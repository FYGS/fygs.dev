"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useRef, useState } from "react";
import { DPVisualizationBase } from "./dp-visualization-base";

interface Item {
  id: number;
  value: number;
  weight: number;
}

interface KnapsackStep {
  i: number;
  w: number;
  result?: number;
  decision?: "take" | "leave";
  items: Item[];
  capacity: number;
  table: number[][];
  selectedItems?: number[];
}

export function KnapsackVisualization() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, value: 60, weight: 10 },
    { id: 2, value: 100, weight: 20 },
    { id: 3, value: 120, weight: 30 },
  ]);
  const [capacity, setCapacity] = useState(50);
  const [steps, setSteps] = useState<KnapsackStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Générer les étapes pour la résolution du problème du sac à dos
  const generateSteps = useCallback(() => {
    const steps: KnapsackStep[] = [];
    const n = items.length;
    
    // Initialiser la table DP
    const dp: number[][] = Array(n + 1)
      .fill(0)
      .map(() => Array(capacity + 1).fill(0));
    
    // Étape initiale
    steps.push({
      i: 0,
      w: 0,
      items: [...items],
      capacity,
      table: dp.map(row => [...row]),
    });
    
    // Remplir la table DP
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const currentItem = items[i - 1];
        
        if (currentItem.weight <= w) {
          // On peut prendre l'objet
          const takeValue = currentItem.value + dp[i - 1][w - currentItem.weight];
          const leaveValue = dp[i - 1][w];
          
          if (takeValue > leaveValue) {
            dp[i][w] = takeValue;
            steps.push({
              i,
              w,
              result: takeValue,
              decision: "take",
              items: [...items],
              capacity,
              table: dp.map(row => [...row]),
            });
          } else {
            dp[i][w] = leaveValue;
            steps.push({
              i,
              w,
              result: leaveValue,
              decision: "leave",
              items: [...items],
              capacity,
              table: dp.map(row => [...row]),
            });
          }
        } else {
          // On ne peut pas prendre l'objet
          dp[i][w] = dp[i - 1][w];
          steps.push({
            i,
            w,
            result: dp[i - 1][w],
            decision: "leave",
            items: [...items],
            capacity,
            table: dp.map(row => [...row]),
          });
        }
      }
    }
    
    // Ajouter une étape finale avec les objets sélectionnés
    const selectedItems: number[] = [];
    let remainingCapacity = capacity;
    let i = n;
    
    while (i > 0 && remainingCapacity > 0) {
      if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
        // L'objet i a été inclus
        selectedItems.push(items[i - 1].id);
        remainingCapacity -= items[i - 1].weight;
      }
      i--;
    }
    
    steps.push({
      i: n,
      w: capacity,
      result: dp[n][capacity],
      items: [...items],
      capacity,
      table: dp.map(row => [...row]),
      selectedItems,
    });
    
    return steps;
  }, [items, capacity]);
  
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
  
  // Ajouter un nouvel objet
  const handleAddItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, value: 50, weight: 10 }]);
  };
  
  // Supprimer un objet
  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Mettre à jour la valeur d'un objet
  const handleUpdateItemValue = (id: number, value: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };
  
  // Mettre à jour le poids d'un objet
  const handleUpdateItemWeight = (id: number, weight: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, weight } : item
    ));
  };
  
  // Mettre à jour les étapes lorsque les objets ou la capacité changent
  useEffect(() => {
    handleReset();
  }, [handleReset]);
  
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
    i: 0,
    w: 0,
    items: [],
    capacity: 0,
    table: [[0]],
  };
  
  return (
    <DPVisualizationBase
      title="Visualisation du Problème du Sac à Dos (Knapsack)"
      description="Résolution du problème du sac à dos en utilisant la programmation dynamique pour maximiser la valeur des objets sélectionnés."
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Configuration du problème</h4>
            <div className="flex items-center gap-2">
              <Label htmlFor="capacity" className="text-sm">
                Capacité:
              </Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-medium">Objets disponibles</h5>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={items.length >= 5}
              >
                Ajouter un objet
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    currentStep.selectedItems?.includes(item.id)
                      ? "border-green-500 bg-green-500/10"
                      : currentStep.i > 0 && item.id === currentStep.items[currentStep.i - 1]?.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {item.id}
                  </div>
                  
                  <div className="grow grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`value-${item.id}`} className="text-xs">
                        Valeur
                      </Label>
                      <Input
                        id={`value-${item.id}`}
                        type="number"
                        min={1}
                        value={item.value}
                        onChange={(e) =>
                          handleUpdateItemValue(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`weight-${item.id}`} className="text-xs">
                        Poids
                      </Label>
                      <Input
                        id={`weight-${item.id}`}
                        type="number"
                        min={1}
                        value={item.weight}
                        onChange={(e) =>
                          handleUpdateItemWeight(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length <= 1}
                    className="shrink-0 h-8 w-8"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Visualisation du sac à dos</h4>
            <div className="bg-muted/30 rounded-lg p-4 min-h-[200px]">
              <div className="flex flex-col items-center">
                <div className="text-sm mb-2">
                  Capacité: {capacity} | Utilisé:{" "}
                  {currentStep.selectedItems
                    ? currentStep.selectedItems.reduce((acc, id) => {
                        const item = items.find((item) => item.id === id);
                        return acc + (item ? item.weight : 0);
                      }, 0)
                    : 0}
                </div>
                
                <div className="w-full h-20 border border-dashed border-border rounded-lg mb-4 relative">
                  {/* Barre de progression pour la capacité utilisée */}
                  <div
                    className="absolute top-0 left-0 h-full bg-primary/20 transition-all duration-300"
                    style={{
                      width: `${
                        ((currentStep.selectedItems
                          ? currentStep.selectedItems.reduce((acc, id) => {
                              const item = items.find((item) => item.id === id);
                              return acc + (item ? item.weight : 0);
                            }, 0)
                          : 0) /
                          capacity) *
                        100
                      }%`,
                    }}
                  ></div>
                  
                  {/* Objets sélectionnés */}
                  <div className="absolute top-0 left-0 h-full w-full p-2 flex items-center gap-2 overflow-x-auto">
                    {currentStep.selectedItems?.map((id) => {
                      const item = items.find((item) => item.id === id);
                      return (
                        item && (
                          <div
                            key={id}
                            className="shrink-0 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                          >
                            Objet {id} (V:{item.value}, P:{item.weight})
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-sm">
                  Valeur totale:{" "}
                  {currentStep.selectedItems
                    ? currentStep.selectedItems.reduce((acc, id) => {
                        const item = items.find((item) => item.id === id);
                        return acc + (item ? item.value : 0);
                      }, 0)
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Table de programmation dynamique</h4>
            <div className="bg-muted/30 rounded-lg">
              <ScrollArea className="h-[300px]">
                <div className="p-4 overflow-x-auto" style={{ minWidth: "100%", width: "max-content" }}>
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border border-border bg-muted/50 text-xs">
                          i\w
                        </th>
                        {Array.from({ length: capacity + 1 }).map((_, w) => (
                          <th
                            key={w}
                            className={`p-2 border border-border text-xs ${
                              w === currentStep.w
                                ? "bg-primary/20"
                                : "bg-muted/50"
                            }`}
                          >
                            {w}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentStep.table.map((row, i) => (
                        <tr key={i}>
                          <td
                            className={`p-2 border border-border bg-muted/50 text-xs ${
                              i === currentStep.i ? "font-medium" : ""
                            }`}
                          >
                            {i}
                            {i > 0 && (
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                (Obj {items[i - 1]?.id})
                              </span>
                            )}
                          </td>
                          {row.map((value, w) => (
                            <td
                              key={w}
                              className={`p-2 border border-border text-center ${
                                i === currentStep.i && w === currentStep.w
                                  ? "bg-primary/20 font-medium"
                                  : i <= currentStep.i && w <= capacity
                                  ? "bg-muted/20"
                                  : ""
                              }`}
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Explication</h4>
            <div className="bg-muted/30 rounded-lg p-4 min-h-[100px]">
              {currentStep.i === 0 ? (
                <p>
                  Initialisation de la table DP. La première ligne (i=0)
                  représente le cas où aucun objet n&apos;est disponible, donc
                  la valeur maximale est 0 pour toutes les capacités.
                </p>
              ) : currentStep.selectedItems ? (
                <p>
                  Solution finale : La valeur maximale que nous pouvons obtenir
                  est <strong>{currentStep.result}</strong> en sélectionnant les
                  objets{" "}
                  {currentStep.selectedItems.map((id) => `#${id}`).join(", ")}.
                </p>
              ) : (
                <p>
                  Calcul de DP[{currentStep.i}][{currentStep.w}] :{" "}
                  {currentStep.decision === "take" ? (
                    <>
                      Nous prenons l&apos;objet #{items[currentStep.i - 1]?.id}{" "}
                      (valeur: {items[currentStep.i - 1]?.value}, poids:{" "}
                      {items[currentStep.i - 1]?.weight}) car cela donne une
                      valeur totale plus élevée.
                      <br />
                      DP[{currentStep.i}][{currentStep.w}] = DP[
                      {currentStep.i - 1}][
                      {currentStep.w - items[currentStep.i - 1]?.weight}] +{" "}
                      {items[currentStep.i - 1]?.value} ={" "}
                      {currentStep.table[currentStep.i - 1][
                        currentStep.w - items[currentStep.i - 1]?.weight
                      ] || 0}{" "}
                      + {items[currentStep.i - 1]?.value} = {currentStep.result}
                    </>
                  ) : (
                    <>
                      Nous ne prenons pas l&apos;objet #
                      {items[currentStep.i - 1]?.id}{" "}
                      {items[currentStep.i - 1]?.weight > currentStep.w
                        ? `car son poids (${
                            items[currentStep.i - 1]?.weight
                          }) dépasse la capacité restante (${currentStep.w}).`
                        : "car cela ne donne pas une valeur totale plus élevée."}
                      <br />
                      DP[{currentStep.i}][{currentStep.w}] = DP[
                      {currentStep.i - 1}][
                      {currentStep.w}] = {currentStep.result}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DPVisualizationBase>
  );
}
