"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

// Types pour les données de stabilité
interface StabilityData {
  name: string;
  color: string;
  stable: boolean;
  description: string;
  example: {
    before: { value: number; id: string }[];
    after: { value: number; id: string }[];
  };
}

// Données de stabilité des algorithmes de tri
const sortingAlgorithmsStability: StabilityData[] = [
  {
    name: "Tri à Bulles",
    color: "blue",
    stable: true,
    description: "Préserve l'ordre relatif des éléments égaux",
    example: {
      before: [
        { value: 4, id: "A" },
        { value: 2, id: "B" },
        { value: 4, id: "C" },
        { value: 1, id: "D" },
      ],
      after: [
        { value: 1, id: "D" },
        { value: 2, id: "B" },
        { value: 4, id: "A" },
        { value: 4, id: "C" },
      ],
    },
  },
  {
    name: "Tri par Sélection",
    color: "green",
    stable: false,
    description:
      "Ne préserve pas nécessairement l'ordre relatif des éléments égaux",
    example: {
      before: [
        { value: 4, id: "A" },
        { value: 2, id: "B" },
        { value: 4, id: "C" },
        { value: 1, id: "D" },
      ],
      after: [
        { value: 1, id: "D" },
        { value: 2, id: "B" },
        { value: 4, id: "C" }, // Ordre inversé par rapport à l'entrée
        { value: 4, id: "A" },
      ],
    },
  },
  {
    name: "Tri par Insertion",
    color: "amber",
    stable: true,
    description: "Préserve l'ordre relatif des éléments égaux",
    example: {
      before: [
        { value: 4, id: "A" },
        { value: 2, id: "B" },
        { value: 4, id: "C" },
        { value: 1, id: "D" },
      ],
      after: [
        { value: 1, id: "D" },
        { value: 2, id: "B" },
        { value: 4, id: "A" },
        { value: 4, id: "C" },
      ],
    },
  },
  {
    name: "Tri Fusion",
    color: "purple",
    stable: true,
    description: "Préserve l'ordre relatif des éléments égaux",
    example: {
      before: [
        { value: 4, id: "A" },
        { value: 2, id: "B" },
        { value: 4, id: "C" },
        { value: 1, id: "D" },
      ],
      after: [
        { value: 1, id: "D" },
        { value: 2, id: "B" },
        { value: 4, id: "A" },
        { value: 4, id: "C" },
      ],
    },
  },
  {
    name: "Tri Rapide",
    color: "red",
    stable: false,
    description:
      "Ne préserve pas nécessairement l'ordre relatif des éléments égaux",
    example: {
      before: [
        { value: 4, id: "A" },
        { value: 2, id: "B" },
        { value: 4, id: "C" },
        { value: 1, id: "D" },
      ],
      after: [
        { value: 1, id: "D" },
        { value: 2, id: "B" },
        { value: 4, id: "C" }, // Ordre peut varier selon l'implémentation
        { value: 4, id: "A" },
      ],
    },
  },
  {
    name: "Tri par Tas",
    color: "orange",
    stable: false,
    description:
      "Ne préserve pas nécessairement l'ordre relatif des éléments égaux",
    example: {
      before: [
        { value: 4, id: "A" },
        { value: 2, id: "B" },
        { value: 4, id: "C" },
        { value: 1, id: "D" },
      ],
      after: [
        { value: 1, id: "D" },
        { value: 2, id: "B" },
        { value: 4, id: "C" }, // Ordre peut varier
        { value: 4, id: "A" },
      ],
    },
  },
];

export function StabilityChart() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(
    sortingAlgorithmsStability[0].name
  );

  // Trouver l'algorithme sélectionné
  const algorithm =
    sortingAlgorithmsStability.find(
      (algo) => algo.name === selectedAlgorithm
    ) || sortingAlgorithmsStability[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Sélection de l'algorithme */}
        <div className="flex flex-wrap gap-2">
          {sortingAlgorithmsStability.map((algo) => (
            <Button
              key={algo.name}
              variant={selectedAlgorithm === algo.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAlgorithm(algo.name)}
              className={`gap-2 ${
                selectedAlgorithm === algo.name
                  ? `bg-${algo.color}-500 hover:bg-${algo.color}-600`
                  : ""
              }`}
            >
              <div className={`w-3 h-3 rounded-full bg-${algo.color}-500`} />
              <span>{algo.name}</span>
              <Badge
                variant={algo.stable ? "default" : "destructive"}
                className="ml-1"
              >
                {algo.stable ? "Stable" : "Instable"}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Visualisation de la stabilité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {algorithm.name}
              <Badge
                variant={algorithm.stable ? "default" : "destructive"}
                className="ml-2"
              >
                {algorithm.stable ? "Stable" : "Instable"}
              </Badge>
            </h3>
            <p className="text-muted-foreground">{algorithm.description}</p>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Qu&apos;est-ce que la stabilité ?
              </h4>
              <p className="text-sm text-muted-foreground">
                Un algorithme de tri est dit <strong>stable</strong> s&apos;il
                préserve l&apos;ordre relatif des éléments égaux. C&apos;est
                important lorsqu&apos;on trie des objets sur plusieurs critères
                successivement.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Exemple</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Avant le tri</h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  {algorithm.example.before.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-2 last:mb-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-medium">
                          {item.value}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Valeur: {item.value}
                        </span>
                      </div>
                      <Badge variant="outline">{item.id}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Après le tri</h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  {algorithm.example.after.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-2 last:mb-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-medium">
                          {item.value}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Valeur: {item.value}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          algorithm.stable
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {item.id}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <th className="p-2 text-left font-medium text-sm">Stabilité</th>
                <th className="p-2 text-left font-medium text-sm">
                  Description
                </th>
                <th className="p-2 text-left font-medium text-sm">
                  Cas d&apos;usage
                </th>
              </tr>
            </thead>
            <tbody>
              {sortingAlgorithmsStability.map((algo) => (
                <tr
                  key={algo.name}
                  className={`border-b ${
                    selectedAlgorithm === algo.name ? "bg-muted/50" : ""
                  }`}
                >
                  <td className="p-2 font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-${algo.color}-500`}
                      />
                      {algo.name}
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant={algo.stable ? "default" : "destructive"}>
                      {algo.stable ? "Stable" : "Instable"}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">
                    {algo.description}
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">
                    {algo.stable
                      ? "Idéal pour les tris multi-critères"
                      : "À éviter pour les tris multi-critères"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Informations sur la stabilité */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Importance de la stabilité
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                La stabilité est cruciale lorsqu&apos;on trie des données sur
                plusieurs critères. Par exemple, si vous triez une liste de
                personnes d&apos;abord par âge, puis par nom, vous voulez que
                l&apos;ordre des personnes de même âge soit préservé lors du
                second tri. Seuls les algorithmes stables garantissent ce
                comportement.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
