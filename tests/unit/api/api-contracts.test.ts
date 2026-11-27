/**
 * Contract tests: status codes, bodies and side-effect guards of
 * PATCH/GET /api/profile, POST /api/contact and POST /api/stripe/webhook.
 *
 * They freeze the CURRENT responses (including French messages and a few
 * surprising ones, flagged below) so that internal refactors cannot change what
 * clients see. Auth, Prisma, email and Stripe are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => {
  class WebhookSignatureError extends Error {}
  return {
  WebhookSignatureError,
  getSession: vi.fn(),
  headersFn: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  sendContactFormEmails: vi.fn(),
  verifyWebhookSignature: vi.fn(),
  };
});

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("next/headers", () => ({ headers: m.headersFn }));
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: m.userFindUnique, update: m.userUpdate } },
}));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { info: noop, warn: noop, error: noop, debug: noop };
  return { createLogger: () => logger, logger };
});
vi.mock("@/lib/email-service", () => ({
  emailService: { sendContactFormEmails: m.sendContactFormEmails },
}));
vi.mock("@/lib/payment-service", () => ({
  paymentService: { verifyWebhookSignature: m.verifyWebhookSignature },
  WebhookSignatureError: m.WebhookSignatureError,
}));
vi.mock("@/lib/analytics-helper", () => ({ Analytics: {}, AnalyticsHelper: {} }));
// The durable event claim is covered against a real database (tests/integration/payments/event-claims.test.ts)
vi.mock("@/lib/payments/event-claims", () => ({
  claimEvent: async () => ({ state: "claimed" }),
  completeEvent: async () => {},
  releaseEvent: async () => {},
}));
vi.mock("@/lib/stripe", () => ({ stripe: {}, stripeKeyMode: () => "unknown", assertStripeKeyMode: () => {} }));

import { PATCH, GET } from "@/app/api/profile/route";
import { POST as contactPOST } from "@/app/api/contact/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { POST as webhookPOST } from "@/app/api/stripe/webhook/route";

function jsonRequest(url: string, method: string, body: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const session = {
  user: { id: "user-1", email: "me@example.com", name: "Me" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.headersFn.mockResolvedValue(new Headers());
});

describe("PATCH /api/profile", () => {
  it("401 { error: 'Non autorisé' } without a session", async () => {
    m.getSession.mockResolvedValue(null);
    const res = await PATCH(jsonRequest("/api/profile", "PATCH", {}));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Non autorisé" });
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it("400 with French field details on invalid input", async () => {
    m.getSession.mockResolvedValue(session);
    const res = await PATCH(jsonRequest("/api/profile", "PATCH", { name: "J" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Données invalides");
    expect(body.details.map((d: { message: string }) => d.message)).toEqual([
      "Le nom doit contenir au moins 2 caractères",
    ]);
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it("400 for any field but the name: the e-mail address cannot be changed through this route", async () => {
    m.getSession.mockResolvedValue(session);
    for (const body of [
      { name: "John Doe", email: "taken@example.com" },
      { name: "John Doe", role: "ADMIN" },
      { name: "John Doe", emailVerified: true },
    ]) {
      const res = await PATCH(jsonRequest("/api/profile", "PATCH", body));
      expect(res.status, JSON.stringify(body)).toBe(400);
    }
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it("400 for a name that is too long or made of invisible characters", async () => {
    m.getSession.mockResolvedValue(session);
    for (const name of ["x".repeat(500), "‮​  "]) {
      const res = await PATCH(jsonRequest("/api/profile", "PATCH", { name }));
      expect(res.status).toBe(400);
    }
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it("200 updates the name only, cleaned, and never touches the e-mail", async () => {
    m.getSession.mockResolvedValue(session);
    const user = { id: "user-1", name: "John Doe", email: "me@example.com", emailVerified: true, image: null };
    m.userUpdate.mockResolvedValue(user);
    const res = await PATCH(jsonRequest("/api/profile", "PATCH", { name: "  John‮   Doe " }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "Profil mis à jour avec succès", user });
    const call = m.userUpdate.mock.calls[0][0];
    expect(call.where).toEqual({ id: "user-1" });
    expect(call.data).toEqual({ name: "John Doe" });
    expect(call.select).toEqual({ id: true, name: true, email: true, emailVerified: true, image: true });
    expect(m.userFindUnique).not.toHaveBeenCalled();
  });

  it("500 { error: 'Erreur interne du serveur' } when the database fails", async () => {
    m.getSession.mockResolvedValue(session);
    m.userUpdate.mockRejectedValue(new Error("db down"));
    const res = await PATCH(
      jsonRequest("/api/profile", "PATCH", { name: "John Doe" }),
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Erreur interne du serveur" });
  });
});

describe("GET /api/profile", () => {
  it("401 without a session", async () => {
    m.getSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Non autorisé" });
  });

  it("404 when the user row is gone", async () => {
    m.getSession.mockResolvedValue(session);
    m.userFindUnique.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Utilisateur non trouvé" });
  });

  it("200 returns stats, recent enrollments and subscription flag", async () => {
    m.getSession.mockResolvedValue(session);
    m.userFindUnique.mockResolvedValue({
      id: "user-1",
      name: "Me",
      email: "me@example.com",
      emailVerified: true,
      image: null,
      role: "STUDENT",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      subscriptions: { status: "ACTIVE", currentPeriodEnd: null, cancelAtPeriodEnd: false },
      enrollments: [
        { id: "e1", enrolledAt: new Date(0), completedAt: new Date(1), course: { title: "A", slug: "a", thumbnail: null } },
        { id: "e2", enrolledAt: new Date(0), completedAt: null, course: { title: "B", slug: "b", thumbnail: null } },
      ],
      progress: [
        { completed: true, lesson: { course: { id: "c1" } } },
        { completed: false, lesson: { course: { id: "c1" } } },
      ],
      certificates: [{ issuedAt: new Date(2) }],
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stats).toEqual({
      totalEnrollments: 2,
      completedCourses: 1,
      totalCertificates: 1,
      averageProgress: 50,
    });
    expect(body.hasActiveSubscription).toBe(true);
    expect(body.recentEnrollments).toHaveLength(2);
    expect(Object.keys(body.user).sort()).toEqual(
      ["createdAt", "email", "emailVerified", "id", "image", "name", "role"],
    );
  });
});

describe("POST /api/contact", () => {
  const valid = {
    name: "Test User",
    email: "test@example.com",
    subject: "Collaboration",
    message: "I want to collaborate",
    type: "collaboration",
  };

  beforeEach(() => {
    // The form allows 5 requests an hour per address: each case starts with an empty window
    __resetRateLimitMemory();
    process.env.EMAIL_SERVER_USER = "user";
    process.env.EMAIL_SERVER_PASSWORD = "pass";
  });

  it("400 { error: 'Invalid form data', details } on invalid input", async () => {
    const res = await contactPOST(
      jsonRequest("/api/contact", "POST", { name: "J", email: "x", subject: "ab", message: "short" }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid form data");
    expect(body.details.map((d: { message: string }) => d.message).sort()).toEqual([
      "Adresse email invalide",
      "Le message doit contenir au moins 10 caractères",
      "Le nom doit contenir au moins 2 caractères",
      "Le sujet doit contenir au moins 5 caractères",
    ]);
    expect(m.sendContactFormEmails).not.toHaveBeenCalled();
  });

  it("500 { error: \"Service d'email non configuré\" } when credentials are missing", async () => {
    delete process.env.EMAIL_SERVER_USER;
    const res = await contactPOST(jsonRequest("/api/contact", "POST", valid));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service d'email non configuré" });
    expect(m.sendContactFormEmails).not.toHaveBeenCalled();
  });

  it("500 { error: \"Échec de l'envoi d'email\" } when either email fails", async () => {
    m.sendContactFormEmails.mockResolvedValue({ adminSent: true, userSent: false });
    const res = await contactPOST(jsonRequest("/api/contact", "POST", valid));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Échec de l'envoi d'email" });
  });

  it("200 with both flags and defaults type to 'general'", async () => {
    m.sendContactFormEmails.mockResolvedValue({ adminSent: true, userSent: true });
    const { type: _type, ...withoutType } = valid;
    const res = await contactPOST(jsonRequest("/api/contact", "POST", withoutType));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: "Emails envoyés avec succès",
      data: { adminSent: true, userSent: true },
    });
    expect(m.sendContactFormEmails.mock.calls[0][0].type).toBe("general");
  });

  it("500 { error: 'Failed to send email' } when the service throws", async () => {
    m.sendContactFormEmails.mockRejectedValue(new Error("smtp"));
    const res = await contactPOST(jsonRequest("/api/contact", "POST", valid));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to send email" });
  });

  it("passes the project type, timeline and framing to the emails", async () => {
    m.sendContactFormEmails.mockResolvedValue({ adminSent: true, userSent: true });
    const res = await contactPOST(
      jsonRequest("/api/contact", "POST", {
        ...valid,
        type: "project",
        timeline: "one-to-three-months",
        framing: "written-spec",
      }),
    );
    expect(res.status).toBe(200);
    expect(m.sendContactFormEmails.mock.calls[0][0]).toMatchObject({
      type: "project",
      timeline: "one-to-three-months",
      framing: "written-spec",
    });
  });

  it("400 on an unknown timeline or framing", async () => {
    const res = await contactPOST(jsonRequest("/api/contact", "POST", { ...valid, timeline: "yesterday" }));
    expect(res.status).toBe(400);
    expect(m.sendContactFormEmails).not.toHaveBeenCalled();
  });
});

describe("POST /api/stripe/webhook", () => {
  const post = () =>
    webhookPOST(
      new NextRequest("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      }),
    );

  it("400 { error: 'Missing signature' } without the stripe-signature header", async () => {
    m.headersFn.mockResolvedValue(new Headers());
    const res = await post();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing signature" });
    expect(m.verifyWebhookSignature).not.toHaveBeenCalled();
  });

  it("400 { error: 'Invalid signature' } when the signature is invalid", async () => {
    m.headersFn.mockResolvedValue(new Headers({ "stripe-signature": "bad" }));
    m.verifyWebhookSignature.mockImplementation(() => {
      throw new m.WebhookSignatureError("Invalid webhook signature");
    });
    const res = await post();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid signature" });
  });

  it("500 when verification fails for a server reason (e.g. missing secret)", async () => {
    m.headersFn.mockResolvedValue(new Headers({ "stripe-signature": "ok" }));
    m.verifyWebhookSignature.mockImplementation(() => {
      throw new Error("STRIPE_WEBHOOK_SECRET is required");
    });
    const res = await post();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Webhook handler failed" });
  });

  it("200 { received: true } for an event type it does not handle", async () => {
    m.headersFn.mockResolvedValue(new Headers({ "stripe-signature": "ok" }));
    m.verifyWebhookSignature.mockReturnValue({ id: "evt_1", type: "customer.created", data: { object: {} } });
    const res = await post();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(m.verifyWebhookSignature).toHaveBeenCalledWith("{}", "ok");
  });
});
