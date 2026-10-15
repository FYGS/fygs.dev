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
import { Network } from "lucide-react";
import { useState } from "react";
import { MicroservicesArchitecture } from "./microservices/microservices-architecture";
import { MonolithicArchitecture } from "./microservices/monolithic-architecture";

export function MicroservicesVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");
  const [selectedArchitecture, setSelectedArchitecture] = useState<
    "monolithic" | "microservices"
  >("monolithic");
  const [selectedScenario, setSelectedScenario] = useState<
    "normal" | "high-load" | "failure"
  >("normal");

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Monolithique vs Microservices
        </CardTitle>
        <CardDescription>
          Comparez les architectures monolithiques et microservices dans
          différents scénarios
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Architecture Selection */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  selectedArchitecture === "monolithic" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedArchitecture("monolithic")}
              >
                Architecture Monolithique
              </Button>
              <Button
                variant={
                  selectedArchitecture === "microservices"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setSelectedArchitecture("microservices")}
              >
                Architecture Microservices
              </Button>
            </div>

            {/* Scenario Selection */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedScenario === "normal" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedScenario("normal")}
              >
                Charge Normale
              </Button>
              <Button
                variant={
                  selectedScenario === "high-load" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedScenario("high-load")}
              >
                Charge Élevée
              </Button>
              <Button
                variant={selectedScenario === "failure" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedScenario("failure")}
              >
                Défaillance
              </Button>
            </div>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[500px] border rounded-lg bg-background/50 overflow-hidden">
              {selectedArchitecture === "monolithic" ? (
                <MonolithicArchitecture scenario={selectedScenario} />
              ) : (
                <MicroservicesArchitecture scenario={selectedScenario} />
              )}
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="text-sm font-medium mb-2">Explication</h3>
              <p className="text-sm text-muted-foreground">
                {selectedArchitecture === "monolithic"
                  ? selectedScenario === "normal"
                    ? "Dans une architecture monolithique sous charge normale, toutes les fonctionnalités sont gérées par une seule application. Les requêtes sont traitées de manière séquentielle, ce qui est efficace pour des applications simples avec un trafic modéré."
                    : selectedScenario === "high-load"
                    ? "Sous charge élevée, une architecture monolithique peut devenir un goulot d'étranglement. Toute l'application doit être mise à l'échelle ensemble, même si seule une partie spécifique est sous pression, ce qui entraîne une utilisation inefficace des ressources."
                    : "En cas de défaillance dans une architecture monolithique, l'ensemble de l'application peut être affecté. Un bug dans n'importe quelle partie du code peut potentiellement faire tomber tout le système."
                  : selectedScenario === "normal"
                  ? "Dans une architecture microservices sous charge normale, chaque fonctionnalité est gérée par un service indépendant. Les services communiquent entre eux via des API, ce qui permet une meilleure séparation des préoccupations et une maintenance plus facile."
                  : selectedScenario === "high-load"
                  ? "Sous charge élevée, une architecture microservices permet de mettre à l'échelle uniquement les services qui en ont besoin. Par exemple, le service de paiement peut être mis à l'échelle indépendamment du service de catalogue produit."
                  : "En cas de défaillance dans une architecture microservices, seul le service concerné est affecté. Les autres services peuvent continuer à fonctionner normalement, ce qui améliore la résilience globale du système."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Architecture Monolithique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Avantages</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Développement initial plus simple et rapide</li>
                      <li>Déploiement plus facile (une seule application)</li>
                      <li>Moins de complexité opérationnelle</li>
                      <li>Transactions plus simples à gérer</li>
                      <li>
                        Latence plus faible (pas d&apos;appels réseau entre
                        composants)
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Inconvénients</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        Mise à l&apos;échelle de toute l&apos;application
                        nécessaire
                      </li>
                      <li>Base de code qui devient complexe avec le temps</li>
                      <li>Difficile à maintenir pour les grandes équipes</li>
                      <li>Un bug peut affecter tout le système</li>
                      <li>Adoption de nouvelles technologies limitée</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Architecture Microservices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Avantages</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Mise à l&apos;échelle indépendante des services</li>
                      <li>
                        Équipes autonomes travaillant sur des services distincts
                      </li>
                      <li>Meilleure résilience (défaillance isolée)</li>
                      <li>
                        Flexibilité technologique (différentes technologies par
                        service)
                      </li>
                      <li>Déploiements plus fréquents et moins risqués</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Inconvénients</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Complexité opérationnelle accrue</li>
                      <li>Transactions distribuées difficiles à gérer</li>
                      <li>Latence potentiellement plus élevée</li>
                      <li>Coûts d&apos;infrastructure plus élevés</li>
                      <li>Nécessite une bonne gouvernance et des standards</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Quand choisir quelle architecture ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">
                    Choisir une architecture monolithique quand :
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      L&apos;application est relativement simple ou en phase de
                      prototype
                    </li>
                    <li>
                      L&apos;équipe est petite et travaille sur la même base de
                      code
                    </li>
                    <li>
                      Les exigences de mise à l&apos;échelle sont modestes
                    </li>
                    <li>
                      La cohérence des données est critique (transactions)
                    </li>
                    <li>
                      Les ressources et l&apos;expertise DevOps sont limitées
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">
                    Choisir une architecture microservices quand :
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      L&apos;application est complexe avec des domaines métier
                      distincts
                    </li>
                    <li>
                      Plusieurs équipes travaillent sur différentes parties du
                      système
                    </li>
                    <li>
                      Des parties du système nécessitent une mise à
                      l&apos;échelle indépendante
                    </li>
                    <li>
                      La haute disponibilité et la résilience sont prioritaires
                    </li>
                    <li>
                      L&apos;organisation dispose de bonnes pratiques DevOps et
                      d&apos;automatisation
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
