import Link from "next/link";
import { Suspense } from "react";
import { ReviewSearchPage } from "@/components/reviews/review-search-page";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  Award,
  Sparkles
} from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Avis authentiques de nos étudiants</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Vérifiés
            </Badge>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Avis des étudiants
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les retours authentiques de notre communauté d&apos;étudiants 
              sur nos formations en développement web et technologies.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">4.8/5</div>
              <div className="text-xs text-muted-foreground">Note moyenne</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-500" />
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">1,200+</div>
              <div className="text-xs text-muted-foreground">Avis collectés</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold">95%</div>
              <div className="text-xs text-muted-foreground">Satisfaction</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">850+</div>
              <div className="text-xs text-muted-foreground">Vérifiés</div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-900/30 to-purple-900/30">
                <TrendingUp className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Avis en tendance</h2>
                <p className="text-sm text-muted-foreground">
                  Les avis les plus utiles de la semaine
                </p>
              </div>
            </div>
            
            <Suspense fallback={
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
                <p>Chargement des avis en tendance...</p>
              </div>
            }>
              {/* This would be a separate component that fetches trending reviews */}
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Les avis tendance seront affichés ici</p>
              </div>
            </Suspense>
          </CardContent>
        </Card>

        {/* Main Search and Filter Interface */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de l&apos;interface de recherche...</p>
          </div>
        }>
          <ReviewSearchPage 
            showStats={true}
            showFacets={true}
            className="space-y-6"
          />
        </Suspense>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Vous avez suivi une de nos formations ?
              </h3>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Partagez votre expérience pour aider d&apos;autres étudiants à faire le bon choix. 
                Votre avis compte et contribue à l&apos;amélioration continue de nos formations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/formations"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors border border-blue-500"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Parcourir les formations
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}