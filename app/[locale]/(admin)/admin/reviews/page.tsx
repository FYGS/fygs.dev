import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Clock,
} from "lucide-react";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { StarRatingDisplay } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { REVIEW_RATINGS, REVIEW_STATUSES, listReviews } from "@/lib/services/admin-listings";
import { getModerationCounts } from "@/lib/services/review-moderation";
import { ListFilters, ListPager, Person, Td, Th, formatDateTime } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";
import { ModerationActions } from "./_components/moderation-actions";

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Approuvé",
  PENDING: "En attente",
  REJECTED: "Rejeté",
  FLAGGED: "Signalé",
};

async function getReviewStats() {
  return await ReviewAnalyticsService.getGlobalReviewStats();
}

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Moderation is for administrators: an instructor who types the URL goes back to the back-office home
  await requireAdminPage();

  const raw = await searchParams;
  const params = {
    q: firstParam(raw.q),
    status: firstParam(raw.status),
    rating: firstParam(raw.rating),
  };
  const [stats, counts, reviews] = await Promise.all([
    getReviewStats(),
    getModerationCounts().catch(() => null),
    listReviews({ ...params, page: Number(firstParam(raw.page)) || 1 }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des avis</h1>
          <p className="text-muted-foreground mt-2">
            Modération, analyse et suivi des avis étudiants
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {stats.totalReviews} avis total
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-blue-900/30">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              Total des avis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {stats.totalReviews.toLocaleString("fr-FR")}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sur {stats.totalCourses} formations
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-yellow-900/30">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              Note moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.averageRating}
              </div>
              <StarRatingDisplay 
                rating={stats.averageRating} 
                showNumbers={false}
                size="md"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Plateforme globale
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
              Ce mois-ci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(() => {
                const monthData = Object.values(stats.reviewsByMonth).slice(-1)[0] as { count: number; averageRating: number } | undefined;
                return monthData?.count || 0;
              })()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Nouveaux avis
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-lg bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {counts?.pending ?? "—"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Modération requise
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Review Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Avis</CardTitle>
              <ListFilters
                basePath="/admin/reviews"
                params={params}
                searchLabel="Avis, apprenant ou formation"
                selects={[
                  { name: "status", label: "Statut", options: REVIEW_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] ?? value })) },
                  { name: "rating", label: "Note", options: REVIEW_RATINGS.map((value) => ({ value, label: `${value} étoile${value === "1" ? "" : "s"}` })) },
                ]}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <caption className="sr-only">Liste des avis</caption>
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <Th>Date</Th>
                      <Th>Apprenant</Th>
                      <Th>Formation</Th>
                      <Th>Avis</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reviews.rows.map((review) => (
                      <tr key={review.id}>
                        <Td className="whitespace-nowrap">{formatDateTime(review.createdAt)}</Td>
                        <Td>
                          <Person user={review.user} />
                        </Td>
                        <Td>{review.courseTitle}</Td>
                        <Td className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <StarRatingDisplay rating={review.rating} showNumbers={false} size="sm" />
                            <span className="sr-only">{review.rating} sur 5</span>
                            {review.reportCount > 0 && (
                              <Badge variant="destructive">
                                {review.reportCount} signalement{review.reportCount > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          {review.comment && <p className="mt-1 line-clamp-3 text-muted-foreground">{review.comment}</p>}
                        </Td>
                        <Td>
                          <Badge variant={review.status === "APPROVED" ? "default" : review.status === "REJECTED" ? "outline" : "secondary"}>
                            {STATUS_LABEL[review.status] ?? review.status}
                          </Badge>
                        </Td>
                        <Td>
                          <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/reviews/${review.id}`}
                                aria-label={`Voir l'avis de ${review.user.name} sur ${review.courseTitle}`}
                              >
                                Voir
                              </Link>
                            </Button>
                            <ModerationActions
                              reviewId={review.id}
                              status={review.status}
                              author={review.user.name}
                              courseTitle={review.courseTitle}
                            />
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ListPager basePath="/admin/reviews" params={params} pager={reviews} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          {/* Top Rated Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Formations les mieux notées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topRatedCourses.slice(0, 5).map((course: any, index: number) => (
                <div key={course.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-sm font-bold flex items-center justify-center">
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
                        {course.averageRating} ({course.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Review Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Tendances mensuelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.reviewsByMonth).slice(-6).map(([month, data]) => {
                  const monthData = data as { count: number; averageRating: number };
                  const date = new Date(month + '-01');
                  const monthName = date.toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                  });
                  
                  return (
                    <div key={month} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {monthName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{monthData.count}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{monthData.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Aller plus loin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/reviews/moderation" className="block w-full rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <p className="font-medium text-sm">File de modération</p>
                <p className="text-xs text-muted-foreground">Les avis en attente et signalés, à approuver ou rejeter</p>
              </Link>
              <Link href="/admin/reviews/analytics" className="block w-full rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <p className="font-medium text-sm">Statistiques détaillées</p>
                <p className="text-xs text-muted-foreground">Répartition des notes et évolution</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}