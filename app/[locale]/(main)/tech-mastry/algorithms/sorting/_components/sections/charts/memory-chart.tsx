"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive } from "lucide-react";

// Types pour les données de mémoire
interface MemoryData {
  name: string;
  color: string;
  space: string;
  description: string;
  memoryUsage: number;
  inPlace: boolean;
}

// Données de mémoire des algorithmes de tri
const sortingAlgorithmsMemory: MemoryData[] = [
  {
    name: "Tri à Bulles",
    color: "blue",
    space: "O(1)",
    description: "Utilise une quantité constante de mémoire supplémentaire",
    memoryUsage: 1,
    inPlace: true,
  },
  {
    name: "Tri par Sélection",
    color: "green",
    space: "O(1)",
    description: "Utilise une quantité constante de mémoire supplémentaire",
    memoryUsage: 1,
    inPlace: true,
  },
  {
    name: "Tri par Insertion",
    color: "amber",
    space: "O(1)",
    description: "Utilise une quantité constante de mémoire supplémentaire",
    memoryUsage: 1,
    inPlace: true,
  },
  {
    name: "Tri Fusion",
    color: "purple",
    space: "O(n)",
    description:
      "Nécessite un espace supplémentaire proportionnel à la taille de l'entrée",
    memoryUsage: 100,
    inPlace: false,
  },
  {
    name: "Tri Rapide",
    color: "red",
    space: "O(log n)",
    description:
      "Utilise un espace supplémentaire pour la pile d'appels récursifs",
    memoryUsage: 20,
    inPlace: true,
  },
  {
    name: "Tri par Tas",
    color: "orange",
    space: "O(1)",
    description: "Utilise une quantité constante de mémoire supplémentaire",
    memoryUsage: 1,
    inPlace: true,
  },
];

export function MemoryChart() {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(
    sortingAlgorithmsMemory.map((algo) => algo.name)
  );

  // Fonction pour basculer la sélection d'un algorithme
  const toggleAlgorithm = (name: string) => {
    if (selectedAlgorithms.includes(name)) {
      setSelectedAlgorithms(selectedAlgorithms.filter((algo) => algo !== name));
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, name]);
    }
  };

  // Calculer la valeur maximale pour l'échelle
  const maxMemoryUsage = Math.max(
    ...sortingAlgorithmsMemory
      .filter((algo) => selectedAlgorithms.includes(algo.name))
      .map((algo) => algo.memoryUsage)
  );

  // Calculer la hauteur des barres
  const getBarHeight = (value: number) => {
    return (value / maxMemoryUsage) * 80;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Légende et sélection des algorithmes */}
        <div className="flex flex-wrap gap-2">
          {sortingAlgorithmsMemory.map((algo) => (
            <Button
              key={algo.name}
              variant={
                selectedAlgorithms.includes(algo.name) ? "default" : "outline"
              }
              size="sm"
              onClick={() => toggleAlgorithm(algo.name)}
              className={`gap-2 ${
                selectedAlgorithms.includes(algo.name)
                  ? `bg-${algo.color}-500 hover:bg-${algo.color}-600`
                  : ""
              }`}
            >
              <div className={`w-3 h-3 rounded-full bg-${algo.color}-500`} />
              <span>{algo.name}</span>
            </Button>
          ))}
        </div>

        {/* Graphique de mémoire */}
        <div className="relative h-[400px] border rounded-lg p-6 bg-muted/30">
          {/* Axe Y */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between items-end pr-2 text-xs text-muted-foreground">
            <span>O(n)</span>
            <span>O(log n)</span>
            <span>O(1)</span>
          </div>

          {/* Graphique */}
          <div className="absolute left-14 right-0 top-0 bottom-10 flex items-end justify-around">
            {sortingAlgorithmsMemory
              .filter((algo) => selectedAlgorithms.includes(algo.name))
              .map((algo) => (
                <div
                  key={algo.name}
                  className="flex flex-col items-center gap-2 w-24"
                >
                  <div
                    className={`w-20 bg-${algo.color}-500 rounded-t transition-all duration-500 ease-in-out relative group`}
                    style={{
                      height: `${getBarHeight(algo.memoryUsage)}%`,
                    }}
                  >
                    {/* Info-bulle au survol */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-background border rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <p className="text-xs font-medium">{algo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {algo.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Badge
                      variant={algo.inPlace ? "outline" : "destructive"}
                      className="mb-1"
                    >
                      {algo.space}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {algo.name}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Tableau comparatif */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left font-medium text-sm">
                  Algorithme
                </th>
                <th className="p-2 text-left font-medium text-sm">Espace</th>
                <th className="p-2 text-left font-medium text-sm">In-Place</th>
                <th className="p-2 text-left font-medium text-sm">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {sortingAlgorithmsMemory
                .filter((algo) => selectedAlgorithms.includes(algo.name))
                .map((algo) => (
                  <tr key={algo.name} className="border-b">
                    <td className="p-2 font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-${algo.color}-500`}
                        />
                        {algo.name}
                      </div>
                    </td>
                    <td className="p-2">
                      <code className="bg-muted px-1 rounded text-sm">
                        {algo.space}
                      </code>
                    </td>
                    <td className="p-2">
                      <Badge variant={algo.inPlace ? "default" : "destructive"}>
                        {algo.inPlace ? "Oui" : "Non"}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {algo.description}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Informations sur la complexité spatiale */}
        <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
          <div className="flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-blue-300">
                Comprendre la complexité spatiale
              </h3>
              <p className="text-sm text-blue-400">
                La complexité spatiale mesure la quantité de mémoire
                supplémentaire utilisée par un algorithme. Un algorithme est dit
                &quot;in-place&quot; s&apos;il utilise O(1) mémoire
                supplémentaire. Le tri fusion utilise O(n) mémoire
                supplémentaire, ce qui peut être problématique pour de très
                grands tableaux.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
