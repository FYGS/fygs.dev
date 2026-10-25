import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ADMIN_NAVIGATION, canOpenAdminHref, navigationFor } from "@/lib/admin-navigation";
import { quickActionsFor } from "@/app/[locale]/(admin)/admin/_components/admin-quick-actions";
import { normalizeLinkUrl } from "@/lib/curriculum/content";
import { hasLosableChanges } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/save-status";

const ADMIN_DIR = join(process.cwd(), "app", "[locale]", "(admin)", "admin");
const hrefs = (role: string) => navigationFor(role).map((e) => e.href);

describe("admin navigation by role", () => {
  it("every entry points to a page that exists", () => {
    for (const entry of ADMIN_NAVIGATION) {
      const dir = entry.href === "/admin" ? ADMIN_DIR : join(ADMIN_DIR, ...entry.href.split("/").slice(2));
      expect(existsSync(join(dir, "page.tsx")), entry.href).toBe(true);
    }
  });

  it("an instructor only sees what an instructor can open", () => {
    expect(hrefs("INSTRUCTOR")).toEqual(["/admin", "/admin/courses", "/admin/questions", "/admin/tags"]);
    for (const adminOnly of ["/admin/analytics", "/admin/reviews", "/admin/community", "/admin/users", "/admin/paths", "/admin/payments"]) {
      expect(hrefs("INSTRUCTOR")).not.toContain(adminOnly);
    }
  });

  it("an administrator sees everything, a learner nothing", () => {
    expect(hrefs("ADMIN")).toEqual(ADMIN_NAVIGATION.map((e) => e.href));
    expect(navigationFor("STUDENT")).toEqual([]);
  });

  it("decides on deep addresses by the closest entry", () => {
    expect(canOpenAdminHref("INSTRUCTOR", "/admin/courses/new")).toBe(true);
    expect(canOpenAdminHref("INSTRUCTOR", "/admin/courses/abc")).toBe(true);
    expect(canOpenAdminHref("INSTRUCTOR", "/admin/reviews/moderation")).toBe(false);
    expect(canOpenAdminHref("INSTRUCTOR", "/admin/analytics")).toBe(false);
    expect(canOpenAdminHref("ADMIN", "/admin/analytics")).toBe(true);
    expect(canOpenAdminHref("STUDENT", "/admin")).toBe(false);
  });

  it("the header shortcuts follow the same rule", () => {
    const labels = (role: string) => quickActionsFor("/admin", role).map((a) => a.href);
    expect(labels("ADMIN")).toEqual(["/admin/courses/new", "/admin/questions", "/admin/analytics"]);
    expect(labels("INSTRUCTOR")).toEqual(["/admin/courses/new", "/admin/questions"]);
    expect(quickActionsFor("/admin/courses", "INSTRUCTOR").map((a) => a.href)).toEqual(["/admin/courses/new", "/formations"]);
  });
});

describe("link addresses typed in the editor", () => {
  it("accepts web, e-mail, site paths and anchors", () => {
    expect(normalizeLinkUrl("https://developer.mozilla.org/fr/")).toBe("https://developer.mozilla.org/fr/");
    expect(normalizeLinkUrl("exemple.com/page")).toBe("https://exemple.com/page");
    expect(normalizeLinkUrl("mailto:contact@fygs.dev")).toBe("mailto:contact@fygs.dev");
    expect(normalizeLinkUrl("/formations")).toBe("/formations");
    expect(normalizeLinkUrl("#exemple")).toBe("#exemple");
  });

  it("refuses what could run or lead nowhere", () => {
    expect(normalizeLinkUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeLinkUrl("data:text/html,x")).toBeNull();
    expect(normalizeLinkUrl("//evil.example")).toBeNull();
    expect(normalizeLinkUrl("pas une adresse")).toBeNull();
    expect(normalizeLinkUrl("mailto:personne")).toBeNull();
    expect(normalizeLinkUrl("   ")).toBeNull();
    expect(normalizeLinkUrl("http://localhost:3000/x")).toBe("http://localhost:3000/x");
  });
});

describe("unsaved work in the builder", () => {
  it("asks before leaving only when closing an editor would lose changes", () => {
    expect(hasLosableChanges({})).toBe(false);
    // autosaved editors send their changes themselves when they close
    expect(hasLosableChanges({ course: { state: "dirty" }, lesson: { state: "saving" }, other: { state: "saved" } })).toBe(false);
    expect(hasLosableChanges({ "quiz-new": { state: "unsaved" } })).toBe(true);
    expect(hasLosableChanges({ course: { state: "error" } })).toBe(true);
  });
});
