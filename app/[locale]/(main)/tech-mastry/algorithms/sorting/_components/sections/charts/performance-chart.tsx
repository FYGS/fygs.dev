"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";

// Types pour les données de performance
interface PerformanceData {
  name: string;
  color: string;
  best: number[];
  average: number[];
  worst: number[];
}

// Données de performance des algorithmes de tri
const sortingAlgorithmsPerformance: PerformanceData[] = [
  {
    name: "Tri à Bulles",
    color: "blue",
    best: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    average: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    worst: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  },
  {
    name: "Tri par Sélection",
    color: "green",
    best: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    average: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    worst: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  },
  {
    name: "Tri par Insertion",
    color: "amber",
    best: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    average: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    worst: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  },
  {
    name: "Tri Fusion",
    color: "purple",
    best: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
    average: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
    worst: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
  },
  {
    name: "Tri Rapide",
    color: "red",
    best: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
    average: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
    worst: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  },
  {
    name: "Tri par Tas",
    color: "orange",
    best: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
    average: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
    worst: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => n * Math.log2(n)),
  },
];

// Tailles d'entrée pour l'axe X
const inputSizes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Types de cas
type CaseType = "best" | "average" | "worst";

export function PerformanceChart() {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([
    "Tri à Bulles",
    "Tri Fusion",
    "Tri Rapide",
  ]);
  const [caseType, setCaseType] = useState<CaseType>("average");
  const [scale, setScale] = useState<number>(100);

  // Fonction pour basculer la sélection d'un algorithme
  const toggleAlgorithm = (name: string) => {
    if (selectedAlgorithms.includes(name)) {
      setSelectedAlgorithms(selectedAlgorithms.filter((algo) => algo !== name));
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, name]);
    }
  };

  // Calculer les valeurs maximales pour l'échelle
  const maxValue = Math.max(
    ...sortingAlgorithmsPerformance
      .filter((algo) => selectedAlgorithms.includes(algo.name))
      .flatMap((algo) => algo[caseType])
  );

  // Calculer la hauteur des barres en fonction de l'échelle
  const getBarHeight = (value: number) => {
    return (value / maxValue) * scale;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Sélection du type de cas */}
        <Tabs
          value={caseType}
          onValueChange={(value) => setCaseType(value as CaseType)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="best">Meilleur cas</TabsTrigger>
            <TabsTrigger value="average">Cas moyen</TabsTrigger>
            <TabsTrigger value="worst">Pire cas</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Contrôle de l'échelle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="scale" className="text-sm font-medium">
              Échelle: {scale}%
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(100)}
              className="h-8"
            >
              Réinitialiser
            </Button>
          </div>
          <Slider
            id="scale"
            value={[scale]}
            min={10}
            max={100}
            step={5}
            onValueChange={(value) => setScale(value[0])}
          />
        </div>

        {/* Légende et sélection des algorithmes */}
        <div className="flex flex-wrap gap-2">
          {sortingAlgorithmsPerformance.map((algo) => (
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

        {/* Graphique de performance */}
        <div className="relative h-[400px] border rounded-lg p-6 bg-muted/30">
          {/* Axe Y */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between items-end pr-2 text-xs text-muted-foreground">
            <span>O(n²)</span>
            <span>O(n log n)</span>
            <span>O(n)</span>
          </div>

          {/* Graphique */}
          <div className="absolute left-14 right-0 top-0 bottom-10 flex items-end">
            {inputSizes.map((size, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end h-full relative"
              >
                {/* Lignes de grille */}
                <div className="absolute inset-0 border-l border-muted-foreground/20"></div>

                {/* Barres pour chaque algorithme */}
                <div className="w-full flex justify-center items-end gap-1 z-10">
                  {sortingAlgorithmsPerformance
                    .filter((algo) => selectedAlgorithms.includes(algo.name))
                    .map((algo) => (
                      <div
                        key={`${algo.name}-${index}`}
                        className={`w-3 bg-${algo.color}-500 rounded-t transition-all duration-500 ease-in-out`}
                        style={{
                          height: `${getBarHeight(algo[caseType][index])}%`,
                        }}
                        title={`${algo.name}: ${
                          Math.round(algo[caseType][index] * 100) / 100
                        } opérations pour n=${size}`}
                      ></div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Axe X */}
          <div className="absolute left-14 right-0 bottom-0 h-10 flex justify-between items-center text-xs text-muted-foreground">
            {inputSizes.map((size, index) => (
              <div key={index} className="flex-1 text-center">
                n={size}
              </div>
            ))}
          </div>
        </div>

        {/* Informations sur la complexité */}
        <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-blue-300">
                Comprendre la complexité temporelle
              </h3>
              <p className="text-sm text-blue-400">
                <strong>Courbes purement illustratives</strong> : elles
                représentent la forme théorique de croissance (n, n log n, n²)
                à une échelle relative arbitraire, et non des mesures ni un
                décompte exact de comparaisons ou d&apos;échanges. Les
                algorithmes en O(n²) comme le tri à bulles deviennent
                rapidement inefficaces pour de grandes entrées, tandis que les
                algorithmes en O(n log n) comme le tri fusion restent
                performants.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
