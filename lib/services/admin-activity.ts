import { db } from "@/lib/db";
import { PaymentStatus } from "@/lib/generated/prisma/browser";

export type AdminActivityType =
  | "user_registered"
  | "course_enrolled"
  | "payment_received"
  | "review_posted"
  | "certificate_issued";

export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string;
  userName: string;
  userImage: string | null;
  at: Date;
}

const person = { select: { name: true, image: true } } as const;

/**
 * The latest things that happened on the platform, read from the tables that own them
 * (users, enrollments, completed payments, reviews, certificates), newest first.
 * Each source is capped at `limit`, so the merged top `limit` is exact.
 */
export async function getRecentActivity(limit = 10): Promise<AdminActivity[]> {
  const [users, enrollments, payments, reviews, certificates] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, image: true, createdAt: true },
    }),
    db.enrollment.findMany({
      orderBy: { enrolledAt: "desc" },
      take: limit,
      select: { id: true, enrolledAt: true, user: person, course: { select: { title: true } } },
    }),
    db.payment.findMany({
      where: { status: PaymentStatus.COMPLETED },
      // A payment is created PENDING at checkout and settled by the webhook: updatedAt is the settlement
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        amount: true,
        currency: true,
        updatedAt: true,
        user: person,
        course: { select: { title: true } },
      },
    }),
    db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, rating: true, createdAt: true, user: person, course: { select: { title: true } } },
    }),
    db.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: limit,
      select: { id: true, issuedAt: true, user: person, course: { select: { title: true } } },
    }),
  ]);

  const activities: AdminActivity[] = [
    ...users.map((user) => ({
      id: `user:${user.id}`,
      type: "user_registered" as const,
      title: "Nouvel utilisateur",
      description: `${user.name} s'est inscrit(e)`,
      userName: user.name,
      userImage: user.image,
      at: user.createdAt,
    })),
    ...enrollments.map((enrollment) => ({
      id: `enrollment:${enrollment.id}`,
      type: "course_enrolled" as const,
      title: "Nouvelle inscription",
      description: `${enrollment.user.name} s'est inscrit(e) à '${enrollment.course.title}'`,
      userName: enrollment.user.name,
      userImage: enrollment.user.image,
      at: enrollment.enrolledAt,
    })),
    ...payments.map((payment) => ({
      id: `payment:${payment.id}`,
      type: "payment_received" as const,
      title: "Paiement reçu",
      description: `${Number(payment.amount).toFixed(2)} ${payment.currency.toUpperCase()} pour '${
        payment.course?.title ?? "Abonnement Premium"
      }'`,
      userName: payment.user.name,
      userImage: payment.user.image,
      at: payment.updatedAt,
    })),
    ...reviews.map((review) => ({
      id: `review:${review.id}`,
      type: "review_posted" as const,
      title: "Nouvel avis",
      description: `${review.rating}/5 sur '${review.course.title}'`,
      userName: review.user.name,
      userImage: review.user.image,
      at: review.createdAt,
    })),
    ...certificates.map((certificate) => ({
      id: `certificate:${certificate.id}`,
      type: "certificate_issued" as const,
      title: "Certificat délivré",
      description: `'${certificate.course.title}' complété`,
      userName: certificate.user.name,
      userImage: certificate.user.image,
      at: certificate.issuedAt,
    })),
  ];

  return activities.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

/** "Il y a 5min", relative to `now`; rendered on the server so the label cannot mismatch at hydration. */
export function formatTimeAgo(at: Date, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - at.getTime()) / 60_000));
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}
