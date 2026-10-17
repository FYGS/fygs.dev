import {
  Settings,
  GitBranch as Split,
  Repeat,
  Search,
  BarChart,
  CheckCircle,
} from "lucide-react";
import type { ServiceMeshType } from "../types";

export function ControlPlaneOverlay({ serviceMeshType }: {
  serviceMeshType: ServiceMeshType;
}) {
  return (
    <div className="absolute top-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-purple-500" />
        <span>Plan de contrôle actif</span>
      </div>

      {/* Service mesh specific control plane features */}
      {serviceMeshType === "istio" && (
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-blue-500" />
          <span>Istiod - Configuration centralisée</span>
        </div>
      )}

      {serviceMeshType === "linkerd" && (
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-green-500" />
          <span>Linkerd Control Plane</span>
        </div>
      )}

      {serviceMeshType === "consul" && (
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-500" />
          <span>Consul Server</span>
        </div>
      )}

      {serviceMeshType === "app-mesh" && (
        <div className="flex items-center gap-2">
          <BarChart className="w-4 h-4 text-pink-500" />
          <span>AWS App Mesh Control Plane</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Propagation des politiques</span>
      </div>
    </div>
  );
}
