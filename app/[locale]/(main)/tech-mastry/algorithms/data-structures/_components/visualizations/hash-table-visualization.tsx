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
type OperationType = "insert" | "get" | "remove" | "clear" | "resize";

// Interface pour un élément de la table de hachage
interface HashTableEntry {
  key: string;
  value: string;
  id: string; // Pour l'animation stable
}

// Interface pour un bucket de la table de hachage
interface HashTableBucket {
  index: number;
  entries: HashTableEntry[];
}

// Interface pour une étape de visualisation
interface HashTableStep {
  buckets: HashTableBucket[];
  activeIndices: number[];
  activeEntries: string[]; // IDs des entrées actives
  message: string;
  operation: OperationType;
  operationCount: number;
  targetKey?: string;
  targetValue?: string;
  targetIndex?: number;
  found?: boolean;
  completed?: boolean;
}

export function HashTableVisualization() {
  // État pour la table de hachage
  const [buckets, setBuckets] = useState<HashTableBucket[]>([]);
  const [size, setSize] = useState<number>(7); // Taille par défaut

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<HashTableStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [key, setKey] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("insert");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser une table de hachage vide
  const initializeHashTable = useCallback(() => {
    const newBuckets: HashTableBucket[] = Array.from(
      { length: size },
      (_, index) => ({
        index,
        entries: [],
      })
    );

    setBuckets(newBuckets);

    // Réinitialiser les étapes
    const initialStep: HashTableStep = {
      buckets: [...newBuckets],
      activeIndices: [],
      activeEntries: [],
      message: "Table de hachage initialisée",
      operation: "clear",
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [size]);

  // Fonction de hachage simple
  const hashFunction = useCallback(
    (key: string): number => {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash + key.charCodeAt(i)) % size;
      }
      return hash;
    },
    [size]
  );

  // Initialiser la table de hachage
  useEffect(() => {
    initializeHashTable();
  }, [initializeHashTable]);

  // Générer les étapes pour l'insertion d'une paire clé-valeur
  const generateInsertSteps = useCallback(
    (currentBuckets: HashTableBucket[], key: string, value: string) => {
      const steps: HashTableStep[] = [];

      // Étape initiale
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: `Insertion de la paire clé-valeur (${key}: ${value})`,
        operation: "insert",
        operationCount: 0,
        targetKey: key,
        targetValue: value,
      });

      // Calculer l'index du bucket avec la fonction de hachage
      const bucketIndex = hashFunction(key);

      // Étape de calcul de l'index
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [bucketIndex],
        activeEntries: [],
        message: `Calcul de l'index avec la fonction de hachage: hash("${key}") = ${bucketIndex}`,
        operation: "insert",
        operationCount: 1,
        targetKey: key,
        targetValue: value,
        targetIndex: bucketIndex,
      });

      // Copier les buckets pour la modification
      const newBuckets = JSON.parse(JSON.stringify(currentBuckets));
      const bucket = newBuckets[bucketIndex];

      // Vérifier si la clé existe déjà
      const existingEntryIndex = bucket.entries.findIndex(
        (entry: HashTableEntry) => entry.key === key
      );

      if (existingEntryIndex !== -1) {
        // La clé existe déjà, mettre à jour la valeur
        const existingEntryId = bucket.entries[existingEntryIndex].id;

        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [existingEntryId],
          message: `La clé "${key}" existe déjà dans le bucket ${bucketIndex}. Mise à jour de la valeur.`,
          operation: "insert",
          operationCount: 2,
          targetKey: key,
          targetValue: value,
          targetIndex: bucketIndex,
        });

        // Mettre à jour la valeur
        bucket.entries[existingEntryIndex].value = value;

        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [existingEntryId],
          message: `Valeur mise à jour pour la clé "${key}": ${value}`,
          operation: "insert",
          operationCount: 3,
          targetKey: key,
          targetValue: value,
          targetIndex: bucketIndex,
          completed: true,
        });
      } else {
        // La clé n'existe pas, ajouter une nouvelle entrée
        const newEntry: HashTableEntry = {
          key,
          value,
          id: `entry-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
        };

        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [],
          message: `La clé "${key}" n'existe pas dans le bucket ${bucketIndex}. Ajout d'une nouvelle entrée.`,
          operation: "insert",
          operationCount: 2,
          targetKey: key,
          targetValue: value,
          targetIndex: bucketIndex,
        });

        // Ajouter la nouvelle entrée
        bucket.entries.push(newEntry);

        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [newEntry.id],
          message: `Nouvelle entrée ajoutée au bucket ${bucketIndex}: (${key}: ${value})`,
          operation: "insert",
          operationCount: 3,
          targetKey: key,
          targetValue: value,
          targetIndex: bucketIndex,
          completed: true,
        });
      }

      return steps;
    },
    [hashFunction]
  );

  // Générer les étapes pour la recherche d'une valeur par clé
  const generateGetSteps = useCallback(
    (currentBuckets: HashTableBucket[], key: string) => {
      const steps: HashTableStep[] = [];

      // Étape initiale
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: `Recherche de la valeur associée à la clé "${key}"`,
        operation: "get",
        operationCount: 0,
        targetKey: key,
      });

      // Calculer l'index du bucket avec la fonction de hachage
      const bucketIndex = hashFunction(key);

      // Étape de calcul de l'index
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [bucketIndex],
        activeEntries: [],
        message: `Calcul de l'index avec la fonction de hachage: hash("${key}") = ${bucketIndex}`,
        operation: "get",
        operationCount: 1,
        targetKey: key,
        targetIndex: bucketIndex,
      });

      // Rechercher la clé dans le bucket
      const bucket = currentBuckets[bucketIndex];
      const existingEntry = bucket.entries.find(
        (entry: HashTableEntry) => entry.key === key
      );

      if (existingEntry) {
        // La clé a été trouvée
        steps.push({
          buckets: JSON.parse(JSON.stringify(currentBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [existingEntry.id],
          message: `Clé "${key}" trouvée dans le bucket ${bucketIndex}. Valeur associée: ${existingEntry.value}`,
          operation: "get",
          operationCount: 2,
          targetKey: key,
          targetValue: existingEntry.value,
          targetIndex: bucketIndex,
          found: true,
          completed: true,
        });
      } else {
        // La clé n'a pas été trouvée
        steps.push({
          buckets: JSON.parse(JSON.stringify(currentBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [],
          message: `Clé "${key}" non trouvée dans le bucket ${bucketIndex}.`,
          operation: "get",
          operationCount: 2,
          targetKey: key,
          targetIndex: bucketIndex,
          found: false,
          completed: true,
        });
      }

      return steps;
    },
    [hashFunction]
  );

  // Générer les étapes pour la suppression d'une entrée par clé
  const generateRemoveSteps = useCallback(
    (currentBuckets: HashTableBucket[], key: string) => {
      const steps: HashTableStep[] = [];

      // Étape initiale
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: `Suppression de l'entrée avec la clé "${key}"`,
        operation: "remove",
        operationCount: 0,
        targetKey: key,
      });

      // Calculer l'index du bucket avec la fonction de hachage
      const bucketIndex = hashFunction(key);

      // Étape de calcul de l'index
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [bucketIndex],
        activeEntries: [],
        message: `Calcul de l'index avec la fonction de hachage: hash("${key}") = ${bucketIndex}`,
        operation: "remove",
        operationCount: 1,
        targetKey: key,
        targetIndex: bucketIndex,
      });

      // Copier les buckets pour la modification
      const newBuckets = JSON.parse(JSON.stringify(currentBuckets));
      const bucket = newBuckets[bucketIndex];

      // Rechercher la clé dans le bucket
      const existingEntryIndex = bucket.entries.findIndex(
        (entry: HashTableEntry) => entry.key === key
      );

      if (existingEntryIndex !== -1) {
        // La clé a été trouvée
        const existingEntry = bucket.entries[existingEntryIndex];

        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [existingEntry.id],
          message: `Clé "${key}" trouvée dans le bucket ${bucketIndex}. Suppression de l'entrée.`,
          operation: "remove",
          operationCount: 2,
          targetKey: key,
          targetValue: existingEntry.value,
          targetIndex: bucketIndex,
          found: true,
        });

        // Supprimer l'entrée
        bucket.entries.splice(existingEntryIndex, 1);

        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [],
          message: `Entrée avec la clé "${key}" supprimée du bucket ${bucketIndex}.`,
          operation: "remove",
          operationCount: 3,
          targetKey: key,
          targetIndex: bucketIndex,
          found: true,
          completed: true,
        });
      } else {
        // La clé n'a pas été trouvée
        steps.push({
          buckets: JSON.parse(JSON.stringify(newBuckets)),
          activeIndices: [bucketIndex],
          activeEntries: [],
          message: `Clé "${key}" non trouvée dans le bucket ${bucketIndex}. Aucune suppression effectuée.`,
          operation: "remove",
          operationCount: 2,
          targetKey: key,
          targetIndex: bucketIndex,
          found: false,
          completed: true,
        });
      }

      return steps;
    },
    [hashFunction]
  );

  // Générer les étapes pour vider la table de hachage
  const generateClearSteps = useCallback(
    (currentBuckets: HashTableBucket[]) => {
      const steps: HashTableStep[] = [];

      // Étape initiale
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: "Vidage de la table de hachage",
        operation: "clear",
        operationCount: 0,
      });

      // Copier les buckets pour la modification
      const newBuckets = JSON.parse(JSON.stringify(currentBuckets));

      // Marquer tous les buckets comme actifs
      steps.push({
        buckets: JSON.parse(JSON.stringify(newBuckets)),
        activeIndices: newBuckets.map(
          (bucket: HashTableBucket) => bucket.index
        ),
        activeEntries: [],
        message: "Suppression de toutes les entrées",
        operation: "clear",
        operationCount: 1,
      });

      // Vider tous les buckets
      newBuckets.forEach((bucket: HashTableBucket) => {
        bucket.entries = [];
      });

      // Étape finale
      steps.push({
        buckets: JSON.parse(JSON.stringify(newBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: "Table de hachage vidée avec succès",
        operation: "clear",
        operationCount: 2,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour redimensionner la table de hachage
  const generateResizeSteps = useCallback(
    (currentBuckets: HashTableBucket[], newSize: number) => {
      const steps: HashTableStep[] = [];

      // Étape initiale
      steps.push({
        buckets: JSON.parse(JSON.stringify(currentBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: `Redimensionnement de la table de hachage à ${newSize} buckets`,
        operation: "resize",
        operationCount: 0,
      });

      // Créer une nouvelle table de hachage avec la nouvelle taille
      const newBuckets: HashTableBucket[] = Array.from(
        { length: newSize },
        (_, index) => ({
          index,
          entries: [],
        })
      );

      steps.push({
        buckets: JSON.parse(JSON.stringify(newBuckets)),
        activeIndices: newBuckets.map((bucket) => bucket.index),
        activeEntries: [],
        message: `Nouvelle table de hachage créée avec ${newSize} buckets`,
        operation: "resize",
        operationCount: 1,
      });

      // Collecter toutes les entrées de l'ancienne table
      const allEntries: HashTableEntry[] = [];
      currentBuckets.forEach((bucket: HashTableBucket) => {
        bucket.entries.forEach((entry: HashTableEntry) => {
          allEntries.push({ ...entry });
        });
      });

      steps.push({
        buckets: JSON.parse(JSON.stringify(newBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: `${allEntries.length} entrées collectées de l'ancienne table`,
        operation: "resize",
        operationCount: 2,
      });

      // Réinsérer toutes les entrées dans la nouvelle table
      let operationCount = 3;

      allEntries.forEach((entry: HashTableEntry, entryIndex) => {
        // Calculer le nouvel index avec la nouvelle taille
        const tempHashFunction = (key: string): number => {
          let hash = 0;
          for (let i = 0; i < key.length; i++) {
            hash = (hash + key.charCodeAt(i)) % newSize;
          }
          return hash;
        };

        const newBucketIndex = tempHashFunction(entry.key);

        // Ajouter l'entrée au nouveau bucket
        newBuckets[newBucketIndex].entries.push(entry);

        // Ajouter une étape pour chaque réinsertion (limité à 5 pour éviter trop d'étapes)
        if (entryIndex < 5 || entryIndex === allEntries.length - 1) {
          steps.push({
            buckets: JSON.parse(JSON.stringify(newBuckets)),
            activeIndices: [newBucketIndex],
            activeEntries: [entry.id],
            message:
              entryIndex < 5
                ? `Réinsertion de l'entrée (${entry.key}: ${entry.value}) dans le bucket ${newBucketIndex}`
                : `${allEntries.length - 5} autres entrées réinsérées...`,
            operation: "resize",
            operationCount: operationCount++,
          });
        }
      });

      // Étape finale
      steps.push({
        buckets: JSON.parse(JSON.stringify(newBuckets)),
        activeIndices: [],
        activeEntries: [],
        message: `Table de hachage redimensionnée avec succès à ${newSize} buckets`,
        operation: "resize",
        operationCount: operationCount,
        completed: true,
      });

      return steps;
    },
    []
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
    buckets: [],
    activeIndices: [],
    activeEntries: [],
    message: "",
    operation: "insert" as OperationType,
    operationCount: 0,
  };

  // Exécuter l'opération sélectionnée
  const executeOperation = useCallback(() => {
    let newSteps: HashTableStep[] = [];

    switch (operation) {
      case "insert":
        if (key.trim() !== "" && value.trim() !== "") {
          newSteps = generateInsertSteps(buckets, key, value);
        }
        break;
      case "get":
        if (key.trim() !== "") {
          newSteps = generateGetSteps(buckets, key);
        }
        break;
      case "remove":
        if (key.trim() !== "") {
          newSteps = generateRemoveSteps(buckets, key);
        }
        break;
      case "clear":
        newSteps = generateClearSteps(buckets);
        break;
      case "resize":
        if (size > 0) {
          newSteps = generateResizeSteps(buckets, size);
        }
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour la table si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setBuckets(lastStep.buckets);
      }
    }
  }, [
    operation,
    key,
    value,
    size,
    buckets,
    generateInsertSteps,
    generateGetSteps,
    generateRemoveSteps,
    generateClearSteps,
    generateResizeSteps,
  ]);

  // Obtenir les statistiques pour l'étape actuelle
  const getStats = () => {
    const stats: { label: string; value: string | number }[] = [
      { label: "Opérations", value: currentStep.operationCount },
    ];

    // Ajouter des statistiques spécifiques à l'opération
    switch (currentStep.operation) {
      case "insert":
      case "get":
      case "remove":
        stats.push({ label: "Complexité", value: "O(1)*" });
        stats.push({ label: "Note", value: "O(n) dans le pire cas" });
        break;
      case "clear":
        stats.push({ label: "Complexité", value: "O(m)" });
        stats.push({ label: "Note", value: "m = nombre de buckets" });
        break;
      case "resize":
        stats.push({ label: "Complexité", value: "O(n+m)" });
        stats.push({
          label: "Note",
          value: "n = nombre d'entrées, m = nouvelle taille",
        });
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
            Opérations sur la Table de Hachage
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
                <SelectItem value="insert">Insertion (put)</SelectItem>
                <SelectItem value="get">Recherche (get)</SelectItem>
                <SelectItem value="remove">Suppression (remove)</SelectItem>
                <SelectItem value="clear">Vider (clear)</SelectItem>
                <SelectItem value="resize">Redimensionner (resize)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champs d'entrée conditionnels */}
          {operation === "insert" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="key">Clé</Label>
                <Input
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Entrez une clé"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valeur</Label>
                <Input
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Entrez une valeur"
                />
              </div>
            </>
          )}

          {(operation === "get" || operation === "remove") && (
            <div className="space-y-2">
              <Label htmlFor="key">Clé</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Entrez une clé"
              />
            </div>
          )}

          {operation === "resize" && (
            <div className="space-y-2">
              <Label htmlFor="size">Nouvelle taille</Label>
              <Input
                id="size"
                type="number"
                min={1}
                max={20}
                value={size.toString()}
                onChange={(e) => setSize(parseInt(e.target.value) || 7)}
                placeholder="Entrez la nouvelle taille"
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button onClick={executeOperation}>Exécuter</Button>
            <Button variant="outline" onClick={initializeHashTable}>
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Table de Hachage"
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
            <div className="w-full max-h-[400px] overflow-y-auto">
              {currentStep.buckets.map((bucket: HashTableBucket) => {
                const isActiveBucket = currentStep.activeIndices.includes(
                  bucket.index
                );

                return (
                  <div key={bucket.index} className="mb-2">
                    <div className="flex items-center mb-1">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-md mr-2 ${
                          isActiveBucket
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100"
                        }`}
                      >
                        {bucket.index}
                      </div>
                      <div
                        className={`flex-1 h-12 border-2 rounded-md flex items-center px-2 ${
                          isActiveBucket ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {bucket.entries.length === 0 ? (
                          <span className="text-gray-400 text-sm">
                            Bucket vide
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {bucket.entries.map((entry: HashTableEntry) => {
                              const isActiveEntry =
                                currentStep.activeEntries.includes(entry.id);
                              const isTarget =
                                currentStep.targetKey === entry.key;

                              // Déterminer les couleurs en fonction de l'opération et de l'état
                              let borderColor = "border-gray-300";
                              let bgColor = "bg-gray-50";
                              let textColor = "text-gray-700";

                              if (isActiveEntry && isTarget) {
                                // Élément actif et cible (trouvé)
                                switch (currentStep.operation) {
                                  case "get":
                                    borderColor = "border-green-500";
                                    bgColor = "bg-green-100";
                                    textColor = "text-green-700";
                                    break;
                                  case "remove":
                                    borderColor = "border-rose-500";
                                    bgColor = "bg-rose-100";
                                    textColor = "text-rose-700";
                                    break;
                                  default:
                                    borderColor = "border-purple-500";
                                    bgColor = "bg-purple-100";
                                    textColor = "text-purple-700";
                                }
                              } else if (isActiveEntry) {
                                // Élément actif (en cours d'examen)
                                borderColor = "border-amber-500";
                                bgColor = "bg-amber-100";
                                textColor = "text-amber-700";
                              } else if (isTarget && !currentStep.found) {
                                // Cible recherchée mais pas encore trouvée
                                borderColor = "border-purple-500";
                                bgColor = "bg-purple-100/50";
                                textColor = "text-purple-700";
                              }

                              return (
                                <motion.div
                                  key={entry.id}
                                  className={`px-2 py-1 rounded border ${borderColor} ${bgColor} ${textColor} text-sm flex items-center`}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{
                                    scale: isActiveEntry ? 1.05 : 1,
                                    opacity: 1,
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="font-medium">
                                    {entry.key}
                                  </span>
                                  <span className="mx-1">:</span>
                                  <span>{entry.value}</span>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </VisualizationContainer>
      </div>
    </div>
  );
}
