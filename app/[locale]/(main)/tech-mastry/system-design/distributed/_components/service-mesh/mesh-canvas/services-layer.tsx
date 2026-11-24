import { Server, RefreshCw, Shield, Eye, Settings } from "lucide-react";
import type { Proxy, ServiceMeshType, Service } from "../types";

export function ServicesLayer({ activeFeature, proxies, serviceMeshType, services }: {
  activeFeature: "traffic" | "security" | "observability" | "control-plane";
  proxies: Proxy[];
  serviceMeshType: ServiceMeshType;
  services: Service[];
}) {
  return (
    <>
      {services.map((service) => {
        const proxy = proxies.find((p) => p.serviceId === service.id);
        return (
          <g key={service.id}>
            {/* Service */}
            <rect
              x={service.position.x - 70}
              y={service.position.y - 40}
              width="140"
              height="80"
              rx="5"
              fill={
                service.status === "healthy"
                  ? "#f1f5f9"
                  : service.status === "degraded"
                  ? "#fef3c7"
                  : "#fee2e2"
              }
              stroke={
                service.status === "healthy"
                  ? "#94a3b8"
                  : service.status === "degraded"
                  ? "#f59e0b"
                  : "#ef4444"
              }
              strokeWidth="2"
            />
            <foreignObject
              x={service.position.x - 20}
              y={service.position.y - 35}
              width="40"
              height="40"
            >
              <div className="flex items-center justify-center w-full h-full">
                <Server className="w-7 h-7 text-slate-600" />
              </div>
            </foreignObject>
            <rect
              x={service.position.x - 65}
              y={service.position.y + 10}
              width="130"
              height="20"
              rx="3"
              fill="#f8fafc"
              stroke="none"
            />
            <text
              x={service.position.x}
              y={service.position.y + 24}
              textAnchor="middle"
              fontSize="12"
              fill="#1e293b"
            >
              {service.name}
            </text>
            <rect
              x={service.position.x - 40}
              y={service.position.y - 15}
              width="80"
              height="15"
              rx="3"
              fill="#f8fafc"
              stroke="none"
            />
            <text
              x={service.position.x}
              y={service.position.y - 5}
              textAnchor="middle"
              fontSize="10"
              fill={
                service.status === "healthy"
                  ? "#1e293b"
                  : service.status === "degraded"
                  ? "#f59e0b"
                  : "#ef4444"
              }
            >
              {service.status === "healthy"
                ? `Requêtes: ${service.requests}`
                : service.status === "degraded"
                ? "Dégradé"
                : "Défaillant"}
            </text>

            {/* Proxy (Sidecar) */}
            {proxy && (
              <>
                {/* Different proxy visualization based on service mesh type */}
                {serviceMeshType === "istio" && (
                  <>
                    <rect
                      x={proxy.position.x - 25}
                      y={proxy.position.y - 25}
                      width="50"
                      height="50"
                      rx="5"
                      fill="#e0f2fe"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={
                        activeFeature === "security" ? "0" : "5,5"
                      }
                    />
                    <text
                      x={proxy.position.x}
                      y={proxy.position.y - 30}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#3b82f6"
                      fontWeight="bold"
                    >
                      Istio Envoy
                    </text>
                  </>
                )}

                {serviceMeshType === "linkerd" && (
                  <>
                    <rect
                      x={proxy.position.x - 25}
                      y={proxy.position.y - 25}
                      width="50"
                      height="50"
                      rx="25"
                      fill="#f0fdf4"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={
                        activeFeature === "security" ? "0" : "5,5"
                      }
                    />
                    <text
                      x={proxy.position.x}
                      y={proxy.position.y - 30}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#10b981"
                      fontWeight="bold"
                    >
                      Linkerd Proxy
                    </text>
                  </>
                )}

                {serviceMeshType === "consul" && (
                  <>
                    <polygon
                      points={`${proxy.position.x},${
                                proxy.position.y - 25
                                } ${proxy.position.x + 25},${
                                  proxy.position.y
                                } ${proxy.position.x},${
                                  proxy.position.y + 25
                                } ${proxy.position.x - 25},${proxy.position.y}`}
                        fill="#fef3c7"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray={
                        activeFeature === "security" ? "0" : "5,5"
                      }
                    />
                    <text
                      x={proxy.position.x}
                      y={proxy.position.y - 30}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#f59e0b"
                      fontWeight="bold"
                    >
                      Consul Proxy
                    </text>
                  </>
                )}

                {serviceMeshType === "app-mesh" && (
                  <>
                    <rect
                      x={proxy.position.x - 25}
                      y={proxy.position.y - 25}
                      width="50"
                      height="50"
                      rx="5"
                      fill="#fdf2f8"
                      stroke="#ec4899"
                      strokeWidth="2"
                      strokeDasharray={
                        activeFeature === "security" ? "0" : "5,5"
                      }
                    />
                    <text
                      x={proxy.position.x}
                      y={proxy.position.y - 30}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#ec4899"
                      fontWeight="bold"
                    >
                      App Mesh Envoy
                    </text>
                  </>
                )}

                <foreignObject
                  x={proxy.position.x - 12}
                  y={proxy.position.y - 12}
                  width="24"
                  height="24"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {activeFeature === "traffic" && (
                      <RefreshCw className="w-5 h-5 text-blue-500" />
                    )}
                    {activeFeature === "security" && (
                      <Shield className="w-5 h-5 text-blue-500" />
                    )}
                    {activeFeature === "observability" && (
                      <Eye className="w-5 h-5 text-blue-500" />
                    )}
                    {activeFeature === "control-plane" && (
                      <Settings className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </foreignObject>
              </>
            )}
          </g>
        );
      })}
    </>
  );
}
