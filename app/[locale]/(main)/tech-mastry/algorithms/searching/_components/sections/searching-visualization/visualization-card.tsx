"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

import { SearchLegend } from "./search-legend";
import type { AlgorithmType, ArrayElement } from "./types";

interface VisualizationCardProps {
  algorithm: AlgorithmType;
  array: ArrayElement[];
  currentStep: number;
  totalSteps: number;
  result: string;
}

export function VisualizationCard({
  algorithm,
  array,
  currentStep,
  totalSteps,
  result,
}: VisualizationCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Visualisation
            </CardTitle>
            <CardDescription>
              {algorithm === "linear" && "Parcours séquentiel du tableau"}
              {algorithm === "binary" &&
                "Division répétitive de l'espace de recherche"}
              {algorithm === "jump" &&
                "Sauts par blocs puis recherche linéaire"}
              {algorithm === "interpolation" &&
                "Estimation de la position par interpolation"}
            </CardDescription>
          </div>

          {/* Indicateur de progression */}
          {totalSteps > 0 && (
            <div className="text-sm text-muted-foreground">
              Étape {currentStep} / {totalSteps}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-8">
        {/* Affichage du tableau */}
        <div className="flex flex-wrap gap-2 justify-center py-8">
          {array.map((item, index) => (
            <div
              key={index}
              className={`
                  w-12 h-12 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-300
                  ${
                    item.state === "default"
                      ? "bg-muted border-muted-foreground/20"
                      : ""
                  }
                  ${
                    item.state === "current"
                      ? "bg-amber-900/30 border-amber-500 text-amber-300"
                      : ""
                  }
                  ${
                    item.state === "searching"
                      ? "bg-blue-900/30 border-blue-500 text-blue-300"
                      : ""
                  }
                  ${
                    item.state === "found"
                      ? "bg-green-900/30 border-green-500 text-green-300"
                      : ""
                  }
                  ${
                    item.state === "not-found"
                      ? "bg-red-900/30 border-red-500 text-red-300"
                      : ""
                  }
                `}
            >
              {item.value}
            </div>
          ))}
        </div>

        {/* Résultat de la recherche */}
        {result && (
          <div
            className={`text-center p-4 rounded-md mt-4 ${
                result.includes("trouvé")
                  ? "bg-green-900/30 text-green-300"
                  : "bg-red-900/30 text-red-300"
              }`}
          >
            {result}
          </div>
        )}

        <SearchLegend />
      </CardContent>
    </Card>
  );
}
