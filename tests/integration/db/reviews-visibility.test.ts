import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string; emailVerified?: boolean } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/redis", () => ({ default: { eval: vi.fn(async () => { throw new Error("redis down"); }) } }));

import { GET as listReviews, POST as createReview } from "@/app/api/reviews/route";
import { GET as getReview } from "@/app/api/reviews/[reviewId]/route";
import { GET as searchReviews } from "@/app/api/reviews/search/route";
import { GET as getReplies } from "@/app/api/reviews/[reviewId]/replies/route";
import { POST as reportReview } from "@/app/api/reviews/[reviewId]/report/route";
import { shouldAutoFlag } from "@/lib/services/review-reports";
import { scopeReviewFilters } from "@/lib/services/review-search";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";

const asUser = (user: { id: string; role: string; emailVerified?: boolean } | null) => {
  h.session = user ? { user: { id: user.id, role: user.role, emailVerified: user.emailVerified ?? true } } : null;
};
const request = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) => new NextRequest(`http://localhost${path}`, init);
const json = async (response: Response) => response.json();

let f: Awaited<ReturnType<typeof fixture>>;

async function fixture() {
  const instructorA = await createUser({ role: "INSTRUCTOR", name: "Formateur A" });
  const instructorB = await createUser({ role: "INSTRUCTOR", name: "Formateur B" });
  const admin = await createUser({ role: "ADMIN", name: "Admin" });
  const author = await createUser({ name: "Auteur", email: "auteur@example.test" });
  const voter = await createUser({ name: "Votant" });
  const stranger = await createUser({ name: "Passant" });
  const courseA = await createCourse({ instructorId: instructorA.id });
  const courseB = await createCourse({ instructorId: instructorB.id });
  const approved = await db.review.create({
    data: { userId: author.id, courseId: courseA.id, rating: 5, comment: "Une très bonne formation.", status: "APPROVED", reportCount: 2 },
  });
  const pendingAuthor = await createUser({ name: "Autre auteur" });
  const pending = await db.review.create({
    data: { userId: pendingAuthor.id, courseId: courseA.id, rating: 1, comment: "Avis en attente de relecture.", status: "PENDING" },
  });
  const rejectedAuthor = await createUser({ name: "Auteur rejeté" });
  const rejected = await db.review.create({
    data: { userId: rejectedAuthor.id, courseId: courseA.id, rating: 1, comment: "Avis rejeté pour abus.", status: "REJECTED" },
  });
  await db.reviewVote.create({ data: { userId: voter.id, reviewId: approved.id, helpful: true } });
  return { instructorA, instructorB, admin, author, voter, stranger, courseA, courseB, approved, pending, pendingAuthor, rejected };
}

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  __resetRateLimitMemory();
  asUser(null);
  await resetDatabase(db);
  f = await fixture();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const statusesOf = (body: { reviews: { status: string }[] }) => [...new Set(body.reviews.map((r) => r.status))];

