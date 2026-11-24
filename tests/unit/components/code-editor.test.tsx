import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  loadMonaco: vi.fn(),
  loaderConfig: vi.fn(),
  runScript: vi.fn(),
}));

vi.mock("@/app/_lib/monaco-loader", () => ({ loadMonaco: m.loadMonaco }));
vi.mock("@/app/_lib/code-sandbox", () => ({ runScriptInSandbox: m.runScript }));
vi.mock("@/providers/theme-provider", () => ({ useTheme: () => ({ theme: "light" }) }));
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("@monaco-editor/react", () => ({
  default: ({ value }: { value: string }) => <div data-testid="monaco" data-value={value} />,
  loader: { config: m.loaderConfig },
}));

/** The editor remembers whether Monaco loaded: every test starts from a fresh module. */
async function load() {
  vi.resetModules();
  return (await import("@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/code-editor/code-editor")).CodeEditor;
}

beforeEach(() => {
  m.loadMonaco.mockReset();
  m.loaderConfig.mockReset();
  m.runScript.mockReset();
});
afterEach(cleanup);

describe("CodeEditor", () => {
  it("hands the bundled Monaco to the React wrapper, so nothing is fetched from a CDN", async () => {
    const monaco = { editor: {} };
    m.loadMonaco.mockResolvedValue(monaco);
    const CodeEditor = await load();

    render(<CodeEditor initialCode="let a = 1" />);

    expect(await screen.findByTestId("monaco")).toHaveAttribute("data-value", "let a = 1");
    expect(m.loaderConfig).toHaveBeenCalledWith({ monaco });
  });

  it("says the editor is loading, then shows it", async () => {
    let finish: (value: unknown) => void = () => {};
    m.loadMonaco.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const CodeEditor = await load();

    render(<CodeEditor initialCode="x" />);
    expect(screen.getByRole("status")).toHaveTextContent("Chargement");
    expect(screen.queryByTestId("monaco")).not.toBeInTheDocument();

    finish({ editor: {} });
    expect(await screen.findByTestId("monaco")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("falls back to a plain text area when Monaco cannot load, and stays usable", async () => {
    m.loadMonaco.mockResolvedValue(null);
    const onCodeChange = vi.fn();
    const CodeEditor = await load();

    render(<CodeEditor initialCode="start" title="Mon exercice" onCodeChange={onCodeChange} />);

    const area = await screen.findByRole("textbox", { name: "Mon exercice" });
    expect(area).toHaveValue("start");
    fireEvent.change(area, { target: { value: "edited" } });
    expect(onCodeChange).toHaveBeenCalledWith("edited");
    expect(area).toHaveValue("edited");
    expect(screen.getByRole("button", { name: /Formater/ })).toBeDisabled(); // formatting is a Monaco action
  });

  it("resets to the initial code", async () => {
    m.loadMonaco.mockResolvedValue(null);
    const CodeEditor = await load();
    render(<CodeEditor initialCode="start" title="Ex" />);
    const area = await screen.findByRole("textbox", { name: "Ex" });
    fireEvent.change(area, { target: { value: "edited" } });

    fireEvent.click(screen.getByRole("button", { name: /Réinitialiser/ }));

    expect(area).toHaveValue("start");
  });

  it("without onRun, the Run button runs the code in the sandbox and shows its output", async () => {
    m.loadMonaco.mockResolvedValue(null);
    m.runScript.mockResolvedValue({ ok: true, value: "3", logs: ["bonjour", "42"], timedOut: false, totalMs: 4 });
    const CodeEditor = await load();
    render(<CodeEditor initialCode="console.log('bonjour')" title="Ex" />);
    await screen.findByRole("textbox", { name: "Ex" });

    fireEvent.click(screen.getByRole("button", { name: /Exécuter/ }));

    await waitFor(() => expect(m.runScript).toHaveBeenCalledWith("console.log('bonjour')"));
    expect(await screen.findByText(/bonjour\s+42\s+Résultat: 3/)).toBeInTheDocument();
  });

  it("shows the error of code that throws", async () => {
    m.loadMonaco.mockResolvedValue(null);
    m.runScript.mockResolvedValue({ ok: false, error: "TypeError: x is not a function", logs: ["avant"], timedOut: false, totalMs: 1 });
    const CodeEditor = await load();
    render(<CodeEditor initialCode="x()" title="Ex" />);
    await screen.findByRole("textbox", { name: "Ex" });

    fireEvent.click(screen.getByRole("button", { name: /Exécuter/ }));

    expect(await screen.findByText(/avant\s+Erreur: TypeError: x is not a function/)).toBeInTheDocument();
  });

  it("explains a sandbox that cannot be reached", async () => {
    m.loadMonaco.mockResolvedValue(null);
    m.runScript.mockRejectedValue(new Error("Le moteur d'exécution ne répond plus"));
    const CodeEditor = await load();
    render(<CodeEditor initialCode="1" title="Ex" />);
    await screen.findByRole("textbox", { name: "Ex" });

    fireEvent.click(screen.getByRole("button", { name: /Exécuter/ }));

    expect(await screen.findByText("Le moteur d'exécution ne répond plus")).toBeInTheDocument();
  });

  it("with onRun, the Run button hands over the code and does not use the sandbox itself", async () => {
    m.loadMonaco.mockResolvedValue(null);
    const onRun = vi.fn();
    const CodeEditor = await load();
    render(<CodeEditor initialCode="mine" title="Ex" onRun={onRun} />);
    await screen.findByRole("textbox", { name: "Ex" });

    fireEvent.click(screen.getByRole("button", { name: /Exécuter/ }));

    await waitFor(() => expect(onRun).toHaveBeenCalledWith("mine"));
    expect(m.runScript).not.toHaveBeenCalled();
  });
});
