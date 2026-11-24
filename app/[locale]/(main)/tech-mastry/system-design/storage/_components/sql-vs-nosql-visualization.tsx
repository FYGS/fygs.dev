"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";
import { useState } from "react";
import { QueryControls } from "./sql-vs-nosql/query-controls";
import { GraphDatabaseView } from "./sql-vs-nosql/graph-database-view";
import { ColumnFamilyView } from "./sql-vs-nosql/column-family-view";
import { KeyValueStoreView } from "./sql-vs-nosql/key-value-store-view";
import { DocumentStoreView } from "./sql-vs-nosql/document-store-view";
import { SqlView } from "./sql-vs-nosql/sql-view";
import { DatabaseTypeSelector } from "./sql-vs-nosql/database-type-selector";

export function SqlVsNoSqlVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for selected database type
  const [dbType, setDbType] = useState<"sql" | "nosql">("sql");

  // State for selected NoSQL type
  const [nosqlType, setNosqlType] = useState<
    "document" | "key-value" | "column" | "graph"
  >("document");

  // State for query being shown
  const [queryType, setQueryType] = useState<
    "simple" | "complex" | "aggregation" | "update"
  >("simple");

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          SQL vs NoSQL
        </CardTitle>
        <CardDescription>
          Comparez les bases de données relationnelles et non-relationnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Database Type Selector */}
            <DatabaseTypeSelector dbType={dbType} nosqlType={nosqlType} setDbType={setDbType} setNosqlType={setNosqlType} />

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
              {dbType === "sql" ? (
                <SqlView queryType={queryType} />
              ) : (
                <div className="p-4 h-full flex flex-col">
                  {/* NoSQL Database Visualization */}
                  <div className="flex gap-4 h-full">
                    {nosqlType === "document" && (
                      <DocumentStoreView queryType={queryType} />
                    )}

                    {nosqlType === "key-value" && (
                      <KeyValueStoreView queryType={queryType} />
                    )}

                    {nosqlType === "column" && (
                      <ColumnFamilyView queryType={queryType} />
                    )}

                    {nosqlType === "graph" && (
                      <GraphDatabaseView queryType={queryType} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Query Controls - Will be implemented in next steps */}
            <QueryControls queryType={queryType} setQueryType={setQueryType} />
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bases de Données SQL</h3>
                <p className="text-muted-foreground">
                  Les bases de données SQL (Structured Query Language) sont
                  relationnelles et organisent les données dans des tables avec
                  des schémas prédéfinis.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Caractéristiques</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Schéma fixe et prédéfini</li>
                    <li>Relations entre tables (clés étrangères)</li>
                    <li>Transactions ACID</li>
                    <li>Langage SQL standardisé</li>
                    <li>Mise à l&apos;échelle verticale principalement</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Bases de Données NoSQL
                </h3>
                <p className="text-muted-foreground">
                  Les bases de données NoSQL (Not Only SQL) sont
                  non-relationnelles et offrent une flexibilité de schéma pour
                  différents types de données.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Caractéristiques</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Schéma flexible ou sans schéma</li>
                    <li>
                      Différents modèles de données (document, clé-valeur, etc.)
                    </li>
                    <li>Mise à l&apos;échelle horizontale facilitée</li>
                    <li>Performances élevées pour certains cas d&apos;usage</li>
                    <li>Cohérence éventuelle (selon le type)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Comparaison SQL vs NoSQL
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left border">Critère</th>
                      <th className="p-2 text-left border">SQL</th>
                      <th className="p-2 text-left border">NoSQL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">Structure</td>
                      <td className="p-2 border">
                        Tables avec lignes et colonnes
                      </td>
                      <td className="p-2 border">
                        Documents, paires clé-valeur, colonnes ou graphes
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Schéma</td>
                      <td className="p-2 border">Fixe et prédéfini</td>
                      <td className="p-2 border">Flexible ou sans schéma</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Requêtes</td>
                      <td className="p-2 border">SQL standardisé</td>
                      <td className="p-2 border">
                        Varie selon la base de données
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Relations</td>
                      <td className="p-2 border">Jointures entre tables</td>
                      <td className="p-2 border">
                        Généralement dénormalisé, données imbriquées
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Transactions</td>
                      <td className="p-2 border">ACID complet</td>
                      <td className="p-2 border">
                        Varie (souvent BASE, certains supportent ACID)
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Évolutivité</td>
                      <td className="p-2 border">Verticale principalement</td>
                      <td className="p-2 border">Horizontale facilitée</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">
                        Cas d&apos;usage
                      </td>
                      <td className="p-2 border">
                        Applications avec schéma stable et relations complexes
                      </td>
                      <td className="p-2 border">
                        Big data, contenu varié, évolution rapide du schéma
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Quand choisir SQL?
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Données structurées avec schéma stable</li>
                    <li>Relations complexes entre entités</li>
                    <li>Besoin de transactions ACID</li>
                    <li>Requêtes complexes avec jointures</li>
                    <li>Analyses et rapports avancés</li>
                    <li>Applications financières ou de comptabilité</li>
                  </ul>
                  <div className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Exemples:</span> MySQL,
                    PostgreSQL, Oracle, SQL Server
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Quand choisir NoSQL?
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Données non structurées ou semi-structurées</li>
                    <li>Schéma évolutif ou inconnu à l&apos;avance</li>
                    <li>Grands volumes de données</li>
                    <li>Besoin de mise à l&apos;échelle horizontale</li>
                    <li>Développement rapide et itératif</li>
                    <li>Applications temps réel ou IoT</li>
                  </ul>
                  <div className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Exemples:</span> MongoDB,
                    Redis, Cassandra, Neo4j
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
