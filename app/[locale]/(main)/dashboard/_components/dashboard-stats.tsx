import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRepository } from "@/lib/repositories/progress-repository";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const aggregate = await ProgressRepository.getUserAggregateStats(userId);

  const stats = [
    {
      title: "Formations inscrites",
  value: aggregate.enrollments,
      icon: BookOpen,
      description: "Formations actives",
    },
    {
      title: "Heures d'apprentissage",
  value: aggregate.totalWatchHours,
      icon: Clock,
      description: "Temps total passé",
    },
    {
      title: "Certificats obtenus",
  value: aggregate.certificates,
      icon: Award,
      description: "Formations complétées",
    },
    {
      title: "Progression globale",
  value: `${aggregate.completionRate}%`,
      icon: TrendingUp,
      description: "Leçons terminées",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
