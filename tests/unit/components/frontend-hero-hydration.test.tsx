import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { FrontendHero } from "@/app/[locale]/(main)/tech-mastry/frontend/_components/hero";
import { FrontendTopics } from "@/app/[locale]/(main)/tech-mastry/frontend/_components/frontend-topics";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

function Page() {
  return (
    <main>
      <FrontendHero />
      <FrontendTopics />
    </main>
  );
}

describe("/tech-mastry/frontend hydration (React #418)", () => {
  it("positions the hero icons with fixed-precision offsets", () => {
    const html = renderToString(<FrontendHero />);
    const lefts = [...html.matchAll(/left:calc\(50% \+ (-?[\d.e+-]+)px - 16px\)/g)].map((m) => m[1]);
    expect(lefts).toHaveLength(8);
    // Never a raw float such as 3.4285714285714284e-15: server and browser must serialize
    // the exact same string.
    for (const value of lefts) expect(value).toMatch(/^-?\d+\.\d{2}$/);
  });

  it("hydrates the server markup without a mismatch", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Page />);

    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      hydrateRoot(container, <Page />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError.mock.calls.filter((c) => /hydrat|did not match/i.test(String(c[0])))).toEqual([]);
  });
});

describe("locale-dependent number formatting (React #418 on /tech-mastry/algorithms/complexity)", () => {
  it("renders the same HTML whatever the default locale of the runtime", async () => {
    const { ComplexityCurvesVisualization } = await import(
      "@/app/[locale]/(main)/tech-mastry/algorithms/complexity/_components/visualizations/complexity-curves-visualization"
    );
    const original = Number.prototype.toLocaleString;
    let defaultLocale = "en-US";
    // Emulate runtimes whose default locale differs (Node on the server vs a French browser):
    // any call that does not pin a locale follows the "default".
    vi.spyOn(Number.prototype, "toLocaleString").mockImplementation(function (this: number, locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
      return original.call(this, locales ?? defaultLocale, options);
    });

    const server = renderToString(<ComplexityCurvesVisualization />);
    defaultLocale = "fr-FR";
    const frenchBrowser = renderToString(<ComplexityCurvesVisualization />);

    expect(frenchBrowser).toBe(server);
    // No call relies on the runtime default locale
    const spy = vi.mocked(Number.prototype.toLocaleString);
    expect(spy.mock.calls.length).toBeGreaterThan(0);
    expect(spy.mock.calls.filter(([locales]) => locales === undefined)).toEqual([]);
  });
});
