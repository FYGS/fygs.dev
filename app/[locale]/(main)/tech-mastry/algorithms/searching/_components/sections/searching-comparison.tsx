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
import { useEffect, useState } from "react";
import { PerformanceChart } from "./charts/performance-chart";

// Types pour les données de comparaison
type ComparisonMetric = "performance" | "memory" | "usage";

export function SearchingComparison() {
  const [metric, setMetric] = useState<ComparisonMetric>("performance");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Délai court pour permettre au DOM de se charger
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`space-y-8 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
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
                  <Card className="p-4 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="text-2xl font-bold text-primary flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary/30"></span>
                      O(1)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Meilleur cas pour tous
                    </div>
                  </Card>
                  <Card className="p-4 border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500/30"></span>
                      O(log n)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Recherche binaire
                    </div>
                  </Card>
                  <Card className="p-4 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500/30"></span>
                      O(log log n)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Recherche par interpolation
                    </div>
                  </Card>
                  <Card className="p-4 border border-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/30"></span>
                      O(n)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
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
                  <Card className="p-4 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500/30"></span>
                      O(1)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Recherche linéaire, binaire, par saut, par interpolation
                    </div>
                  </Card>
                  <Card className="p-4 border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500/30"></span>
                      O(n)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
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
                  <div className="space-y-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Recherche Linéaire
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Petits ensembles de données
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Données non triées
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Recherches peu fréquentes
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Recherche Binaire
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Grands ensembles de données triés
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Recherches fréquentes
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Lorsque la performance est critique
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Recherche par Interpolation
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Données uniformément distribuées
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Grands tableaux triés
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Optimisation avancée
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Recherche par Hachage
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Recherches très fréquentes
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
                          Lorsque la mémoire n&apos;est pas un problème
                        </span>
                      </li>
                      <li className="flex items-start gap-2 group transition-all duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 group-hover:bg-primary/80 transition-all duration-300" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-all duration-300">
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
