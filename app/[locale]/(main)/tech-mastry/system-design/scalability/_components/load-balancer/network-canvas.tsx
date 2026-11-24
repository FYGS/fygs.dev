"use client";

import { Globe } from "lucide-react";
import type { Request, Server } from "./types";

interface NetworkCanvasProps {
  servers: Server[];
  requests: Request[];
  /** Time of the last animation frame, from which request positions are interpolated */
  now: number;
}

export function NetworkCanvas({ servers, requests, now }: NetworkCanvasProps) {
  return (
        <div className="relative w-full h-[400px] border border-indigo-500/20 rounded-xl bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <svg width="100%" height="100%" viewBox="0 0 800 400">
            {/* Load Balancer */}
            <g transform="translate(100, 200)">
              <defs>
                <linearGradient
                  id="lbGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop
                    offset="100%"
                    stopColor="#8b5cf6"
                    stopOpacity="0.2"
                  />
                </linearGradient>
                <filter
                  id="lbGlow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite
                    in="SourceGraphic"
                    in2="blur"
                    operator="over"
                  />
                </filter>
              </defs>
              <rect
                x="-50"
                y="-30"
                width="100"
                height="60"
                rx="12"
                fill="url(#lbGradient)"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                filter="url(#lbGlow)"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.5;0.8;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </rect>
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="600"
                fill="#6366f1"
              >
                Load Balancer
              </text>
              <circle cx="-30" cy="-15" r="3" fill="#6366f1" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="-20" cy="-15" r="3" fill="#6366f1" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                  begin="0.5s"
                />
              </circle>
              <circle cx="-10" cy="-15" r="3" fill="#6366f1" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                  begin="1s"
                />
              </circle>
            </g>

            {/* Servers */}
            {servers.map((server) => (
              <g
                key={server.id}
                transform={`translate(${server.position.x}, ${server.position.y})`}
              >
                <defs>
                  <filter
                    id={`serverGlow-${server.id}`}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite
                      in="SourceGraphic"
                      in2="blur"
                      operator="over"
                    />
                  </filter>
                  <linearGradient
                    id={`serverGradient-${server.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        server.status === "online"
                          ? "#10b981"
                          : server.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                      stopOpacity="0.2"
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        server.status === "online"
                          ? "#059669"
                          : server.status === "overloaded"
                          ? "#d97706"
                          : "#dc2626"
                      }
                      stopOpacity="0.2"
                    />
                  </linearGradient>
                </defs>
                <rect
                  x="-40"
                  y="-25"
                  width="80"
                  height="50"
                  rx="10"
                  fill={`url(#serverGradient-${server.id})`}
                  stroke={
                    server.status === "online"
                      ? "#10b981"
                      : server.status === "overloaded"
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  filter={
                    server.status === "offline"
                      ? "none"
                      : `url(#serverGlow-${server.id})`
                  }
                >
                  {server.status !== "offline" && (
                    <animate
                      attributeName="stroke-opacity"
                      values="0.6;0.9;0.6"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${server.id * 0.5}s`}
                    />
                  )}
                </rect>
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={
                    server.status === "online"
                      ? "#10b981"
                      : server.status === "overloaded"
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                >
                  Server {server.id}
                </text>
                <text
                  x="0"
                  y="15"
                  textAnchor="middle"
                  fontSize="10"
                  fill={
                    server.status === "online"
                      ? "#10b981"
                      : server.status === "overloaded"
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  opacity="0.8"
                >
                  Load: {server.load}
                </text>
              </g>
            ))}

            {/* Requests */}
            {requests.map((request) => {
              const targetServer = servers.find(
                (s) => s.id === request.targetServer
              );

              if (!targetServer) return null;

              // Calculate position along the path
              let x = 100;
              let y = 200;

              if (
                request.status === "processing" ||
                request.status === "completed" ||
                request.status === "failed"
              ) {
                const progress =
                  request.status === "processing"
                    ? Math.min(
                        (now - (request.processingTime || 0)) / 1000,
                        1
                      )
                    : 1;

                x = 100 + (targetServer.position.x - 100) * progress;
                y = 200 + (targetServer.position.y - 200) * progress;
              }

              return (
                <g key={request.id} transform={`translate(${x}, ${y})`}>
                  <defs>
                    <filter
                      id={`requestGlow-${request.id}`}
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <circle
                    r="7"
                    fill={
                      request.status === "pending"
                        ? "#3b82f6"
                        : request.status === "processing"
                        ? "#f59e0b"
                        : request.status === "completed"
                        ? "#10b981"
                        : "#ef4444"
                    }
                    opacity="0.2"
                    filter={`url(#requestGlow-${request.id})`}
                  >
                    <animate
                      attributeName="r"
                      values="7;9;7"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    r="5"
                    fill={
                      request.status === "pending"
                        ? "#3b82f6"
                        : request.status === "processing"
                        ? "#f59e0b"
                        : request.status === "completed"
                        ? "#10b981"
                        : "#ef4444"
                    }
                    stroke="white"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.8;1;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}

            {/* Client */}
            <g transform="translate(20, 200)">
              <defs>
                <linearGradient
                  id="clientGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop
                    offset="100%"
                    stopColor="#60a5fa"
                    stopOpacity="0.2"
                  />
                </linearGradient>
                <filter
                  id="clientGlow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite
                    in="SourceGraphic"
                    in2="blur"
                    operator="over"
                  />
                </filter>
              </defs>
              <circle
                r="22"
                fill="url(#clientGradient)"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                filter="url(#clientGlow)"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.5;0.8;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <foreignObject x="-12" y="-12" width="24" height="24">
                <Globe className="w-6 h-6 text-blue-500" />
              </foreignObject>
            </g>
          </svg>
        </div>
  );
}
