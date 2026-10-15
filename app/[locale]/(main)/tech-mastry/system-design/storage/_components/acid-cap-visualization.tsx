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
import { Database, Shield, SplitSquareVertical } from "lucide-react";
import { useState } from "react";
import { AcidCapExplanation } from "./acid-cap/acid-cap-explanation";
import { CapView } from "./acid-cap/cap-view";
import { AcidView } from "./acid-cap/acid-view";

export function AcidCapVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for active visualization (ACID or CAP)
  const [activeVisualization, setActiveVisualization] = useState<
    "acid" | "cap"
  >("acid");

  // State for active ACID property
  const [activeAcidProperty, setActiveAcidProperty] = useState<
    "atomicity" | "consistency" | "isolation" | "durability"
  >("atomicity");

  // State for active CAP property
  const [activeCapProperty, setActiveCapProperty] = useState<
    "consistency" | "availability" | "partition-tolerance"
  >("consistency");

  // State for database type in CAP visualization
  const [databaseType, setDatabaseType] = useState<"cp" | "ap" | "ca">("cp");

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Propriétés ACID & Théorème CAP
        </CardTitle>
        <CardDescription>
          Comprendre les garanties transactionnelles et les compromis des
          systèmes distribués
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Visualization Type Selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md border p-1 bg-muted/30">
                <Button
                  variant={activeVisualization === "acid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveVisualization("acid")}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>ACID</span>
                </Button>
                <Button
                  variant={activeVisualization === "cap" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveVisualization("cap")}
                  className="flex items-center gap-1"
                >
                  <SplitSquareVertical className="h-4 w-4" />
                  <span>CAP</span>
                </Button>
              </div>
            </div>

            {/* ACID Visualization */}
            {activeVisualization === "acid" && (
              <AcidView activeAcidProperty={activeAcidProperty} setActiveAcidProperty={setActiveAcidProperty} />
            )}

            {/* CAP Visualization */}
            {activeVisualization === "cap" && (
              <CapView activeCapProperty={activeCapProperty} databaseType={databaseType} setActiveCapProperty={setActiveCapProperty} setDatabaseType={setDatabaseType} />
            )}
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <AcidCapExplanation />

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Comparaison ACID vs BASE
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left border">Critère</th>
                      <th className="p-2 text-left border">ACID</th>
                      <th className="p-2 text-left border">BASE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">Signification</td>
                      <td className="p-2 border">
                        Atomicité, Cohérence, Isolation, Durabilité
                      </td>
                      <td className="p-2 border">
                        Basically Available, Soft state, Eventually consistent
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Priorité</td>
                      <td className="p-2 border">
                        Cohérence et intégrité des données
                      </td>
                      <td className="p-2 border">
                        Disponibilité et performances
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Cohérence</td>
                      <td className="p-2 border">Forte et immédiate</td>
                      <td className="p-2 border">Éventuelle</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Disponibilité</td>
                      <td className="p-2 border">
                        Peut être limitée pour garantir la cohérence
                      </td>
                      <td className="p-2 border">
                        Haute, même en cas de panne partielle
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">
                        Mise à l&apos;échelle
                      </td>
                      <td className="p-2 border">
                        Plus difficile, souvent verticale
                      </td>
                      <td className="p-2 border">Plus facile, horizontale</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">
                        Cas d&apos;usage
                      </td>
                      <td className="p-2 border">
                        Systèmes financiers, transactions bancaires
                      </td>
                      <td className="p-2 border">
                        Réseaux sociaux, systèmes de recommandation
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Exemples</td>
                      <td className="p-2 border">
                        PostgreSQL, MySQL, SQL Server
                      </td>
                      <td className="p-2 border">
                        Cassandra, DynamoDB, CouchDB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Niveaux d&apos;Isolation SQL Standard
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">Read Uncommitted</span> - Le
                      niveau le plus bas. Permet les lectures sales,
                      non-répétables et fantômes.
                    </li>
                    <li>
                      <span className="font-medium">Read Committed</span> -
                      Empêche les lectures sales, mais permet les lectures
                      non-répétables et fantômes.
                    </li>
                    <li>
                      <span className="font-medium">Repeatable Read</span> -
                      Empêche les lectures sales et non-répétables, mais permet
                      les lectures fantômes.
                    </li>
                    <li>
                      <span className="font-medium">Serializable</span> - Le
                      niveau le plus élevé. Empêche tous les problèmes de
                      concurrence.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Modèles de Cohérence dans les Systèmes Distribués
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">Cohérence forte</span> -
                      Toutes les lectures renvoient la dernière valeur écrite.
                    </li>
                    <li>
                      <span className="font-medium">Cohérence éventuelle</span>{" "}
                      - Les mises à jour se propagent éventuellement à tous les
                      nœuds.
                    </li>
                    <li>
                      <span className="font-medium">Cohérence causale</span> -
                      Les opérations liées causalement sont vues dans le même
                      ordre par tous les nœuds.
                    </li>
                    <li>
                      <span className="font-medium">Cohérence de session</span>{" "}
                      - Un client voit ses propres opérations dans l&apos;ordre,
                      mais pas nécessairement celles des autres.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-3">
                  Compromis et Considérations
                </h4>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Quand choisir ACID?
                    </h5>
                    <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Applications financières ou bancaires</li>
                      <li>Systèmes de réservation</li>
                      <li>
                        Applications nécessitant une forte intégrité des données
                      </li>
                      <li>Systèmes de gestion d&apos;inventaire</li>
                      <li>
                        Applications avec des contraintes réglementaires
                        strictes
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Quand choisir BASE/CAP?
                    </h5>
                    <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Applications à très grande échelle</li>
                      <li>Réseaux sociaux et plateformes de contenu</li>
                      <li>Systèmes d&apos;analyse de données massives</li>
                      <li>Applications où la disponibilité est critique</li>
                      <li>Systèmes géographiquement distribués</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-md">
                    <h5 className="text-sm font-medium mb-2 text-blue-300">
                      Tendances Modernes
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      De nombreux systèmes modernes adoptent une approche
                      hybride, offrant différents niveaux de garanties selon les
                      besoins. Par exemple, Google Spanner et CockroachDB
                      tentent de combiner la cohérence forte d&apos;ACID avec la
                      mise à l&apos;échelle horizontale des systèmes distribués,
                      tandis que certaines bases NoSQL offrent des options de
                      cohérence ajustables.
                    </p>
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
