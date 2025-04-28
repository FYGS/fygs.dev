"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "./visualization-container";

// Types d'opérations
type OperationType =
  | "access"
  | "search"
  | "insertEnd"
  | "insertStart"
  | "insertAt"
  | "removeEnd"
  | "removeStart"
  | "removeAt";

// Interface pour une étape de visualisation
interface ArrayStep {
  array: number[];
  activeIndices: number[];
  message: string;
  operation: OperationType;
  operationCount: number;
  targetValue?: number;
  targetIndex?: number;
  found?: boolean;
  completed?: boolean;
}

export function ArrayVisualization() {
  // État pour le tableau
  const [array, setArray] = useState<number[]>([]);

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<ArrayStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [value, setValue] = useState<string>("");
  const [index, setIndex] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("access");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser le tableau
  useEffect(() => {
    generateRandomArray();
  }, []);

  // Générer un tableau aléatoire
  const generateRandomArray = () => {
    const size = 8;
    const newArray = Array.from({ length: size }, () =>
      Math.floor(Math.random() * 100)
    );
    setArray(newArray);

    // Réinitialiser les étapes
    const initialStep: ArrayStep = {
      array: [...newArray],
      activeIndices: [],
      message: "Tableau initial",
      operation: "access",
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Générer les étapes pour l'opération d'accès
  const generateAccessSteps = useCallback(
    (arr: number[], targetIndex: number) => {
      const steps: ArrayStep[] = [];

      // Étape initiale
      steps.push({
        array: [...arr],
        activeIndices: [],
        message: `Accès à l'élément à l'index ${targetIndex}`,
        operation: "access",
        operationCount: 0,
      });

      // Étape d'accès
      if (targetIndex >= 0 && targetIndex < arr.length) {
        steps.push({
          array: [...arr],
          activeIndices: [targetIndex],
          message: `Élément trouvé: ${arr[targetIndex]} à l'index ${targetIndex}`,
          operation: "access",
          operationCount: 1,
          targetIndex,
          completed: true,
        });
      } else {
        steps.push({
          array: [...arr],
          activeIndices: [],
          message: `Index ${targetIndex} hors limites (0-${arr.length - 1})`,
          operation: "access",
          operationCount: 1,
          targetIndex,
          completed: true,
        });
      }

      return steps;
    },
    []
  );

  // Générer les étapes pour l'opération de recherche
  const generateSearchSteps = useCallback(
    (arr: number[], targetValue: number) => {
      const steps: ArrayStep[] = [];

      // Étape initiale
      steps.push({
        array: [...arr],
        activeIndices: [],
        message: `Recherche de la valeur ${targetValue} dans le tableau`,
        operation: "search",
        operationCount: 0,
        targetValue,
      });

      // Simuler la recherche linéaire
      let found = false;
      let foundIndex = -1;

      for (let i = 0; i < arr.length; i++) {
        steps.push({
          array: [...arr],
          activeIndices: [i],
          message: `Comparaison avec l'élément à l'index ${i}: ${arr[i]}`,
          operation: "search",
          operationCount: i + 1,
          targetValue,
        });

        if (arr[i] === targetValue) {
          found = true;
          foundIndex = i;
          break;
        }
      }

      // Étape finale
      steps.push({
        array: [...arr],
        activeIndices: found ? [foundIndex] : [],
        message: found
          ? `Valeur ${targetValue} trouvée à l'index ${foundIndex} après ${
              foundIndex + 1
            } comparaisons`
          : `Valeur ${targetValue} non trouvée après ${arr.length} comparaisons`,
        operation: "search",
        operationCount: found ? foundIndex + 1 : arr.length,
        targetValue,
        found,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour l'insertion à la fin
  const generateInsertEndSteps = useCallback((arr: number[], value: number) => {
    const steps: ArrayStep[] = [];

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      message: `Insertion de la valeur ${value} à la fin du tableau`,
      operation: "insertEnd",
      operationCount: 0,
    });

    // Étape d'insertion
    const newArray = [...arr, value];
    steps.push({
      array: [...newArray],
      activeIndices: [newArray.length - 1],
      message: `Valeur ${value} insérée à l'index ${newArray.length - 1}`,
      operation: "insertEnd",
      operationCount: 1,
      completed: true,
    });

    return steps;
  }, []);

  // Générer les étapes pour l'insertion au début
  const generateInsertStartSteps = useCallback(
    (arr: number[], value: number) => {
      const steps: ArrayStep[] = [];

      // Étape initiale
      steps.push({
        array: [...arr],
        activeIndices: [],
        message: `Insertion de la valeur ${value} au début du tableau`,
        operation: "insertStart",
        operationCount: 0,
      });

      // Étape de décalage
      steps.push({
        array: [...arr],
        activeIndices: Array.from({ length: arr.length }, (_, i) => i),
        message: `Décalage de tous les éléments vers la droite`,
        operation: "insertStart",
        operationCount: arr.length,
      });

      // Étape d'insertion
      const newArray = [value, ...arr];
      steps.push({
        array: [...newArray],
        activeIndices: [0],
        message: `Valeur ${value} insérée à l'index 0`,
        operation: "insertStart",
        operationCount: arr.length + 1,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour l'insertion à un index spécifique
  const generateInsertAtSteps = useCallback(
    (arr: number[], value: number, targetIndex: number) => {
      const steps: ArrayStep[] = [];

      // Étape initiale
      steps.push({
        array: [...arr],
        activeIndices: [],
        message: `Insertion de la valeur ${value} à l'index ${targetIndex}`,
        operation: "insertAt",
        operationCount: 0,
      });

      // Vérifier si l'index est valide
      if (targetIndex < 0 || targetIndex > arr.length) {
        steps.push({
          array: [...arr],
          activeIndices: [],
          message: `Index ${targetIndex} invalide (doit être entre 0 et ${arr.length})`,
          operation: "insertAt",
          operationCount: 1,
          completed: true,
        });
        return steps;
      }

      // Étape de décalage
      if (targetIndex < arr.length) {
        steps.push({
          array: [...arr],
          activeIndices: Array.from(
            { length: arr.length - targetIndex },
            (_, i) => i + targetIndex
          ),
          message: `Décalage des éléments à partir de l'index ${targetIndex} vers la droite`,
          operation: "insertAt",
          operationCount: arr.length - targetIndex,
        });
      }

      // Étape d'insertion
      const newArray = [
        ...arr.slice(0, targetIndex),
        value,
        ...arr.slice(targetIndex),
      ];
      steps.push({
        array: [...newArray],
        activeIndices: [targetIndex],
        message: `Valeur ${value} insérée à l'index ${targetIndex}`,
        operation: "insertAt",
        operationCount: arr.length - targetIndex + 1,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour la suppression à la fin
  const generateRemoveEndSteps = useCallback((arr: number[]) => {
    const steps: ArrayStep[] = [];

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      message: `Suppression de l'élément à la fin du tableau`,
      operation: "removeEnd",
      operationCount: 0,
    });

    // Vérifier si le tableau est vide
    if (arr.length === 0) {
      steps.push({
        array: [],
        activeIndices: [],
        message: `Le tableau est vide, aucun élément à supprimer`,
        operation: "removeEnd",
        operationCount: 1,
        completed: true,
      });
      return steps;
    }

    // Étape de suppression
    const removedValue = arr[arr.length - 1];
    steps.push({
      array: [...arr],
      activeIndices: [arr.length - 1],
      message: `Suppression de la valeur ${removedValue} à l'index ${
        arr.length - 1
      }`,
      operation: "removeEnd",
      operationCount: 1,
    });

    const newArray = arr.slice(0, -1);
    steps.push({
      array: [...newArray],
      activeIndices: [],
      message: `Valeur ${removedValue} supprimée`,
      operation: "removeEnd",
      operationCount: 1,
      completed: true,
    });

    return steps;
  }, []);

  // Générer les étapes pour la suppression au début
  const generateRemoveStartSteps = useCallback((arr: number[]) => {
    const steps: ArrayStep[] = [];

    // Étape initiale
    steps.push({
      array: [...arr],
      activeIndices: [],
      message: `Suppression de l'élément au début du tableau`,
      operation: "removeStart",
      operationCount: 0,
    });

    // Vérifier si le tableau est vide
    if (arr.length === 0) {
      steps.push({
        array: [],
        activeIndices: [],
        message: `Le tableau est vide, aucun élément à supprimer`,
        operation: "removeStart",
        operationCount: 1,
        completed: true,
      });
      return steps;
    }

    // Étape de suppression
    const removedValue = arr[0];
    steps.push({
      array: [...arr],
      activeIndices: [0],
      message: `Suppression de la valeur ${removedValue} à l'index 0`,
      operation: "removeStart",
      operationCount: 1,
    });

    // Étape de décalage
    if (arr.length > 1) {
      steps.push({
        array: [...arr.slice(1)],
        activeIndices: Array.from({ length: arr.length - 1 }, (_, i) => i),
        message: `Décalage de tous les éléments vers la gauche`,
        operation: "removeStart",
        operationCount: arr.length,
      });
    }

    const newArray = arr.slice(1);
    steps.push({
      array: [...newArray],
      activeIndices: [],
      message: `Valeur ${removedValue} supprimée`,
      operation: "removeStart",
      operationCount: arr.length,
      completed: true,
    });

    return steps;
  }, []);

  // Générer les étapes pour la suppression à un index spécifique
  const generateRemoveAtSteps = useCallback(
    (arr: number[], targetIndex: number) => {
      const steps: ArrayStep[] = [];

      // Étape initiale
      steps.push({
        array: [...arr],
        activeIndices: [],
        message: `Suppression de l'élément à l'index ${targetIndex}`,
        operation: "removeAt",
        operationCount: 0,
      });

      // Vérifier si l'index est valide
      if (targetIndex < 0 || targetIndex >= arr.length) {
        steps.push({
          array: [...arr],
          activeIndices: [],
          message: `Index ${targetIndex} invalide (doit être entre 0 et ${
            arr.length - 1
          })`,
          operation: "removeAt",
          operationCount: 1,
          completed: true,
        });
        return steps;
      }

      // Étape de suppression
      const removedValue = arr[targetIndex];
      steps.push({
        array: [...arr],
        activeIndices: [targetIndex],
        message: `Suppression de la valeur ${removedValue} à l'index ${targetIndex}`,
        operation: "removeAt",
        operationCount: 1,
      });

      // Étape de décalage
      if (targetIndex < arr.length - 1) {
        steps.push({
          array: [...arr.slice(0, targetIndex), ...arr.slice(targetIndex + 1)],
          activeIndices: Array.from(
            { length: arr.length - targetIndex - 1 },
            (_, i) => i + targetIndex
          ),
          message: `Décalage des éléments à partir de l'index ${
            targetIndex + 1
          } vers la gauche`,
          operation: "removeAt",
          operationCount: arr.length - targetIndex,
        });
      }

      const newArray = [
        ...arr.slice(0, targetIndex),
        ...arr.slice(targetIndex + 1),
      ];
      steps.push({
        array: [...newArray],
        activeIndices: [],
        message: `Valeur ${removedValue} supprimée`,
        operation: "removeAt",
        operationCount: arr.length - targetIndex,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Exécuter l'opération sélectionnée
  const executeOperation = () => {
    let newSteps: ArrayStep[] = [];

    switch (operation) {
      case "access":
        const accessIndex = parseInt(index);
        if (!isNaN(accessIndex)) {
          newSteps = generateAccessSteps(array, accessIndex);
        }
        break;
      case "search":
        const searchValue = parseInt(value);
        if (!isNaN(searchValue)) {
          newSteps = generateSearchSteps(array, searchValue);
        }
        break;
      case "insertEnd":
        const insertEndValue = parseInt(value);
        if (!isNaN(insertEndValue)) {
          newSteps = generateInsertEndSteps(array, insertEndValue);
        }
        break;
      case "insertStart":
        const insertStartValue = parseInt(value);
        if (!isNaN(insertStartValue)) {
          newSteps = generateInsertStartSteps(array, insertStartValue);
        }
        break;
      case "insertAt":
        const insertAtValue = parseInt(value);
        const insertAtIndex = parseInt(index);
        if (!isNaN(insertAtValue) && !isNaN(insertAtIndex)) {
          newSteps = generateInsertAtSteps(array, insertAtValue, insertAtIndex);
        }
        break;
      case "removeEnd":
        newSteps = generateRemoveEndSteps(array);
        break;
      case "removeStart":
        newSteps = generateRemoveStartSteps(array);
        break;
      case "removeAt":
        const removeAtIndex = parseInt(index);
        if (!isNaN(removeAtIndex)) {
          newSteps = generateRemoveAtSteps(array, removeAtIndex);
        }
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour le tableau si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setArray(lastStep.array);
      }
    }
  };

  // Gérer le changement d'opération
  const handleOperationChange = (value: string) => {
    setOperation(value as OperationType);
    setValue("");
    setIndex("");
  };

  // Contrôles de la visualisation
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

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSpeedChange = (values: number[]) => {
    setSpeed(values[0]);
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
    array: [],
    activeIndices: [],
    message: "",
    operation: "access" as OperationType,
    operationCount: 0,
  };

  // Obtenir les statistiques pour l'étape actuelle
  const getStats = () => {
    const stats: { label: string; value: string | number }[] = [
      { label: "Opérations", value: currentStep.operationCount },
    ];

    // Ajouter des statistiques spécifiques à l'opération
    switch (currentStep.operation) {
      case "access":
        stats.push({ label: "Complexité", value: "O(1)" });
        break;
      case "search":
        stats.push({ label: "Complexité", value: "O(n)" });
        break;
      case "insertEnd":
        stats.push({ label: "Complexité", value: "O(1)*" });
        break;
      case "insertStart":
      case "insertAt":
        stats.push({ label: "Complexité", value: "O(n)" });
        break;
      case "removeEnd":
        stats.push({ label: "Complexité", value: "O(1)" });
        break;
      case "removeStart":
      case "removeAt":
        stats.push({ label: "Complexité", value: "O(n)" });
        break;
    }

    return stats;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Opérations sur le Tableau</h3>

          <div className="space-y-2">
            <Label htmlFor="operation">Opération</Label>
            <Select value={operation} onValueChange={handleOperationChange}>
              <SelectTrigger id="operation">
                <SelectValue placeholder="Sélectionner une opération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access">Accès par index</SelectItem>
                <SelectItem value="search">Recherche de valeur</SelectItem>
                <SelectItem value="insertEnd">Insertion à la fin</SelectItem>
                <SelectItem value="insertStart">Insertion au début</SelectItem>
                <SelectItem value="insertAt">Insertion à un index</SelectItem>
                <SelectItem value="removeEnd">Suppression à la fin</SelectItem>
                <SelectItem value="removeStart">
                  Suppression au début
                </SelectItem>
                <SelectItem value="removeAt">Suppression à un index</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champs d'entrée conditionnels */}
          {(operation === "insertEnd" ||
            operation === "insertStart" ||
            operation === "insertAt" ||
            operation === "search") && (
            <div className="space-y-2">
              <Label htmlFor="value">Valeur</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Entrez une valeur"
              />
            </div>
          )}

          {(operation === "access" ||
            operation === "insertAt" ||
            operation === "removeAt") && (
            <div className="space-y-2">
              <Label htmlFor="index">Index</Label>
              <Input
                id="index"
                type="number"
                value={index}
                onChange={(e) => setIndex(e.target.value)}
                placeholder="Entrez un index"
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button onClick={executeOperation}>Exécuter</Button>
            <Button variant="outline" onClick={generateRandomArray}>
              Nouveau Tableau
            </Button>
          </div>
        </div>

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Tableau"
          currentStep={currentStepIndex}
          totalSteps={steps.length - 1}
          isPlaying={isPlaying}
          speed={speed}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          message={currentStep.message}
          stats={getStats()}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-wrap justify-center gap-1 mb-8">
              {currentStep.array.map((value, index) => {
                const isActive = currentStep.activeIndices.includes(index);
                const isTarget =
                  currentStep.targetIndex === index ||
                  (currentStep.found && currentStep.targetValue === value);

                // Déterminer les couleurs en fonction de l'opération et de l'état
                let borderColor = "border-gray-300";
                let bgColor = "bg-transparent";
                let textColor = "";

                if (isActive && isTarget) {
                  // Élément actif et cible (trouvé)
                  borderColor = "border-green-500";
                  bgColor = "bg-green-100";
                  textColor = "text-green-700";
                } else if (isActive) {
                  // Élément actif (en cours d'examen)
                  switch (currentStep.operation) {
                    case "access":
                      borderColor = "border-blue-500";
                      bgColor = "bg-blue-100";
                      textColor = "text-blue-700";
                      break;
                    case "search":
                      borderColor = "border-amber-500";
                      bgColor = "bg-amber-100";
                      textColor = "text-amber-700";
                      break;
                    case "insertEnd":
                    case "insertStart":
                    case "insertAt":
                      borderColor = "border-emerald-500";
                      bgColor = "bg-emerald-100";
                      textColor = "text-emerald-700";
                      break;
                    case "removeEnd":
                    case "removeStart":
                    case "removeAt":
                      borderColor = "border-rose-500";
                      bgColor = "bg-rose-100";
                      textColor = "text-rose-700";
                      break;
                    default:
                      borderColor = "border-primary";
                      bgColor = "bg-primary/20";
                      textColor = "text-primary";
                  }
                } else if (isTarget && !currentStep.found) {
                  // Cible recherchée mais pas encore trouvée
                  borderColor = "border-purple-500";
                  bgColor = "bg-purple-100/50";
                  textColor = "text-purple-700";
                }

                return (
                  <motion.div
                    key={`${index}-${value}`}
                    className={`w-12 h-12 flex items-center justify-center border-2 rounded-md ${borderColor} ${bgColor}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      opacity: 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={`text-sm font-medium ${textColor}`}>
                      {value}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-2 text-sm text-muted-foreground">
              {currentStep.array.map((_, index) => (
                <div key={`index-${index}`} className="w-12 text-center">
                  {index}
                </div>
              ))}
            </div>
          </div>
        </VisualizationContainer>
      </div>
    </div>
  );
}
