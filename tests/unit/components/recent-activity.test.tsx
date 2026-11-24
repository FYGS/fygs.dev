import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { RecentActivity } from "@/app/[locale]/(admin)/admin/_components/recent-activity";
import { formatTimeAgo, type AdminActivity } from "@/lib/services/admin-activity";

const NOW = new Date("2026-01-01T12:00:00Z");
const minutesBefore = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);

const activities: AdminActivity[] = [
  {
    id: "user:1",
    type: "user_registered",
    title: "Nouvel utilisateur",
    description: "Alice Martin s'est inscrit(e)",
    userName: "Alice Martin",
    userImage: null,
    at: minutesBefore(5),
  },
  {
    id: "payment:1",
    type: "payment_received",
    title: "Paiement reçu",
    description: "49.90 EUR pour 'Next.js'",
    userName: "Marie Bernard",
    userImage: null,
    at: minutesBefore(125),
  },
];

describe("RecentActivity", () => {
  it("renders the activities it is given, not sample data", () => {
    const text = render(<RecentActivity activities={activities} now={NOW} />).container.textContent;
    expect(text).toContain("Alice Martin s'est inscrit(e)");
    expect(text).toContain("49.90 EUR pour 'Next.js'");
    expect(text).not.toContain("Next.js 15 Mastery");
    expect(text).not.toContain("Thomas Dubois");
  });

  // The server renders the labels once and sends them as text: no clock is read while rendering.
  it("computes the labels from the `now` it receives, so the output is stable", () => {
    const first = render(<RecentActivity activities={activities} now={NOW} />).container.innerHTML;
    const second = render(<RecentActivity activities={activities} now={NOW} />).container.innerHTML;
    expect(second).toBe(first);
    expect(first).toContain("Il y a 5min");
    expect(first).toContain("Il y a 2h");
  });

  it("says so when nothing happened yet", () => {
    const { container } = render(<RecentActivity activities={[]} now={NOW} />);
    expect(container.textContent).toContain("Aucune activité récente");
  });

  it("shows initials as the avatar fallback", () => {
    const { container } = render(<RecentActivity activities={activities} now={NOW} />);
    expect(container.textContent).toContain("AM");
    expect(container.textContent).toContain("MB");
  });
});

describe("formatTimeAgo", () => {
  it.each([
    [0, "À l'instant"],
    [1, "Il y a 1min"],
    [59, "Il y a 59min"],
    [60, "Il y a 1h"],
    [23 * 60 + 59, "Il y a 23h"],
    [24 * 60, "Il y a 1j"],
    [3 * 24 * 60, "Il y a 3j"],
  ])("%i minutes ago -> %s", (minutes, label) => {
    expect(formatTimeAgo(minutesBefore(minutes), NOW)).toBe(label);
  });

  it("never shows a negative age when the clocks differ slightly", () => {
    expect(formatTimeAgo(new Date(NOW.getTime() + 5_000), NOW)).toBe("À l'instant");
  });
});
