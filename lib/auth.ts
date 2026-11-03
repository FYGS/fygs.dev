import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession, twoFactor } from "better-auth/plugins";
import { db } from "./db";
import { emailService } from "./email-service";
import { Role } from "@/lib/generated/prisma/browser";
import { writeAudit } from "./audit";
import {
  effectiveRole,
  isStaffRole,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  sanitizeNewUser,
  sanitizeUserUpdate,
} from "./auth-policy";
import { mustRefuseSession } from "./auth-session-rules";
import { assertSecretStrength, getAppSecret, isProductionRuntime } from "./secret";

// A running production server with a missing, short or well-known secret does not start: anyone could forge the
// session cookies it signs. The build and the tests get a placeholder (see lib/secret.ts).
assertSecretStrength();

type AuthDatabase = Parameters<typeof betterAuth>[0]["database"];

/** `https://fygs.dev/anything` -> `https://fygs.dev`; null when the value is not a URL. */
function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Requests that are changing the e-mail address of their account (so the change can be audited once it is made). */
const emailChanges = new WeakSet<object>();

const TWO_FACTOR_PATHS = ["/two-factor/verify-totp", "/two-factor/verify-backup-code", "/two-factor/verify-otp"];

/** Writes the audit entry of a second-factor change once: enabling is recorded when the first code is confirmed. */
async function auditTwoFactor(userId: string, enabled: boolean): Promise<void> {
  const action = enabled ? "user.two_factor_enabled" : "user.two_factor_disabled";
  const last = await db.auditLog.findFirst({
    where: { targetType: "user", targetId: userId, action: { in: ["user.two_factor_enabled", "user.two_factor_disabled"] } },
    orderBy: { createdAt: "desc" },
    select: { action: true },
  });
  if (last?.action === action) return;
  await writeAudit({ actorId: userId, action, targetType: "user", targetId: userId });
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (user) {
      const template = emailService.twoFactorChanged(user.name || "Utilisateur", enabled);
      await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
    }
  } catch (error) {
    console.error("two-factor notice failed", error instanceof Error ? error.message : error);
  }
}

/** Notice sent to the address of an account after a sensitive change. Never blocks the change. */
async function noticeSecurityChange(user: { name?: string | null; email: string }): Promise<void> {
  try {
    await emailService.sendPasswordChangedEmail(
      user.name || "Utilisateur",
      user.email,
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date()),
    );
  } catch (error) {
    console.error("security notice failed", error instanceof Error ? error.message : error);
  }
}

