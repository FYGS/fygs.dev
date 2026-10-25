import Link from "next/link";
import { Award, CheckCircle2, PlayCircle, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface Activity {
  key: string;
  label: string;
  title: string;
  href: string;
  date: Date;
  icon: typeof Award;
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

/** What the learner did lately, each line leading to what it is about. */
export async function RecentActivity({ userId }: { userId: string }) {
  const [lessons, certificates, pathCertificates, enrollments] = await Promise.all([
    db.progress.findMany({
      where: { userId, completed: true, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        completedAt: true,
        lesson: { select: { title: true, slug: true, course: { select: { title: true, slug: true } } } },
      },
    }),
    db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: 3,
      select: { id: true, issuedAt: true, courseId: true, course: { select: { title: true } } },
    }),
    db.pathCertificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: 3,
      select: { id: true, issuedAt: true, path: { select: { title: true, slug: true } } },
    }),
    db.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      take: 3,
      select: { id: true, enrolledAt: true, course: { select: { title: true, slug: true } } },
    }),
  ]);

  const activities: Activity[] = [
    ...lessons.map((p) => ({
      key: `l-${p.id}`,
      label: "Leçon terminée",
      title: `${p.lesson.title} · ${p.lesson.course.title}`,
      href: `/learn/${p.lesson.course.slug}/lessons/${p.lesson.slug}`,
      date: p.completedAt!,
      icon: CheckCircle2,
    })),
    ...certificates.map((c) => ({
      key: `c-${c.id}`,
      label: "Certificat obtenu",
      title: c.course.title,
      href: `/certificates/${c.courseId}`,
      date: c.issuedAt,
      icon: Award,
    })),
    ...pathCertificates.map((c) => ({
      key: `p-${c.id}`,
      label: "Certificat de parcours obtenu",
      title: c.path.title,
      href: `/parcours/${c.path.slug}/certificat`,
      date: c.issuedAt,
      icon: Route,
    })),
    ...enrollments.map((e) => ({
      key: `e-${e.id}`,
      label: "Inscription",
      title: e.course.title,
      href: `/learn/${e.course.slug}`,
      date: e.enrolledAt,
      icon: PlayCircle,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle as="h2" className="text-lg">
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Votre activité apparaîtra ici dès votre première leçon.</p>
        ) : (
          <ul className="space-y-1">
            {activities.map((a) => (
              <li key={a.key}>
                <Link href={a.href} className="flex items-start gap-3 rounded-md p-2 hover:bg-accent/50">
                  <a.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">
                      {a.label} · <time dateTime={a.date.toISOString()}>{dateFormat.format(a.date)}</time>
                    </span>
                    <span className="block truncate text-sm font-medium">{a.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
