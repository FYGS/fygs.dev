/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialProof } from "@/components/marketing/social-proof";

describe("SocialProof", () => {
  it("renders enrollment count", () => {
    render(
      <SocialProof
        enrollmentCount={150}
        averageRating={4.5}
        reviewCount={23}
      />,
    );
    expect(screen.getByText("150+")).toBeInTheDocument();
    expect(screen.getByText("étudiants")).toBeInTheDocument();
  });

  it("renders average rating and review count", () => {
    render(
      <SocialProof
        enrollmentCount={100}
        averageRating={4.8}
        reviewCount={10}
      />,
    );
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("(10 avis)")).toBeInTheDocument();
  });

  it("hides rating section when averageRating is 0", () => {
    render(
      <SocialProof enrollmentCount={50} averageRating={0} reviewCount={0} />,
    );
    expect(screen.queryByText("(0 avis)")).not.toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
  });
});
