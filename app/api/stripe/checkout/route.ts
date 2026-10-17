import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { paymentService } from "@/lib/payment-service";
import { stripe } from "@/lib/stripe";
import { SITE_BASE_URL } from "@/app/_lib/constants";
import { resolveRequestedPriceId } from "@/lib/subscription-pricing";
import { db } from "@/lib/db";
import {
  PaymentKind,
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentStatus,
} from "@/lib/generated/prisma/browser";
import { createLogger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

const checkoutLogger = createLogger({
  operation: "stripe-checkout",
  resourceType: "payment",
});

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "checkout", {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      courseId,
      slug,
      type = "course",
      priceId: bodyPriceId,
    } = await req.json();
    checkoutLogger.info("Checkout initiated", {
      userId: session.user.id,
      metadata: { type, courseId, slug },
    });

    if (type === "course" && (!courseId || !slug)) {
      return NextResponse.json(
        { error: "Missing courseId or slug" },
        { status: 400 }
      );
    }

    const origin = SITE_BASE_URL.origin;

    if (type === "course") {
      // Get course details for accurate price
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { title: true, price: true },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      // One-time course purchase
      const checkoutSession = await paymentService.createCheckoutSession({
        productId: courseId,
        userId: session.user.id,
        customerEmail: session.user.email,
        successUrl: `${origin}/formations/${slug}?success=true`,
        cancelUrl: `${origin}/formations/${slug}?canceled=true`,
      });

      // Create pending payment record (will be updated by webhook)
      try {
        await db.payment.create({
          data: {
            userId: session.user.id,
            courseId: courseId,
            stripePaymentIntentId: checkoutSession.sessionId, // Will be updated by webhook
            amount: course.price || new Prisma.Decimal(0),
            currency: "eur",
            status: PaymentStatus.PENDING,
            description: `Achat formation: ${course.title}`,
            kind: PaymentKind.COURSE,
          },
        });

        checkoutLogger.info("Pending payment record created", {
          userId: session.user.id,
          resourceId: checkoutSession.sessionId,
          metadata: { courseId },
        });
      } catch (error) {
        checkoutLogger.error("Failed to create pending payment record", {
          userId: session.user.id,
          resourceId: checkoutSession.sessionId,
          metadata: {
            courseId,
            error: error instanceof Error ? error.message : String(error),
          },
        });
        // Continue - don't block checkout for this
      }

      return NextResponse.json({ url: checkoutSession.url });
    } else if (type === "subscription") {
      let mapped;
      try {
        mapped = resolveRequestedPriceId(bodyPriceId); // supports semantic 'monthly' | 'yearly' or raw IDs
      } catch (e) {
        return NextResponse.json(
          { error: (e as Error).message },
          { status: 400 }
        );
      }

      const subscriptionSession =
        await paymentService.createSubscriptionSession({
          userId: session.user.id,
          customerEmail: session.user.email,
          priceId: mapped.priceId,
          successUrl: `${origin}/dashboard?subscription=success&cycle=${mapped.cycle}`,
          cancelUrl: `${origin}/dashboard?subscription=canceled`,
        });

      // Create or update subscription record (will be completed by webhook)
      try {
        // Get price from Stripe
        const priceInfo = await stripe.prices.retrieve(mapped.priceId);
        const amount = priceInfo.unit_amount ? priceInfo.unit_amount / 100 : 0;

        // Create pending payment record
        await db.payment.create({
          data: {
            userId: session.user.id,
            stripePaymentIntentId: subscriptionSession.sessionId,
            amount: new Prisma.Decimal(amount),
            currency: priceInfo.currency || "eur",
            status: PaymentStatus.PENDING, // Will be updated to COMPLETED by webhook
            description: `Abonnement Premium (${
              mapped.cycle === "yearly" ? "annuel" : "mensuel"
            })`,
            kind: PaymentKind.SUBSCRIPTION,
          },
        });

        // Create or update subscription record. A member who already has access
        // keeps it while a second checkout is open (or abandoned): flipping the row to
        // INCOMPLETE would lock them out of a subscription they paid for.
        const current = await db.subscription.findUnique({
          where: { userId: session.user.id },
          select: { status: true },
        });
        const keepsAccess =
          current?.status === SubscriptionStatus.ACTIVE ||
          current?.status === SubscriptionStatus.TRIALING;
        if (!keepsAccess) {
          await db.subscription.upsert({
            where: { userId: session.user.id },
            update: {
              status: SubscriptionStatus.INCOMPLETE, // Will be updated to ACTIVE by webhook
              priceId: mapped.priceId,
              plan: SubscriptionPlan.PREMIUM,
            },
            create: {
              userId: session.user.id,
              status: SubscriptionStatus.INCOMPLETE, // Will be updated to ACTIVE by webhook
              plan: SubscriptionPlan.PREMIUM,
              priceId: mapped.priceId,
            },
          });
        }

        checkoutLogger.info("Pending subscription records created", {
          userId: session.user.id,
          resourceId: subscriptionSession.sessionId,
          metadata: { cycle: mapped.cycle, priceId: mapped.priceId },
        });
      } catch (error) {
        checkoutLogger.error("Failed to create pending subscription records", {
          userId: session.user.id,
          resourceId: subscriptionSession.sessionId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        // Continue - don't block checkout for this
      }

      return NextResponse.json({
        url: subscriptionSession.url,
        priceId: mapped.priceId,
        cycle: mapped.cycle,
      });
    }

    return NextResponse.json(
      { error: "Invalid payment type" },
      { status: 400 }
    );
  } catch (error) {
    checkoutLogger.error("Checkout error", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
