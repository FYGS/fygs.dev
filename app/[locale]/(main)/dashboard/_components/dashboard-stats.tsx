import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getUserCoursesProgressOnce } from "@/lib/progress-summary";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const [courses, pathCertificates] = await Promise.all([
    getUserCoursesProgressOnce(userId),
    db.pathCertificate.count({ where: { userId } }),
  ]);
  const finished = courses.filter((c) => c.isComplete || c.hasCertificate).length;
  const certificates = courses.filter((c) => c.hasCertificate).length + pathCertificates;

  const done = courses.reduce((sum, c) => sum + c.done, 0);
  const total = courses.reduce((sum, c) => sum + c.total, 0);
  const watchedSeconds = courses.reduce((sum, c) => sum + c.consumedDurationSec, 0);
  const hours = watchedSeconds / 3600;

  const stats = [
    {
      title: "Formations suivies",
      value: courses.length,
      icon: BookOpen,
      description: `${finished} terminée${finished > 1 ? "s" : ""}`,
    },
    {
      title: "Temps d'apprentissage",
      value: hours < 10 ? `${hours.toFixed(1).replace(".", ",")} h` : `${Math.round(hours)} h`,
      icon: Clock,
      description: "Temps de lecture vidéo",
    },
    {
      title: "Certificats obtenus",
      value: certificates,
      icon: Award,
      description: pathCertificates > 0 ? `dont ${pathCertificates} de parcours` : "Formations et parcours validés",
    },
    {
      title: "Progression globale",
      value: total > 0 ? `${Math.floor((done / total) * 100)} %` : "—",
      icon: TrendingUp,
      description: `${done} étape${done > 1 ? "s" : ""} sur ${total}`,
    },
  ];

  return (
    <section aria-labelledby="stats-title" className="space-y-3">
      <h2 id="stats-title" className="text-lg font-semibold">
        Où vous en êtes
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
      </div>
    </section>
  );
}
