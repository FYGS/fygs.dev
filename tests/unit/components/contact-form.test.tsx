import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";

// The real `intlayer` package pulls esbuild, which cannot run in jsdom
vi.mock("intlayer", () => ({ t: (translation: unknown) => ({ nodeType: "translation", translation }) }));

// Every text of the dictionary is "text": the test is about what the form sends, not about its wording
const anyText: unknown = new Proxy(() => undefined, {
  get: (_target, prop) => (prop === "value" || prop === Symbol.toPrimitive ? (prop === "value" ? "text" : () => "text") : anyText),
});
vi.mock("next-intlayer", () => ({ useIntlayer: () => anyText, useLocale: () => ({ locale: "en" }) }));

const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/lib/notification-store", () => ({ notify }));

const solveHumanProof = vi.hoisted(() => vi.fn());
vi.mock("@/lib/anti-automation/client", () => ({ solveHumanProof }));

import { ContactForm } from "@/components/contact/contact-form";

const fetchMock = vi.fn();

function fillAndSubmit(container: HTMLElement) {
  fireEvent.change(container.querySelector("#name")!, { target: { value: "Test User" } });
  fireEvent.change(container.querySelector("#email")!, { target: { value: "test@example.com" } });
  fireEvent.change(container.querySelector("#subject")!, { target: { value: "Un SaaS sur mesure" } });
  fireEvent.change(container.querySelector("#message")!, { target: { value: "Un besoin bien décrit ici." } });
  fireEvent.submit(container.querySelector("form")!);
}

describe("contact form: proof of work and honeypot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    solveHumanProof.mockResolvedValue({ "x-human-proof": "proof-123" });
  });

  it("sends the human proof the route requires in production", async () => {
    const { container } = render(<ContactForm />);
    fillAndSubmit(container);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(solveHumanProof).toHaveBeenCalledWith("contact");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(init.headers["x-human-proof"]).toBe("proof-123");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("renders the invisible honeypot field, empty, and does not send it when nobody filled it", async () => {
    const { container } = render(<ContactForm />);
    const trap = container.querySelector<HTMLInputElement>('input[name="fx_trap"]');
    expect(trap).not.toBeNull();
    expect(trap!.value).toBe("");

    fillAndSubmit(container);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty("fx_trap");
  });

  it("carries the honeypot in the body when a script filled it, so the route can drop the message", async () => {
    const { container } = render(<ContactForm />);
    fireEvent.change(container.querySelector('input[name="fx_trap"]')!, { target: { value: "bot" } });
    fillAndSubmit(container);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).fx_trap).toBe("bot");
  });

  it("still sends the message, without proof, when none can be made", async () => {
    solveHumanProof.mockResolvedValue({});
    const { container } = render(<ContactForm />);
    fillAndSubmit(container);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][1].headers["x-human-proof"]).toBeUndefined();
    expect(container.querySelector("form")).not.toBeNull(); // the form is still on screen
  });
});
