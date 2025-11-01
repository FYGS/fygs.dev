"use client";

import { getPostStats } from "@/app/[locale]/(main)/blog/actions/stats";
import { createContext, useContext, useState } from "react";

interface StatsContextType {
  getStats: (slug: string) => Promise<{
    views: number;
    likes: number;
    shares: number;
  }>;
  stats: Record<string, { views: number; likes: number; shares: number }>;
}

const StatsContext = createContext<StatsContextType | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<
    Record<string, { views: number; likes: number; shares: number }>
  >({});

  const getStats = async (slug: string) => {
    if (stats[slug]) return stats[slug];

    const newStats = await getPostStats(slug);
    setStats((prev) => ({ ...prev, [slug]: newStats }));
    return newStats;
  };

  return (
    <StatsContext.Provider value={{ getStats, stats }}>
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) throw new Error("useStats must be used within StatsProvider");
  return context;
};
