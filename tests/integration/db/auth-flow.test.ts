import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { createAuth } from "@/lib/auth";
import { resetDatabase } from "../../support/test-db";

// Only the outbound e-mail is replaced; users, sessions, accounts and
// verification tokens go through the real better-auth Prisma adapter.
const sent = vi.hoisted(() => [] as { to: string; html: string }[]);
vi.mock("@/lib/email-service", () => ({
  emailService: {
    sendEmail: vi.fn(async (m: { to: string; html: string }) => void sent.push(m)),
    passwordReset: (_n: string, url: string) => ({ subject: "reset", html: url }),
    emailVerification: (_n: string, url: string) => ({ subject: "verify", html: url }),
  },
}));

const auth = createAuth(prismaAdapter(db, { provider: "postgresql" }));
const password = "correct-horse-battery";
const linkIn = (html: string) => new URL(html.match(/https?:\/\/[^\s"'<]+/)![0]);

beforeEach(async () => {
  sent.length = 0;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

describe("better-auth on the real Prisma adapter", () => {
  it("sign-up -> mandatory e-mail verification -> sign-in -> session", async () => {
    await auth.api.signUpEmail({ body: { email: "ada@example.test", password, name: "Ada" } });

    const created = await db.user.findUniqueOrThrow({
      where: { email: "ada@example.test" },
      include: { accounts: true },
    });
    expect(created.emailVerified).toBe(false);
    expect(created.role).toBe("STUDENT");
    expect(created.accounts).toHaveLength(1);
    expect(created.accounts[0].providerId).toBe("credential");
    expect(created.accounts[0].password).toBeTruthy();
    expect(created.accounts[0].password).not.toContain(password); // hashed
    expect(sent).toHaveLength(1);

    // refused until the address is verified
    await expect(
      auth.api.signInEmail({ body: { email: "ada@example.test", password } }),
    ).rejects.toThrow();
    expect(await db.session.count()).toBe(0);

    const token = linkIn(sent[0].html).searchParams.get("token")!;
    const verified = await auth.api.verifyEmail({ query: { token }, asResponse: true });
    expect(verified.status).toBeLessThan(400);
    expect((await db.user.findUniqueOrThrow({ where: { id: created.id } })).emailVerified).toBe(true);

    const signIn = await auth.api.signInEmail({
      body: { email: "ada@example.test", password },
      asResponse: true,
    });
    expect(signIn.status).toBe(200);
    expect(await db.session.count({ where: { userId: created.id } })).toBeGreaterThan(0);

    const cookie = signIn.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    const session = await auth.api.getSession({ headers: new Headers({ cookie }) });
    expect(session?.user.id).toBe(created.id);
    expect((session?.user as { role?: string }).role).toBe("STUDENT");
  });

  it("rejects a wrong password and never creates a duplicate user", async () => {
    await auth.api.signUpEmail({ body: { email: "bob@example.test", password, name: "Bob" } });
    await db.user.update({ where: { email: "bob@example.test" }, data: { emailVerified: true } });

    await expect(
      auth.api.signInEmail({ body: { email: "bob@example.test", password: "wrong-password-123" } }),
    ).rejects.toThrow();
    // Anti-enumeration: a second sign-up with the same address looks successful
    // but creates nothing and opens no session.
    const again = await auth.api.signUpEmail({
      body: { email: "bob@example.test", password, name: "Bob 2" },
    });
    expect(again.token).toBeNull();
    expect(await db.user.count({ where: { email: "bob@example.test" } })).toBe(1);
    expect((await db.user.findUniqueOrThrow({ where: { email: "bob@example.test" } })).name).toBe("Bob");
    expect(await db.session.count()).toBe(0);
  });

  it("does not let a visitor choose their role", async () => {
    await auth.api.signUpEmail({
      body: { email: "eve@example.test", password, name: "Eve", role: "ADMIN" } as never,
    });
    expect((await db.user.findUniqueOrThrow({ where: { email: "eve@example.test" } })).role).toBe("STUDENT");
  });

  it("resets a password through the verification table", async () => {
    await auth.api.signUpEmail({ body: { email: "cy@example.test", password, name: "Cy" } });
    await db.user.update({ where: { email: "cy@example.test" }, data: { emailVerified: true } });
    sent.length = 0;

    await auth.api.requestPasswordReset({ body: { email: "cy@example.test", redirectTo: "/reset" } });
    expect(sent).toHaveLength(1);
    expect(await db.verification.count()).toBeGreaterThan(0);

    // the link looks like <base>/reset-password/<token>?callbackURL=...
    const token = linkIn(sent[0].html).pathname.split("/").pop()!;
    await auth.api.resetPassword({ body: { newPassword: "a-brand-new-password-1", token } });

    await expect(
      auth.api.signInEmail({ body: { email: "cy@example.test", password } }),
    ).rejects.toThrow();
    const ok = await auth.api.signInEmail({
      body: { email: "cy@example.test", password: "a-brand-new-password-1" },
      asResponse: true,
    });
    expect(ok.status).toBe(200);
  });

  it("deleting a user cascades to sessions and accounts", async () => {
    await auth.api.signUpEmail({ body: { email: "dan@example.test", password, name: "Dan" } });
    const user = await db.user.update({
      where: { email: "dan@example.test" },
      data: { emailVerified: true },
    });
    await auth.api.signInEmail({ body: { email: "dan@example.test", password } });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);

    await db.user.delete({ where: { id: user.id } });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.account.count({ where: { userId: user.id } })).toBe(0);
  });
});
