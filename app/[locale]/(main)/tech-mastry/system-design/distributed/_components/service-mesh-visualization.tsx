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
import { useState } from "react";
import { ServiceMeshComparison } from "./service-mesh/service-mesh-comparison";
import { ServiceMeshExplanation } from "./service-mesh/service-mesh-explanation";
import { SimulationControls } from "./service-mesh/simulation-controls";
import { MeshTypeSelector } from "./service-mesh/mesh-type-selector";
import { MeshCanvas } from "./service-mesh/mesh-canvas";
import { FeatureSelector } from "./service-mesh/feature-selector";
import { INITIAL_SERVICES } from "./service-mesh/data";
import { ImplementationsTable } from "./service-mesh/implementations-table";
import { PerformanceResults } from "./service-mesh/performance-results";
import { useMeshSimulation } from "./service-mesh/use-mesh-simulation";
import type {
  Service,
  Proxy,
  Request,
  Stats,
  ServiceMeshType,
} from "./service-mesh/types";


export function ServiceMeshVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");
  const [activeFeature, setActiveFeature] = useState<
    "traffic" | "security" | "observability" | "control-plane"
  >("traffic");
  const [serviceMeshType, setServiceMeshType] =
    useState<ServiceMeshType>("istio");


  // Initialize services
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);

  // Initialize proxies (sidecars)
  const [proxies] = useState<Proxy[]>(
    services.map((service) => ({
      id: `${service.id}-proxy`,
      serviceId: service.id,
      position: {
        x: service.position.x + 40,
        y: service.position.y,
      },
    }))
  );

  // Initialize requests
  const [requests, setRequests] = useState<Request[]>([]);

  // Initialize stats
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
  });

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<"normal" | "high-load" | "failure">(
    "normal"
  );

  useMeshSimulation({
    isRunning,
    scenario,
    activeFeature,
    serviceMeshType,
    services,
    proxies,
    setRequests,
    setServices,
    setStats,
  });

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Architecture Service Mesh
        </CardTitle>
        <CardDescription>
          Découvrez comment un maillage de services gère la communication, la
          sécurité et l&apos;observabilité entre microservices
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Feature Selection */}
            <FeatureSelector activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

            {/* Visualization Canvas */}
            <MeshCanvas activeFeature={activeFeature} proxies={proxies} requests={requests} scenario={scenario} serviceMeshType={serviceMeshType} services={services} stats={stats} />

            {/* Service Mesh Type Selector */}
            <MeshTypeSelector serviceMeshType={serviceMeshType} setServiceMeshType={setServiceMeshType} />

            {/* Controls */}
            <SimulationControls isRunning={isRunning} scenario={scenario} services={services} setIsRunning={setIsRunning} setRequests={setRequests} setScenario={setScenario} setServices={setServices} setStats={setStats} />
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <ServiceMeshExplanation serviceMeshType={serviceMeshType} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ServiceMeshComparison />

            <ImplementationsTable />

            <PerformanceResults />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
