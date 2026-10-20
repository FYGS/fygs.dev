import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MessageSquare, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRatingDisplay } from "@/components/reviews/star-rating";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-guard";
import { formatDateTime } from "../../_components/list-shell";
import { ReviewDecision } from "../_components/review-decision";

export const metadata: Metadata = {
  title: "Détails de l'avis | Admin FYGS",
  description: "Le contenu d'un avis, ses signalements et son historique de modération",
};

const STATUS_LABEL: Record<string, string> = { APPROVED: "Approuvé", PENDING: "En attente", REJECTED: "Rejeté", FLAGGED: "Signalé" };
const STATUS_CLASS: Record<string, string> = {
  APPROVED: "bg-green-900/30 text-green-400",
  PENDING: "bg-yellow-900/30 text-yellow-400",
  REJECTED: "bg-red-900/30 text-red-400",
  FLAGGED: "bg-orange-900/30 text-orange-400",
};
const REASON_LABEL: Record<string, string> = {
  SPAM: "Spam",
  INAPPROPRIATE: "Contenu inapproprié",
  FAKE: "Faux avis",
  OFFENSIVE: "Propos offensants",
  COPYRIGHT: "Droit d'auteur",
  OTHER: "Autre",
};
const REPORT_STATUS_LABEL: Record<string, string> = { PENDING: "À traiter", REVIEWED: "Examiné", RESOLVED: "Résolu", DISMISSED: "Classé sans suite" };
const ROLE_LABEL: Record<string, string> = { STUDENT: "Étudiant", INSTRUCTOR: "Instructeur", ADMIN: "Administrateur" };

export default async function ReviewDetailsPage({ params }: { params: Promise<{ reviewId: string }> }) {
  await requireAdminPage();
  const { reviewId } = await params;

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true, role: true } },
      course: { select: { title: true, slug: true, instructor: { select: { name: true } } } },
      replies: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true, role: true } } } },
      reports: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } },
      moderations: { orderBy: { createdAt: "desc" }, include: { moderator: { select: { name: true } } } },
      _count: { select: { votes: true } },
    },
  });
  if (!review) notFound();

  return (
    <div className="space-y-8">
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
            Avis de {review.user.name} sur « {review.course.title} »
          </p>
        </div>
        <Badge className={STATUS_CLASS[review.status] ?? ""}>{STATUS_LABEL[review.status] ?? review.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="flex items-center justify-between">
                <span>Contenu de l&apos;avis</span>
                <StarRatingDisplay rating={review.rating} showNumbers />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={review.user.image || undefined} alt="" />
                  <AvatarFallback>
                    {review.user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${review.user.id}`} className="font-medium hover:underline">
                      {review.user.name}
                    </Link>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" aria-hidden="true" />A terminé la formation
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground break-all">{review.user.email}</div>
                </div>
                <Badge variant="outline">{ROLE_LABEL[review.user.role] ?? review.user.role}</Badge>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">Formation évaluée</span>
                </div>
                <h3 className="font-medium">{review.course.title}</h3>
                {review.course.instructor && <p className="text-sm text-muted-foreground">Par {review.course.instructor.name}</p>}
                <Link href={`/formations/${review.course.slug}`} className="text-sm underline">
                  Voir la formation
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Commentaire</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  {review.comment ? (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Note seule, sans commentaire.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Publié le {formatDateTime(review.createdAt)}
                </span>
                {review.updatedAt.getTime() - review.createdAt.getTime() > 1000 && <span>Modifié le {formatDateTime(review.updatedAt)}</span>}
              </div>
            </CardContent>
          </Card>

          {review.replies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle as="h2">Réponses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.replies.map((reply) => (
                  <div key={reply.id} className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{reply.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABEL[reply.user.role] ?? reply.user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-line">{reply.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle as="h2">Signalements ({review.reports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {review.reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun signalement.</p>
              ) : (
                <ul className="space-y-3">
                  {review.reports.map((report) => (
                    <li key={report.id} className="bg-muted/30 p-4 rounded-lg text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{REASON_LABEL[report.reason] ?? report.reason}</Badge>
                        <Badge variant="secondary">{REPORT_STATUS_LABEL[report.status] ?? report.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          par {report.user.name} · {formatDateTime(report.createdAt)}
                        </span>
                      </div>
                      {report.details && <p className="mt-2 whitespace-pre-line">{report.details}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Historique de modération</CardTitle>
            </CardHeader>
            <CardContent>
              {review.moderations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune décision de modération pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {review.moderations.map((entry) => (
                    <li key={entry.id} className="bg-muted/30 p-4 rounded-lg text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {STATUS_LABEL[entry.fromStatus] ?? entry.fromStatus} → {STATUS_LABEL[entry.toStatus] ?? entry.toStatus}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          par {entry.moderator?.name ?? "un compte supprimé"} · {formatDateTime(entry.createdAt)}
                        </span>
                      </div>
                      {entry.note && <p className="mt-2 whitespace-pre-line">{entry.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Décision</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewDecision reviewId={review.id} status={review.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {[
                  ["Votes « utile »", review.helpfulCount],
                  ["Votes au total", review._count.votes],
                  ["Signalements", review.reports.length],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt>{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/admin/users/${review.user.id}`}>Voir le compte de l&apos;auteur</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
