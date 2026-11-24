import { describe, expect, it } from "vitest";
import { isTranslatedPath } from "@/lib/locale-utils";
import { localizedUrls } from "@/app/_lib/localized-urls";

describe("isTranslatedPath", () => {
  it("is true for the pages that read dictionaries", () => {
    for (const path of ["/", "", "/contact", "/blog", "/blog/a-post", "/me", "/projects", "/auth/login", "/auth/register"]) {
      expect(isTranslatedPath(path), path).toBe(true);
    }
  });

  it("is false for the application area, and for a longer word that starts like a translated page", () => {
    for (const path of ["/dashboard", "/formations/x", "/pricing", "/community", "/tech-mastry", "/admin/users", "/profile", "/blogger", "/authors"]) {
      expect(isTranslatedPath(path), path).toBe(false);
    }
  });
});

describe("localizedUrls", () => {
  it("gives every language for a translated page", () => {
    const urls = localizedUrls("/contact");
    expect(Object.values(urls).sort()).toEqual(["/contact", "/en/contact", "/es/contact"]);
  });

  it("gives French only for the application area (the default language has no prefix): no alternate that redirects", () => {
    expect(Object.values(localizedUrls("/formations"))).toEqual(["/formations"]);
    expect(Object.values(localizedUrls("/tech-mastry"))).toEqual(["/tech-mastry"]);
  });
});
