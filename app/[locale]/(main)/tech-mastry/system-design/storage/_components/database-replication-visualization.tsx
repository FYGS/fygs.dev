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
  ArrowDown,
  ArrowRight,
  Clock,
  Database,
  FileEdit,
  RotateCw,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Types for the visualization
type ReplicationType = "master-slave" | "master-master" | "multi-master";
type ConsistencyModel = "sync" | "async" | "semi-sync";
type Operation = "read" | "write" | "sync" | "none";
type NodeStatus = "active" | "syncing" | "down";

interface DatabaseNode {
  id: string;
  type: "master" | "slave";
  status: NodeStatus;
  operations: Operation[];
  lastUpdated: number;
  position: { x: number; y: number };
}

interface ReplicationLink {
  source: string;
  target: string;
  status: "active" | "syncing" | "down";
  lastSync: number;
}

export function DatabaseReplicationVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for replication type
  const [replicationType, setReplicationType] =
    useState<ReplicationType>("master-slave");

  // State for consistency model
  const [consistencyModel, setConsistencyModel] =
    useState<ConsistencyModel>("async");

  // State for database nodes
  const [nodes, setNodes] = useState<DatabaseNode[]>([]);

  // State for replication links
  const [links, setLinks] = useState<ReplicationLink[]>([]);

  // State for simulated load
  const [writeLoad, setWriteLoad] = useState(30);
  const [readLoad, setReadLoad] = useState(70);

  // State for node failure simulation
  const [failedNode, setFailedNode] = useState<string | null>(null);

  // Timer reference for animations
  const animationTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize the visualization based on replication type
  useEffect(() => {
    // Clear any existing animation timer
    if (animationTimer.current) {
      clearInterval(animationTimer.current);
    }

    // Reset failed node when changing replication type
    setFailedNode(null);

    // Create nodes and links based on replication type
    const newNodes: DatabaseNode[] = [];
    const newLinks: ReplicationLink[] = [];

    if (replicationType === "master-slave") {
      // Master node
      newNodes.push({
        id: "master",
        type: "master",
        status: "active",
        operations: [],
        lastUpdated: Date.now(),
        position: { x: 400, y: 100 },
      });

      // Slave nodes
      for (let i = 0; i < 3; i++) {
        newNodes.push({
          id: `slave-${i}`,
          type: "slave",
          status: "active",
          operations: [],
          lastUpdated: Date.now(),
          position: {
            x: 200 + i * 200,
            y: 250,
          },
        });

        // Link from master to slave
        newLinks.push({
          source: "master",
          target: `slave-${i}`,
          status: "active",
          lastSync: Date.now(),
        });
      }
    } else if (replicationType === "master-master") {
      // Two master nodes
      for (let i = 0; i < 2; i++) {
        newNodes.push({
          id: `master-${i}`,
          type: "master",
          status: "active",
          operations: [],
          lastUpdated: Date.now(),
          position: {
            x: 250 + i * 300,
            y: 150,
          },
        });
      }

      // Bi-directional links between masters
      newLinks.push({
        source: "master-0",
        target: "master-1",
        status: "active",
        lastSync: Date.now(),
      });

      newLinks.push({
        source: "master-1",
        target: "master-0",
        status: "active",
        lastSync: Date.now(),
      });
    } else if (replicationType === "multi-master") {
      // Multiple master nodes in a ring
      const nodeCount = 4;
      const centerX = 400;
      const centerY = 200;
      const radius = 150;

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        newNodes.push({
          id: `master-${i}`,
          type: "master",
          status: "active",
          operations: [],
          lastUpdated: Date.now(),
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          },
        });
      }

      // Create links in a ring topology
      for (let i = 0; i < nodeCount; i++) {
        const nextNode = (i + 1) % nodeCount;
        newLinks.push({
          source: `master-${i}`,
          target: `master-${nextNode}`,
          status: "active",
          lastSync: Date.now(),
        });
      }
    }

    setNodes(newNodes);
    setLinks(newLinks);

    // Start animation timer
    animationTimer.current = setInterval(() => {
      simulateOperations();
    }, 2000);

    return () => {
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replicationType]);

  // Simulate database operations
  const simulateOperations = () => {
    setNodes((prevNodes) => {
      const newNodes = [...prevNodes];

      // Reset operations
      newNodes.forEach((node) => {
        node.operations = [];
      });

      // Simulate write operations
      if (Math.random() * 100 < writeLoad) {
        // Find master nodes
        const masterNodes = newNodes.filter(
          (node) =>
            node.type === "master" &&
            node.status === "active" &&
            node.id !== failedNode
        );

        if (masterNodes.length > 0) {
          // Select a random master for the write
          const randomMaster =
            masterNodes[Math.floor(Math.random() * masterNodes.length)];
          randomMaster.operations.push("write");
          randomMaster.lastUpdated = Date.now();

          // Propagate to other nodes based on consistency model
          if (consistencyModel === "sync" || consistencyModel === "semi-sync") {
            // Synchronous replication - update all nodes immediately
            setLinks((prevLinks) => {
              const newLinks = [...prevLinks];

              newLinks.forEach((link) => {
                if (
                  link.source === randomMaster.id &&
                  link.status === "active"
                ) {
                  link.status = "syncing";
                  link.lastSync = Date.now();

                  // Find the target node and update it
                  const targetNode = newNodes.find((n) => n.id === link.target);
                  if (
                    targetNode &&
                    targetNode.status === "active" &&
                    targetNode.id !== failedNode
                  ) {
                    targetNode.operations.push("sync");
                    targetNode.lastUpdated = Date.now();
                  }
                }
              });

              return newLinks;
            });
          }
        }
      }

      // Simulate read operations
      if (Math.random() * 100 < readLoad) {
        // In master-slave, reads can go to any node
        // In master-master and multi-master, reads can also go to any node
        const availableNodes = newNodes.filter(
          (node) => node.status === "active" && node.id !== failedNode
        );

        if (availableNodes.length > 0) {
          const randomNode =
            availableNodes[Math.floor(Math.random() * availableNodes.length)];
          randomNode.operations.push("read");
        }
      }

      return newNodes;
    });

    // Update links status
    setLinks((prevLinks) => {
      const newLinks = [...prevLinks];

      newLinks.forEach((link) => {
        if (link.status === "syncing") {
          // After some time, change syncing back to active
          if (Date.now() - link.lastSync > 1000) {
            link.status = "active";
          }
        }
      });

      return newLinks;
    });
  };

  // Simulate node failure
  const handleNodeFailure = (nodeId: string) => {
    if (failedNode === nodeId) {
      // Recover the node
      setFailedNode(null);

      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, status: "active" };
          }
          return node;
        });
      });

      setLinks((prevLinks) => {
        return prevLinks.map((link) => {
          if (link.source === nodeId || link.target === nodeId) {
            return { ...link, status: "active" };
          }
          return link;
        });
      });
    } else {
      // Fail the node
      setFailedNode(nodeId);

      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, status: "down", operations: [] };
          }
          return node;
        });
      });

      setLinks((prevLinks) => {
        return prevLinks.map((link) => {
          if (link.source === nodeId || link.target === nodeId) {
            return { ...link, status: "down" };
          }
          return link;
        });
      });
    }
  };

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Réplication de Base de Données
        </CardTitle>
        <CardDescription>
          Visualisez comment la réplication améliore la disponibilité et les
          performances
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Replication Type Selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md border p-1 bg-muted/30">
                <Button
                  variant={
                    replicationType === "master-slave" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReplicationType("master-slave")}
                  className="flex items-center gap-1"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>Master-Slave</span>
                </Button>
                <Button
                  variant={
                    replicationType === "master-master" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReplicationType("master-master")}
                  className="flex items-center gap-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Master-Master</span>
                </Button>
                <Button
                  variant={
                    replicationType === "multi-master" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReplicationType("multi-master")}
                  className="flex items-center gap-1"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Multi-Master</span>
                </Button>
              </div>
            </div>

            {/* Consistency Model Selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md border p-1 bg-muted/30">
                <Button
                  variant={consistencyModel === "async" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setConsistencyModel("async")}
                  className="flex items-center gap-1"
                >
                  <Zap className="h-4 w-4" />
                  <span>Asynchrone</span>
                </Button>
                <Button
                  variant={
                    consistencyModel === "semi-sync" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setConsistencyModel("semi-sync")}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  <span>Semi-Sync</span>
                </Button>
                <Button
                  variant={consistencyModel === "sync" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setConsistencyModel("sync")}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>Synchrone</span>
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Charge d&apos;écriture</span>
                  <span className="font-medium">{writeLoad}%</span>
                </div>
                <Slider
                  value={[writeLoad]}
                  min={10}
                  max={90}
                  step={10}
                  onValueChange={(value) => setWriteLoad(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Charge de lecture</span>
                  <span className="font-medium">{readLoad}%</span>
                </div>
                <Slider
                  value={[readLoad]}
                  min={10}
                  max={90}
                  step={10}
                  onValueChange={(value) => setReadLoad(value[0])}
                />
              </div>
            </div>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
              <div className="p-4 h-full flex flex-col">
                {/* Replication Visualization */}
                <div className="relative h-full">
                  {/* Render links first so they appear behind nodes */}
                  {links.map((link, index) => {
                    const sourceNode = nodes.find((n) => n.id === link.source);
                    const targetNode = nodes.find((n) => n.id === link.target);

                    if (!sourceNode || !targetNode) return null;

                    // Calculate the path for the link
                    const startX = sourceNode.position.x;
                    const startY = sourceNode.position.y;
                    const endX = targetNode.position.x;
                    const endY = targetNode.position.y;

                    // Calculate control points for curved lines
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const normalX = (-dy / Math.sqrt(dx * dx + dy * dy)) * 30;
                    const normalY = (dx / Math.sqrt(dx * dx + dy * dy)) * 30;

                    // Adjust control point for multi-master to avoid overlapping curves
                    const controlX = midX + normalX;
                    const controlY = midY + normalY;

                    // Determine link color based on status
                    let strokeColor = "stroke-slate-600";
                    let strokeWidth = "stroke-[2px]";

                    if (link.status === "syncing") {
                      strokeColor = "stroke-blue-500";
                      strokeWidth = "stroke-[3px]";
                    } else if (link.status === "down") {
                      strokeColor = "stroke-red-500";
                      strokeWidth = "stroke-[2px]";
                    }

                    return (
                      <svg
                        key={`link-${index}`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <path
                          d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                          fill="none"
                          className={`${strokeColor} ${strokeWidth}`}
                          strokeDasharray={
                            link.status === "down" ? "5,5" : "none"
                          }
                          markerEnd={
                            link.status !== "down" ? "url(#arrowhead)" : ""
                          }
                        />

                        {/* Animated circle for syncing status */}
                        {link.status === "syncing" && (
                          <circle
                            cx="0"
                            cy="0"
                            r="4"
                            fill="#3b82f6"
                            className="animate-pulse"
                          >
                            <animateMotion
                              dur="1s"
                              repeatCount="indefinite"
                              path={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                            />
                          </circle>
                        )}
                      </svg>
                    );
                  })}

                  {/* SVG Definitions */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          className="fill-slate-500"
                        />
                      </marker>
                    </defs>
                  </svg>

                  {/* Render nodes */}
                  {nodes.map((node) => {
                    // Determine node color based on type and status
                    let bgColor = "bg-blue-900/30";
                    let borderColor = "border-blue-800";
                    let textColor = "text-blue-300";

                    if (node.type === "master") {
                      bgColor = "bg-indigo-900/30";
                      borderColor = "border-indigo-800";
                      textColor = "text-indigo-300";
                    }

                    if (node.status === "down") {
                      bgColor = "bg-red-900/30";
                      borderColor = "border-red-800";
                      textColor = "text-red-300";
                    }

                    return (
                      <div
                        key={node.id}
                        className={`absolute w-32 h-32 ${bgColor} rounded-full border-2 ${borderColor} flex flex-col items-center justify-center cursor-pointer transition-all duration-300`}
                        style={{
                          left: node.position.x - 64,
                          top: node.position.y - 64,
                          transform:
                            node.status === "down" ? "scale(0.9)" : "scale(1)",
                          opacity: node.status === "down" ? 0.7 : 1,
                        }}
                        onClick={() => handleNodeFailure(node.id)}
                      >
                        <Database className={`h-8 w-8 ${textColor} mb-1`} />
                        <div className={`text-xs font-medium ${textColor}`}>
                          {node.type === "master" ? "Master" : "Slave"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {node.id}
                        </div>

                        {/* Operation indicators */}
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          {node.operations.includes("write") && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                              <FileEdit className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {node.operations.includes("read") && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                              <svg
                                className="w-3 h-3 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M2 12h20M2 18h20" />
                              </svg>
                            </div>
                          )}
                          {node.operations.includes("sync") && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                              <RotateCw className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Status indicator */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          {node.status === "active" && (
                            <div className="px-2 py-0.5 bg-green-900/30 border border-green-800 rounded-full">
                              <span className="text-[10px] text-green-300 font-medium">
                                Active
                              </span>
                            </div>
                          )}
                          {node.status === "syncing" && (
                            <div className="px-2 py-0.5 bg-amber-900/30 border border-amber-800 rounded-full">
                              <span className="text-[10px] text-amber-300 font-medium">
                                Syncing
                              </span>
                            </div>
                          )}
                          {node.status === "down" && (
                            <div className="px-2 py-0.5 bg-red-900/30 border border-red-800 rounded-full">
                              <span className="text-[10px] text-red-300 font-medium">
                                Down
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Legend */}
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 p-2 rounded-md border text-xs">
                    <div className="font-medium mb-1">
                      Cliquez sur un nœud pour simuler une panne
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Écriture</span>
                      <div className="w-3 h-3 rounded-full bg-blue-500 ml-2"></div>
                      <span>Lecture</span>
                      <div className="w-3 h-3 rounded-full bg-amber-500 ml-2"></div>
                      <span>Synchronisation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span>Master</span>
                      <div className="w-3 h-3 rounded-full bg-blue-500 ml-2"></div>
                      <span>Slave</span>
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
                  Qu&apos;est-ce que la Réplication?
                </h3>
                <p className="text-muted-foreground">
                  La réplication de base de données est le processus de copie
                  des données d&apos;une base de données vers une ou plusieurs
                  autres bases de données. Elle permet d&apos;améliorer la
                  disponibilité, la fiabilité et les performances du système.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Avantages</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Haute disponibilité et tolérance aux pannes</li>
                    <li>Répartition de la charge de lecture</li>
                    <li>Sauvegarde des données en temps réel</li>
                    <li>
                      Réduction de la latence pour les utilisateurs
                      géographiquement dispersés
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Types de Réplication</h3>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <ArrowDown className="h-4 w-4 text-primary" />
                    Réplication Master-Slave
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Un nœud principal (master) reçoit toutes les écritures et
                    les propage aux nœuds secondaires (slaves). Les lectures
                    peuvent être distribuées sur tous les nœuds.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Réplication Master-Master
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Deux nœuds principaux peuvent recevoir des écritures et se
                    synchronisent mutuellement. Offre une meilleure
                    disponibilité mais complexifie la gestion des conflits.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <RotateCw className="h-4 w-4 text-primary" />
                    Réplication Multi-Master
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Plusieurs nœuds principaux peuvent recevoir des écritures et
                    se synchronisent entre eux. Maximise la disponibilité mais
                    rend la résolution des conflits plus complexe.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Modèles de Cohérence
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    Réplication Asynchrone
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Le nœud principal confirme l&apos;écriture avant de la
                    propager aux réplicas.
                  </p>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Avantages</div>
                    <ul className="text-xs list-disc pl-4 text-muted-foreground">
                      <li>Meilleures performances d&apos;écriture</li>
                      <li>Pas de blocage si un réplica est indisponible</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Inconvénients</div>
                    <ul className="text-xs list-disc pl-4 text-muted-foreground">
                      <li>Cohérence éventuelle seulement</li>
                      <li>Risque de perte de données en cas de panne</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    Réplication Semi-Synchrone
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Le nœud principal attend la confirmation d&apos;au moins un
                    réplica avant de valider l&apos;écriture.
                  </p>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Avantages</div>
                    <ul className="text-xs list-disc pl-4 text-muted-foreground">
                      <li>Bon équilibre entre performance et durabilité</li>
                      <li>
                        Garantie qu&apos;au moins un réplica a les données
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Inconvénients</div>
                    <ul className="text-xs list-disc pl-4 text-muted-foreground">
                      <li>
                        Latence d&apos;écriture plus élevée qu&apos;en
                        asynchrone
                      </li>
                      <li>Cohérence partielle entre les réplicas</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    Réplication Synchrone
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Le nœud principal attend la confirmation de tous les
                    réplicas avant de valider l&apos;écriture.
                  </p>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Avantages</div>
                    <ul className="text-xs list-disc pl-4 text-muted-foreground">
                      <li>Cohérence forte entre tous les nœuds</li>
                      <li>Pas de perte de données en cas de panne</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Inconvénients</div>
                    <ul className="text-xs list-disc pl-4 text-muted-foreground">
                      <li>Performances d&apos;écriture réduites</li>
                      <li>Indisponibilité si un réplica est hors service</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-3">
                    Exemples d&apos;implémentation
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">
                        MySQL (Master-Slave)
                      </h5>
                      <pre className="text-xs p-3 bg-slate-800 rounded border overflow-auto">
                        {`# Configuration sur le master (my.cnf)
server-id=1
log_bin=mysql-bin
binlog_format=ROW

# Configuration sur le slave (my.cnf)
server-id=2
relay-log=relay-bin

# Commande sur le slave pour démarrer la réplication
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=4;

START SLAVE;`}
                      </pre>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">
                        PostgreSQL (Streaming Replication)
                      </h5>
                      <pre className="text-xs p-3 bg-slate-800 rounded border overflow-auto">
                        {`# Configuration sur le primary (postgresql.conf)
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 64

# Configuration sur le standby (recovery.conf)
primary_conninfo = 'host=primary_ip port=5432 user=repl_user password=password'
standby_mode = 'on'`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-3">
                    Compromis et Considérations
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Théorème CAP</div>
                      <p className="text-xs text-muted-foreground">
                        Impossible d&apos;avoir simultanément la Cohérence, la
                        Disponibilité et la Tolérance au Partitionnement. La
                        réplication synchrone favorise la cohérence, tandis que
                        l&apos;asynchrone favorise la disponibilité.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Latence et Distance Géographique
                      </div>
                      <p className="text-xs text-muted-foreground">
                        La réplication synchrone devient problématique sur de
                        longues distances en raison de la latence réseau. Pour
                        les déploiements multi-régions, l&apos;asynchrone ou
                        semi-synchrone est souvent préférable.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Gestion des Conflits
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Dans les configurations multi-master, les conflits
                        d&apos;écriture sont inévitables. Des stratégies comme
                        les horloges vectorielles, les timestamps ou les règles
                        métier sont nécessaires pour les résoudre.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Promotion Automatique
                      </div>
                      <p className="text-xs text-muted-foreground">
                        En cas de défaillance du master, un mécanisme de
                        failover est nécessaire pour promouvoir un slave. Cela
                        peut être automatique (avec un service de découverte) ou
                        manuel.
                      </p>
                    </div>
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
