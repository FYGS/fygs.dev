"use client";

import { Cloud, ShoppingCart } from "lucide-react";

// Amazon Architecture Diagram Component
export function AmazonArchitectureDiagram() {
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
        Amazon Platform
      </text>

      {/* E-commerce Frontend */}
      <rect
        x="80"
        y="70"
        width="140"
        height="60"
        rx="5"
        fill="#ffedd5"
        stroke="#f97316"
        strokeWidth="2"
      />
      <text x="150" y="90" textAnchor="middle" fontSize="12" fill="#1e293b">
        E-commerce Frontend
      </text>
      <foreignObject x="110" y="100" width="20" height="20">
        <div className="flex items-center justify-center w-full h-full">
          <ShoppingCart className="w-5 h-5 text-orange-500" />
        </div>
      </foreignObject>
      <text x="150" y="115" textAnchor="middle" fontSize="10" fill="#1e293b">
        Web & Mobile
      </text>

      {/* API Gateway */}
      <rect
        x="80"
        y="150"
        width="140"
        height="40"
        rx="5"
        fill="#e0f2fe"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <text x="150" y="175" textAnchor="middle" fontSize="12" fill="#1e293b">
        API Gateway
      </text>

      {/* Core Services */}
      <rect
        x="80"
        y="210"
        width="65"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="112" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Order Service
      </text>

      <rect
        x="155"
        y="210"
        width="65"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <text x="187" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Catalog Service
      </text>

      {/* AWS Cloud */}
      <rect
        x="280"
        y="70"
        width="440"
        height="200"
        rx="5"
        fill="#f0fdfa"
        stroke="#14b8a6"
        strokeWidth="2"
      />
      <text
        x="500"
        y="90"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e293b"
      >
        AWS Cloud Infrastructure
      </text>
      <foreignObject x="460" y="70" width="20" height="20">
        <div className="flex items-center justify-center w-full h-full">
          <Cloud className="w-5 h-5 text-teal-500" />
        </div>
      </foreignObject>

      {/* AWS Services */}
      <rect
        x="300"
        y="110"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        EC2 Instances
      </text>

      <rect
        x="300"
        y="160"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="350" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        ECS Containers
      </text>

      <rect
        x="300"
        y="210"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="350" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        Lambda Functions
      </text>

      <rect
        x="420"
        y="110"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="470" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        DynamoDB
      </text>

      <rect
        x="420"
        y="160"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="470" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        S3 Storage
      </text>

      <rect
        x="420"
        y="210"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="470" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        RDS Databases
      </text>

      <rect
        x="540"
        y="110"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="590" y="135" textAnchor="middle" fontSize="10" fill="#1e293b">
        SQS Queues
      </text>

      <rect
        x="540"
        y="160"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="590" y="185" textAnchor="middle" fontSize="10" fill="#1e293b">
        CloudFront CDN
      </text>

      <rect
        x="540"
        y="210"
        width="100"
        height="40"
        rx="5"
        fill="#f8fafc"
        stroke="#14b8a6"
        strokeWidth="1"
      />
      <text x="590" y="235" textAnchor="middle" fontSize="10" fill="#1e293b">
        ElasticSearch
      </text>

      {/* Connections */}
      <path d="M 150 130 L 150 150" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 150 190 L 150 210" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 112 210 L 112 190" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 187 210 L 187 190" stroke="#94a3b8" strokeWidth="1" />

      <path
        d="M 220 150 L 280 150"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path d="M 350 150 L 350 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 350 200 L 350 210" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 470 150 L 470 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 470 200 L 470 210" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 590 150 L 590 160" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 590 200 L 590 210" stroke="#94a3b8" strokeWidth="1" />

      <path d="M 400 130 L 420 130" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 400 180 L 420 180" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 400 230 L 420 230" stroke="#94a3b8" strokeWidth="1" />

      <path d="M 520 130 L 540 130" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 520 180 L 540 180" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 520 230 L 540 230" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
