"use client";

import type { Service, Proxy, Request, Stats, ServiceMeshType } from "./types";
import { ControlPlaneLayer } from "./mesh-canvas/control-plane-layer";
import { ServicesLayer } from "./mesh-canvas/services-layer";
import { ConnectionLines } from "./mesh-canvas/connection-lines";
import { RequestsLayer } from "./mesh-canvas/requests-layer";
import { ObservabilityOverlay } from "./mesh-canvas/observability-overlay";
import { SecurityOverlay } from "./mesh-canvas/security-overlay";
import { TrafficOverlay } from "./mesh-canvas/traffic-overlay";
import { ControlPlaneOverlay } from "./mesh-canvas/control-plane-overlay";

export function MeshCanvas({ activeFeature, proxies, requests, scenario, serviceMeshType, services, stats }: {
  activeFeature: "traffic" | "security" | "observability" | "control-plane";
  proxies: Proxy[];
  requests: Request[];
  scenario: "normal" | "high-load" | "failure";
  serviceMeshType: ServiceMeshType;
  services: Service[];
  stats: Stats;
}) {
  return (
    <div className="relative w-full h-[500px] border rounded-lg bg-background/50 overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        className="absolute inset-0"
      >
        {/* Control Plane (only visible when control-plane feature is active) */}
        {activeFeature === "control-plane" && (
          <ControlPlaneLayer proxies={proxies} serviceMeshType={serviceMeshType} services={services} />
        )}

        {/* Services and their proxies */}
        <ServicesLayer activeFeature={activeFeature} proxies={proxies} serviceMeshType={serviceMeshType} services={services} />

        {/* Connection lines between services */}
        <ConnectionLines />

        {/* Requests */}
        <RequestsLayer activeFeature={activeFeature} requests={requests} />
      </svg>

      {/* Feature-specific overlays */}
      {activeFeature === "observability" && (
        <ObservabilityOverlay stats={stats} />
      )}

      {activeFeature === "security" && (
        <SecurityOverlay />
      )}

      {activeFeature === "traffic" && (
        <TrafficOverlay scenario={scenario} serviceMeshType={serviceMeshType} />
      )}

      {activeFeature === "control-plane" && (
        <ControlPlaneOverlay serviceMeshType={serviceMeshType} />
      )}
    </div>
  );
}
