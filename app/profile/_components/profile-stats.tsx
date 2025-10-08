"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, TrendingUp, Clock } from "lucide-react";

interface ProfileStatsData {
  totalEnrollments: number;
  completedCourses: number;
  totalCertificates: number;
  averageProgress: number;
}

interface ProfileStatsProps {
  userId: string;
}

export function ProfileStats({ userId }: ProfileStatsProps) {
  const [stats, setStats] = useState<ProfileStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch profile stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Impossible de charger les statistiques</p>
      </div>
    );
  }

  const statItems = [
    {
      icon: BookOpen,
      label: "Formations suivies",
      value: stats.totalEnrollments,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      label: "Progression moyenne",
      value: `${stats.averageProgress}%`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      progress: stats.averageProgress,
    },
    {
      icon: Award,
      label: "Cours terminés",
      value: stats.completedCourses,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Clock,
      label: "Certificats obtenus",
      value: stats.totalCertificates,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            </div>
            
            {item.progress !== undefined && (
              <div className="space-y-1">
                <Progress value={item.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
