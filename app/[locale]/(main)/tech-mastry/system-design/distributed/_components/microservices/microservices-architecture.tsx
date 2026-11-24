"use client";

import type { Scenario } from "./types";
import { MicroservicesDiagram } from "./architecture/microservices-diagram";
import { StatsOverlay } from "./architecture/stats-overlay";
import { useMicroservicesSimulation } from "./architecture/use-microservices-simulation";

// Microservices Architecture Component
export function MicroservicesArchitecture({ scenario }: { scenario: Scenario }) {
  const { services, requests, stats } = useMicroservicesSimulation(scenario);

  return (
    <div className="relative w-full h-full">
      {/* Background Elements */}
      <MicroservicesDiagram services={services} requests={requests} />

      {/* Stats Overlay */}
      <StatsOverlay stats={stats} />
    </div>
  );
}
