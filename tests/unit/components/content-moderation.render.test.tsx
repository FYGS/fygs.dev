import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/community-actions", () => ({
  moderateContent: vi.fn(async () => ({ success: true })),
  updateUserRole: vi.fn(),
  deleteDiscussion: vi.fn(),
  deleteReply: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ContentModeration } from "@/components/community/admin-dashboard";

/**
 * Regression: /admin/community/moderation is a server component and passed
 * `onContentAction={function}` to this client component. React refuses functions across
 * that boundary ("Event handlers cannot be passed to Client Component props") and the page
 * fell into its error boundary. The prop is now optional and the page passes serialisable data only.
 */
describe("ContentModeration", () => {
  it("renders with serialisable props only (no callback)", () => {
    render(
      <ContentModeration
        discussions={[
          {
            id: "d1",
            title: "Une discussion",
            content: "Contenu",
            author: { id: "u1", name: "Alice Martin" },
            topic: { id: "t1", name: "Général" },
            isModerated: false,
            isFlagged: false,
            createdAt: new Date("2026-01-01T10:00:00Z"),
            repliesCount: 0,
            votesCount: 0,
            viewsCount: 0,
          },
        ]}
        replies={[]}
      />,
    );
    expect(screen.getByText("Une discussion")).toBeTruthy();
  });
});
