import type { Stats } from "../types";

export function ObservabilityOverlay({ stats }: {
  stats: Stats;
}) {
  return (
    <div className="absolute bottom-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
      <div className="flex justify-between gap-4">
        <span>Requêtes totales:</span>
        <span className="font-medium">{stats.totalRequests}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Requêtes réussies:</span>
        <span className="font-medium text-green-500">
          {stats.successfulRequests}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Requêtes échouées:</span>
        <span className="font-medium text-red-500">
          {stats.failedRequests}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Latence moyenne:</span>
        <span className="font-medium">
          {stats.averageLatency} ms
        </span>
      </div>
    </div>
  );
}
