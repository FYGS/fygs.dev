import { describe, it, expect } from "vitest";
import {
  createVoteSchema,
  createReportSchema,
  moderationActionSchema,
  bulkModerationSchema,
  exportFiltersSchema,
  reviewFiltersSchema,
} from "@/lib/validators/review-validators";

const cuid = "cjld2cjxh0000qzrmn831i7rn";

const firstMessage = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.success ? null : r.error!.issues[0].message;

describe("review validators", () => {
  it("accepts a valid vote", () => {
    expect(createVoteSchema.safeParse({ reviewId: cuid, helpful: true }).success).toBe(true);
  });

  it("keeps the French messages for a missing or mistyped value", () => {
    expect(firstMessage(createVoteSchema.safeParse({ reviewId: cuid }))).toBe("Le type de vote est requis");
    expect(firstMessage(createVoteSchema.safeParse({ reviewId: cuid, helpful: "yes" }))).toBe(
      "Le type de vote doit être un booléen",
    );
    expect(firstMessage(createVoteSchema.safeParse({ reviewId: "nope", helpful: true }))).toBe("ID d'avis invalide");
  });

  it("validates report reasons and moderation actions", () => {
    expect(firstMessage(createReportSchema.safeParse({ reviewId: cuid }))).toBe("La raison du signalement est requise");
    expect(firstMessage(createReportSchema.safeParse({ reviewId: cuid, reason: "nonsense" }))).toBe(
      "Raison de signalement invalide",
    );
    expect(moderationActionSchema.safeParse({ reviewId: cuid, action: "approve" }).success).toBe(true);
    expect(firstMessage(moderationActionSchema.safeParse({ reviewId: cuid, action: "explode" }))).toBe("Action invalide");
    expect(firstMessage(moderationActionSchema.safeParse({ reviewId: cuid }))).toBe("L'action est requise");
  });

  it("bounds bulk moderation", () => {
    expect(bulkModerationSchema.safeParse({ reviewIds: [], action: "approve" }).success).toBe(false);
    expect(bulkModerationSchema.safeParse({ reviewIds: Array(101).fill(cuid), action: "approve" }).success).toBe(false);
    expect(bulkModerationSchema.safeParse({ reviewIds: [cuid], action: "delete" }).success).toBe(true);
  });

  it("requires an export format", () => {
    expect(firstMessage(exportFiltersSchema.safeParse({}))).toBe("Le format d'export est requis");
    expect(exportFiltersSchema.safeParse({ format: "csv", fields: ["rating"] }).success).toBe(true);
  });

  it("applies filter defaults", () => {
    const parsed = reviewFiltersSchema.safeParse({});
    expect(parsed.success).toBe(true);
  });
});
