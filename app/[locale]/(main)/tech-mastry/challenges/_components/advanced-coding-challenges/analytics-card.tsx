import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Target, TrendingUp } from "lucide-react";
import type { ChallengeStats } from "./lib";

const percent = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0);

/** The learner's own figures, from the challenges they really submitted (kept in this browser). */
export function AnalyticsCard({ stats }: { stats: ChallengeStats }) {
  const solvedPercent = percent(stats.solved, stats.total);
  const triedPercent = percent(stats.attempted, stats.total);

  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Votre progression</span>
        </CardTitle>
        <CardDescription>
          {stats.attempts === 0
            ? "Soumettez une solution et votre progression s'affichera ici. Elle est enregistrée dans ce navigateur."
            : `${stats.attempts} soumission${stats.attempts === 1 ? "" : "s"} jusqu'ici. Enregistrées dans ce navigateur.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
              Global
            </h3>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Défis résolus</span>
                <span className="font-medium">
                  {stats.solved}/{stats.total}
                </span>
              </div>
              <Progress value={solvedPercent} className="h-2" aria-label="Défis résolus" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Défis tentés</span>
                <span className="font-medium">
                  {stats.attempted}/{stats.total}
                </span>
              </div>
              <Progress value={triedPercent} className="h-2" aria-label="Défis tentés" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              Par catégorie
            </h3>

            {stats.byCategory.map(({ category, solved, total }) => (
              <div key={category} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm">{category}</span>
                  <span className="font-medium">
                    {solved}/{total}
                  </span>
                </div>
                <Progress value={percent(solved, total)} className="h-2" aria-label={`${category} : résolus`} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
