"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Zap } from "lucide-react";
import { useState } from "react";
import { CachingSettings } from "./caching/caching-settings";
import { CachingDetailedStats } from "./caching/caching-detailed-stats";
import { CachingStats } from "./caching/caching-stats";
import { CachingControls } from "./caching/caching-controls";
import { CachingCanvas } from "./caching/caching-canvas";
import { CachingStrategyBar } from "./caching/caching-strategy-bar";
import { useCachingSimulation } from "./caching/use-caching-simulation";

export function CachingVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");
  const [isRunning, setIsRunning] = useState(false);
  const [requestRate, setRequestRate] = useState(2);
  const [popularitySkew, setPopularitySkew] = useState(70);
  const [cacheSize, setCacheSize] = useState(5);

  const { cache, requests, stats, now, resetSimulation, toggleCache, changeStrategy } =
    useCachingSimulation({ isRunning, requestRate, popularitySkew, cacheSize });

  // Reset the simulation
  const handleReset = () => {
    setIsRunning(false);
    resetSimulation();
  };

  return (
    <Card className="border border-indigo-500/20 bg-background/60 backdrop-blur-xs shadow-lg shadow-indigo-500/5 rounded-xl overflow-hidden">
      <CardHeader className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-500/20">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500">
            <Zap className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
            Visualisation du Caching
          </span>
        </CardTitle>
        <CardDescription className="text-muted-foreground/90">
          Découvrez comment le caching améliore les performances en réduisant
          les accès à la base de données.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6 p-1 bg-background/80 border border-indigo-500/20 rounded-lg">
            <TabsTrigger
              value="visualization"
              className="data-[state=active]:bg-transparent data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Visualisation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <CachingStrategyBar cache={cache} changeStrategy={changeStrategy} toggleCache={toggleCache} />

            {/* Visualization Canvas */}
            <CachingCanvas cache={cache} requests={requests} now={now} />

            {/* Controls */}
            <CachingControls isRunning={isRunning} resetSimulation={handleReset} setIsRunning={setIsRunning} />

            {/* Stats */}
            <CachingStats stats={stats} />

            {/* Detailed Stats */}
            <CachingDetailedStats stats={stats} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CachingSettings cacheSize={cacheSize} popularitySkew={popularitySkew} requestRate={requestRate} setCacheSize={setCacheSize} setPopularitySkew={setPopularitySkew} setRequestRate={setRequestRate} />

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                Paramètres de Simulation
              </h3>
              <p className="text-sm text-muted-foreground">
                Ajustez les paramètres ci-dessus pour voir comment différentes
                configurations de cache affectent les performances. Augmentez la
                taille du cache pour stocker plus d&apos;éléments, ou modifiez
                la stratégie de remplacement pour voir l&apos;impact sur le taux
                de hit.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab("visualization")}
                className="bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Retour à la Visualisation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
