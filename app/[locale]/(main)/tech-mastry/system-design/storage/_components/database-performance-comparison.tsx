"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";
import { useState } from "react";

export function DatabasePerformanceComparison() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Comparaison de Performance des Bases de Données
        </CardTitle>
        <CardDescription>
          Analyse comparative des performances des différents types de bases de
          données
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
              <div className="p-4 h-full flex flex-col">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-medium">
                    Comparaison de Performance des Bases de Données
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ordres de grandeur illustratifs (ms), non issus d&apos;un benchmark réel
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Read Performance Chart */}
                  <div className="border rounded-md p-4 bg-card">
                    <h4 className="text-sm font-medium mb-3">
                      Performance de Lecture
                    </h4>
                    <div className="h-[200px] flex items-end gap-2">
                      {/* SQL Read */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-blue-500 rounded-t-sm"
                          style={{ height: "40px" }}
                        ></div>
                        <div className="mt-2 text-xs">SQL</div>
                        <div className="text-xs text-muted-foreground">
                          40ms
                        </div>
                      </div>

                      {/* Document Read */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-green-500 rounded-t-sm"
                          style={{ height: "20px" }}
                        ></div>
                        <div className="mt-2 text-xs">Document</div>
                        <div className="text-xs text-muted-foreground">
                          20ms
                        </div>
                      </div>

                      {/* Key-Value Read */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-amber-500 rounded-t-sm"
                          style={{ height: "5px" }}
                        ></div>
                        <div className="mt-2 text-xs">Clé-Valeur</div>
                        <div className="text-xs text-muted-foreground">5ms</div>
                      </div>

                      {/* In-Memory Read */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-purple-500 rounded-t-sm"
                          style={{ height: "1px" }}
                        ></div>
                        <div className="mt-2 text-xs">En Mémoire</div>
                        <div className="text-xs text-muted-foreground">1ms</div>
                      </div>
                    </div>
                  </div>

                  {/* Write Performance Chart */}
                  <div className="border rounded-md p-4 bg-card">
                    <h4 className="text-sm font-medium mb-3">
                      Performance d&apos;Écriture
                    </h4>
                    <div className="h-[200px] flex items-end gap-2">
                      {/* SQL Write */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-blue-500 rounded-t-sm"
                          style={{ height: "80px" }}
                        ></div>
                        <div className="mt-2 text-xs">SQL</div>
                        <div className="text-xs text-muted-foreground">
                          80ms
                        </div>
                      </div>

                      {/* Document Write */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-green-500 rounded-t-sm"
                          style={{ height: "30px" }}
                        ></div>
                        <div className="mt-2 text-xs">Document</div>
                        <div className="text-xs text-muted-foreground">
                          30ms
                        </div>
                      </div>

                      {/* Key-Value Write */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-amber-500 rounded-t-sm"
                          style={{ height: "10px" }}
                        ></div>
                        <div className="mt-2 text-xs">Clé-Valeur</div>
                        <div className="text-xs text-muted-foreground">
                          10ms
                        </div>
                      </div>

                      {/* In-Memory Write */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-purple-500 rounded-t-sm"
                          style={{ height: "2px" }}
                        ></div>
                        <div className="mt-2 text-xs">En Mémoire</div>
                        <div className="text-xs text-muted-foreground">2ms</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-slate-800 rounded-md text-xs">
                  <div className="font-medium mb-1">Notes:</div>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>
                      Les performances réelles varient selon la configuration
                      matérielle et logicielle
                    </li>
                    <li>
                      Les bases de données SQL excellent dans les requêtes
                      complexes malgré des temps de réponse plus longs
                    </li>
                    <li>
                      Les bases de données en mémoire offrent les meilleures
                      performances mais avec des contraintes de capacité
                    </li>
                    <li>
                      Les bases clé-valeur sont optimisées pour les opérations
                      simples à grande échelle
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Facteurs de Performance
                </h3>
                <p className="text-muted-foreground">
                  Les performances des bases de données dépendent de nombreux
                  facteurs, notamment le modèle de données, l&apos;indexation,
                  la mise en cache, le matériel, et les patterns d&apos;accès
                  spécifiques à l&apos;application.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Métriques Clés</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Temps de réponse des requêtes</li>
                    <li>Débit (requêtes par seconde)</li>
                    <li>Latence</li>
                    <li>Utilisation des ressources (CPU, mémoire, I/O)</li>
                    <li>Évolutivité sous charge</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comparaison Générale</h3>
                <div className="space-y-2">
                  <h4 className="font-medium">
                    Bases de Données Relationnelles
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Excellentes pour les requêtes complexes et les transactions,
                    mais peuvent rencontrer des limitations d&apos;évolutivité
                    pour les très grands volumes de données.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Bases de Données NoSQL</h4>
                  <p className="text-sm text-muted-foreground">
                    Généralement plus performantes pour les opérations simples à
                    grande échelle, mais avec des capacités de requêtes plus
                    limitées que les bases relationnelles.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Bases de Données en Mémoire</h4>
                  <p className="text-sm text-muted-foreground">
                    Offrent les meilleures performances en termes de latence,
                    mais avec des contraintes de capacité et un coût plus élevé.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Cas d&apos;Usage Optimaux
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Lectures Intensives
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Bases de données en colonnes (Vertica, ClickHouse)</li>
                    <li>Bases de données en mémoire (Redis)</li>
                    <li>
                      Bases de données de documents avec indexation (MongoDB)
                    </li>
                    <li>
                      Bases de données relationnelles avec réplication de
                      lecture
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Écritures Intensives
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Bases de données clé-valeur (DynamoDB, Cassandra)</li>
                    <li>
                      Bases de données de séries temporelles (InfluxDB,
                      TimescaleDB)
                    </li>
                    <li>Bases de données avec journalisation append-only</li>
                    <li>Bases de données avec sharding horizontal</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Requêtes Complexes
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Bases de données relationnelles (PostgreSQL, MySQL)</li>
                    <li>Bases de données graphes (Neo4j) pour les relations</li>
                    <li>Bases de données analytiques (Snowflake, BigQuery)</li>
                    <li>Bases de données avec moteurs de recherche intégrés</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
