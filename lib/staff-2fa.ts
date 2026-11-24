/**
 * Staff (ADMIN, INSTRUCTOR) must use a second factor. Until a staff account has enrolled one, the session reports it as a
 * student (`pendingStaffRole` carries the real role, see lib/auth-policy.ts) and every staff page sends it to the set-up page.
 */
export const STAFF_TWO_FACTOR_SETUP_HREF = "/profile/security?required=1";
