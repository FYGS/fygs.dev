/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CertificateReveal } from "@/components/learning/certificate-reveal";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

describe("CertificateReveal", () => {
  const defaultProps = {
    certificateId: "cert-123",
    courseTitle: "React Mastery",
    userName: "John Doe",
    issuedAt: "2024-06-15T10:00:00Z",
  };

  it("shows pre-reveal state with congratulation", () => {
    render(<CertificateReveal {...defaultProps} />);

    expect(screen.getByText("Félicitations !")).toBeTruthy();
    expect(screen.getByText("Révéler mon certificat")).toBeTruthy();
  });

  it("reveals certificate on button click", () => {
    render(<CertificateReveal {...defaultProps} />);

    fireEvent.click(screen.getByText("Révéler mon certificat"));

    expect(screen.getByText("Certificat de réussite")).toBeTruthy();
    expect(screen.getByText("React Mastery")).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("ID: cert-123")).toBeTruthy();
  });

  it("shows download and share buttons after reveal", () => {
    render(<CertificateReveal {...defaultProps} />);

    fireEvent.click(screen.getByText("Révéler mon certificat"));

    expect(screen.getByText("Télécharger")).toBeTruthy();
    expect(screen.getByText("Partager")).toBeTruthy();
  });

  it("shows share menu with social options", () => {
    render(<CertificateReveal {...defaultProps} />);

    fireEvent.click(screen.getByText("Révéler mon certificat"));
    fireEvent.click(screen.getByText("Partager"));

    expect(screen.getByText("LinkedIn")).toBeTruthy();
    expect(screen.getByText("Twitter / X")).toBeTruthy();
    expect(screen.getByText("Copier le lien")).toBeTruthy();
  });
});
