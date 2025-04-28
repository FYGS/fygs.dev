"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, BarChart3, Clock, HardDrive, Zap } from "lucide-react";
import { useState } from "react";

// Importer les composants de graphique
import { MemoryChart } from "./charts/memory-chart";
import { PerformanceChart } from "./charts/performance-chart";
import { StabilityChart } from "./charts/stability-chart";
import { UsageChart } from "./charts/usage-chart";
import { RealtimePerformance } from "./charts/realtime-performance";

// Types pour la comparaison
type ComparisonType =
  | "performance"
  | "realtime"
  | "memory"
  | "stability"
  | "usage";

export function SortingComparison() {
  const [comparisonType, setComparisonType] =
    useState<ComparisonType>("performance");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-primary" />
            Comparaison des Algorithmes
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection du type de comparaison */}
          <Tabs
            value={comparisonType}
            onValueChange={(value) =>
              setComparisonType(value as ComparisonType)
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="performance" className="gap-2">
                <Clock className="w-4 h-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="realtime" className="gap-2">
                <Clock className="w-4 h-4" />
                <span>Temps réel</span>
              </TabsTrigger>
              <TabsTrigger value="memory" className="gap-2">
                <HardDrive className="w-4 h-4" />
                <span>Mémoire</span>
              </TabsTrigger>
              <TabsTrigger value="stability" className="gap-2">
                <Zap className="w-4 h-4" />
                <span>Stabilité</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Cas d&apos;usage</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenu des onglets */}
            <TabsContent value="performance" className="mt-6">
              <PerformanceChart />
            </TabsContent>

            <TabsContent value="realtime" className="mt-6">
              <RealtimePerformance />
            </TabsContent>

            <TabsContent value="memory" className="mt-6">
              <MemoryChart />
            </TabsContent>

            <TabsContent value="stability" className="mt-6">
              <StabilityChart />
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <UsageChart />
            </TabsContent>
          </Tabs>

          {/* Tableau de comparaison */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left font-medium text-sm">
                    Algorithme
                  </th>
                  <th className="p-2 text-left font-medium text-sm">
                    Meilleur cas
                  </th>
                  <th className="p-2 text-left font-medium text-sm">
                    Cas moyen
                  </th>
                  <th className="p-2 text-left font-medium text-sm">
                    Pire cas
                  </th>
                  <th className="p-2 text-left font-medium text-sm">Espace</th>
                  <th className="p-2 text-left font-medium text-sm">
                    Stabilité
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tri à Bulles</td>
                  <td className="p-2">O(n)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(1)</td>
                  <td className="p-2">
                    <Badge variant="default">Stable</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tri par Sélection</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(1)</td>
                  <td className="p-2">
                    <Badge variant="destructive">Instable</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tri par Insertion</td>
                  <td className="p-2">O(n)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(1)</td>
                  <td className="p-2">
                    <Badge variant="default">Stable</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tri Fusion</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n)</td>
                  <td className="p-2">
                    <Badge variant="default">Stable</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tri Rapide</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n²)</td>
                  <td className="p-2">O(log n)</td>
                  <td className="p-2">
                    <Badge variant="destructive">Instable</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Tri par Tas</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(n log n)</td>
                  <td className="p-2">O(1)</td>
                  <td className="p-2">
                    <Badge variant="destructive">Instable</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
