"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { SortingAlgorithmsVisualization } from "./sorting-algorithms-visualization";

export function SortingVisualizations() {
  const [arraySize, setArraySize] = useState(10);
  const [speed, setSpeed] = useState(50);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Visualisations d&apos;Algorithmes</h2>
        <p className="text-muted-foreground">
          Visualisations interactives pour comprendre le fonctionnement des différents algorithmes
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Taille du tableau</label>
            <input
              type="range"
              min="5"
              max="30"
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              className="w-32"
            />
            <div className="text-sm">{arraySize} éléments</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Vitesse</label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-32"
            />
            <div className="text-sm">{speed}%</div>
          </div>
        </div>

        <Tabs defaultValue="sorting" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="sorting">Tri</TabsTrigger>
            <TabsTrigger value="searching">Recherche</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sorting" className="mt-6">
            <SortingAlgorithmsVisualization 
              arraySize={arraySize} 
              speed={speed} 
            />
          </TabsContent>
          
          <TabsContent value="searching" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Les visualisations des algorithmes de recherche arrivent bientôt…
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}