import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { emailService } from "./email-service";
import { Role } from "@prisma/client";

// The placeholder only exists so "next build" can import this module without
// the runtime secret. A running production server must never use it: anyone
// could forge session cookies signed with a publicly known secret.
const isProductionRuntime =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

if (isProductionRuntime && !process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET must be set in production");
}

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "build-time-placeholder-secret-not-for-production",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  // Defence in depth only: this limiter reads the leftmost X-Forwarded-For entry,
  // so the real protection for sign-in and password flows is in
  // app/api/auth/[...all]/route.ts (trusted-proxy IP + per-email limits).
  rateLimit: { enabled: true, window: 60, max: 100 },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const template = emailService.passwordReset(
        user.name || "Utilisateur",
        url,
      );
      await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: Role.STUDENT,
        input: false, // hide from sign up form
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const template = emailService.emailVerification(
        user.name || "Utilisateur",
        url,
      );
      await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
export type User = SessionUser;
