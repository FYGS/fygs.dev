import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import { SkipLink, MAIN_CONTENT_ID } from "@/components/a11y/skip-link";
import { FieldError, fieldErrorProps } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

let mockLocale = "en";
vi.mock("next-intlayer", () => ({
  useLocale: () => ({ locale: mockLocale }),
}));

// Imported after the mock so the component picks up the mocked hook.
import { PasswordToggle } from "@/components/ui/password-toggle";

describe("SkipLink", () => {
  it("is a link to the main landmark with a localized name", () => {
    const { rerender } = render(<SkipLink locale="en" />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("href", `#${MAIN_CONTENT_ID}`);

    rerender(<SkipLink locale="fr" />);
    expect(screen.getByRole("link", { name: "Aller au contenu principal" })).toBeInTheDocument();

    rerender(<SkipLink locale="es" />);
    expect(screen.getByRole("link", { name: "Saltar al contenido principal" })).toBeInTheDocument();
  });

  it("falls back to French for an unknown or missing locale", () => {
    const { rerender } = render(<SkipLink locale="de" />);
    expect(screen.getByRole("link", { name: "Aller au contenu principal" })).toBeInTheDocument();
    rerender(<SkipLink />);
    expect(screen.getByRole("link", { name: "Aller au contenu principal" })).toBeInTheDocument();
  });

  it("is hidden visually until it receives focus", () => {
    render(<SkipLink locale="en" />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });
});

describe("FieldError / fieldErrorProps", () => {
  function Field({ error }: { error?: string }) {
    return (
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...fieldErrorProps("email", error)} />
        <FieldError id="email" message={error} />
      </div>
    );
  }

  it("renders nothing and leaves the field valid without an error", () => {
    render(<Field />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("associates the error with the field and announces it", () => {
    render(<Field error="Invalid email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Invalid email");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
    expect(input).toHaveAccessibleDescription("Invalid email");
  });
});

describe("PasswordToggle", () => {
  function Harness() {
    const [visible, setVisible] = useState(false);
    return <PasswordToggle visible={visible} onToggle={() => setVisible((v) => !v)} />;
  }

  it("has an accessible name that follows the state", () => {
    mockLocale = "en";
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  it("is localized", () => {
    mockLocale = "fr";
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Afficher le mot de passe" })).toBeInTheDocument();
  });
});
