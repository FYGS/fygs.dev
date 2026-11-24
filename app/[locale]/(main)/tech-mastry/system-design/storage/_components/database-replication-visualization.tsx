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
import { useCallback, useEffect, useRef, useState } from "react";
import { ExplanationTab } from "./database-replication/explanation-tab";
import { createTopology } from "./database-replication/lib";
import { simulateTick, type SimulationSettings } from "./database-replication/simulation";
import { LoadControls } from "./database-replication/load-controls";
import { ReplicationCanvas } from "./database-replication/replication-canvas";
import { ReplicationSelectors } from "./database-replication/replication-selectors";
import type {
  ConsistencyModel,
  ReplicationType,
} from "./database-replication/types";

export function DatabaseReplicationVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for replication type
  const [replicationType, setReplicationType] =
    useState<ReplicationType>("master-slave");

  // State for consistency model
  const [consistencyModel, setConsistencyModel] =
    useState<ConsistencyModel>("async");

  // State for database nodes and replication links
  const [topology, setTopology] = useState(() => createTopology("master-slave"));
  const { nodes, links } = topology;

  // State for simulated load
  const [writeLoad, setWriteLoad] = useState(30);
  const [readLoad, setReadLoad] = useState(70);

  // State for node failure simulation
  const [failedNode, setFailedNode] = useState<string | null>(null);

  // Timer reference for animations
  const animationTimer = useRef<NodeJS.Timeout | null>(null);

  // The tick reads the topology and the settings through refs: it runs from an
  // interval created once per replication type, so it would otherwise see the
  // load, consistency model and failed node of the render that created it.
  // Every topology change goes through `commitTopology` so that the ref is the
  // source of truth, and the tick (which draws random numbers) never runs
  // inside a state updater, which StrictMode runs twice.
  const topologyRef = useRef(topology);
  const settingsRef = useRef<SimulationSettings>({ writeLoad, readLoad, consistencyModel, failedNode });
  useEffect(() => {
    settingsRef.current = { writeLoad, readLoad, consistencyModel, failedNode };
  });
  const commitTopology = useCallback((next: typeof topology) => {
    topologyRef.current = next;
    setTopology(next);
  }, []);

  // Switching the replication type rebuilds the topology and clears the failed node
  const changeReplicationType = (type: ReplicationType) => {
    if (type === replicationType) return;
    setReplicationType(type);
    setFailedNode(null);
    commitTopology(createTopology(type));
  };

  // Simulate database operations on a timer
  useEffect(() => {
    const timer = setInterval(() => {
      const { nodes: prevNodes, links: prevLinks } = topologyRef.current;
      commitTopology(simulateTick(prevNodes, prevLinks, settingsRef.current, Date.now()));
    }, 2000);
    animationTimer.current = timer;

    return () => {
      clearInterval(timer);
    };
  }, [replicationType, commitTopology]);

  // Simulate node failure
  const handleNodeFailure = (nodeId: string) => {
    const { nodes: prevNodes, links: prevLinks } = topologyRef.current;
    const recover = failedNode === nodeId;
    setFailedNode(recover ? null : nodeId);

    commitTopology({
      nodes: prevNodes.map((node) =>
        node.id === nodeId
          ? recover
            ? { ...node, status: "active" }
            : { ...node, status: "down", operations: [] }
          : node
      ),
      links: prevLinks.map((link) =>
        link.source === nodeId || link.target === nodeId
          ? { ...link, status: recover ? "active" : "down" }
          : link
      ),
    });
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
            <ReplicationSelectors
              replicationType={replicationType}
              setReplicationType={changeReplicationType}
              consistencyModel={consistencyModel}
              setConsistencyModel={setConsistencyModel}
            />

            {/* Controls */}
            <LoadControls
              writeLoad={writeLoad}
              setWriteLoad={setWriteLoad}
              readLoad={readLoad}
              setReadLoad={setReadLoad}
            />

            {/* Visualization Canvas */}
            <ReplicationCanvas
              nodes={nodes}
              links={links}
              handleNodeFailure={handleNodeFailure}
            />
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <ExplanationTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
