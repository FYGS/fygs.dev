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
import { useEffect, useRef, useState } from "react";
import { ExplanationTab } from "./database-replication/explanation-tab";
import { createTopology } from "./database-replication/lib";
import { LoadControls } from "./database-replication/load-controls";
import { ReplicationCanvas } from "./database-replication/replication-canvas";
import { ReplicationSelectors } from "./database-replication/replication-selectors";
import type {
  ConsistencyModel,
  DatabaseNode,
  ReplicationLink,
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
    const { nodes: newNodes, links: newLinks } =
      createTopology(replicationType);

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
            <ReplicationSelectors
              replicationType={replicationType}
              setReplicationType={setReplicationType}
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
