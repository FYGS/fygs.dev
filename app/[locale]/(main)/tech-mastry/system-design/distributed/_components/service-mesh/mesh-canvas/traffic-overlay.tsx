import {
  RefreshCw,
  GitBranch as Split,
  Repeat,
  Search,
  BarChart,
  CheckCircle,
  AlertCircle,
  Ban,
} from "lucide-react";
import type { ServiceMeshType } from "../types";

export function TrafficOverlay({ scenario, serviceMeshType }: {
  scenario: "normal" | "high-load" | "failure";
  serviceMeshType: ServiceMeshType;
}) {
  return (
    <div className="absolute top-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-blue-500" />
        <span>Équilibrage de charge actif</span>
      </div>

      {/* Service mesh specific traffic features */}
      {serviceMeshType === "istio" && (
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-blue-500" />
          <span>Canary Deployments</span>
        </div>
      )}

      {serviceMeshType === "linkerd" && (
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-green-500" />
          <span>Nouvelles tentatives automatiques</span>
        </div>
      )}

      {serviceMeshType === "consul" && (
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-500" />
          <span>Découverte de services dynamique</span>
        </div>
      )}

      {serviceMeshType === "app-mesh" && (
        <div className="flex items-center gap-2">
          <BarChart className="w-4 h-4 text-pink-500" />
          <span>Routage pondéré</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Circuit breakers configurés</span>
      </div>

      {scenario === "high-load" && (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Charge élevée détectée</span>
        </div>
      )}

      {scenario === "failure" && (
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-red-500" />
          <span>Circuit breaker activé</span>
        </div>
      )}
    </div>
  );
}
