import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AlertCircle, Crown, FileText, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSubscriptionActive } from "@/lib/access/entitlement";
import { courseRefundDecision, getRefundDeadline, isRefundEligible, REFUND_WINDOW_DAYS } from "@/lib/refund-policy";
import { classifyBillingCycle, getSubscriptionPrices } from "@/lib/subscription-pricing";
import { formatPrice } from "@/lib/price-format";
import { PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingActions } from "@/components/billing/billing-actions";
import { RefundButton } from "@/components/billing/refund-button";

export const metadata: Metadata = {
  title: "Facturation | FYGS",
  description: "Votre abonnement, vos achats de formations, vos reçus et vos remboursements.",
};

const date = (value: Date) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(value);
const money = (amount: { toString(): string } | number, currency: string) =>
  formatPrice(Number(amount), { currency, freeLabel: false });

const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" },
  TRIALING: { label: "Période d’essai", className: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200" },
  PAST_DUE: { label: "Paiement en échec", className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  CANCELED: { label: "Arrêté", className: "bg-muted text-foreground" },
  INCOMPLETE: { label: "Non finalisé", className: "bg-muted text-foreground" },
};

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; className: string }> = {
  COMPLETED: { label: "Payé", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" },
  REFUNDED: { label: "Remboursé", className: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200" },
  FAILED: { label: "Échec", className: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200" },
  PENDING: { label: "En cours", className: "bg-muted text-foreground" },
};

const AUDIT_LABELS: Record<string, string> = {
  PRORATION: "Prorata de changement de formule",
  REFUND_PROCESSED: "Remboursement",
  REFUND_RECORD: "Remboursement",
  CHARGE_REFUNDED: "Remboursement",
};

/** The moment the page is built, and the cut-off under which an unpaid checkout is no longer listed. */
function clock() {
  const now = new Date();
  return { now, dayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
}

const ERRORS: Record<string, string> = {
  receipt: "Le reçu de ce paiement n’est pas disponible pour le moment.",
  "no-subscription": "Aucun abonnement Stripe n’est associé à votre compte.",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=%2Ffr%2Fdashboard%2Fbilling");
  const userId = session.user.id;
  const { error } = await searchParams;

  const { now, dayAgo } = clock();
  const [subscription, payments, audits, certificates] = await Promise.all([
    db.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        cancelAtPeriodEnd: true,
        priceId: true,
      },
    }),
    db.payment.findMany({
      where: {
        userId,
        // A checkout left open and never paid is not a payment: hidden once it is a day old
        OR: [{ status: { not: PaymentStatus.PENDING } }, { createdAt: { gte: dayAgo } }],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        description: true,
        createdAt: true,
        kind: true,
        stripePaymentIntentId: true,
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
    db.invoiceAudit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, amount: true, currency: true, createdAt: true },
    }),
    db.certificate.findMany({ where: { userId }, select: { courseId: true } }),
  ]);

  const active = isSubscriptionActive(subscription);
  const cycle = classifyBillingCycle(subscription?.priceId ?? undefined);
  const prices = getSubscriptionPrices();
  const availableCycles = (["monthly", "yearly"] as const).filter((c) => Boolean(prices[c]));
  const subscriptionRefund =
    subscription?.status === SubscriptionStatus.ACTIVE && subscription.currentPeriodStart && subscription.stripeSubscriptionId
      ? {
          eligible: isRefundEligible(subscription.currentPeriodStart, now),
          deadline: getRefundDeadline(subscription.currentPeriodStart),
          subscriptionId: subscription.stripeSubscriptionId,
        }
      : null;

  const finished = new Set(certificates.map((c) => c.courseId));
  const purchases = payments.filter((p) => p.kind === PaymentKind.COURSE && p.course && p.status !== PaymentStatus.PENDING);
  const subscriptionPayments = payments.filter((p) => p.kind === PaymentKind.SUBSCRIPTION);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>
        <p className="text-muted-foreground">Votre abonnement, vos achats de formations, vos reçus et vos remboursements.</p>
      </div>

      {error && ERRORS[error] && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-50">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {ERRORS[error]}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle as="h2" className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
            {active ? `Premium ${cycle === "yearly" ? "annuel" : cycle === "monthly" ? "mensuel" : ""}`.trim() : "Abonnement"}
          </CardTitle>
          {subscription && (
            <Badge variant="secondary" className={SUBSCRIPTION_STATUS[subscription.status].className}>
              {SUBSCRIPTION_STATUS[subscription.status].label}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {active && subscription ? (
            <>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Période en cours</dt>
                  <dd className="font-medium">
                    {subscription.currentPeriodStart && subscription.currentPeriodEnd
                      ? `du ${date(subscription.currentPeriodStart)} au ${date(subscription.currentPeriodEnd)}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{subscription.cancelAtPeriodEnd ? "Fin de l’abonnement" : "Prochain prélèvement"}</dt>
                  <dd className="font-medium">{subscription.currentPeriodEnd ? date(subscription.currentPeriodEnd) : "—"}</dd>
                </div>
              </dl>
              {subscription.cancelAtPeriodEnd && (
                <p className="rounded-lg border bg-muted/40 p-3 text-sm">
                  L’arrêt est programmé : vous gardez Premium jusqu’au{" "}
                  {subscription.currentPeriodEnd ? date(subscription.currentPeriodEnd) : "terme de la période"}, sans nouveau prélèvement.
                </p>
              )}
              {subscriptionRefund && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
                  <p className="min-w-0 flex-1">
                    {subscriptionRefund.eligible
                      ? `Remboursement possible jusqu’au ${date(subscriptionRefund.deadline)} (${REFUND_WINDOW_DAYS} jours après le début de la période).`
                      : `Le délai de remboursement de ${REFUND_WINDOW_DAYS} jours s’est terminé le ${date(subscriptionRefund.deadline)}.`}
                  </p>
                  {subscriptionRefund.eligible && (
                    <RefundButton target={{ kind: "subscription", subscriptionId: subscriptionRefund.subscriptionId }} />
                  )}
                </div>
              )}
              <BillingActions
                subscriptionStatus={subscription.status}
                cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                currentCycle={cycle}
                availableCycles={availableCycles}
                periodEnd={subscription.currentPeriodEnd ? date(subscription.currentPeriodEnd) : null}
              />
            </>
          ) : subscription?.status === SubscriptionStatus.PAST_DUE ? (
            <div className="space-y-3 text-sm">
              <p>Le dernier prélèvement a échoué : mettez à jour votre moyen de paiement pour garder Premium.</p>
              <BillingActions subscriptionStatus={subscription.status} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                Vous n’avez pas d’abonnement en cours. Premium ouvre toutes les formations Premium du catalogue.
              </p>
              <Button asChild>
                <Link href="/pricing">Voir les formules</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" aria-hidden /> Formations achetées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun achat. Chaque formation Premium peut s’acheter à l’unité, avec un accès à vie, depuis sa page.
            </p>
          ) : (
            <ul className="divide-y">
              {purchases.map((payment) => {
                const decision =
                  payment.status === PaymentStatus.COMPLETED && payment.stripePaymentIntentId?.startsWith("pi_")
                    ? courseRefundDecision({
                        purchasedAt: payment.createdAt,
                        amount: Number(payment.amount),
                        completed: finished.has(payment.course!.id),
                        now,
                      })
                    : null;
                return (
                  <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/formations/${payment.course!.slug}`} className="font-medium hover:underline">
                        {payment.course!.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {date(payment.createdAt)} · {money(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <Badge variant="secondary" className={PAYMENT_STATUS[payment.status].className}>
                      {PAYMENT_STATUS[payment.status].label}
                    </Badge>
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/api/stripe/receipt?paymentId=${payment.id}`} target="_blank" rel="noopener noreferrer">
                        <Receipt className="mr-1 h-4 w-4" aria-hidden /> Reçu<span className="sr-only"> de {payment.course!.title}</span>
                      </a>
                    </Button>
                    {decision?.refundable && (
                      <RefundButton target={{ kind: "course", paymentId: payment.id, courseTitle: payment.course!.title }} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Une formation achetée se rembourse sur demande pendant {REFUND_WINDOW_DAYS} jours, tant qu’elle n’est pas terminée.
          </p>
        </CardContent>
      </Card>

      {(subscriptionPayments.length > 0 || audits.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2 text-xl">
              <Receipt className="h-5 w-5" aria-hidden /> Paiements de l’abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscriptionPayments.length > 0 && (
              <ul className="divide-y">
                {subscriptionPayments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{payment.description ?? "Abonnement Premium"}</p>
                      <p className="text-sm text-muted-foreground">
                        {date(payment.createdAt)} · {money(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <Badge variant="secondary" className={PAYMENT_STATUS[payment.status].className}>
                      {PAYMENT_STATUS[payment.status].label}
                    </Badge>
                    {(payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={`/api/stripe/receipt?paymentId=${payment.id}`} target="_blank" rel="noopener noreferrer">
                          <Receipt className="mr-1 h-4 w-4" aria-hidden /> Facture
                          <span className="sr-only"> du {date(payment.createdAt)}</span>
                        </a>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {audits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Ajustements</h3>
                <ul className="space-y-2">
                  {audits.map((audit) => (
                    <li key={audit.id} className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-2 text-sm">
                      <span>
                        {AUDIT_LABELS[audit.type] ?? "Ajustement"} · {date(audit.createdAt)}
                      </span>
                      <span className="font-medium">{audit.amount ? money(audit.amount, audit.currency ?? "eur") : "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">
        Une question sur un paiement ? <Link href="/contact" className="underline">Contactez-nous</Link> ·{" "}
        <Link href="/terms" className="underline">Conditions d’utilisation</Link>
      </p>
    </div>
  );
}
