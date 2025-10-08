"use client";

import { SITE_BASE_URL } from "@/app/_lib/constants";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: SITE_BASE_URL.toString(),
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
