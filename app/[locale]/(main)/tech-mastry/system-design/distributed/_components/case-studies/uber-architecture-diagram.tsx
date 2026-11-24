"use client";

import { Smartphone } from "lucide-react";

// Uber Architecture Diagram Component
export function UberArchitectureDiagram() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 300"
      className="absolute inset-0"
    >
      {/* Main Platform */}
      <rect
        x="50"
        y="20"
        width="700"
        height="260"
        rx="10"
        fill="#f1f5f9"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <text
        x="400"
        y="40"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#64748b"
      >
        Uber Platform
      </text>

      {/* Mobile Apps */}
      <rect
        x="80"
        y="60"
        width="100"
        height="60"
        rx="5"
        fill="#dcfce7"
        stroke="#10b981"
        strokeWidth="2"
      />
      <text x="130" y="80" textAnchor="middle" fontSize="12" fill="#1e293b">
        Rider App
      </text>
      <foreignObject x="100" y="90" width="20" height="20">
        <div className="flex items-center justify-center w-full h-full">
          <Smartphone className="w-5 h-5 text-green-500" />
        </div>
      </foreignObject>

      <rect
        x="80"
        y="130"
        width="100"
        height="60"
        rx="5"
        fill="#dcfce7"
        stroke="#10b981"
        strokeWidth="2"
      />
      <text x="130" y="150" textAnchor="middle" fontSize="12" fill="#1e293b">
        Driver App
      </text>
      <foreignObject x="100" y="160" width="20" height="20">
        <div className="flex items-center justify-center w-full h-full">
          <Smartphone className="w-5 h-5 text-green-500" />
        </div>
      </foreignObject>

      {/* API Gateway */}
      <rect
        x="220"
        y="100"
        width="120"
        height="50"
        rx="5"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <text x="280" y="130" textAnchor="middle" fontSize="12" fill="#1e293b">
        API Gateway
      </text>

      {/* Core Services */}
      <rect
        x="380"
        y="60"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="430" y="85" textAnchor="middle" fontSize="10" fill="#1e293b">
        Trip Service
      </text>

      <rect
        x="380"
        y="110"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="430" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        User Service
      </text>

      <rect
        x="380"
        y="160"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="430" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        Driver Service
      </text>

      <rect
        x="380"
        y="210"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="430" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Payment Service
      </text>

      {/* Geospatial Services */}
      <rect
        x="520"
        y="85"
        width="100"
        height="40"
        rx="5"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <text x="570" y="110" textAnchor="middle" fontSize="10" fill="#1e293b">
        Geospatial DB
      </text>

      <rect
        x="520"
        y="135"
        width="100"
        height="40"
        rx="5"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <text x="570" y="160" textAnchor="middle" fontSize="10" fill="#1e293b">
        Dispatch Engine
      </text>

      <rect
        x="520"
        y="185"
        width="100"
        height="40"
        rx="5"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <text x="570" y="210" textAnchor="middle" fontSize="10" fill="#1e293b">
        Routing Engine
      </text>

      {/* Kafka */}
      <rect
        x="380"
        y="20"
        width="240"
        height="30"
        rx="5"
        fill="#ede9fe"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="500" y="40" textAnchor="middle" fontSize="12" fill="#1e293b">
        Kafka Event Stream
      </text>

      {/* Connections */}
      <path d="M 180 90 L 220 120" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 180 160 L 220 130" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 340 125 L 380 80" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 340 125 L 380 130" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 340 125 L 380 180" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 340 125 L 380 230" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 480 80 L 520 105" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 480 130 L 520 155" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 480 180 L 520 205" stroke="#94a3b8" strokeWidth="1" />

      {/* Kafka Connections */}
      <path
        d="M 430 60 L 430 50"
        stroke="#8b5cf6"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <path
        d="M 570 85 L 570 50"
        stroke="#8b5cf6"
        strokeWidth="1"
        strokeDasharray="3,3"
      />

      {/* Legend */}
      <rect
        x="650"
        y="60"
        width="80"
        height="15"
        rx="2"
        fill="#dcfce7"
        stroke="#10b981"
        strokeWidth="1"
      />
      <text x="690" y="71" textAnchor="middle" fontSize="8" fill="#1e293b">
        Mobile Apps
      </text>

      <rect
        x="650"
        y="85"
        width="80"
        height="15"
        rx="2"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="690" y="96" textAnchor="middle" fontSize="8" fill="#1e293b">
        API Gateway
      </text>

      <rect
        x="650"
        y="110"
        width="80"
        height="15"
        rx="2"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="1"
      />
      <text x="690" y="121" textAnchor="middle" fontSize="8" fill="#1e293b">
        Core Services
      </text>

      <rect
        x="650"
        y="135"
        width="80"
        height="15"
        rx="2"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="1"
      />
      <text x="690" y="146" textAnchor="middle" fontSize="8" fill="#1e293b">
        Geo Services
      </text>
    </svg>
  );
}
