"use client";

import { Badge } from "@/components/ui/badge";
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
import { AnimatePresence, motion } from "framer-motion";
import {
  Globe,
  Layers,
  Pause,
  Play,
  RefreshCw,
  Server,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Types
interface Request {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  position: { x: number; y: number };
  targetServer?: number;
  startTime: number;
  processingTime?: number;
  completionTime?: number;
}

interface Server {
  id: number;
  load: number;
  status: "online" | "offline" | "overloaded";
  position: { x: number; y: number };
  requests: number;
  failureChance: number;
}

interface LoadBalancerState {
  algorithm: "round-robin" | "least-connections" | "ip-hash";
  servers: Server[];
  requests: Request[];
  nextServerId: number;
  stats: {
    totalRequests: number;
    completedRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}

// Initial state
const initialState: LoadBalancerState = {
  algorithm: "round-robin",
  servers: [
    {
      id: 1,
      load: 0,
      status: "online",
      position: { x: 0, y: 0 },
      requests: 0,
      failureChance: 0.05,
    },
    {
      id: 2,
      load: 0,
      status: "online",
      position: { x: 0, y: 0 },
      requests: 0,
      failureChance: 0.05,
    },
    {
      id: 3,
      load: 0,
      status: "online",
      position: { x: 0, y: 0 },
      requests: 0,
      failureChance: 0.05,
    },
  ],
  requests: [],
  nextServerId: 1,
  stats: {
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  },
};

export function LoadBalancerVisualization() {
  const [state, setState] = useState<LoadBalancerState>(initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [requestRate, setRequestRate] = useState(1);
  const [serverCount, setServerCount] = useState(3);
  const [failureRate, setFailureRate] = useState(5);
  const [processingSpeed, setProcessingSpeed] = useState(1);
  const [showExplanation, setShowExplanation] = useState(true);
  const [activeTab, setActiveTab] = useState("visualization");

  const requestIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastRequestTimeRef = useRef(0);

  // Calculate positions for visualization
  useEffect(() => {
    const centerX = 400;
    const centerY = 200;
    const radius = 150;

    // Position servers in a semi-circle
    const updatedServers = state.servers.map((server, index) => {
      const angle =
        Math.PI * (0.2 + (index / (state.servers.length - 1)) * 0.6);
      return {
        ...server,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      };
    });

    setState((prev) => ({
      ...prev,
      servers: updatedServers,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.servers]);

  // Handle server count changes
  useEffect(() => {
    const currentCount = state.servers.length;

    if (serverCount > currentCount) {
      // Add servers
      const newServers = [...state.servers];
      for (let i = currentCount + 1; i <= serverCount; i++) {
        newServers.push({
          id: i,
          load: 0,
          status: "online",
          position: { x: 0, y: 0 },
          requests: 0,
          failureChance: failureRate / 100,
        });
      }
      setState((prev) => ({ ...prev, servers: newServers }));
    } else if (serverCount < currentCount) {
      // Remove servers
      const newServers = state.servers.slice(0, serverCount);
      setState((prev) => ({ ...prev, servers: newServers }));
    }
  }, [serverCount, state.servers, failureRate]);

  // Update failure rates when the slider changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      servers: prev.servers.map((server) => ({
        ...server,
        failureChance: failureRate / 100,
      })),
    }));
  }, [failureRate]);

  // Animation loop
  useEffect(() => {
    // Select a server based on the current algorithm
    const selectServer = (state: LoadBalancerState): Server | undefined => {
      const onlineServers = state.servers.filter((s) => s.status !== "offline");

      if (onlineServers.length === 0) return undefined;

      switch (state.algorithm) {
        case "round-robin":
          return (
            onlineServers.find((s) => s.id === state.nextServerId) ||
            onlineServers[0]
          );

        case "least-connections":
          return onlineServers.reduce(
            (min, server) => (server.load < min.load ? server : min),
            onlineServers[0]
          );

        case "ip-hash":
          // Simulate IP hash by using a random but consistent server for each request
          const randomIndex = Math.floor(Math.random() * onlineServers.length);
          return onlineServers[randomIndex];

        default:
          return onlineServers[0];
      }
    };

    // Get the next server ID for round-robin
    const getNextServerId = (
      algorithm: string,
      currentId: number,
      servers: Server[]
    ): number => {
      if (algorithm !== "round-robin") return currentId;

      const onlineServers = servers.filter((s) => s.status !== "offline");
      if (onlineServers.length === 0) return currentId;

      const currentIndex = onlineServers.findIndex((s) => s.id === currentId);
      const nextIndex = (currentIndex + 1) % onlineServers.length;
      return onlineServers[nextIndex].id;
    };

    // Generate a new request
    const generateRequest = () => {
      const newRequest: Request = {
        id: requestIdRef.current++,
        status: "pending",
        position: { x: 100, y: 200 },
        startTime: Date.now(),
      };

      setState((prev) => {
        // Determine target server based on algorithm
        const targetServer = selectServer(prev);

        if (targetServer) {
          // Update server load
          const updatedServers = prev.servers.map((server) =>
            server.id === targetServer.id
              ? {
                  ...server,
                  load: server.load + 1,
                  requests: server.requests + 1,
                }
              : server
          );

          // Update request with target server
          const updatedRequest = {
            ...newRequest,
            targetServer: targetServer.id,
            status: "processing" as const,
            processingTime: Date.now(),
          };

          // Update stats
          const updatedStats = {
            ...prev.stats,
            totalRequests: prev.stats.totalRequests + 1,
          };

          return {
            ...prev,
            requests: [...prev.requests, updatedRequest],
            servers: updatedServers,
            stats: updatedStats,
            nextServerId: getNextServerId(
              prev.algorithm,
              prev.nextServerId,
              updatedServers
            ),
          };
        }

        return prev;
      });
    };

    // Process existing requests
    const processRequests = (timestamp: number) => {
      setState((prev) => {
        const updatedRequests = prev.requests.map((request) => {
          if (request.status === "processing") {
            // Check if request should complete
            const processingDuration =
              (timestamp - (request.processingTime || 0)) * processingSpeed;
            const targetServer = prev.servers.find(
              (s) => s.id === request.targetServer
            );

            if (processingDuration > 2000) {
              // Determine if request succeeds or fails
              const success = targetServer
                ? Math.random() > targetServer.failureChance
                : true;

              return {
                ...request,
                status: success ? ("completed" as const) : ("failed" as const),
                completionTime: timestamp,
              };
            }
          }
          return request;
        });

        // Update server loads
        const updatedServers = prev.servers.map((server) => {
          const activeRequests = updatedRequests.filter(
            (r) => r.targetServer === server.id && r.status === "processing"
          ).length;

          // Update server status based on load
          let status = "online";
          if (activeRequests > 10) {
            status = "overloaded";
          } else if (Math.random() < 0.001) {
            status = "offline";
          }

          return {
            ...server,
            load: activeRequests,
            status: status as "online" | "offline" | "overloaded",
          };
        });

        // Calculate stats
        const completedRequests = updatedRequests.filter(
          (r) => r.status === "completed"
        );
        const failedRequests = updatedRequests.filter(
          (r) => r.status === "failed"
        );

        // Calculate average response time
        const responseTimes = completedRequests
          .filter((r) => r.completionTime && r.startTime)
          .map((r) => (r.completionTime || 0) - r.startTime);

        const averageResponseTime =
          responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) /
              responseTimes.length
            : 0;

        // Clean up old completed/failed requests
        const currentRequests = updatedRequests.filter((r) => {
          if (r.status === "completed" || r.status === "failed") {
            return timestamp - (r.completionTime || 0) < 2000; // Keep for 2 seconds
          }
          return true;
        });

        return {
          ...prev,
          requests: currentRequests,
          servers: updatedServers,
          stats: {
            ...prev.stats,
            completedRequests: completedRequests.length,
            failedRequests: failedRequests.length,
            averageResponseTime: averageResponseTime,
          },
        };
      });
    };

    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      // Generate new requests based on rate
      if (timestamp - lastRequestTimeRef.current > 1000 / requestRate) {
        generateRequest();
        lastRequestTimeRef.current = timestamp;
      }

      // Process requests
      processRequests(timestamp);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, requestRate, processingSpeed]);

  // Reset the simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setState({
      ...initialState,
      algorithm: state.algorithm,
      servers: Array(serverCount)
        .fill(0)
        .map((_, i) => ({
          id: i + 1,
          load: 0,
          status: "online",
          position: { x: 0, y: 0 },
          requests: 0,
          failureChance: failureRate / 100,
        })),
    });
    requestIdRef.current = 1;
    lastRequestTimeRef.current = 0;
  };

  // Change the load balancing algorithm
  const changeAlgorithm = (
    algorithm: "round-robin" | "least-connections" | "ip-hash"
  ) => {
    setState((prev) => ({ ...prev, algorithm }));
  };

  // Get color based on server status
  const getServerColor = (status: string): string => {
    switch (status) {
      case "online":
        return "text-green-500 bg-green-500/10";
      case "offline":
        return "text-red-500 bg-red-500/10";
      case "overloaded":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  // Get explanation text based on current algorithm
  const getAlgorithmExplanation = (): string => {
    switch (state.algorithm) {
      case "round-robin":
        return "L'algorithme Round Robin distribue les requêtes de manière séquentielle à chaque serveur à tour de rôle. Simple et efficace pour des charges uniformes, mais ne tient pas compte de la charge actuelle des serveurs.";
      case "least-connections":
        return "L'algorithme Least Connections dirige les requêtes vers le serveur ayant le moins de connexions actives. Idéal pour des requêtes de durée variable, car il équilibre dynamiquement la charge en fonction de la capacité disponible.";
      case "ip-hash":
        return "L'algorithme IP Hash utilise l'adresse IP du client pour déterminer quel serveur recevra la requête. Cela garantit que les requêtes d'un même client sont toujours dirigées vers le même serveur, ce qui est utile pour maintenir les sessions.";
      default:
        return "";
    }
  };

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Visualisation d&apos;un Load Balancer
        </CardTitle>
        <CardDescription>
          Explorez comment différents algorithmes de répartition de charge
          distribuent le trafic entre plusieurs serveurs.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Algorithm Selection */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  state.algorithm === "round-robin" ? "default" : "outline"
                }
                size="sm"
                onClick={() => changeAlgorithm("round-robin")}
              >
                Round Robin
              </Button>
              <Button
                variant={
                  state.algorithm === "least-connections"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => changeAlgorithm("least-connections")}
              >
                Least Connections
              </Button>
              <Button
                variant={state.algorithm === "ip-hash" ? "default" : "outline"}
                size="sm"
                onClick={() => changeAlgorithm("ip-hash")}
              >
                IP Hash
              </Button>

              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  {showExplanation ? "Masquer" : "Afficher"} l&apos;explication
                </Button>
              </div>
            </div>

            {/* Algorithm Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-lg bg-muted/50 border"
                >
                  <p className="text-sm text-muted-foreground">
                    {getAlgorithmExplanation()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {/* Load Balancer */}
                <g transform="translate(100, 200)">
                  <rect
                    x="-50"
                    y="-30"
                    width="100"
                    height="60"
                    rx="5"
                    fill="#f1f5f9"
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#1e293b"
                  >
                    Load Balancer
                  </text>
                </g>

                {/* Servers */}
                {state.servers.map((server) => (
                  <g
                    key={server.id}
                    transform={`translate(${server.position.x}, ${server.position.y})`}
                  >
                    <rect
                      x="-40"
                      y="-25"
                      width="80"
                      height="50"
                      rx="5"
                      className={getServerColor(server.status)}
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="-5"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="currentColor"
                    >
                      Server {server.id}
                    </text>
                    <text
                      x="0"
                      y="15"
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                    >
                      Load: {server.load}
                    </text>
                  </g>
                ))}

                {/* Requests */}
                {state.requests.map((request) => {
                  const targetServer = state.servers.find(
                    (s) => s.id === request.targetServer
                  );

                  if (!targetServer) return null;

                  // Calculate position along the path
                  let x = 100;
                  let y = 200;

                  if (
                    request.status === "processing" ||
                    request.status === "completed" ||
                    request.status === "failed"
                  ) {
                    const progress =
                      request.status === "processing"
                        ? Math.min(
                            (Date.now() - (request.processingTime || 0)) / 1000,
                            1
                          )
                        : 1;

                    x = 100 + (targetServer.position.x - 100) * progress;
                    y = 200 + (targetServer.position.y - 200) * progress;
                  }

                  return (
                    <g key={request.id} transform={`translate(${x}, ${y})`}>
                      <circle
                        r="5"
                        fill={
                          request.status === "pending"
                            ? "#3b82f6"
                            : request.status === "processing"
                            ? "#f59e0b"
                            : request.status === "completed"
                            ? "#10b981"
                            : "#ef4444"
                        }
                      />
                    </g>
                  );
                })}

                {/* Client */}
                <g transform="translate(20, 200)">
                  <circle
                    r="20"
                    fill="#f1f5f9"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                  <Globe className="w-6 h-6 text-slate-500" x="-12" y="-12" />
                </g>
              </svg>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={resetSimulation}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Requêtes Totales
                </p>
                <p className="font-medium">{state.stats.totalRequests}</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Requêtes Complétées
                </p>
                <p className="font-medium text-green-500">
                  {state.stats.completedRequests}
                </p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Requêtes Échouées
                </p>
                <p className="font-medium text-red-500">
                  {state.stats.failedRequests}
                </p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Temps de Réponse Moyen
                </p>
                <p className="font-medium">
                  {Math.round(state.stats.averageResponseTime)} ms
                </p>
              </Card>
            </div>

            {/* Server Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">État des Serveurs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {state.servers.map((server) => (
                  <div
                    key={server.id}
                    className={`p-2 rounded-md border flex items-center justify-between ${
                      server.status === "online"
                        ? "border-green-500/20"
                        : server.status === "offline"
                        ? "border-red-500/20"
                        : "border-yellow-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Server
                        className={`h-4 w-4 ${
                          server.status === "online"
                            ? "text-green-500"
                            : server.status === "offline"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      />
                      <span className="text-sm">Server {server.id}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={getServerColor(server.status)}
                    >
                      {server.status === "online"
                        ? "En ligne"
                        : server.status === "offline"
                        ? "Hors ligne"
                        : "Surchargé"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Nombre de Serveurs
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {serverCount}
                  </span>
                </div>
                <Slider
                  value={[serverCount]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(value) => setServerCount(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Taux de Requêtes (par seconde)
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {requestRate}
                  </span>
                </div>
                <Slider
                  value={[requestRate]}
                  min={0.5}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setRequestRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Taux d&apos;Échec (%)
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {failureRate}%
                  </span>
                </div>
                <Slider
                  value={[failureRate]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(value) => setFailureRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Vitesse de Traitement
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {processingSpeed}x
                  </span>
                </div>
                <Slider
                  value={[processingSpeed]}
                  min={0.5}
                  max={3}
                  step={0.5}
                  onValueChange={(value) => setProcessingSpeed(value[0])}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                Paramètres de Simulation
              </h3>
              <p className="text-sm text-muted-foreground">
                Ajustez les paramètres ci-dessus pour voir comment différentes
                configurations affectent la performance du système. Augmentez le
                nombre de serveurs pour gérer plus de trafic, ou augmentez le
                taux d&apos;échec pour simuler des conditions de réseau
                instables.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("visualization")}>
                Retour à la Visualisation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
