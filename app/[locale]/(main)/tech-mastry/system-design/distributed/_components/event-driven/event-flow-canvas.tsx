"use client";

import type { ReactElement } from "react";
import { Bell, CreditCard, Package, ShoppingCart, Truck } from "lucide-react";
import type { ServiceType, Event, Service, BrokerType, EventBroker, Stats } from "./types";

export function EventFlowCanvas({ eventBroker, events, getBrokerColor, getBrokerName, getServiceByType, renderBrokerIcon, services, stats }: {
  eventBroker: EventBroker;
  events: Event[];
  getBrokerColor: (type: BrokerType) => string;
  getBrokerName: (type: BrokerType) => string;
  getServiceByType: (type: ServiceType, services: Service[]) => Service | undefined;
  renderBrokerIcon: (type: BrokerType) => ReactElement;
  services: Service[];
  stats: Stats;
}) {
  return (
    <div className="relative w-full h-[500px] border rounded-lg bg-background/50 overflow-auto">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        className="absolute inset-0"
      >
        {/* Producer Services (Left side) */}
        {services.slice(0, 3).map((service) => (
          <g
            key={service.type}
            transform={`translate(${service.position.x}, ${service.position.y})`}
          >
            <rect
              x="-70"
              y="-40"
              width="140"
              height="80"
              rx="5"
              fill={
                service.status === "online"
                  ? "#f1f5f9"
                  : service.status === "overloaded"
                  ? "#fef3c7"
                  : "#fee2e2"
              }
              stroke={
                service.status === "online"
                  ? "#94a3b8"
                  : service.status === "overloaded"
                  ? "#f59e0b"
                  : "#ef4444"
              }
              strokeWidth="2"
            />
            <foreignObject x="-20" y="-35" width="40" height="40">
              <div className="flex items-center justify-center w-full h-full">
                {service.type === "order" && (
                  <ShoppingCart className="w-7 h-7 text-blue-500" />
                )}
                {service.type === "payment" && (
                  <CreditCard className="w-7 h-7 text-amber-500" />
                )}
                {service.type === "inventory" && (
                  <Package className="w-7 h-7 text-purple-500" />
                )}
              </div>
            </foreignObject>
            <rect
              x="-65"
              y="10"
              width="130"
              height="20"
              rx="3"
              fill="#f8fafc"
              stroke="none"
            />
            <text
              x="0"
              y="24"
              textAnchor="middle"
              fontSize="12"
              fill="#1e293b"
            >
              Service{" "}
              {service.type.charAt(0).toUpperCase() +
                service.type.slice(1)}
            </text>
            <rect
              x="-40"
              y="-15"
              width="80"
              height="15"
              rx="3"
              fill="#f8fafc"
              stroke="none"
            />
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fontSize="10"
              fill={
                service.status === "online"
                  ? "#1e293b"
                  : service.status === "overloaded"
                  ? "#f59e0b"
                  : "#ef4444"
              }
            >
              {service.status === "online"
                ? `Événements: ${service.events}`
                : service.status === "overloaded"
                ? "Surcharge"
                : "Hors ligne"}
            </text>
          </g>
        ))}

        {/* Event Broker (Center) */}
        <g
          transform={`translate(${eventBroker.position.x}, ${eventBroker.position.y})`}
        >
          {/* Broker background */}
          <rect
            x="-90"
            y="-70"
            width="180"
            height="140"
            rx="5"
            fill="#f1f5f9"
            stroke={getBrokerColor(eventBroker.type)}
            strokeWidth="2"
          />

          {/* Broker icon */}
          <foreignObject x="-25" y="-65" width="50" height="50">
            <div className="flex items-center justify-center w-full h-full">
              {renderBrokerIcon(eventBroker.type)}
            </div>
          </foreignObject>

          {/* Broker title */}
          <rect
            x="-70"
            y="-20"
            width="140"
            height="25"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text
            x="0"
            y="-5"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#1e293b"
          >
            {getBrokerName(eventBroker.type)}
          </text>

          {/* Broker stats */}
          <rect
            x="-80"
            y="20"
            width="160"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text
            x="0"
            y="33"
            textAnchor="middle"
            fontSize="12"
            fill="#1e293b"
          >
            {eventBroker.type === "kafka"
              ? `Partitions: ${eventBroker.partitions}`
              : eventBroker.type === "rabbitmq"
              ? `Exchanges: ${eventBroker.exchanges?.length}`
              : `Événements: ${eventBroker.events}/${eventBroker.maxEvents}`}
          </text>

          {/* Event queue visualization - different for each broker type */}
          {eventBroker.type === "kafka" ? (
            // Kafka partitions
            <g>
              {Array.from({ length: eventBroker.partitions || 3 }).map(
                (_, i) => (
                  <g key={i}>
                    <rect
                      x="-60"
                      y={30 + i * 12}
                      width="120"
                      height="8"
                      rx="2"
                      fill="#f1f5f9"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    {Array.from({
                      length: Math.min(
                        Math.ceil(
                          eventBroker.events /
                            (eventBroker.partitions || 3)
                        ),
                        8
                      ),
                    }).map((_, j) => (
                      <rect
                        key={`${i}-${j}`}
                        x={-55 + j * 15}
                        y={30 + i * 12}
                        width="10"
                        height="8"
                        rx="1"
                        fill="#3b82f6"
                        opacity="0.7"
                      />
                    ))}
                  </g>
                )
              )}
            </g>
          ) : eventBroker.type === "rabbitmq" ? (
            // RabbitMQ exchanges and queues
            <g>
              <rect
                x="-60"
                y="30"
                width="120"
                height="30"
                rx="3"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x="0"
                y="45"
                textAnchor="middle"
                fontSize="8"
                fill="#1e293b"
              >
                Exchange → Queues
              </text>
              {Array.from({
                length: Math.min(eventBroker.events, 6),
              }).map((_, i) => (
                <circle
                  key={i}
                  cx={-40 + i * 16}
                  cy="55"
                  r="4"
                  fill="#ec4899"
                  opacity="0.7"
                />
              ))}
            </g>
          ) : (
            // Default queue visualization
            <g>
              <rect
                x="-60"
                y="30"
                width="120"
                height="20"
                rx="3"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="1"
              />
              {Array.from({
                length: Math.min(eventBroker.events, 10),
              }).map((_, i) => (
                <rect
                  key={i}
                  x={-55 + i * 12}
                  y="33"
                  width="8"
                  height="14"
                  rx="2"
                  fill={
                    i < 5 ? "#3b82f6" : i < 8 ? "#f59e0b" : "#ef4444"
                  }
                  opacity="0.7"
                />
              ))}
            </g>
          )}
        </g>

        {/* Consumer Services (Right side) */}
        {services.slice(3).map((service) => (
          <g
            key={service.type}
            transform={`translate(${service.position.x}, ${service.position.y})`}
          >
            <rect
              x="-70"
              y="-40"
              width="140"
              height="80"
              rx="5"
              fill={
                service.status === "online"
                  ? "#f1f5f9"
                  : service.status === "overloaded"
                  ? "#fef3c7"
                  : "#fee2e2"
              }
              stroke={
                service.status === "online"
                  ? "#94a3b8"
                  : service.status === "overloaded"
                  ? "#f59e0b"
                  : "#ef4444"
              }
              strokeWidth="2"
            />
            <foreignObject x="-20" y="-35" width="40" height="40">
              <div className="flex items-center justify-center w-full h-full">
                {service.type === "shipping" && (
                  <Truck className="w-7 h-7 text-green-500" />
                )}
                {service.type === "notification" && (
                  <Bell className="w-7 h-7 text-pink-500" />
                )}
              </div>
            </foreignObject>
            <rect
              x="-65"
              y="10"
              width="130"
              height="20"
              rx="3"
              fill="#f8fafc"
              stroke="none"
            />
            <text
              x="0"
              y="24"
              textAnchor="middle"
              fontSize="12"
              fill="#1e293b"
            >
              Service{" "}
              {service.type.charAt(0).toUpperCase() +
                service.type.slice(1)}
            </text>
            <rect
              x="-40"
              y="-15"
              width="80"
              height="15"
              rx="3"
              fill="#f8fafc"
              stroke="none"
            />
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fontSize="10"
              fill={
                service.status === "online"
                  ? "#1e293b"
                  : service.status === "overloaded"
                  ? "#f59e0b"
                  : "#ef4444"
              }
            >
              {service.status === "online"
                ? `Événements: ${service.events}`
                : service.status === "overloaded"
                ? "Surcharge"
                : "Hors ligne"}
            </text>
          </g>
        ))}

        {/* Connection lines */}
        {/* Producer to Broker */}
        <path
          d="M 160,150 L 320,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 160,250 L 320,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 160,350 L 320,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Broker to Consumer */}
        <path
          d="M 480,250 L 640,200"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 480,250 L 640,300"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Events */}
        {events.map((event) => (
          <g
            key={event.id}
            transform={`translate(${event.position.x}, ${event.position.y})`}
            className="group"
          >
            {/* Event circle with priority indicator */}
            <circle
              r="8"
              fill={
                event.status === "failed"
                  ? "#ef4444"
                  : getServiceByType(event.producerService, services)
                      ?.color || "#6b7280"
              }
              opacity={
                event.status === "processed" ||
                event.status === "failed"
                  ? 0.5
                  : 1
              }
              strokeWidth={event.priority === "high" ? 2 : 0}
              stroke={event.priority === "high" ? "#ef4444" : "none"}
            />

            {/* Event type indicator */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
            >
              {event.type.charAt(0).toUpperCase()}
            </text>

            {/* Event tooltip */}
            <foreignObject
              x="-150"
              y="-120"
              width="300"
              height="100"
              style={{ pointerEvents: "none", opacity: 0 }}
              className="group-hover:opacity-100 transition-opacity duration-200"
            >
              <div className="bg-gray-800 p-2 rounded shadow-lg border text-xs overflow-hidden">
                <div className="font-semibold mb-1">{event.type}</div>
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono">{event.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-medium ${
                              event.status === "failed"
                                ? "text-red-500"
                                : event.status === "processed"
                                ? "text-green-500"
                                : "text-blue-500"
                            }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span
                    className={`font-medium ${
                              event.priority === "high"
                                ? "text-red-500"
                                : event.priority === "medium"
                                ? "text-amber-500"
                                : "text-gray-500"
                            }`}
                  >
                    {event.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{event.size} bytes</span>
                </div>
                <div className="flex justify-between">
                  <span>Topic:</span>
                  <span className="font-medium">{event.topic}</span>
                </div>
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
        <div className="flex justify-between gap-4">
          <span>Événements totaux:</span>
          <span className="font-medium">{stats.totalEvents}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Événements traités:</span>
          <span className="font-medium text-green-500">
            {stats.processedEvents}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Événements échoués:</span>
          <span className="font-medium text-red-500">
            {stats.failedEvents}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Temps moyen:</span>
          <span className="font-medium">
            {stats.averageProcessingTime} ms
          </span>
        </div>
      </div>
    </div>
  );
}
