"use client";

import { createAuthClient } from "better-auth/react";

// No baseURL: the client calls the origin it was loaded from. A URL fixed at
// build time (NEXT_PUBLIC_SITE_URL) breaks on any other host (previews, a www
// alias, local production runs): requests went to http://localhost:3000.
export const authClient = createAuthClient({
  plugins: [],
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
} = authClient;
