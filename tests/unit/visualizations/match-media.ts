import { vi } from "vitest";

/**
 * framer-motion reads window.matchMedia("(prefers-reduced-motion)") on mount.
 * Other suites replace it with mocks that return undefined, so the render-walk
 * harnesses install a neutral implementation (no reduced motion) around each
 * walk and put the previous one back afterwards.
 */
export function withNeutralMatchMedia<T>(run: () => T): T {
  const previous = window.matchMedia;
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
  try {
    return run();
  } finally {
    window.matchMedia = previous;
  }
}
