/**
 * Admin pages that exist. The sidebar and the quick actions only link to these:
 * a link to a page that is not built yet is a 404 inside the back office.
 * tests/unit/admin-routes.test.ts checks that every entry has a page.tsx and that
 * no admin component links to something that is not listed.
 */
export const AVAILABLE_ADMIN_ROUTES = [
  "/admin",
  "/admin/courses",
  "/admin/courses/new",
  "/admin/questions",
  "/admin/tags",
  "/admin/paths",
  "/admin/paths/new",
  "/admin/users",
  "/admin/payments",
  "/admin/subscriptions",
  "/admin/enrollments",
  "/admin/certificates",
  "/admin/analytics",
  "/admin/reviews",
  "/admin/community",
] as const;

const available = new Set<string>(AVAILABLE_ADMIN_ROUTES);

/** Non-admin links (public site) are always available. */
export function isAdminHrefAvailable(href: string): boolean {
  if (href !== "/admin" && !href.startsWith("/admin/")) return true;
  return available.has(href);
}
