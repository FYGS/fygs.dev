import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserCoursesProgressOnce } from "@/lib/progress-summary";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const courses = await getUserCoursesProgressOnce(userId);

  const done = courses.reduce((sum, c) => sum + c.done, 0);
  const total = courses.reduce((sum, c) => sum + c.total, 0);
  const watchedSeconds = courses.reduce((sum, c) => sum + c.consumedDurationSec, 0);
  const hours = watchedSeconds / 3600;

  const stats = [
    {
      title: "Formations suivies",
      value: courses.length,
      icon: BookOpen,
      description: `${courses.filter((c) => c.isComplete).length} terminée${courses.filter((c) => c.isComplete).length > 1 ? "s" : ""}`,
    },
    {
      title: "Temps d'apprentissage",
      value: hours < 10 ? `${hours.toFixed(1).replace(".", ",")} h` : `${Math.round(hours)} h`,
      icon: Clock,
      description: "Temps de lecture vidéo",
    },
    {
      title: "Certificats obtenus",
      value: courses.filter((c) => c.hasCertificate).length,
      icon: Award,
      description: "Formations validées",
    },
    {
      title: "Progression globale",
      value: total > 0 ? `${Math.floor((done / total) * 100)}%` : "0%",
      icon: TrendingUp,
      description: `${done} étape${done > 1 ? "s" : ""} sur ${total}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
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
