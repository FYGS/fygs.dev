import type { Request } from "../types";

export function RequestsLayer({ activeFeature, requests }: {
  activeFeature: "traffic" | "security" | "observability" | "control-plane";
  requests: Request[];
}) {
  return (
    <>
      {requests.map((request) => (
        <g
          key={request.id}
          transform={`translate(${request.position.x}, ${request.position.y})`}
          className="group"
        >
          {/* Request circle with method indicator */}
          <circle
            r="6"
            fill={
              request.status === "success"
                ? "#10b981"
                : request.status === "error"
                ? "#ef4444"
                : request.status === "rejected"
                ? "#f59e0b"
                : "#3b82f6"
            }
            opacity={
              request.status === "success" ||
              request.status === "error" ||
              request.status === "rejected"
                ? 0.5
                : 1
            }
            strokeWidth={request.priority === "high" ? 1.5 : 0}
            stroke={request.priority === "high" ? "#ef4444" : "none"}
          />

          {/* Method indicator */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="6"
            fill="white"
            fontWeight="bold"
          >
            {request.method.charAt(0)}
          </text>

          {/* Security indicator */}
          {activeFeature === "security" && request.secured && (
            <circle
              r="9"
              fill="none"
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )}

          {/* Traffic management indicators */}
          {activeFeature === "traffic" &&
            request.type === "retry" && (
              <circle
                r="9"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
              />
            )}
          {activeFeature === "traffic" &&
            request.type === "circuit-broken" && (
              <circle
                r="9"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            )}

          {/* Request tooltip */}
          <foreignObject
            x="-150"
            y="-120"
            width="300"
            height="120"
            style={{ pointerEvents: "none", opacity: 0 }}
            className="group-hover:opacity-100 transition-opacity duration-200"
          >
            <div className="bg-gray-800 p-2 rounded shadow-lg border text-xs overflow-hidden">
              <div className="font-semibold mb-1 flex justify-between">
                <span>
                  {request.method} {request.target}
                </span>
                <span
                  className={`font-medium ${
                            request.status === "error"
                                ? "text-red-500"
                                : request.status === "success"
                                ? "text-green-500"
                                : request.status === "rejected"
                                ? "text-amber-500"
                                : "text-blue-500"
                            }`}
                  >
                  {request.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="font-mono">{request.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{request.size} bytes</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span
                  className={`font-medium ${
                            request.priority === "high"
                                ? "text-red-500"
                                : request.priority === "medium"
                                ? "text-amber-500"
                                : "text-gray-500"
                            }`}
                  >
                  {request.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trace ID:</span>
                <span className="font-mono text-[8px] truncate">
                  {request.traceId}
                </span>
              </div>
              {request.secured && (
                <div className="flex justify-between">
                  <span>Security:</span>
                  <span className="text-green-500">mTLS Enabled</span>
                </div>
              )}
            </div>
          </foreignObject>
        </g>
      ))}
    </>
  );
}
