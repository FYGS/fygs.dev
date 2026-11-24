import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanDisplayName, escapeHtml, safeHref, singleLine } from "@/lib/html-escape";
import { safeInternalPath } from "@/lib/safe-redirect";
import { assertSecretStrength, deriveKey, getAppSecret, secretProblem } from "@/lib/secret";

describe("escapeHtml", () => {
  it("escapes what could open a tag or leave an attribute", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&`)).toBe("&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("safeHref", () => {
  it("keeps https, and mailto only when asked", () => {
    expect(safeHref("https://fygs.dev/a?b=1&c=2")).toBe("https://fygs.dev/a?b=1&amp;c=2");
    expect(safeHref("mailto:a@b.fr")).toBe("#");
    expect(safeHref("mailto:a@b.fr", { allowMailto: true })).toBe("mailto:a@b.fr");
  });
  it("turns every other scheme into #", () => {
    for (const value of ["javascript:alert(1)", "data:text/html,<b>", "http://plain.example", "//evil.tld", "  ", "", null, 5]) {
      expect(safeHref(value)).toBe("#");
    }
  });
});

describe("singleLine and cleanDisplayName", () => {
  it("removes line breaks so a value cannot add a header", () => {
    expect(singleLine("Bonjour\r\nBcc: victim@x.fr")).toBe("Bonjour Bcc: victim@x.fr");
    expect(singleLine("a".repeat(500), 10)).toHaveLength(10);
  });
  it("removes bidi overrides, zero-width and control characters from a name", () => {
    expect(cleanDisplayName("Ali‮ce​\u0007  Martin")).toBe("Alice Martin");
    expect(cleanDisplayName("x".repeat(300))).toHaveLength(100);
  });
});

describe("safeInternalPath", () => {
  const FALLBACK = "/dashboard";
  it("keeps paths of the site, with query and hash", () => {
    expect(safeInternalPath("/fr/learn/react?x=1#top")).toBe("/fr/learn/react?x=1#top");
    expect(safeInternalPath(encodeURIComponent("/fr/formations/react?a=b"))).toBe("/fr/formations/react?a=b");
  });
  it("refuses every way out of the site", () => {
    const attacks = [
      "https://evil.tld/x",
      "//evil.tld",
      "/\\evil.tld",
      "\\\\evil.tld",
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,<script>1</script>",
      "/\t/evil.tld",
      "/\n/evil.tld",
      "%2F%2Fevil.tld",
      "/%5Cevil.tld",
      " //evil.tld",
      "/ /evil.tld",
      "evil.tld",
      "",
      null,
      undefined,
    ];
    for (const attack of attacks) expect(safeInternalPath(attack as string | null | undefined), String(attack)).toBe(FALLBACK);
  });
  it("uses the fallback given, and refuses malformed encodings and huge values", () => {
    expect(safeInternalPath("//evil", "/fr")).toBe("/fr");
    expect(safeInternalPath("%E0%A4%A", "/fr")).toBe("/fr");
    expect(safeInternalPath(`/${"a".repeat(3000)}`)).toBe(FALLBACK);
  });
});

describe("secret", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("judges a secret", () => {
    expect(secretProblem(undefined)).toMatch(/not set/);
    expect(secretProblem("short")).toMatch(/shorter/);
    expect(secretProblem("your-32-character-secret-key-here")).toMatch(/placeholder/);
    expect(secretProblem("build-time-placeholder-secret-not-for-production")).toMatch(/placeholder/);
    expect(secretProblem("a".repeat(40))).toMatch(/variety/);
    expect(secretProblem("Xk9#vQ2mZp7LwR4tYb8NcD1sFh6JgA3e")).toBeNull();
  });

  it("refuses a weak secret in a running production server, but not in tests or during the build", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("BETTER_AUTH_SECRET", "too-short");
    expect(() => assertSecretStrength()).toThrow(/BETTER_AUTH_SECRET/);
    expect(() => getAppSecret()).toThrow(/BETTER_AUTH_SECRET/);
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    expect(() => assertSecretStrength()).not.toThrow();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PHASE", "");
    expect(() => getAppSecret()).not.toThrow();
  });

  it("derives a different key for each purpose, stable for the same one", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "Xk9#vQ2mZp7LwR4tYb8NcD1sFh6JgA3e");
    expect(deriveKey("exam").equals(deriveKey("exam"))).toBe(true);
    expect(deriveKey("exam").equals(deriveKey("pow"))).toBe(false);
    expect(() => deriveKey("")).toThrow();
  });
});
