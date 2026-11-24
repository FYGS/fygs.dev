import { isAdminHrefAvailable } from "./admin-routes";

/**
 * The back office menu. Each entry says who may open the page it points to: the sidebar and the quick actions only
 * show an instructor what an instructor can open (the pages themselves check again on the server).
 */

export type AdminRole = "ADMIN" | "INSTRUCTOR";

export interface AdminNavEntry {
  title: string;
  href: string;
  description: string;
  icon:
    | "dashboard"
    | "courses"
    | "questions"
    | "paths"
    | "tags"
    | "certificates"
    | "users"
    | "enrollments"
    | "analytics"
    | "payments"
    | "subscriptions"
    | "reviews"
    | "community";
  roles: readonly AdminRole[];
  /** Key of a counter shown next to the entry (things waiting for the user). */
  counter?: "questions";
}

const BOTH: readonly AdminRole[] = ["ADMIN", "INSTRUCTOR"];
const ADMIN: readonly AdminRole[] = ["ADMIN"];

export const ADMIN_NAVIGATION: readonly AdminNavEntry[] = [
  { title: "Vue d'ensemble", href: "/admin", description: "Ce qui demande votre attention", icon: "dashboard", roles: BOTH },
  { title: "Formations", href: "/admin/courses", description: "Créer, publier et suivre vos formations", icon: "courses", roles: BOTH },
  {
    title: "Questions des apprenants",
    href: "/admin/questions",
    description: "Répondre aux questions posées depuis les leçons",
    icon: "questions",
    roles: BOTH,
    counter: "questions",
  },
  { title: "Parcours", href: "/admin/paths", description: "Formations enchaînées vers un objectif", icon: "paths", roles: ADMIN },
  { title: "Tags", href: "/admin/tags", description: "Classer les formations", icon: "tags", roles: BOTH },
  { title: "Certificats", href: "/admin/certificates", description: "Certificats délivrés", icon: "certificates", roles: ADMIN },
  { title: "Utilisateurs", href: "/admin/users", description: "Comptes et rôles", icon: "users", roles: ADMIN },
  { title: "Inscriptions", href: "/admin/enrollments", description: "Toutes les inscriptions", icon: "enrollments", roles: ADMIN },
  { title: "Analytics", href: "/admin/analytics", description: "Rapports et exports", icon: "analytics", roles: ADMIN },
  { title: "Paiements", href: "/admin/payments", description: "Transactions", icon: "payments", roles: ADMIN },
  { title: "Abonnements", href: "/admin/subscriptions", description: "Formules Premium", icon: "subscriptions", roles: ADMIN },
  { title: "Avis", href: "/admin/reviews", description: "Modération des avis", icon: "reviews", roles: ADMIN },
  { title: "Communauté", href: "/admin/community", description: "Forum et discussions", icon: "community", roles: ADMIN },
];

const isAdminRole = (role: string): role is AdminRole => role === "ADMIN" || role === "INSTRUCTOR";

/** The entries a role may open, among the pages that exist. */
export function navigationFor(role: string): AdminNavEntry[] {
  if (!isAdminRole(role)) return [];
  return ADMIN_NAVIGATION.filter((entry) => entry.roles.includes(role) && isAdminHrefAvailable(entry.href));
}

/** Whether a role may open an admin page (the deepest menu entry that contains it decides). */
export function canOpenAdminHref(role: string, href: string): boolean {
  if (!isAdminRole(role)) return false;
  const entry = [...ADMIN_NAVIGATION]
    .filter((e) => href === e.href || (e.href !== "/admin" && href.startsWith(`${e.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!entry) return href === "/admin" || role === "ADMIN";
  return entry.roles.includes(role);
}
