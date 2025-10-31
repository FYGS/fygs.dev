import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Clock, Play, Award } from "lucide-react";

interface RecentActivityProps {
  userId: string;
}

export async function RecentActivity({ userId }: RecentActivityProps) {
  const [recentProgress, recentCertificates, recentEnrollments] = await Promise.all([
    db.progress.findMany({
      where: { userId, completed: true },
      include: {
        lesson: {
          include: {
            course: {
              select: { title: true, slug: true },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
    db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 3,
    }),
  ]);

  const activities = [
    ...recentProgress.map((p: any) => ({
      type: "lesson_completed" as const,
      title: `Leçon terminée: ${p.lesson.title}`,
      subtitle: p.lesson.course.title,
      date: p.completedAt || p.updatedAt,
      icon: Play,
    })),
    ...recentCertificates.map((c: any) => ({
      type: "certificate_earned" as const,
      title: "Certificat obtenu",
      subtitle: "Formation complétée avec succès",
      date: c.issuedAt,
      icon: Award,
    })),
    ...recentEnrollments.map((e: any) => ({
      type: "course_enrolled" as const,
      title: `Inscription: ${e.course.title}`,
      subtitle: "Nouvelle formation commencée",
      date: e.enrolledAt,
      icon: Clock,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Aucune activité récente.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return "text-green-600";
      case "certificate_earned":
        return "text-yellow-600";
      case "course_enrolled":
        return "text-blue-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`mt-1 ${getActivityColor(activity.type)}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-tight">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.subtitle}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(activity.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
