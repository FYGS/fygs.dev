"use client";

import {
  AlertCircle,
  Ban,
  BarChart,
  CheckCircle,
  Eye,
  Lock,
  RefreshCw,
  Repeat,
  Search,
  Server,
  Settings,
  Shield,
  GitBranch as Split,
} from "lucide-react";
import type { Service, Proxy, Request, Stats, ServiceMeshType } from "./types";

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
        )}

        {/* Services and their proxies */}
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

        {/* Connection lines between services */}
        <path
          d="M 190,150 L 360,100"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 190,150 L 360,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 440,100 L 610,150"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 440,250 L 610,150"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 440,250 L 610,300"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Requests */}
        {requests.map((request) => (
          <g
            key={request.id}
            transform={`translate(${request.position.x}, ${request.position.y})`}
            className="group"
          >
            {/* Request circle with method indicator */}
            <circle
              r="6"
              fill={
                request.status === "success"
                  ? "#10b981"
                  : request.status === "error"
                  ? "#ef4444"
                  : request.status === "rejected"
                  ? "#f59e0b"
                  : "#3b82f6"
              }
              opacity={
                request.status === "success" ||
                request.status === "error" ||
                request.status === "rejected"
                  ? 0.5
                  : 1
              }
              strokeWidth={request.priority === "high" ? 1.5 : 0}
              stroke={request.priority === "high" ? "#ef4444" : "none"}
            />

            {/* Method indicator */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6"
              fill="white"
              fontWeight="bold"
            >
              {request.method.charAt(0)}
            </text>

            {/* Security indicator */}
            {activeFeature === "security" && request.secured && (
              <circle
                r="9"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            )}

            {/* Traffic management indicators */}
            {activeFeature === "traffic" &&
              request.type === "retry" && (
                <circle
                  r="9"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
              )}
            {activeFeature === "traffic" &&
              request.type === "circuit-broken" && (
                <circle
                  r="9"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}

            {/* Request tooltip */}
            <foreignObject
              x="-150"
              y="-120"
              width="300"
              height="120"
              style={{ pointerEvents: "none", opacity: 0 }}
              className="group-hover:opacity-100 transition-opacity duration-200"
            >
              <div className="bg-gray-800 p-2 rounded shadow-lg border text-xs overflow-hidden">
                <div className="font-semibold mb-1 flex justify-between">
                  <span>
                    {request.method} {request.target}
                  </span>
                  <span
                    className={`font-medium ${
                              request.status === "error"
                                ? "text-red-500"
                                : request.status === "success"
                                ? "text-green-500"
                                : request.status === "rejected"
                                ? "text-amber-500"
                                : "text-blue-500"
                            }`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-mono">{request.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{request.size} bytes</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span
                    className={`font-medium ${
                              request.priority === "high"
                                ? "text-red-500"
                                : request.priority === "medium"
                                ? "text-amber-500"
                                : "text-gray-500"
                            }`}
                  >
                    {request.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trace ID:</span>
                  <span className="font-mono text-[8px] truncate">
                    {request.traceId}
                  </span>
                </div>
                {request.secured && (
                  <div className="flex justify-between">
                    <span>Security:</span>
                    <span className="text-green-500">mTLS Enabled</span>
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      {/* Feature-specific overlays */}
      {activeFeature === "observability" && (
        <div className="absolute bottom-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
          <div className="flex justify-between gap-4">
            <span>Requêtes totales:</span>
            <span className="font-medium">{stats.totalRequests}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Requêtes réussies:</span>
            <span className="font-medium text-green-500">
              {stats.successfulRequests}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Requêtes échouées:</span>
            <span className="font-medium text-red-500">
              {stats.failedRequests}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Latence moyenne:</span>
            <span className="font-medium">
              {stats.averageLatency} ms
            </span>
          </div>
        </div>
      )}

      {activeFeature === "security" && (
        <div className="absolute top-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-500" />
            <span>Communication sécurisée par mTLS</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Politiques d&apos;autorisation appliquées</span>
          </div>
        </div>
      )}

      {activeFeature === "traffic" && (
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
      )}

      {activeFeature === "control-plane" && (
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
      )}
    </div>
  );
}
