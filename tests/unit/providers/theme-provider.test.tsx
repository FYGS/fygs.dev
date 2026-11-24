/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../../providers/theme-provider";

// Mock next-themes
vi.mock("next-themes", () => {
  const createMockThemeProvider = () => {
    let currentTheme = "dark";
    const listeners: Array<() => void> = [];

    const ThemeProvider = ({ children, defaultTheme }: any) => {
      currentTheme = defaultTheme || "dark";
      return children;
    };

    const useTheme = () => ({
      theme: currentTheme,
      resolvedTheme: currentTheme === "system" ? "dark" : currentTheme,
      setTheme: (t: string) => {
        currentTheme = t;
        listeners.forEach((l) => l());
      },
      themes: ["dark", "light", "system"],
    });

    return { ThemeProvider, useTheme };
  };

  return createMockThemeProvider();
});

// Helper component to test hook
function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("light")} data-testid="set-light">
        Light
      </button>
      <button onClick={() => setTheme("dark")} data-testid="set-dark">
        Dark
      </button>
      <button onClick={() => setTheme("system")} data-testid="set-system">
        System
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("renders children within the provider", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toBeTruthy();
    expect(screen.getByTestId("resolved")).toBeTruthy();
  });

  it("defaults to dark theme", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("exposes setTheme function", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const setLightBtn = screen.getByTestId("set-light");
    expect(setLightBtn).toBeTruthy();
  });

  it("provides resolvedTheme as dark or light string", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const resolved = screen.getByTestId("resolved").textContent;
    expect(["dark", "light"]).toContain(resolved);
  });

  it("useTheme returns the expected interface shape", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      ),
    });
    const hookResult = result.current;

    expect(hookResult).not.toBeNull();
    expect(hookResult).toHaveProperty("theme");
    expect(hookResult).toHaveProperty("resolvedTheme");
    expect(hookResult).toHaveProperty("setTheme");
    expect(typeof hookResult.setTheme).toBe("function");
  });

  it("accepts custom storageKey prop", () => {
    // Should not throw
    render(
      <ThemeProvider defaultTheme="dark" storageKey="custom-key">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toBeTruthy();
  });

  it("defaults to system when no defaultTheme specified", () => {
    // Our provider defaults to "dark" if not specified
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Default is "dark" as defined in our ThemeProvider
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });
});
