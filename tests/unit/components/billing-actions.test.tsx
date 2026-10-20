import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const m = vi.hoisted(() => ({
  cancel: vi.fn(),
  switchPlan: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@/app/[locale]/(main)/dashboard/actions/cancelSubscription", () => ({ cancelSubscription: m.cancel }));
vi.mock("@/app/[locale]/(main)/dashboard/actions/switchSubscriptionPlan", () => ({ switchSubscriptionPlan: m.switchPlan }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: m.refresh }) }));
vi.mock("sonner", () => ({ toast: { success: m.success, error: m.error } }));

import { BillingActions } from "@/components/billing/billing-actions";

beforeEach(() => vi.clearAllMocks());

const open = () => fireEvent.click(screen.getByRole("button", { name: "Annuler l'abonnement" }));

describe("BillingActions", () => {
  it("offers the cancellation only for an active subscription that is not already cancelled", () => {
    const active = render(<BillingActions subscriptionStatus="ACTIVE" cancelAtPeriodEnd={false} />);
    expect(screen.queryByRole("button", { name: "Annuler l'abonnement" })).not.toBeNull();
    active.unmount();

    const scheduled = render(<BillingActions subscriptionStatus="ACTIVE" cancelAtPeriodEnd />);
    expect(screen.queryByRole("button", { name: "Annuler l'abonnement" })).toBeNull();
    expect(scheduled.container.textContent).toContain("reprendre votre abonnement");
    scheduled.unmount();

    render(<BillingActions subscriptionStatus="CANCELED" cancelAtPeriodEnd={false} />);
    expect(screen.queryByRole("button", { name: "Annuler l'abonnement" })).toBeNull();
  });

  it("always keeps the portal entry", () => {
    render(<BillingActions subscriptionStatus="CANCELED" />);
    expect(screen.queryByRole("button", { name: "Gérer l'abonnement" })).not.toBeNull();
  });

  it("asks for confirmation, with the end date, and cancels nothing until it is given", () => {
    render(<BillingActions subscriptionStatus="ACTIVE" periodEnd="12 novembre 2026" />);
    open();

    expect(screen.getByRole("alertdialog").textContent).toContain("12 novembre 2026");
    fireEvent.click(screen.getByRole("button", { name: "Garder mon abonnement" }));
    expect(m.cancel).not.toHaveBeenCalled();
  });

  it("cancels at the end of the period once confirmed, then refreshes the page", async () => {
    m.cancel.mockResolvedValue({ success: true, message: "ok" });
    render(<BillingActions subscriptionStatus="ACTIVE" />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Confirmer l'annulation" }));

    await waitFor(() => expect(m.refresh).toHaveBeenCalled());
    expect(m.cancel).toHaveBeenCalledWith({ immediate: false });
    expect(m.success).toHaveBeenCalled();
  });

  it("tells the user, in French, when the cancellation fails", async () => {
    m.cancel.mockResolvedValue({ success: false, message: "Subscription is not active", error: "SUBSCRIPTION_NOT_ACTIVE" });
    render(<BillingActions subscriptionStatus="ACTIVE" />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Confirmer l'annulation" }));

    await waitFor(() => expect(m.error).toHaveBeenCalledWith("Cet abonnement n'est plus actif."));
    expect(m.refresh).not.toHaveBeenCalled();
  });

  describe("plan switch", () => {
    const props = { subscriptionStatus: "ACTIVE", currentCycle: "monthly" as const, availableCycles: ["monthly" as const, "yearly" as const] };

    it("offers the other cycle only when it is on sale and the subscription can change", () => {
      const view = render(<BillingActions {...props} />);
      expect(screen.queryByRole("button", { name: "Passer à la formule annuelle" })).not.toBeNull();
      view.unmount();

      const onlyMonthly = render(<BillingActions {...props} availableCycles={["monthly"]} />);
      expect(screen.queryByRole("button", { name: /Passer à la formule/ })).toBeNull();
      onlyMonthly.unmount();

      const unknown = render(<BillingActions {...props} currentCycle="unknown" />);
      expect(screen.queryByRole("button", { name: /Passer à la formule/ })).toBeNull();
      unknown.unmount();

      render(<BillingActions {...props} cancelAtPeriodEnd />);
      expect(screen.queryByRole("button", { name: /Passer à la formule/ })).toBeNull();
    });

    it("switches by cycle keyword once confirmed, never by a raw price id", async () => {
      m.switchPlan.mockResolvedValue({ success: true, message: "ok" });
      render(<BillingActions {...props} />);
      fireEvent.click(screen.getByRole("button", { name: "Passer à la formule annuelle" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmer le changement" }));

      await waitFor(() => expect(m.refresh).toHaveBeenCalled());
      expect(m.switchPlan).toHaveBeenCalledWith({ newPriceId: "yearly" });
    });

    it("explains a refusal in French", async () => {
      m.switchPlan.mockResolvedValue({ success: false, message: "x", error: "INVALID_PRICE_ID" });
      render(<BillingActions {...props} />);
      fireEvent.click(screen.getByRole("button", { name: "Passer à la formule annuelle" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmer le changement" }));

      await waitFor(() => expect(m.error).toHaveBeenCalledWith("Cette formule n'est pas disponible."));
    });
  });
});
