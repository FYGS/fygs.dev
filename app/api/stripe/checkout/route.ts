import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { paymentService } from "@/lib/payment-service";
import { SITE_BASE_URL } from "@/app/_lib/constants";
import { resolveRequestedPriceId } from '@/lib/subscription-pricing';


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, slug, type = "course", priceId: bodyPriceId } = await req.json();

    if (type === "course" && (!courseId || !slug)) {
      return NextResponse.json({ error: "Missing courseId or slug" }, { status: 400 });
    }

    const origin = SITE_BASE_URL;

    if (type === "course") {
      // One-time course purchase
      const checkoutSession = await paymentService.createCheckoutSession({
        productId: courseId,
        userId: session.user.id,
        customerEmail: session.user.email,
        successUrl: `${origin}/formations/${slug}?success=true`,
        cancelUrl: `${origin}/formations/${slug}?canceled=true`,
      });

      return NextResponse.json({ url: checkoutSession.url });
    } else if (type === "subscription") {
      let mapped;
      try {
        mapped = resolveRequestedPriceId(bodyPriceId); // supports semantic 'monthly' | 'yearly' or raw IDs
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
      }

      const subscriptionSession = await paymentService.createSubscriptionSession({
        userId: session.user.id,
        customerEmail: session.user.email,
        priceId: mapped.priceId,
        successUrl: `${origin}/dashboard?subscription=success&cycle=${mapped.cycle}`,
        cancelUrl: `${origin}/dashboard?subscription=canceled`,
      });

      return NextResponse.json({ url: subscriptionSession.url, priceId: mapped.priceId, cycle: mapped.cycle });
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