/** Builds the auth instance; the database is injectable so tests can use an in-memory one. */
export function createAuth(database: AuthDatabase) {
  const baseURL = process.env.BETTER_AUTH_URL || undefined;
  // A production server accepts browser requests from its own public addresses only. In development the default
  // (the address of the request) keeps working on whatever port the developer picked.
  const trustedOrigins = isProductionRuntime()
    ? [...new Set([originOf(baseURL), originOf(process.env.NEXT_PUBLIC_SITE_URL)].filter((o): o is string => o !== null))]
    : [];

  const options = {
    secret: getAppSecret(),
    // Pinned: reset and verification links are built from this address, never from a request header
    baseURL,
    trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : undefined,
    database,
    // Defence in depth only: this limiter reads the leftmost X-Forwarded-For entry,
    // so the real protection for sign-in and password flows is in
    // app/api/auth/[...all]/route.ts (trusted-proxy IP + per-email limits).
    rateLimit: { enabled: true, window: 60, max: 100 },
    advanced: {
      useSecureCookies: baseURL?.startsWith("https://") ? true : undefined,
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" as const },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      // A password reset is what someone does when they fear a stolen session: it must end every session
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        const template = emailService.passwordReset(user.name || "Utilisateur", url);
        await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
      },
      onPasswordReset: async ({ user }) => {
        console.log(`Password for user ${user.id} has been reset.`);
        await noticeSecurityChange(user);
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
    account: {
      // A provider account is linked to an existing user only when the e-mail of that user is verified
      // (the default, written down so that nobody relaxes it by accident)
      accountLinking: { enabled: true, trustedProviders: [] as string[], allowDifferentEmails: false },
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
      changeEmail: {
        enabled: true,
        // Verified account: the request is approved from the CURRENT address first, then the new address confirms
        // itself (sendVerificationEmail below), so neither a stolen session nor a typo can move the account
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          const template = emailService.emailChangeConfirmation(user.name || "Utilisateur", newEmail, url);
          await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
        },
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 24, // the e-mail says 24 hours
      sendVerificationEmail: async ({ user, url }) => {
        const template = emailService.emailVerification(user.name || "Utilisateur", url);
        await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Whatever the sign-up route or the provider sends, the stored account is normalised
          before: async (user) => ({ data: sanitizeNewUser(user) }),
        },
        update: {
          before: async (data, context) => {
            const { data: clean, invalidName } = sanitizeUserUpdate(data);
            if (invalidName) {
              throw new APIError("BAD_REQUEST", { message: `Le nom doit contenir entre ${MIN_NAME_LENGTH} et ${MAX_NAME_LENGTH} caractères.` });
            }
            if (clean.email !== undefined && context) emailChanges.add(context);
            return { data: clean };
          },
          after: async (user, context) => {
            // The change is done: the person who confirmed it from their mailbox is the actor
            if (context && emailChanges.has(context)) {
              emailChanges.delete(context);
              await writeAudit({ actorId: user.id, action: "user.email_changed", targetType: "user", targetId: user.id });
            }
          },
        },
      },
      session: {
        create: {
          // An account with a second factor opens a session with its password and its code only (see auth-session-rules.ts)
          before: async (session, context) => {
            if (await mustRefuseSession(session.userId, context?.path)) return false;
          },
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // "Trust this device" skips the second factor for 30 days: never offered
        if (TWO_FACTOR_PATHS.includes(ctx.path) && (ctx.body as { trustDevice?: boolean } | undefined)?.trustDevice) {
          throw new APIError("BAD_REQUEST", { message: "La mémorisation de l'appareil n'est pas disponible." });
        }
        // Staff keep their second factor: it is what makes their role usable
        if (ctx.path === "/two-factor/disable") {
          const session = await getSessionFromCtx(ctx);
          const role = session ? (await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role : null;
          if (isStaffRole(role)) {
            throw new APIError("FORBIDDEN", { message: "Les comptes administrateur et formateur doivent garder la double authentification." });
          }
        }
      }),
      after: createAuthMiddleware(async (ctx) => {
        const returned = ctx.context.returned as unknown;
        if (!returned || returned instanceof Error || isAPIError(returned)) return;
        if (ctx.path === "/change-password") {
          const user = (returned as { user?: { name?: string | null; email?: string } }).user;
          if (user?.email) await noticeSecurityChange({ name: user.name, email: user.email });
          return;
        }
        if (ctx.path === "/two-factor/disable") {
          const session = await getSessionFromCtx(ctx);
          if (session) await auditTwoFactor(session.user.id, false);
          return;
        }
        if (ctx.path === "/two-factor/verify-totp") {
          // With a session, confirming a code is the end of the set-up; without one it is a sign-in challenge
          const session = await getSessionFromCtx(ctx);
          if (session) {
            const row = await db.user.findUnique({ where: { id: session.user.id }, select: { twoFactorEnabled: true } });
            if (row?.twoFactorEnabled) await auditTwoFactor(session.user.id, true);
          }
        }
      }),
    },
  } satisfies BetterAuthOptions;

  const withSecondFactor = {
    ...options,
    plugins: [
      twoFactor({
        issuer: "FYGS",
        totpOptions: { digits: 6, period: 30 },
        backupCodeOptions: { amount: 10, length: 10 },
      }),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth({
    ...withSecondFactor,
    plugins: [
      ...withSecondFactor.plugins,
      // Every part of the application reads the role from the session: a staff account that has not enrolled a second
      // factor is reported as a student until it has (lib/auth-policy.ts effectiveRole)
      customSession(async ({ user, session }) => {
        const { role, pendingStaffRole } = effectiveRole(user as { role?: string | null; twoFactorEnabled?: boolean | null });
        return { session, user: { ...user, role, pendingStaffRole } };
      }, withSecondFactor),
      // must stay last
      nextCookies(),
    ],
  });
}

export const auth = createAuth(
  prismaAdapter(db, {
    provider: "postgresql",
  }),
);

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
export type User = SessionUser;
