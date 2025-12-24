import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { emailService } from "./email-service";
import { Role } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const template = emailService.passwordReset(user.name || "Utilisateur", url);
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
      const template = emailService.emailVerification(user.name || "Utilisateur", url);
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
