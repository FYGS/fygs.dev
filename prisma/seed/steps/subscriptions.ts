import {
  SubscriptionStatus,
  SubscriptionPlan,
  type PrismaClient,
  type User,
} from "../../../lib/generated/prisma/client";

/** Subscription scenarios (active, canceled, past due, free). */
export async function seedSubscriptions(
  prisma: PrismaClient,
  { students }: { students: User[] },
): Promise<void> {
  // 2. Create subscriptions with various statuses
  console.log("💳 Setting up subscription scenarios...");
  const subscriptionScenarios = [
    {
      userId: students[0].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.PREMIUM,
      stripeId: "sub_premium_alice",
    },
    {
      userId: students[1].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.PREMIUM,
      stripeId: "sub_premium_pierre",
    },
    {
      userId: students[2].id,
      status: SubscriptionStatus.CANCELED,
      plan: SubscriptionPlan.PREMIUM,
      stripeId: "sub_canceled_sophie",
    },
    {
      userId: students[3].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
    {
      userId: students[4].id,
      status: SubscriptionStatus.PAST_DUE,
      plan: SubscriptionPlan.PREMIUM,
      stripeId: "sub_pastdue_marie",
    },
    {
      userId: students[5].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
    {
      userId: students[6].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
    {
      userId: students[7].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.PREMIUM,
      stripeId: "sub_premium_emma",
    },
    {
      userId: students[8].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
    {
      userId: students[9].id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
  ];

  for (const sub of subscriptionScenarios) {
    await prisma.subscription.upsert({
      where: { userId: sub.userId },
      update: {},
      create: {
        userId: sub.userId,
        status: sub.status,
        plan: sub.plan,
        stripeCustomerId: sub.stripeId ? `cus_${sub.stripeId}` : undefined,
        stripeSubscriptionId: sub.stripeId,
        priceId:
          sub.plan === SubscriptionPlan.PREMIUM
            ? "price_premium_monthly"
            : undefined,
        currentPeriodStart:
          sub.plan === SubscriptionPlan.PREMIUM
            ? new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            : undefined,
        currentPeriodEnd:
          sub.plan === SubscriptionPlan.PREMIUM
            ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            : undefined,
      },
    });
  }
  console.log(
    `✅ Created ${subscriptionScenarios.length} subscription records`
  );
}