describe("GET /api/reviews: who sees which statuses", () => {
  it("a visitor only ever gets approved reviews, whatever status or filters they ask for", async () => {
    for (const query of [
      `courseId=${f.courseA.id}&status=PENDING`,
      `courseId=${f.courseA.id}&status=REJECTED`,
      `courseId=${f.courseA.id}&status=FLAGGED&reportCountMin=0`,
      `userId=${f.pendingAuthor.id}&status=PENDING`,
      `instructorId=${f.instructorA.id}&status=PENDING`,
    ]) {
      const body = await json(await listReviews(request(`/api/reviews?${query}`)));
      expect(body.success, query).toBe(true);
      expect(statusesOf(body), query).not.toContain("PENDING");
      expect(statusesOf(body), query).not.toContain("REJECTED");
    }
    const all = await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}`)));
    expect(all.reviews.map((r: { id: string }) => r.id)).toEqual([f.approved.id]);
  });

  it("does not show who voted, report counts or e-mail verification to the public", async () => {
    const body = await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}&includeStats=true`)));
    const text = JSON.stringify(body);
    expect(text).not.toContain(f.voter.id);
    expect(text).not.toContain("emailVerified");
    expect(body.reviews[0]._count.reports).toBeUndefined();
    expect(body.reviews[0]._count.votes).toBe(1);
    // facets count approved reviews only: they would otherwise reveal the hidden ones
    expect(body.facets.statuses).toEqual([{ value: "APPROVED", count: 1 }]);
    expect(body.facets.ratings).toEqual([{ value: 5, count: 1 }]);
  });

  it("a signed-in viewer only gets their own vote back", async () => {
    asUser(f.voter);
    const body = await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}`)));
    expect(body.reviews[0].votes).toEqual([expect.objectContaining({ helpful: true })]);
    expect(body.reviews[0].votes[0].userId).toBeUndefined();
    asUser(f.stranger);
    expect((await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}`)))).reviews[0].votes).toEqual([]);
  });

  it("an instructor sees pending reviews of THEIR course only", async () => {
    asUser(f.instructorA);
    const own = await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}&status=PENDING`)));
    expect(own.reviews.map((r: { id: string }) => r.id)).toEqual([f.pending.id]);
    const ownByInstructor = await json(await listReviews(request(`/api/reviews?instructorId=${f.instructorA.id}&status=REJECTED`)));
    expect(ownByInstructor.reviews.map((r: { id: string }) => r.id)).toEqual([f.rejected.id]);

    asUser(f.instructorB);
    // another instructor is a member of the public here: approved reviews only, whatever they ask
    const other = await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}&status=PENDING`)));
    expect(statusesOf(other)).toEqual(["APPROVED"]);
    // asking for someone else's `instructorId` is not a way in either
    const spoof = await json(await listReviews(request(`/api/reviews?instructorId=${f.instructorA.id}&status=PENDING`)));
    expect(statusesOf(spoof)).toEqual(["APPROVED"]);
  });

  it("an administrator sees every status; a member sees their own review whatever its status", async () => {
    asUser(f.admin);
    const pendingForAdmin = await json(await listReviews(request(`/api/reviews?courseId=${f.courseA.id}&status=PENDING`)));
    expect(pendingForAdmin.reviews.map((r: { id: string }) => r.id)).toEqual([f.pending.id]);

    asUser(f.pendingAuthor);
    const mine = await json(await listReviews(request(`/api/reviews?userId=${f.pendingAuthor.id}&status=PENDING`)));
    expect(mine.reviews.map((r: { id: string }) => r.id)).toEqual([f.pending.id]);
    // but not somebody else's
    const theirs = await json(await listReviews(request(`/api/reviews?userId=${f.rejected.userId}&status=REJECTED`)));
    expect(theirs.reviews).toEqual([]);
  });

  it("the search endpoint ignores the status parameter too", async () => {
    const body = await json(await searchReviews(request(`/api/reviews/search?q=formation&courseId=${f.courseA.id}&status=PENDING`)));
    expect(statusesOf(body)).toEqual(["APPROVED"]);
    const rejected = await json(await searchReviews(request(`/api/reviews/search?q=abus&courseId=${f.courseA.id}&status=REJECTED`)));
    expect(rejected.reviews).toEqual([]);
  });

  it("paging values from the query string are brought back into range", async () => {
    const odd = await listReviews(request(`/api/reviews?courseId=${f.courseA.id}&page=-5&limit=1000000`));
    expect(odd.status).toBe(200);
    const nan = await listReviews(request(`/api/reviews?courseId=${f.courseA.id}&page=abc&limit=xyz`));
    expect(nan.status).toBe(200);
  });
});

