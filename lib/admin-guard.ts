import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/browser";
import { STAFF_TWO_FACTOR_SETUP_HREF } from "@/lib/staff-2fa";

/**
 * Server-side guard for the back-office pages that only an ADMIN may open (the user
 * directory, payments, subscriptions...). The admin layout lets instructors in, and the sidebar
 * only hides the entries: typing the URL must not be enough. Call it first in the page, before
 * any query.
 */
export async function requireAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=/admin");
  if (session.user.pendingStaffRole) redirect(STAFF_TWO_FACTOR_SETUP_HREF);
  if (session.user.role !== Role.ADMIN) redirect("/admin");
  return session;
}
