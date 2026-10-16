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
        Math.PI * (0.2 + (index / Math.max(1, state.servers.length - 1)) * 0.6);
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
  }, [serverCount]); // Only recalculate positions when server count changes

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

    // Preserve current server positions
    const currentPositions: Record<number, { x: number; y: number }> = {};
    state.servers.forEach((server) => {
      currentPositions[server.id] = server.position;
    });

    setState({
      ...initialState,
      algorithm: state.algorithm,
      servers: Array(serverCount)
        .fill(0)
        .map((_, i) => {
          const serverId = i + 1;
          return {
            id: serverId,
            load: 0,
            status: "online" as const,
            // Use existing position if available, otherwise default to current position
            position: currentPositions[serverId] ||
              state.servers.find((s) => s.id === serverId)?.position || {
                x: 0,
                y: 0,
              },
            requests: 0,
            failureChance: failureRate / 100,
          };
        }),
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

  // Fonction supprimée car remplacée par des styles inline

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
    <Card className="border border-indigo-500/20 bg-background/60 backdrop-blur-xs shadow-lg shadow-indigo-500/5 rounded-xl overflow-hidden">
      <CardHeader className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-500/20">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500">
            <Layers className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
            Visualisation d&apos;un Load Balancer
          </span>
        </CardTitle>
        <CardDescription className="text-muted-foreground/90">
          Explorez comment différents algorithmes de répartition de charge
          distribuent le trafic entre plusieurs serveurs.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6 p-1 bg-background/80 border border-indigo-500/20 rounded-lg">
            <TabsTrigger
              value="visualization"
              className="data-[state=active]:bg-transparent data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Visualisation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none transition-all duration-300"
            >
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Algorithm Selection */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={
                  state.algorithm === "round-robin" ? "default" : "outline"
                }
                size="sm"
                onClick={() => changeAlgorithm("round-robin")}
                className={
                  state.algorithm === "round-robin"
                    ? "bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
                    : "border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all duration-300"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
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
                className={
                  state.algorithm === "least-connections"
                    ? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md shadow-purple-500/20"
                    : "border-purple-500/30 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-300"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                Least Connections
              </Button>
              <Button
                variant={state.algorithm === "ip-hash" ? "default" : "outline"}
                size="sm"
                onClick={() => changeAlgorithm("ip-hash")}
                className={
                  state.algorithm === "ip-hash"
                    ? "bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-md shadow-blue-500/20"
                    : "border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-300"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
                  <path d="m18 2 4 4-4 4" />
                  <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
                  <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
                  <path d="m18 14 4 4-4 4" />
                </svg>
                IP Hash
              </Button>

              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="border-gray-700 hover:bg-gray-800 transition-all duration-300"
                >
                  {showExplanation ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                      Masquer l&apos;explication
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Afficher l&apos;explication
                    </>
                  )}
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
                  className="p-6 rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs shadow-inner"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-indigo-500 mb-1">
                        {state.algorithm === "round-robin"
                          ? "Round Robin"
                          : state.algorithm === "least-connections"
                          ? "Least Connections"
                          : "IP Hash"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {getAlgorithmExplanation()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[400px] border border-indigo-500/20 rounded-xl bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {/* Load Balancer */}
                <g transform="translate(100, 200)">
                  <defs>
                    <linearGradient
                      id="lbGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                    <filter
                      id="lbGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <rect
                    x="-50"
                    y="-30"
                    width="100"
                    height="60"
                    rx="12"
                    fill="url(#lbGradient)"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    filter="url(#lbGlow)"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.5;0.8;0.5"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="#6366f1"
                  >
                    Load Balancer
                  </text>
                  <circle cx="-30" cy="-15" r="3" fill="#6366f1" opacity="0.6">
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="-20" cy="-15" r="3" fill="#6366f1" opacity="0.6">
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="0.5s"
                    />
                  </circle>
                  <circle cx="-10" cy="-15" r="3" fill="#6366f1" opacity="0.6">
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="1s"
                    />
                  </circle>
                </g>

                {/* Servers */}
                {state.servers.map((server) => (
                  <g
                    key={server.id}
                    transform={`translate(${server.position.x}, ${server.position.y})`}
                  >
                    <defs>
                      <filter
                        id={`serverGlow-${server.id}`}
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite
                          in="SourceGraphic"
                          in2="blur"
                          operator="over"
                        />
                      </filter>
                      <linearGradient
                        id={`serverGradient-${server.id}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            server.status === "online"
                              ? "#10b981"
                              : server.status === "overloaded"
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            server.status === "online"
                              ? "#059669"
                              : server.status === "overloaded"
                              ? "#d97706"
                              : "#dc2626"
                          }
                          stopOpacity="0.2"
                        />
                      </linearGradient>
                    </defs>
                    <rect
                      x="-40"
                      y="-25"
                      width="80"
                      height="50"
                      rx="10"
                      fill={`url(#serverGradient-${server.id})`}
                      stroke={
                        server.status === "online"
                          ? "#10b981"
                          : server.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                      filter={
                        server.status === "offline"
                          ? "none"
                          : `url(#serverGlow-${server.id})`
                      }
                    >
                      {server.status !== "offline" && (
                        <animate
                          attributeName="stroke-opacity"
                          values="0.6;0.9;0.6"
                          dur="3s"
                          repeatCount="indefinite"
                          begin={`${server.id * 0.5}s`}
                        />
                      )}
                    </rect>
                    <text
                      x="0"
                      y="-5"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="600"
                      fill={
                        server.status === "online"
                          ? "#10b981"
                          : server.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    >
                      Server {server.id}
                    </text>
                    <text
                      x="0"
                      y="15"
                      textAnchor="middle"
                      fontSize="10"
                      fill={
                        server.status === "online"
                          ? "#10b981"
                          : server.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                      opacity="0.8"
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
                      <defs>
                        <filter
                          id={`requestGlow-${request.id}`}
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite
                            in="SourceGraphic"
                            in2="blur"
                            operator="over"
                          />
                        </filter>
                      </defs>
                      <circle
                        r="7"
                        fill={
                          request.status === "pending"
                            ? "#3b82f6"
                            : request.status === "processing"
                            ? "#f59e0b"
                            : request.status === "completed"
                            ? "#10b981"
                            : "#ef4444"
                        }
                        opacity="0.2"
                        filter={`url(#requestGlow-${request.id})`}
                      >
                        <animate
                          attributeName="r"
                          values="7;9;7"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
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
                        stroke="white"
                        strokeWidth="1"
                        strokeOpacity="0.3"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.8;1;0.8"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Client */}
                <g transform="translate(20, 200)">
                  <defs>
                    <linearGradient
                      id="clientGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop
                        offset="100%"
                        stopColor="#60a5fa"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                    <filter
                      id="clientGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <circle
                    r="22"
                    fill="url(#clientGradient)"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    filter="url(#clientGlow)"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.5;0.8;0.5"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <foreignObject x="-12" y="-12" width="24" height="24">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </foreignObject>
                </g>
              </svg>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={() => setIsRunning(!isRunning)}
                  className={
                    isRunning
                      ? "bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-none shadow-md shadow-red-500/20"
                      : "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
                  }
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

                <Button
                  variant="outline"
                  onClick={resetSimulation}
                  className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border border-indigo-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7.5" />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                      <path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6v0Z" />
                      <path d="M18 18v3" />
                      <path d="M18 15v.01" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requêtes Totales
                  </p>
                </div>
                <p className="font-medium text-xl text-indigo-500">
                  {state.stats.totalRequests}
                </p>
              </Card>
              <Card className="p-4 border border-emerald-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-linear-to-br from-emerald-500/10 to-teal-500/10 text-emerald-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requêtes Complétées
                  </p>
                </div>
                <p className="font-medium text-xl text-emerald-500">
                  {state.stats.completedRequests}
                </p>
              </Card>
              <Card className="p-4 border border-red-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-red-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-linear-to-br from-red-500/10 to-rose-500/10 text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requêtes Échouées
                  </p>
                </div>
                <p className="font-medium text-xl text-red-500">
                  {state.stats.failedRequests}
                </p>
              </Card>
              <Card className="p-4 border border-blue-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temps de Réponse Moyen
                  </p>
                </div>
                <p className="font-medium text-xl text-blue-500">
                  {Math.round(state.stats.averageResponseTime)}{" "}
                  <span className="text-sm font-normal text-blue-500/70">
                    ms
                  </span>
                </p>
              </Card>
            </div>

            {/* Server Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
                  <Server className="h-5 w-5" />
                </div>
                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
                  État des Serveurs
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {state.servers.map((server) => (
                  <div
                    key={server.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 hover:shadow-md ${
                      server.status === "online"
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:shadow-emerald-500/10"
                        : server.status === "offline"
                        ? "border-red-500/30 bg-red-500/5 hover:shadow-red-500/10"
                        : "border-amber-500/30 bg-amber-500/5 hover:shadow-amber-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          server.status === "online"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : server.status === "offline"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        <Server className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        Server {server.id}
                        <span className="block text-xs text-muted-foreground">
                          Load: {server.load}
                        </span>
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`px-2.5 py-1 ${
                        server.status === "online"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          : server.status === "offline"
                          ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                      }`}
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
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="8"
                            rx="2"
                            ry="2"
                          />
                          <rect
                            x="2"
                            y="14"
                            width="20"
                            height="8"
                            rx="2"
                            ry="2"
                          />
                          <line x1="6" y1="6" x2="6.01" y2="6" />
                          <line x1="6" y1="18" x2="6.01" y2="18" />
                        </svg>
                      </div>
                      Nombre de Serveurs
                    </label>
                    <span className="text-sm font-semibold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-500">
                      {serverCount}
                    </span>
                  </div>
                  <Slider
                    value={[serverCount]}
                    min={1}
                    max={8}
                    step={1}
                    onValueChange={(value) => setServerCount(value[0])}
                    className="py-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-blue-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      Taux de Requêtes (par seconde)
                    </label>
                    <span className="text-sm font-semibold px-2 py-1 rounded-md bg-blue-500/10 text-blue-500">
                      {requestRate}
                    </span>
                  </div>
                  <Slider
                    value={[requestRate]}
                    min={0.5}
                    max={5}
                    step={0.5}
                    onValueChange={(value) => setRequestRate(value[0])}
                    className="py-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-red-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-red-500/10 transition-all duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-linear-to-br from-red-500/10 to-rose-500/10 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      Taux d&apos;Échec (%)
                    </label>
                    <span className="text-sm font-semibold px-2 py-1 rounded-md bg-red-500/10 text-red-500">
                      {failureRate}%
                    </span>
                  </div>
                  <Slider
                    value={[failureRate]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => setFailureRate(value[0])}
                    className="py-1"
                  />
                </div>
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

            <div className="p-6 rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs shadow-inner">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 mt-0.5">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-indigo-500 mb-2">
                    Paramètres de Simulation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ajustez les paramètres ci-dessus pour voir comment
                    différentes configurations affectent la performance du
                    système. Augmentez le nombre de serveurs pour gérer plus de
                    trafic, ou augmentez le taux d&apos;échec pour simuler des
                    conditions de réseau instables.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab("visualization")}
                className="bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Retour à la Visualisation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
