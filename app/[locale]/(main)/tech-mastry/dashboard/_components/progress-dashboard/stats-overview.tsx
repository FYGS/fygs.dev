import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Calendar, CheckCircle2, Clock, Flame, Target, Trophy } from "lucide-react";
import type { ProgressStats } from "./types";

const CARD = "backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow";

export function formatDuration(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(Math.round(minutes)), unit: minutes <= 1 ? "minute" : "minutes" };
  const hours = Math.round((minutes / 60) * 10) / 10;
  return { value: String(hours).replace(".", ","), unit: hours <= 1 ? "heure" : "heures" };
}

/** "Aujourd'hui", "Hier", "il y a 3 jours" or "Aucune activité" (relative to `now`, calendar days in UTC like the streak) */
export function describeLastActivity(last: Date | null, now: Date): string {
  if (!last) return "Aucune activité";
  const days = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())) /
      86_400_000,
  );
  if (days <= 0) return "Aujourd'hui";
  return days === 1 ? "Hier" : `il y a ${days} jours`;
}

export function StatsOverview({ progressData, now = new Date() }: { progressData: ProgressStats; now?: Date }) {
  const unlocked = progressData.achievements.filter((a) => a.isUnlocked);
  const latest = [...unlocked].sort((a, b) => (b.unlockedAt?.getTime() ?? 0) - (a.unlockedAt?.getTime() ?? 0))[0];
  const time = formatDuration(progressData.totalTimeMinutes);
  const topicPercent = progressData.totalTopics > 0 ? (progressData.topicsCompleted / progressData.totalTopics) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className={CARD}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Sujets terminés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-3xl font-bold">
              {progressData.topicsCompleted}
              <span className="text-foreground/70 text-sm font-normal ml-1">/ {progressData.totalTopics}</span>
            </div>
            <Progress value={topicPercent} className="h-2 mt-2" aria-label="Sujets terminés" />
            <div className="text-xs text-muted-foreground mt-1">
              {progressData.selfCheckAverage === null
                ? "Aucune auto-évaluation faite"
                : `${progressData.selfChecksTaken} auto-évaluation${progressData.selfChecksTaken > 1 ? "s" : ""}, moyenne ${progressData.selfCheckAverage} %`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={CARD}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" aria-hidden="true" />
            Défis réussis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-3xl font-bold">
              {progressData.challengesCompleted}
              <span className="text-foreground/70 text-sm font-normal ml-1">/ {progressData.totalChallenges}</span>
            </div>
            <Progress
              value={
                progressData.totalChallenges > 0
                  ? (progressData.challengesCompleted / progressData.totalChallenges) * 100
                  : 0
              }
              className="h-2 mt-2"
              aria-label="Défis réussis"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={CARD}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
            Série en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">{progressData.streakDays}</div>
            <div className="text-foreground/70 mb-1">{progressData.streakDays <= 1 ? "jour" : "jours"}</div>
          </div>
          <div className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            Dernière activité : {describeLastActivity(progressData.lastActivityAt, now)}
          </div>
        </CardContent>
      </Card>

      <Card className={CARD}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            Succès
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">{unlocked.length}</div>
            <div className="text-muted-foreground mb-1">/ {progressData.achievements.length} débloqués</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Award className="h-3 w-3" aria-hidden="true" />
            {latest ? `Dernier : ${latest.title}` : "Rien de débloqué pour l'instant"}
          </div>
        </CardContent>
      </Card>

      <Card className={`${CARD} md:col-span-2 lg:col-span-2`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
            Temps d&apos;apprentissage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">{time.value}</div>
            <div className="text-muted-foreground mb-1">{time.unit}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <BookOpen className="h-3 w-3" aria-hidden="true" />
            {progressData.pagesVisited} sujet{progressData.pagesVisited > 1 ? "s" : ""} ouvert{progressData.pagesVisited > 1 ? "s" : ""} sur{" "}
            {progressData.totalPages}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
