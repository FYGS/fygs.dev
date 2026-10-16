// @vitest-environment node
import { createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import ResumePage from "@/app/[locale]/(main)/me/page";

async function html(locale: string) {
  const element = await ResumePage({ params: Promise.resolve({ locale }) });
  // the tooltip provider lives in the app layout
  return renderToStaticMarkup(<TooltipProvider>{element}</TooltipProvider>);
}

const digest = (s: string) => createHash("md5").update(s).digest("hex").slice(0, 8);

describe("/me page rendering (server component, real intlayer dictionaries)", () => {
  it("renders the same markup for every locale", async () => {
    const result: Record<string, [number, string]> = {};
    for (const locale of ["en", "fr", "es"]) {
      const markup = await html(locale);
      result[locale] = [markup.length, digest(markup)];
    }
    expect(result).toMatchInlineSnapshot(`
      {
        "en": [
          112378,
          "2b5e9f6d",
        ],
        "es": [
          112610,
          "61c686c4",
        ],
        "fr": [
          112745,
          "4f43ea18",
        ],
      }
    `);
  });

  it("is deterministic and localised", async () => {
    const en = await html("en");
    expect(await html("en")).toBe(en);
    expect(await html("fr")).not.toBe(en);
    expect(en).toContain("Fernand SOUALO");
    expect(en).toContain("fygs.dev@gmail.com");
  });
});
