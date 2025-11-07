import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { StarRatingDisplay } from "@/components/reviews/star-rating";

async function getReviewStats() {
  return await ReviewAnalyticsService.getGlobalReviewStats();
}

export default async function AdminReviewsPage() {
  // Check authentication and permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  const stats = await getReviewStats();

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
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalReviews.toLocaleString()}
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
              0
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
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres et actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <select className="px-3 py-2 border rounded-lg">
                  <option>Tous les statuts</option>
                  <option>Approuvés</option>
                  <option>En attente</option>
                  <option>Signalés</option>
                </select>
                
                <select className="px-3 py-2 border rounded-lg">
                  <option>Toutes les notes</option>
                  <option>5 étoiles</option>
                  <option>4 étoiles</option>
                  <option>3 étoiles</option>
                  <option>2 étoiles</option>
                  <option>1 étoile</option>
                </select>
                
                <select className="px-3 py-2 border rounded-lg">
                  <option>Toutes les formations</option>
                </select>
                
                <input 
                  type="search" 
                  placeholder="Rechercher dans les avis..."
                  className="px-3 py-2 border rounded-lg flex-1 min-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Avis récents
                <Badge variant="secondary">
                  Mis à jour il y a 2 min
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Chargement des avis...</div>}>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Interface de modération en cours de développement</p>
                  <p className="text-sm mt-2">
                    Les avis seront affichés ici avec les outils de modération
                  </p>
                </div>
              </Suspense>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-900/30">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Approuver en lot</p>
                    <p className="text-xs text-muted-foreground">
                      Approuver plusieurs avis sélectionnés
                    </p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-900/30">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Modérer le contenu</p>
                    <p className="text-xs text-muted-foreground">
                      Outils de modération avancés
                    </p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-900/30">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Rapport détaillé</p>
                    <p className="text-xs text-muted-foreground">
                      Exporter les statistiques
                    </p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}