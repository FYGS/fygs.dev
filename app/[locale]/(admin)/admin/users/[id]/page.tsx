import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-guard";
import { formatDateTime, formatMoney } from "../../_components/list-shell";
import { UserAdminControls } from "../_components/user-admin-controls";
import { isSubscriptionActive } from "@/lib/access/entitlement";

export const metadata: Metadata = {
  title: "Utilisateur | Admin FYGS",
  description: "Le compte, ses formations, ses paiements et ses réglages",
};

const ROLE_LABEL: Record<string, string> = { STUDENT: "Étudiant", INSTRUCTOR: "Instructeur", ADMIN: "Administrateur" };
const SUBSCRIPTION_LABEL: Record<string, string> = {
  ACTIVE: "Actif",
  CANCELED: "Annulé",
  PAST_DUE: "Impayé",
  TRIALING: "Essai",
  INCOMPLETE: "Incomplet",
};
const PAYMENT_LABEL: Record<string, string> = { COMPLETED: "Payé", PENDING: "En attente", FAILED: "Échoué", REFUNDED: "Remboursé" };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPage();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      isBanned: true,
      createdAt: true,
      lastActiveAt: true,
      subscriptions: { select: { status: true, cancelAtPeriodEnd: true, currentPeriodEnd: true } },
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        take: 20,
        select: { id: true, enrolledAt: true, completedAt: true, course: { select: { title: true } } },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, amount: true, currency: true, status: true, createdAt: true, description: true },
      },
      _count: { select: { certificates: true, discussions: true, discussionReplies: true, reviews: true } },
    },
  });
  if (!user) notFound();

  const subscription = user.subscriptions;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground break-all">{user.email}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">{ROLE_LABEL[user.role] ?? user.role}</Badge>
            {isSubscriptionActive(subscription) && <Badge>Premium</Badge>}
            {user.isBanned && <Badge variant="destructive">Suspendu de la communauté</Badge>}
            {!user.emailVerified && <Badge variant="outline">E-mail non vérifié</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`mailto:${user.email}`}>Écrire à l&apos;utilisateur</a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/users">Retour à la liste</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Aperçu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {[
                ["Inscrit le", formatDateTime(user.createdAt)],
                ["Dernière activité", formatDateTime(user.lastActiveAt)],
                ["Certificats", String(user._count.certificates)],
                ["Discussions", String(user._count.discussions)],
                ["Réponses", String(user._count.discussionReplies)],
                ["Avis", String(user._count.reviews)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {subscription && (
              <p className="mt-4 text-sm">
                Abonnement : <strong>{SUBSCRIPTION_LABEL[subscription.status] ?? subscription.status}</strong>
                {subscription.currentPeriodEnd && (
                  <>
                    {" "}
                    — {subscription.cancelAtPeriodEnd ? "se termine" : "renouvelé"} le {formatDateTime(subscription.currentPeriodEnd)}
                  </>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Réglages du compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserAdminControls userId={user.id} role={user.role} isBanned={user.isBanned} isSelf={user.id === session.user.id} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Formations suivies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune inscription.</p>
            ) : (
              <ul className="divide-y text-sm">
                {user.enrollments.map((enrollment) => (
                  <li key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="font-medium">{enrollment.course.title}</span>
                    <span className="text-muted-foreground">
                      {enrollment.completedAt ? `Terminée le ${formatDateTime(enrollment.completedAt)}` : `Inscrit le ${formatDateTime(enrollment.enrolledAt)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Derniers paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun paiement.</p>
            ) : (
              <ul className="divide-y text-sm">
                {user.payments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <span className="font-medium">{formatMoney(Number(payment.amount), payment.currency)}</span>
                      <span className="text-muted-foreground"> — {payment.description ?? "Paiement"}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {PAYMENT_LABEL[payment.status] ?? payment.status} · {formatDateTime(payment.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
