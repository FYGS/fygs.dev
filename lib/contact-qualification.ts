import { z } from "zod";

/**
 * What the contact form asks beyond name, e-mail and message, so that a mission request arrives qualified.
 * Shared by the form and POST /api/contact, so both accept exactly the same values.
 * Spec: docs/specs/homepage-redesign.md §6.
 */
export const CONTACT_TYPES = ["project", "recruitment", "collaboration", "training", "general"] as const;
export const CONTACT_TIMELINES = ["asap", "one-to-three-months", "later", "exploring"] as const;
export const CONTACT_FRAMINGS = ["written-spec", "partial", "none"] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];
export type ContactTimeline = (typeof CONTACT_TIMELINES)[number];
export type ContactFraming = (typeof CONTACT_FRAMINGS)[number];

/** All optional: a submission without them stays valid. */
export const qualificationSchema = z.object({
  type: z.enum(CONTACT_TYPES).optional(),
  timeline: z.enum(CONTACT_TIMELINES).optional(),
  framing: z.enum(CONTACT_FRAMINGS).optional(),
});

export type ContactQualification = z.infer<typeof qualificationSchema>;
