"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Types pour les données de cas d'usage
interface UsageData {
  name: string;
  color: string;
  scenarios: {
    name: string;
    description: string;
    suitability: "excellent" | "good" | "fair" | "poor";
    reason: string;
  }[];
}

// Données des cas d'usage des algorithmes de tri
const sortingAlgorithmsUsage: UsageData[] = [
  {
    name: "Tri à Bulles",
    color: "blue",
    scenarios: [
      {
        name: "Petits tableaux",
        description: "Tableaux de moins de 50 éléments",
        suitability: "fair",
        reason: "Simple mais inefficace même pour de petits tableaux",
      },
      {
        name: "Tableaux presque triés",
        description: "Tableaux où peu d'éléments sont mal placés",
        suitability: "good",
        reason: "Peut détecter si le tableau est déjà trié et s'arrêter tôt",
      },
      {
        name: "Grands tableaux",
        description: "Tableaux de plus de 1000 éléments",
        suitability: "poor",
        reason: "Très inefficace pour les grands tableaux (O(n²))",
      },
      {
        name: "Environnements contraints",
        description: "Systèmes avec peu de mémoire disponible",
        suitability: "good",
        reason: "Utilise O(1) mémoire supplémentaire",
      },
      {
        name: "Tri multi-critères",
        description: "Trier d'abord par un critère, puis par un autre",
        suitability: "excellent",
        reason: "Stable, préserve l'ordre relatif des éléments égaux",
      },
    ],
  },
  {
    name: "Tri par Sélection",
    color: "green",
    scenarios: [
      {
        name: "Petits tableaux",
        description: "Tableaux de moins de 50 éléments",
        suitability: "good",
        reason: "Simple et prévisible pour de petits tableaux",
      },
      {
        name: "Tableaux presque triés",
        description: "Tableaux où peu d'éléments sont mal placés",
        suitability: "poor",
        reason: "Toujours O(n²) même si le tableau est presque trié",
      },
      {
        name: "Grands tableaux",
        description: "Tableaux de plus de 1000 éléments",
        suitability: "poor",
        reason: "Inefficace pour les grands tableaux (O(n²))",
      },
      {
        name: "Environnements contraints",
        description: "Systèmes avec peu de mémoire disponible",
        suitability: "excellent",
        reason: "Utilise O(1) mémoire et minimise le nombre d'échanges",
      },
      {
        name: "Tri multi-critères",
        description: "Trier d'abord par un critère, puis par un autre",
        suitability: "poor",
        reason: "Instable, ne préserve pas l'ordre relatif des éléments égaux",
      },
    ],
  },
  {
    name: "Tri par Insertion",
    color: "amber",
    scenarios: [
      {
        name: "Petits tableaux",
        description: "Tableaux de moins de 50 éléments",
        suitability: "excellent",
        reason: "Très efficace pour les petits tableaux",
      },
      {
        name: "Tableaux presque triés",
        description: "Tableaux où peu d'éléments sont mal placés",
        suitability: "excellent",
        reason: "Approche O(n) pour les tableaux presque triés",
      },
      {
        name: "Grands tableaux",
        description: "Tableaux de plus de 1000 éléments",
        suitability: "poor",
        reason: "Inefficace pour les grands tableaux (O(n²))",
      },
      {
        name: "Environnements contraints",
        description: "Systèmes avec peu de mémoire disponible",
        suitability: "excellent",
        reason: "Utilise O(1) mémoire supplémentaire",
      },
      {
        name: "Tri multi-critères",
        description: "Trier d'abord par un critère, puis par un autre",
        suitability: "excellent",
        reason: "Stable, préserve l'ordre relatif des éléments égaux",
      },
    ],
  },
  {
    name: "Tri Fusion",
    color: "purple",
    scenarios: [
      {
        name: "Petits tableaux",
        description: "Tableaux de moins de 50 éléments",
        suitability: "fair",
        reason: "Surcharge inutile pour de très petits tableaux",
      },
      {
        name: "Tableaux presque triés",
        description: "Tableaux où peu d'éléments sont mal placés",
        suitability: "fair",
        reason: "Toujours O(n log n) même si le tableau est presque trié",
      },
      {
        name: "Grands tableaux",
        description: "Tableaux de plus de 1000 éléments",
        suitability: "excellent",
        reason: "Très efficace pour les grands tableaux (O(n log n))",
      },
      {
        name: "Environnements contraints",
        description: "Systèmes avec peu de mémoire disponible",
        suitability: "poor",
        reason: "Utilise O(n) mémoire supplémentaire",
      },
      {
        name: "Tri multi-critères",
        description: "Trier d'abord par un critère, puis par un autre",
        suitability: "excellent",
        reason: "Stable, préserve l'ordre relatif des éléments égaux",
      },
    ],
  },
  {
    name: "Tri Rapide",
    color: "red",
    scenarios: [
      {
        name: "Petits tableaux",
        description: "Tableaux de moins de 50 éléments",
        suitability: "fair",
        reason: "Surcharge inutile pour de très petits tableaux",
      },
      {
        name: "Tableaux presque triés",
        description: "Tableaux où peu d'éléments sont mal placés",
        suitability: "poor",
        reason: "Peut dégénérer en O(n²) pour des tableaux presque triés si le pivot est le premier ou le dernier élément (un pivot aléatoire ou la médiane de trois évite ce cas)",
      },
      {
        name: "Grands tableaux",
        description: "Tableaux de plus de 1000 éléments",
        suitability: "excellent",
        reason: "Très efficace pour les grands tableaux (O(n log n) en moyenne)",
      },
      {
        name: "Environnements contraints",
        description: "Systèmes avec peu de mémoire disponible",
        suitability: "good",
        reason: "Utilise O(log n) mémoire pour la pile d'appels",
      },
      {
        name: "Tri multi-critères",
        description: "Trier d'abord par un critère, puis par un autre",
        suitability: "poor",
        reason: "Instable, ne préserve pas l'ordre relatif des éléments égaux",
      },
    ],
  },
  {
    name: "Tri par Tas",
    color: "orange",
    scenarios: [
      {
        name: "Petits tableaux",
        description: "Tableaux de moins de 50 éléments",
        suitability: "fair",
        reason: "Surcharge inutile pour de très petits tableaux",
      },
      {
        name: "Tableaux presque triés",
        description: "Tableaux où peu d'éléments sont mal placés",
        suitability: "fair",
        reason: "Toujours O(n log n) même si le tableau est presque trié",
      },
      {
        name: "Grands tableaux",
        description: "Tableaux de plus de 1000 éléments",
        suitability: "excellent",
        reason: "Garantie O(n log n) dans tous les cas",
      },
      {
        name: "Environnements contraints",
        description: "Systèmes avec peu de mémoire disponible",
        suitability: "excellent",
        reason: "Utilise O(1) mémoire supplémentaire",
      },
      {
        name: "Tri multi-critères",
        description: "Trier d'abord par un critère, puis par un autre",
        suitability: "poor",
        reason: "Instable, ne préserve pas l'ordre relatif des éléments égaux",
      },
    ],
  },
];

