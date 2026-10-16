import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn(async () => ({ user: { id: "u1", name: "Ada Lovelace", email: "ada@example.com" } })) } },
}));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/db", () => ({
  db: {
    certificate: { findUnique: vi.fn(async () => ({ issuedAt: new Date("2026-03-04T10:00:00Z") })) },
    course: { findUnique: vi.fn(async () => ({ title: "TypeScript avancé" })) },
  },
}));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn(async () => null) }));

import generatePDF from "@/app/_lib/pdf-generator";
import { GET } from "@/app/api/certificates/pdf/route";

const SHOWN_TEXT = /\((?:[^()\\]|\\.)*\)\s*Tj/g;

/** Text drawn on each page, in order, whatever the PDF library writes around it. */
function textOf(doc: { internal: { pages: unknown[] } }) {
  return doc.internal.pages
    .filter((p): p is string[] => Array.isArray(p))
    .map((page) => page.join("\n").match(SHOWN_TEXT) ?? []);
}

describe("generated PDFs", () => {
  it("the CV carries its text", () => {
    const doc = generatePDF("fr");
    const pages = textOf(doc);
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages.flat().length).toBeGreaterThan(50);
  });

  it("the certificate is a valid PDF carrying the learner and course names", async () => {
    const res = await GET(new Request("http://localhost/api/certificates/pdf?courseId=c1"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(1000);
    const body = new TextDecoder("latin1").decode(bytes);
    expect(body).toContain("Ada Lovelace");
    expect(body).toContain("TypeScript avanc");
    expect(body).toMatch(/CERTIFICAT DE COMPL/);
  });
});
