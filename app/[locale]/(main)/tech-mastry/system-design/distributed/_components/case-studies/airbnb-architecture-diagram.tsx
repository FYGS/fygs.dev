"use client";



// Airbnb Architecture Diagram Component
export function AirbnbArchitectureDiagram() {
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
        Airbnb Platform
      </text>

      {/* Frontend */}
      <rect
        x="80"
        y="60"
        width="140"
        height="60"
        rx="5"
        fill="#fce7f3"
        stroke="#ec4899"
        strokeWidth="2"
      />
      <text x="150" y="80" textAnchor="middle" fontSize="12" fill="#1e293b">
        React Frontend
      </text>
      <text x="150" y="100" textAnchor="middle" fontSize="10" fill="#1e293b">
        Web & Mobile
      </text>

      {/* API Layer */}
      <rect
        x="80"
        y="130"
        width="140"
        height="40"
        rx="5"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <text x="150" y="155" textAnchor="middle" fontSize="12" fill="#1e293b">
        API Gateway
      </text>

      {/* Services */}
      <rect
        x="80"
        y="180"
        width="65"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="112" y="205" textAnchor="middle" fontSize="10" fill="#1e293b">
        User Service
      </text>

      <rect
        x="155"
        y="180"
        width="65"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="187" y="205" textAnchor="middle" fontSize="10" fill="#1e293b">
        Booking Service
      </text>

      <rect
        x="80"
        y="230"
        width="65"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="112" y="255" textAnchor="middle" fontSize="10" fill="#1e293b">
        Payment Service
      </text>

      <rect
        x="155"
        y="230"
        width="65"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="187" y="255" textAnchor="middle" fontSize="10" fill="#1e293b">
        Messaging Service
      </text>

      {/* Search Engine */}
      <rect
        x="280"
        y="60"
        width="200"
        height="210"
        rx="5"
        fill="#ede9fe"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text
        x="380"
        y="80"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Search Engine
      </text>

      <rect
        x="300"
        y="100"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="1"
      />
      <text x="380" y="125" textAnchor="middle" fontSize="10" fill="#1e293b">
        Elasticsearch Cluster
      </text>

      <rect
        x="300"
        y="150"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="1"
      />
      <text x="380" y="175" textAnchor="middle" fontSize="10" fill="#1e293b">
        Search Ranking Service
      </text>

      <rect
        x="300"
        y="200"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="1"
      />
      <text x="380" y="225" textAnchor="middle" fontSize="10" fill="#1e293b">
        Recommendation Engine
      </text>

      {/* Data Platform */}
      <rect
        x="520"
        y="60"
        width="200"
        height="210"
        rx="5"
        fill="#dcfce7"
        stroke="#10b981"
        strokeWidth="2"
      />
      <text
        x="620"
        y="80"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        Data Platform
      </text>

      <rect
        x="540"
        y="100"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#10b981"
        strokeWidth="1"
      />
      <text x="620" y="125" textAnchor="middle" fontSize="10" fill="#1e293b">
        MySQL Database
      </text>

      <rect
        x="540"
        y="150"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#10b981"
        strokeWidth="1"
      />
      <text x="620" y="175" textAnchor="middle" fontSize="10" fill="#1e293b">
        Redis Cache
      </text>

      <rect
        x="540"
        y="200"
        width="160"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#10b981"
        strokeWidth="1"
      />
      <text x="620" y="225" textAnchor="middle" fontSize="10" fill="#1e293b">
        Apache Spark
      </text>

      {/* Connections */}
      <path d="M 150 120 L 150 130" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 150 170 L 150 180" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 112 220 L 112 230" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 187 220 L 187 230" stroke="#94a3b8" strokeWidth="1" />

      <path
        d="M 220 150 L 280 150"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 480 150 L 520 150"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path d="M 380 140 L 380 150" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 380 190 L 380 200" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 620 140 L 620 150" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 620 190 L 620 200" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
