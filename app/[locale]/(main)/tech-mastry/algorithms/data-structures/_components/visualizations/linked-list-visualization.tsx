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
  | "insertHead"
  | "insertTail"
  | "insertAt"
  | "removeHead"
  | "removeTail"
  | "removeAt";

// Interface pour un nœud de liste chaînée
interface ListNode {
  value: number;
  id: string; // Pour l'animation stable
}

// Interface pour une étape de visualisation
interface LinkedListStep {
  nodes: ListNode[];
  activeIndices: number[];
  message: string;
  operation: OperationType;
  operationCount: number;
  targetValue?: number;
  targetIndex?: number;
  found?: boolean;
  completed?: boolean;
}

export function LinkedListVisualization() {
  // État pour la liste chaînée
  const [nodes, setNodes] = useState<ListNode[]>([]);

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<LinkedListStep[]>([]);
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

  // Initialiser la liste chaînée
  useEffect(() => {
    generateRandomList();
  }, []);

  // Générer une liste chaînée aléatoire
  const generateRandomList = () => {
    const size = 5;
    const newNodes: ListNode[] = Array.from({ length: size }, (_, i) => ({
      value: Math.floor(Math.random() * 100),
      id: `node-${Date.now()}-${i}`,
    }));

    setNodes(newNodes);

    // Réinitialiser les étapes
    const initialStep: LinkedListStep = {
      nodes: [...newNodes],
      activeIndices: [],
      message: "Liste chaînée initiale",
      operation: "access",
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Générer les étapes pour l'opération d'accès
  const generateAccessSteps = useCallback(
    (nodesList: ListNode[], targetIndex: number) => {
      const steps: LinkedListStep[] = [];

      // Étape initiale
      steps.push({
        nodes: [...nodesList],
        activeIndices: [],
        message: `Accès à l'élément à l'index ${targetIndex}`,
        operation: "access",
        operationCount: 0,
      });

      // Vérifier si l'index est valide
      if (targetIndex < 0 || targetIndex >= nodesList.length) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [],
          message: `Index ${targetIndex} hors limites (0-${
            nodesList.length - 1
          })`,
          operation: "access",
          operationCount: 0,
          completed: true,
        });
        return steps;
      }

      // Simuler le parcours de la liste jusqu'à l'index cible
      for (let i = 0; i <= targetIndex; i++) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [i],
          message:
            i === targetIndex
              ? `Élément trouvé à l'index ${i}: ${nodesList[i].value}`
              : `Parcours du nœud à l'index ${i}`,
          operation: "access",
          operationCount: i + 1,
          completed: i === targetIndex,
        });
      }

      return steps;
    },
    []
  );

  // Générer les étapes pour l'opération de recherche
  const generateSearchSteps = useCallback(
    (nodesList: ListNode[], targetValue: number) => {
      const steps: LinkedListStep[] = [];

      // Étape initiale
      steps.push({
        nodes: [...nodesList],
        activeIndices: [],
        message: `Recherche de la valeur ${targetValue} dans la liste`,
        operation: "search",
        operationCount: 0,
        targetValue,
      });

      // Simuler la recherche dans la liste
      let found = false;
      let foundIndex = -1;

      for (let i = 0; i < nodesList.length; i++) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [i],
          message: `Comparaison avec le nœud à l'index ${i}: ${nodesList[i].value}`,
          operation: "search",
          operationCount: i + 1,
          targetValue,
        });

        if (nodesList[i].value === targetValue) {
          found = true;
          foundIndex = i;
          break;
        }
      }

      // Étape finale
      steps.push({
        nodes: [...nodesList],
        activeIndices: found ? [foundIndex] : [],
        message: found
          ? `Valeur ${targetValue} trouvée à l'index ${foundIndex} après ${
              foundIndex + 1
            } comparaisons`
          : `Valeur ${targetValue} non trouvée après ${nodesList.length} comparaisons`,
        operation: "search",
        operationCount: found ? foundIndex + 1 : nodesList.length,
        targetValue,
        found,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour l'insertion en tête
  const generateInsertHeadSteps = useCallback(
    (nodesList: ListNode[], value: number) => {
      const steps: LinkedListStep[] = [];

      // Étape initiale
      steps.push({
        nodes: [...nodesList],
        activeIndices: [],
        message: `Insertion de la valeur ${value} en tête de liste`,
        operation: "insertHead",
        operationCount: 0,
      });

      // Créer un nouveau nœud
      const newNode: ListNode = {
        value,
        id: `node-${Date.now()}-new`,
      };

      // Étape d'insertion
      const newList = [newNode, ...nodesList];
      steps.push({
        nodes: newList,
        activeIndices: [0],
        message: `Valeur ${value} insérée en tête de liste`,
        operation: "insertHead",
        operationCount: 1,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour l'insertion en queue
  const generateInsertTailSteps = useCallback(
    (nodesList: ListNode[], value: number) => {
      const steps: LinkedListStep[] = [];

      // Étape initiale
      steps.push({
        nodes: [...nodesList],
        activeIndices: [],
        message: `Insertion de la valeur ${value} en queue de liste`,
        operation: "insertTail",
        operationCount: 0,
      });

      // Simuler le parcours de la liste jusqu'à la fin
      for (let i = 0; i < nodesList.length; i++) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [i],
          message: `Parcours du nœud à l'index ${i}`,
          operation: "insertTail",
          operationCount: i + 1,
        });
      }

      // Créer un nouveau nœud
      const newNode: ListNode = {
        value,
        id: `node-${Date.now()}-new`,
      };

      // Étape d'insertion
      const newList = [...nodesList, newNode];
      steps.push({
        nodes: newList,
        activeIndices: [newList.length - 1],
        message: `Valeur ${value} insérée en queue de liste`,
        operation: "insertTail",
        operationCount: nodesList.length + 1,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour l'insertion à un index spécifique
  const generateInsertAtSteps = useCallback(
    (nodesList: ListNode[], value: number, targetIndex: number) => {
      const steps: LinkedListStep[] = [];

      // Étape initiale
      steps.push({
        nodes: [...nodesList],
        activeIndices: [],
        message: `Insertion de la valeur ${value} à l'index ${targetIndex}`,
        operation: "insertAt",
        operationCount: 0,
      });

      // Vérifier si l'index est valide
      if (targetIndex < 0 || targetIndex > nodesList.length) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [],
          message: `Index ${targetIndex} invalide (doit être entre 0 et ${nodesList.length})`,
          operation: "insertAt",
          operationCount: 0,
          completed: true,
        });
        return steps;
      }

      // Cas spécial: insertion en tête
      if (targetIndex === 0) {
        return generateInsertHeadSteps(nodesList, value);
      }

      // Cas spécial: insertion en queue
      if (targetIndex === nodesList.length) {
        return generateInsertTailSteps(nodesList, value);
      }

      // Simuler le parcours de la liste jusqu'à l'index cible
      for (let i = 0; i < targetIndex; i++) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [i],
          message: `Parcours du nœud à l'index ${i}`,
          operation: "insertAt",
          operationCount: i + 1,
        });
      }

      // Créer un nouveau nœud
      const newNode: ListNode = {
        value,
        id: `node-${Date.now()}-new`,
      };

      // Étape d'insertion
      const newList = [
        ...nodesList.slice(0, targetIndex),
        newNode,
        ...nodesList.slice(targetIndex),
      ];

      steps.push({
        nodes: newList,
        activeIndices: [targetIndex],
        message: `Valeur ${value} insérée à l'index ${targetIndex}`,
        operation: "insertAt",
        operationCount: targetIndex + 1,
        completed: true,
      });

      return steps;
    },
    [generateInsertHeadSteps, generateInsertTailSteps]
  );

  // Générer les étapes pour la suppression en tête
  const generateRemoveHeadSteps = useCallback((nodesList: ListNode[]) => {
    const steps: LinkedListStep[] = [];

    // Étape initiale
    steps.push({
      nodes: [...nodesList],
      activeIndices: [],
      message: `Suppression du nœud en tête de liste`,
      operation: "removeHead",
      operationCount: 0,
    });

    // Vérifier si la liste est vide
    if (nodesList.length === 0) {
      steps.push({
        nodes: [],
        activeIndices: [],
        message: `La liste est vide, aucun nœud à supprimer`,
        operation: "removeHead",
        operationCount: 0,
        completed: true,
      });
      return steps;
    }

    // Étape de suppression
    const removedValue = nodesList[0].value;
    steps.push({
      nodes: [...nodesList],
      activeIndices: [0],
      message: `Suppression du nœud avec la valeur ${removedValue} en tête de liste`,
      operation: "removeHead",
      operationCount: 1,
    });

    const newList = nodesList.slice(1);
    steps.push({
      nodes: newList,
      activeIndices: [],
      message: `Nœud avec la valeur ${removedValue} supprimé de la tête de liste`,
      operation: "removeHead",
      operationCount: 1,
      completed: true,
    });

    return steps;
  }, []);

  // Générer les étapes pour la suppression en queue
  const generateRemoveTailSteps = useCallback((nodesList: ListNode[]) => {
    const steps: LinkedListStep[] = [];

    // Étape initiale
    steps.push({
      nodes: [...nodesList],
      activeIndices: [],
      message: `Suppression du nœud en queue de liste`,
      operation: "removeTail",
      operationCount: 0,
    });

    // Vérifier si la liste est vide
    if (nodesList.length === 0) {
      steps.push({
        nodes: [],
        activeIndices: [],
        message: `La liste est vide, aucun nœud à supprimer`,
        operation: "removeTail",
        operationCount: 0,
        completed: true,
      });
      return steps;
    }

    // Simuler le parcours de la liste jusqu'à la fin
    for (let i = 0; i < nodesList.length; i++) {
      steps.push({
        nodes: [...nodesList],
        activeIndices: [i],
        message: `Parcours du nœud à l'index ${i}`,
        operation: "removeTail",
        operationCount: i + 1,
      });
    }

    // Étape de suppression
    const removedValue = nodesList[nodesList.length - 1].value;
    steps.push({
      nodes: [...nodesList],
      activeIndices: [nodesList.length - 1],
      message: `Suppression du nœud avec la valeur ${removedValue} en queue de liste`,
      operation: "removeTail",
      operationCount: nodesList.length,
    });

    const newList = nodesList.slice(0, -1);
    steps.push({
      nodes: newList,
      activeIndices: [],
      message: `Nœud avec la valeur ${removedValue} supprimé de la queue de liste`,
      operation: "removeTail",
      operationCount: nodesList.length,
      completed: true,
    });

    return steps;
  }, []);

  // Générer les étapes pour la suppression à un index spécifique
  const generateRemoveAtSteps = useCallback(
    (nodesList: ListNode[], targetIndex: number) => {
      const steps: LinkedListStep[] = [];

      // Étape initiale
      steps.push({
        nodes: [...nodesList],
        activeIndices: [],
        message: `Suppression du nœud à l'index ${targetIndex}`,
        operation: "removeAt",
        operationCount: 0,
      });

      // Vérifier si l'index est valide
      if (targetIndex < 0 || targetIndex >= nodesList.length) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [],
          message: `Index ${targetIndex} invalide (doit être entre 0 et ${
            nodesList.length - 1
          })`,
          operation: "removeAt",
          operationCount: 0,
          completed: true,
        });
        return steps;
      }

      // Cas spécial: suppression en tête
      if (targetIndex === 0) {
        return generateRemoveHeadSteps(nodesList);
      }

      // Cas spécial: suppression en queue
      if (targetIndex === nodesList.length - 1) {
        return generateRemoveTailSteps(nodesList);
      }

      // Simuler le parcours de la liste jusqu'à l'index cible
      for (let i = 0; i <= targetIndex; i++) {
        steps.push({
          nodes: [...nodesList],
          activeIndices: [i],
          message:
            i === targetIndex
              ? `Nœud trouvé à l'index ${i}: ${nodesList[i].value}`
              : `Parcours du nœud à l'index ${i}`,
          operation: "removeAt",
          operationCount: i + 1,
        });
      }

      // Étape de suppression
      const removedValue = nodesList[targetIndex].value;
      steps.push({
        nodes: [...nodesList],
        activeIndices: [targetIndex],
        message: `Suppression du nœud avec la valeur ${removedValue} à l'index ${targetIndex}`,
        operation: "removeAt",
        operationCount: targetIndex + 1,
      });

      const newList = [
        ...nodesList.slice(0, targetIndex),
        ...nodesList.slice(targetIndex + 1),
      ];

      steps.push({
        nodes: newList,
        activeIndices: [],
        message: `Nœud avec la valeur ${removedValue} supprimé de l'index ${targetIndex}`,
        operation: "removeAt",
        operationCount: targetIndex + 1,
        completed: true,
      });

      return steps;
    },
    [generateRemoveHeadSteps, generateRemoveTailSteps]
  );

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
    nodes: [],
    activeIndices: [],
    message: "",
    operation: "access" as OperationType,
    operationCount: 0,
  };

  // Exécuter l'opération sélectionnée
  const executeOperation = () => {
    let newSteps: LinkedListStep[] = [];

    switch (operation) {
      case "access":
        const accessIndex = parseInt(index);
        if (!isNaN(accessIndex)) {
          newSteps = generateAccessSteps(nodes, accessIndex);
        }
        break;
      case "search":
        const searchValue = parseInt(value);
        if (!isNaN(searchValue)) {
          newSteps = generateSearchSteps(nodes, searchValue);
        }
        break;
      case "insertHead":
        const insertHeadValue = parseInt(value);
        if (!isNaN(insertHeadValue)) {
          newSteps = generateInsertHeadSteps(nodes, insertHeadValue);
        }
        break;
      case "insertTail":
        const insertTailValue = parseInt(value);
        if (!isNaN(insertTailValue)) {
          newSteps = generateInsertTailSteps(nodes, insertTailValue);
        }
        break;
      case "insertAt":
        const insertAtValue = parseInt(value);
        const insertAtIndex = parseInt(index);
        if (!isNaN(insertAtValue) && !isNaN(insertAtIndex)) {
          newSteps = generateInsertAtSteps(nodes, insertAtValue, insertAtIndex);
        }
        break;
      case "removeHead":
        newSteps = generateRemoveHeadSteps(nodes);
        break;
      case "removeTail":
        newSteps = generateRemoveTailSteps(nodes);
        break;
      case "removeAt":
        const removeAtIndex = parseInt(index);
        if (!isNaN(removeAtIndex)) {
          newSteps = generateRemoveAtSteps(nodes, removeAtIndex);
        }
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour la liste si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setNodes(lastStep.nodes);
      }
    }
  };

  // Obtenir les statistiques pour l'étape actuelle
  const getStats = () => {
    const stats: { label: string; value: string | number }[] = [
      { label: "Opérations", value: currentStep.operationCount },
    ];

    // Ajouter des statistiques spécifiques à l'opération
    switch (currentStep.operation) {
      case "access":
      case "search":
        stats.push({ label: "Complexité", value: "O(n)" });
        break;
      case "insertHead":
      case "removeHead":
        stats.push({ label: "Complexité", value: "O(1)" });
        break;
      case "insertTail":
      case "removeTail":
        stats.push({ label: "Complexité", value: "O(n)" });
        break;
      case "insertAt":
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
          <h3 className="text-lg font-medium">
            Opérations sur la Liste Chaînée
          </h3>

          <div className="space-y-2">
            <Label htmlFor="operation">Opération</Label>
            <Select
              value={operation}
              onValueChange={(value) => setOperation(value as OperationType)}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Sélectionner une opération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access">Accès par index</SelectItem>
                <SelectItem value="search">Recherche de valeur</SelectItem>
                <SelectItem value="insertHead">Insertion en tête</SelectItem>
                <SelectItem value="insertTail">Insertion en queue</SelectItem>
                <SelectItem value="insertAt">Insertion à un index</SelectItem>
                <SelectItem value="removeHead">Suppression en tête</SelectItem>
                <SelectItem value="removeTail">Suppression en queue</SelectItem>
                <SelectItem value="removeAt">Suppression à un index</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champs d'entrée conditionnels */}
          {(operation === "insertHead" ||
            operation === "insertTail" ||
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
            <Button variant="outline" onClick={generateRandomList}>
              Nouvelle Liste
            </Button>
          </div>
        </div>

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Liste Chaînée"
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
            <div className="flex flex-wrap justify-center items-center gap-2">
              {currentStep.nodes.map((node, index) => {
                const isActive = currentStep.activeIndices.includes(index);
                const isLast = index === currentStep.nodes.length - 1;
                const isTarget =
                  currentStep.targetIndex === index ||
                  (currentStep.found && currentStep.targetValue === node.value);

                // Déterminer les couleurs en fonction de l'opération et de l'état
                let borderColor = "border-gray-300";
                let bgColor = "bg-transparent";
                let textColor = "";
                let arrowColor = "bg-gray-300";
                let arrowBorderColor = "border-l-gray-300";

                if (isActive && isTarget) {
                  // Élément actif et cible (trouvé)
                  borderColor = "border-green-500";
                  bgColor = "bg-green-100";
                  textColor = "text-green-700";
                  arrowColor = "bg-green-500";
                  arrowBorderColor = "border-l-green-500";
                } else if (isActive) {
                  // Élément actif (en cours d'examen)
                  switch (currentStep.operation) {
                    case "access":
                      borderColor = "border-blue-500";
                      bgColor = "bg-blue-100";
                      textColor = "text-blue-700";
                      arrowColor = "bg-blue-400";
                      arrowBorderColor = "border-l-blue-400";
                      break;
                    case "search":
                      borderColor = "border-amber-500";
                      bgColor = "bg-amber-100";
                      textColor = "text-amber-700";
                      arrowColor = "bg-amber-400";
                      arrowBorderColor = "border-l-amber-400";
                      break;
                    case "insertHead":
                    case "insertTail":
                    case "insertAt":
                      borderColor = "border-emerald-500";
                      bgColor = "bg-emerald-100";
                      textColor = "text-emerald-700";
                      arrowColor = "bg-emerald-400";
                      arrowBorderColor = "border-l-emerald-400";
                      break;
                    case "removeHead":
                    case "removeTail":
                    case "removeAt":
                      borderColor = "border-rose-500";
                      bgColor = "bg-rose-100";
                      textColor = "text-rose-700";
                      arrowColor = "bg-rose-400";
                      arrowBorderColor = "border-l-rose-400";
                      break;
                    default:
                      borderColor = "border-primary";
                      bgColor = "bg-primary/20";
                      textColor = "text-primary";
                      arrowColor = "bg-primary";
                      arrowBorderColor = "border-l-primary";
                  }
                } else if (isTarget && !currentStep.found) {
                  // Cible recherchée mais pas encore trouvée
                  borderColor = "border-purple-500";
                  bgColor = "bg-purple-100/50";
                  textColor = "text-purple-700";
                }

                return (
                  <div key={node.id} className="flex items-center">
                    <motion.div
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-md ${borderColor} ${bgColor}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        opacity: 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className={`text-sm font-medium ${textColor}`}>
                        {node.value}
                      </span>
                    </motion.div>

                    {!isLast && (
                      <motion.div
                        className={`w-6 h-0.5 ${arrowColor} mx-1`}
                        initial={{ width: 0 }}
                        animate={{ width: 24 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <motion.div
                          className={`w-0 h-0 border-t-4 border-r-0 border-b-4 border-l-8 border-t-transparent border-b-transparent ${arrowBorderColor}`}
                          style={{ marginLeft: "16px", marginTop: "-3.5px" }}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-[52px] text-sm text-muted-foreground mt-4">
              {currentStep.nodes.map((_, index) => (
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
