/**
 * Utilitaires de validation des données pour les composants admin
 * Assure la cohérence et la sécurité des données avant rendu
 */

import { safeNumber } from "./serialization-utils";

/**
 * Valide et nettoie les données de revenus
 */
export function validateRevenueData(data: any[]): Array<{
  month: Date;
  revenue: number;
  transactions: number;
  avg_order_value: number;
}> {
  if (!Array.isArray(data)) {
    console.warn("Revenue data is not an array, returning empty array");
    return [];
  }

  return data
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const revenue = safeNumber(item.revenue);
      const transactions = safeNumber(item.transactions);
      
      return {
        month: item.month instanceof Date ? item.month : new Date(item.month || Date.now()),
        revenue,
        transactions,
        avg_order_value: transactions > 0 ? revenue / transactions : 0,
      };
    })
    .filter(item => !isNaN(item.month.getTime())); // Filtrer les dates invalides
}

/**
 * Valide et nettoie les données de croissance utilisateurs
 */
export function validateUserGrowthData(data: any[]): Array<{
  month: Date;
  new_users: number;
  total_users: number;
}> {
  if (!Array.isArray(data)) {
    console.warn("User growth data is not an array, returning empty array");
    return [];
  }

  return data
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      month: item.month instanceof Date ? item.month : new Date(item.month || Date.now()),
      new_users: safeNumber(item.new_users),
      total_users: safeNumber(item.total_users),
    }))
    .filter(item => !isNaN(item.month.getTime()));
}

/**
 * Valide et nettoie les données de cours
 */
export function validateCourseData(courses: any[]): Array<{
  id: string;
  title: string;
  slug: string;
  price: number;
  level: string;
  category: string;
  enrollmentCount: number;
  averageRating: number;
  totalRevenue: number;
}> {
  if (!Array.isArray(courses)) {
    console.warn("Courses data is not an array, returning empty array");
    return [];
  }

  return courses
    .filter(course => course && typeof course === 'object' && course.id && course.title)
    .map(course => ({
      id: String(course.id),
      title: String(course.title || 'Cours sans titre'),
      slug: String(course.slug || ''),
      price: safeNumber(course.price),
      level: String(course.level || 'BEGINNER'),
      category: String(course.category || 'GENERAL'),
      enrollmentCount: safeNumber(course.enrollmentCount),
      averageRating: Math.max(0, Math.min(5, safeNumber(course.averageRating))), // Entre 0 et 5
      totalRevenue: safeNumber(course.totalRevenue),
    }));
}

/**
 * Valide et nettoie les données utilisateurs
 */
export function validateUserData(users: any[]): Array<{
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  enrollmentsCount: number;
  totalSpent: number;
  completedLessons: number;
  hasActiveSubscription: boolean;
  lastEnrollment: string | null;
}> {
  if (!Array.isArray(users)) {
    console.warn("Users data is not an array, returning empty array");
    return [];
  }

  return users
    .filter(user => user && typeof user === 'object' && user.id && user.email)
    .map(user => ({
      id: String(user.id),
      name: String(user.name || 'Utilisateur'),
      email: String(user.email),
      role: String(user.role || 'STUDENT'),
      image: user.image ? String(user.image) : null,
      createdAt: user.createdAt instanceof Date 
        ? user.createdAt.toISOString() 
        : String(user.createdAt || new Date().toISOString()),
      enrollmentsCount: safeNumber(user.enrollmentsCount),
      totalSpent: safeNumber(user.totalSpent),
      completedLessons: safeNumber(user.completedLessons),
      hasActiveSubscription: Boolean(user.hasActiveSubscription),
      lastEnrollment: user.lastEnrollment ? String(user.lastEnrollment) : null,
    }));
}

/**
 * Valide les données de conversion
 */
export function validateConversionData(data: any): {
  visitors: number;
  signups: number;
  enrollments: number;
  purchases: number;
  certificates: number;
} {
  if (!data || typeof data !== 'object') {
    console.warn("Conversion data is invalid, returning default values");
    return {
      visitors: 0,
      signups: 0,
      enrollments: 0,
      purchases: 0,
      certificates: 0,
    };
  }

  return {
    visitors: safeNumber(data.visitors),
    signups: safeNumber(data.signups),
    enrollments: safeNumber(data.enrollments),
    purchases: safeNumber(data.purchases),
    certificates: safeNumber(data.certificates),
  };
}

/**
 * Valide les statistiques globales
 */
export function validateOverviewStats(stats: any): {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyUsers: number;
  monthlyEnrollments: number;
} {
  if (!stats || typeof stats !== 'object') {
    console.warn("Overview stats are invalid, returning default values");
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      monthlyUsers: 0,
      monthlyEnrollments: 0,
    };
  }

  return {
    totalRevenue: safeNumber(stats.totalRevenue),
    monthlyRevenue: safeNumber(stats.monthlyRevenue),
    monthlyUsers: safeNumber(stats.monthlyUsers),
    monthlyEnrollments: safeNumber(stats.monthlyEnrollments),
  };
}
