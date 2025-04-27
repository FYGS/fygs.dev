"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplexityAnalysisGuide } from "./step-by-step/complexity-analysis-guide";
import { ProgressiveOptimization } from "./step-by-step/progressive-optimization";

export function StepByStepSolutions() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Solutions Étape par Étape</h2>
      <p className="text-muted-foreground">
        Apprenez à analyser et à optimiser des algorithmes avec ces guides interactifs.
        Ces exemples vous montrent comment aborder l&apos;analyse de complexité et l&apos;optimisation
        progressive d&apos;algorithmes courants.
      </p>
      
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Analyse de Complexité</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation Progressive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis">
          <ComplexityAnalysisGuide />
        </TabsContent>
        
        <TabsContent value="optimization">
          <ProgressiveOptimization />
        </TabsContent>
      </Tabs>
    </div>
  );
}
