import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";
import { createLogger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isSubscriptionActive } from "@/lib/access/entitlement";
import { cleanName, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from "@/lib/auth-policy";
import { eraseAccount, erasureBlocker } from "@/lib/account-erasure";
import { emailService } from "@/lib/email-service";

// Only the name can be changed here. The e-mail address moves through better-auth's change-email flow (confirmation
// from the current address, then from the new one): accepting it in this body let any session take over an address.
const updateProfileSchema = z
  .object({
    name: z
      .string()
      // refused as sent, not silently cut: a 5000-character name is not a name
      .max(MAX_NAME_LENGTH, `Le nom doit contenir au plus ${MAX_NAME_LENGTH} caractères`)
      .transform((value) => cleanName(value))
      .pipe(z.string().min(MIN_NAME_LENGTH, `Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères`)),
  })
  .strict();

export async function PATCH(req: NextRequest) {
  const limited = await enforceRateLimit(req, "profile-write", {
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { name: validatedData.name },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    const apiLogger = createLogger({
      operation: "profile-update-api",
      resourceType: "api",
    });
    apiLogger.error(
      "Profile update error",
      {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      },
      error instanceof Error ? error : new Error(String(error))
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

const CONFIRMATION_WORD = "SUPPRIMER";
/** A provider-only account (no password) must have signed in this recently to erase itself. */
const RECENT_SIGN_IN_MS = 10 * 60 * 1000;

const deleteAccountSchema = z
  .object({
    confirmation: z.string(),
    password: z.string().max(128).optional(),
    code: z.string().max(24).optional(),
  })
  .strict();

/**
 * Erases the signed-in account (GDPR art. 17). The person proves who they are again: the password when the account
 * has one, the second-factor code when it is on, a sign-in from the last minutes otherwise.
 */
export async function DELETE(req: NextRequest) {
  const limited = await enforceRateLimit(req, "profile-delete", { limit: 5, windowSeconds: 3600, failMode: "closed" });
  if (limited) return limited;

  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const parsed = deleteAccountSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.confirmation.trim() !== CONFIRMATION_WORD) {
    return NextResponse.json({ error: `Saisissez « ${CONFIRMATION_WORD} » pour confirmer.` }, { status: 400 });
  }
  const { password, code } = parsed.data;
  const userId = session.user.id;

  const blocker = await erasureBlocker(userId);
  if (blocker) return NextResponse.json({ error: blocker.message, code: blocker.code }, { status: 409 });

  const credential = await db.account.findFirst({ where: { userId, providerId: "credential" }, select: { password: true } });
  if (credential?.password) {
    const context = await auth.$context;
    const valid = password ? await context.password.verify({ hash: credential.password, password }) : false;
    if (!valid) return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 403 });
  } else if (Date.now() - session.session.createdAt.getTime() > RECENT_SIGN_IN_MS) {
    return NextResponse.json({ error: "Reconnectez-vous puis recommencez : cette action demande une connexion récente." }, { status: 403 });
  }

  const row = await db.user.findUnique({ where: { id: userId }, select: { twoFactorEnabled: true, name: true, email: true } });
  if (row?.twoFactorEnabled) {
    try {
      if (!code) throw new Error("code required");
      await auth.api.verifyTOTP({ body: { code: code.replace(/\s+/g, "") }, headers: requestHeaders });
    } catch {
      return NextResponse.json({ error: "Code de double authentification incorrect." }, { status: 403 });
    }
  }

  const result = await eraseAccount(userId);
  if (!result.ok) return NextResponse.json({ error: result.message, code: result.code }, { status: 409 });

  if (row) {
    // The address is gone from the account: the notice goes to the one it had
    const template = emailService.accountDeleted(row.name || "Utilisateur");
    await emailService.sendEmail({ to: row.email, subject: template.subject, html: template.html }).catch(() => false);
  }
  return NextResponse.json({ message: "Compte supprimé" });
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les informations complètes du profil
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        subscriptions: {
          select: {
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            enrolledAt: true,
            completedAt: true,
            course: {
              select: {
                title: true,
                slug: true,
                thumbnail: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
          take: 5,
        },
        progress: {
          select: {
            completed: true,
            lesson: {
              select: {
                course: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        certificates: {
          select: {
            issuedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const totalEnrollments = user.enrollments.length;
    const completedCourses = user.enrollments.filter(
      (e) => e.completedAt
    ).length;
    const totalCertificates = user.certificates.length;

    // Calculer la progression moyenne
    const courseProgress = user.progress.reduce((acc, p) => {
      const courseId = p.lesson.course.id;
      if (!acc[courseId]) {
        acc[courseId] = { completed: 0, total: 0 };
      }
      acc[courseId].total++;
      if (p.completed) {
        acc[courseId].completed++;
      }
      return acc;
    }, {} as Record<string, { completed: number; total: number }>);

    const averageProgress =
      Object.values(courseProgress).length > 0
        ? Math.round(
            (Object.values(courseProgress).reduce(
              (sum, course) => sum + course.completed / course.total,
              0
            ) /
              Object.values(courseProgress).length) *
              100
          )
        : 0;

    return NextResponse.json({
      user: {
        ...user,
        subscriptions: undefined, // Remove from user object
        enrollments: undefined, // Remove from user object
        progress: undefined, // Remove from user object
        certificates: undefined, // Remove from user object
      },
      stats: {
        totalEnrollments,
        completedCourses,
        totalCertificates,
        averageProgress,
      },
      recentEnrollments: user.enrollments,
      // Same rule as the access to courses: trialing counts, a cancellation at period end keeps access until then
      hasActiveSubscription: isSubscriptionActive(user.subscriptions),
    });
  } catch (error) {
    const apiLogger = createLogger({
      operation: "profile-fetch-api",
      resourceType: "api",
    });
    apiLogger.error(
      "Profile fetch error",
      {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      },
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
