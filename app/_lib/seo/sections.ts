import type { SectionSEOConfig } from "./common";
import { mainSections } from "./sections-main";
import { siteSections } from "./sections-site";
import { techMasterySections } from "./sections-tech-mastry";

// ─── Section Configs ────────────────────────────────────────────────────────
// Key order is part of the contract: main -> tech mastery -> site.
export const sectionSEO = {
  ...mainSections,
  ...techMasterySections,
  ...siteSections,
} as const satisfies Record<string, SectionSEOConfig>;
