import { Database, Layers, Users } from "lucide-react";
import { getRequestColor } from "./colors";
import type { ServicesState } from "./types";
import type { Request } from "../types";
import { ConnectionLines } from "./connection-lines";
import { ServiceNodes } from "./service-nodes";

export function MicroservicesDiagram({
  services,
  requests,
}: {
  services: ServicesState;
  requests: Request[];
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 500"
      className="absolute inset-0"
    >
      {/* User */}
      <g transform="translate(50, 250)">
        <circle r="30" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
        <Users className="w-6 h-6 text-slate-500" x="-12" y="-12" />
        <text x="0" y="40" textAnchor="middle" fontSize="14" fill="#1e293b">
          Utilisateurs
        </text>
      </g>

      {/* API Gateway */}
      <g transform="translate(200, 250)">
        <rect
          x="-50"
          y="-40"
          width="100"
          height="80"
          rx="5"
          fill="#f1f5f9"
          stroke="#6366f1"
          strokeWidth="2"
        />
        <foreignObject x="-15" y="-15" width="30" height="30">
          <div className="flex items-center justify-center w-full h-full">
            <Layers className="w-6 h-6 text-indigo-500" />
          </div>
        </foreignObject>
        <text x="0" y="20" textAnchor="middle" fontSize="12" fill="#1e293b">
          API Gateway
        </text>
      </g>

        <ServiceNodes services={services} />

      {/* Database */}
      <g transform="translate(600, 250)">
        <rect
          x="-50"
          y="-40"
          width="100"
          height="80"
          rx="5"
          fill="#f0fdfa"
          stroke="#14b8a6"
          strokeWidth="2"
        />
        <foreignObject x="-15" y="-15" width="30" height="30">
          <div className="flex items-center justify-center w-full h-full">
            <Database className="w-6 h-6 text-teal-500" />
          </div>
        </foreignObject>
        <rect
          x="-50"
          y="10"
          width="100"
          height="20"
          rx="3"
          fill="#f8fafc"
          stroke="none"
        />
        <text x="0" y="23" textAnchor="middle" fontSize="12" fill="#1e293b">
          Base de Données
        </text>
      </g>

        <ConnectionLines />

      {/* Requests */}
      {requests.map((request) => (
        <g
          key={request.id}
          transform={`translate(${request.position.x}, ${request.position.y})`}
        >
          <circle
            r="6"
            fill={getRequestColor(request)}
            opacity={
              request.status === "completed" || request.status === "failed"
                ? 0.5
                : 1
            }
          />
        </g>
      ))}
    </svg>
  );
}
