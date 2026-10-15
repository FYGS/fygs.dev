import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// The real limiter runs here. REDIS_URL is not set, so it uses the in-process
// fallback, which is exactly what protects the app when Redis is down.
const m = vi.hoisted(() => ({ sendContactFormEmails: vi.fn() }));

vi.mock("@/lib/email-service", () => ({
  emailService: { sendContactFormEmails: m.sendContactFormEmails },
}));
vi.mock("@/app/actions/ai-code-actions", () => ({
  analyzeCode: vi.fn().mockResolvedValue({ hint: "ok" }),
}));
vi.mock("@/app/_services/ai-code-service", () => ({}));

import { POST as contactPOST } from "@/app/api/contact/route";
import { POST as chatPOST } from "@/app/api/ai/chat/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";

const post = (url: string, body: unknown, ip: string) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
  });

const contact = {
  name: "Test User",
  email: "test@example.com",
  subject: "Collaboration",
  message: "I want to collaborate",
};

beforeEach(() => {
  __resetRateLimitMemory();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.EMAIL_SERVER_USER = "u";
  process.env.EMAIL_SERVER_PASSWORD = "p";
  m.sendContactFormEmails.mockResolvedValue({ adminSent: true, userSent: true });
});

describe("rate-limited routes", () => {
  it("contact: 5 messages per hour per client, then 429 with Retry-After", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await contactPOST(post("/api/contact", contact, "203.0.113.9"))).status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);

    const blocked = await contactPOST(post("/api/contact", contact, "203.0.113.9"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(await blocked.json()).toMatchObject({ error: "Too many requests" });
    // the blocked requests never reached the mail service
    expect(m.sendContactFormEmails).toHaveBeenCalledTimes(5);
  });

  it("contact: another client has its own budget", async () => {
    for (let i = 0; i < 6; i++) await contactPOST(post("/api/contact", contact, "203.0.113.9"));
    const other = await contactPOST(post("/api/contact", contact, "198.51.100.7"));
    expect(other.status).toBe(200);
  });

  it("contact: a spoofed leftmost X-Forwarded-For entry does not reset the budget", async () => {
    for (let i = 0; i < 5; i++) await contactPOST(post("/api/contact", contact, "203.0.113.9"));
    const spoofed = await contactPOST(post("/api/contact", contact, `${i()}.1.1.1, 203.0.113.9`));
    expect(spoofed.status).toBe(429);
  });

  it("ai assistant: 20 calls per minute per client", async () => {
    const body = { message: "explain", code: "let a = 1", language: "javascript" };
    let last = 0;
    for (let n = 0; n < 21; n++) last = (await chatPOST(post("/api/ai/chat", body, "203.0.113.9"))).status;
    expect(last).toBe(429);
  });
});

let counter = 0;
function i() {
  return 10 + counter++;
}
