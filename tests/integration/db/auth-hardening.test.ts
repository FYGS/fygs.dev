import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { symmetricDecrypt, symmetricEncrypt } from "better-auth/crypto";
import { db } from "@/lib/db";
import { createAuth } from "@/lib/auth";
import { mustRefuseSession } from "@/lib/auth-session-rules";
import { getAppSecret } from "@/lib/secret";
import { resetDatabase } from "../../support/test-db";
import { STAFF_TOTP_SECRET, totpNow } from "../../e2e/support/two-factor";

// Only the outbound e-mail is replaced; users, sessions, second factors and tokens go through the real adapter.
const mail = vi.hoisted(() => ({
  sent: [] as { to: string; html: string; subject: string }[],
  passwordChanged: [] as string[],
}));
vi.mock("@/lib/email-service", () => ({
  emailService: {
    sendEmail: vi.fn(async (m: { to: string; html: string; subject: string }) => void mail.sent.push(m)),
    passwordReset: (_n: string, url: string) => ({ subject: "reset", html: url }),
    emailVerification: (_n: string, url: string) => ({ subject: "verify", html: url }),
    emailChangeConfirmation: (_n: string, newEmail: string, url: string) => ({ subject: `change to ${newEmail}`, html: url }),
    twoFactorChanged: (_n: string, enabled: boolean) => ({ subject: `two-factor ${enabled ? "on" : "off"}`, html: "" }),
    sendPasswordChangedEmail: vi.fn(async (_name: string, to: string) => void mail.passwordChanged.push(to)),
  },
}));

