import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReviewStatus, Role } from "@/lib/generated/prisma/browser";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  Star,
  MessageSquare,
  Calendar,
  Target,
  Award
} from "lucide-react";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { StarRatingDisplay } from "@/components/reviews/star-rating";

/** How many approved reviews gave each rating: the page's distribution and its positive / neutral / negative split. */
async function getRatingCounts(): Promise<Record<number, number>> {
  const rows = await db.review.groupBy({ by: ["rating"], where: { status: ReviewStatus.APPROVED }, _count: { _all: true } });
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) counts[row.rating] = row._count._all;
  return counts;
}

/** Share of reviews rated 4-5 (positive), 3 (neutral) and 1-2 (negative); all zero when there is no review. */
function ratingSplit(counts: Record<number, number>) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (total === 0) return { positive: 0, neutral: 0, negative: 0 };
  return {
    positive: (counts[4] + counts[5]) / total,
    neutral: counts[3] / total,
    negative: (counts[1] + counts[2]) / total,
  };
}

async function getAnalyticsData() {
  const [globalStats, ratingCounts] = await Promise.all([ReviewAnalyticsService.getGlobalReviewStats(), getRatingCounts()]);
  return { globalStats, ratingCounts, sentimentData: ratingSplit(ratingCounts) };
}

export default async function AdminReviewsAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  const { globalStats, ratingCounts, sentimentData } = await getAnalyticsData();

  // Growth of the number of reviews, this month against the previous one
  const monthlyData = Object.values(globalStats.reviewsByMonth) as Array<{ count: number; averageRating: number }>;
  const currentMonth = monthlyData[monthlyData.length - 1]?.count || 0;
  const lastMonth = monthlyData[monthlyData.length - 2]?.count || 0;
  const growthRate = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics des avis</h1>
          <p className="text-muted-foreground mt-2">
            Analyse détaillée et métriques des avis étudiants
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Calendar className="h-4 w-4 mr-2" />
          Avis approuvés uniquement
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-blue-900/30">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              Taux d&apos;engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {((globalStats.totalReviews / globalStats.totalCourses) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Avis par formation
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              Croissance mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-purple-900/30">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              Avis positifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {(sentimentData.positive * 100).toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Notes de 4 et 5 étoiles
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-yellow-900/30">
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              Excellence (4.5+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {globalStats.topRatedCourses.filter((course: any) => course.averageRating >= 4.5).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Formations d&apos;excellence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Distribution des notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating] ?? 0;
                const percentage = globalStats.totalReviews > 0 ? (count / globalStats.totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground w-12 text-right">
                      {percentage.toFixed(0)}%
                    </div>
                    <div className="text-sm font-medium w-12 text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {globalStats.averageRating}
                </div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {globalStats.totalReviews}
                </div>
                <p className="text-sm text-muted-foreground">Total avis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Évolution mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(globalStats.reviewsByMonth).slice(-6).map(([month, data], index, array) => {
                const monthData = data as { count: number; averageRating: number };
                const maxCount = Math.max(...array.map(([, d]) => (d as { count: number }).count));
                const percentage = (monthData.count / maxCount) * 100;
                const date = new Date(month + '-01');
                const monthName = date.toLocaleDateString('fr-FR', {
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{monthName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{monthData.count} avis</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{monthData.averageRating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Formations les mieux notées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {globalStats.topRatedCourses.slice(0, 8).map((course: any, index: number) => (
                <div key={course.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                    'bg-gradient-to-br from-blue-400 to-indigo-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRatingDisplay
                        rating={course.averageRating}
                        showNumbers={false}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        {course.averageRating} ({course.reviewCount} avis)
                      </span>
                    </div>
                  </div>
                  {index < 3 && (
                    <Badge
                      variant={index === 0 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      Top {index + 1}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Répartition des avis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Positifs (4-5 étoiles)</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {(sentimentData.positive * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sentimentData.positive * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Neutres (3 étoiles)</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">
                    {(sentimentData.neutral * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sentimentData.neutral * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">Négatifs (1-2 étoiles)</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {(sentimentData.negative * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sentimentData.negative * 100}%` }}
                  />
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  Score de satisfaction
                </div>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  {((sentimentData.positive * 100) + (sentimentData.neutral * 50)).toFixed(0)}/100
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Positifs + la moitié des neutres, d&apos;après les notes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}