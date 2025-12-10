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
        <h2 className="text-2xl font-bold">Algorithm Visualizations</h2>
        <p className="text-muted-foreground">
          Interactive visualizations to help you understand how different algorithms work
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Array Size</label>
            <input
              type="range"
              min="5"
              max="30"
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              className="w-32"
            />
            <div className="text-sm">{arraySize} elements</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Speed</label>
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
            <TabsTrigger value="sorting">Sorting</TabsTrigger>
            <TabsTrigger value="searching">Searching</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sorting" className="mt-6">
            <SortingAlgorithmsVisualization 
              arraySize={arraySize} 
              speed={speed} 
            />
          </TabsContent>
          
          <TabsContent value="searching" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Searching algorithm visualizations coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}