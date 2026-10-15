"use client";



// Netflix Architecture Diagram Component
export function NetflixArchitectureDiagram() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 300"
      className="absolute inset-0"
    >
      {/* Cloud Platform (AWS) */}
      <rect
        x="50"
        y="20"
        width="700"
        height="260"
        rx="10"
        fill="#f1f5f9"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      <text
        x="400"
        y="40"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#64748b"
      >
        AWS Cloud
      </text>

      {/* Regions */}
      <rect
        x="80"
        y="60"
        width="200"
        height="200"
        rx="5"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="180" y="80" textAnchor="middle" fontSize="12" fill="#1e293b">
        US-East Region
      </text>

      <rect
        x="300"
        y="60"
        width="200"
        height="200"
        rx="5"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="400" y="80" textAnchor="middle" fontSize="12" fill="#1e293b">
        EU Region
      </text>

      <rect
        x="520"
        y="60"
        width="200"
        height="200"
        rx="5"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <text x="620" y="80" textAnchor="middle" fontSize="12" fill="#1e293b">
        Asia-Pacific Region
      </text>

      {/* Microservices in US-East */}
      <rect
        x="100"
        y="100"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="135" y="125" textAnchor="middle" fontSize="10" fill="#1e293b">
        API Gateway
      </text>

      <rect
        x="100"
        y="150"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="135" y="175" textAnchor="middle" fontSize="10" fill="#1e293b">
        User Service
      </text>

      <rect
        x="100"
        y="200"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="135" y="225" textAnchor="middle" fontSize="10" fill="#1e293b">
        Content Service
      </text>

      <rect
        x="190"
        y="100"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="225" y="125" textAnchor="middle" fontSize="10" fill="#1e293b">
        Cassandra DB
      </text>

      <rect
        x="190"
        y="150"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="225" y="175" textAnchor="middle" fontSize="10" fill="#1e293b">
        Hystrix
      </text>

      <rect
        x="190"
        y="200"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="225" y="225" textAnchor="middle" fontSize="10" fill="#1e293b">
        Eureka
      </text>

      {/* Microservices in EU */}
      <rect
        x="320"
        y="125"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="355" y="150" textAnchor="middle" fontSize="10" fill="#1e293b">
        API Gateway
      </text>

      <rect
        x="410"
        y="125"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="445" y="150" textAnchor="middle" fontSize="10" fill="#1e293b">
        Content Service
      </text>

      <rect
        x="365"
        y="185"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="400" y="210" textAnchor="middle" fontSize="10" fill="#1e293b">
        Cassandra DB
      </text>

      {/* Microservices in Asia-Pacific */}
      <rect
        x="540"
        y="125"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="575" y="150" textAnchor="middle" fontSize="10" fill="#1e293b">
        API Gateway
      </text>

      <rect
        x="630"
        y="125"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <text x="665" y="150" textAnchor="middle" fontSize="10" fill="#1e293b">
        Content Service
      </text>

      <rect
        x="585"
        y="185"
        width="70"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="620" y="210" textAnchor="middle" fontSize="10" fill="#1e293b">
        Cassandra DB
      </text>

      {/* CDN */}
      <ellipse
        cx="400"
        cy="20"
        rx="60"
        ry="15"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <text x="400" y="25" textAnchor="middle" fontSize="10" fill="#1e293b">
        Global CDN
      </text>

      {/* Connections */}
      <path
        d="M 400 35 L 400 60"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <path d="M 180 100 L 225 100" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 180 150 L 225 150" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 180 200 L 225 200" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 135 140 L 135 150" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 135 190 L 135 200" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 390 125 L 410 125" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 390 165 L 390 185" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 610 125 L 630 125" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 610 165 L 610 185" stroke="#94a3b8" strokeWidth="1" />

      {/* Region Connections */}
      <path
        d="M 280 160 L 300 160"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      <path
        d="M 500 160 L 520 160"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    </svg>
  );
}