describe("GET /api/reviews/[reviewId]", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ reviewId: id }) });

  it("hides a pending review from the public and from another course's instructor (the tautology)", async () => {
    expect((await getReview(request("/x"), ctx(f.pending.id))).status).toBe(404);
    asUser(f.stranger);
    expect((await getReview(request("/x"), ctx(f.pending.id))).status).toBe(404);
    asUser(f.instructorB);
    expect((await getReview(request("/x"), ctx(f.pending.id))).status).toBe(404);
    expect((await getReview(request("/x"), ctx(f.rejected.id))).status).toBe(404);
  });

  it("shows it to its author, to the instructor of the course and to an administrator", async () => {
    asUser(f.pendingAuthor);
    expect((await getReview(request("/x"), ctx(f.pending.id))).status).toBe(200);
    asUser(f.instructorA);
    const asInstructor = await getReview(request("/x"), ctx(f.pending.id));
    expect(asInstructor.status).toBe(200);
    expect((await json(asInstructor)).review.course.instructorId).toBeUndefined();
    asUser(f.admin);
    expect((await getReview(request("/x"), ctx(f.pending.id))).status).toBe(200);
  });

  it("an approved review is public, without the voters nor the report count", async () => {
    const body = await json(await getReview(request("/x"), ctx(f.approved.id)));
    expect(body.review.votes).toEqual([]);
    expect(body.review._count).toEqual({ votes: 1 });
    expect(JSON.stringify(body)).not.toContain(f.voter.id);

    asUser(f.voter);
    const asVoter = await json(await getReview(request("/x"), ctx(f.approved.id)));
    expect(asVoter.review.votes).toEqual([expect.objectContaining({ helpful: true })]);
    expect(asVoter.review.votes[0].userId).toBeUndefined();

    asUser(f.instructorA);
    const asInstructor = await json(await getReview(request("/x"), ctx(f.approved.id)));
    expect(asInstructor.review.votes[0].userId).toBe(f.voter.id);
    expect(asInstructor.review._count.reports).toBeDefined();
  });
});

describe("GET /api/reviews/[reviewId]/replies follows the visibility of the review", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ reviewId: id }) });

  it("replies under a pending review are not public", async () => {
    await db.reviewReply.create({ data: { reviewId: f.pending.id, userId: f.instructorA.id, content: "Merci pour votre retour, nous regardons." } });
    expect((await getReplies(request("/x"), ctx(f.pending.id))).status).toBe(404);
    asUser(f.instructorB);
    expect((await getReplies(request("/x"), ctx(f.pending.id))).status).toBe(404);
    for (const viewer of [f.pendingAuthor, f.instructorA, f.admin]) {
      asUser(viewer);
      expect((await getReplies(request("/x"), ctx(f.pending.id))).status, viewer.id).toBe(200);
    }
  });

  it("replies under an approved review are public, an unknown review is a 404", async () => {
    await db.reviewReply.create({ data: { reviewId: f.approved.id, userId: f.instructorA.id, content: "Merci pour ce bel avis." } });
    asUser(null);
    expect((await getReplies(request("/x"), ctx(f.approved.id))).status).toBe(200);
    expect((await getReplies(request("/x"), ctx("clzzzzzzzzzzzzzzzzzzzzzzz"))).status).toBe(404);
  });
});

describe("scopeReviewFilters (pure)", () => {
  it("forces APPROVED and drops the report filter unless privileged", () => {
    expect(scopeReviewFilters({ courseId: "c", status: "PENDING", reportCount: { min: 1 } }, { privileged: false })).toEqual({
      courseId: "c",
      status: "APPROVED",
    });
    expect(scopeReviewFilters({ courseId: "c" }, { privileged: false })).toEqual({ courseId: "c", status: "APPROVED" });
    const privileged = { courseId: "c", status: "PENDING" as const, reportCount: { min: 1 } };
    expect(scopeReviewFilters(privileged, { privileged: true })).toBe(privileged);
  });
  it("keeps the status a member asks for on their OWN reviews only", () => {
    expect(scopeReviewFilters({ userId: "me", status: "PENDING" }, { privileged: false, viewerId: "me" })).toMatchObject({ status: "PENDING" });
    expect(scopeReviewFilters({ userId: "other", status: "PENDING" }, { privileged: false, viewerId: "me" })).toMatchObject({ status: "APPROVED" });
  });
});

