import { createHash } from "crypto";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { PerformanceChart } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/charts/performance-chart";
import { withNeutralMatchMedia } from "./match-media";

/**
 * Characterization of the d3 charts. jsdom has no layout (clientWidth is 0) and
 * no SVGPathElement.getTotalLength, so both are stubbed. d3 transitions run on
 * the real clock: the chart is hashed right after the draw (initial state of
 * every transition) and again once every transition has finished.
 */
const hash = (html: string) => createHash("md5").update(html).digest("hex").slice(0, 8);
const markup = (container: HTMLElement) =>
  container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[^>]*lucide[^>]*>[\s\S]*?<\/svg>/g, "<svg/>");
const sleep = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

const originals: { width?: PropertyDescriptor; length?: unknown } = {};

beforeAll(() => {
  originals.width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 900 });
  const proto = SVGElement.prototype as unknown as { getTotalLength?: () => number };
  originals.length = proto.getTotalLength;
  proto.getTotalLength = () => 321;
});

afterAll(() => {
  if (originals.width) Object.defineProperty(HTMLElement.prototype, "clientWidth", originals.width);
  else delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth;
  (SVGElement.prototype as unknown as { getTotalLength?: unknown }).getTotalLength = originals.length;
});

type Scenario = { name: string; metric: "performance" | "memory" | "usage"; tab?: string };
const scenarios: Scenario[] = [
  { name: "performance / line", metric: "performance" },
  { name: "performance / bar", metric: "performance", tab: "Barres" },
  { name: "memory", metric: "memory" },
  { name: "usage", metric: "usage" },
];

async function run({ metric, tab }: Scenario) {
  return withNeutralMatchMedia(async () => {
    const { container, getByText } = render(<PerformanceChart metric={metric} />);
    if (tab) {
      const trigger = getByText(tab).closest("button")!;
      fireEvent.mouseDown(trigger, { button: 0 });
      fireEvent.click(trigger);
    }
    const initial = hash(markup(container));
    await sleep(2600);
    const settled = hash(markup(container));
    // hover a shape once the entry animation is over: both handlers are exercised
    const shape = container.querySelector("circle, rect.bar, path.radarArea");
    let hoverIn = "";
    if (shape) {
      fireEvent.mouseOver(shape);
      await sleep(400);
      hoverIn = hash(markup(container));
      fireEvent.mouseOut(shape);
      await sleep(400);
    }
    const hovered = hash(markup(container));
    const texts = [...container.querySelectorAll("svg text")].map((t) => t.textContent);
    const titles = [...container.querySelectorAll("svg title")].map((t) => t.textContent);
    cleanup();
    return { initial, settled, hoverIn, hovered, texts: hash(JSON.stringify(texts)), titles: hash(JSON.stringify(titles)), textCount: texts.length, titleCount: titles.length };
  });
}

describe("PerformanceChart rendering", () => {
  it.each(scenarios)("draws the same chart: $name", async (scenario) => {
    expect(await run(scenario)).toMatchSnapshot();
  }, 15000);

  it("shows the line/bar switch for the performance metric only", () => {
    const perf = render(<PerformanceChart metric="performance" />);
    expect(perf.queryByText("Ligne")).not.toBeNull();
    expect(perf.queryByText("Barres")).not.toBeNull();
    perf.unmount();
    const memory = render(<PerformanceChart metric="memory" />);
    expect(memory.queryByText("Ligne")).toBeNull();
    vi.restoreAllMocks();
  });

  it("is deterministic", async () => {
    const [a, b] = [await run(scenarios[0]), await run(scenarios[0])];
    expect(a).toEqual(b);
  }, 15000);
});
