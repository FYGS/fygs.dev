import { beforeEach, describe, expect, it, vi } from "vitest";
import { clip, MAX_COURSES_CHARS, MAX_NAME_CHARS, MAX_TITLE_CHARS } from "@/lib/learning/certificate-text";

const m = vi.hoisted(() => ({
  session: { user: { id: "user-1" } } as { user: { id: string } } | null,
  find: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => m.session) } } }));
vi.mock("@/lib/db", () => ({ db: { certificate: { findUnique: vi.fn() } } }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/learning/certificates", () => ({
  certificateVerifyUrl: (code: string) => `https://fygs.dev/certificates/verify/${code}`,
  findCertificateByCode: m.find,
}));

import { GET } from "@/app/api/certificates/pdf/route";

const CODE = "a".repeat(32);
const record = (over: Record<string, unknown> = {}) => ({
  kind: "course",
  code: CODE,
  issuedAt: new Date("2026-10-23T12:00:00Z"),
  holderId: "user-1",
  holderName: "Alice Martin",
  title: "Next.js en production",
  href: "/formations/next",
  holderHref: "/certificates/c1",
  courseTitles: [],
  ...over,
});

const download = () => GET(new Request(`http://localhost/api/certificates/pdf?code=${CODE}`));

beforeEach(() => {
  vi.clearAllMocks();
  m.session = { user: { id: "user-1" } };
});

describe("clip", () => {
  it("leaves short text alone and cuts long text with an ellipsis", () => {
    expect(clip("court", 10)).toBe("court");
    expect(clip("a".repeat(50), 10)).toBe(`${"a".repeat(9)}…`);
    expect(clip("a".repeat(10), 10)).toBe("a".repeat(10));
  });
});

describe("the certificate PDF", () => {
  it("is a one-page document whatever the length of the name and the titles", async () => {
    m.find.mockResolvedValue(record());
    const normal = await download();
    expect(normal.status).toBe(200);
    expect(normal.headers.get("Content-Type")).toBe("application/pdf");
    const normalSize = (await normal.arrayBuffer()).byteLength;

    // a name and titles of several megabytes: the document does not grow, and producing it does not take long
    m.find.mockResolvedValue(
      record({ holderName: "N".repeat(5_000_000), title: "T".repeat(3_000_000), kind: "path", courseTitles: ["C".repeat(2_000_000)] }),
    );
    const started = Date.now();
    const huge = await download();
    const elapsed = Date.now() - started;
    expect(huge.status).toBe(200);
    const hugeSize = (await huge.arrayBuffer()).byteLength;

    expect(hugeSize).toBeLessThan(normalSize * 3);
    expect(hugeSize).toBeLessThan(150_000);
    expect(elapsed).toBeLessThan(5_000);
    expect(MAX_NAME_CHARS + MAX_TITLE_CHARS + MAX_COURSES_CHARS).toBeLessThan(1000);
  });

  it("is only given to its holder, and to someone signed in", async () => {
    m.find.mockResolvedValue(record({ holderId: "someone-else" }));
    expect((await download()).status).toBe(404);
    m.session = null;
    expect((await download()).status).toBe(401);
  });
});
