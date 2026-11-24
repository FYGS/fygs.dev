import { describe, expect, it } from "vitest";
import {
  cleanName,
  effectiveRole,
  isAllowedAvatarUrl,
  isProviderSignInPath,
  isStaffRole,
  normalizeAuthPath,
  normalizeEmail,
  rateLimitEmailKey,
  sanitizeNewUser,
  sanitizeUserUpdate,
} from "@/lib/auth-policy";

describe("effectiveRole: staff hold their role only with a second factor", () => {
  it("reports an administrator or an instructor without one as a student, and says who they really are", () => {
    expect(effectiveRole({ role: "ADMIN", twoFactorEnabled: false })).toEqual({ role: "STUDENT", pendingStaffRole: "ADMIN" });
    expect(effectiveRole({ role: "INSTRUCTOR", twoFactorEnabled: null })).toEqual({ role: "STUDENT", pendingStaffRole: "INSTRUCTOR" });
    expect(effectiveRole({ role: "ADMIN" })).toEqual({ role: "STUDENT", pendingStaffRole: "ADMIN" });
  });
  it("keeps the role of staff who have enrolled", () => {
    expect(effectiveRole({ role: "ADMIN", twoFactorEnabled: true })).toEqual({ role: "ADMIN", pendingStaffRole: null });
    expect(effectiveRole({ role: "INSTRUCTOR", twoFactorEnabled: true })).toEqual({ role: "INSTRUCTOR", pendingStaffRole: null });
  });
  it("does not touch learners, with or without a second factor", () => {
    expect(effectiveRole({ role: "STUDENT", twoFactorEnabled: false })).toEqual({ role: "STUDENT", pendingStaffRole: null });
    expect(effectiveRole({ role: null })).toEqual({ role: "STUDENT", pendingStaffRole: null });
  });
  it("knows the staff roles", () => {
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("INSTRUCTOR")).toBe(true);
    expect(isStaffRole("STUDENT")).toBe(false);
    expect(isStaffRole("admin")).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
  });
});

describe("e-mail keys", () => {
  it("normalises case and spaces", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });
  it("counts +tags and case as one account for the rate limit", () => {
    expect(rateLimitEmailKey("Victim+1@Example.com")).toBe("victim@example.com");
    expect(rateLimitEmailKey("victim+spam+x@example.com")).toBe("victim@example.com");
    expect(rateLimitEmailKey(" VICTIM@example.com")).toBe("victim@example.com");
  });
  it("does not collapse different accounts", () => {
    expect(rateLimitEmailKey("a@example.com")).not.toBe(rateLimitEmailKey("b@example.com"));
    expect(rateLimitEmailKey("a@example.com")).not.toBe(rateLimitEmailKey("a@example.org"));
  });
});

describe("normalizeAuthPath: the rate-limit table cannot be skipped with a variant of the path", () => {
  it("strips the prefix, doubled and trailing slashes and the case", () => {
    expect(normalizeAuthPath("/api/auth/sign-in/email")).toBe("/sign-in/email");
    expect(normalizeAuthPath("/api/auth/sign-in/email/")).toBe("/sign-in/email");
    expect(normalizeAuthPath("/api/auth//sign-in///email")).toBe("/sign-in/email");
    expect(normalizeAuthPath("/api/auth/Sign-In/EMAIL")).toBe("/sign-in/email");
    expect(normalizeAuthPath("/API/AUTH/sign-up/email///")).toBe("/sign-up/email");
  });
  it("gives / for the bare prefix", () => {
    expect(normalizeAuthPath("/api/auth")).toBe("/");
  });
});

describe("avatars", () => {
  it("accepts https pictures of the identity providers and of our storage", () => {
    expect(isAllowedAvatarUrl("https://avatars.githubusercontent.com/u/1?v=4")).toBe(true);
    expect(isAllowedAvatarUrl("https://lh3.googleusercontent.com/a/abc")).toBe(true);
    expect(isAllowedAvatarUrl("https://cdn.fygs.test/avatars/me.png", { S3_PUBLIC_URL: "https://cdn.fygs.test/bucket" })).toBe(true);
  });
  it("refuses everything else: other hosts, plain http, other schemes, credentials, lookalike hosts", () => {
    for (const value of [
      "https://evil.example/pixel.png",
      "http://avatars.githubusercontent.com/u/1",
      "javascript:alert(1)",
      "data:image/svg+xml,<svg/>",
      "https://user:pass@avatars.githubusercontent.com/u/1",
      "https://avatars.githubusercontent.com.evil.example/u/1",
      "//avatars.githubusercontent.com/u/1",
      "",
      null,
      42,
    ]) {
      expect(isAllowedAvatarUrl(value as string), String(value)).toBe(false);
    }
  });
});

describe("names", () => {
  it("removes bidirectional overrides, zero-width and control characters", () => {
    expect(cleanName("Ali\u202Ece\u200B\u0007  Martin")).toBe("Alice Martin");
  });
  it("caps the length", () => {
    expect(cleanName("x".repeat(300))).toHaveLength(100);
  });
});

describe("sanitizeNewUser", () => {
  it("lower-cases the address, cleans the name, drops a picture from an unknown host", () => {
    expect(sanitizeNewUser({ email: " Ada@Example.COM ", name: " Ada\u202E  Lovelace ", image: "https://evil.example/x.png" })).toEqual({
      email: "ada@example.com",
      name: "Ada Lovelace",
      image: null,
    });
  });
  it("keeps a picture from an identity provider", () => {
    expect(sanitizeNewUser({ email: "a@b.fr", name: "Ada", image: "https://avatars.githubusercontent.com/u/1" }).image).toBe(
      "https://avatars.githubusercontent.com/u/1",
    );
  });
  it("falls back to the start of the address when the name is nothing once cleaned", () => {
    expect(sanitizeNewUser({ email: "ada.lovelace@example.com", name: "\u200B\u202E" }).name).toBe("ada.lovelace");
    expect(sanitizeNewUser({ email: "x@example.com", name: "" }).name).toBe("Utilisateur");
  });
});

describe("sanitizeUserUpdate", () => {
  it("only touches the fields present", () => {
    expect(sanitizeUserUpdate({ twoFactorEnabled: true } as never)).toEqual({ data: {}, invalidName: false });
  });
  it("refuses a name that is nothing once cleaned, and cleans the others", () => {
    expect(sanitizeUserUpdate({ name: "\u200B" }).invalidName).toBe(true);
    expect(sanitizeUserUpdate({ name: "A" }).invalidName).toBe(true);
    expect(sanitizeUserUpdate({ name: " Bob\u202E " })).toEqual({ data: { name: "Bob" }, invalidName: false });
  });
  it("normalises an address and drops a hostile picture", () => {
    expect(sanitizeUserUpdate({ email: " New@Example.com", image: "javascript:alert(1)" }).data).toEqual({ email: "new@example.com", image: null });
  });
});

describe("provider sign-in paths: no second factor is asked there", () => {
  it("recognises the paths that open a session after Google or GitHub", () => {
    for (const path of ["/callback/github", "/callback/google", "/sign-in/social", "/oauth2/callback/x", "/one-tap/callback"]) {
      expect(isProviderSignInPath(path), path).toBe(true);
    }
  });
  it("does not mistake the password and second-factor paths for them", () => {
    for (const path of ["/sign-in/email", "/two-factor/verify-totp", "/sign-out", "/get-session", "", undefined, null]) {
      expect(isProviderSignInPath(path as string), String(path)).toBe(false);
    }
  });
});
