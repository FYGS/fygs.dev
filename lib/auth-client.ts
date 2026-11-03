"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

// No baseURL: the client calls the origin it was loaded from. A URL fixed at
// build time (NEXT_PUBLIC_SITE_URL) breaks on any other host (previews, a www
// alias, local production runs): requests went to http://localhost:3000.
//
// The sign-in answer carries `twoFactorRedirect` when a second factor is due; the pages read it (see
// lib/auth-service.ts) instead of letting the plugin navigate, so the destination is always a path of this site.
export const authClient = createAuthClient({
  plugins: [twoFactorClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  changePassword,
  changeEmail,
  twoFactor,
} = authClient;
