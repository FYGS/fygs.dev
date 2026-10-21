"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BarChart,
  CheckCircle,
  Database,
  HardDrive,
  Hash,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export function DatabaseShardingVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for sharding type
  const [shardingType, setShardingType] = useState<
    "hash" | "range" | "geo" | "directory"
  >("hash");

  // State for data volume (to show scaling effect)
  const [dataVolume, setDataVolume] = useState(50);

  // State for number of shards
  const [shardCount, setShardCount] = useState(4);

  // State for simulated load
  const [load, setLoad] = useState<Record<number, number>>({});

  // Simulate load distribution
  useEffect(() => {
    const interval = setInterval(() => {
      const newLoad: Record<number, number> = {};

      if (shardingType === "hash") {
        // Even distribution for hash sharding
        for (let i = 0; i < shardCount; i++) {
          newLoad[i] = 25 + Math.random() * 50;
        }
      } else if (shardingType === "range") {
        // Uneven distribution for range sharding (hotspots)
        for (let i = 0; i < shardCount; i++) {
          newLoad[i] = 10 + Math.random() * 30;
        }
        // Create a hotspot on one shard
        const hotShard = Math.floor(Math.random() * shardCount);
        newLoad[hotShard] = 70 + Math.random() * 30;
      } else if (shardingType === "geo") {
        // Regional distribution for geo sharding
        for (let i = 0; i < shardCount; i++) {
          // Simulate time-of-day effect on different regions
          const hour = new Date().getHours();
          const offset = i * (24 / shardCount);
          const localHour = (hour + offset) % 24;

          // More load during working hours (8-20)
          const isActiveHours = localHour >= 8 && localHour <= 20;
          newLoad[i] = isActiveHours
            ? 50 + Math.random() * 50
            : 10 + Math.random() * 30;
        }
      } else {
        // Directory-based sharding (somewhat balanced)
        for (let i = 0; i < shardCount; i++) {
          newLoad[i] = 30 + Math.random() * 40;
        }
      }

      setLoad(newLoad);
    }, 2000);

    return () => clearInterval(interval);
  }, [shardingType, shardCount]);

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Sharding de Base de Données
        </CardTitle>
        <CardDescription>
          Visualisez comment le partitionnement horizontal distribue les données
          sur plusieurs serveurs
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Sharding Type Selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md border p-1 bg-muted/30">
                <Button
                  variant={shardingType === "hash" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShardingType("hash")}
                  className="flex items-center gap-1"
                >
                  <Hash className="h-4 w-4" />
                  <span>Hash</span>
                </Button>
                <Button
                  variant={shardingType === "range" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShardingType("range")}
                  className="flex items-center gap-1"
                >
                  <BarChart className="h-4 w-4" />
                  <span>Range</span>
                </Button>
                <Button
                  variant={shardingType === "geo" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShardingType("geo")}
                  className="flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Geo</span>
                </Button>
                <Button
                  variant={shardingType === "directory" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShardingType("directory")}
                  className="flex items-center gap-1"
                >
                  <HardDrive className="h-4 w-4" />
                  <span>Directory</span>
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Volume de données</span>
                  <span className="font-medium">{dataVolume} GB</span>
                </div>
                <Slider
                  value={[dataVolume]}
                  min={10}
                  max={100}
                  step={10}
                  onValueChange={(value) => setDataVolume(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nombre de shards</span>
                  <span className="font-medium">{shardCount}</span>
                </div>
                <Slider
                  value={[shardCount]}
                  min={2}
                  max={8}
                  step={1}
                  onValueChange={(value) => setShardCount(value[0])}
                />
              </div>
            </div>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
              <div className="p-4 h-full flex flex-col">
                {/* Sharding Visualization */}
                <div className="flex flex-col h-full">
                  {/* Application and Router Layer */}
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-800">
                          <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="text-xs mt-1 font-medium">Clients</div>
                      </div>

                      <div className="h-0.5 w-10 bg-slate-700"></div>

                      <div className="flex flex-col items-center">
                        <div className="w-32 h-16 rounded-md bg-indigo-900/30 flex items-center justify-center border border-indigo-800">
                          <div className="text-xs font-medium text-center">
                            <div className="mb-1">Shard Router</div>
                            {shardingType === "hash" && (
                              <Hash className="w-5 h-5 mx-auto text-indigo-500" />
                            )}
                            {shardingType === "range" && (
                              <BarChart className="w-5 h-5 mx-auto text-indigo-500" />
                            )}
                            {shardingType === "geo" && (
                              <MapPin className="w-5 h-5 mx-auto text-indigo-500" />
                            )}
                            {shardingType === "directory" && (
                              <HardDrive className="w-5 h-5 mx-auto text-indigo-500" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs mt-1 font-medium">Routage</div>
                      </div>
                    </div>
                  </div>

                  {/* Shards */}
                  <div className="flex-1 flex flex-col">
                    <div className="text-sm font-medium mb-2 text-center">
                      {shardingType === "hash" && "Sharding par Hachage"}
                      {shardingType === "range" && "Sharding par Plage"}
                      {shardingType === "geo" && "Sharding Géographique"}
                      {shardingType === "directory" &&
                        "Sharding par Répertoire"}
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: shardCount }).map((_, index) => {
                        const shardLoad = load[index] || 0;
                        const dataPerShard = Math.round(
                          dataVolume / shardCount
                        );

                        // Calculate color based on load
                        let bgColor = "bg-green-900/30";
                        let borderColor =
                          "border-green-800";
                        let textColor = "text-green-300";

                        if (shardLoad > 80) {
                          bgColor = "bg-red-900/30";
                          borderColor = "border-red-800";
                          textColor = "text-red-300";
                        } else if (shardLoad > 60) {
                          bgColor = "bg-amber-900/30";
                          borderColor =
                            "border-amber-800";
                          textColor = "text-amber-300";
                        }

                        return (
                          <div
                            key={index}
                            className={`rounded-md ${bgColor} border ${borderColor} p-3 flex flex-col`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-1">
                                <Database className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-medium">
                                  Shard {index + 1}
                                </span>
                              </div>
                              <div className="text-xs">{dataPerShard} GB</div>
                            </div>

                            {/* Shard Key Information */}
                            <div className="text-xs mb-2 px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                              {shardingType === "hash" && (
                                <div className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  <span>
                                    hash(id) % {shardCount} = {index}
                                  </span>
                                </div>
                              )}
                              {shardingType === "range" && (
                                <div className="flex items-center gap-1">
                                  <BarChart className="w-3 h-3" />
                                  <span>
                                    {Math.round(index * (1000000 / shardCount))}
                                    -
                                    {Math.round(
                                      (index + 1) * (1000000 / shardCount) - 1
                                    )}
                                  </span>
                                </div>
                              )}
                              {shardingType === "geo" && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>
                                    {index === 0 && "Europe"}
                                    {index === 1 && "Amérique"}
                                    {index === 2 && "Asie"}
                                    {index === 3 && "Afrique"}
                                    {index === 4 && "Océanie"}
                                    {index === 5 && "Moyen-Orient"}
                                    {index === 6 && "Amérique du Sud"}
                                    {index === 7 && "Antarctique"}
                                  </span>
                                </div>
                              )}
                              {shardingType === "directory" && (
                                <div className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  <span>Lookup Table → Shard {index + 1}</span>
                                </div>
                              )}
                            </div>

                            {/* Load Indicator */}
                            <div className="mt-auto">
                              <div className="text-xs flex justify-between mb-1">
                                <span>Charge:</span>
                                <span className={textColor}>
                                  {Math.round(shardLoad)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    shardLoad > 80
                                      ? "bg-red-500"
                                      : shardLoad > 60
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${shardLoad}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Qu&apos;est-ce que le Sharding?
                </h3>
                <p className="text-muted-foreground">
                  Le sharding est une technique de partitionnement horizontal
                  qui divise une grande base de données en fragments plus petits
                  appelés shards. Chaque shard contient un sous-ensemble des
                  données et est hébergé sur un serveur distinct.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Avantages</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Améliore les performances en répartissant la charge</li>
                    <li>Permet une mise à l&apos;échelle horizontale</li>
                    <li>Réduit les temps de réponse pour les requêtes</li>
                    <li>Augmente la disponibilité du système</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Types de Sharding</h3>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Hash className="h-4 w-4 text-primary" />
                    Sharding par Hachage
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Utilise une fonction de hachage sur une clé pour déterminer
                    le shard. Offre une distribution uniforme mais rend
                    difficiles les requêtes par plage.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <BarChart className="h-4 w-4 text-primary" />
                    Sharding par Plage
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Divise les données selon des plages de valeurs (dates, ID
                    séquentiels). Facilite les requêtes par plage mais peut
                    créer des hotspots.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    Sharding Géographique
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Partitionne les données selon la localisation géographique.
                    Améliore la latence pour les utilisateurs mais peut créer
                    une distribution inégale.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <HardDrive className="h-4 w-4 text-primary" />
                    Sharding par Répertoire
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Utilise un service de lookup pour mapper les clés aux
                    shards. Flexible mais ajoute une couche de complexité et un
                    point de défaillance.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Défis et Considérations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border bg-red-900/20 space-y-3">
                  <h4 className="font-medium text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Défis du Sharding
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">Jointures complexes</span> -
                      Les jointures entre shards sont coûteuses
                    </li>
                    <li>
                      <span className="font-medium">Transactions</span> -
                      Difficulté à maintenir l&apos;atomicité entre shards
                    </li>
                    <li>
                      <span className="font-medium">Hotspots</span> -
                      Distribution inégale des données ou du trafic
                    </li>
                    <li>
                      <span className="font-medium">Repartitionnement</span> -
                      Complexité lors de l&apos;ajout de nouveaux shards
                    </li>
                    <li>
                      <span className="font-medium">Gestion des ID</span> -
                      Génération d&apos;ID uniques entre shards
                    </li>
                    <li>
                      <span className="font-medium">Maintenance</span> -
                      Complexité opérationnelle accrue
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-green-900/20 space-y-3">
                  <h4 className="font-medium text-green-300 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Bonnes Pratiques
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">
                        Choisir la bonne clé de sharding
                      </span>{" "}
                      - Essentiel pour une distribution équilibrée
                    </li>
                    <li>
                      <span className="font-medium">
                        Minimiser les requêtes cross-shard
                      </span>{" "}
                      - Concevoir le schéma en conséquence
                    </li>
                    <li>
                      <span className="font-medium">
                        Utiliser des ID globalement uniques
                      </span>{" "}
                      - UUID ou ID composés
                    </li>
                    <li>
                      <span className="font-medium">
                        Surveiller les hotspots
                      </span>{" "}
                      - Ajuster la stratégie si nécessaire
                    </li>
                    <li>
                      <span className="font-medium">Planifier la capacité</span>{" "}
                      - Prévoir la croissance future
                    </li>
                    <li>
                      <span className="font-medium">
                        Tester à l&apos;échelle
                      </span>{" "}
                      - Valider la stratégie avec des données réalistes
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-3">
                  Exemples d&apos;implémentation
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium mb-2">MongoDB</h5>
                    <pre className="text-xs p-3 bg-slate-800 rounded border overflow-auto" tabIndex={0}>
                      {`// Création d'une collection sharded
sh.enableSharding("myDatabase")

// Création d'un index sur la clé de sharding
db.users.createIndex({ userId: 1 })

// Activation du sharding sur la collection
sh.shardCollection(
  "myDatabase.users",
  { userId: 1 } // Clé de sharding
)`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">MySQL</h5>
                    <pre className="text-xs p-3 bg-slate-800 rounded border overflow-auto" tabIndex={0}>
                      {`-- Création de tables partitionnées par plage
CREATE TABLE orders (
  order_id INT,
  customer_id INT,
  order_date DATE,
  total DECIMAL(10,2),
  PRIMARY KEY(order_id, order_date)
)
PARTITION BY RANGE (YEAR(order_date)) (
  PARTITION p2020 VALUES LESS THAN (2021),
  PARTITION p2021 VALUES LESS THAN (2022),
  PARTITION p2022 VALUES LESS THAN (2023),
  PARTITION p2023 VALUES LESS THAN (2024)
);`}
                    </pre>
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
