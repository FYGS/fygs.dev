"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AlgorithmControls } from "./load-balancer/algorithm-controls";
import { AlgorithmExplanation } from "./load-balancer/algorithm-explanation";
import { initialState } from "./load-balancer/data";
import {
  advanceRequests,
  dispatchRequest,
  layoutServers,
} from "./load-balancer/lib";
import { NetworkCanvas } from "./load-balancer/network-canvas";
import { ServerStatus } from "./load-balancer/server-status";
import { SettingsPanel } from "./load-balancer/settings-panel";
import { SimulationControls } from "./load-balancer/simulation-controls";
import { StatsGrid } from "./load-balancer/stats-grid";
import type {
  Algorithm,
  LoadBalancerState,
  Request,
} from "./load-balancer/types";

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
    const updatedServers = layoutServers(state.servers);

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
    // Generate a new request
    const generateRequest = () => {
      const newRequest: Request = {
        id: requestIdRef.current++,
        status: "pending",
        position: { x: 100, y: 200 },
        startTime: Date.now(),
      };

      setState((prev) => dispatchRequest(prev, newRequest));
    };

    // Process existing requests
    const processRequests = (timestamp: number) => {
      setState((prev) => advanceRequests(prev, timestamp, processingSpeed));
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
  const changeAlgorithm = (algorithm: Algorithm) => {
    setState((prev) => ({ ...prev, algorithm }));
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
            <AlgorithmControls
              algorithm={state.algorithm}
              showExplanation={showExplanation}
              onChangeAlgorithm={changeAlgorithm}
              onToggleExplanation={() => setShowExplanation(!showExplanation)}
            />

            {/* Algorithm Explanation */}
            <AlgorithmExplanation
              algorithm={state.algorithm}
              show={showExplanation}
            />

            {/* Visualization Canvas */}
            <NetworkCanvas servers={state.servers} requests={state.requests} />

            {/* Controls */}
            <SimulationControls
              isRunning={isRunning}
              onToggleRunning={() => setIsRunning(!isRunning)}
              onReset={resetSimulation}
            />

            {/* Stats */}
            <StatsGrid stats={state.stats} />

            {/* Server Status */}
            <ServerStatus servers={state.servers} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel
              serverCount={serverCount}
              requestRate={requestRate}
              failureRate={failureRate}
              processingSpeed={processingSpeed}
              onServerCountChange={setServerCount}
              onRequestRateChange={setRequestRate}
              onFailureRateChange={setFailureRate}
              onProcessingSpeedChange={setProcessingSpeed}
              onBack={() => setActiveTab("visualization")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
