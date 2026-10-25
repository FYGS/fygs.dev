import { CourseAccessTier } from "@/lib/generated/prisma/browser";
import { MIN_COURSE_PRICE_EUR, formatPrice } from "@/lib/price-format";
import type { CourseEntitlement, LapsedReason } from "./entitlement";

/**
 * What a course offers and where the viewer stands, as every screen shows it (catalog card, home page, course page,
 * paths). Pure: built from the course fields and the viewer's entitlement (`lib/access/entitlement.ts`).
 */

export type CourseOffer =
  | { kind: "free" }
  /** `price` null: the course cannot be bought on its own (no valid price), only the subscription opens it. */
  | { kind: "premium"; price: number | null };

export function courseOffer(tier: CourseAccessTier | string, price: number | string | { toString(): string } | null | undefined): CourseOffer {
  if (tier !== CourseAccessTier.PREMIUM) return { kind: "free" };
  const value = Number(price ?? 0);
  return { kind: "premium", price: Number.isFinite(value) && value >= MIN_COURSE_PRICE_EUR ? value : null };
}

/** "Gratuite", "49,99 €", "Inclus dans Premium". */
export function offerPriceLabel(offer: CourseOffer): string {
  if (offer.kind === "free") return "Gratuite";
  return offer.price === null ? "Inclus dans Premium" : formatPrice(offer.price, { freeLabel: false });
}

export type ViewerStatus =
  /** Nothing yet: discover, enrol or buy. */
  | "none"
  /** Enrolled in a free course. */
  | "enrolled"
  /** Bought for life. */
  | "purchased"
  /** Open through the subscription (enrolled or one click away). */
  | "subscription"
  /** Access given by an administrator. */
  | "granted"
  /** Enrolled, the right ended. */
  | "lapsed"
  /** Author or administrator. */
  | "staff";

export function viewerStatus(entitlement: CourseEntitlement | null | undefined): ViewerStatus {
  if (!entitlement) return "none";
  if (entitlement.lapsed) return "lapsed";
  switch (entitlement.source) {
    case "grant":
      return "granted";
    case "purchase":
      return "purchased";
    case "subscription":
      return "subscription";
    case "free":
      return entitlement.enrolled ? "enrolled" : "none";
    case "staff":
      return "staff";
    default:
      return "none";
  }
}

export const VIEWER_STATUS_LABELS: Record<Exclude<ViewerStatus, "none">, string> = {
  enrolled: "Inscrit",
  purchased: "Acheté",
  subscription: "Inclus dans votre abonnement",
  granted: "Accès offert",
  lapsed: "Accès expiré",
  staff: "Votre formation",
};

export const LAPSED_REASON_TEXT: Record<LapsedReason, { title: string; body: string }> = {
  subscription_ended: {
    title: "Votre abonnement n’est plus actif",
    body: "Réabonnez-vous ou achetez la formation pour la reprendre là où vous l’avez laissée : votre progression est conservée.",
  },
  refunded: {
    title: "Votre achat a été remboursé",
    body: "L’accès s’est arrêté avec le remboursement. Votre progression est conservée si vous rachetez la formation ou vous abonnez.",
  },
  premium_required: {
    title: "Cette formation est désormais Premium",
    body: "Elle est maintenant réservée aux abonnés et aux acheteurs. Votre progression est conservée.",
  },
};

export type PrimaryActionKind = "continue" | "start" | "renew" | "enroll" | "discover";

export const PRIMARY_ACTION_LABELS: Record<PrimaryActionKind, string> = {
  continue: "Continuer",
  start: "Commencer",
  renew: "Reprendre l’accès",
  enroll: "S’inscrire",
  discover: "Découvrir",
};

/** Where the main button of a card leads: the learning area when open, the course page otherwise. */
export function primaryAction(
  slug: string,
  entitlement: CourseEntitlement | null | undefined,
  offer: CourseOffer,
): { href: string; kind: PrimaryActionKind } {
  if (entitlement?.entitled) return { href: `/learn/${slug}`, kind: "continue" };
  if (entitlement?.eligible) return { href: `/formations/${slug}`, kind: "start" };
  if (entitlement?.lapsed) return { href: `/formations/${slug}`, kind: "renew" };
  return { href: `/formations/${slug}`, kind: offer.kind === "free" ? "enroll" : "discover" };
}
