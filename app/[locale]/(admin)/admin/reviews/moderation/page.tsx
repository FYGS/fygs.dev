import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Flag
} from "lucide-react";
import { ReviewSearchService } from "@/lib/services/review-search";
import { ReviewStatus } from "@/lib/generated/prisma/browser";
import { StarRatingDisplay } from "@/components/reviews/star-rating";

export const metadata: Metadata = {
  title: "Modération des avis | Administration",
  description: "Interface de modération pour la gestion des avis en attente",
};

async function getModerationQueue() {
  try {
    const result = await ReviewSearchService.getModerationQueue();
    return { ...result, unavailable: false };
  } catch (error) {
    console.error(
      "Error fetching moderation queue:",
      error instanceof Error ? error.name : "unknown",
    );
    // An outage must not look like an empty queue
    return {
      reviews: [] as Awaited<
        ReturnType<typeof ReviewSearchService.getModerationQueue>
      >["reviews"],
      pagination: { totalCount: 0 },
      unavailable: true,
    };
  }
}

export default async function AdminReviewsModerationPage() {
  const { reviews, pagination, unavailable } = await getModerationQueue();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modération des avis</h1>
          <p className="text-muted-foreground">
            Gérez les avis en attente de validation
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {pagination.totalCount} en attente
        </Badge>
      </div>

      {unavailable && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-900/20 p-4 text-sm text-red-300"
        >
          La file de modération est momentanément indisponible. Le nombre
          d&apos;avis en attente affiché n&apos;est pas fiable, réessayez dans
          quelques instants.
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pagination.totalCount}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-900/30">
                <Flag className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Signalés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Approuvés aujourd&apos;hui</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-900/30">
                <XCircle className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Rejetés aujourd&apos;hui</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            File d&apos;attente de modération
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <StarRatingDisplay 
                            rating={review.rating}
                            size="sm"
                            showNumbers={false}
                          />
                          <Badge variant="secondary">{review.rating}/5</Badge>
                        </div>
                        <Badge 
                          variant={review.status === ReviewStatus.PENDING ? "outline" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {review.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-medium">{review.course?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Par {review.user?.name} • {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm bg-muted p-3 rounded-md">
                          {review.comment}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir détails
                      </Button>
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Aucun avis en attente</h3>
                  <p className="text-muted-foreground">
                    Tous les avis ont été modérés. Excellent travail !
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}