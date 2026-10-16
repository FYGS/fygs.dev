import type { ArchitectureStats } from "./types";


export function StatsOverlay({ stats }: { stats: ArchitectureStats }) {
  return (
    <div className="absolute bottom-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
      <div className="flex justify-between gap-4">
        <span>Requêtes totales:</span>
        <span className="font-medium">{stats.totalRequests}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Requêtes complétées:</span>
        <span className="font-medium text-green-500">
          {stats.completedRequests}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Requêtes échouées:</span>
        <span className="font-medium text-red-500">
          {stats.failedRequests}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Temps moyen:</span>
        <span className="font-medium">{stats.averageResponseTime} ms</span>
      </div>
    </div>
  );
}
