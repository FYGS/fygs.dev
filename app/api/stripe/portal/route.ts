import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { SITE_BASE_URL } from "@/app/_lib/constants";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const limited = await enforceRateLimit(await headers(), "checkout", {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          select: { stripeCustomerId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripeCustomerId = user.subscriptions?.stripeCustomerId;
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${SITE_BASE_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const limited = await enforceRateLimit(await headers(), "checkout", {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.redirect(`${SITE_BASE_URL}/auth/login`);
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          select: { stripeCustomerId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.redirect(
        `${SITE_BASE_URL}/dashboard/billing?error=user-not-found`
      );
    }

    const stripeCustomerId = user.subscriptions?.stripeCustomerId;
    if (!stripeCustomerId) {
      return NextResponse.redirect(
        `${SITE_BASE_URL}/dashboard/billing?error=no-subscription`
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${SITE_BASE_URL}/dashboard/billing`,
    });

    return NextResponse.redirect(portal.url);
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.redirect(
      `${SITE_BASE_URL}/dashboard/billing?error=portal-error`
    );
  }
}
