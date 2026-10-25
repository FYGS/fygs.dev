import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { paymentService } from "@/lib/payment-service";
import { stripe } from "@/lib/stripe";
import { SITE_BASE_URL } from "@/app/_lib/constants";
import { resolveRequestedPriceId } from "@/lib/subscription-pricing";
import { db } from "@/lib/db";
import { getEntitlement, isSubscriptionActive } from "@/lib/access/entitlement";
import { courseOffer } from "@/lib/access/offer";
import { PaymentKind, Prisma, SubscriptionPlan, SubscriptionStatus, PaymentStatus } from "@/lib/generated/prisma/browser";
import { createLogger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

const checkoutLogger = createLogger({ operation: "stripe-checkout", resourceType: "payment" });

const fail = (status: number, error: string, code: string) => NextResponse.json({ error, code }, { status });

/**
 * Starts a Stripe Checkout: a course bought on its own, or the Premium subscription. Refuses what cannot or must not
 * be paid: a free or unpublished course, a price under the Stripe minimum, a course the buyer already has (bought,
 * included in their subscription, offered), a second subscription.
 */
export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "checkout", { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return fail(401, "Connectez-vous pour continuer.", "UNAUTHORIZED");

    const body = (await req.json().catch(() => ({}))) as {
      courseId?: string;
      type?: string;
      priceId?: string;
    };
    const type = body.type ?? "course";
    const origin = SITE_BASE_URL.origin;
    checkoutLogger.info("Checkout initiated", { userId: session.user.id, metadata: { type, courseId: body.courseId } });

    if (type === "course") {
      if (!body.courseId) return fail(400, "Formation manquante.", "MISSING_COURSE");
      const course = await db.course.findUnique({
        where: { id: body.courseId },
        select: { id: true, slug: true, title: true, price: true, published: true, accessTier: true },
      });
      if (!course || !course.published) return fail(404, "Cette formation n’est pas disponible.", "COURSE_NOT_FOUND");

      const offer = courseOffer(course.accessTier, course.price);
      if (offer.kind === "free") return fail(400, "Cette formation est gratuite : inscrivez-vous sans payer.", "COURSE_IS_FREE");
      if (offer.price === null) {
        return fail(400, "Cette formation n’est pas vendue seule : elle est incluse dans l’abonnement Premium.", "NOT_FOR_SALE");
      }

      const entitlement = await getEntitlement({ id: session.user.id, role: session.user.role }, course.id);
      if (entitlement?.purchased) return fail(409, "Vous avez déjà acheté cette formation.", "ALREADY_PURCHASED");
      if (entitlement?.eligible || entitlement?.isStaff) {
        return fail(409, "Vous avez déjà accès à cette formation : inutile de l’acheter.", "ALREADY_ENTITLED");
      }

      const checkoutSession = await paymentService.createCheckoutSession({
        productId: course.id,
        userId: session.user.id,
        customerEmail: session.user.email,
        successUrl: `${origin}/fr/formations/${course.slug}?success=true`,
        cancelUrl: `${origin}/fr/formations/${course.slug}?canceled=true`,
      });

      // Pending row, completed (or dropped) by the webhook. Billing hides it once it is old and still pending.
      await db.payment
        .create({
          data: {
            userId: session.user.id,
            courseId: course.id,
            stripePaymentIntentId: checkoutSession.sessionId,
            amount: new Prisma.Decimal(offer.price.toFixed(2)),
            currency: "eur",
            status: PaymentStatus.PENDING,
            description: `Achat de la formation « ${course.title} »`,
            kind: PaymentKind.COURSE,
          },
        })
        .catch((error: unknown) =>
          checkoutLogger.error("Failed to create pending payment record", {
            userId: session.user.id,
            resourceId: checkoutSession.sessionId,
            metadata: { courseId: course.id, error: error instanceof Error ? error.message : String(error) },
          }),
        );

      return NextResponse.json({ url: checkoutSession.url });
    }

    if (type === "subscription") {
      const current = await db.subscription.findUnique({
        where: { userId: session.user.id },
        select: { status: true, cancelAtPeriodEnd: true },
      });
      if (isSubscriptionActive(current)) {
        return fail(
          409,
          current?.cancelAtPeriodEnd
            ? "Votre abonnement est déjà actif jusqu’à la fin de la période : réactivez-le depuis la page Facturation."
            : "Vous êtes déjà abonné à Premium.",
          current?.cancelAtPeriodEnd ? "SUBSCRIPTION_SCHEDULED_TO_END" : "ALREADY_SUBSCRIBED",
        );
      }

      if (current?.status === SubscriptionStatus.PAST_DUE) {
        return fail(
          409,
          "Le dernier paiement de votre abonnement a échoué : mettez à jour votre moyen de paiement depuis la page Facturation.",
          "SUBSCRIPTION_PAST_DUE",
        );
      }

      let mapped;
      try {
        mapped = resolveRequestedPriceId(body.priceId); // 'monthly' | 'yearly' or a configured price id
      } catch {
        return fail(400, "Formule d’abonnement inconnue.", "UNKNOWN_PLAN");
      }

      const subscriptionSession = await paymentService.createSubscriptionSession({
        userId: session.user.id,
        customerEmail: session.user.email,
        priceId: mapped.priceId,
        successUrl: `${origin}/fr/dashboard?subscription=success&cycle=${mapped.cycle}`,
        cancelUrl: `${origin}/fr/pricing?subscription=canceled`,
      });

      try {
        const priceInfo = await stripe.prices.retrieve(mapped.priceId);
        await db.payment.create({
          data: {
            userId: session.user.id,
            stripePaymentIntentId: subscriptionSession.sessionId,
            amount: new Prisma.Decimal(((priceInfo.unit_amount ?? 0) / 100).toFixed(2)),
            currency: priceInfo.currency || "eur",
            status: PaymentStatus.PENDING,
            description: `Abonnement Premium (${mapped.cycle === "yearly" ? "annuel" : "mensuel"})`,
            kind: PaymentKind.SUBSCRIPTION,
          },
        });
        await db.subscription.upsert({
          where: { userId: session.user.id },
          update: { status: SubscriptionStatus.INCOMPLETE, priceId: mapped.priceId, plan: SubscriptionPlan.PREMIUM },
          create: {
            userId: session.user.id,
            status: SubscriptionStatus.INCOMPLETE,
            plan: SubscriptionPlan.PREMIUM,
            priceId: mapped.priceId,
          },
        });
      } catch (error) {
        checkoutLogger.error("Failed to create pending subscription records", {
          userId: session.user.id,
          resourceId: subscriptionSession.sessionId,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      }

      return NextResponse.json({ url: subscriptionSession.url, priceId: mapped.priceId, cycle: mapped.cycle });
    }

    return fail(400, "Type de paiement inconnu.", "INVALID_TYPE");
  } catch (error) {
    checkoutLogger.error("Checkout error", { metadata: { error: error instanceof Error ? error.message : String(error) } });
    return fail(502, "Le paiement n’a pas pu démarrer. Réessayez dans un instant.", "CHECKOUT_FAILED");
  }
}
