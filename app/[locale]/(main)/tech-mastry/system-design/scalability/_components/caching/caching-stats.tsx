"use client";

import { Card } from "@/components/ui/card";
import type { SimulationStats } from "./types";

export function CachingStats({ stats }: {
  stats: SimulationStats;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 border border-indigo-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
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
            >
              <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7.5" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
              <path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6v0Z" />
              <path d="M18 18v3" />
              <path d="M18 15v.01" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">
            Requêtes Totales
          </p>
        </div>
        <p className="font-medium text-xl text-indigo-500">
          {stats.totalRequests}
        </p>
      </Card>
      <Card className="p-4 border border-emerald-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-linear-to-br from-emerald-500/10 to-teal-500/10 text-emerald-500">
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
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">Cache Hits</p>
        </div>
        <p className="font-medium text-xl text-emerald-500">
          {stats.cacheHits}
        </p>
      </Card>
      <Card className="p-4 border border-amber-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-amber-500/10 transition-all duration-300 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-linear-to-br from-amber-500/10 to-yellow-500/10 text-amber-500">
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
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">Cache Misses</p>
        </div>
        <p className="font-medium text-xl text-amber-500">
          {stats.cacheMisses}
        </p>
      </Card>
      <Card className="p-4 border border-blue-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 text-blue-500">
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
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">
            Temps Économisé
          </p>
        </div>
        <p className="font-medium text-xl text-blue-500">
          {stats.timesSaved}%
        </p>
      </Card>
    </div>
  );
}