// Fonction pour obtenir l'icône et la couleur en fonction de la pertinence
const getSuitabilityIcon = (suitability: string) => {
  switch (suitability) {
    case "excellent":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "good":
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    case "fair":
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case "poor":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

export function UsageChart() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(
    sortingAlgorithmsUsage[0].name
  );

  // Trouver l'algorithme sélectionné
  const algorithm = sortingAlgorithmsUsage.find(
    (algo) => algo.name === selectedAlgorithm
  ) || sortingAlgorithmsUsage[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Sélection de l'algorithme */}
        <div className="flex flex-wrap gap-2">
          {sortingAlgorithmsUsage.map((algo) => (
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
            </Button>
          ))}
        </div>

        {/* Tableau des cas d'usage */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left font-medium">Scénario</th>
                <th className="p-3 text-left font-medium">Pertinence</th>
                <th className="p-3 text-left font-medium">Raison</th>
              </tr>
            </thead>
            <tbody>
              {algorithm.scenarios.map((scenario) => (
                <tr key={scenario.name} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {scenario.description}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getSuitabilityIcon(scenario.suitability)}
                      <Badge
                        variant={
                          scenario.suitability === "poor"
                            ? "destructive"
                            : scenario.suitability === "excellent"
                            ? "default"
                            : "outline"
                        }
                      >
                        {scenario.suitability === "excellent"
                          ? "Excellent"
                          : scenario.suitability === "good"
                          ? "Bon"
                          : scenario.suitability === "fair"
                          ? "Moyen"
                          : "Mauvais"}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {scenario.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommandations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-green-950/30 border-green-800">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-green-300 flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                Recommandé pour
              </h3>
              <ul className="space-y-1">
                {algorithm.scenarios
                  .filter(
                    (s) => s.suitability === "excellent" || s.suitability === "good"
                  )
                  .map((s) => (
                    <li
                      key={s.name}
                      className="text-sm text-green-400 flex items-start gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5" />
                      <span>{s.name}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-950/30 border-red-800">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-red-300 flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4" />
                Déconseillé pour
              </h3>
              <ul className="space-y-1">
                {algorithm.scenarios
                  .filter((s) => s.suitability === "poor")
                  .map((s) => (
                    <li
                      key={s.name}
                      className="text-sm text-red-400 flex items-start gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5" />
                      <span>{s.name}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Résumé */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Résumé pour {algorithm.name}</h3>
          <p className="text-sm text-muted-foreground">
            {algorithm.name === "Tri à Bulles"
              ? "Simple mais inefficace, à utiliser uniquement pour de petits tableaux ou à des fins pédagogiques."
              : algorithm.name === "Tri par Sélection"
              ? "Minimise les échanges, mais toujours O(n²). Utile dans des environnements à mémoire limitée."
              : algorithm.name === "Tri par Insertion"
              ? "Excellent pour les petits tableaux ou les tableaux presque triés. Souvent utilisé comme partie d'algorithmes hybrides."
              : algorithm.name === "Tri Fusion"
              ? "Stable et efficace pour les grands tableaux, mais utilise plus de mémoire. Idéal pour les tris externes."
              : algorithm.name === "Tri Rapide"
              ? "Très rapide en pratique, mais peut dégénérer dans certains cas. Largement utilisé dans les bibliothèques standard."
              : "Garantit O(n log n) dans tous les cas et utilise peu de mémoire. Idéal pour les grands tableaux où la stabilité n'est pas requise."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
