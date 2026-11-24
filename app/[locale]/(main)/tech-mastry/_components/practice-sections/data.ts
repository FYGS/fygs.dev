import { careerSections } from "./groups/career";
import { fundamentalsSections } from "./groups/fundamentals";
import { specialtiesSections } from "./groups/specialties";
import type { Section } from "./types";

export const sections: Section[] = [
  ...fundamentalsSections,
  ...careerSections,
  ...specialtiesSections,
];
