"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { useState } from "react";
import { PerformanceChart } from "./charts/performance-chart";

// Types pour les données de comparaison
type ComparisonMetric = "performance" | "memory" | "usage";

export function SearchingComparison() {
  const [metric, setMetric] = useState<ComparisonMetric>("performance");

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Comparaison des Algorithmes</h2>
        <p className="text-muted-foreground">
          Comparez les différents algorithmes de recherche selon plusieurs
          métriques.
        </p>
      </div>

      {/* Sélection de la métrique */}
      <Tabs
        value={metric}
        onValueChange={(value) => setMetric(value as ComparisonMetric)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Mémoire
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Utilisation
          </TabsTrigger>
        </TabsList>

        {/* Contenu des métriques */}
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison de Performance</CardTitle>
              <CardDescription>
                Temps d&apos;exécution des algorithmes selon la taille des
                données
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <PerformanceChart metric="performance" />

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Analyse de Performance</h3>
                <p className="text-muted-foreground">
                  La recherche linéaire a une complexité de O(n), ce qui la rend
                  inefficace pour les grands ensembles de données. La recherche
                  binaire, avec sa complexité de O(log n), est beaucoup plus
                  rapide pour les grands tableaux triés. La recherche par
                  interpolation peut atteindre O(log log n) dans des conditions
                  idéales, mais peut se dégrader à O(n) dans le pire des cas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-primary">O(1)</div>
                    <div className="text-sm text-muted-foreground">
                      Meilleur cas pour tous
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-amber-500">
                      O(log n)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recherche binaire
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-green-500">
                      O(log log n)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recherche par interpolation
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-red-500">O(n)</div>
                    <div className="text-sm text-muted-foreground">
                      Recherche linéaire
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Utilisation de la Mémoire</CardTitle>
              <CardDescription>
                Consommation de mémoire des différents algorithmes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <PerformanceChart metric="memory" />

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Analyse de la Mémoire</h3>
                <p className="text-muted-foreground">
                  La plupart des algorithmes de recherche ont une complexité
                  spatiale de O(1), car ils n&apos;utilisent qu&apos;une
                  quantité constante de mémoire supplémentaire. La recherche par
                  hachage est une exception, avec une complexité spatiale de
                  O(n) due à la construction de la table de hachage.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-green-500">
                      O(1)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recherche linéaire, binaire, par saut, par interpolation
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-amber-500">
                      O(n)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recherche par hachage, arbres binaires
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cas d&apos;Utilisation</CardTitle>
              <CardDescription>
                Quand utiliser chaque algorithme de recherche
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <PerformanceChart metric="usage" />

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recherche Linéaire</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Petits ensembles de données
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Données non triées
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Recherches peu fréquentes
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recherche Binaire</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Grands ensembles de données triés
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Recherches fréquentes
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Lorsque la performance est critique
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Recherche par Interpolation
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Données uniformément distribuées
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Grands tableaux triés
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Optimisation avancée
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Recherche par Hachage
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Recherches très fréquentes
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Lorsque la mémoire n&apos;est pas un problème
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span className="text-muted-foreground">
                          Dictionnaires et ensembles
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
