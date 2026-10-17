import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { RecentActivity } from "@/app/[locale]/(admin)/admin/_components/recent-activity";

afterEach(() => vi.useRealTimers());

// The server renders this component long before the browser hydrates it (and the
// server process may have started hours earlier): its labels must not depend on the clock.
describe("RecentActivity", () => {
  it("renders the same labels whatever the time", () => {
    vi.useFakeTimers({ now: new Date("2026-01-01T10:00:00Z") });
    const first = render(<RecentActivity />).container.innerHTML;
    vi.setSystemTime(new Date("2026-01-01T13:37:42Z"));
    const second = render(<RecentActivity />).container.innerHTML;
    expect(second).toBe(first);
    expect(first).toContain("Il y a 5min");
    expect(first).toContain("Il y a 2h");
  });
});
