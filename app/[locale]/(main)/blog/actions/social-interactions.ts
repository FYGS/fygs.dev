"use server";

import { randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { incrementShareCount, toggleLike } from "@/lib/reading-stats";

const SLUG_PATTERN = /^[a-z0-9-]{1,200}$/;
const VISITOR_COOKIE = "blog_vid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function assertValidSlug(slug: string) {
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    throw new Error("Invalid slug");
  }
}

/**
 * Identity used to deduplicate likes. Never taken from the client: the signed-in
 * user id, otherwise a random id kept in an httpOnly cookie (one per browser).
 */
async function resolveLikerId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) return `user:${session.user.id}`;

  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return `visitor:${existing}`;

  const visitorId = randomUUID();
  cookieStore.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return `visitor:${visitorId}`;
}

export async function handleLike(slug: string) {
  assertValidSlug(slug);
  return toggleLike(slug, await resolveLikerId());
}

export async function handleShare(slug: string) {
  assertValidSlug(slug);
  return incrementShareCount(slug);
}
