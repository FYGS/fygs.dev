import { describe, expect, it } from "vitest";
import {
  CONTACT_FRAMINGS,
  CONTACT_TIMELINES,
  CONTACT_TYPES,
  qualificationSchema,
} from "../../lib/contact-qualification";

// Spec: docs/specs/homepage-redesign.md §6 — three qualification fields filter missions without a framing.

describe("contact qualification", () => {
  it("keeps the existing contact types and adds the project one", () => {
    expect(CONTACT_TYPES).toEqual(["project", "recruitment", "collaboration", "training", "general"]);
  });

  it("accepts every timeline and framing", () => {
    for (const timeline of CONTACT_TIMELINES) {
      for (const framing of CONTACT_FRAMINGS) {
        expect(qualificationSchema.safeParse({ type: "project", timeline, framing }).success).toBe(true);
      }
    }
  });

  it("keeps the qualification optional, so older submissions stay valid", () => {
    expect(qualificationSchema.safeParse({}).success).toBe(true);
    expect(qualificationSchema.safeParse({ type: "general" }).success).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(qualificationSchema.safeParse({ timeline: "yesterday" }).success).toBe(false);
    expect(qualificationSchema.safeParse({ framing: "maybe" }).success).toBe(false);
    expect(qualificationSchema.safeParse({ type: "spam" }).success).toBe(false);
  });
});

describe("admin e-mail", () => {
  const base = { name: "Test User", email: "test@example.com", subject: "Un SaaS sur mesure", message: "Un besoin décrit." };

  it("shows the timeline and the framing when the visitor gave them", async () => {
    const { ContactEmailTemplates } = await import("../../lib/emails/service/contact-templates");
    const { html } = new ContactEmailTemplates().contactFormAdminEmail({
      ...base,
      type: "project",
      timeline: "one-to-three-months",
      framing: "none",
    });
    expect(html).toContain("Dans 1 à 3 mois");
    expect(html).toContain("Pas de cadrage");
    expect(html).toContain("Demande de Projet");
  });

  it("shows no qualification row without them", async () => {
    const { ContactEmailTemplates } = await import("../../lib/emails/service/contact-templates");
    const { html } = new ContactEmailTemplates().contactFormAdminEmail(base);
    expect(html).not.toContain("Délai");
    expect(html).not.toContain("Cadrage");
  });
});
