"use client";



// Microsoft Architecture Diagram Component
export function MicrosoftArchitectureDiagram() {
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
        Microsoft Azure Cloud Platform
      </text>

      {/* Azure Regions */}
      <rect
        x="80"
        y="70"
        width="180"
        height="200"
        rx="5"
        fill="#e0f2fe"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
      <text
        x="170"
        y="90"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Primary Region
      </text>

      <rect
        x="300"
        y="70"
        width="180"
        height="200"
        rx="5"
        fill="#e0f2fe"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
      <text
        x="390"
        y="90"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Secondary Region
      </text>

      <rect
        x="520"
        y="70"
        width="180"
        height="200"
        rx="5"
        fill="#e0f2fe"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
      <text
        x="610"
        y="90"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Global Services
      </text>

      {/* Primary Region Services */}
      <rect
        x="100"
        y="110"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="170" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        Azure Kubernetes Service
      </text>

      <rect
        x="100"
        y="160"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="170" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        Cosmos DB
      </text>

      <rect
        x="100"
        y="210"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="170" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Event Hub
      </text>

      {/* Secondary Region Services */}
      <rect
        x="320"
        y="110"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="390" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        Azure Kubernetes Service
      </text>

      <rect
        x="320"
        y="160"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="390" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        Cosmos DB Replica
      </text>

      <rect
        x="320"
        y="210"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="390" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Event Hub Replica
      </text>

      {/* Global Services */}
      <rect
        x="540"
        y="110"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="610" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        Azure Front Door
      </text>

      <rect
        x="540"
        y="160"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="610" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        Azure CDN
      </text>

      <rect
        x="540"
        y="210"
        width="140"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#0ea5e9"
        strokeWidth="1"
      />
      <text x="610" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Azure Active Directory
      </text>

      {/* Connections */}
      <path
        d="M 260 160 L 300 160"
        stroke="#0ea5e9"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 480 160 L 520 160"
        stroke="#0ea5e9"
        strokeWidth="1"
        strokeDasharray="5,5"
      />

      <path d="M 170 150 L 170 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 170 200 L 170 210" stroke="#94a3b8" strokeWidth="1" />

      <path d="M 390 150 L 390 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 390 200 L 390 210" stroke="#94a3b8" strokeWidth="1" />

      <path d="M 610 150 L 610 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 610 200 L 610 210" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
