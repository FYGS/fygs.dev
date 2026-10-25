import { Flame, Trophy, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

const DAY = 86_400_000;

/** The start of today and the moment a week ago, for the week's count and whether the run is still alive. */
function calendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return { today, weekAgo: new Date(Date.now() - 7 * DAY) };
}

/**
 * The learner's regularity, from the one streak the platform keeps (`UserStreak`, updated by lib/gamification.ts
 * when a lesson is completed or a quiz passed): days in a row, best run, lessons completed this week.
 */
export async function LearningStreak({ userId }: { userId: string }) {
  const { today, weekAgo } = calendar();
  const [streak, lessonsThisWeek] = await Promise.all([
    db.userStreak.findUnique({ where: { userId }, select: { currentStreak: true, longestStreak: true, lastActivityAt: true } }),
    db.progress.count({ where: { userId, completed: true, completedAt: { gte: weekAgo } } }),
  ]);

  // A run is still alive if the last activity was today or yesterday; otherwise it is over
  const alive = streak ? streak.lastActivityAt.getTime() >= today.getTime() - DAY : false;
  const current = alive ? (streak?.currentStreak ?? 0) : 0;
  const longest = streak?.longestStreak ?? 0;

  const message =
    current === 0
      ? "Terminez une leçon aujourd’hui pour lancer votre série."
      : current === 1
        ? "Bon début : revenez demain pour prolonger votre série."
        : `${current} jours d’affilée : continuez sur cette lancée.`;

  const stats = [
    { label: "Jours d’affilée", value: current, icon: Flame },
    { label: "Meilleure série", value: longest, icon: Trophy },
    { label: "Leçons terminées en 7 jours", value: lessonsThisWeek, icon: CheckCircle2 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle as="h2" className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden /> Régularité
        </CardTitle>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-3 text-center">
              <dt className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <stat.icon className="h-3.5 w-3.5" aria-hidden /> {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-bold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
