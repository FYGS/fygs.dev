import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { SITE_BASE_URL } from "@/app/_lib/constants";
import { PaymentStatus } from "@/lib/generated/prisma/browser";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createLogger } from "@/lib/structured-logger";

const back = (error: string) => NextResponse.redirect(new URL(`/fr/dashboard/billing?error=${error}`, SITE_BASE_URL));

/**
 * GET /api/stripe/receipt?paymentId=… : opens the Stripe receipt (or the invoice of a subscription payment) of one
 * of the signed-in user's payments. Nothing is stored: the payment's Stripe reference leads to the document.
 */
export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "read", { limit: 30, windowSeconds: 60 });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(new URL("/fr/auth/login?callbackUrl=%2Ffr%2Fdashboard%2Fbilling", SITE_BASE_URL));

  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) return back("receipt");
  const payment = await db.payment.findFirst({
    where: { id: paymentId, userId: session.user.id, status: { in: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED] } },
    select: { stripePaymentIntentId: true },
  });
  const reference = payment?.stripePaymentIntentId;
  if (!reference) return back("receipt");

  try {
    let url: string | null | undefined = null;
    if (reference.startsWith("pi_")) {
      const intent = await stripe.paymentIntents.retrieve(reference, { expand: ["latest_charge"] });
      const charge = intent.latest_charge as Stripe.Charge | string | null;
      url = typeof charge === "object" && charge ? charge.receipt_url : null;
    } else if (reference.startsWith("in_")) {
      const invoice = await stripe.invoices.retrieve(reference);
      url = invoice.hosted_invoice_url ?? invoice.invoice_pdf;
    }
    if (!url) return back("receipt");
    return NextResponse.redirect(url);
  } catch (error) {
    createLogger({ operation: "stripe-receipt", resourceType: "payment" }).error("Receipt lookup failed", {
      userId: session.user.id,
      resourceId: paymentId,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return back("receipt");
  }
}
