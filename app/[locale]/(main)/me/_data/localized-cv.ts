import type { TimelineItemProps } from "@/app/_components/Timeline";
import { EDUCATION_ITEMS, EXPERIENCE_ITEMS, SKILLS } from "../data";
import type { CvData } from "./cv-types";

// Build localized experience items
export function buildLocalizedExperiences(cvData: CvData, locale: string) {
  const expEntries = [
    cvData.experiences.allianz,
    cvData.experiences.ouestech,
    cvData.experiences.geHealthcare1,
    cvData.experiences.geHealthcare2,
    cvData.experiences.schneider,
    cvData.experiences.atlanSpace,
  ];
  // Localized "Present" label based on locale
  const presentLabel =
    {
      en: "Present",
      fr: "Présent",
      es: "Presente",
    }[locale as "en" | "fr" | "es"] || "Present";

  const contractTypeMap: Record<string, string> = {
    "Full-time": cvData.contractTypes.fullTime as unknown as string,
    Entrepreneurship: cvData.contractTypes
      .entrepreneurship as unknown as string,
    Internship: cvData.contractTypes.internship as unknown as string,
  };

  const localizedExperiences = EXPERIENCE_ITEMS.map((item, i) => {
    const exp = expEntries[i];
    const translatedType =
      (contractTypeMap[item.type || ""] as string) || (item.type as string);

    // Use descriptions from EXPERIENCE_ITEMS which are already well-structured
    // Only translate title, type, and context from cvData
    return {
      ...item,
      title: exp.title as unknown as string,
      type: translatedType,
      context: exp.context as unknown as string,
      date: item.current
        ? item.date.replace("Present", presentLabel)
        : item.date,
    } as TimelineItemProps;
  });

  return localizedExperiences;
}

// Build localized education items
export function buildLocalizedEducation(cvData: CvData) {
  const eduEntries = [
    cvData.education.sorbonne,
    cvData.education.upmc,
    cvData.education.ensa,
    cvData.education.lycee,
  ];
  const localizedEducation = EDUCATION_ITEMS.map((item, i) => {
    const edu = eduEntries[i];
    // Use descriptions/achievements from EDUCATION_ITEMS (already well-structured)
    // Only translate the title from cvData
    return {
      ...item,
      title: edu.title as unknown as string,
    } as TimelineItemProps;
  });

  return localizedEducation;
}

// Build localized technical skills
export function buildLocalizedTechnicalSkills(cvData: CvData) {
  const categoryMap: Record<string, unknown> = {
    "Backend Development": cvData.skillCategories.backend,
    "Frontend Development": cvData.skillCategories.frontend,
    "Cloud & DevOps": cvData.skillCategories.cloud,
    "Databases & Storage": cvData.skillCategories.databases,
  };
  const localizedTechnicalSkills = SKILLS.technical.map(
    ({ category, skills }) => ({
      category: (categoryMap[category] ?? category) as unknown as string,
      skills,
    }),
  );

  return localizedTechnicalSkills;
}

// Build localized languages
export function buildLocalizedLanguages(cvData: CvData) {
  const localizedLanguages = [
    {
      language: cvData.spokenLanguages.french.name,
      level: cvData.spokenLanguages.french.level,
    },
    {
      language: cvData.spokenLanguages.english.name,
      level: cvData.spokenLanguages.english.level,
    },
  ];

  return localizedLanguages;
}

// Build localized soft skills
export function buildLocalizedSoftSkills(cvData: CvData) {
  const localizedSoftSkills = [
    cvData.softSkills.leadership,
    cvData.softSkills.problemSolving,
    cvData.softSkills.teamwork,
    cvData.softSkills.agile,
    cvData.softSkills.projectManagement,
    cvData.softSkills.clientComm,
  ];

  return localizedSoftSkills;
}
