"use client";

import { BarChart } from "lucide-react";
import type { SimulationStats } from "./types";

export function CachingDetailedStats({ stats }: {
  stats: SimulationStats;
}) {
  return (
    <div className="p-6 rounded-xl border border-indigo-500/20 bg-background/60 backdrop-blur-xs hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
      <h3 className="text-lg font-semibold flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
          <BarChart className="h-5 w-5" />
        </div>
        <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
          Statistiques Détaillées
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-sm text-blue-500 font-medium">
              Temps de réponse avec cache
            </p>
          </div>
          <p className="font-semibold text-xl text-blue-600">
            {stats.averageTimeWithCache}{" "}
            <span className="text-sm font-normal text-blue-500/70">
              ms
            </span>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-sm text-purple-500 font-medium">
              Temps de réponse sans cache
            </p>
          </div>
          <p className="font-semibold text-xl text-purple-600">
            {stats.averageTimeWithoutCache}{" "}
            <span className="text-sm font-normal text-purple-500/70">
              ms
            </span>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p className="text-sm text-emerald-500 font-medium">
              Taux de hit
            </p>
          </div>
          <p className="font-semibold text-xl text-emerald-600">
            {stats.totalRequests > 0
              ? Math.round(
                  (stats.cacheHits / stats.totalRequests) * 100
                )
              : 0}
            <span className="text-sm font-normal text-emerald-500/70">
              %
            </span>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <p className="text-sm text-amber-500 font-medium">
              Requêtes à la base de données
            </p>
          </div>
          <p className="font-semibold text-xl text-amber-600">
            {stats.dbQueries}
          </p>
        </div>
      </div>
    </div>
  );
}
