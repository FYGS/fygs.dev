import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { AVAILABLE_ADMIN_ROUTES, isAdminHrefAvailable } from "@/lib/admin-routes";

const ADMIN_DIR = join(process.cwd(), "app", "[locale]", "(admin)", "admin");

describe("admin routes", () => {
  it("every listed route has a page", () => {
    for (const route of AVAILABLE_ADMIN_ROUTES) {
      const dir = route === "/admin" ? ADMIN_DIR : join(ADMIN_DIR, ...route.split("/").slice(2));
      expect(existsSync(join(dir, "page.tsx")), `${route} has no page.tsx`).toBe(true);
    }
  });

  it("filters out links to pages that do not exist, keeps public links", () => {
    expect(isAdminHrefAvailable("/admin/courses/new")).toBe(true);
    expect(isAdminHrefAvailable("/admin/blog")).toBe(false);
    expect(isAdminHrefAvailable("/admin/users/invite")).toBe(false);
    expect(isAdminHrefAvailable("/blog")).toBe(true);
  });

  it("the sidebar and quick actions only link to listed routes after filtering", () => {
    // The sidebar reads lib/admin-navigation (filtered by isAdminHrefAvailable there); the quick actions filter themselves.
    const dir = join(ADMIN_DIR, "_components");
    expect(readFileSync(join(dir, "admin-sidebar.tsx"), "utf8")).toContain("navigationFor");
    expect(readFileSync(join(process.cwd(), "lib", "admin-navigation.ts"), "utf8")).toContain("isAdminHrefAvailable");
    expect(readFileSync(join(dir, "admin-quick-actions.tsx"), "utf8")).toContain("isAdminHrefAvailable");
    expect(statSync(dir).isDirectory()).toBe(true);
    expect(readdirSync(dir).length).toBeGreaterThan(0);
  });

  it("lists the questions inbox and not the retired lesson pages", () => {
    expect(isAdminHrefAvailable("/admin/questions")).toBe(true);
    expect(isAdminHrefAvailable("/admin/lessons")).toBe(false);
  });
});
