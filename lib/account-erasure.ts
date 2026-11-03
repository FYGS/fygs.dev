import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

/**
 * Erasure of an account at its owner's request (GDPR article 17).
 *
 * The person is anonymised, not the history deleted: what they wrote (discussions, replies, reviews) stays and shows
 * "Compte supprimé" as its author, learning records stay without a name, and payments and invoices are kept untouched
 * because the law requires them. Everything that identifies or can be used to sign in is removed: e-mail, name, picture,
 * links, sessions, linked provider accounts, second factor, notes, notifications, follows, mentoring messages.
 *
 * The caller has already proved who is asking (password, second factor): this function only does the work.
 */

export const ERASED_NAME = "Compte supprimé";
export const ERASED_CERTIFICATE_HOLDER = "Titulaire supprimé";

export type ErasureResult =
  | { ok: true }
  | {
      ok: false;
      code: "NOT_FOUND" | "ACTIVE_SUBSCRIPTION" | "LAST_ADMIN" | "OWNS_COURSES";
      message: string;
    };

const LIVE_SUBSCRIPTION = ["ACTIVE", "TRIALING", "PAST_DUE"] as const;

/** Why this account cannot be erased by its owner right now, or null. */
export async function erasureBlocker(userId: string): Promise<Exclude<ErasureResult, { ok: true }> | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      subscriptions: { select: { status: true, cancelAtPeriodEnd: true } },
      _count: { select: { instructedCourses: true } },
    },
  });
  if (!user) return { ok: false, code: "NOT_FOUND", message: "Compte introuvable." };

  const subscription = user.subscriptions;
  if (subscription && (LIVE_SUBSCRIPTION as readonly string[]).includes(subscription.status) && !subscription.cancelAtPeriodEnd) {
    return {
      ok: false,
      code: "ACTIVE_SUBSCRIPTION",
      message: "Résiliez d'abord votre abonnement (Tableau de bord > Facturation), puis supprimez votre compte.",
    };
  }
  if (user._count.instructedCourses > 0) {
    return {
      ok: false,
      code: "OWNS_COURSES",
      message: "Vous êtes l'auteur de formations : contactez un administrateur pour qu'elles soient réattribuées avant la suppression.",
    };
  }
  if (user.role === "ADMIN") {
    const otherAdmins = await db.user.count({ where: { role: "ADMIN", id: { not: userId } } });
    if (otherAdmins === 0) {
      return { ok: false, code: "LAST_ADMIN", message: "Vous êtes le dernier administrateur : nommez-en un autre avant de supprimer ce compte." };
    }
  }
  return null;
}

/** Anonymises the account and removes everything that identifies it. One transaction: all or nothing. */
export async function eraseAccount(userId: string): Promise<ErasureResult> {
  const blocker = await erasureBlocker(userId);
  if (blocker) return blocker;

  await db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });

    // Ways to sign in, and everything tied to the old address
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.twoFactor.deleteMany({ where: { userId } });
    await tx.verification.deleteMany({ where: { identifier: user.email } });

    // Personal data that is not history
    await tx.lessonNote.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { OR: [{ recipientId: userId }, { senderId: userId }] } });
    await tx.userFollow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } });
    await tx.topicFollow.deleteMany({ where: { userId } });
    await tx.discussionBookmark.deleteMany({ where: { userId } });
    await tx.userBadge.deleteMany({ where: { userId } });
    await tx.userStreak.deleteMany({ where: { userId } });
    await tx.xpEvent.deleteMany({ where: { userId } });
    await tx.mentorRequest.deleteMany({ where: { OR: [{ studentId: userId }, { mentorId: userId }] } });

    // Certificates stay verifiable but no longer carry the name
    await tx.certificate.updateMany({ where: { userId }, data: { holderName: ERASED_CERTIFICATE_HOLDER } });

    await tx.user.update({
      where: { id: userId },
      data: {
        name: ERASED_NAME,
        email: `deleted-${userId}@deleted.invalid`,
        emailVerified: false,
        image: null,
        bio: null,
        githubUrl: null,
        linkedinUrl: null,
        websiteUrl: null,
        role: "STUDENT",
        twoFactorEnabled: false,
        isBanned: true, // nothing can be posted in the name of an erased account
      },
    });

    await writeAudit({ actorId: userId, action: "user.deleted", targetType: "user", targetId: userId }, tx);
  });

  return { ok: true };
}
