import { Settings } from "lucide-react";
import type { Proxy, ServiceMeshType, Service } from "../types";

export function ControlPlaneLayer({ proxies, serviceMeshType, services }: {
  proxies: Proxy[];
  serviceMeshType: ServiceMeshType;
  services: Service[];
}) {
  return (
    <g>
      {/* Control Plane Box */}
      <rect
        x="350"
        y="50"
        width="100"
        height="60"
        rx="5"
        fill={
          serviceMeshType === "istio"
            ? "#e0f2fe"
            : serviceMeshType === "linkerd"
            ? "#f0fdf4"
            : serviceMeshType === "consul"
            ? "#fef3c7"
            : "#fdf2f8"
        }
        stroke={
          serviceMeshType === "istio"
            ? "#3b82f6"
            : serviceMeshType === "linkerd"
            ? "#10b981"
            : serviceMeshType === "consul"
            ? "#f59e0b"
            : "#ec4899"
        }
        strokeWidth="2"
      />
      <text
        x="400"
        y="75"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={
          serviceMeshType === "istio"
            ? "#3b82f6"
            : serviceMeshType === "linkerd"
            ? "#10b981"
            : serviceMeshType === "consul"
            ? "#f59e0b"
            : "#ec4899"
        }
      >
        {serviceMeshType === "istio"
          ? "Istiod"
          : serviceMeshType === "linkerd"
          ? "Linkerd CP"
          : serviceMeshType === "consul"
          ? "Consul Server"
          : "App Mesh CP"}
      </text>
      <text
        x="400"
        y="95"
        textAnchor="middle"
        fontSize="10"
        fill="#64748b"
      >
        Plan de Contrôle
      </text>
      <foreignObject x="385" y="55" width="30" height="30">
        <div className="flex items-center justify-center w-full h-full">
          <Settings className="w-6 h-6 text-slate-600" />
        </div>
      </foreignObject>

      {/* Configuration Update Lines */}
      {services.map((service) => {
        const proxy = proxies.find(
          (p) => p.serviceId === service.id
        );
        if (!proxy) return null;
        return (
          <g key={`config-${service.id}`}>
            <path
              d={`M 400,110 L ${proxy.position.x},${
                              proxy.position.y - 25
                            }`}
              stroke={
                serviceMeshType === "istio"
                  ? "#3b82f6"
                  : serviceMeshType === "linkerd"
                  ? "#10b981"
                  : serviceMeshType === "consul"
                  ? "#f59e0b"
                  : "#ec4899"
              }
              strokeWidth="1"
              strokeDasharray="4,4"
              className="animate-pulse"
            />
            {/* Configuration Update Indicator */}
            <circle
              cx={proxy.position.x}
              cy={proxy.position.y - 25}
              r="3"
              fill={
                serviceMeshType === "istio"
                  ? "#3b82f6"
                  : serviceMeshType === "linkerd"
                  ? "#10b981"
                  : serviceMeshType === "consul"
                  ? "#f59e0b"
                  : "#ec4899"
              }
              className="animate-ping"
            />
          </g>
        );
      })}
    </g>
  );
}
