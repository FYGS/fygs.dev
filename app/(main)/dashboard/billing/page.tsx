import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { isRefundEligible, getRefundDeadline } from "@/lib/refund-policy";
import { logger, createLogger } from "@/lib/structured-logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, AlertCircle, CheckCircle, Crown, Users, BookOpen, Clock, Star, Shield, Zap } from "lucide-react";
import { FadeIn, FadeInWhenVisible } from "@/components/ui/fade-in";
import Link from "next/link";
import { BillingActions } from "@/components/billing/billing-actions";
import { RefundButton } from "@/components/billing/refund-button";
import { getSubscriptionPrices, classifyBillingCycle } from "../../../../lib/subscription-pricing";
import { SubscriptionStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Facturation & Abonnement | FYGS Learning Platform",
  description: "Gérez votre abonnement Premium et vos paiements en toute sécurité.",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function getStatusBadge(status: string) {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Actif</Badge>;
    case SubscriptionStatus.CANCELED:
      return <Badge className="bg-red-100 text-red-800 border-red-200">✗ Annulé</Badge>;
    case SubscriptionStatus.PAST_DUE:
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚠ En retard</Badge>;
    case SubscriptionStatus.TRIALING:
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">🚀 Essai</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function BillingPage() {
  const correlationId = logger.generateCorrelationId();
  const billingLogger = createLogger({ 
    operation: 'billing-page-view',
    correlationId,
    resourceType: 'billing'
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  billingLogger.info("Billing page accessed", {
    userId: session.user.id
  });

  // Get user with subscription details and course stats
  const [user, enrolledCourseCount, totalCourseCount, invoiceAudits] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            cancelAtPeriodEnd: true,
            priceId: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            amount: true,
            status: true,
            description: true,
            createdAt: true,
            kind: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        }
      },
    }),
    db.enrollment.count({ where: { userId: session.user.id } }),
    db.course.count({ where: { published: true } }),
    db.invoiceAudit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, stripeInvoiceId: true, type: true, amount: true, createdAt: true }
    })
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const hasActiveSubscription = await AccessService.hasActiveSubscription(session.user.id);
  const subscription = user.subscriptions;
  const prices = getSubscriptionPrices();
  
  // Get billing cycle for display
  const billingCycle = subscription?.priceId ? classifyBillingCycle(subscription.priceId) : 'unknown';
  
  // Calculate refund eligibility for canceled subscriptions
  let refundInfo: { eligible: boolean; deadline?: Date; daysRemaining?: number } | null = null;
  if (subscription && subscription.currentPeriodStart) {
    const now = new Date();
    const eligible = isRefundEligible(subscription.currentPeriodStart, now);
    const deadline = getRefundDeadline(subscription.currentPeriodStart);
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    refundInfo = {
      eligible,
      deadline,
      daysRemaining
    };
  }
  
  // Only expose semantic identifiers to the client; raw Stripe IDs stay server-side
  const availablePrices = [
    prices.monthly ? { id: 'monthly', label: 'Mensuel', amount: 29 } : null,
    prices.yearly ? { id: 'yearly', label: 'Annuel (2 mois offerts)', amount: 290 } : null,
  ].filter(Boolean) as { id: string; label: string; amount: number }[];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-6xl mx-auto space-y-8 px-4">
        {/* Header */}
        <FadeIn>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Facturation & Abonnement
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gérez votre abonnement Premium, consultez vos paiements et optimisez votre expérience d&apos;apprentissage.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Subscription Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <FadeInWhenVisible delay={0.1}>
              <Card className={`relative overflow-hidden border-2 ${hasActiveSubscription ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50'}`}>
                {hasActiveSubscription && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Premium
                    </div>
                  </>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {hasActiveSubscription ? (
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-amber-100 to-yellow-100 ring-2 ring-amber-300">
                          <Crown className="h-6 w-6 text-amber-600" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <h3 className={`text-xl font-bold ${hasActiveSubscription ? 'text-amber-900' : 'text-gray-800'}`}>
                          {hasActiveSubscription ? `FYGS Premium - ${billingCycle === 'yearly' ? 'Annuel' : billingCycle === 'monthly' ? 'Mensuel' : 'Premium'}` : "Plan Gratuit"}
                        </h3>
                        <p className={`text-sm font-normal ${hasActiveSubscription ? 'text-amber-700' : 'text-muted-foreground'}`}>
                          {hasActiveSubscription ? (
                            billingCycle === 'yearly' 
                              ? "Plan annuel - Économisez 2 mois" 
                              : billingCycle === 'monthly' 
                                ? "Plan mensuel - Flexible" 
                                : "Accès illimité à toutes les formations"
                          ) : "Accès limité aux formations gratuites"}
                        </p>
                      </div>
                    </CardTitle>
                    {subscription && getStatusBadge(subscription.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {hasActiveSubscription && subscription ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/80 backdrop-blur-xs rounded-lg p-4 border border-amber-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-amber-900">Période actuelle</span>
                          </div>
                          <p className="text-sm text-amber-700">
                            Du {subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : 'N/A'}
                          </p>
                          <p className="text-sm text-amber-700">
                            Au {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'N/A'}
                          </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xs rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Avantages actifs</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-green-700">✓ Formations illimitées</p>
                            <p className="text-xs text-green-700">✓ Support prioritaire</p>
                            <p className="text-xs text-green-700">✓ Nouveautés exclusives</p>
                          </div>
                        </div>
                      </div>

                      {subscription.cancelAtPeriodEnd && (
                        <div className="space-y-4">
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-orange-900">Annulation programmée</h4>
                                <p className="text-sm text-orange-700 mt-1">
                                  Votre abonnement sera annulé le {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'fin de la période actuelle'}.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Refund Eligibility Display */}
                          {refundInfo && (
                            <div className={`rounded-lg p-4 border ${
                              refundInfo.eligible 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-start gap-3">
                                {refundInfo.eligible ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                ) : (
                                  <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                                )}
                                <div>
                                  <h4 className={`font-medium ${
                                    refundInfo.eligible ? 'text-green-900' : 'text-gray-900'
                                  }`}>
                                    {refundInfo.eligible ? 'Remboursement disponible' : 'Période de remboursement expirée'}
                                  </h4>
                                  <p className={`text-sm mt-1 ${
                                    refundInfo.eligible ? 'text-green-700' : 'text-gray-700'
                                  }`}>
                                    {refundInfo.eligible ? (
                                      refundInfo.daysRemaining && refundInfo.daysRemaining > 0 ? (
                                        `Vous pouvez demander un remboursement pendant encore ${refundInfo.daysRemaining} jour${refundInfo.daysRemaining > 1 ? 's' : ''}.`
                                      ) : (
                                        'Dernier jour pour demander un remboursement.'
                                      )
                                    ) : (
                                      `La période de remboursement de 14 jours a expiré le ${refundInfo.deadline ? formatDate(refundInfo.deadline) : 'N/A'}.`
                                    )}
                                  </p>
                                  {refundInfo.eligible && (
                                    <div className="mt-3">
                                      <RefundButton 
                                        subscriptionId={subscription.stripeSubscriptionId || ''}
                                        className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Link href="/dashboard">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Tableau de Bord
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/formations">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Explorer les formations
                          </Link>
                        </Button>
                      </div>
                      <div className="mt-6">
                        <BillingActions
                          currentPriceId={subscription.priceId}
                          currentCycle={billingCycle}
                          subscriptionStatus={subscription.status}
                          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                          // Provide semantic cycle identifiers with amounts for better UX
                          availablePrices={availablePrices}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="bg-linear-to-r from-amber-100 to-yellow-100 rounded-lg p-6 border border-amber-200">
                        <h4 className="font-semibold text-amber-900 mb-2">Passez à Premium</h4>
                        <p className="text-sm text-amber-800 mb-4">
                          Débloquez toutes les formations et bénéficiez d&apos;un accès illimité à notre catalogue complet.
                        </p>
                        <Button asChild className="bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                          <Link href="/pricing">
                            <Crown className="h-4 w-4 mr-2" />
                            Devenir Premium
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInWhenVisible>

            {/* Payment History */}
            {user.payments.length > 0 && (
              <FadeInWhenVisible delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Historique des paiements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium">
                              {payment.course ? (
                                `Achat Formation - ${payment.course.title}`
                              ) : payment.description ? (
                                payment.description
                              ) : (
                                payment.kind === 'SUBSCRIPTION' ? 'Abonnement Premium' : 'Paiement FYGS'
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{Number(payment.amount)}€</p>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {invoiceAudits.length > 0 && (
                      <div className="mt-6 border-t pt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">Ajustements & Prorations</h4>
                        {invoiceAudits.map(adj => (
                          <div key={adj.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
                            <div>
                              <p className="font-medium">
                                {adj.type === 'PRORATION' && 'Proration plan'}
                                {adj.type === 'REFUND_RECORD' && 'Remboursement'}
                                {adj.type !== 'PRORATION' && adj.type !== 'REFUND_RECORD' && adj.type}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(adj.createdAt)}</p>
                            </div>
                            <div className={`font-semibold ${(adj.amount?.toNumber() || 0) < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {adj.amount ? `${adj.amount.toNumber()}€` : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <FadeInWhenVisible delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques d&apos;utilisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <BookOpen className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">{enrolledCourseCount}</div>
                      <div className="text-xs text-muted-foreground">Formations suivies</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Star className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">{totalCourseCount}</div>
                      <div className="text-xs text-muted-foreground">Formations disponibles</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progression</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((enrolledCourseCount / totalCourseCount) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((enrolledCourseCount / totalCourseCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInWhenVisible>

            {/* Support */}
            <FadeInWhenVisible delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gestion abonnement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <BillingActions
                      currentPriceId={subscription.priceId}
                      currentCycle={billingCycle}
                      availablePrices={availablePrices}
                      subscriptionStatus={subscription.status}
                      cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun abonnement actif.</p>
                  )}
                </CardContent>
              </Card>
            </FadeInWhenVisible>

            {/* Support */}
            <FadeInWhenVisible delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Besoin d&apos;aide ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/contact">
                      <Zap className="h-4 w-4 mr-2" />
                      Contacter le support
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/terms">
                      <Shield className="h-4 w-4 mr-2" />
                      Conditions d&apos;utilisation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeInWhenVisible>
          </div>
        </div>
      </div>
    </div>
  );
}