const auth = createAuth(prismaAdapter(db, { provider: "postgresql" }));
const password = "correct-horse-battery";
const linkIn = (html: string) => new URL(html.match(/https?:\/\/[^\s"'<]+/)![0]);
const cookieOf = (response: Response) => response.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

async function signUpVerified(email: string, name = "Ada Test") {
  await auth.api.signUpEmail({ body: { email, password, name } });
  return db.user.update({ where: { email: email.toLowerCase() }, data: { emailVerified: true } });
}

async function signIn(email: string): Promise<{ cookie: string; body: Record<string, unknown> }> {
  const response = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
  return { cookie: cookieOf(response), body: (await response.json()) as Record<string, unknown> };
}

const session = async (cookie: string) =>
  (await auth.api.getSession({ headers: new Headers({ cookie }) })) as { user: { id: string; role: string; pendingStaffRole: string | null } } | null;

/** The second factor a person would have enrolled, with the secret an authenticator application holds. */
async function enrol(userId: string, secret = STAFF_TOTP_SECRET) {
  const key = getAppSecret();
  await db.twoFactor.create({
    data: {
      userId,
      secret: await symmetricEncrypt({ key, data: secret }),
      backupCodes: await symmetricEncrypt({ key, data: JSON.stringify(["backup-one", "backup-two"]) }),
      verified: true,
    },
  });
  await db.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
}

beforeEach(async () => {
  mail.sent.length = 0;
  mail.passwordChanged.length = 0;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("password reset", () => {
  it("ends every session of the account, and tells the owner", async () => {
    const user = await signUpVerified("cy@example.test");
    await signIn("cy@example.test");
    await signIn("cy@example.test");
    expect(await db.session.count({ where: { userId: user.id } })).toBe(2);

    await auth.api.requestPasswordReset({ body: { email: "cy@example.test", redirectTo: "/reset" } });
    const token = linkIn(mail.sent.at(-1)!.html).pathname.split("/").pop()!;
    await auth.api.resetPassword({ body: { newPassword: "a-brand-new-password-1", token } });

    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(mail.passwordChanged).toEqual(["cy@example.test"]);
  });

  it("a changed password tells the owner too", async () => {
    await signUpVerified("dee@example.test");
    const { cookie } = await signIn("dee@example.test");
    await auth.api.changePassword({
      body: { currentPassword: password, newPassword: "another-long-password-2", revokeOtherSessions: true },
      headers: new Headers({ cookie }),
    });
    expect(mail.passwordChanged).toEqual(["dee@example.test"]);
  });
});

describe("accounts are normalised at sign-up", () => {
  it("stores the address in lower case, so another spelling is the same account", async () => {
    await auth.api.signUpEmail({ body: { email: "Ada@Example.test", password, name: "Ada" } });
    expect((await db.user.findFirstOrThrow()).email).toBe("ada@example.test");

    const again = await auth.api.signUpEmail({ body: { email: "ADA@example.TEST", password, name: "Impostor" } });
    expect(again.token).toBeNull();
    expect(await db.user.count()).toBe(1);
    expect((await db.user.findFirstOrThrow()).name).toBe("Ada");
  });

  it("cleans the name and drops a picture from an unknown host", async () => {
    await auth.api.signUpEmail({
      body: { email: "eve@example.test", password, name: "  Eve\u202E\u200B   Moneypenny ", image: "https://evil.example/pixel.png" },
    });
    const user = await db.user.findFirstOrThrow();
    expect(user.name).toBe("Eve Moneypenny");
    expect(user.image).toBeNull();
  });

  it("keeps the picture of an identity provider", async () => {
    await auth.api.signUpEmail({
      body: { email: "gh@example.test", password, name: "Gh", image: "https://avatars.githubusercontent.com/u/1" },
    });
    expect((await db.user.findFirstOrThrow()).image).toBe("https://avatars.githubusercontent.com/u/1");
  });
});

describe("staff hold their role only with a second factor", () => {
  it("an administrator or an instructor without one is a student for the whole application", async () => {
    for (const [email, role] of [["admin@example.test", "ADMIN"], ["teacher@example.test", "INSTRUCTOR"]] as const) {
      const user = await signUpVerified(email);
      await db.user.update({ where: { id: user.id }, data: { role } });
      const { cookie, body } = await signIn(email);
      expect(body.twoFactorRedirect).toBeUndefined(); // nothing enrolled, nothing asked
      const current = await session(cookie);
      expect(current?.user.role, email).toBe("STUDENT");
      expect(current?.user.pendingStaffRole, email).toBe(role);
    }
  });

  it("with one, they sign in with a code and get their role", async () => {
    const user = await signUpVerified("admin@example.test");
    await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    await enrol(user.id);

    // password alone opens nothing: a challenge, no session
    const first = await signIn("admin@example.test");
    expect(first.body.twoFactorRedirect).toBe(true);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await session(first.cookie)).toBeNull();

    // a wrong code opens nothing
    await expect(
      auth.api.verifyTOTP({ body: { code: "000000" }, headers: new Headers({ cookie: first.cookie }) }),
    ).rejects.toThrow();
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);

    // the right code opens the session, with the real role
    const verified = await auth.api.verifyTOTP({
      body: { code: totpNow(STAFF_TOTP_SECRET) },
      headers: new Headers({ cookie: first.cookie }),
      asResponse: true,
    });
    expect(verified.status).toBe(200);
    const current = await session(cookieOf(verified));
    expect(current?.user.role).toBe("ADMIN");
    expect(current?.user.pendingStaffRole).toBeNull();
  });

  it("cannot switch the factor off", async () => {
    const user = await signUpVerified("admin@example.test");
    await db.user.update({ where: { id: user.id }, data: { role: "INSTRUCTOR" } });
    await enrol(user.id);
    const first = await signIn("admin@example.test");
    const verified = await auth.api.verifyTOTP({ body: { code: totpNow() }, headers: new Headers({ cookie: first.cookie }), asResponse: true });

    await expect(
      auth.api.disableTwoFactor({ body: { password }, headers: new Headers({ cookie: cookieOf(verified) }) }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).twoFactorEnabled).toBe(true);
  });

  it("never remembers a device: the second factor is asked every time", async () => {
    const user = await signUpVerified("admin@example.test");
    await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    await enrol(user.id);
    const first = await signIn("admin@example.test");
    await expect(
      auth.api.verifyTOTP({ body: { code: totpNow(), trustDevice: true }, headers: new Headers({ cookie: first.cookie }) }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("a learner turns the second factor on and off", () => {
  it("enrols with a code, is audited and told; turns it off with the password", async () => {
    const user = await signUpVerified("learner@example.test");
    const { cookie } = await signIn("learner@example.test");
    const headers = () => new Headers({ cookie });

    const enabled = await auth.api.enableTwoFactor({ body: { password }, headers: headers() });
    expect(enabled).toMatchObject({ method: "totp" });
    expect((enabled as { backupCodes: string[] }).backupCodes).toHaveLength(10);
    // not on until the first code is confirmed
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).twoFactorEnabled).toBeFalsy();

    const row = await db.twoFactor.findFirstOrThrow({ where: { userId: user.id } });
    const secret = await symmetricDecrypt({ key: getAppSecret(), data: row.secret });
    await auth.api.verifyTOTP({ body: { code: totpNow(secret) }, headers: headers() });
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).twoFactorEnabled).toBe(true);
    expect(mail.sent.some((m) => m.subject === "two-factor on")).toBe(true);

    await auth.api.disableTwoFactor({ body: { password }, headers: new Headers({ cookie: (await signInWithCode("learner@example.test", secret)) }) });
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).twoFactorEnabled).toBe(false);

    const audit = await db.auditLog.findMany({ where: { targetId: user.id }, orderBy: { createdAt: "asc" } });
    expect(audit.map((a) => a.action)).toEqual(["user.two_factor_enabled", "user.two_factor_disabled"]);
    expect(mail.sent.some((m) => m.subject === "two-factor off")).toBe(true);
  });
});

async function signInWithCode(email: string, secret: string): Promise<string> {
  const first = await signIn(email);
  const verified = await auth.api.verifyTOTP({ body: { code: totpNow(secret) }, headers: new Headers({ cookie: first.cookie }), asResponse: true });
  return cookieOf(verified);
}

describe("a provider never opens a session for an account that has a second factor", () => {
  it("refuses the session of Google or GitHub, not the password path", async () => {
    const user = await signUpVerified("with-2fa@example.test");
    const other = await signUpVerified("without@example.test");
    await enrol(user.id);

    for (const path of ["/callback/github", "/callback/google", "/sign-in/social", "/oauth2/callback/x"]) {
      expect(await mustRefuseSession(user.id, path), path).toBe(true);
      expect(await mustRefuseSession(other.id, path), `${path} without a second factor`).toBe(false);
    }
    for (const path of ["/sign-in/email", "/two-factor/verify-totp", undefined]) {
      expect(await mustRefuseSession(user.id, path), String(path)).toBe(false);
    }
  });
});

describe("changing the e-mail address of an account", () => {
  it("is confirmed from the current address, then from the new one, and audited", async () => {
    const user = await signUpVerified("old@example.test");
    const { cookie } = await signIn("old@example.test");
    mail.sent.length = 0;

    await auth.api.changeEmail({ body: { newEmail: "New@Example.test" }, headers: new Headers({ cookie }) });
    // the request goes to the CURRENT address; nothing changed yet
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].to).toBe("old@example.test");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).email).toBe("old@example.test");

    await auth.api.verifyEmail({ query: { token: linkIn(mail.sent[0].html).searchParams.get("token")! }, asResponse: true });
    // approved: the NEW address is now asked to confirm itself; still unchanged
    expect(mail.sent).toHaveLength(2);
    expect(mail.sent[1].to).toBe("new@example.test");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).email).toBe("old@example.test");

    await auth.api.verifyEmail({ query: { token: linkIn(mail.sent[1].html).searchParams.get("token")! }, asResponse: true });
    const changed = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(changed.email).toBe("new@example.test");
    expect(changed.emailVerified).toBe(true);
    expect((await db.auditLog.findMany({ where: { targetId: user.id } })).map((a) => a.action)).toContain("user.email_changed");
  });

  it("without the approval of the current address, the new address alone changes nothing", async () => {
    const user = await signUpVerified("old@example.test");
    const { cookie } = await signIn("old@example.test");
    mail.sent.length = 0;
    await auth.api.changeEmail({ body: { newEmail: "attacker@example.test" }, headers: new Headers({ cookie }) });
    // the attacker controls neither mailbox step: only the current address holds the first link
    expect(mail.sent.every((m) => m.to === "old@example.test")).toBe(true);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).email).toBe("old@example.test");
  });
});
