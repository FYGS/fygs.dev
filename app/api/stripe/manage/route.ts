import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { paymentService } from '@/lib/payment-service';
import { emailService } from '@/lib/email-service';
import { Analytics } from '@/lib/analytics';
import { rateLimit, ensureIdempotent } from '@/lib/rate-limit';
import { resolveRequestedPriceId } from '@/lib/subscription-pricing';

// POST /api/stripe/manage
// Actions: switch_plan, cancel_at_period_end, cancel_immediately, refund_course
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json().catch(() => ({}));
  const { action, newPriceId, courseId, paymentIntentId, idempotencyKey } = body || {};

  // Rate limit: 10 sensitive actions per 5 minutes
  const rl = await rateLimit(`stripe-manage:${userId}`, 10, 300);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'RATE_LIMITED', reset: rl.reset }, { status: 429 });
  }

  // Idempotency (for state-changing actions)
  if (['switch_plan', 'cancel_at_period_end', 'cancel_immediately', 'refund_course'].includes(action)) {
    if (!idempotencyKey || !(await ensureIdempotent(`stripe-manage:${action}:${idempotencyKey}`))) {
      return NextResponse.json({ error: 'IDEMPOTENCY_VIOLATION' }, { status: 409 });
    }
  }

  try {
    const subscription = await db.subscription.findUnique({ where: { userId } });
    if (!subscription && action !== 'refund_course') {
      return NextResponse.json({ error: 'NO_SUBSCRIPTION' }, { status: 400 });
    }

    switch (action) {
      case 'switch_plan': {
        if (!newPriceId) return NextResponse.json({ error: 'MISSING_PRICE_ID' }, { status: 400 });
        if (!subscription?.stripeSubscriptionId) return NextResponse.json({ error: 'NO_SUBSCRIPTION_ID' }, { status: 400 });
        let mapped = { priceId: newPriceId, cycle: 'monthly' as 'monthly' | 'yearly' };
        try {
          // Support passing semantic cycle keywords or raw price id
          mapped = resolveRequestedPriceId(newPriceId);
        } catch { }
        await paymentService.switchSubscriptionPrice(subscription.stripeSubscriptionId, mapped.priceId);
        Analytics.subscriptionPlanSwitched(userId, { newPriceId: mapped.priceId, billingCycle: mapped.cycle });
        // Pull subscription from Stripe to get updated period end & price
        try {
          const [user, stripeSub] = await Promise.all([
            db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
            paymentService.getSubscription(subscription.stripeSubscriptionId)
          ]);
          if (user && stripeSub) {
            const priceUnit = (stripeSub.items.data[0]?.price?.unit_amount || 0) / 100;
            const interval = stripeSub.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
            const nextDate = (stripeSub as any).current_period_end ? new Date((stripeSub as any).current_period_end * 1000) : undefined;
            const formattedNext = nextDate ? new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).format(nextDate) : undefined;
            await emailService.sendSubscriptionPlanSwitchedEmail(
              user.name || 'Étudiant',
              user.email,
              'Premium',
              priceUnit,
              interval as any,
              formattedNext
            );
          }
        } catch (e) { console.warn('Plan switch email failed', e); }
        return NextResponse.json({ ok: true });
      }
      case 'cancel_at_period_end': {
        if (!subscription?.stripeSubscriptionId) return NextResponse.json({ error: 'NO_SUBSCRIPTION_ID' }, { status: 400 });
        await paymentService.cancelSubscription(subscription.stripeSubscriptionId);
        await db.subscription.update({ where: { userId }, data: { cancelAtPeriodEnd: true } });
        Analytics.subscriptionCanceledSoft(userId, { subscriptionId: subscription?.stripeSubscriptionId });
        try {
          const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
          if (user) await emailService.sendSubscriptionCanceledEmail(user.name || 'Étudiant', user.email);
        } catch { }
        return NextResponse.json({ ok: true });
      }
      case 'cancel_immediately': {
        if (!subscription?.stripeSubscriptionId) return NextResponse.json({ error: 'NO_SUBSCRIPTION_ID' }, { status: 400 });
        await paymentService.cancelImmediately(subscription.stripeSubscriptionId);
        await db.subscription.update({ where: { userId }, data: { status: 'CANCELED', currentPeriodEnd: new Date() } });
        Analytics.subscriptionCanceledImmediate(userId, { subscriptionId: subscription?.stripeSubscriptionId });
        try {
          const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
          if (user) await emailService.sendSubscriptionCanceledImmediateEmail(user.name || 'Étudiant', user.email);
        } catch { }
        return NextResponse.json({ ok: true });
      }
      case 'refund_course': {
        // Refund logic: ensure within 15-day grace period and enrollment exists
        if (!courseId || !paymentIntentId) return NextResponse.json({ error: 'MISSING_PARAMS' }, { status: 400 });
        const payment = await db.payment.findFirst({ where: { userId, stripePaymentIntentId: paymentIntentId } });
        if (!payment) return NextResponse.json({ error: 'PAYMENT_NOT_FOUND' }, { status: 404 });
        const ageMs = Date.now() - payment.createdAt.getTime();
        const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
        if (ageMs > FIFTEEN_DAYS_MS) return NextResponse.json({ error: 'REFUND_WINDOW_EXPIRED' }, { status: 400 });
        try {
          await paymentService.refundPayment(paymentIntentId);
          await db.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED' } });
          // Record refund in invoice audit log (type: REFUND_RECORD)
          try {
            if (db.invoiceAudit) {
              await db.invoiceAudit.create({
                data: {
                  userId,
                  stripeInvoiceId: paymentIntentId, // using payment intent as identifier
                  type: 'REFUND_RECORD',
                  amount: payment.amount, // stored as Decimal already
                }
              });
            }
          } catch (e) { console.warn('Failed to log refund audit', e); }
          Analytics.courseRefunded(userId, { courseId, paymentId: payment.id, amount: payment.amount.toNumber() });
          // Optionally remove enrollment (business choice). We'll keep progress but revoke access.
          await db.enrollment.delete({ where: { userId_courseId: { userId, courseId } } }).catch(()=>{});
          try {
            const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
            const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });
            if (user) await emailService.sendRefundIssuedEmail(user.name || 'Étudiant', user.email, course?.title, payment.amount.toNumber());
          } catch { }
          return NextResponse.json({ ok: true });
        } catch {
          return NextResponse.json({ error: 'REFUND_FAILED' }, { status: 500 });
        }
      }
      default:
        return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });
    }
  } catch (error) {
    console.error('Manage subscription error', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}