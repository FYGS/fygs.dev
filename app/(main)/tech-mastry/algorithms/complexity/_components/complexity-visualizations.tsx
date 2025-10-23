"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplexityCurvesVisualization } from "./visualizations/complexity-curves-visualization";
import { SearchAlgorithmsVisualization } from "./visualizations/search-algorithms-visualization";
import { SortingAlgorithmsVisualization } from "./visualizations/sorting-algorithms-visualization";

export function ComplexityVisualizations() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visualisations Interactives</h2>
      <p className="text-muted-foreground">
        Explorez les différentes classes de complexité algorithmique à travers
        ces visualisations interactives. Ces outils vous aideront à mieux
        comprendre comment les performances des algorithmes évoluent en fonction
        de la taille des données d&apos;entrée.
      </p>

      <Tabs defaultValue="curves" className="space-y-4">
        <TabsList>
          <TabsTrigger value="curves">Courbes de Complexité</TabsTrigger>
          <TabsTrigger value="search">Algorithmes de Recherche</TabsTrigger>
          <TabsTrigger value="sort">Algorithmes de Tri</TabsTrigger>
        </TabsList>

        <TabsContent value="curves">
          <ComplexityCurvesVisualization />
        </TabsContent>

        <TabsContent value="search">
          <SearchAlgorithmsVisualization />
        </TabsContent>

        <TabsContent value="sort">
          <SortingAlgorithmsVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
}
