import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sandbox = vi.hoisted(() => ({ runInSandbox: vi.fn() }));
vi.mock("@/app/_lib/code-sandbox", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/_lib/code-sandbox")>()),
  runInSandbox: sandbox.runInSandbox,
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
// Monaco cannot load in jsdom: a textarea with the same contract
vi.mock("@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/code-editor/code-editor", () => ({
  CodeEditor: ({ initialCode, onCodeChange, onRun }: { initialCode: string; onCodeChange?: (code: string) => void; onRun?: (code: string) => void }) => (
    <div>
      <textarea aria-label="Code editor" defaultValue={initialCode} onChange={(event) => onCodeChange?.(event.target.value)} />
      <button type="button" onClick={() => onRun?.("")}>
        Editor run
      </button>
    </div>
  ),
}));

import { AdvancedCodingChallenges } from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges";
import { challenges } from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges/data";
import { STORAGE_KEY } from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";

const twoSum = challenges[0];
const tests = twoSum.testCases; // 2 visible, 2 hidden

type Outcome = { id: string; passed: boolean; actual?: string; error?: string }[];
const outcome = (results: Outcome, extra: Record<string, unknown> = {}) => ({
  passed: results.length > 0 && results.every((r) => r.passed),
  timedOut: false,
  logs: [],
  totalMs: 4,
  results: results.map((r) => ({ actual: "[0,1]", expected: "[0,1]", timeMs: 2, ...r })),
  ...extra,
});
const allPass = outcome(tests.map((t) => ({ id: t.id, passed: true })));
const storedProgress = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

const open = async (title = "Two Sum") => {
  render(<AdvancedCodingChallenges />);
  fireEvent.click(await screen.findByRole("button", { name: new RegExp(title) }));
  await screen.findByRole("button", { name: "Submit Solution" });
};

beforeEach(() => {
  // framer-motion reads matchMedia on mount
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  localStorage.clear();
  sandbox.runInSandbox.mockReset();
  toast.success.mockReset();
  toast.error.mockReset();
});
afterEach(cleanup);

describe("AdvancedCodingChallenges", () => {
  it("lists the challenges as real buttons, named by their title, and opens one", async () => {
    render(<AdvancedCodingChallenges />);

    for (const challenge of challenges) {
      const card = await screen.findByRole("button", { name: new RegExp(challenge.title) });
      // a native <button> is focusable and answers Enter and Space without any key handler
      expect(card.tagName).toBe("BUTTON");
      expect(card).toHaveAttribute("type", "button");
    }
    fireEvent.click(screen.getByRole("button", { name: /Valid Parentheses/ }));
    expect(await screen.findByRole("heading", { name: /Valid Parentheses/ })).toBeInTheDocument();
  });

  it("tells a screen reader which challenges are solved", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ challengesCompleted: [twoSum.id] }));
    render(<AdvancedCodingChallenges />);

    expect(await screen.findByRole("button", { name: /^Two Sum\s*\(résolu\)$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Valid Parentheses" })).toBeInTheDocument();
  });

  it("shows the starter code in an editor and the tests, hiding what hidden tests contain", async () => {
    await open();

    expect(screen.getByLabelText("Code editor")).toHaveValue(twoSum.starterCode);
    expect(screen.getAllByText("Hidden test")).toHaveLength(tests.filter((t) => t.isHidden).length * 2); // input + expected
    expect(screen.getByText(tests[0].input)).toBeInTheDocument();
    expect(screen.queryByText(tests.find((t) => t.isHidden)!.input)).not.toBeInTheDocument();
  });

  it("submits what was typed, with every test, and records the attempt", async () => {
    sandbox.runInSandbox.mockResolvedValue(allPass);
    await open();
    fireEvent.change(screen.getByLabelText("Code editor"), { target: { value: "function twoSum() { return [0, 1]; }" } });

    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));

    expect(await screen.findByText("All Tests Passed!")).toBeInTheDocument();
    const request = sandbox.runInSandbox.mock.calls[0][0];
    expect(request.code).toBe("function twoSum() { return [0, 1]; }");
    expect(request.entry).toBe("twoSum");
    expect(request.tests.map((t: { id: string }) => t.id)).toEqual(tests.map((t) => t.id));
    expect(request.tests[0]).toMatchObject({ input: tests[0].input, expected: tests[0].expectedOutput });
    expect(screen.getByText("4/4")).toBeInTheDocument();

    expect(storedProgress().challengeAttempts[twoSum.id]).toMatchObject({ attempts: 1, bestPassed: 4, total: 4 });
    expect(storedProgress().challengesCompleted).toContain(twoSum.id);
    expect(toast.success).toHaveBeenCalledWith("Challenge solved: Two Sum");
    expect(await screen.findByText("Solved")).toBeInTheDocument();
  });

  it("a failing submission shows what each test returned, counts as an attempt and does not complete the challenge", async () => {
    sandbox.runInSandbox.mockResolvedValue(
      outcome([
        { id: "1", passed: true },
        { id: "2", passed: false, actual: "[9,9]" },
        { id: "3", passed: false, actual: "[8,8]" },
        { id: "4", passed: true },
      ]),
    );
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));

    expect(await screen.findByText("Some Tests Failed")).toBeInTheDocument();
    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getByText("[9,9]")).toBeInTheDocument(); // visible test: what the function returned
    expect(screen.queryByText("[8,8]")).not.toBeInTheDocument(); // hidden test: pass/fail only
    expect(within(screen.getByTestId("test-case-3")).getByText("Failed")).toBeInTheDocument();
    expect(storedProgress().challengeAttempts[twoSum.id]).toMatchObject({ attempts: 1, bestPassed: 2 });
    expect(storedProgress().challengesCompleted).not.toContain(twoSum.id);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("running one test runs only that test and is not a submission", async () => {
    sandbox.runInSandbox.mockResolvedValue(outcome([{ id: "2", passed: true }]));
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Run test 2" }));

    await waitFor(() => expect(sandbox.runInSandbox).toHaveBeenCalled());
    expect(sandbox.runInSandbox.mock.calls[0][0].tests.map((t: { id: string }) => t.id)).toEqual(["2"]);
    await screen.findByText("Passed");
    expect(storedProgress()?.challengeAttempts ?? {}).toEqual({});
  });

  it("tells a syntax error from a wrong answer", async () => {
    sandbox.runInSandbox.mockResolvedValue(outcome([], { passed: false, compileError: "SyntaxError: Unexpected token" }));
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Your code could not run");
    expect(screen.getByRole("alert")).toHaveTextContent("SyntaxError: Unexpected token");
  });

  it("explains a timeout", async () => {
    sandbox.runInSandbox.mockResolvedValue(
      outcome([{ id: "1", passed: false, error: "Time limit exceeded (5000 ms)" }, { id: "2", passed: false }], { timedOut: true }),
    );
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));

    expect(await screen.findByText("Time limit exceeded")).toBeInTheDocument();
  });

  it("shows what the code logged", async () => {
    sandbox.runInSandbox.mockResolvedValue({ ...allPass, logs: ["n = 7"] });
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));

    expect(await screen.findByText("n = 7")).toBeInTheDocument();
  });

  it("says so when the sandbox itself is unreachable, without counting an attempt", async () => {
    sandbox.runInSandbox.mockRejectedValue(new Error("Le moteur d'exécution ne répond plus"));
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));

    expect(await screen.findByText("Le moteur d'exécution ne répond plus")).toBeInTheDocument();
    expect(screen.queryByText("All Tests Passed!")).not.toBeInTheDocument();
    expect(storedProgress()?.challengeAttempts ?? {}).toEqual({});
    expect(screen.getByRole("button", { name: "Submit Solution" })).toBeEnabled(); // it can be retried
  });

  it("runs the editor's own Run button as a submission", async () => {
    sandbox.runInSandbox.mockResolvedValue(allPass);
    await open();

    fireEvent.click(screen.getByRole("button", { name: "Editor run" }));

    expect(await screen.findByText("All Tests Passed!")).toBeInTheDocument();
  });

  it("Reset gives the starter code back", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("Code editor"), { target: { value: "garbage" } });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => expect(screen.getByLabelText("Code editor")).toHaveValue(twoSum.starterCode));
  });

  it("keeps what you typed while you look at another challenge", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("Code editor"), { target: { value: "my draft" } });

    fireEvent.click(screen.getByRole("button", { name: /Back to Challenges/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Two Sum/ }));

    expect(await screen.findByLabelText("Code editor")).toHaveValue("my draft");
  });

  it("a hint costs points, and you cannot buy one you cannot afford", async () => {
    await open();
    const buy = screen.getAllByRole("button", { name: "Reveal Hint" });

    fireEvent.click(buy[0]); // free
    fireEvent.click(buy[1]); // 10
    fireEvent.click(buy[2]); // 20 -> 70 left
    expect(screen.getByText("Points: 70")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("Your Progress counts what was really solved", async () => {
    sandbox.runInSandbox.mockResolvedValue(allPass);
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Submit Solution" }));
    await screen.findByText("All Tests Passed!");

    const tab = screen.getByRole("tab", { name: /Your Progress/ });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    const panel = await screen.findByRole("tabpanel");
    expect(within(panel).getByText("Challenges solved").parentElement).toHaveTextContent("1/3");
    expect(within(panel).getByText(/1 submission so far/)).toBeInTheDocument();
    expect(within(panel).queryByText(/78%|12\/15/)).not.toBeInTheDocument(); // the old made-up figures
  });

  it("has no leaderboard of made-up players", async () => {
    render(<AdvancedCodingChallenges />);
    await screen.findByRole("button", { name: /Two Sum/ });

    expect(screen.queryByRole("tab", { name: /Leaderboard/ })).not.toBeInTheDocument();
  });
});
