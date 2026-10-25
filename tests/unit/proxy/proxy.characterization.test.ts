/**
 * Characterization tests: proxy.ts routing contract
 *
 * Locale detection precedence (cookie > Accept-Language > default), redirects
 * and the auth gate. Auth, DB and maintenance config are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/config/maintenance", () => ({
  maintenanceConfig: { enabled: false },
}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/access-service", () => ({ AccessService: {} }));
vi.mock("@/lib/analytics-helper", () => ({ AnalyticsHelper: { emit: vi.fn() } }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));

import { proxy } from "@/proxy";

function req(
  path: string,
  init: { cookie?: string; acceptLanguage?: string; host?: string } = {},
) {
  const host = init.host ?? "example.com";
  // The middleware reads the Host header, which NextRequest does not derive from the URL.
  const headers: Record<string, string> = { host };
  if (init.cookie) headers.cookie = init.cookie;
  if (init.acceptLanguage) headers["accept-language"] = init.acceptLanguage;
  return new NextRequest(`http://${host}${path}`, { headers });
}

function location(res: Response) {
  const l = res.headers.get("location");
  return l ? new URL(l).pathname + new URL(l).search : null;
}

beforeEach(() => {
  m.getSession.mockReset();
  m.getSession.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("locale detection for paths without a locale", () => {
  it("cookie NEXT_LOCALE wins over Accept-Language", async () => {
    const res = await proxy(
      req("/", { cookie: "NEXT_LOCALE=en", acceptLanguage: "fr-FR,fr;q=0.9" }),
    );
    expect(res.status).toBe(307);
    expect(location(res)).toBe("/en");
  });

  it("uses the first supported Accept-Language entry", async () => {
    const res = await proxy(req("/", { acceptLanguage: "de,es;q=0.8,en;q=0.5" }));
    expect(location(res)).toBe("/es");
  });

  it("falls back to 'fr' with no cookie and no header", async () => {
    const res = await proxy(req("/"));
    expect(location(res)).toBe("/fr");
  });

  it("ignores an unsupported cookie value", async () => {
    const res = await proxy(
      req("/", { cookie: "NEXT_LOCALE=de", acceptLanguage: "en" }),
    );
    expect(location(res)).toBe("/en");
  });

  it("prefixes other paths and keeps the query string", async () => {
    const res = await proxy(req("/formations?level=beginner", { cookie: "NEXT_LOCALE=es" }));
    expect(res.status).toBe(307);
    expect(location(res)).toBe("/es/formations?level=beginner");
  });
});

describe("redirects and bypass", () => {
  it("301 from www to the bare host", async () => {
    const res = await proxy(req("/fr", { host: "www.example.com" }));
    expect(res.status).toBe(301);
    expect(new URL(res.headers.get("location")!).host).toBe("example.com");
  });

  it("301 /interview-prep -> /<locale>/tech-mastry", async () => {
    const res = await proxy(req("/interview-prep", { cookie: "NEXT_LOCALE=en" }));
    expect(res.status).toBe(301);
    expect(location(res)).toBe("/en/tech-mastry");
  });

  it("301 /fr/interview-prep -> /fr/tech-mastry", async () => {
    const res = await proxy(req("/fr/interview-prep"));
    expect(res.status).toBe(301);
    expect(location(res)).toBe("/fr/tech-mastry");
  });

  it.each(["/api/profile", "/_next/static/x.js", "/favicon.ico", "/maintenance"])(
    "lets %s through untouched",
    async (path) => {
      const res = await proxy(req(path));
      expect(res.headers.get("location")).toBeNull();
      expect(m.getSession).not.toHaveBeenCalled();
    },
  );
});

describe("auth gate", () => {
  it("redirects an anonymous visitor of a protected route to login with callback", async () => {
    const res = await proxy(req("/fr/dashboard?tab=courses"));
    expect(res.status).toBe(307);
    expect(location(res)).toBe(
      "/fr/auth/login?callbackUrl=%2Ffr%2Fdashboard%3Ftab%3Dcourses&reason=auth_required",
    );
  });

  it.each(["/fr/profile", "/fr/settings", "/fr/certificates", "/fr/admin/users"])(
    "protects %s",
    async (path) => {
      const res = await proxy(req(path));
      expect(location(res)).toMatch(/^\/fr\/auth\/login\?/);
    },
  );

  it.each(["/fr/learn/react", "/fr/learn/react/lessons/variables", "/fr/learn/react/quizzes/q1", "/fr/learn/react/exam"])(
    "leaves the learning area to the page, signed in or not (free samples are open to visitors): %s",
    async (path) => {
      expect((await proxy(req(path))).status).toBe(200);
      m.getSession.mockResolvedValue({ user: { id: "u1" } });
      expect((await proxy(req(path))).status).toBe(200); // lib/learning/page-context.ts decides
    },
  );

  it("keeps the certificate verification page public while the rest of /certificates needs a session", async () => {
    const verify = await proxy(req("/fr/certificates/verify/0123456789abcdef0123456789abcdef"));
    expect(verify.status).toBe(200);
    expect(location(await proxy(req("/fr/certificates/some-course-id")))).toMatch(/^\/fr\/auth\/login\?/);
  });

  describe("the application area is French only", () => {
    it.each([
      ["/en/dashboard", "/fr/dashboard"],
      ["/es/formations?level=beginner", "/fr/formations?level=beginner"],
      ["/en/profile", "/fr/profile"],
      ["/es/tech-mastry/algorithms/sorting", "/fr/tech-mastry/algorithms/sorting"],
      ["/en/admin/users", "/fr/admin/users"],
    ])("sends %s to %s", async (path, expected) => {
      const res = await proxy(req(path));
      expect(res.status).toBe(307);
      expect(location(res)).toBe(expected);
    });

    it.each(["/en", "/es", "/en/contact", "/es/blog", "/en/blog/some-post", "/en/me", "/es/projects", "/en/auth/login"])(
      "keeps the pages that have translations: %s",
      async (path) => {
        const res = await proxy(req(path));
        expect(res.headers.get("location")).toBeNull();
      },
    );

    it("does not mistake a longer word for a translated page", async () => {
      const res = await proxy(req("/en/blogger"));
      expect(location(res)).toBe("/fr/blogger");
    });
  });

  it("treats a failing session lookup as anonymous", async () => {
    m.getSession.mockRejectedValue(new Error("boom"));
    const res = await proxy(req("/fr/dashboard"));
    expect(location(res)).toMatch(/^\/fr\/auth\/login\?/);
  });

  it("lets anonymous visitors reach public pages", async () => {
    const res = await proxy(req("/fr/formations"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("sends an authenticated user away from login to the dashboard", async () => {
    m.getSession.mockResolvedValue({ user: { id: "u1" } });
    const res = await proxy(req("/fr/auth/login"));
    expect(location(res)).toBe("/fr/dashboard");
  });

  it("honours an internal callbackUrl and keeps the locale", async () => {
    m.getSession.mockResolvedValue({ user: { id: "u1" } });
    const res = await proxy(req("/en/auth/login?callbackUrl=%2Fformations"));
    expect(location(res)).toBe("/en/formations");
  });

  it("never redirects to an external callbackUrl (open redirect guard)", async () => {
    m.getSession.mockResolvedValue({ user: { id: "u1" } });
    const res = await proxy(
      req("/fr/auth/login?callbackUrl=https%3A%2F%2Fevil.example%2Fx"),
    );
    expect(new URL(res.headers.get("location")!).host).toBe("example.com");
    expect(location(res)).toBe("/fr/dashboard");
  });
});
