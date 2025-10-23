/**
 * Utilitaires de sérialisation pour les données Prisma
 * Convertit les types Decimal, BigInt et Date en types sérialisables pour les Client Components
 */

import { SubscriptionStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Convertit un Decimal ou BigInt en number de façon sécurisée
 */
export function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  
  // Si c'est déjà un number
  if (typeof value === 'number') return value;
  
  // Si c'est un Decimal de Prisma
  if (value instanceof Decimal) return value.toNumber();
  
  // Si c'est un BigInt
  if (typeof value === 'bigint') return Number(value);
  
  // Si c'est un string qui représente un nombre
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Si c'est un objet avec une méthode toString (comme certains types de DB)
  if (typeof value === 'object' && value !== null && typeof value.toString === 'function') {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Fallback: essayer de convertir en number
  const converted = Number(value);
  return isNaN(converted) ? 0 : converted;
}

/**
 * Sérialise les données de revenus pour les composants client
 */
export function serializeRevenueData(data: Array<{
  month: Date;
  revenue: any;
  transactions: any;
  avg_order_value?: any;
}>): Array<{
  month: Date;
  revenue: number;
  transactions: number;
  avg_order_value: number;
}> {
  return data.map(item => ({
    month: item.month,
    revenue: safeNumber(item.revenue),
    transactions: safeNumber(item.transactions),
    avg_order_value: safeNumber(item.avg_order_value || (safeNumber(item.revenue) / safeNumber(item.transactions))),
  }));
}

/**
 * Sérialise les données de croissance utilisateurs
 */
export function serializeUserGrowthData(data: Array<{
  month: Date;
  new_users: any;
  total_users: any;
}>): Array<{
  month: Date;
  new_users: number;
  total_users: number;
}> {
  return data.map(item => ({
    month: item.month,
    new_users: safeNumber(item.new_users),
    total_users: safeNumber(item.total_users),
  }));
}

/**
 * Sérialise un cours avec ses relations
 */
export function serializeCourse(course: any) {
  return {
    ...course,
    price: safeNumber(course.price),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    enrollmentCount: course.enrollments?.length || 0,
    averageRating: course.reviews?.length > 0 
      ? course.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / course.reviews.length
      : 0,
    totalRevenue: 0, // À calculer séparément si nécessaire
  };
}

/**
 * Sérialise un utilisateur avec ses relations
 */
export function serializeUser(user: any) {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    enrollmentsCount: user.enrollments?.length || 0,
    totalSpent: user.payments?.reduce((sum: number, payment: any) => sum + safeNumber(payment.amount), 0) || 0,
    completedLessons: user.progress?.filter((p: any) => p.completed).length || 0,
    hasActiveSubscription: user.subscriptions?.some((sub: any) => sub.status === SubscriptionStatus.ACTIVE && !sub.cancelAtPeriodEnd) || false,
    lastEnrollment: user.enrollments?.length > 0
      ? user.enrollments.sort((a: any, b: any) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())[0].enrolledAt.toISOString()
      : null,
  };
}

/**
 * Sérialise les statistiques globales
 */
export function serializeStats(stats: {
  totalRevenue: { _sum: { amount: any } };
  monthlyRevenue: { _sum: { amount: any } };
  [key: string]: any;
}) {
  return {
    ...stats,
    totalRevenue: safeNumber(stats.totalRevenue._sum.amount),
    monthlyRevenue: safeNumber(stats.monthlyRevenue._sum.amount),
  };
}
