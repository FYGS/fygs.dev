import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ requestPasswordReset: vi.fn(), toastError: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { error: h.toastError, success: vi.fn() } }));
vi.mock("@/lib/auth-client", () => ({ twoFactor: {} }));
vi.mock("@/lib/auth-service", () => ({ authService: { requestPasswordReset: h.requestPasswordReset } }));

import { TwoFactorCard } from "@/app/[locale]/(main)/profile/security/_components/two-factor-card";

const SEND = /Recevoir par e-mail un lien pour définir mon mot de passe/;

beforeEach(() => {
  h.requestPasswordReset.mockReset().mockResolvedValue({ success: true });
  h.toastError.mockReset();
});
afterEach(cleanup);

describe("TwoFactorCard for an account that signs in with Google or GitHub", () => {
  it("offers to send the link that defines a password, to the account address, instead of a bare sentence", async () => {
    render(<TwoFactorCard enabled={false} hasPassword={false} email="admin@example.com" staffRole="ADMIN" pendingStaff />);

    fireEvent.click(screen.getByRole("button", { name: SEND }));

    await waitFor(() => expect(h.requestPasswordReset).toHaveBeenCalledWith("admin@example.com"));
    expect(await screen.findByRole("status")).toHaveTextContent("E-mail envoyé à admin@example.com");
    // the way to turn the second factor on only appears once a password exists
    expect(screen.queryByRole("button", { name: /Activer/ })).toBeNull();
  });

  it("can send the link again, and reports a failure without losing the button", async () => {
    h.requestPasswordReset.mockResolvedValueOnce({ success: false, error: "smtp down" });
    render(<TwoFactorCard enabled={false} hasPassword={false} email="admin@example.com" staffRole="ADMIN" pendingStaff />);

    fireEvent.click(screen.getByRole("button", { name: SEND }));
    await waitFor(() => expect(h.toastError).toHaveBeenCalledWith("Le lien n'a pas pu être envoyé", { description: "smtp down" }));
    expect(screen.getByRole("button", { name: SEND })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: SEND }));
    await screen.findByRole("status");
    fireEvent.click(screen.getByRole("button", { name: "Renvoyer le lien" }));
    expect(screen.getByRole("button", { name: SEND })).toBeInTheDocument();
  });

  it("keeps the forgot-password page as a second way, and shows nothing of this for an account with a password", () => {
    const { unmount } = render(<TwoFactorCard enabled={false} hasPassword={false} email="a@b.c" staffRole={null} pendingStaff={false} />);
    expect(screen.getByRole("link", { name: /Mot de passe oublié/ })).toHaveAttribute("href", "/auth/forgot-password");
    unmount();

    render(<TwoFactorCard enabled={false} hasPassword email="a@b.c" staffRole={null} pendingStaff={false} />);
    expect(screen.queryByRole("button", { name: SEND })).toBeNull();
  });
});
