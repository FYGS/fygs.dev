"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Building,
  Cloud,
  Code,
  Database,
  Globe,
  HardDrive,
  Layers,
  Server,
  Share2,
  ShoppingCart,
  Smartphone,
  Users,
} from "lucide-react";
import { useState } from "react";

// Netflix Architecture Diagram Component
function NetflixArchitectureDiagram() {
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

// Uber Architecture Diagram Component
function UberArchitectureDiagram() {
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

// Amazon Architecture Diagram Component
function AmazonArchitectureDiagram() {
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

// Microsoft Architecture Diagram Component
function MicrosoftArchitectureDiagram() {
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

// Google Architecture Diagram Component
function GoogleArchitectureDiagram() {
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

// Airbnb Architecture Diagram Component
function AirbnbArchitectureDiagram() {
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

// Types for the case studies
interface CaseStudy {
  id: string;
  company: string;
  title: string;
  description: string;
  challenge: string;
  solution: string;
  architecture: string;
  technologies: string[];
  results: string;
  lessons: string[];
  icon: React.JSX.Element;
}

export function DistributedCaseStudies() {
  const [activeTab, setActiveTab] = useState("amazon");

  // Case studies data
  const caseStudies: CaseStudy[] = [
    {
      id: "amazon",
      company: "Amazon",
      title: "E-commerce à Grande Échelle",
      description:
        "Comment Amazon a construit une architecture distribuée pour gérer des millions de transactions commerciales et son infrastructure cloud AWS.",
      challenge:
        "Amazon devait créer une plateforme capable de gérer des pics de trafic massifs (comme le Black Friday), de traiter des millions de transactions simultanées, et de fournir des recommandations personnalisées en temps réel, tout en maintenant une haute disponibilité.",
      solution:
        "Amazon a développé une architecture orientée services (SOA) hautement distribuée, avec une infrastructure cloud élastique, des bases de données NoSQL pour la scalabilité horizontale, et des systèmes de mise en cache sophistiqués.",
      architecture:
        "L'architecture d'Amazon est basée sur le principe 'two-pizza teams' où chaque équipe gère ses propres services indépendants. Ils utilisent une combinaison de services AWS (EC2, S3, DynamoDB, etc.) avec des systèmes de file d'attente pour la communication asynchrone et des CDN pour la distribution de contenu.",
      technologies: [
        "AWS Cloud",
        "DynamoDB",
        "S3",
        "EC2",
        "Lambda",
        "SQS/SNS",
        "CloudFront",
        "ElasticSearch",
      ],
      results:
        "Amazon peut désormais traiter plus de 300 millions de commandes par jour lors des périodes de pointe, avec une disponibilité de 99,99% et des recommandations personnalisées qui augmentent significativement les ventes croisées.",
      lessons: [
        "Concevoir pour l'élasticité et la scalabilité horizontale",
        "Utiliser des bases de données NoSQL pour les charges de travail à grande échelle",
        "Implémenter des architectures sans état (stateless) pour faciliter la mise à l'échelle",
        "Adopter des systèmes de mise en cache à plusieurs niveaux",
        "Utiliser des files d'attente pour découpler les services et absorber les pics de charge",
      ],
      icon: <ShoppingCart className="h-5 w-5 text-orange-500" />,
    },
    {
      id: "netflix",
      company: "Netflix",
      title: "Scaling Video Streaming",
      description:
        "Comment Netflix a construit une architecture distribuée pour servir des millions d'utilisateurs simultanément.",
      challenge:
        "Netflix devait diffuser des vidéos à des millions d'utilisateurs dans le monde entier avec une faible latence, une haute disponibilité et une grande résilience face aux pannes.",
      solution:
        "Netflix a adopté une architecture de microservices entièrement hébergée dans le cloud AWS, avec un système de distribution de contenu (CDN) global et des mécanismes de résilience avancés.",
      architecture:
        "L'architecture de Netflix est composée de centaines de microservices indépendants qui communiquent via des API REST et des systèmes de messagerie asynchrone. Ils utilisent un modèle de déploiement multi-régions avec réplication des données.",
      technologies: [
        "AWS Cloud",
        "Microservices",
        "Cassandra",
        "Hystrix",
        "Eureka",
        "Zuul",
        "Chaos Monkey",
      ],
      results:
        "Netflix peut désormais servir plus de 200 millions d'abonnés dans 190 pays, avec une disponibilité de 99,99% et une expérience utilisateur fluide même pendant les pics d'utilisation.",
      lessons: [
        "Adopter une architecture de microservices pour une scalabilité indépendante",
        "Concevoir pour les pannes avec des disjoncteurs et l'ingénierie du chaos",
        "Utiliser des bases de données distribuées pour la résilience des données",
        "Automatiser le déploiement et les tests pour des mises à jour fréquentes",
        "Optimiser la distribution de contenu via un CDN global",
      ],
      icon: <Globe className="h-5 w-5 text-red-500" />,
    },
    {
      id: "google",
      company: "Google",
      title: "Moteur de Recherche et Traitement de Données Massives",
      description:
        "Comment Google a construit une architecture distribuée pour indexer le web et traiter des pétaoctets de données.",
      challenge:
        "Google devait indexer des milliards de pages web, traiter des requêtes de recherche en millisecondes, analyser des pétaoctets de données, et maintenir une infrastructure mondiale hautement disponible et économique.",
      solution:
        "Google a développé des technologies distribuées propriétaires comme MapReduce, BigTable, et Spanner, ainsi qu'un système de gestion de cluster appelé Borg pour orchestrer des millions de tâches sur des centaines de milliers de machines.",
      architecture:
        "L'architecture de Google est basée sur des clusters massifs de serveurs commodity hardware, avec des systèmes de stockage distribués (GFS, BigTable, Spanner), des frameworks de traitement de données (MapReduce, Flume), et des technologies d'indexation et de classement propriétaires (PageRank).",
      technologies: [
        "MapReduce",
        "BigTable",
        "Spanner",
        "Borg",
        "GFS",
        "Protocol Buffers",
        "PageRank",
        "TensorFlow",
      ],
      results:
        "Google peut désormais traiter plus de 8,5 milliards de requêtes de recherche par jour avec des temps de réponse inférieurs à 200ms, tout en indexant des centaines de milliards de pages web et en analysant des exaoctets de données.",
      lessons: [
        "Concevoir des systèmes distribués pour une échelle massive",
        "Utiliser des modèles de programmation simplifiés pour le traitement parallèle (MapReduce)",
        "Optimiser pour la latence et la disponibilité mondiale",
        "Développer des systèmes de stockage spécialisés pour différents cas d'usage",
        "Automatiser la gestion de l'infrastructure à grande échelle",
      ],
      icon: <Globe className="h-5 w-5 text-green-500" />,
    },
    {
      id: "uber",
      company: "Uber",
      title: "Système de Géolocalisation en Temps Réel",
      description:
        "Comment Uber a construit un système distribué pour gérer des millions de requêtes de localisation en temps réel.",
      challenge:
        "Uber devait créer un système capable de traiter des millions de mises à jour de localisation par seconde, de mettre en relation les chauffeurs et les passagers, et de calculer des itinéraires optimaux en temps réel.",
      solution:
        "Uber a développé une architecture distribuée géographiquement avec des systèmes de géolocalisation spécialisés, des bases de données géospatiales et un traitement d'événements en temps réel.",
      architecture:
        "L'architecture d'Uber utilise un modèle de sharding géographique, où les données sont partitionnées par région. Ils utilisent un système de messagerie pour le traitement des événements en temps réel et des bases de données optimisées pour les requêtes géospatiales.",
      technologies: [
        "Kafka",
        "Cassandra",
        "Redis",
        "PostgreSQL/PostGIS",
        "Elasticsearch",
        "Go",
        "Node.js",
      ],
      results:
        "Uber peut désormais traiter plus de 100 millions de requêtes de géolocalisation par jour avec une latence inférieure à 100 ms, permettant une mise en relation rapide entre chauffeurs et passagers.",
      lessons: [
        "Partitionner les données géographiquement pour réduire la latence",
        "Utiliser des bases de données spécialisées pour les requêtes géospatiales",
        "Implémenter un traitement d'événements en temps réel pour les mises à jour de localisation",
        "Concevoir des systèmes de secours pour la haute disponibilité",
        "Optimiser les algorithmes de mise en relation pour l'efficacité",
      ],
      icon: <Share2 className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "microsoft",
      company: "Microsoft",
      title: "Applications Cloud-Native sur Azure",
      description:
        "Comment Microsoft a construit une architecture distribuée multi-régions pour ses services cloud Azure.",
      challenge:
        "Microsoft devait créer une plateforme cloud capable de fournir des services à haute disponibilité dans le monde entier, avec une résilience aux pannes régionales, une latence minimale, et une conformité aux réglementations locales sur les données.",
      solution:
        "Microsoft a développé Azure comme une plateforme cloud multi-régions avec des services de réplication de données, des mécanismes de basculement automatique, et une architecture de microservices basée sur Kubernetes.",
      architecture:
        "L'architecture d'Azure est organisée en régions géographiquement distribuées, chacune contenant plusieurs zones de disponibilité. Les services sont conçus pour la résilience avec des bases de données géo-répliquées (Cosmos DB), des systèmes de messagerie (Event Hub), et des services de calcul élastiques (AKS).",
      technologies: [
        "Azure Kubernetes Service",
        "Cosmos DB",
        "Event Hub",
        "Azure Front Door",
        "Azure CDN",
        "Azure Active Directory",
        ".NET Core",
        "Service Fabric",
      ],
      results:
        "Microsoft Azure peut désormais offrir un SLA de 99,99% pour la plupart de ses services, avec une présence dans plus de 60 régions et une capacité à traiter des milliards de requêtes par jour.",
      lessons: [
        "Concevoir pour la résilience multi-régions dès le départ",
        "Utiliser des bases de données géo-répliquées pour la continuité des activités",
        "Implémenter des mécanismes de basculement automatique",
        "Adopter des architectures de microservices pour l'isolation des défaillances",
        "Optimiser la distribution du contenu pour réduire la latence mondiale",
      ],
      icon: <Cloud className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "airbnb",
      company: "Airbnb",
      title: "Moteur de Recherche et de Recommandation",
      description:
        "Comment Airbnb a construit un système de recherche et de recommandation distribué pour des millions de logements.",
      challenge:
        "Airbnb devait créer un moteur de recherche capable de filtrer et de classer des millions de logements selon de nombreux critères, tout en offrant des recommandations personnalisées et une expérience utilisateur réactive.",
      solution:
        "Airbnb a développé un système de recherche distribué basé sur Elasticsearch, combiné à des algorithmes d'apprentissage automatique pour les recommandations et un système de mise en cache sophistiqué.",
      architecture:
        "L'architecture de recherche d'Airbnb utilise un cluster Elasticsearch pour l'indexation et la recherche, avec des services de recommandation basés sur l'apprentissage automatique. Ils utilisent un système de cache à plusieurs niveaux et des services de métadonnées pour enrichir les résultats.",
      technologies: [
        "Elasticsearch",
        "Apache Spark",
        "Kafka",
        "Redis",
        "MySQL",
        "React",
        "Ruby on Rails",
      ],
      results:
        "Airbnb peut désormais traiter des requêtes de recherche complexes sur plus de 7 millions de logements en moins de 200 ms, avec des recommandations personnalisées qui augmentent significativement les taux de conversion.",
      lessons: [
        "Optimiser les index de recherche pour des requêtes complexes",
        "Utiliser l'apprentissage automatique pour améliorer la pertinence des résultats",
        "Implémenter un système de cache à plusieurs niveaux pour réduire la latence",
        "Concevoir une architecture évolutive pour gérer la croissance du catalogue",
        "Équilibrer la personnalisation et la performance",
      ],
      icon: <Building className="h-5 w-5 text-pink-500" />,
    },
  ];

  // Get the active case study
  const activeCaseStudy =
    caseStudies.find((study) => study.id === activeTab) || caseStudies[0];

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Études de Cas: Architectures Distribuées
        </CardTitle>
        <CardDescription>
          Découvrez comment des entreprises de premier plan ont résolu des défis
          d&apos;architecture distribuée à grande échelle
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            {caseStudies.map((study) => (
              <TabsTrigger
                key={study.id}
                value={study.id}
                className="flex items-center gap-2"
              >
                {study.icon}
                {study.company}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCaseStudy.id} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {activeCaseStudy.title}
                </h3>
                <Badge variant="outline" className="text-sm font-medium">
                  {activeCaseStudy.company}
                </Badge>
              </div>

              <p className="text-muted-foreground">
                {activeCaseStudy.description}
              </p>

              {/* Architecture Diagram */}
              <div className="relative w-full h-[300px] border rounded-lg bg-background/50 overflow-hidden my-6">
                {activeTab === "amazon" && <AmazonArchitectureDiagram />}
                {activeTab === "netflix" && <NetflixArchitectureDiagram />}
                {activeTab === "google" && <GoogleArchitectureDiagram />}
                {activeTab === "uber" && <UberArchitectureDiagram />}
                {activeTab === "microsoft" && <MicrosoftArchitectureDiagram />}
                {activeTab === "airbnb" && <AirbnbArchitectureDiagram />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      Défi
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.challenge}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      Solution
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      Architecture
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.architecture}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeCaseStudy.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Résultats
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.results}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Leçons Apprises
                    </h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                      {activeCaseStudy.lessons.map((lesson, index) => (
                        <li key={index}>{lesson}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
