"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { SortingAlgorithm } from "./types";

interface AlgorithmTabsProps {
  algorithm: SortingAlgorithm;
  onAlgorithmChange: (algorithm: SortingAlgorithm) => void;
}

export function AlgorithmTabs({
  algorithm,
  onAlgorithmChange,
}: AlgorithmTabsProps) {
  return (
    <Tabs
      value={algorithm}
      onValueChange={(value) => onAlgorithmChange(value as SortingAlgorithm)}
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
        <TabsTrigger value="bubble">
          Bulles
          <Badge variant="outline" className="ml-1 hidden md:inline-flex">
            O(n²)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="selection">
          Sélection
          <Badge variant="outline" className="ml-1 hidden md:inline-flex">
            O(n²)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="insertion">
          Insertion
          <Badge variant="outline" className="ml-1 hidden md:inline-flex">
            O(n²)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="merge">
          Fusion
          <Badge variant="outline" className="ml-1 hidden md:inline-flex">
            O(n log n)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="quick">
          Rapide
          <Badge variant="outline" className="ml-1 hidden md:inline-flex">
            O(n log n)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="heap">
          Tas
          <Badge variant="outline" className="ml-1 hidden md:inline-flex">
            O(n log n)
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
