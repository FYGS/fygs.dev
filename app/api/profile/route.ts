import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";
import { createLogger } from "@/lib/structured-logger";
import { SubscriptionStatus } from "@prisma/client";
import { enforceRateLimit } from "@/lib/rate-limit";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
});

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

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (validatedData.email !== session.user.email) {
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé par un autre compte" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le profil
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        // Si l'email change, marquer comme non vérifié
        emailVerified:
          validatedData.email === session.user.email ? undefined : false,
      },
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
      hasActiveSubscription:
        user.subscriptions?.status === SubscriptionStatus.ACTIVE &&
        !user.subscriptions?.cancelAtPeriodEnd,
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
