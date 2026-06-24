/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustBadges } from "@/components/marketing/trust-badges";

describe("TrustBadges", () => {
  it("renders all 6 trust badges", () => {
    render(<TrustBadges />);
    expect(screen.getByText("Paiement sécurisé")).toBeInTheDocument();
    expect(screen.getByText("Garantie 30 jours")).toBeInTheDocument();
    expect(screen.getByText("Certificat inclus")).toBeInTheDocument();
    expect(screen.getByText("Accès à vie")).toBeInTheDocument();
    expect(screen.getByText("Communauté")).toBeInTheDocument();
    expect(screen.getByText("Support réactif")).toBeInTheDocument();
  });

  it("renders descriptions", () => {
    render(<TrustBadges />);
    expect(screen.getByText("Satisfait ou remboursé")).toBeInTheDocument();
    expect(screen.getByText("Stripe & SSL")).toBeInTheDocument();
  });
});
