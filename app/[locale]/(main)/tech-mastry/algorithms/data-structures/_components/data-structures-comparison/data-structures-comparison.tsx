"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { OperationsTable } from "./operations-table";
import { ProsConsGrid } from "./pros-cons-grid";
import { StructureSelector } from "./structure-selector";
import type { DataStructureType } from "./types";
import { UseCasesGrid } from "./use-cases-grid";

// Composant de comparaison des structures de données
export function DataStructuresComparison() {
  const [selectedStructures, setSelectedStructures] = useState<
    DataStructureType[]
  >(["array", "linkedList"]);
  const [comparisonType, setComparisonType] = useState<
    "operations" | "useCases" | "prosCons"
  >("operations");

  // Ajouter ou supprimer une structure de la sélection
  const toggleStructure = (type: DataStructureType) => {
    if (selectedStructures.includes(type)) {
      if (selectedStructures.length > 1) {
        setSelectedStructures(selectedStructures.filter((s) => s !== type));
      }
    } else {
      setSelectedStructures([...selectedStructures, type]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des Structures de Données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection des structures */}
        <StructureSelector
          selectedStructures={selectedStructures}
          onToggle={toggleStructure}
        />

        {/* Type de comparaison */}
        <Tabs
          value={comparisonType}
          onValueChange={(value) =>
            setComparisonType(value as "operations" | "useCases" | "prosCons")
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operations">Opérations</TabsTrigger>
            <TabsTrigger value="useCases">Cas d&apos;utilisation</TabsTrigger>
            <TabsTrigger value="prosCons">Avantages/Inconvénients</TabsTrigger>
          </TabsList>

          {/* Comparaison des opérations */}
          <TabsContent value="operations" className="pt-4">
            <OperationsTable selectedStructures={selectedStructures} />
          </TabsContent>

          {/* Comparaison des cas d'utilisation */}
          <TabsContent value="useCases" className="pt-4">
            <UseCasesGrid selectedStructures={selectedStructures} />
          </TabsContent>

          {/* Comparaison des avantages/inconvénients */}
          <TabsContent value="prosCons" className="pt-4">
            <ProsConsGrid selectedStructures={selectedStructures} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
