"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { dataStructures } from "./data";
import type { DataStructureType } from "./types";

interface UseCasesGridProps {
  selectedStructures: DataStructureType[];
}

export function UseCasesGrid({ selectedStructures }: UseCasesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {selectedStructures.map((type) => (
        <Card key={type} className="overflow-hidden">
          <CardHeader className="bg-muted py-3">
            <CardTitle className="text-lg">
              {dataStructures[type].name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {dataStructures[type].description}
            </p>
            <h4 className="text-sm font-medium mb-2">
              Cas d&apos;utilisation:
            </h4>
            <ul className="space-y-1">
              {dataStructures[type].useCases.map((useCase, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
