import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Star, 
  Calendar,
  MessageSquare,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit
} from "lucide-react";
import { StarRatingDisplay } from "@/components/reviews/star-rating";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

interface ReviewDetailsPageProps {
  params: Promise<{
    reviewId: string;
  }>;
}

// Mock review data - in real implementation, fetch from database
const mockReview = {
  id: "1",
  rating: 5,
  comment: "Excellente formation ! J'ai beaucoup appris sur les concepts avancés de React. L'instructeur explique très bien et les exercices pratiques sont très utiles. Je recommande vivement cette formation à tous ceux qui veulent approfondir leurs connaissances en React.",
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z"),
  status: "APPROVED" as const,
  isPublic: true,
  helpfulCount: 12,
  reportCount: 0,
  user: {
    id: "user-1",
    name: "Marie Dubois",
    email: "marie.dubois@example.com",
    avatar: null,
    createdAt: new Date("2023-06-01T00:00:00Z"),
    role: "STUDENT" as const,
    isVerified: true
  },
  course: {
    id: "course-1",
    title: "React Avancé : Hooks et Context API",
    slug: "react-avance-hooks-context",
    instructor: {
      name: "Jean Martin",
      email: "jean.martin@example.com"
    }
  },
  reports: [],
  replies: [
    {
      id: "reply-1",
      content: "Merci beaucoup pour ce retour positif ! Je suis ravi que la formation vous ait plu.",
      createdAt: new Date("2024-01-16T09:15:00Z"),
      author: {
        name: "Jean Martin",
        role: "INSTRUCTOR" as const
      }
    }
  ],
  moderationNotes: "Avis vérifié - utilisateur authentique avec achat confirmé."
};

export default async function ReviewDetailsPage({ params }: ReviewDetailsPageProps) {
  const { reviewId } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  // In real implementation, fetch review from database
  // const review = await getReviewById(reviewId);
  // if (!review) return notFound();

  if (reviewId !== "1") {
    return notFound();
  }

  const review = mockReview;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "REJECTED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="h-4 w-4" />;
      case "PENDING": return <AlertTriangle className="h-4 w-4" />;
      case "REJECTED": return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/reviews">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux avis
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Détails de l&apos;avis</h1>
          <p className="text-muted-foreground mt-2">
            Modération et gestion de l&apos;avis #{review.id}
          </p>
        </div>
        <Badge className={`${getStatusColor(review.status)} flex items-center gap-2`}>
          {getStatusIcon(review.status)}
          {review.status === "APPROVED" ? "Approuvé" : 
           review.status === "PENDING" ? "En attente" : "Rejeté"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contenu de l&apos;avis</span>
                <div className="flex items-center gap-2">
                  <StarRatingDisplay rating={review.rating} showNumbers />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={review.user.avatar || undefined} />
                  <AvatarFallback>
                    {review.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user.name}</span>
                    {review.user.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span>{review.user.email}</span>
                    <span>•</span>
                    <span>Membre depuis {review.user.createdAt.toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <Badge variant="outline">
                  {review.user.role === "STUDENT" ? "Étudiant" : 
                   review.user.role === "INSTRUCTOR" ? "Instructeur" : "Admin"}
                </Badge>
              </div>

              <Separator />

              {/* Course Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Formation évaluée</span>
                </div>
                <h3 className="font-medium">{review.course.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Par {review.course.instructor.name}
                </p>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <h4 className="font-medium">Commentaire</h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Publié le {review.createdAt.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {review.updatedAt > review.createdAt && (
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span>
                      Modifié le {review.updatedAt.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          {review.replies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Réponses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.replies.map((reply) => (
                  <div key={reply.id} className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{reply.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {reply.author.role === "INSTRUCTOR" ? "Instructeur" : "Admin"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {reply.createdAt.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Moderation Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes de modération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {review.moderationNotes || "Aucune note de modération."}
                </p>
              </div>
              <div className="mt-4">
                <textarea 
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Ajouter des notes de modération..."
                />
                <Button size="sm" className="mt-2">
                  Ajouter une note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                {review.isPublic ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Masquer
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Afficher
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Votes utiles</span>
                <Badge variant="secondary">{review.helpfulCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Signalements</span>
                <Badge variant={review.reportCount > 0 ? "destructive" : "secondary"}>
                  {review.reportCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Réponses</span>
                <Badge variant="secondary">{review.replies.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Visibilité</span>
                <Badge variant={review.isPublic ? "default" : "secondary"}>
                  {review.isPublic ? "Public" : "Masqué"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profil utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarImage src={review.user.avatar || undefined} />
                  <AvatarFallback className="text-lg">
                    {review.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium">{review.user.name}</h3>
                <p className="text-sm text-muted-foreground">{review.user.email}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total avis</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between">
                  <span>Note moyenne donnée</span>
                  <span className="font-medium">4.3</span>
                </div>
                <div className="flex justify-between">
                  <span>Formations achetées</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Membre depuis</span>
                  <span className="font-medium">
                    {review.user.createdAt.toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              <Button variant="outline" size="sm" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Voir le profil complet
              </Button>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">{review.course.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Par {review.course.instructor.name}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Note moyenne</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.7</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Total avis</span>
                  <span className="font-medium">234</span>
                </div>
                <div className="flex justify-between">
                  <span>Étudiants inscrits</span>
                  <span className="font-medium">1,247</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/formations/${review.course.slug}`}>
                  Voir la formation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}