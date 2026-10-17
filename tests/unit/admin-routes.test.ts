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
    // Every static /admin/... href written in the shared admin components is either listed
    // or filtered by isAdminHrefAvailable (the three components call it).
    const dir = join(ADMIN_DIR, "_components");
    for (const file of ["admin-sidebar.tsx", "admin-quick-actions.tsx", "quick-actions.tsx"]) {
      expect(readFileSync(join(dir, file), "utf8"), file).toContain("isAdminHrefAvailable");
    }
    expect(statSync(dir).isDirectory()).toBe(true);
    expect(readdirSync(dir).length).toBeGreaterThan(0);
  });
});
