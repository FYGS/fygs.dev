"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { SortingTab } from "./types";

interface AlgorithmTabsProps {
  activeTab: SortingTab;
  onTabChange: (tab: SortingTab) => void;
}

export function AlgorithmTabs({ activeTab, onTabChange }: AlgorithmTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        onTabChange(value as "bubble" | "merge" | "quick")
      }
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="bubble">
          Tri à Bulles
          <Badge variant="outline" className="ml-2">
            O(n²)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="merge">
          Tri Fusion
          <Badge variant="outline" className="ml-2">
            O(n log n)
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="quick">
          Tri Rapide
          <Badge variant="outline" className="ml-2">
            O(n log n)
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bubble" className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">
          Le tri à bulles compare répétitivement les éléments adjacents et
          les échange s&apos;ils sont dans le mauvais ordre. Sa complexité
          est O(n²) dans le pire des cas, ce qui le rend inefficace pour les
          grands tableaux.
        </p>
      </TabsContent>

      <TabsContent value="merge" className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">
          Le tri fusion divise le tableau en deux moitiés, trie chaque
          moitié, puis fusionne les résultats. Sa complexité est O(n log n)
          dans tous les cas, ce qui le rend efficace même pour les grands
          tableaux.
        </p>
      </TabsContent>

      <TabsContent value="quick" className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">
          Le tri rapide choisit un élément pivot et partitionne le tableau
          autour de ce pivot. Sa complexité moyenne est O(n log n), mais
          peut atteindre O(n²) dans le pire des cas.
        </p>
      </TabsContent>
    </Tabs>
  );
}
