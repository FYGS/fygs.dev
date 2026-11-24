"use client";



// Google Architecture Diagram Component
export function GoogleArchitectureDiagram() {
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
        Google Search & Data Infrastructure
      </text>

      {/* Frontend */}
      <rect
        x="80"
        y="70"
        width="140"
        height="50"
        rx="5"
        fill="#ecfccb"
        stroke="#84cc16"
        strokeWidth="2"
      />
      <text x="150" y="90" textAnchor="middle" fontSize="12" fill="#1e293b">
        Search Frontend
      </text>
      <text x="150" y="110" textAnchor="middle" fontSize="10" fill="#1e293b">
        Web & Mobile
      </text>

      {/* Data Processing */}
      <rect
        x="280"
        y="70"
        width="200"
        height="200"
        rx="5"
        fill="#dbeafe"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <text
        x="380"
        y="90"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Data Processing
      </text>

      <rect
        x="300"
        y="110"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="380" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        MapReduce
      </text>

      <rect
        x="300"
        y="160"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="380" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        BigTable
      </text>

      <rect
        x="300"
        y="210"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="380" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Spanner
      </text>

      {/* Search Infrastructure */}
      <rect
        x="520"
        y="70"
        width="200"
        height="200"
        rx="5"
        fill="#fef9c3"
        stroke="#eab308"
        strokeWidth="2"
      />
      <text
        x="620"
        y="90"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Search Infrastructure
      </text>

      <rect
        x="540"
        y="110"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#eab308"
        strokeWidth="1"
      />
      <text x="620" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        Web Crawler
      </text>

      <rect
        x="540"
        y="160"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#eab308"
        strokeWidth="1"
      />
      <text x="620" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        PageRank
      </text>

      <rect
        x="540"
        y="210"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#eab308"
        strokeWidth="1"
      />
      <text x="620" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Search Index
      </text>

      {/* Global Load Balancer */}
      <rect
        x="80"
        y="140"
        width="140"
        height="40"
        rx="5"
        fill="#f1f5f9"
        stroke="#64748b"
        strokeWidth="2"
      />
      <text x="150" y="165" textAnchor="middle" fontSize="12" fill="#1e293b">
        Global Load Balancer
      </text>

      {/* Borg Cluster Management */}
      <rect
        x="80"
        y="200"
        width="140"
        height="40"
        rx="5"
        fill="#f1f5f9"
        stroke="#64748b"
        strokeWidth="2"
      />
      <text x="150" y="225" textAnchor="middle" fontSize="10" fill="#1e293b">
        Borg Cluster Management
      </text>

      {/* Connections */}
      <path d="M 150 120 L 150 140" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 150 180 L 150 200" stroke="#94a3b8" strokeWidth="1" />

      <path
        d="M 220 160 L 280 160"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 480 160 L 520 160"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />

      <path d="M 380 150 L 380 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 380 200 L 380 210" stroke="#94a3b8" strokeWidth="1" />

      <path d="M 620 150 L 620 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 620 200 L 620 210" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
