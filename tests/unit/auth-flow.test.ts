import { describe, it, expect, vi, beforeEach } from "vitest";
import { memoryAdapter } from "better-auth/adapters/memory";

const sent = vi.hoisted(() => [] as { to: string; html: string }[]);

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/email-service", () => ({
  emailService: {
    sendEmail: vi.fn(async (m: { to: string; html: string }) => void sent.push(m)),
    passwordReset: (_n: string, url: string) => ({ subject: "reset", html: url }),
    emailVerification: (_n: string, url: string) => ({ subject: "verify", html: url }),
    sendPasswordChangedEmail: vi.fn(async () => undefined),
    twoFactorChanged: () => ({ subject: "2fa", html: "" }),
    emailChangeConfirmation: () => ({ subject: "change", html: "" }),
  },
}));

import { createAuth } from "@/lib/auth";

function makeAuth() {
  const store = { user: [], session: [], account: [], verification: [] };
  return createAuth(memoryAdapter(store));
}

const urlIn = (html: string) => html.match(/https?:\/\/[^\s"'<]+/)![0];

describe("auth flow (better-auth)", () => {
  beforeEach(() => void (sent.length = 0));

  it("requires email verification, then signs in and reads the session", async () => {
    const auth = makeAuth();
    await auth.api.signUpEmail({
      body: { email: "ada@example.com", password: "correct-horse-battery", name: "Ada" },
    });
    expect(sent).toHaveLength(1);

    // not verified yet: sign-in is refused
    await expect(
      auth.api.signInEmail({ body: { email: "ada@example.com", password: "correct-horse-battery" } }),
    ).rejects.toThrow();

    // follow the verification link
    const link = new URL(urlIn(sent[0].html));
    const res = await auth.api.verifyEmail({
      query: { token: link.searchParams.get("token")! },
      asResponse: true,
    });
    expect(res.status).toBeLessThan(400);

    const signIn = await auth.api.signInEmail({
      body: { email: "ada@example.com", password: "correct-horse-battery" },
      asResponse: true,
    });
    expect(signIn.status).toBe(200);
    const cookie = signIn.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    const session = await auth.api.getSession({ headers: new Headers({ cookie }) });
    expect(session?.user.email).toBe("ada@example.com");
  });

  it("rejects a wrong password", async () => {
    const auth = makeAuth();
    await auth.api.signUpEmail({
      body: { email: "bob@example.com", password: "correct-horse-battery", name: "Bob" },
    });
    await expect(
      auth.api.signInEmail({ body: { email: "bob@example.com", password: "wrong-password-123" } }),
    ).rejects.toThrow();
  });

  it("does not let a visitor choose their role at sign-up", async () => {
    const auth = makeAuth();
    const out = await auth.api.signUpEmail({
      body: { email: "eve@example.com", password: "correct-horse-battery", name: "Eve", role: "ADMIN" } as never,
    });
    expect((out.user as { role?: string }).role).toBe("STUDENT");
  });

  it("sends a password reset link", async () => {
    const auth = makeAuth();
    await auth.api.signUpEmail({
      body: { email: "cy@example.com", password: "correct-horse-battery", name: "Cy" },
    });
    sent.length = 0;
    await auth.api.requestPasswordReset({ body: { email: "cy@example.com", redirectTo: "/reset" } });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("cy@example.com");
  });
});
