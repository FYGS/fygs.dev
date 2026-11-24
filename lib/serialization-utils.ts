/**
 * Utilitaires de sérialisation pour les données Prisma
 * Convertit les types Decimal, BigInt et Date en types sérialisables pour les Client Components
 */

import { Decimal } from "@prisma/client/runtime/client";

/**
 * Convertit un Decimal ou BigInt en number de façon sécurisée
 */
export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  // Si c'est déjà un number (NaN n'est pas sérialisable de façon utile : 0)
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;

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
  if (typeof value === 'object' && typeof value.toString === 'function') {
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
  revenue: unknown;
  transactions: unknown;
  avg_order_value?: unknown;
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
  new_users: unknown;
  total_users: unknown;
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
export function serializeCourse<
  T extends {
    price?: unknown;
    createdAt: Date;
    updatedAt: Date;
    enrollments?: unknown[] | null;
    reviews?: { rating: number }[] | null;
  },
>(
  course: T,
): Omit<T, "price" | "createdAt" | "updatedAt"> & {
  price: number;
  createdAt: string;
  updatedAt: string;
  enrollmentCount: number;
  averageRating: number;
  totalRevenue: number;
} {
  return {
    ...course,
    price: safeNumber(course.price),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    enrollmentCount: course.enrollments?.length || 0,
    averageRating: course.reviews && course.reviews.length > 0
      ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
      : 0,
    totalRevenue: 0, // À calculer séparément si nécessaire
  };
}
