"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  SplitSquareVertical,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function CapView({ activeCapProperty, databaseType, setActiveCapProperty, setDatabaseType }: {
  activeCapProperty: "consistency" | "availability" | "partition-tolerance";
  databaseType: "cp" | "ap" | "ca";
  setActiveCapProperty: Dispatch<SetStateAction<"consistency" | "availability" | "partition-tolerance">>;
  setDatabaseType: Dispatch<SetStateAction<"cp" | "ap" | "ca">>;
}) {
  return (
    <div className="space-y-4">
      {/* CAP Property Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md border p-1 bg-muted/30">
          <Button
            variant={
              activeCapProperty === "consistency"
                ? "default"
                : "ghost"
            }
            size="sm"
            onClick={() => setActiveCapProperty("consistency")}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Cohérence</span>
          </Button>
          <Button
            variant={
              activeCapProperty === "availability"
                ? "default"
                : "ghost"
            }
            size="sm"
            onClick={() => setActiveCapProperty("availability")}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            <span>Disponibilité</span>
          </Button>
          <Button
            variant={
              activeCapProperty === "partition-tolerance"
                ? "default"
                : "ghost"
            }
            size="sm"
            onClick={() =>
              setActiveCapProperty("partition-tolerance")
            }
            className="flex items-center gap-1"
          >
            <SplitSquareVertical className="h-4 w-4" />
            <span>Tolérance au Partitionnement</span>
          </Button>
        </div>
      </div>

      {/* Database Type Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md border p-1 bg-muted/30">
          <Button
            variant={databaseType === "cp" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDatabaseType("cp")}
            className="flex items-center gap-1"
          >
            <span>CP</span>
          </Button>
          <Button
            variant={databaseType === "ap" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDatabaseType("ap")}
            className="flex items-center gap-1"
          >
            <span>AP</span>
          </Button>
          <Button
            variant={databaseType === "ca" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDatabaseType("ca")}
            className="flex items-center gap-1"
          >
            <span>CA</span>
          </Button>
        </div>
      </div>

      {/* CAP Visualization Canvas */}
      <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
        <div className="p-4 h-full flex flex-col">
          {/* CAP Visualization */}
          <div className="h-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                <SplitSquareVertical className="h-5 w-5 text-primary" />
                Théorème CAP
              </h3>
              <p className="text-sm text-muted-foreground">
                Pendant une partition réseau, il faut choisir entre
                cohérence et disponibilité
              </p>
            </div>

            {/* CAP Triangle Visualization */}
            <div className="relative h-[250px] mb-6">
              {/* Triangle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="300"
                  height="250"
                  viewBox="0 0 300 250"
                  className="text-muted-foreground"
                >
                  {/* Triangle outline */}
                  <path
                    d="M150,10 L10,230 L290,230 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={
                      databaseType === "ca" ? "5,5" : "none"
                    }
                  />

                  {/* C-A line */}
                  <path
                    d="M10,230 L290,230"
                    stroke={
                      databaseType === "ca"
                        ? "#3b82f6"
                        : "currentColor"
                    }
                    strokeWidth={databaseType === "ca" ? "3" : "2"}
                  />

                  {/* C-P line */}
                  <path
                    d="M150,10 L10,230"
                    stroke={
                      databaseType === "cp"
                        ? "#3b82f6"
                        : "currentColor"
                    }
                    strokeWidth={databaseType === "cp" ? "3" : "2"}
                  />

                  {/* A-P line */}
                  <path
                    d="M150,10 L290,230"
                    stroke={
                      databaseType === "ap"
                        ? "#3b82f6"
                        : "currentColor"
                    }
                    strokeWidth={databaseType === "ap" ? "3" : "2"}
                  />

                  {/* Consistency node */}
                  <circle
                    cx="150"
                    cy="10"
                    r="30"
                    fill={
                      activeCapProperty === "consistency"
                        ? "#dbeafe"
                        : "#f8fafc"
                    }
                    stroke={
                      activeCapProperty === "consistency"
                        ? "#3b82f6"
                        : "currentColor"
                    }
                    strokeWidth={
                      activeCapProperty === "consistency" ? "3" : "1"
                    }
                  />

                  {/* Availability node */}
                  <circle
                    cx="10"
                    cy="230"
                    r="30"
                    fill={
                      activeCapProperty === "availability"
                        ? "#dbeafe"
                        : "#f8fafc"
                    }
                    stroke={
                      activeCapProperty === "availability"
                        ? "#3b82f6"
                        : "currentColor"
                    }
                    strokeWidth={
                      activeCapProperty === "availability" ? "3" : "1"
                    }
                  />

                  {/* Partition Tolerance node */}
                  <circle
                    cx="290"
                    cy="230"
                    r="30"
                    fill={
                      activeCapProperty === "partition-tolerance"
                        ? "#dbeafe"
                        : "#f8fafc"
                    }
                    stroke={
                      activeCapProperty === "partition-tolerance"
                        ? "#3b82f6"
                        : "currentColor"
                    }
                    strokeWidth={
                      activeCapProperty === "partition-tolerance"
                        ? "3"
                        : "1"
                    }
                  />

                  {/* Labels */}
                  <text
                    x="150"
                    y="15"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-xs font-medium"
                  >
                    C
                  </text>
                  <text
                    x="10"
                    y="235"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-xs font-medium"
                  >
                    A
                  </text>
                  <text
                    x="290"
                    y="235"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-xs font-medium"
                  >
                    P
                  </text>
                </svg>
              </div>

              {/* Consistency Label */}
              <div
                className="absolute"
                style={{
                  top: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="flex flex-col items-center mt-16">
                  <div className="text-sm font-medium">Cohérence</div>
                  <div className="text-xs text-muted-foreground text-center max-w-[150px] mt-1">
                    Tous les nœuds voient les mêmes données au même
                    moment
                  </div>
                </div>
              </div>

              {/* Availability Label */}
              <div
                className="absolute"
                style={{ bottom: "0", left: "10%" }}
              >
                <div className="flex flex-col items-center mb-16">
                  <div className="text-sm font-medium">
                    Disponibilité
                  </div>
                  <div className="text-xs text-muted-foreground text-center max-w-[150px] mt-1">
                    Chaque requête reçoit une réponse, sans garantie
                    de fraîcheur
                  </div>
                </div>
              </div>

              {/* Partition Tolerance Label */}
              <div
                className="absolute"
                style={{ bottom: "0", right: "10%" }}
              >
                <div className="flex flex-col items-center mb-16">
                  <div className="text-sm font-medium">
                    Tolérance au Partitionnement
                  </div>
                  <div className="text-xs text-muted-foreground text-center max-w-[150px] mt-1">
                    Le système continue de fonctionner malgré les
                    pannes réseau
                  </div>
                </div>
              </div>
            </div>

            {/* Database Type Description */}
            <div className="border rounded-md p-4 bg-card">
              {databaseType === "cp" && (
                <div>
                  <h4 className="text-center font-medium mb-3 text-primary">
                    Systèmes CP (Cohérence + Tolérance au
                    Partitionnement)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Caractéristiques
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Privilégie la cohérence des données</li>
                        <li>
                          Peut devenir indisponible en cas de
                          partition réseau
                        </li>
                        <li>
                          Utilise souvent des algorithmes de consensus
                          (Paxos, Raft)
                        </li>
                        <li>
                          Garantit que les lectures renvoient les
                          données les plus récentes
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Exemples
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          MongoDB (en mode répliqué avec majorité de
                          lecture/écriture)
                        </li>
                        <li>HBase</li>
                        <li>CockroachDB, TiKV</li>
                        <li>etcd, ZooKeeper, Consul</li>
                        <li>Google Cloud Spanner</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {databaseType === "ap" && (
                <div>
                  <h4 className="text-center font-medium mb-3 text-primary">
                    Systèmes AP (Disponibilité + Tolérance au
                    Partitionnement)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Caractéristiques
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Privilégie la disponibilité du service
                        </li>
                        <li>
                          Accepte la cohérence éventuelle des données
                        </li>
                        <li>
                          Continue de fonctionner pendant les
                          partitions réseau
                        </li>
                        <li>
                          Utilise souvent des mécanismes de
                          réconciliation (vecteurs d&apos;horloge)
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Exemples
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Cassandra</li>
                        <li>CouchDB</li>
                        <li>Riak</li>
                        <li>Amazon DynamoDB</li>
                        <li>Voldemort</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {databaseType === "ca" && (
                <div>
                  <h4 className="text-center font-medium mb-3 text-primary">
                    Systèmes CA (Cohérence + Disponibilité)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Caractéristiques
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Fonctionne uniquement dans un réseau fiable
                          sans partition
                        </li>
                        <li>
                          Généralement limité à un seul nœud ou un
                          réseau local
                        </li>
                        <li>
                          Ne peut pas fonctionner de manière
                          distribuée à grande échelle
                        </li>
                        <li className="text-amber-400 font-medium">
                          Impossible dans un vrai système distribué
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Exemples
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Bases de données relationnelles
                          traditionnelles (sur un seul nœud)
                        </li>
                        <li>
                          MySQL, PostgreSQL (sans sharding ni
                          réplication)
                        </li>
                        <li>SQLite</li>
                      </ul>
                      <div className="p-2 bg-amber-900/20 border border-amber-800 rounded-md mt-2">
                        <div className="text-xs text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>
                            Dans un vrai système distribué, les
                            partitions réseau sont inévitables, donc
                            CA n&apos;est pas réalisable.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
