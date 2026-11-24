import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * The only fields of a member that the community may read from the database and hand to a page or a client component.
 * Never use `include: { user: true }`, `include: { author: true }` or a spread of a `User` row in the community code:
 * the row holds the e-mail address, the verification and ban state and billing identifiers.
 * (tests/integration/db/community-exposure.test.ts fails if a query result carries such a field.)
 */
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  image: true,
  role: true,
  bio: true,
  githubUrl: true,
  linkedinUrl: true,
  websiteUrl: true,
  communityPoints: true,
  communityLevel: true,
  createdAt: true,
  lastActiveAt: true,
} satisfies Prisma.UserSelect;

/** Public fields plus badges and activity counters: what a profile card or a contributor list shows. */
export const PUBLIC_USER_WITH_BADGES_SELECT = {
  ...PUBLIC_USER_SELECT,
  userBadges: { include: { badge: true } },
  _count: {
    select: {
      discussions: true,
      discussionReplies: true,
      discussionVotes: true,
    },
  },
} satisfies Prisma.UserSelect;

/** The short author shape shown next to a discussion or a reply. */
export const AUTHOR_SELECT = {
  id: true,
  name: true,
  image: true,
  role: true,
  communityLevel: true,
} satisfies Prisma.UserSelect;

/** Keys that must never appear in anything serialised for the community pages. */
export const PRIVATE_USER_KEYS = [
  "email",
  "emailVerified",
  "isBanned",
  "twoFactorEnabled",
  "updatedAt",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "password",
  "accessToken",
  "refreshToken",
  "idToken",
  "token",
] as const;

/** An https address, or null: profile links saved before the https-only rule never reach a page as is. */
export function httpsUrlOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/** The three profile links, cleaned. */
export function withSafeLinks<T extends { githubUrl: string | null; linkedinUrl: string | null; websiteUrl: string | null }>(
  user: T,
): T {
  return {
    ...user,
    githubUrl: httpsUrlOrNull(user.githubUrl),
    linkedinUrl: httpsUrlOrNull(user.linkedinUrl),
    websiteUrl: httpsUrlOrNull(user.websiteUrl),
  };
}
