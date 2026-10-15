
"use client";

import type { Request, CacheState } from "./types";
import { CACHE_CHECK_TIME, DB_QUERY_TIME } from "./constants";



export function CachingCanvas({ cache, requests }: {
  cache: CacheState;
  requests: Request[];
}) {
  return (
    <div className="relative w-full h-[400px] border border-indigo-500/20 rounded-xl bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        {/* Client */}
        <g transform="translate(100, 200)">
          <defs>
            <linearGradient
              id="clientGradient"
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
              id="clientGlow"
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
            x="-60"
            y="-30"
            width="120"
            height="60"
            rx="10"
            fill="url(#clientGradient)"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            filter="url(#clientGlow)"
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="500"
            fill="#6366f1"
          >
            Client
          </text>
        </g>

        {/* Cache */}
        <g transform="translate(300, 100)">
          <defs>
            <linearGradient
              id="cacheGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={cache.enabled ? "#6366f1" : "#64748b"}
                stopOpacity="0.1"
              />
              <stop
                offset="100%"
                stopColor={cache.enabled ? "#8b5cf6" : "#94a3b8"}
                stopOpacity="0.1"
              />
            </linearGradient>
            <filter
              id="cacheGlow"
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
          <rect
            x="-80"
            y="-60"
            width="160"
            height="120"
            rx="12"
            fill="url(#cacheGradient)"
            stroke={cache.enabled ? "#6366f1" : "#64748b"}
            strokeWidth="1.5"
            strokeOpacity="0.5"
            strokeDasharray={cache.enabled ? "none" : "5,5"}
            filter={cache.enabled ? "url(#cacheGlow)" : "none"}
          />
          <text
            x="0"
            y="-40"
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill={cache.enabled ? "#6366f1" : "#64748b"}
          >
            Cache ({cache.strategy.toUpperCase()})
          </text>

          {/* Cache Items */}
          <g transform="translate(0, 0)">
            {cache.items.map((item, index) => {
              const itemsPerRow = 3;
              const row = Math.floor(index / itemsPerRow);
              const col = index % itemsPerRow;
              const x = (col - 1) * 50;
              const y = row * 30;

              return (
                <g key={item.id} transform={`translate(${x}, ${y})`}>
                  <rect
                    x="-20"
                    y="-10"
                    width="40"
                    height="20"
                    rx="5"
                    fill={item.color}
                    opacity="0.8"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.8;1;0.8"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${index * 0.5}s`}
                    />
                  </rect>
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="white"
                  >
                    {item.key.length > 6
                      ? `${item.key.substring(0, 6)}...`
                      : item.key}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* Database */}
        <g transform="translate(500, 200)">
          <defs>
            <linearGradient
              id="dbGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.1" />
              <stop
                offset="100%"
                stopColor="#0d9488"
                stopOpacity="0.1"
              />
            </linearGradient>
            <filter
              id="dbGlow"
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
          <rect
            x="-60"
            y="-40"
            width="120"
            height="80"
            rx="12"
            fill="url(#dbGradient)"
            stroke="#14b8a6"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            filter="url(#dbGlow)"
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="600"
            fill="#14b8a6"
          >
            Database
          </text>
          <circle cx="-40" cy="-20" r="3" fill="#14b8a6" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="-30" cy="-20" r="3" fill="#14b8a6" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="4s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          </circle>
          <circle cx="-20" cy="-20" r="3" fill="#14b8a6" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="4s"
              repeatCount="indefinite"
              begin="1s"
            />
          </circle>
        </g>

        {/* Paths */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6366f1"
              opacity="0.5"
            />
          </marker>
          <marker
            id="arrowhead-disabled"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#64748b"
              opacity="0.5"
            />
          </marker>
        </defs>
        <path
          d="M 160,200 L 220,100"
          stroke={cache.enabled ? "#6366f1" : "#64748b"}
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeDasharray={cache.enabled ? "none" : "5,5"}
          fill="none"
          markerEnd={
            cache.enabled
              ? "url(#arrowhead)"
              : "url(#arrowhead-disabled)"
          }
        >
          {cache.enabled && (
            <animate
              attributeName="stroke-opacity"
              values="0.5;0.8;0.5"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path
          d="M 160,200 L 440,200"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          fill="none"
          markerEnd="url(#arrowhead)"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.5;0.8;0.5"
            dur="3s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </path>
        <path
          d="M 380,100 L 440,200"
          stroke={cache.enabled ? "#6366f1" : "#64748b"}
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeDasharray={cache.enabled ? "none" : "5,5"}
          fill="none"
          markerEnd={
            cache.enabled
              ? "url(#arrowhead)"
              : "url(#arrowhead-disabled)"
          }
        >
          {cache.enabled && (
            <animate
              attributeName="stroke-opacity"
              values="0.5;0.8;0.5"
              dur="3s"
              repeatCount="indefinite"
              begin="1s"
            />
          )}
        </path>

        {/* Requests */}
        {requests.map((request) => {
          let x = 100;
          let y = 200;

          // Calculate position based on status
          if (request.status === "cache-check") {
            const progress = Math.min(
              (Date.now() - request.startTime) / CACHE_CHECK_TIME,
              1
            );
            x = 100 + (300 - 100) * progress;
            y = 200 + (100 - 200) * progress;
          } else if (request.status === "cache-hit") {
            const timeInStatus =
              Date.now() - (request.completionTime || 0);
            const returnProgress = Math.min(timeInStatus / 500, 1);
            x = 300 - (300 - 100) * returnProgress;
            y = 100 - (100 - 200) * returnProgress;
          } else if (request.status === "cache-miss") {
            const progress = Math.min(
              (Date.now() - (request.dbQueryTime || 0)) / DB_QUERY_TIME,
              1
            );
            x = 300 + (500 - 300) * progress;
            y = 100 + (200 - 100) * progress;
          } else if (request.status === "completed") {
            const timeInStatus =
              Date.now() - (request.completionTime || 0);
            const returnProgress = Math.min(timeInStatus / 500, 1);
            x = 500 - (500 - 100) * returnProgress;
            y = 200;
          }

          return (
            <g key={request.id} transform={`translate(${x}, ${y})`}>
              <defs>
                <filter
                  id={`glow-${request.id}`}
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
                r="8"
                fill={request.color}
                opacity="0.2"
                filter={`url(#glow-${request.id})`}
              >
                <animate
                  attributeName="r"
                  values="8;10;8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                r="6"
                fill={request.color}
                opacity={
                  request.status === "completed" ||
                  request.status === "cache-hit"
                    ? 0.6
                    : 0.9
                }
                stroke="white"
                strokeWidth="1"
                strokeOpacity="0.3"
              >
                <animate
                  attributeName="opacity"
                  values={
                    request.status === "completed" ||
                    request.status === "cache-hit"
                      ? "0.6;0.8;0.6"
                      : "0.9;1;0.9"
                  }
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x="0"
                y="-12"
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill={
                  request.status === "cache-hit"
                    ? "#10b981"
                    : request.status === "cache-miss"
                    ? "#f59e0b"
                    : "#3b82f6"
                }
                stroke="white"
                strokeWidth="0.3"
                strokeOpacity="0.5"
                paintOrder="stroke"
              >
                {request.key.length > 6
                  ? `${request.key.substring(0, 6)}...`
                  : request.key}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(700, 350)">
          <defs>
            <linearGradient
              id="legendGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.8" />
              <stop
                offset="100%"
                stopColor="#f1f5f9"
                stopOpacity="0.8"
              />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="-65"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            fill="#6366f1"
          >
            Légende
          </text>
          <rect
            x="-45"
            y="-55"
            width="90"
            height="70"
            rx="8"
            fill="url(#legendGradient)"
            stroke="#6366f1"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          <circle
            cx="-30"
            cy="-35"
            r="5"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />
          <text
            x="-18"
            y="-32"
            fontSize="9"
            fontWeight="500"
            textAnchor="start"
            fill="#3b82f6"
          >
            Requête
          </text>

          <circle
            cx="-30"
            cy="-15"
            r="5"
            fill="#10b981"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />
          <text
            x="-18"
            y="-12"
            fontSize="9"
            fontWeight="500"
            textAnchor="start"
            fill="#10b981"
          >
            Cache Hit
          </text>

          <circle
            cx="-30"
            cy="5"
            r="5"
            fill="#f59e0b"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />
          <text
            x="-18"
            y="8"
            fontSize="9"
            fontWeight="500"
            textAnchor="start"
            fill="#f59e0b"
          >
            Cache Miss
          </text>
        </g>
      </svg>
    </div>
  );
}