describe("reporting a review: only credible reporters hide it", () => {
  const ctx = { params: Promise.resolve({ reviewId: "" }) };
  const report = async (reviewId: string, reporter: { id: string; role: string }) => {
    asUser(reporter);
    return reportReview(
      request(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "SPAM", details: "Publicité" }),
      }),
      { params: Promise.resolve({ reviewId }) },
    );
  };
  void ctx;

  async function reporter(over: { ageDays: number; verified: boolean }) {
    const user = await createUser({ emailVerified: over.verified });
    await db.user.update({ where: { id: user.id }, data: { createdAt: new Date(Date.now() - over.ageDays * 86_400_000) } });
    // reporting needs the right to the course in the permission service: enrol and follow it
    await enroll(user.id, f.courseA.id);
    return user;
  }

  it("three fresh or unverified accounts do not hide the review, but their reports are kept", async () => {
    const fresh = await Promise.all([reporter({ ageDays: 0, verified: true }), reporter({ ageDays: 1, verified: true }), reporter({ ageDays: 30, verified: false })]);
    for (const user of fresh) await report(f.approved.id, user);
    expect((await db.review.findUniqueOrThrow({ where: { id: f.approved.id } })).status).toBe("APPROVED");
    expect(await db.reviewReport.count({ where: { reviewId: f.approved.id } })).toBe(3);
    expect(await shouldAutoFlag(f.approved.id)).toBe(false);
  });

  it("three credible reporters (verified, older than a week) flag it", async () => {
    const credible = await Promise.all([1, 2, 3].map(() => reporter({ ageDays: 30, verified: true })));
    for (const user of credible.slice(0, 2)) await report(f.approved.id, user);
    expect((await db.review.findUniqueOrThrow({ where: { id: f.approved.id } })).status).toBe("APPROVED");
    await report(f.approved.id, credible[2]);
    expect((await db.review.findUniqueOrThrow({ where: { id: f.approved.id } })).status).toBe("FLAGGED");
    expect(await shouldAutoFlag(f.approved.id)).toBe(true);
  });

  it("one account reporting twice counts once", async () => {
    const user = await reporter({ ageDays: 30, verified: true });
    const first = await report(f.approved.id, user);
    expect(first.status).toBe(201);
    const second = await report(f.approved.id, user);
    expect([400, 403]).toContain(second.status);
    expect((await json(second)).error).toContain("déjà");
    expect(await db.reviewReport.count({ where: { reviewId: f.approved.id } })).toBe(1);
  });
});

describe("who may write a review (one rule for the API and the course page)", () => {
  const post = (courseId: string) =>
    createReview(
      request("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId, rating: 5, comment: "Une formation très claire et complète." }),
      }),
    );

  async function learner(progress: "none" | "some" | "all") {
    const user = await createUser();
    await db.user.update({ where: { id: user.id }, data: { createdAt: new Date(Date.now() - 5 * 86_400_000) } });
    await enroll(user.id, f.courseA.id);
    await db.enrollment.updateMany({ where: { userId: user.id }, data: { enrolledAt: new Date(Date.now() - 3 * 3_600_000) } });
    const lessons = await Promise.all(
      [1, 2, 3, 4, 5].map((order) =>
        db.lesson.create({ data: { courseId: f.courseA.id, title: `L${order}${user.id.slice(0, 4)}`, slug: `l${order}-${user.id.slice(0, 6)}`, order: order + (progress === "none" ? 100 : 0), published: true } }),
      ),
    );
    if (progress !== "none") {
      for (const lesson of lessons.slice(0, progress === "all" ? 5 : 2)) {
        await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true } });
      }
    }
    return user;
  }

  it("refuses a learner who has not followed enough of the course", async () => {
    const user = await learner("none");
    asUser(user);
    const response = await post(f.courseA.id);
    expect(response.status).toBe(403);
    expect((await json(response)).requiresAction).toBe("learn");
  });

  it("accepts one who followed 20 % or more, once", async () => {
    const user = await learner("some");
    asUser(user);
    expect((await post(f.courseA.id)).status).toBe(201);
    expect((await post(f.courseA.id)).status).toBe(403);
  });

  it("refuses the course's own instructor, an administrator and someone who is not enrolled", async () => {
    for (const user of [f.instructorA, f.admin, f.stranger]) {
      asUser(user);
      expect((await post(f.courseA.id)).status, user.id).toBe(403);
    }
  });

  it("refuses a banned account", async () => {
    const user = await learner("all");
    await db.user.update({ where: { id: user.id }, data: { isBanned: true } });
    const verdict = await ReviewPermissionsService.canCreateReview(user.id, f.courseA.id);
    expect(verdict.allowed).toBe(false);
  });
});
